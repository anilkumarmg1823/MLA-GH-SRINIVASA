/**
 * Kannada / Latin helpers + transliteration for dashboard form fields.
 * Uses Sanscript (ITRANS ↔ Kannada). Approximate — not a machine translator.
 */
import Sanscript from "sanscript";

const KANNADA_RE = /[\u0C80-\u0CFF]/;
const LATIN_RE = /[A-Za-z]/;

export function hasKannadaScript(value) {
  return KANNADA_RE.test(String(value || ""));
}

export function hasLatinLetters(value) {
  return LATIN_RE.test(String(value || ""));
}

/** True when text has Latin letters and little/no Kannada (likely English). */
export function looksLikeEnglish(value) {
  const s = String(value || "").trim();
  if (!s) return false;
  if (!hasLatinLetters(s)) return false;
  const latin = (s.match(/[A-Za-z]/g) || []).length;
  const kannada = (s.match(/[\u0C80-\u0CFF]/g) || []).length;
  return latin > 0 && latin >= kannada;
}

function normalizeItransToken(token) {
  return String(token || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z'.-]/g, "");
}

/**
 * Name-only helper (Access staff names). Kept for backward compatibility.
 * @param {string} englishName
 */
export function toKannadaName(englishName) {
  return toKannadaText(englishName);
}

/**
 * Transliterate Latin words in a phrase to Kannada script.
 * Leaves existing Kannada and numbers/punctuation alone.
 */
export function toKannadaText(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (hasKannadaScript(raw) && !hasLatinLetters(raw)) return raw;

  return raw
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) return part;
      if (KANNADA_RE.test(part) && !LATIN_RE.test(part)) return part;
      if (!LATIN_RE.test(part)) return part;

      const token = normalizeItransToken(part);
      if (!token) return part;
      try {
        const kn = Sanscript.t(token, "itrans", "kannada");
        // Preserve simple casing artifacts: keep trailing punctuation from original
        const lead = part.match(/^[^A-Za-z]*/)?.[0] || "";
        const trail = part.match(/[^A-Za-z]*$/)?.[0] || "";
        return `${lead}${kn || part}${trail}`;
      } catch {
        return part;
      }
    })
    .join("");
}

/**
 * Approximate Latin from Kannada (for toggle back to English typing).
 */
export function toLatinApprox(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (!hasKannadaScript(raw)) return raw;
  try {
    const out = Sanscript.t(raw, "kannada", "itrans");
    return String(out || raw)
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return raw;
  }
}

/** Query variants so Latin/Kannada searches can match either script. */
export function expandSearchQueries(query) {
  const q = String(query || "").trim();
  if (!q) return [];
  const set = new Set([q.toLowerCase()]);
  if (hasLatinLetters(q)) {
    const kn = toKannadaText(q).trim().toLowerCase();
    if (kn) set.add(kn);
  }
  if (hasKannadaScript(q)) {
    const en = toLatinApprox(q).trim().toLowerCase();
    if (en) set.add(en);
  }
  return [...set];
}

export function textMatchesSearch(haystack, query) {
  const hay = String(haystack || "").toLowerCase();
  if (!hay) return false;
  return expandSearchQueries(query).some((q) => hay.includes(q));
}

/**
 * When UI language is Kannada and any listed field looks English, ask before save.
 * @returns {boolean} true if save may proceed
 */
export function confirmEnglishSaveIfNeeded(lang, values, message) {
  if (lang !== "kn") return true;
  const list = (Array.isArray(values) ? values : [values]).filter(Boolean);
  if (!list.some((v) => looksLikeEnglish(v))) return true;
  return window.confirm(
    message ||
      "Some fields are in English and will be saved in English. Are you OK with that?"
  );
}
