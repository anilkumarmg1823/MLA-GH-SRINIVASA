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

function emptyAllModules() {
  return {
    development: emptyPerms(),
    department_records: emptyPerms(),
    demands: emptyPerms(),
    assembly_qa: emptyPerms(),
  };
}

function toPublicStaff(u) {
  return {
    id: u.id,
    phone: u.phone,
    name: u.name,
    nameKn: u.nameKn,
    role: u.role,
    totpEnabled: Boolean(u.totpEnabled && u.totpSecret),
    modules: u.permissions?.modules || emptyAllModules(),
  };
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      where: {
        role: { not: "admin" },
        phone: { not: null },
        archivedAt: null,
      },
      include: { permissions: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, users.map(toPublicStaff));
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

    const wasArchived = Boolean(existing?.archivedAt);
    const totpReused = Boolean(
      existing?.totpEnabled && existing?.totpSecret
    );

    let user;
    if (existing) {
      // Revive soft-removed staff with same phone — keep TOTP secret
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: body.name,
          nameKn: body.nameKn || "",
          role: body.role || existing.role,
          archivedAt: null,
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
        ...toPublicStaff(user),
        totpReused,
        revived: wasArchived,
      },
      null,
      existing && !wasArchived ? 200 : 201
    );
  })
);

async function enrollStaffTotp(userId, { forceNew = false } = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "admin" || !user.phone || user.archivedAt) {
    throw new AppError(404, "NOT_FOUND", "Staff not found");
  }

  // One TOTP per phone — do not mint a second secret (confuses Authenticator apps)
  if (!forceNew && user.totpEnabled && user.totpSecret && !user.totpPendingScan) {
    return {
      phone: user.phone,
      name: user.name,
      totpEnabled: true,
      alreadyEnrolled: true,
      totpReused: true,
    };
  }

  // Pending scan with existing secret — re-show the same QR (admin or copy for staff)
  if (!forceNew && user.totpSecret && user.totpPendingScan) {
    const otpauthUrl = buildOtpauthUrl(user.phone, user.totpSecret);
    const qrDataUrl = await otpauthToQrDataUrl(otpauthUrl);
    return {
      phone: user.phone,
      name: user.name,
      secret: user.totpSecret,
      otpauthUrl,
      qrDataUrl,
      totpEnabled: true,
      alreadyEnrolled: false,
      pendingScan: true,
    };
  }

  const secret = generateTotpSecret();
  const otpauthUrl = buildOtpauthUrl(user.phone, secret);
  const qrDataUrl = await otpauthToQrDataUrl(otpauthUrl);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      totpSecret: secret,
      totpEnabled: true,
      totpPendingScan: true,
      archivedAt: null,
    },
  });

  return {
    phone: user.phone,
    name: user.name,
    secret,
    otpauthUrl,
    qrDataUrl,
    totpEnabled: true,
    alreadyEnrolled: false,
    pendingScan: true,
  };
}

/** Generate Authenticator secret only if phone has none; returns QR once. */
router.post(
  "/:id/totp/enroll",
  asyncHandler(async (req, res) => {
    const data = await enrollStaffTotp(req.params.id, { forceNew: false });
    return ok(res, data);
  })
);

/** Clear TOTP then issue a fresh secret + QR (staff must delete old Authenticator entry). */
router.post(
  "/:id/totp/reset",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user || user.role === "admin" || !user.phone || user.archivedAt) {
      throw new AppError(404, "NOT_FOUND", "Staff not found");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpSecret: null,
        totpEnabled: false,
        totpPendingScan: true,
      },
    });
    const data = await enrollStaffTotp(user.id, { forceNew: true });
    return ok(res, { ...data, reset: true });
  })
);

/** Soft-remove: hide from Access, block login, keep phone + TOTP for reuse. */
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { permissions: true },
    });
    if (!user || user.role === "admin") {
      throw new AppError(404, "NOT_FOUND", "Staff not found");
    }
    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        archivedAt: new Date(),
        permissions: {
          upsert: {
            create: { modules: emptyAllModules() },
            update: { modules: emptyAllModules() },
          },
        },
      },
    });
    return ok(res, {
      deleted: true,
      soft: true,
      totpKept: Boolean(user.totpSecret),
      phone: user.phone,
    });
  })
);

export default router;
