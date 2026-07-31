"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function BedkeTabs({ value, onChange, civilCount = 0, personalCount = 0 }) {
  const { t } = useLanguage();

  const tabs = [
    { id: "civil", label: t.bedkeTabCivil, count: civilCount },
    { id: "personal", label: t.bedkeTabPersonal, count: personalCount },
  ];

  return (
    <div className="flex gap-2 p-1 rounded-xl bg-[var(--dash-bg)] border border-[#CCBCA5]/20 w-full sm:w-auto">
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition-colors ${
              active
                ? "bg-[#CCBCA5] text-[#1e2223]"
                : "text-[var(--dash-text-60)] hover:text-[#CCBCA5]"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 ${active ? "text-[#1e2223]/70" : "text-[var(--dash-text-30)]"}`}>
              ({tab.count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
