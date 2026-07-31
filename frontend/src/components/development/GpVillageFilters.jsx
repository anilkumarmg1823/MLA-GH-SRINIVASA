"use client";

import React from "react";
import { FaUndo } from "react-icons/fa";
import { gramPanchayats, getVillagesForGp } from "@/data/gramPanchayats";
import { useLanguage } from "@/context/LanguageContext";

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
}) {
  const { lang, t } = useLanguage();
  const villages = gramPanchayat ? getVillagesForGp(gramPanchayat) : [];
  const hasSelection = Boolean(gramPanchayat || village);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#CCBCA5] mb-1.5">
            {t.gp}
          </label>
          <select
            value={gramPanchayat}
            onChange={(e) => onGpChange(e.target.value)}
            className="w-full rounded-lg border border-[#CCBCA5]/30 bg-[var(--dash-bg)]/90 px-3 py-2.5 text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20"
          >
            <option value="">{t.selectGp}</option>
            {gramPanchayats.map((gp) => (
              <option key={gp.name} value={gp.name}>
                {lang === "kn" ? gp.nameKn : gp.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#CCBCA5] mb-1.5">
            {t.village}
          </label>
          <select
            value={village}
            onChange={(e) => onVillageChange(e.target.value)}
            disabled={!gramPanchayat}
            className="w-full rounded-lg border border-[#CCBCA5]/30 bg-[var(--dash-bg)]/90 px-3 py-2.5 text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20 disabled:opacity-40"
          >
            <option value="">{t.selectVillage}</option>
            {villages.map((v) => (
              <option key={v.name} value={v.name}>
                {lang === "kn" ? v.nameKn : v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showExtraFilters && gramPanchayat && village && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-[#CCBCA5]/15">
          <div>
            <label className="block text-sm font-medium text-[#CCBCA5] mb-1.5">
              {t.filterStatus}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full rounded-lg border border-[#CCBCA5]/30 bg-[var(--dash-bg)]/90 px-3 py-2.5 text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20"
            >
              <option value="all">{t.filterStatusAll}</option>
              <option value="Ongoing">{t.chartOngoing}</option>
              <option value="Completed">{t.chartCompleted}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#CCBCA5] mb-1.5">
              {t.sortBy}
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full rounded-lg border border-[#CCBCA5]/30 bg-[var(--dash-bg)]/90 px-3 py-2.5 text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
              <option value="amount_high">{t.sortAmountHigh}</option>
              <option value="amount_low">{t.sortAmountLow}</option>
              <option value="name">{t.sortName}</option>
            </select>
          </div>
        </div>
      )}

      {hasSelection && onClear && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#CCBCA5] hover:text-[var(--dash-text)] transition-colors"
          >
            <FaUndo className="text-[10px]" />
            {t.clearFilters}
          </button>
        </div>
      )}
    </div>
  );
}
