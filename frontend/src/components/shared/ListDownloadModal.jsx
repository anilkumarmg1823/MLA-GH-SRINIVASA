"use client";

import React, { useState } from "react";
import { FaTimes, FaFileExcel, FaFilePdf } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";

export default function ListDownloadModal({
  open,
  onClose,
  title,
  rowCount = 0,
  onDownloadExcel,
  onDownloadPdf,
  canDownload = true,
}) {
  const { lang, t } = useLanguage();
  const [format, setFormat] = useState("excel");
  useEscapeKey(open, onClose);

  if (!open) return null;

  const handleDownload = () => {
    if (!canDownload) return;
    if (format === "pdf") onDownloadPdf?.();
    else onDownloadExcel?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
        aria-label={t.close}
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-[#CCBCA5]/30 bg-[var(--dash-panel)] p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-black text-[var(--dash-text)]">
              {title || t.download}
            </h2>
            <p className="text-xs text-[var(--dash-text-50)] mt-1">
              {rowCount} {lang === "kn" ? "ದಾಖಲೆಗಳು" : "records"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] flex items-center justify-center"
            aria-label={t.close}
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <p className="text-xs font-black uppercase tracking-wider text-[#CCBCA5]">
            {lang === "kn" ? "ಸ್ವರೂಪ" : "Format"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormat("excel")}
              className={`inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border ${
                format === "excel"
                  ? "bg-[#CCBCA5] text-[#1e2223] border-[#CCBCA5]"
                  : "border-[#CCBCA5]/40 text-[#CCBCA5]"
              }`}
            >
              <FaFileExcel /> CSV / Excel
            </button>
            <button
              type="button"
              onClick={() => setFormat("pdf")}
              className={`inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border ${
                format === "pdf"
                  ? "bg-[#CCBCA5] text-[#1e2223] border-[#CCBCA5]"
                  : "border-[#CCBCA5]/40 text-[#CCBCA5]"
              }`}
            >
              <FaFilePdf /> PDF
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={!canDownload || rowCount === 0}
          onClick={handleDownload}
          className="w-full px-4 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black disabled:opacity-40"
        >
          {t.download || "Download"}
        </button>
      </div>
    </div>
  );
}
