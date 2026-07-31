"use client";

import React, { useMemo } from "react";
import {
  FaHardHat,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

function formatInrShort(amount) {
  const n = Number(amount) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Simple overview cards — shown when no GP/village selected */
export default function DevelopmentCharts({ rows }) {
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const list = rows || [];
    let ongoing = 0;
    let completed = 0;
    let totalAmount = 0;
    list.forEach((r) => {
      totalAmount += Number(r.amountSanctioned) || 0;
      if (r.status === "Completed" || r.statusKn === "ಪೂರ್ಣಗೊಂಡಿದೆ") {
        completed += 1;
      } else {
        ongoing += 1;
      }
    });
    return {
      total: list.length,
      totalAmount,
      ongoing,
      completed,
    };
  }, [rows]);

  if (!rows?.length) {
    return (
      <div className="mb-5 rounded-2xl border border-dashed border-[#CCBCA5]/35 bg-[var(--dash-panel-soft)] backdrop-blur-sm px-6 py-10 text-center text-[var(--dash-text-50)] text-sm">
        {t.noRows}
      </div>
    );
  }

  const cards = [
    {
      label: t.chartTotalWorks,
      value: String(stats.total),
      Icon: FaHardHat,
    },
    {
      label: t.chartTotalAmount,
      value: formatInrShort(stats.totalAmount),
      Icon: FaRupeeSign,
    },
    {
      label: t.chartOngoing,
      value: String(stats.ongoing),
      Icon: FaClock,
    },
    {
      label: t.chartCompleted,
      value: String(stats.completed),
      Icon: FaCheckCircle,
    },
  ];

  return (
    <div className="mb-5 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5]">
        {t.chartsTitle}
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl bg-[var(--dash-panel)]/85 backdrop-blur-sm border border-[#CCBCA5]/25 p-4 sm:p-5 shadow-lg flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#CCBCA5]/15 border border-[#CCBCA5]/30 flex items-center justify-center shrink-0 text-[#CCBCA5]">
                <Icon className="text-base" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1.5">
                  {card.label}
                </p>
                <p className="text-xl sm:text-2xl font-black text-[var(--dash-text)] truncate">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
