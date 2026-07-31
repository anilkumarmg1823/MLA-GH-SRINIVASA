import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uploadBuffer, deleteS3Object, withResolvedUrl } from "../lib/s3.js";
import { AppError, asyncHandler, ok } from "../middleware/error.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { uploadDoc, handleMulterError } from "../middleware/upload.js";
import { activeWhere, archiveById, restoreById } from "../lib/archive.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  requirePermission("department_records", "view"),
  asyncHandler(async (req, res) => {
    const where = activeWhere();
    if (req.query.root) where.root = String(req.query.root);
    if (req.query.category) where.category = String(req.query.category);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const [total, rows] = await Promise.all([
      prisma.departmentDocument.count({ where }),
      prisma.departmentDocument.findMany({
        where,
        orderBy: { uploadedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const data = await Promise.all(
      rows.map(async (r) => {
        const resolved = await withResolvedUrl(r);
        return { ...resolved, dataUrl: resolved.url };
      })
    );
    return ok(res, data, { total, page, limit });
  })
);

router.post(
  "/",
  requirePermission("department_records", "add"),
  uploadDoc.single("file"),
  handleMulterError,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        root: z.enum(["secretariat", "department", "follow_ups"]),
        category: z.string().min(1),
        title: z.string().min(1),
        titleKn: z.string().optional(),
        status: z.string().optional(),
        eGeneratedId: z.string().optional(),
      })
      .parse(req.body);
    if (!req.file) throw new AppError(400, "NO_FILE", "File required");

    const up = await uploadBuffer({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      moduleName: "department-records",
    });

    const row = await prisma.departmentDocument.create({
      data: {
        root: body.root,
        category: body.category,
        title: body.title,
        titleKn: body.titleKn || "",
        eGeneratedId: body.eGeneratedId || null,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: up.url,
        s3Key: up.s3Key,
        status: body.status || null,
        uploadedBy: req.user.name || "",
      },
    });
    const resolved = await withResolvedUrl(row);
    return ok(res, { ...resolved, dataUrl: resolved.url }, null, 201);
  })
);

router.patch(
  "/:id/status",
  requirePermission("department_records", "edit"),
  asyncHandler(async (req, res) => {
    const body = z.object({ status: z.string().min(1) }).parse(req.body);
    const existing = await prisma.departmentDocument.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Not found");
    const data = { status: body.status };
    if (existing.root === "follow_ups") data.category = body.status;
    const row = await prisma.departmentDocument.update({
      where: { id: req.params.id },
      data,
    });
    const resolved = await withResolvedUrl(row);
    return ok(res, { ...resolved, dataUrl: resolved.url });
  })
);

router.delete(
  "/:id",
  requirePermission("department_records", "delete"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.departmentDocument.findFirst({
      where: activeWhere({ id: req.params.id }),
    });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Not found");
    const row = await archiveById(prisma.departmentDocument, req.params.id);
    return ok(res, { archived: true, id: row.id, archivedAt: row.archivedAt });
  })
);

router.post(
  "/:id/restore",
  requirePermission("department_records", "edit"),
  asyncHandler(async (req, res) => {
    try {
      const row = await restoreById(prisma.departmentDocument, req.params.id);
      const resolved = await withResolvedUrl(row);
      return ok(res, { ...resolved, dataUrl: resolved.url });
    } catch {
      throw new AppError(404, "NOT_FOUND", "Not found");
    }
  })
);

export default router;
