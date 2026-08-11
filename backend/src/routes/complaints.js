import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler, ok } from "../middleware/error.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { activeWhere, archiveById, restoreById } from "../lib/archive.js";
import { isWhatsAppReady } from "../lib/whatsapp/client.js";
import { sendOfficerReply } from "../lib/whatsapp/bot.js";
import { resolveObjectUrl } from "../lib/s3.js";

const router = Router();

/** Simple IP rate limit for public complaint submissions */
const submitHits = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 8;

function assertRateLimit(ip) {
  const key = ip || "unknown";
  const now = Date.now();
  const hits = (submitHits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length === 0) {
    submitHits.delete(key);
  } else {
    submitHits.set(key, hits);
  }
  if (hits.length >= RATE_MAX) {
    throw new AppError(429, "RATE_LIMITED", "Too many complaints. Try again shortly.");
  }
  hits.push(now);
  submitHits.set(key, hits);

  for (const [otherKey, otherHits] of submitHits) {
    if (otherKey === key) continue;
    const live = otherHits.filter((t) => now - t < RATE_WINDOW_MS);
    if (live.length === 0) submitHits.delete(otherKey);
    else if (live.length !== otherHits.length) submitHits.set(otherKey, live);
  }
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10, "Phone must be 10 digits"),
  village: z.string().trim().min(1).max(120),
  gramPanchayat: z.string().trim().min(1).max(120),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(1).max(4000),
});

async function withPhotoUrls(row) {
  if (!row) return row;
  const photos = Array.isArray(row.photos) ? row.photos : [];
  const resolved = await Promise.all(
    photos.map(async (p) => ({
      ...p,
      url: await resolveObjectUrl(p.url, p.s3Key),
    }))
  );
  return { ...row, photos: resolved };
}

router.post(
  "/",
  asyncHandler(async (req, res) => {
    assertRateLimit(req.ip || req.headers["x-forwarded-for"]);
    const body = createSchema.parse(req.body);
    const row = await prisma.complaint.create({
      data: {
        name: body.name,
        phone: body.phone,
        village: body.village,
        gramPanchayat: body.gramPanchayat,
        subject: body.subject || "",
        message: body.message,
        status: "new",
        source: "web",
        photos: [],
      },
    });
    return ok(res, row, null, 201);
  })
);

router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const where = activeWhere();
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.village) where.village = String(req.query.village);
    if (req.query.source) where.source = String(req.query.source);
    const q = String(req.query.q || "").trim();
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { subject: { contains: q, mode: "insensitive" } },
        { message: { contains: q, mode: "insensitive" } },
        { village: { contains: q, mode: "insensitive" } },
        { gramPanchayat: { contains: q, mode: "insensitive" } },
      ];
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const [total, rows] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const data = await Promise.all(rows.map(withPhotoUrls));
    return ok(res, data, { total, page, limit });
  })
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        status: z.enum(["new", "read", "closed"]).optional(),
        replyText: z.string().trim().min(1).max(2000).optional(),
        sendWhatsApp: z.boolean().optional().default(true),
      })
      .parse(req.body);

    if (!body.status && !body.replyText) {
      throw new AppError(400, "INVALID", "Provide status and/or replyText");
    }

    const existing = await prisma.complaint.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.archivedAt) {
      throw new AppError(404, "NOT_FOUND", "Complaint not found");
    }

    const data = {};
    if (body.status) data.status = body.status;

    if (body.replyText) {
      data.replyText = body.replyText;
      data.repliedAt = new Date();
      data.repliedById = req.user?.id || null;
      if (!body.status) data.status = "closed";
    }

    const row = await prisma.complaint.update({
      where: { id: req.params.id },
      data,
    });

    let waResult = null;
    let waError = null;
    if (
      body.replyText &&
      body.sendWhatsApp !== false &&
      existing.source === "whatsapp" &&
      isWhatsAppReady()
    ) {
      try {
        waResult = await sendOfficerReply(row, body.replyText);
      } catch (err) {
        console.error("Officer WhatsApp reply failed", err);
        waError = err.message || "Failed to send WhatsApp reply";
      }
    }

    const out = await withPhotoUrls(row);
    return ok(res, { ...out, waResult, waError });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const existing = await prisma.complaint.findFirst({
      where: activeWhere({ id: req.params.id }),
    });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Complaint not found");
    const row = await archiveById(prisma.complaint, req.params.id);
    return ok(res, { archived: true, id: row.id, archivedAt: row.archivedAt });
  })
);

router.post(
  "/:id/restore",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const row = await restoreById(prisma.complaint, req.params.id);
      return ok(res, row);
    } catch {
      throw new AppError(404, "NOT_FOUND", "Complaint not found");
    }
  })
);

export default router;
