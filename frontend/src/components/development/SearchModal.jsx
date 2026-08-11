"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaTimes, FaRupeeSign } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getGpLabel, getVillageLabel } from "@/data/gramPanchayats";
import { getCoverImage } from "@/lib/media";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import VoiceSearchButton from "@/components/ui/VoiceSearchButton";
import KnTranslateButtons from "@/components/ui/KnTranslateButtons";
import { textMatchesSearch } from "@/lib/transliterateName";

function formatInr(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function SearchModal({ open, onClose, records, onSelect }) {
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
    return (records || []).filter((r) => {
      const hay = [
        r.name,
        r.nameKn,
        r.yojane,
        r.yojaneKn,
        r.description,
        r.descriptionKn,
        r.gramPanchayat,
        r.village,
        r.department,
        r.status,
      ]
        .filter(Boolean)
        .join(" ");
      return textMatchesSearch(hay, query);
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
          <FaSearch className="text-[var(--dash-text-60)] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 min-w-0 bg-transparent text-[var(--dash-text)] text-base outline-none placeholder:text-[var(--dash-text-40)]"
          />
          <KnTranslateButtons
            value={query}
            onChange={setQuery}
            compact
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
            <p className="px-5 py-10 text-center text-sm text-[var(--dash-text-40)]">
              {t.searchHint}
            </p>
          ) : results.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[var(--dash-text-40)]">
              {t.searchNoResults}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--dash-border-faint)] p-2">
              {results.map((row) => {
                const title =
                  lang === "kn" && row.nameKn ? row.nameKn : row.name;
                const scheme =
                  lang === "kn" && row.yojaneKn ? row.yojaneKn : row.yojane;
                const cover = getCoverImage(row);
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(row)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-[var(--dash-hover-strong)] transition-colors"
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[var(--dash-bg)] shrink-0 border border-[#CCBCA5]/20">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black text-[#CCBCA5] truncate">
                          {scheme}
                        </p>
                        <p className="text-sm font-black text-[var(--dash-text)] truncate">
                          {title}
                        </p>
                        <p className="text-xs text-[var(--dash-text-45)] truncate mt-0.5">
                          {getGpLabel(row.gramPanchayat, lang)} ·{" "}
                          {getVillageLabel(
                            row.gramPanchayat,
                            row.village,
                            lang
                          )}
                        </p>
                      </div>
                      <p className="text-xs font-black text-[#CCBCA5] shrink-0 flex items-center gap-0.5">
                        <FaRupeeSign className="text-[9px]" />
                        {formatInr(row.amountSanctioned)
                          .replace("₹", "")
                          .trim()}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
