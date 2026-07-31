"use client";

import React from "react";
import MediaImage from "./MediaImage";
import { brandStyleVars } from "@/lib/landingContentStore";

/** Compact sidebar preview for landing CMS edits */
export default function LandingCmsPreview({ content, lang = "kn" }) {
  const brand = content?.brand || {};
  const site = content?.site || {};
  const copy = content?.copy?.[lang] || content?.copy?.en || {};
  const slide = content?.hero?.slides?.[0] || {};
  const vars = brandStyleVars(brand);

  const slogan1 = lang === "kn" ? slide.slogan1Kn : slide.slogan1En;
  const slogan2 = lang === "kn" ? slide.slogan2Kn : slide.slogan2En;

  return (
    <div
      className="rounded-xl overflow-hidden border border-[#CCBCA5]/30 bg-[var(--dash-panel)]"
      style={vars}
    >
      <div className="px-2.5 py-1.5 border-b border-[#CCBCA5]/20 flex items-center justify-between gap-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#CCBCA5]">
          Preview
        </span>
        <span className="text-[9px] font-bold text-[var(--dash-text-40)]">
          Live
        </span>
      </div>

      {/* Mini header */}
      <div
        className="px-2.5 py-2 flex items-center gap-1.5 border-b-[3px]"
        style={{
          background: `linear-gradient(90deg, ${brand.blueDeep}, ${brand.blueBright})`,
          borderColor: brand.gold,
        }}
      >
        <div className="relative w-6 h-6 shrink-0">
          <MediaImage
            src={site.partyLogo || site.karnatakaLogo}
            alt=""
            fill
            className="object-contain"
            sizes="24px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-[9px] font-black tracking-wide truncate leading-tight">
            {copy.navbarTitle || site.nameEn}
          </p>
          <p
            className="text-[8px] font-black uppercase tracking-wider truncate"
            style={{ color: brand.gold }}
          >
            {site.taglineEn}
          </p>
        </div>
      </div>

      {/* Mini hero */}
      <div
        className="relative p-2.5 min-h-[110px] flex gap-2"
        style={{
          background: `linear-gradient(135deg, ${brand.blueDeep}, ${brand.blueBright})`,
        }}
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          <p
            className="text-[8px] font-black line-clamp-1"
            style={{ color: brand.gold }}
          >
            {lang === "kn" ? slide.badgeTitleKn : slide.badgeTitleEn}
          </p>
          <p className="text-white text-[10px] font-black leading-snug line-clamp-3">
            {slogan1}
            {slogan2 ? (
              <span style={{ color: brand.gold }}> • {slogan2}</span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {[copy.navHome, copy.navAbout, copy.navDevelopments]
              .filter(Boolean)
              .slice(0, 3)
              .map((label) => (
                <span
                  key={label}
                  className="text-[8px] font-black px-1.5 py-0.5 rounded-full text-white/85"
                  style={{ background: `${brand.blueDeep}aa` }}
                >
                  {label}
                </span>
              ))}
          </div>
        </div>
        <div className="relative w-12 shrink-0 self-end">
          <div className="relative w-full aspect-[3/4]">
            <MediaImage
              src={slide.mlaImage || site.mlaPortrait}
              alt=""
              fill
              className="object-contain object-bottom"
              sizes="48px"
            />
          </div>
        </div>
      </div>

      {/* Theme chips */}
      <div className="flex flex-wrap gap-1 px-2.5 py-2">
        {[brand.blueDeep, brand.blueBright, brand.gold, brand.link].map((c) => (
          <span
            key={c}
            className="w-4 h-4 rounded-full border border-white/25"
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}
