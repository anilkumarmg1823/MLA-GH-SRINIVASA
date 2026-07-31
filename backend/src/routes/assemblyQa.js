import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uploadBuffer, deleteS3Object, withResolvedUrl } from "../lib/s3.js";

async function mapQa(row) {
  if (!row) return row;
  const files = await Promise.all(
    (row.files || []).map(async (f) => {
      const resolved = await withResolvedUrl(f);
      return { ...resolved, dataUrl: resolved.url };
    })
  );
  return { ...row, files };
}
import { AppError, asyncHandler, ok } from "../middleware/error.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { uploadDoc, handleMulterError } from "../middleware/upload.js";
import { activeWhere, archiveById, restoreById } from "../lib/archive.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  requirePermission("assembly_qa", "view"),
  asyncHandler(async (req, res) => {
    const where = activeWhere();
    if (req.query.askedBy) where.askedBy = String(req.query.askedBy);
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.q) {
      const q = String(req.query.q);
      where.OR = [
        { question: { contains: q, mode: "insensitive" } },
        { questionKn: { contains: q, mode: "insensitive" } },
        { answer: { contains: q, mode: "insensitive" } },
        { askedByName: { contains: q, mode: "insensitive" } },
        { partyName: { contains: q, mode: "insensitive" } },
      ];
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const [total, rows] = await Promise.all([
      prisma.assemblyQa.count({ where }),
      prisma.assemblyQa.findMany({
        where,
        include: { files: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const data = await Promise.all(rows.map(mapQa));
    return ok(res, data, { total, page, limit });
  })
);

router.get(
  "/:id",
  requirePermission("assembly_qa", "view"),
  asyncHandler(async (req, res) => {
    const row = await prisma.assemblyQa.findUnique({
      where: { id: req.params.id },
      include: { files: true },
    });
    if (!row) throw new AppError(404, "NOT_FOUND", "Not found");
    return ok(res, await mapQa(row));
  })
);

const schema = z.object({
  questionNo: z.string().optional(),
  sessionLabel: z.string().optional(),
  sessionDate: z.string().nullable().optional(),
  askedBy: z.enum(["mla", "other"]),
  askedByName: z.string().optional(),
  partyName: z.string().optional(),
  question: z.string().min(1),
  questionKn: z.string().optional(),
  answer: z.string().optional(),
  answerKn: z.string().optional(),
  status: z.enum(["pending", "answered"]).optional(),
});

router.post(
  "/",
  requirePermission("assembly_qa", "add"),
  asyncHandler(async (req, res) => {
    const body = schema.parse(req.body);
    const row = await prisma.assemblyQa.create({
      data: {
        ...body,
        questionNo: body.questionNo || "",
        sessionLabel: body.sessionLabel || "",
        askedByName: body.askedByName || "",
        partyName: body.partyName || "",
        questionKn: body.questionKn || "",
        answer: body.answer || "",
        answerKn: body.answerKn || "",
        status: body.status || (body.answer ? "answered" : "pending"),
        uploadedBy: req.user.name || "",
      },
      include: { files: true },
    });
    return ok(res, await mapQa(row), null, 201);
  })
);

router.put(
  "/:id",
  requirePermission("assembly_qa", "edit"),
  asyncHandler(async (req, res) => {
    const body = schema.partial().parse(req.body);
    const row = await prisma.assemblyQa.update({
      where: { id: req.params.id },
      data: body,
      include: { files: true },
    });
    return ok(res, await mapQa(row));
  })
);

router.delete(
  "/:id",
  requirePermission("assembly_qa", "delete"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.assemblyQa.findFirst({
      where: activeWhere({ id: req.params.id }),
    });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Not found");
    const row = await archiveById(prisma.assemblyQa, req.params.id);
    return ok(res, { archived: true, id: row.id, archivedAt: row.archivedAt });
  })
);

router.post(
  "/:id/restore",
  requirePermission("assembly_qa", "edit"),
  asyncHandler(async (req, res) => {
    try {
      const row = await restoreById(prisma.assemblyQa, req.params.id);
      const full = await prisma.assemblyQa.findUnique({
        where: { id: row.id },
        include: { files: true },
      });
      return ok(res, await mapQa(full));
    } catch {
      throw new AppError(404, "NOT_FOUND", "Not found");
    }
  })
);

router.post(
  "/:id/files",
  requirePermission("assembly_qa", "edit"),
  uploadDoc.array("files", 10),
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
        moduleName: "assembly-qa",
      });
      const row = await prisma.assemblyQaFile.create({
        data: {
          assemblyQaId: req.params.id,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: up.url,
          s3Key: up.s3Key,
        },
      });
      const resolved = await withResolvedUrl(row);
      created.push({ ...resolved, dataUrl: resolved.url });
    }
    return ok(res, created, null, 201);
  })
);

export default router;
