import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uploadBuffer, deleteS3Object, withResolvedUrl } from "../lib/s3.js";

async function mapDevelopment(row, { resolveMedia = true } = {}) {
  if (!row) return row;
  const rawMedia = row.media || [];
  // Skip S3 signing when empty or light list — big win for bulk imports with no photos
  const media =
    resolveMedia && rawMedia.length
      ? await Promise.all(rawMedia.map((m) => withResolvedUrl(m)))
      : rawMedia.map((m) => ({ ...m }));
  const images = media.filter((m) => m.type === "image").map((m) => m.url);
  return { ...row, media, images };
}

function listQueryOptions(req) {
  const gp = req.query.gramPanchayat;
  const village = req.query.village;
  const status = req.query.status;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 50));
  // light=1 → no media join (charts/search/overview)
  const light = String(req.query.light || "") === "1";
  const where = activeWhere();
  if (gp) where.gramPanchayat = String(gp);
  if (village) where.village = String(village);
  if (status) where.status = String(status);
  return { where, page, limit, light };
}
import { AppError, asyncHandler, ok } from "../middleware/error.js";
import {
  requireAuth,
  requirePermission,
} from "../middleware/auth.js";
import { uploadDevMedia, handleMulterError } from "../middleware/upload.js";
import { activeWhere, archiveById, restoreById } from "../lib/archive.js";

const router = Router();

/** Public list for the landing map (no auth) */
router.get(
  "/public",
  asyncHandler(async (req, res) => {
    const { where, page, limit, light } = listQueryOptions(req);
    const [total, rows] = await Promise.all([
      prisma.development.count({ where }),
      prisma.development.findMany({
        where,
        ...(light ? {} : { include: { media: true } }),
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const data = await Promise.all(
      rows.map((r) => mapDevelopment(r, { resolveMedia: !light }))
    );
    return ok(res, data, { total, page, limit });
  })
);

router.use(requireAuth);

router.get(
  "/",
  requirePermission("development", "view"),
  asyncHandler(async (req, res) => {
    const { where, page, limit, light } = listQueryOptions(req);
    const [total, rows] = await Promise.all([
      prisma.development.count({ where }),
      prisma.development.findMany({
        where,
        ...(light ? {} : { include: { media: true } }),
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const data = await Promise.all(
      rows.map((r) => mapDevelopment(r, { resolveMedia: !light }))
    );
    return ok(res, data, { total, page, limit });
  })
);

router.get(
  "/:id",
  requirePermission("development", "view"),
  asyncHandler(async (req, res) => {
    const row = await prisma.development.findUnique({
      where: { id: req.params.id },
      include: { media: true },
    });
    if (!row) throw new AppError(404, "NOT_FOUND", "Not found");
    return ok(res, await mapDevelopment(row));
  })
);

const upsertSchema = z.object({
  gramPanchayat: z.string().min(1),
  village: z.string().min(1),
  name: z.string().min(1),
  nameKn: z.string().optional(),
  description: z.string().optional(),
  descriptionKn: z.string().optional(),
  details: z.string().optional(),
  detailsKn: z.string().optional(),
  amountSanctioned: z.coerce.number().optional(),
  status: z.string().optional(),
  statusKn: z.string().optional(),
  beneficiaries: z.string().optional(),
  beneficiariesKn: z.string().optional(),
  department: z.string().optional(),
  departmentKn: z.string().optional(),
  startDate: z.string().nullable().optional(),
  locationNote: z.string().optional(),
  locationNoteKn: z.string().optional(),
  yojane: z.string().optional(),
  yojaneKn: z.string().optional(),
});

router.post(
  "/",
  requirePermission("development", "add"),
  asyncHandler(async (req, res) => {
    const body = upsertSchema.parse(req.body);
    const row = await prisma.development.create({
      data: {
        ...body,
        nameKn: body.nameKn || "",
        description: body.description || "",
        descriptionKn: body.descriptionKn || "",
        details: body.details || "",
        detailsKn: body.detailsKn || "",
        amountSanctioned: body.amountSanctioned || 0,
        status: body.status || "Ongoing",
        statusKn: body.statusKn || "",
      },
      include: { media: true },
    });
    return ok(res, await mapDevelopment(row), null, 201);
  })
);

router.put(
  "/:id",
  requirePermission("development", "edit"),
  asyncHandler(async (req, res) => {
    const body = upsertSchema.partial().parse(req.body);
    const row = await prisma.development.update({
      where: { id: req.params.id },
      data: body,
      include: { media: true },
    });
    return ok(res, await mapDevelopment(row));
  })
);

router.delete(
  "/:id",
  requirePermission("development", "delete"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.development.findFirst({
      where: activeWhere({ id: req.params.id }),
    });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Not found");
    const row = await archiveById(prisma.development, req.params.id);
    return ok(res, { archived: true, id: row.id, archivedAt: row.archivedAt });
  })
);

router.post(
  "/:id/restore",
  requirePermission("development", "edit"),
  asyncHandler(async (req, res) => {
    try {
      const row = await restoreById(prisma.development, req.params.id);
      return ok(res, await mapDevelopment(
        await prisma.development.findUnique({
          where: { id: row.id },
          include: { media: true },
        })
      ));
    } catch {
      throw new AppError(404, "NOT_FOUND", "Not found");
    }
  })
);

router.post(
  "/:id/media",
  requirePermission("development", "edit"),
  uploadDevMedia.array("files", 10),
  handleMulterError,
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    if (!files.length) throw new AppError(400, "NO_FILE", "No files");
    const created = [];
    for (const file of files) {
      const up = await uploadBuffer({
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
        moduleName: "developments",
      });
      const type = file.mimetype.startsWith("video/") ? "video" : "image";
      const media = await prisma.developmentMedia.create({
        data: {
          developmentId: req.params.id,
          url: up.url,
          s3Key: up.s3Key,
          mimeType: up.mimeType,
          type,
        },
      });
      created.push(await withResolvedUrl(media));
    }
    return ok(res, created, null, 201);
  })
);

export default router;
