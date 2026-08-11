"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  hasKannadaScript,
  hasLatinLetters,
  toKannadaText,
  toLatinApprox,
} from "@/lib/transliterateName";

/**
 * Compact EN ↔ KN translate controls for search bars / inline fields.
 */
export default function KnTranslateButtons({
  value,
  onChange,
  className = "",
  compact = false,
}) {
  const { t } = useLanguage();
  const backupRef = useRef("");
  const text = String(value ?? "");
  const showToKn = Boolean(hasLatinLetters(text) && text.trim());
  const showToEn = Boolean(hasKannadaScript(text) && text.trim());

  if (!showToKn && !showToEn) return null;

  const handleToKannada = () => {
    if (!text.trim()) return;
    backupRef.current = text;
    onChange?.(toKannadaText(text));
  };

  const handleToEnglish = () => {
    if (backupRef.current && hasLatinLetters(backupRef.current)) {
      onChange?.(backupRef.current);
      return;
    }
    onChange?.(toLatinApprox(text));
  };

  const btnBase = compact
    ? "text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap"
    : "text-[10px] font-black px-2.5 py-0.5 rounded-full border shrink-0 whitespace-nowrap";

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showToKn ? (
        <button
          type="button"
          onClick={handleToKannada}
          className={`${btnBase} border-[var(--dash-accent)]/50 text-[var(--dash-accent)] hover:bg-[var(--dash-accent)]/10`}
          title={t.translateToKannada || "Translate to Kannada"}
        >
          {compact ? "ಕನ್ನಡ" : t.translateToKannada || "Translate to Kannada"}
        </button>
      ) : null}
      {showToEn ? (
        <button
          type="button"
          onClick={handleToEnglish}
          className={`${btnBase} border-[var(--dash-border)] text-[var(--dash-text-60)] hover:bg-[var(--dash-hover)]`}
          title={t.switchToEnglish || "English"}
        >
          {compact ? "EN" : t.switchToEnglish || "English"}
        </button>
      ) : null}
    </div>
  );
}
