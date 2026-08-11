/** Strip emoji / pictographic symbols from free-text inputs. */
export function stripEmojis(value) {
  return String(value || "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\uFE0F/g, "");
}

/** True when text has at least one letter (any script) or digit. */
export function hasMeaningfulText(value) {
  return /[\p{L}\p{N}]/u.test(String(value || ""));
}

/**
 * Empty optional fields are OK.
 * Non-empty values must include letters/digits — not only spaces, emoji, or symbols.
 */
export function isTextOnlySymbolsOrEmoji(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  return !hasMeaningfulText(stripEmojis(raw));
}
