"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

/** Minimal ambient backdrop — theme-aware */
export default function DashboardWaveBackground() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[var(--dash-bg)]" />

      <div
        className="absolute -top-24 -left-16 h-[420px] w-[420px] rounded-full"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(154,133,104,0.14) 0%, transparent 68%)"
            : "radial-gradient(circle, rgba(204,188,165,0.07) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -bottom-32 -right-20 h-[480px] w-[480px] rounded-full"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(54,122,241,0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(54,122,241,0.05) 0%, transparent 70%)",
        }}
      />

      <div
        className={`absolute inset-0 ${isLight ? "opacity-[0.02]" : "opacity-[0.035]"}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
