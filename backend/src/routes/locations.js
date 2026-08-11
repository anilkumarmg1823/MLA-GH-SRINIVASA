import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, ok, AppError } from "../middleware/error.js";

const router = Router();

function mapGp(gp) {
  return {
    name: gp.name,
    nameKn: gp.nameKn || gp.name,
    villageCount: gp._count?.villages ?? gp.villages?.length ?? 0,
  };
}

function mapVillage(v) {
  return {
    name: v.name,
    nameKn: v.nameKn || v.name,
  };
}

/** Public — full tree (GPs + nested villages) for filters / forms */
router.get(
  "/tree",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.gramPanchayat.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        villages: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { name: true, nameKn: true },
        },
      },
    });
    return ok(
      res,
      rows.map((gp) => ({
        name: gp.name,
        nameKn: gp.nameKn || gp.name,
        villages: gp.villages.map(mapVillage),
      }))
    );
  })
);

/** Public — GP list (with village counts) */
router.get(
  "/gram-panchayats",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.gramPanchayat.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { villages: true } } },
    });
    return ok(res, rows.map(mapGp));
  })
);

/** Public — villages for one GP (by English `name` key) */
router.get(
  "/gram-panchayats/:gpName/villages",
  asyncHandler(async (req, res) => {
    const gpName = decodeURIComponent(String(req.params.gpName || "").trim());
    const gp = await prisma.gramPanchayat.findUnique({
      where: { name: gpName },
      include: {
        villages: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { name: true, nameKn: true },
        },
      },
    });
    if (!gp) {
      throw new AppError(404, "NOT_FOUND", "Gram Panchayat not found");
    }
    return ok(res, gp.villages.map(mapVillage));
  })
);

export default router;
