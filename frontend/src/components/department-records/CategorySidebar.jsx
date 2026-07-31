"use client";

import React from "react";
import { DOC_ROOTS } from "@/data/departmentDocumentTypes";
import { useLanguage } from "@/context/LanguageContext";

export default function CategorySidebar({
  rootId,
  categoryId,
  counts,
  onRootChange,
  onCategoryChange,
}) {
  const { lang } = useLanguage();
  const root = DOC_ROOTS.find((r) => r.id === rootId) || DOC_ROOTS[0];

  return (
    <div className="rounded-2xl border border-[#CCBCA5]/25 bg-[var(--dash-panel-soft)] p-4 space-y-4">
      <div className="grid grid-cols-3 gap-1 bg-[var(--dash-bg)] p-1 rounded-xl border border-[#CCBCA5]/20">
        {DOC_ROOTS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onRootChange(r.id)}
            className={`py-2 px-1 text-[10px] sm:text-[11px] font-black rounded-lg transition-all leading-tight text-center ${
              rootId === r.id
                ? "bg-[#CCBCA5] text-[#1e2223]"
                : "text-[var(--dash-text-55)] hover:text-[var(--dash-text)]"
            }`}
          >
            {lang === "kn" ? r.labelKn : r.labelEn}
          </button>
        ))}
      </div>

      <ul className="space-y-1">
        {root.categories.map((cat) => {
          const active = categoryId === cat.id;
          const count = counts?.[rootId]?.[cat.id] ?? 0;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#CCBCA5]/15 text-[#CCBCA5] border border-[#CCBCA5]/40"
                    : "text-[var(--dash-text-70)] hover:bg-[var(--dash-hover)] border border-transparent"
                }`}
              >
                <span>{lang === "kn" ? cat.labelKn : cat.labelEn}</span>
                <span
                  className={`text-[10px] font-black tabular-nums px-2 py-0.5 rounded-full ${
                    active
                      ? "bg-[#CCBCA5]/25 text-[#CCBCA5]"
                      : "bg-[var(--dash-hover-strong)] text-[var(--dash-text-40)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
