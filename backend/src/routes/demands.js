import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  demandUpdateSchema,
  normalizeDemandBody,
} from "../lib/demandSchema.js";
import { AppError, asyncHandler, ok } from "../middleware/error.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { activeWhere, archiveById, restoreById } from "../lib/archive.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  requirePermission("demands", "view"),
  asyncHandler(async (req, res) => {
    const where = activeWhere();
    if (req.query.gramPanchayat) where.gramPanchayat = String(req.query.gramPanchayat);
    if (req.query.village) where.village = String(req.query.village);
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.approach) where.approach = String(req.query.approach);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 50));
    const [total, rows] = await Promise.all([
      prisma.demand.count({ where }),
      prisma.demand.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return ok(res, rows, { total, page, limit });
  })
);

router.post(
  "/",
  requirePermission("demands", "add"),
  asyncHandler(async (req, res) => {
    const data = normalizeDemandBody(req.body);
    const row = await prisma.demand.create({ data });
    return ok(res, row, null, 201);
  })
);

router.put(
  "/:id",
  requirePermission("demands", "edit"),
  asyncHandler(async (req, res) => {
    const body = demandUpdateSchema.parse(req.body);
    if (Object.keys(body).length === 0) {
      throw new AppError(400, "VALIDATION_ERROR", "No fields to update");
    }
    try {
      const row = await prisma.demand.update({
        where: { id: req.params.id },
        data: body,
      });
      return ok(res, row);
    } catch (err) {
      if (err?.code === "P2025") {
        throw new AppError(404, "NOT_FOUND", "Demand not found");
      }
      throw err;
    }
  })
);

router.delete(
  "/:id",
  requirePermission("demands", "delete"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.demand.findFirst({
      where: activeWhere({ id: req.params.id }),
    });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Demand not found");
    const row = await archiveById(prisma.demand, req.params.id);
    return ok(res, { archived: true, id: row.id, archivedAt: row.archivedAt });
  })
);

router.post(
  "/:id/restore",
  requirePermission("demands", "edit"),
  asyncHandler(async (req, res) => {
    try {
      const row = await restoreById(prisma.demand, req.params.id);
      return ok(res, row);
    } catch {
      throw new AppError(404, "NOT_FOUND", "Demand not found");
    }
  })
);

export default router;
