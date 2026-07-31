"use client";

import React, { useState, useEffect } from "react";
import { FaTimes, FaFileExcel, FaFilePdf } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { gramPanchayats, getGpLabel, getVillageLabel } from "@/data/gramPanchayats";
import {
  getAllDevelopments,
  getDevelopmentsForGp,
  getDevelopmentsForVillage,
} from "@/lib/developmentsStore";
import {
  downloadDevelopmentsExcel,
  downloadDevelopmentsPdf,
} from "@/lib/exportDevelopments";
import { useEscapeKey } from "@/hooks/useEscapeKey";

function formatInr(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function inDateRange(row, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return true;
  const d = row.startDate || (row.updatedAt || "").slice(0, 10);
  if (!d) return !dateFrom && !dateTo;
  if (dateFrom && d < dateFrom) return false;
  if (dateTo && d > dateTo) return false;
  return true;
}

export default function DownloadModal({
  open,
  onClose,
  currentGp,
  currentVillage,
}) {
  const { lang, t } = useLanguage();
  const [scope, setScope] = useState("village");
  const [format, setFormat] = useState("excel");
  const [gp, setGp] = useState(currentGp || "");
  const [village, setVillage] = useState(currentVillage || "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    setGp(currentGp || "");
    setVillage(currentVillage || "");
    setDateFrom("");
    setDateTo("");
    if (currentGp && currentVillage) setScope("village");
    else if (currentGp) setScope("gp");
    else setScope("all");
  }, [open, currentGp, currentVillage]);

  const villages = gramPanchayats.find((g) => g.name === gp)?.villages || [];

  const [previewRows, setPreviewRows] = useState([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      let rows = [];
      if (scope === "all") rows = await getAllDevelopments();
      else if (scope === "gp") {
        if (!gp) {
          if (!cancelled) setPreviewRows([]);
          return;
        }
        rows = await getDevelopmentsForGp(gp);
      } else {
        if (!gp || !village) {
          if (!cancelled) setPreviewRows([]);
          return;
        }
        rows = await getDevelopmentsForVillage(gp, village);
      }
      const filtered = rows.filter((r) => inDateRange(r, dateFrom, dateTo));
      if (!cancelled) setPreviewRows(filtered);
    })();
    return () => {
      cancelled = true;
    };
  }, [scope, gp, village, dateFrom, dateTo, open]);

  const totalAmount = previewRows.reduce(
    (sum, r) => sum + (Number(r.amountSanctioned) || 0),
    0
  );

  if (!open) return null;

  const handleDownload = () => {
    if (!previewRows.length) return;
    let label = "all";
    if (scope === "gp") label = gp;
    if (scope === "village") label = `${gp}-${village}`;
    if (dateFrom || dateTo) {
      label += `_${dateFrom || "start"}-to-${dateTo || "end"}`;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "excel") {
      downloadDevelopmentsExcel(
        previewRows,
        lang,
        `developments-${label}-${stamp}.csv`
      );
    } else {
      const title =
        lang === "kn"
          ? `ಕಾಮಗಾರಿ ವರದಿ — ${label}`
          : `Development Report — ${label}`;
      downloadDevelopmentsPdf(previewRows, lang, title);
    }
    onClose();
  };

  const selectClass =
    "w-full rounded-xl border border-[#CCBCA5]/35 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20";

  const canDownload =
    previewRows.length > 0 &&
    (scope === "all" ||
      (scope === "gp" && gp) ||
      (scope === "village" && gp && village));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[var(--dash-overlay)] backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-5xl bg-[var(--dash-panel)] border-2 border-[#CCBCA5]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-gradient-to-r from-[#CCBCA5] via-[#d4c4ad] to-[#b8a890] shrink-0">
          <h2 className="font-black text-[#1e2223] text-base sm:text-lg">
            {t.downloadTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#1e2223]/70 hover:bg-black/10"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          <div className="md:w-[360px] shrink-0 p-5 border-b md:border-b-0 md:border-r border-[#CCBCA5]/20 space-y-3.5 bg-[var(--dash-bg)]/50 overflow-y-auto">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1.5">
                {t.downloadScope}
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className={selectClass}
              >
                <option value="all">{t.scopeAll}</option>
                <option value="gp">{t.scopeGp}</option>
                <option value="village">{t.scopeVillage}</option>
              </select>
            </div>

            {(scope === "gp" || scope === "village") && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1.5">
                  {t.gp}
                </label>
                <select
                  value={gp}
                  onChange={(e) => {
                    setGp(e.target.value);
                    setVillage("");
                  }}
                  className={selectClass}
                >
                  <option value="">{t.selectGp}</option>
                  {gramPanchayats.map((g) => (
                    <option key={g.name} value={g.name}>
                      {lang === "kn" ? g.nameKn : g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scope === "village" && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1.5">
                  {t.village}
                </label>
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  disabled={!gp}
                  className={`${selectClass} disabled:opacity-40`}
                >
                  <option value="">{t.selectVillage}</option>
                  {villages.map((v) => (
                    <option key={v.name} value={v.name}>
                      {lang === "kn" ? v.nameKn : v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date range */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1.5">
                {t.dateRange}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-[var(--dash-text-40)] mb-1">{t.dateFrom}</p>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={selectClass}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--dash-text-40)] mb-1">{t.dateTo}</p>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={selectClass}
                  />
                </div>
              </div>
              <p className="text-[10px] text-[var(--dash-text-30)] mt-1.5">{t.dateHint}</p>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-2">
                {t.downloadFormat}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormat("excel")}
                  className={`flex-1 py-2.5 rounded-full text-xs font-black border-2 inline-flex items-center justify-center gap-1.5 transition-colors ${
                    format === "excel"
                      ? "bg-[#CCBCA5] border-[#CCBCA5] text-[#1e2223]"
                      : "border-[#CCBCA5]/40 text-[#CCBCA5]"
                  }`}
                >
                  <FaFileExcel /> Excel
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("pdf")}
                  className={`flex-1 py-2.5 rounded-full text-xs font-black border-2 inline-flex items-center justify-center gap-1.5 transition-colors ${
                    format === "pdf"
                      ? "bg-[#CCBCA5] border-[#CCBCA5] text-[#1e2223]"
                      : "border-[#CCBCA5]/40 text-[#CCBCA5]"
                  }`}
                >
                  <FaFilePdf /> PDF
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--dash-panel)] border border-[#CCBCA5]/25 p-3 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5]">
                {t.previewSummary}
              </p>
              <p className="text-[var(--dash-text)] font-black text-lg">
                {previewRows.length}{" "}
                <span className="text-sm font-semibold text-[var(--dash-text-50)]">
                  {t.previewRecords}
                </span>
              </p>
              <p className="text-[#CCBCA5] text-sm font-bold">
                {formatInr(totalAmount)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!canDownload}
              className="w-full py-3 rounded-full bg-[#CCBCA5] text-[#1e2223] font-black text-sm hover:bg-[#d9cbb8] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t.downloadNow}
            </button>
          </div>

          <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col min-h-[280px]">
            <div className="flex items-center justify-between mb-3 gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5]">
                {t.previewTitle}
              </p>
              <p className="text-xs text-[var(--dash-text-40)] truncate">
                {scope === "all"
                  ? t.scopeAll
                  : scope === "gp" && gp
                    ? getGpLabel(gp, lang)
                    : scope === "village" && gp && village
                      ? `${getGpLabel(gp, lang)} · ${getVillageLabel(gp, village, lang)}`
                      : "—"}
                {(dateFrom || dateTo) &&
                  ` · ${dateFrom || "…"} → ${dateTo || "…"}`}
              </p>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-[#CCBCA5]/20 bg-[var(--dash-input)]">
              {previewRows.length === 0 ? (
                <div className="h-full min-h-[200px] flex items-center justify-center text-[var(--dash-text-40)] text-sm px-4 text-center">
                  {t.previewEmpty}
                </div>
              ) : (
                <table className="min-w-full text-left text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-[#CCBCA5] text-[#1e2223]">
                    <tr>
                      <th className="px-3 py-2.5 font-black whitespace-nowrap">
                        {t.colName}
                      </th>
                      <th className="px-3 py-2.5 font-black whitespace-nowrap">
                        {t.colStartDate}
                      </th>
                      <th className="px-3 py-2.5 font-black whitespace-nowrap">
                        {t.gp}
                      </th>
                      <th className="px-3 py-2.5 font-black whitespace-nowrap">
                        {t.colAmount}
                      </th>
                      <th className="px-3 py-2.5 font-black whitespace-nowrap">
                        {t.colStatus}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-[#CCBCA5]/10 hover:bg-[var(--dash-hover)]"
                      >
                        <td className="px-3 py-2.5 text-[var(--dash-text)] font-semibold max-w-[180px]">
                          <span className="line-clamp-2">
                            {lang === "kn" && row.nameKn
                              ? row.nameKn
                              : row.name}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[var(--dash-text-70)] whitespace-nowrap">
                          {row.startDate || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-[var(--dash-text-70)] whitespace-nowrap">
                          {getGpLabel(row.gramPanchayat, lang)}
                        </td>
                        <td className="px-3 py-2.5 text-[#CCBCA5] font-bold whitespace-nowrap">
                          {formatInr(row.amountSanctioned)}
                        </td>
                        <td className="px-3 py-2.5 text-[var(--dash-text-70)] whitespace-nowrap">
                          {lang === "kn" && row.statusKn
                            ? row.statusKn
                            : row.status || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
