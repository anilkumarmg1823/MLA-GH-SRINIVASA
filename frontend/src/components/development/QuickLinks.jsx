"use client";

import React from "react";
import { FaPlus, FaDownload, FaSearch } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

export default function QuickLinks({
  onSearch,
  onAdd,
  onDownload,
  canAdd = true,
  canDownload = true,
  addLabel,
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={onSearch}
        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border border-[var(--dash-border)] text-[var(--dash-text)] text-sm font-bold hover:bg-[var(--dash-hover)] transition-colors backdrop-blur-sm bg-[var(--dash-panel)] shadow-sm"
      >
        <FaSearch className="text-xs text-[var(--dash-text-60)]" />
        {t.search}
      </button>
      {canAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[var(--dash-accent)] text-white text-sm font-bold hover:opacity-90 shadow-md transition-all"
        >
          <FaPlus className="text-xs" />
          {addLabel || t.addRecord}
        </button>
      ) : null}
      {canDownload ? (
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border border-[var(--dash-border)] text-[var(--dash-text)] text-sm font-bold hover:bg-[var(--dash-hover)] transition-colors backdrop-blur-sm bg-[var(--dash-panel)] shadow-sm"
        >
          <FaDownload className="text-xs text-[var(--dash-text-60)]" />
          {t.download}
        </button>
      ) : null}
    </div>
  );
}
