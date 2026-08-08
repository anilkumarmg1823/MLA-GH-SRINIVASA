import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import {
  buildOtpauthUrl,
  generateTotpSecret,
  otpauthToQrDataUrl,
  verifyTotpToken,
} from "../lib/totp.js";
import { AppError, asyncHandler, ok } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function publicUser(user) {
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    phone: user.phone,
    name: user.name,
    nameKn: user.nameKn,
    permissions: user.permissions?.modules || null,
    totpEnabled: Boolean(user.totpEnabled),
  };
}

async function findRegisteredStaff(phone) {
  const user = await prisma.user.findUnique({
    where: { phone },
    include: { permissions: true },
  });
  if (!user || user.role === "admin") return null;
  return user;
}

router.post(
  "/admin/login",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { permissions: true },
    });
    if (!user || user.role !== "admin" || !user.passwordHash) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    const match = await bcrypt.compare(body.password, user.passwordHash);
    if (!match) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    const token = signToken({ sub: user.id, role: user.role });
    return ok(res, { token, user: publicUser(user) });
  })
);

/**
 * Step 1 — registered staff only.
 * Unregistered phone → 404 (no QR).
 * First login → create Authenticator secret + return QR once.
 * Later logins → needsScan false (code only).
 */
router.post(
  "/staff/begin-login",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        phone: z.string().regex(/^\d{10}$/),
      })
      .parse(req.body);

    const user = await findRegisteredStaff(body.phone);
    if (!user) {
      throw new AppError(404, "NOT_FOUND", "Staff phone not registered");
    }

    if (user.totpEnabled && user.totpSecret) {
      return ok(res, {
        phone: user.phone,
        name: user.name,
        totpEnabled: true,
        needsScan: false,
      });
    }

    const secret = generateTotpSecret();
    const otpauthUrl = buildOtpauthUrl(user.phone, secret);
    const qrDataUrl = await otpauthToQrDataUrl(otpauthUrl);

    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: secret, totpEnabled: true },
    });

    return ok(res, {
      phone: user.phone,
      name: user.name,
      totpEnabled: true,
      needsScan: true,
      qrDataUrl,
      secret,
      otpauthUrl,
    });
  })
);

/** Step 2 — phone + Authenticator TOTP (no SMS). Registered staff only. */
router.post(
  "/staff/verify-totp",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        phone: z.string().regex(/^\d{10}$/),
        otp: z.string().min(4).max(8),
        role: z.string().optional(),
      })
      .parse(req.body);

    const user = await findRegisteredStaff(body.phone);
    if (!user) {
      throw new AppError(404, "NOT_FOUND", "Staff phone not registered");
    }
    if (!user.totpEnabled || !user.totpSecret) {
      throw new AppError(
        403,
        "TOTP_NOT_ENROLLED",
        "Scan the QR code first, then enter the authenticator code."
      );
    }
    if (!verifyTotpToken(user.totpSecret, body.otp)) {
      throw new AppError(401, "OTP_INVALID", "Invalid authenticator code");
    }

    const token = signToken({ sub: user.id, role: user.role });
    return ok(res, { token, user: publicUser(user) });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    return ok(res, { user: publicUser(req.user) });
  })
);

export default router;
