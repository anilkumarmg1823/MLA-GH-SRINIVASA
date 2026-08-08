import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler, ok } from "../middleware/error.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  buildOtpauthUrl,
  generateTotpSecret,
  otpauthToQrDataUrl,
} from "../lib/totp.js";

const router = Router();
router.use(requireAuth, requireAdmin);

const modulePerm = z.object({
  view: z.boolean(),
  add: z.boolean(),
  edit: z.boolean(),
  delete: z.boolean(),
  download: z.boolean(),
});

const modulesSchema = z.object({
  development: modulePerm,
  department_records: modulePerm,
  demands: modulePerm,
  assembly_qa: modulePerm,
});

function emptyPerms() {
  return { view: false, add: false, edit: false, delete: false, download: false };
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      where: { role: { not: "admin" }, phone: { not: null } },
      include: { permissions: true },
      orderBy: { createdAt: "desc" },
    });
    const data = users.map((u) => ({
      id: u.id,
      phone: u.phone,
      name: u.name,
      nameKn: u.nameKn,
      role: u.role,
      totpEnabled: Boolean(u.totpEnabled),
      modules: u.permissions?.modules || {
        development: emptyPerms(),
        department_records: emptyPerms(),
        demands: emptyPerms(),
        assembly_qa: emptyPerms(),
      },
    }));
    return ok(res, data);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        phone: z.string().regex(/^\d{10}$/),
        name: z.string().min(1),
        nameKn: z.string().optional(),
        role: z
          .enum([
            "development",
            "department_records",
            "demands",
            "assembly_qa",
            "staff",
          ])
          .optional(),
        modules: modulesSchema,
      })
      .parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { phone: body.phone },
      include: { permissions: true },
    });

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: body.name,
          nameKn: body.nameKn || "",
          role: body.role || existing.role,
          permissions: {
            upsert: {
              create: { modules: body.modules },
              update: { modules: body.modules },
            },
          },
        },
        include: { permissions: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          phone: body.phone,
          name: body.name,
          nameKn: body.nameKn || "",
          role: body.role || "staff",
          permissions: { create: { modules: body.modules } },
        },
        include: { permissions: true },
      });
    }

    return ok(
      res,
      {
        id: user.id,
        phone: user.phone,
        name: user.name,
        nameKn: user.nameKn,
        role: user.role,
        totpEnabled: Boolean(user.totpEnabled),
        modules: user.permissions.modules,
      },
      null,
      existing ? 200 : 201
    );
  })
);

async function enrollStaffTotp(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "admin" || !user.phone) {
    throw new AppError(404, "NOT_FOUND", "Staff not found");
  }

  const secret = generateTotpSecret();
  const otpauthUrl = buildOtpauthUrl(user.phone, secret);
  const qrDataUrl = await otpauthToQrDataUrl(otpauthUrl);

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: secret, totpEnabled: true },
  });

  return {
    phone: user.phone,
    name: user.name,
    secret,
    otpauthUrl,
    qrDataUrl,
    totpEnabled: true,
  };
}

/** Generate / rotate Authenticator secret; returns QR once. */
router.post(
  "/:id/totp/enroll",
  asyncHandler(async (req, res) => {
    const data = await enrollStaffTotp(req.params.id);
    return ok(res, data);
  })
);

/** Clear TOTP then issue a fresh secret + QR. */
router.post(
  "/:id/totp/reset",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user || user.role === "admin" || !user.phone) {
      throw new AppError(404, "NOT_FOUND", "Staff not found");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: null, totpEnabled: false },
    });
    const data = await enrollStaffTotp(user.id);
    return ok(res, data);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user || user.role === "admin") {
      throw new AppError(404, "NOT_FOUND", "Staff not found");
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    return ok(res, { deleted: true });
  })
);

export default router;
