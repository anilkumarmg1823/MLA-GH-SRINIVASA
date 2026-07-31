import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { uploadBuffer, resolveObjectUrl } from "../lib/s3.js";
import { asyncHandler, ok, AppError } from "../middleware/error.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { uploadLanding, handleMulterError } from "../middleware/upload.js";

const router = Router();

const DEFAULT_LANDING = {
  brand: {
    blueDeep: "#001438",
    blue: "#001D56",
    blueMid: "#002B7F",
    blueAlt: "#003B95",
    blueBright: "#0055C4",
    blueLight: "#0077E6",
    gold: "#FFD700",
    footerAccent: "#CCBCA5",
    link: "#367AF1",
    surface: "#F8FAFC",
    bg: "#1e2223",
    footerBg: "#0f1314",
    fontDisplay: "Noto Serif",
    fontBody: "Noto Sans",
  },
  site: {
    nameEn: "DR. SRINIVAS N. T.",
    nameKn: "DR. SRINIVAS N. T.",
    taglineEn: "Nimmondige",
    taglineKn: "Nimmondige",
  },
  copy: { en: {}, kn: {} },
  hero: { video: "", backgroundImage: "", overlayOpacity: 0.65, slides: [] },
  stats: {},
  about: {},
  media: {
    watermark: "",
    tourScheduleImage: "",
    tourSchedules: [],
  },
  leaders: { items: [] },
  gallery: { items: [] },
  grievance: { villages: [] },
  contact: {},
  quickLinks: {},
};

function deepMerge(seed, saved) {
  if (Array.isArray(seed)) return Array.isArray(saved) ? saved : seed;
  if (!seed || typeof seed !== "object") {
    return saved === undefined ? seed : saved;
  }
  const out = { ...seed };
  if (!saved || typeof saved !== "object") return structuredClone(seed);
  for (const key of Object.keys(seed)) {
    out[key] = deepMerge(seed[key], saved[key]);
  }
  for (const key of Object.keys(saved)) {
    if (!(key in out)) out[key] = saved[key];
  }
  return out;
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const row = await prisma.landingContent.findUnique({
      where: { id: "default" },
    });
    const data = row?.data
      ? deepMerge(DEFAULT_LANDING, row.data)
      : structuredClone(DEFAULT_LANDING);
    return ok(res, data);
  })
);

router.put(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!req.body || typeof req.body !== "object") {
      throw new AppError(400, "INVALID", "Body must be landing JSON object");
    }
    const merged = deepMerge(DEFAULT_LANDING, req.body);
    const row = await prisma.landingContent.upsert({
      where: { id: "default" },
      create: { id: "default", data: merged },
      update: { data: merged },
    });
    return ok(res, row.data);
  })
);

router.post(
  "/reset",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const row = await prisma.landingContent.upsert({
      where: { id: "default" },
      create: { id: "default", data: DEFAULT_LANDING },
      update: { data: DEFAULT_LANDING },
    });
    return ok(res, row.data);
  })
);

router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  uploadLanding.single("file"),
  handleMulterError,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError(400, "NO_FILE", "File required");
    const up = await uploadBuffer({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      moduleName: "landing",
    });
    await prisma.mediaAsset.create({
      data: {
        url: up.url,
        s3Key: up.s3Key,
        mimeType: up.mimeType,
        size: req.file.size,
        module: "landing",
        uploadedById: req.user.id,
      },
    });
    const url = await resolveObjectUrl(up.url, up.s3Key);
    return ok(res, { ...up, url }, null, 201);
  })
);

export default router;
