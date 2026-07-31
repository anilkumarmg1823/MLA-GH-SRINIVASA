"use client";

import React from "react";
import { FaFileAlt, FaEye, FaTrashAlt } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

function formatDate(iso, lang) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(lang === "kn" ? "kn-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AssemblyQaList({
  rows,
  onOpen,
  onDelete,
  canDelete = false,
}) {
  const { lang, t } = useLanguage();

  if (!rows?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#CCBCA5]/35 bg-[var(--dash-panel-soft)] px-6 py-16 text-center text-[var(--dash-text-50)] text-sm">
        {t.aqEmpty}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const question =
          lang === "kn" && row.questionKn ? row.questionKn : row.question;
        const askedLabel =
          row.askedBy === "mla" ? t.aqTabMla : t.aqTabOther;
        const statusLabel =
          row.status === "answered" ? t.aqStatusAnswered : t.aqStatusPending;
        const fileCount = row.files?.length || 0;

        return (
          <li
            key={row.id}
            className="rounded-2xl border border-[#CCBCA5]/25 bg-[var(--dash-panel)] p-4 sm:p-5 shadow-lg hover:border-[#CCBCA5]/50 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {row.questionNo ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#CCBCA5]/15 text-[#CCBCA5] border border-[#CCBCA5]/35">
                      {row.questionNo}
                    </span>
                  ) : null}
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[var(--dash-hover)] text-[var(--dash-text-70)] border border-[var(--dash-border-faint)]">
                    {askedLabel}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                      row.status === "answered"
                        ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/35"
                        : "bg-amber-400/15 text-amber-300 border-amber-400/35"
                    }`}
                  >
                    {statusLabel}
                  </span>
                  {fileCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--dash-text-45)]">
                      <FaFileAlt className="text-[9px]" />
                      {fileCount} {t.aqFiles}
                    </span>
                  ) : null}
                </div>

                <p className="text-sm sm:text-base font-bold text-[var(--dash-text)] leading-snug line-clamp-3">
                  {question}
                </p>

                <p className="text-xs text-[var(--dash-text-45)] mt-2">
                  {row.askedByName}
                  {row.askedBy === "other" && row.partyName
                    ? ` · ${row.partyName}`
                    : ""}
                  {row.sessionLabel ? ` · ${row.sessionLabel}` : ""}
                  {" · "}
                  {formatDate(row.sessionDate || row.createdAt, lang)}
                </p>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpen?.(row)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-xs font-black hover:bg-[#CCBCA5]/10"
                >
                  <FaEye className="text-[10px]" />
                  {t.aqView}
                </button>
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete?.(row)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-red-400/35 text-red-300 text-xs font-black hover:bg-red-400/10"
                  >
                    <FaTrashAlt className="text-[10px]" />
                    {t.delete}
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
