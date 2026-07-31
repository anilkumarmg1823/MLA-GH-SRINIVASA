import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { env } from "../config/env.js";
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
  };
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

router.post(
  "/staff/request-otp",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        phone: z.string().regex(/^\d{10}$/),
      })
      .parse(req.body);

    const staff = await prisma.user.findUnique({
      where: { phone: body.phone },
      include: { permissions: true },
    });
    if (!staff || staff.role === "admin") {
      throw new AppError(404, "NOT_FOUND", "Staff phone not registered");
    }

    // rate limit: max 5 open challenges in last 15 min
    const recent = await prisma.otpChallenge.count({
      where: {
        phone: body.phone,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });
    if (recent >= 5) {
      throw new AppError(429, "RATE_LIMIT", "Too many OTP requests. Try later.");
    }

    const code = env.demoOtp;
    const codeHash = await bcrypt.hash(code, 8);
    await prisma.otpChallenge.create({
      data: {
        phone: body.phone,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return ok(res, {
      sent: true,
      // demo only — remove in production SMS flow
      demoOtp: env.nodeEnv === "development" ? code : undefined,
    });
  })
);

router.post(
  "/staff/verify-otp",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        phone: z.string().regex(/^\d{10}$/),
        otp: z.string().min(4).max(8),
        role: z.string().optional(),
      })
      .parse(req.body);

    const challenge = await prisma.otpChallenge.findFirst({
      where: { phone: body.phone },
      orderBy: { createdAt: "desc" },
    });
    if (!challenge) {
      throw new AppError(400, "OTP_MISSING", "Request OTP first");
    }
    if (challenge.expiresAt < new Date()) {
      throw new AppError(400, "OTP_EXPIRED", "OTP expired");
    }
    if (challenge.attempts >= 5) {
      throw new AppError(400, "OTP_LOCKED", "Too many attempts");
    }

    const good = await bcrypt.compare(body.otp, challenge.codeHash);
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    if (!good) {
      throw new AppError(401, "OTP_INVALID", "Invalid OTP");
    }

    const user = await prisma.user.findUnique({
      where: { phone: body.phone },
      include: { permissions: true },
    });
    if (!user) throw new AppError(404, "NOT_FOUND", "Staff not found");

    await prisma.otpChallenge.deleteMany({ where: { phone: body.phone } });

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
