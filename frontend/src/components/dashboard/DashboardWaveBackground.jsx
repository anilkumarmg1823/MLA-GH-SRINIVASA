"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

/** Minimal ambient backdrop with INC logo pencil sketch watermark — theme-aware */
export default function DashboardWaveBackground() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[var(--dash-bg)] transition-colors duration-300" />

      {/* Ambient Radial Gradients */}
      <div
        className="absolute -top-24 -left-16 h-[420px] w-[420px] rounded-full"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(180,83,9,0.08) 0%, transparent 68%)"
            : "radial-gradient(circle, rgba(204,188,165,0.07) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -bottom-32 -right-20 h-[480px] w-[480px] rounded-full"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(2,132,199,0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(54,122,241,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Centered INC Logo Pencil Sketch Watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative w-[340px] sm:w-[460px] md:w-[560px] aspect-square transition-all duration-300"
          style={{
            filter: isLight
              ? "grayscale(100%) contrast(160%) brightness(0.9)"
              : "grayscale(100%) contrast(150%) brightness(1.2) invert(1)",
            opacity: isLight ? 0.05 : 0.035,
          }}
        >
          <Image
            src="/party_logo_v2.png"
            alt="INC Logo Watermark"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Subtle Noise Overlay */}
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
