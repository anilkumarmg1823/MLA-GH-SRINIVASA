import { verifyToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./error.js";

const MODULES = [
  "development",
  "department_records",
  "demands",
  "assembly_qa",
];

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new AppError(401, "UNAUTHORIZED", "Missing token");
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { permissions: true },
    });
    if (!user) throw new AppError(401, "UNAUTHORIZED", "User not found");
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") {
    return next(new AppError(403, "FORBIDDEN", "Admin only"));
  }
  next();
}

export function requirePermission(moduleId, action) {
  return (req, _res, next) => {
    const user = req.user;
    if (!user) return next(new AppError(401, "UNAUTHORIZED", "Missing auth"));
    if (user.role === "admin") return next();

    const modules = user.permissions?.modules || {};
    const perms = modules[moduleId];
    if (!perms?.[action]) {
      return next(
        new AppError(403, "FORBIDDEN", `Missing ${moduleId}.${action}`)
      );
    }
    return next();
  };
}

export { MODULES };
