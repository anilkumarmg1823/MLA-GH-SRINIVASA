import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  uploadBuffer,
  resolveObjectUrl,
  publicUrlForKey,
} from "../lib/s3.js";
import { asyncHandler, ok, AppError } from "../middleware/error.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { uploadLanding, handleMulterError } from "../middleware/upload.js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const HERO_S3_KEY = "kudligi-mla/landing/hero_nrega_video.mp4";
const DEVELOPMENTS_VIDEO_S3_KEY =
  "kudligi-mla/landing/developments_bg_video.mp4";

function loadJsonS3Key(fileName, fallback) {
  try {
    const meta = JSON.parse(
      readFileSync(join(__dirname, "../../data", fileName), "utf8")
    );
    return meta.s3Key || fallback;
  } catch {
    return fallback;
  }
}

function loadHeroS3KeyFromMeta() {
  return loadJsonS3Key("landingHeroVideo.json", HERO_S3_KEY);
}

function loadDevelopmentsVideoS3KeyFromMeta() {
  return loadJsonS3Key(
    "landingDevelopmentsVideo.json",
    DEVELOPMENTS_VIDEO_S3_KEY
  );
}

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
    taglineEn: "MBBS, MD, AIIMS Delhi",
    taglineKn: "MBBS, MD, AIIMS Delhi",
  },
  copy: { en: {}, kn: {} },
  hero: { video: "", backgroundImage: "", overlayOpacity: 0.65, slides: [] },
  stats: {},
  about: {},
  media: {
    watermark: "",
    tourScheduleImage: "",
    tourSchedules: [],
    developmentsVideo: "",
    developmentsVideoS3Key: "",
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

const NEW_TAGLINE = "MBBS, MD, AIIMS Delhi";

function isLegacyTagline(value) {
  const t = String(value || "").trim().toLowerCase();
  if (!t) return true;
  if (t === NEW_TAGLINE.toLowerCase()) return false;
  return (
    t.includes("nimmondige") ||
    t.includes("ನಿಮ್ಮೊಂದಿಗೆ") ||
    t.includes("aims delhi") ||
    t.includes("mbbs, md aims")
  );
}

/** Force-retired brand tagline so CMS/DB leftovers cannot stick in the navbar */
function migrateLandingTagline(data) {
  if (!data || typeof data !== "object") return data;
  const next = { ...data };
  const site = next.site && typeof next.site === "object" ? { ...next.site } : {};
  if (isLegacyTagline(site.taglineEn)) site.taglineEn = NEW_TAGLINE;
  if (isLegacyTagline(site.taglineKn)) site.taglineKn = NEW_TAGLINE;
  next.site = site;
  return next;
}

const HERO_MLA_IMAGES = [
  "/Picsart_24-11-21_17-11-01-713 (1).png",
  "/Picsart_25-02-07_15-07-09-010.png",
  "/Picsart_25-05-30_00-26-33-582.png",
];

const SITE_MLA_PORTRAIT = "/Picsart_26-02-05_14-31-10-288 (1).png";

/** Restore preferred Picsart MLA portraits if CMS stored about-page cutouts */
function migrateLandingHeroImages(data) {
  if (!data || typeof data !== "object") return data;
  const next = { ...data };
  const site = next.site && typeof next.site === "object" ? { ...next.site } : {};
  const portrait = String(site.mlaPortrait || "");
  if (!portrait || /mla_about/i.test(portrait)) {
    site.mlaPortrait = SITE_MLA_PORTRAIT;
  }
  next.site = site;

  const hero = next.hero && typeof next.hero === "object" ? { ...next.hero } : {};
  const slides = Array.isArray(hero.slides) ? hero.slides : [];
  const valid = new Set(HERO_MLA_IMAGES);
  const bad = (src) => {
    const s = String(src || "");
    if (!s) return true;
    if (valid.has(s)) return false;
    if (/mla_about/i.test(s)) return true;
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) {
      return /mla_about/i.test(s);
    }
    return !valid.has(s);
  };
  if (slides.length !== 3 || slides.some((s) => bad(s?.mlaImage))) {
    // Preserve existing slide text; only restore image paths when possible
    if (slides.length === 3) {
      hero.slides = slides.map((s, i) => ({
        ...s,
        mlaImage: HERO_MLA_IMAGES[i] || HERO_MLA_IMAGES[0],
      }));
    } else {
      hero.slides = HERO_MLA_IMAGES.map((mlaImage, i) => ({
        ...(slides[i] && typeof slides[i] === "object" ? slides[i] : {}),
        id: slides[i]?.id || `h${i + 1}`,
        mlaImage,
      }));
    }
  }
  next.hero = hero;
  return next;
}

/** Private bucket: sign landing videos (+ optional S3 keys stored beside URLs) */
async function resolveLandingMediaUrls(data) {
  if (!data || typeof data !== "object") return data;
  const next = { ...data };
  const hero = next.hero && typeof next.hero === "object" ? { ...next.hero } : {};
  const media =
    next.media && typeof next.media === "object" ? { ...next.media } : {};
  const ttl = 60 * 60 * 24 * 7;

  const heroKey = hero.videoS3Key || loadHeroS3KeyFromMeta();
  if (heroKey || hero.video) {
    hero.video = await resolveObjectUrl(
      hero.video || publicUrlForKey(heroKey || HERO_S3_KEY),
      heroKey || HERO_S3_KEY,
      ttl
    );
    hero.videoS3Key = heroKey || HERO_S3_KEY;
  }

  const devKey =
    media.developmentsVideoS3Key || loadDevelopmentsVideoS3KeyFromMeta();
  if (devKey || media.developmentsVideo) {
    media.developmentsVideo = await resolveObjectUrl(
      media.developmentsVideo ||
        publicUrlForKey(devKey || DEVELOPMENTS_VIDEO_S3_KEY),
      devKey || DEVELOPMENTS_VIDEO_S3_KEY,
      ttl
    );
    media.developmentsVideoS3Key = devKey || DEVELOPMENTS_VIDEO_S3_KEY;
  }

  next.hero = hero;
  next.media = media;
  return next;
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
    const migrated = migrateLandingHeroImages(migrateLandingTagline(data));
    return ok(res, await resolveLandingMediaUrls(migrated));
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
    const merged = migrateLandingHeroImages(
      migrateLandingTagline(deepMerge(DEFAULT_LANDING, req.body))
    );
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
