"use client";

import React from "react";
import { FaPlus, FaRupeeSign } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getCoverImage } from "@/lib/media";

function formatInr(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function DevelopmentTable({ rows, onOpen, onAdd }) {
  const { lang, t } = useLanguage();

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#CCBCA5]/40 bg-[var(--dash-panel-soft)] backdrop-blur-sm px-6 py-14 text-center space-y-4">
        <p className="text-[var(--dash-text-50)]">{t.noRows}</p>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8] transition-colors"
          >
            <FaPlus className="text-xs" />
            {t.emptyAddCta}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {rows.map((row) => {
        const title =
          lang === "kn" && row.nameKn ? row.nameKn : row.name;
        const scheme =
          lang === "kn" && row.yojaneKn ? row.yojaneKn : row.yojane;
        const description =
          lang === "kn" && row.descriptionKn
            ? row.descriptionKn
            : row.description || "";
        const cover = getCoverImage(row);

        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onOpen(row)}
            className="group w-full text-left overflow-hidden rounded-2xl border border-[#CCBCA5]/25 bg-[var(--dash-panel)] shadow-lg hover:border-[#CCBCA5]/60 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCBCA5]"
          >
            <div className="flex flex-row items-stretch">
              {/* Square clear image */}
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 shrink-0 bg-[var(--dash-bg)]">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--dash-text-25)] text-xs px-2 text-center">
                    {t.colImages}
                  </div>
                )}
              </div>

              {/* Side information */}
              <div className="flex-1 min-w-0 p-3.5 sm:p-5 flex flex-col justify-center gap-2">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] line-clamp-1">
                  {scheme}
                </p>
                <h3 className="text-sm sm:text-lg font-black text-[var(--dash-text)] leading-snug line-clamp-2 group-hover:text-[#CCBCA5] transition-colors">
                  {title}
                </h3>
                {description ? (
                  <p className="text-[11px] sm:text-sm text-[var(--dash-text-55)] leading-relaxed line-clamp-3">
                    {description}
                  </p>
                ) : null}
                <p className="text-base sm:text-xl font-black text-[var(--dash-text)] flex items-center gap-1.5 mt-1">
                  <FaRupeeSign className="text-[#CCBCA5] text-xs sm:text-sm shrink-0" />
                  <span>
                    {formatInr(row.amountSanctioned).replace("₹", "").trim()}
                  </span>
                </p>
                <p className="text-[10px] text-[var(--dash-text-30)] mt-auto pt-1">
                  {t.viewDetails} →
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
