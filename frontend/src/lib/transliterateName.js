/**
 * Name-only Kannada transliteration via Sanscript (ITRANS → Kannada).
 * Do NOT use for UI sentences — only person / staff names.
 */
import Sanscript from "sanscript";

function normalizeToken(token) {
  return String(token || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z'.-]/g, "");
}

/**
 * @param {string} englishName
 * @returns {string} Kannada-script approximation, or "" if empty/invalid
 */
export function toKannadaName(englishName) {
  const raw = String(englishName || "").trim();
  if (!raw) return "";

  // Already mostly Kannada / other Indic — leave as-is
  if (/[\u0C80-\u0CFF]/.test(raw)) return raw;

  const parts = raw.split(/\s+/).filter(Boolean);
  const out = [];

  for (const part of parts) {
    const token = normalizeToken(part);
    if (!token) {
      out.push(part);
      continue;
    }
    try {
      const kn = Sanscript.t(token, "itrans", "kannada");
      out.push(kn || part);
    } catch {
      out.push(part);
    }
  }

  return out.join(" ").trim();
}
