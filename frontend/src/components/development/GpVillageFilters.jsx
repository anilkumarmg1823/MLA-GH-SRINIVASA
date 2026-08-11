"use client";

import React from "react";
import { FaUndo } from "react-icons/fa";
import { gramPanchayats, getVillagesForGp } from "@/data/gramPanchayats";
import { useLanguage } from "@/context/LanguageContext";

const selectClass =
  "w-full min-w-0 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/20 shadow-sm disabled:opacity-40";

export default function GpVillageFilters({
  gramPanchayat,
  village,
  onGpChange,
  onVillageChange,
  onClear,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  showExtraFilters = true,
  /** Override default development status options: [{ value, label }] */
  statusOptions = null,
  /** Override default sort options: [{ value, label }] */
  sortOptions = null,
  /** Optional extra villages (e.g. Kannada labels from Excel imports) */
  extraVillages = [],
}) {
  const { lang, t } = useLanguage();
  const master = gramPanchayat ? getVillagesForGp(gramPanchayat) : [];
  const seen = new Set(master.map((v) => v.name));
  const villages = [
    ...master,
    ...extraVillages
      .filter((name) => name && !seen.has(name))
      .map((name) => ({ name, nameKn: name })),
  ];
  const hasSelection = Boolean(gramPanchayat || village);
  const showListFilters = showExtraFilters && gramPanchayat && village;

  const resolvedStatusOptions = statusOptions || [
    { value: "all", label: t.filterStatusAll },
    { value: "Ongoing", label: t.chartOngoing },
    { value: "Completed", label: t.chartCompleted },
  ];

  const resolvedSortOptions = sortOptions || [
    { value: "newest", label: t.sortNewest },
    { value: "oldest", label: t.sortOldest },
    { value: "amount_high", label: t.sortAmountHigh },
    { value: "amount_low", label: t.sortAmountLow },
    { value: "name", label: t.sortName },
  ];

  return (
    <div className="space-y-3">
      <div
        className={`grid grid-cols-1 gap-3 ${
          showListFilters
            ? "sm:grid-cols-2 xl:grid-cols-4"
            : "sm:grid-cols-2"
        }`}
      >
        <div className="min-w-0">
          <label className="block text-xs font-bold text-[var(--dash-text-70)] mb-1">
            {t.gp}
          </label>
          <select
            value={gramPanchayat}
            onChange={(e) => onGpChange(e.target.value)}
            className={selectClass}
          >
            <option value="">{t.selectGp}</option>
            {gramPanchayats.map((gp) => (
              <option key={gp.name} value={gp.name}>
                {lang === "kn" ? gp.nameKn : gp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label className="block text-xs font-bold text-[var(--dash-text-70)] mb-1">
            {t.village}
          </label>
          <select
            value={village}
            onChange={(e) => onVillageChange(e.target.value)}
            disabled={!gramPanchayat}
            className={selectClass}
          >
            <option value="">{t.selectVillage}</option>
            {villages.map((v) => (
              <option key={v.name} value={v.name}>
                {lang === "kn" ? v.nameKn : v.name}
              </option>
            ))}
          </select>
        </div>

        {showListFilters ? (
          <>
            <div className="min-w-0">
              <label className="block text-xs font-bold text-[var(--dash-text-70)] mb-1">
                {t.filterStatus}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className={selectClass}
              >
                {resolvedStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-bold text-[var(--dash-text-70)] mb-1">
                {t.sortBy}
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className={selectClass}
              >
                {resolvedSortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : null}
      </div>

      {hasSelection && onClear ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--dash-accent)] hover:text-[var(--dash-heading)] transition-colors"
          >
            <FaUndo className="text-[10px]" />
            {t.clearFilters}
          </button>
        </div>
      ) : null}
    </div>
  );
}
