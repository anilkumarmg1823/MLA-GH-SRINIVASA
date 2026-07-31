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
        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border-2 border-[#CCBCA5]/50 text-[#CCBCA5] text-sm font-black hover:bg-[#CCBCA5]/15 transition-colors backdrop-blur-sm bg-[var(--dash-hover)]"
      >
        <FaSearch className="text-xs" />
        {t.search}
      </button>
      {canAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8] shadow-md transition-colors"
        >
          <FaPlus className="text-xs" />
          {addLabel || t.addRecord}
        </button>
      ) : null}
      {canDownload ? (
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border-2 border-[#CCBCA5] text-[#CCBCA5] text-sm font-black hover:bg-[#CCBCA5] hover:text-[#1e2223] transition-colors"
        >
          <FaDownload className="text-xs" />
          {t.download}
        </button>
      ) : null}
    </div>
  );
}
