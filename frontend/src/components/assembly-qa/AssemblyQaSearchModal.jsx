"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import VoiceSearchButton from "@/components/ui/VoiceSearchButton";

export default function AssemblyQaSearchModal({
  open,
  onClose,
  records,
  onSelect,
}) {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (records || []).filter((r) => {
      const hay = [
        r.question,
        r.questionKn,
        r.answer,
        r.answerKn,
        r.askedByName,
        r.partyName,
        r.questionNo,
        r.sessionLabel,
        r.status,
        r.askedBy,
        ...(r.files || []).map((f) => f.fileName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [records, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[12vh] px-3 sm:px-6">
      <div
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--dash-border-soft)] bg-[var(--dash-panel-soft)] backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--dash-border-faint)]">
          <FaSearch className="text-[#CCBCA5] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.aqSearchPlaceholder}
            className="flex-1 bg-transparent text-[var(--dash-text)] text-base outline-none placeholder:text-[var(--dash-text-40)]"
          />
          <VoiceSearchButton active={open} onTranscript={setQuery} />
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--dash-text-50)] hover:bg-[var(--dash-hover-strong)] hover:text-[var(--dash-text)]"
            aria-label={t.close}
          >
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {!query.trim() ? (
            <p className="px-5 py-8 text-sm text-[var(--dash-text-40)] text-center">
              {t.aqSearchHint}
            </p>
          ) : results.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[var(--dash-text-40)] text-center">
              {t.aqSearchNoResults}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--dash-border-faint)]">
              {results.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(row)}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--dash-hover)] transition-colors"
                  >
                    <p className="text-[10px] font-black text-[#CCBCA5]">
                      {row.questionNo || "—"} ·{" "}
                      {row.askedBy === "mla" ? t.aqTabMla : t.aqTabOther} ·{" "}
                      {row.status === "answered"
                        ? t.aqStatusAnswered
                        : t.aqStatusPending}
                    </p>
                    <p className="text-sm font-bold text-[var(--dash-text)] mt-0.5 line-clamp-2">
                      {lang === "kn" && row.questionKn
                        ? row.questionKn
                        : row.question}
                    </p>
                    <p className="text-[11px] text-[var(--dash-text-45)] mt-1">
                      {row.askedByName}
                      {row.partyName ? ` · ${row.partyName}` : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
