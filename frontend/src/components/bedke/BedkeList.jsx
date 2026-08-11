"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FaPlus, FaPen, FaArchive, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

const PAGE_SIZE = 10;

function formatDate(iso, lang) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(lang === "kn" ? "kn-IN" : "en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusTone(status) {
  if (status === "Completed") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  }
  if (status === "Rejected") {
    return "bg-rose-500/15 text-rose-300 border-rose-400/30";
  }
  if (status === "InProgress") {
    return "bg-sky-500/15 text-sky-300 border-sky-400/30";
  }
  return "bg-amber-500/15 text-amber-300 border-amber-400/30";
}

function statusLabel(status, t) {
  if (status === "Completed") return t.bedkeCompleted || "Completed";
  if (status === "Rejected") return t.bedkeRejected || "Rejected";
  if (status === "InProgress") return t.bedkeInProgress || "In progress";
  return t.bedkePending;
}

export default function BedkeList({
  rows,
  onAdd,
  onEdit,
  onArchive,
  canAdd,
  canEdit,
  canArchive,
  pageSize = PAGE_SIZE,
}) {
  const { lang, t } = useLanguage();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return (rows || []).slice(start, start + pageSize);
  }, [rows, safePage, pageSize]);

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#CCBCA5]/40 bg-[var(--dash-panel-soft)] backdrop-blur-sm px-6 py-14 text-center space-y-4 min-h-[280px] flex flex-col items-center justify-center">
        <p className="text-[var(--dash-text-50)] text-sm">{t.bedkeNoNeeds}</p>
        {canAdd && onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8] transition-colors"
          >
            <FaPlus className="text-xs" />
            {t.bedkeAdd}
          </button>
        ) : null}
      </div>
    );
  }

  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, rows.length);

  return (
    <div className="rounded-2xl border border-[#CCBCA5]/25 bg-[var(--dash-panel-soft)] overflow-hidden shadow-lg flex flex-col min-h-[420px]">
      <div className="overflow-x-auto flex-1 max-h-[min(60vh,520px)] overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--dash-panel)]">
            <tr className="border-b border-[#CCBCA5]/20 text-[10px] uppercase tracking-wider text-[#CCBCA5]/80">
              <th className="px-4 py-3 font-black">{t.bedkeName}</th>
              <th className="px-4 py-3 font-black">{t.bedkeSubject}</th>
              <th className="px-4 py-3 font-black whitespace-nowrap">
                {t.bedkeStatus}
              </th>
              <th className="px-4 py-3 font-black whitespace-nowrap">
                {t.bedkeDate}
              </th>
              {canEdit || canArchive ? (
                <th className="px-4 py-3 font-black whitespace-nowrap">
                  {t.actions || "Actions"}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--dash-border-faint)] hover:bg-[var(--dash-hover)] transition-colors"
              >
                <td className="px-4 py-3 font-bold text-[var(--dash-text)] align-top">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-[var(--dash-text)]/75 align-top max-w-md">
                  {row.subject}
                </td>
                <td className="px-4 py-3 align-top whitespace-nowrap">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${statusTone(
                      row.status
                    )}`}
                  >
                    {statusLabel(row.status, t)}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--dash-text-50)] align-top whitespace-nowrap text-xs">
                  {formatDate(row.createdAt, lang)}
                </td>
                {canEdit || canArchive ? (
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => onEdit?.(row)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-xs font-black hover:bg-[#CCBCA5]/15"
                        >
                          <FaPen className="text-[10px]" />
                          {t.edit || "Edit"}
                        </button>
                      ) : null}
                      {canArchive ? (
                        <button
                          type="button"
                          onClick={() => onArchive?.(row)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-400/40 text-amber-200 text-xs font-black hover:bg-amber-500/15"
                        >
                          <FaArchive className="text-[10px]" />
                          {t.archive || "Archive"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-t border-[#CCBCA5]/20 bg-[var(--dash-panel)]/80">
        <p className="text-xs text-[var(--dash-text-50)] font-medium">
          {lang === "kn"
            ? `${from}–${to} / ${rows.length}`
            : `${from}–${to} of ${rows.length}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#CCBCA5]/35 text-xs font-black text-[var(--dash-text)] disabled:opacity-35 hover:bg-[#CCBCA5]/12"
          >
            <FaChevronLeft className="text-[10px]" />
            {lang === "kn" ? "ಹಿಂದೆ" : "Prev"}
          </button>
          <span className="text-xs font-bold text-[var(--dash-text-60)] tabular-nums">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#CCBCA5]/35 text-xs font-black text-[var(--dash-text)] disabled:opacity-35 hover:bg-[#CCBCA5]/12"
          >
            {lang === "kn" ? "ಮುಂದೆ" : "Next"}
            <FaChevronRight className="text-[10px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
