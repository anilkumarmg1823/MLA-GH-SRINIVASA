"use client";

import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaRupeeSign, FaTimes, FaVideo } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getGpLabel, getVillageLabel } from "@/data/gramPanchayats";
import { getRecordMedia } from "@/lib/media";
import { useEscapeKey } from "@/hooks/useEscapeKey";

function formatInr(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

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

function InfoBlock({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
        {label}
      </p>
      <div className="text-[var(--dash-text)]/85 text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default function DevelopmentDetailModal({
  open,
  record,
  onClose,
  onEdit,
  onDelete,
}) {
  const { lang, t } = useLanguage();
  const [activeImage, setActiveImage] = useState(0);

  useEscapeKey(open, onClose);

  useEffect(() => {
    setActiveImage(0);
  }, [record?.id, open]);

  if (!open || !record) return null;

  const title =
    lang === "kn" && record.nameKn ? record.nameKn : record.name;
  const scheme =
    lang === "kn" && record.yojaneKn ? record.yojaneKn : record.yojane;
  const description =
    lang === "kn" && record.descriptionKn
      ? record.descriptionKn
      : record.description || "";
  const details =
    lang === "kn" && record.detailsKn
      ? record.detailsKn
      : record.details || "";
  const status =
    lang === "kn" && record.statusKn ? record.statusKn : record.status || "—";
  const beneficiaries =
    lang === "kn" && record.beneficiariesKn
      ? record.beneficiariesKn
      : record.beneficiaries || "—";
  const department =
    lang === "kn" && record.departmentKn
      ? record.departmentKn
      : record.department || "—";
  const locationNote =
    lang === "kn" && record.locationNoteKn
      ? record.locationNoteKn
      : record.locationNote || "—";
  const images = record.images || [];
  const media = getRecordMedia(record);
  const active = media[activeImage] || media[0] || null;
  const isOngoing =
    record.status === "Ongoing" || record.statusKn === "ಚಾಲ್ತಿಯಲ್ಲಿದೆ";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[var(--dash-overlay)] backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-5xl bg-[var(--dash-panel)] border border-[#CCBCA5]/30 rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#CCBCA5]/20 shrink-0 bg-gradient-to-r from-[#CCBCA5]/25 to-transparent">
          <h2 className="text-base sm:text-lg font-black text-[var(--dash-text)] truncate pr-3">
            {t.detailsTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--dash-text-60)] hover:bg-[var(--dash-hover-strong)] hover:text-[var(--dash-text)] shrink-0"
            aria-label={t.close}
          >
            <FaTimes />
          </button>
        </div>

        {/* Landscape body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:min-h-[420px]">
            {/* Left — media */}
            <div className="md:w-[46%] lg:w-[48%] shrink-0 bg-[var(--dash-bg)] p-4 sm:p-5 flex flex-col gap-3 border-b md:border-b-0 md:border-r border-[#CCBCA5]/15">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-[#CCBCA5]/20">
                {active?.type === "video" ? (
                  <video
                    key={active.url}
                    src={active.url}
                    controls
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                  />
                ) : active?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={active.url}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--dash-text-30)] text-sm">
                    {t.colMedia}
                  </div>
                )}
                <span
                  className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full ${
                    isOngoing
                      ? "bg-amber-500/90 text-black"
                      : "bg-emerald-500/90 text-[var(--dash-text)]"
                  }`}
                >
                  {status}
                </span>
              </div>
              {media.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {media.map((m, i) => (
                    <button
                      key={m.id || `${record.id}-thumb-${i}`}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 ${
                        activeImage === i
                          ? "border-[#CCBCA5]"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      {m.type === "video" ? (
                        <div className="w-full h-full bg-[#CCBCA5]/20 flex items-center justify-center text-[#CCBCA5]">
                          <FaVideo />
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — information */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 min-w-0">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
                  {scheme}
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-[var(--dash-text)] leading-snug">
                  {title}
                </h3>
                <p className="text-sm text-[#CCBCA5] mt-1.5">
                  {getGpLabel(record.gramPanchayat, lang)} ·{" "}
                  {getVillageLabel(
                    record.gramPanchayat,
                    record.village,
                    lang
                  )}
                </p>
              </div>

              {description ? (
                <InfoBlock label={t.colDescription}>
                  <p>{description}</p>
                </InfoBlock>
              ) : null}

              {details ? (
                <InfoBlock label={t.colMoreDetails}>
                  <p className="text-[var(--dash-text-60)]">{details}</p>
                </InfoBlock>
              ) : null}

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <InfoBlock label={t.colAmount}>
                  <p className="text-lg sm:text-xl font-black text-[var(--dash-text)] flex items-center gap-1.5">
                    <FaRupeeSign className="text-[#CCBCA5] text-sm" />
                    {formatInr(record.amountSanctioned)
                      .replace("₹", "")
                      .trim()}
                  </p>
                </InfoBlock>
                <InfoBlock label={t.colStatus}>
                  <p className="font-semibold text-[var(--dash-text)]">{status}</p>
                </InfoBlock>
                <InfoBlock label={t.colBeneficiaries}>
                  <p>{beneficiaries}</p>
                </InfoBlock>
                <InfoBlock label={t.colDepartment}>
                  <p>{department}</p>
                </InfoBlock>
                <InfoBlock label={t.colStartDate}>
                  <p>{formatDate(record.startDate, lang)}</p>
                </InfoBlock>
                <InfoBlock label={t.colLocation}>
                  <p>{locationNote}</p>
                </InfoBlock>
              </div>

              <div className="flex flex-wrap gap-3 pt-3 mt-auto border-t border-[#CCBCA5]/20">
                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(record)}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#CCBCA5] text-[#1e2223] font-black text-sm hover:bg-[#d9cbb8] transition-colors"
                  >
                    <FaEdit />
                    {t.edit}
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(record)}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-red-500/15 text-red-400 border border-red-400/40 font-black text-sm hover:bg-red-500 hover:text-[var(--dash-text)] transition-colors"
                  >
                    <FaTrashAlt />
                    {t.delete}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
