"use client";

import React from "react";

/**
 * Kudligi constituency seal loader — kolam orbit + MLA seal (not a generic spinner).
 * variant: "full" | "overlay" | "inline" | "block"
 */
export default function KudligiLoader({
  variant = "full",
  labelKn = "ಕೂಡ್ಲಿಗಿ",
  labelEn = "Kudligi",
  subKn = "ಸಿದ್ಧವಾಗುತ್ತಿದೆ…",
  subEn = "Preparing…",
  showBilingual = true,
  className = "",
}) {
  const shell =
    variant === "full"
      ? "min-h-screen w-full flex items-center justify-center bg-[var(--dash-bg,#1e2223)]"
      : variant === "overlay"
        ? "fixed inset-0 z-[200] flex items-center justify-center bg-[var(--dash-overlay,rgba(0,0,0,0.65))] backdrop-blur-sm"
        : variant === "block"
          ? "w-full flex items-center justify-center py-14 sm:py-20"
          : "inline-flex items-center justify-center";

  const size = variant === "inline" ? "w-14 h-14" : "w-28 h-28 sm:w-32 sm:h-32";

  return (
    <div
      className={`${shell} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-theme="dark"
    >
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <div className={`relative ${size}`}>
          {/* Outer kolam petals — slow reverse spin */}
          <svg
            className="absolute inset-[-18%] kudligi-loader-kolam text-[#CCBCA5]"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              const x1 = 50 + Math.cos(a) * 38;
              const y1 = 50 + Math.sin(a) * 38;
              const x2 = 50 + Math.cos(a) * 46;
              const y2 = 50 + Math.sin(a) * 46;
              return (
                <g key={i}>
                  <circle cx={x2} cy={y2} r="2.2" fill="currentColor" opacity="0.55" />
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    strokeWidth="1.2"
                    opacity="0.35"
                  />
                </g>
              );
            })}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="2 4"
              opacity="0.4"
            />
          </svg>

          {/* Constituency orbit ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-[#CCBCA5]/35 kudligi-loader-orbit"
            aria-hidden
          />
          <div
            className="absolute inset-[6%] rounded-full border border-dashed border-[#CCBCA5]/50 kudligi-loader-orbit-rev"
            aria-hidden
          />

          {/* Orbiting map pin */}
          <div className="absolute inset-0 kudligi-loader-pin" aria-hidden>
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1">
              <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                <path
                  d="M7 0C3.13 0 0 3.05 0 6.8c0 4.05 7 11.2 7 11.2s7-7.15 7-11.2C14 3.05 10.87 0 7 0z"
                  fill="#CCBCA5"
                />
                <circle cx="7" cy="6.5" r="2.2" fill="#1e2223" />
              </svg>
            </span>
          </div>

          {/* MLA seal */}
          <div className="absolute inset-[14%] rounded-full overflow-hidden border-2 border-[#CCBCA5]/70 shadow-[0_0_24px_rgba(204,188,165,0.35)] kudligi-loader-seal bg-[#282c2d]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mla_official_circle_logo.jpg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {variant !== "inline" ? (
          <div className="space-y-1.5 max-w-[16rem]">
            <p className="font-[family-name:var(--land-font-display)] text-xl sm:text-2xl font-bold tracking-wide text-[#CCBCA5]">
              {labelKn}
            </p>
            {showBilingual ? (
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/45">
                {labelEn}
              </p>
            ) : null}
            <p className="text-sm text-white/55 font-medium kudligi-loader-pulse">
              {subKn}
              {showBilingual ? (
                <span className="text-white/35"> · {subEn}</span>
              ) : null}
            </p>
          </div>
        ) : null}

        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
