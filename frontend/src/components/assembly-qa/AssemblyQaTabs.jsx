"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function AssemblyQaTabs({
  value,
  onChange,
  mlaCount = 0,
  otherCount = 0,
}) {
  const { t } = useLanguage();

  const tabs = [
    { id: "all", label: t.aqTabAll, count: mlaCount + otherCount },
    { id: "mla", label: t.aqTabMla, count: mlaCount },
    { id: "other", label: t.aqTabOther, count: otherCount },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 bg-[var(--dash-bg)] p-1 rounded-xl border border-[#CCBCA5]/20">
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`py-2.5 px-2 rounded-lg text-[11px] sm:text-xs font-black transition-all leading-tight ${
              active
                ? "bg-[#CCBCA5] text-[#1e2223]"
                : "text-[var(--dash-text-55)] hover:text-[var(--dash-text)]"
            }`}
          >
            <span className="block">{tab.label}</span>
            <span
              className={`block mt-0.5 tabular-nums ${
                active ? "text-[#1e2223]/70" : "text-[var(--dash-text-30)]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
