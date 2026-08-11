"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getGpLabel, getVillageLabel } from "@/data/gramPanchayats";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import VoiceSearchButton from "@/components/ui/VoiceSearchButton";
import KnTranslateButtons from "@/components/ui/KnTranslateButtons";
import { textMatchesSearch } from "@/lib/transliterateName";

export default function BedkeSearchModal({ open, onClose, records, onSelect }) {
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
    if (!query.trim()) return [];
    const seen = new Set();
    return (records || []).filter((r) => {
      if (!r?.id || seen.has(r.id)) return false;
      const approach =
        r.approach === "personal" ? t.bedkeTabPersonal : t.bedkeTabCivil;
      const hay = [
        r.name,
        r.subject,
        r.gramPanchayat,
        r.village,
        r.status,
        r.approach,
        approach,
        getGpLabel(r.gramPanchayat, lang),
        getVillageLabel(r.gramPanchayat, r.village, lang),
      ]
        .filter(Boolean)
        .join(" ");
      if (!textMatchesSearch(hay, query)) return false;
      seen.add(r.id);
      return true;
    });
  }, [records, query, lang, t.bedkeTabCivil, t.bedkeTabPersonal]);

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
            placeholder={t.bedkeSearchPlaceholder}
            className="flex-1 min-w-0 bg-transparent text-[var(--dash-text)] text-base outline-none placeholder:text-[var(--dash-text-40)]"
          />
          <KnTranslateButtons value={query} onChange={setQuery} compact />
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
              {t.bedkeSearchHint}
            </p>
          ) : results.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[var(--dash-text-40)] text-center">
              {t.bedkeSearchNoResults}
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
                    <p className="text-sm font-bold text-[var(--dash-text)]">{row.name}</p>
                    <p className="text-xs text-[var(--dash-text-60)] mt-0.5 line-clamp-2">
                      {row.subject}
                    </p>
                    <p className="text-[11px] text-[#CCBCA5] mt-1">
                      {getGpLabel(row.gramPanchayat, lang)} ·{" "}
                      {getVillageLabel(row.gramPanchayat, row.village, lang)} ·{" "}
                      {row.approach === "personal"
                        ? t.bedkeTabPersonal
                        : t.bedkeTabCivil}{" "}
                      · {t.bedkePending}
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
