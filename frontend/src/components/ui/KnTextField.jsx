"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  hasKannadaScript,
  hasLatinLetters,
  toKannadaText,
  toLatinApprox,
} from "@/lib/transliterateName";
import { stripEmojis } from "@/lib/textValidation";

/**
 * Free-text input/textarea with Access-style Kannada transliterate + English toggle.
 * Does not force keyboard language — typing Kannada stays Kannada.
 */
export default function KnTextField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 2,
  required = false,
  placeholder = "",
  className = "",
  inputClassName = "",
  disabled = false,
  /** Optional Latin backup restored when switching to English */
  latinBackup,
  onLatinBackupChange,
}) {
  const { t } = useLanguage();
  const backupRef = useRef("");

  const text = value ?? "";
  const showToKn = hasLatinLetters(text) && String(text).trim();
  const showToEn = hasKannadaScript(text) && String(text).trim();

  const setValue = (next) => {
    onChange?.(stripEmojis(next));
  };

  const handleToKannada = () => {
    const current = String(text);
    if (!current.trim()) return;
    backupRef.current = current;
    onLatinBackupChange?.(current);
    setValue(toKannadaText(current));
  };

  const handleToEnglish = () => {
    const backup = latinBackup ?? backupRef.current;
    if (backup && hasLatinLetters(backup)) {
      setValue(backup);
      return;
    }
    setValue(toLatinApprox(text));
  };

  const baseInput =
    inputClassName ||
    "w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 py-2 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-text-40)] outline-none focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/25 disabled:opacity-50";

  const InputTag = multiline ? "textarea" : "input";

  return (
    <div className={`min-w-0 ${className}`}>
      {label ? (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--dash-heading)]">
            {label}
            {required ? " *" : ""}
          </label>
          <div className="flex items-center gap-1.5">
            {showToKn ? (
              <button
                type="button"
                onClick={handleToKannada}
                disabled={disabled}
                className="text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[var(--dash-accent)]/50 text-[var(--dash-accent)] hover:bg-[var(--dash-accent)]/10 disabled:opacity-40"
              >
                {t.translateToKannada || "Translate to Kannada"}
              </button>
            ) : null}
            {showToEn ? (
              <button
                type="button"
                onClick={handleToEnglish}
                disabled={disabled}
                className="text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[var(--dash-border)] text-[var(--dash-text-60)] hover:bg-[var(--dash-hover)] disabled:opacity-40"
              >
                {t.switchToEnglish || "English"}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex justify-end gap-1.5 mb-1">
          {showToKn ? (
            <button
              type="button"
              onClick={handleToKannada}
              disabled={disabled}
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[var(--dash-accent)]/50 text-[var(--dash-accent)] hover:bg-[var(--dash-accent)]/10"
            >
              {t.translateToKannada || "Translate to Kannada"}
            </button>
          ) : null}
          {showToEn ? (
            <button
              type="button"
              onClick={handleToEnglish}
              disabled={disabled}
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[var(--dash-border)] text-[var(--dash-text-60)] hover:bg-[var(--dash-hover)]"
            >
              {t.switchToEnglish || "English"}
            </button>
          ) : null}
        </div>
      )}

      <InputTag
        value={text}
        onChange={(e) => setValue(e.target.value)}
        className={multiline ? `${baseInput} resize-none` : baseInput}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        {...(multiline ? { rows } : {})}
      />
    </div>
  );
}
