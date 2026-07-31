import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { uploadBuffer, resolveObjectUrl } from "../lib/s3.js";
import { AppError, asyncHandler, ok } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadGeneral, handleMulterError } from "../middleware/upload.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  uploadGeneral.single("file"),
  handleMulterError,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError(400, "NO_FILE", "File required");
    const moduleName = String(req.body.module || "general");
    const up = await uploadBuffer({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      moduleName,
    });
    const url = await resolveObjectUrl(up.url, up.s3Key);
    const asset = await prisma.mediaAsset.create({
      data: {
        url: up.url,
        s3Key: up.s3Key,
        mimeType: up.mimeType,
        size: req.file.size,
        module: moduleName,
        uploadedById: req.user.id,
      },
    });
    return ok(res, { ...asset, url }, null, 201);
  })
);

export default router;
