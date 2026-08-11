"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaTimes, FaFolderOpen } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import {
  getCategoryLabel,
  getFollowUpStatusLabel,
  getRootLabel,
} from "@/data/departmentDocumentTypes";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import VoiceSearchButton from "@/components/ui/VoiceSearchButton";
import KnTranslateButtons from "@/components/ui/KnTranslateButtons";
import { textMatchesSearch } from "@/lib/transliterateName";

function previewSrc(doc) {
  if (doc.coverUrl) return doc.coverUrl;
  const src = doc.dataUrl || doc.url;
  if (doc.mimeType?.startsWith("image/") && src) return src;
  if (src && /^https?:\/\//i.test(src)) return src;
  return null;
}

export default function DepartmentSearchModal({
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
    if (!query.trim()) return [];
    return (records || []).filter((r) => {
      const hay = [
        r.title,
        r.titleKn,
        r.fileName,
        r.root,
        r.category,
        r.status,
        r.eGeneratedId,
        getRootLabel(r.root, "en"),
        getRootLabel(r.root, "kn"),
        getCategoryLabel(r.root, r.category, "en"),
        getCategoryLabel(r.root, r.category, "kn"),
        r.status ? getFollowUpStatusLabel(r.status, "en") : "",
        r.status ? getFollowUpStatusLabel(r.status, "kn") : "",
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
          <FaSearch className="text-[#CCBCA5] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.deptSearchPlaceholder}
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
            <p className="px-5 py-10 text-center text-sm text-[var(--dash-text-40)]">
              {t.deptSearchHint}
            </p>
          ) : results.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[var(--dash-text-40)]">
              {t.searchNoResults}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--dash-border-faint)] p-2">
              {results.map((doc) => {
                const thumb = previewSrc(doc);
                const title =
                  lang === "kn" && doc.titleKn
                    ? doc.titleKn
                    : doc.title || doc.fileName;
                return (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(doc)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-[var(--dash-hover-strong)] transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--dash-bg)] shrink-0 border border-[#CCBCA5]/20 flex items-center justify-center">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaFolderOpen className="text-[#CCBCA5]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black text-[#CCBCA5] truncate">
                          {getRootLabel(doc.root, lang)} ·{" "}
                          {getCategoryLabel(doc.root, doc.category, lang)}
                          {doc.eGeneratedId ? ` · ${doc.eGeneratedId}` : ""}
                        </p>
                        <p className="text-sm font-black text-[var(--dash-text)] truncate">
                          {title}
                        </p>
                        <p className="text-xs text-[var(--dash-text-45)] truncate mt-0.5">
                          {doc.fileName}
                        </p>
                      </div>
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
