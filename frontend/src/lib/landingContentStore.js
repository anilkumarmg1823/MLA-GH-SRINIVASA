import { landingContentSeed } from "@/data/landingContentSeed";
import { api, apiUpload } from "@/lib/api";

export const LANDING_STORAGE_KEY = "mla_landing_v1";
export const LANDING_SYNC_EVENT = "mla-landing-sync";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

/** Deep-merge saved over seed so new fields appear after upgrades */
export function mergeLandingContent(saved, seed = landingContentSeed) {
  if (Array.isArray(seed)) {
    return Array.isArray(saved) ? saved : seed.map((x) => structuredClone(x));
  }
  if (!isObject(seed)) {
    return saved === undefined ? seed : saved;
  }
  const out = { ...seed };
  if (!isObject(saved)) return structuredClone(seed);
  for (const key of Object.keys(seed)) {
    out[key] = mergeLandingContent(saved[key], seed[key]);
  }
  for (const key of Object.keys(saved)) {
    if (!(key in out)) out[key] = saved[key];
  }
  return out;
}

export function getDefaultLandingContent() {
  return structuredClone(landingContentSeed);
}

function notifyLandingSync(content) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent(LANDING_SYNC_EVENT, { detail: content })
    );
  } catch {
    /* ignore */
  }
}

export async function loadLandingContent() {
  try {
    const { data } = await api("/landing", { token: null });
    return mergeLandingContent(data, landingContentSeed);
  } catch {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(LANDING_STORAGE_KEY);
        if (raw) {
          return mergeLandingContent(JSON.parse(raw), landingContentSeed);
        }
      } catch {
        /* ignore */
      }
    }
    return getDefaultLandingContent();
  }
}

export async function saveLandingContent(next) {
  const merged = mergeLandingContent(next, landingContentSeed);
  const { data } = await api("/landing", { method: "PUT", body: merged });
  const result = mergeLandingContent(data || merged, landingContentSeed);
  try {
    localStorage.setItem(LANDING_STORAGE_KEY, JSON.stringify(result));
  } catch {
    /* ignore */
  }
  return result;
}

/** Save and notify any open landing tabs to reload content */
export async function syncLandingContent(next) {
  const merged = await saveLandingContent(next);
  notifyLandingSync(merged);
  return merged;
}

export async function resetLandingContent() {
  const { data } = await api("/landing/reset", { method: "POST" });
  const defaults = mergeLandingContent(data, landingContentSeed);
  try {
    localStorage.removeItem(LANDING_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  notifyLandingSync(defaults);
  return defaults;
}

export function applyLandingThemePreset(content, brand) {
  return {
    ...content,
    brand: { ...(content?.brand || {}), ...brand },
  };
}

export async function uploadLandingFile(file) {
  if (!file) throw new Error("No file");
  if (file.size > MAX_FILE_BYTES) throw new Error("FILE_TOO_LARGE");
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await apiUpload("/landing/upload", fd);
  return data?.url || data;
}

/** @deprecated Prefer uploadLandingFile for S3 */
export function readLandingFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file"));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error("FILE_TOO_LARGE"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

export const LANDING_FONT_OPTIONS = [
  "Noto Sans",
  "Noto Serif",
  "Tiro Kannada",
  "Source Serif 4",
  "IBM Plex Sans",
];

const FONT_STACK = {
  "Noto Sans": '"Noto Sans", "Noto Sans Kannada", sans-serif',
  "Noto Serif": '"Noto Serif", "Noto Serif Kannada", serif',
  "Tiro Kannada": '"Tiro Kannada", "Noto Serif Kannada", serif',
  "Source Serif 4": '"Source Serif 4", "Noto Serif", serif',
  "IBM Plex Sans": '"IBM Plex Sans", "Noto Sans", sans-serif',
};

export function brandStyleVars(brand = {}) {
  const display = brand.fontDisplay || "Noto Serif";
  const body = brand.fontBody || "Noto Sans";
  return {
    "--land-blue-deep": brand.blueDeep || "#001438",
    "--land-blue": brand.blue || "#001D56",
    "--land-blue-mid": brand.blueMid || "#002B7F",
    "--land-blue-alt": brand.blueAlt || "#003B95",
    "--land-blue-bright": brand.blueBright || "#0055C4",
    "--land-blue-light": brand.blueLight || "#0077E6",
    "--land-gold": brand.gold || "#FFD700",
    "--land-footer-accent": brand.footerAccent || "#CCBCA5",
    "--land-link": brand.link || "#367AF1",
    "--land-surface": brand.surface || "#F8FAFC",
    "--land-bg": brand.bg || "#1e2223",
    "--land-footer-bg": brand.footerBg || "#0f1314",
    "--land-font-display": FONT_STACK[display] || FONT_STACK["Noto Serif"],
    "--land-font-body": FONT_STACK[body] || FONT_STACK["Noto Sans"],
  };
}
