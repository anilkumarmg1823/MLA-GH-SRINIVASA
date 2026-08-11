"use client";

import React, { useState } from "react";
import { TextInput, TextArea, ColorField, BiText } from "./Field";
import MediaUpload from "./MediaUpload";
import { LANDING_THEME_PRESETS } from "@/data/landingThemePresets";
import {
  applyLandingThemePreset,
  LANDING_FONT_OPTIONS,
} from "@/lib/landingContentStore";

const BRAND_COLOR_KEYS = [
  "blueDeep",
  "blue",
  "blueMid",
  "blueAlt",
  "blueBright",
  "blueLight",
  "gold",
  "footerAccent",
  "link",
  "surface",
  "bg",
  "footerBg",
];

const TABS = [
  { id: "brand", label: "Brand" },
  { id: "header", label: "Header" },
  { id: "hero", label: "Hero" },
  { id: "stats", label: "Stats" },
  { id: "about", label: "About" },
  { id: "developments", label: "Developments" },
  { id: "tour", label: "Tour" },
  { id: "gallery", label: "Gallery" },
  { id: "grievance", label: "Grievance" },
  { id: "footer", label: "Footer" },
];

const BRAND_LABELS = {
  blueDeep: "Blue Deep",
  blue: "Blue",
  blueMid: "Blue Mid",
  blueAlt: "Blue Alt",
  blueBright: "Blue Bright",
  blueLight: "Blue Light",
  gold: "Gold",
  footerAccent: "Footer Accent",
  link: "Link",
  surface: "Surface",
  bg: "Background",
  footerBg: "Footer Background",
};

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function moveItem(arr, index, dir) {
  const next = [...arr];
  const j = index + dir;
  if (j < 0 || j >= next.length) return arr;
  [next[index], next[j]] = [next[j], next[index]];
  return next;
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#CCBCA5]/25 bg-[var(--dash-panel)] p-4 sm:p-5 space-y-4">
      {title ? (
        <h3 className="text-sm font-black uppercase tracking-wider text-[#CCBCA5]">
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  );
}

function ListControls({ index, total, onUp, onDown, onRemove }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={index === 0}
        onClick={onUp}
        className="px-2.5 py-1 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-[10px] font-black disabled:opacity-30"
      >
        ↑ Up
      </button>
      <button
        type="button"
        disabled={index >= total - 1}
        onClick={onDown}
        className="px-2.5 py-1 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-[10px] font-black disabled:opacity-30"
      >
        ↓ Down
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="px-2.5 py-1 rounded-full border border-rose-400/50 text-rose-300 text-[10px] font-black"
      >
        Remove
      </button>
    </div>
  );
}

export default function LandingCmsEditor({
  value,
  onChange,
  activeTab: externalTab,
  onTabChange,
  stepTabs,
}) {
  const [internalTab, setInternalTab] = useState("brand");
  const tab = externalTab || internalTab;
  const setTab = (t) => {
    setInternalTab(t);
    if (onTabChange) onTabChange(t);
  };

  const v = value || {};
  const brand = v.brand || {};
  const site = v.site || {};
  const copy = v.copy || { en: {}, kn: {} };
  const en = copy.en || {};
  const kn = copy.kn || {};
  const hero = v.hero || { video: "", slides: [] };
  const stats = v.stats || {};
  const about = v.about || {};
  const media = v.media || {};
  const gallery = v.gallery || { items: [] };
  const grievance = v.grievance || { villages: [] };
  const contact = v.contact || {};
  const quickLinks = v.quickLinks || {};

  const update = (patch) => {
    if (!onChange) return;
    onChange({ ...v, ...patch });
  };

  const setBrand = (key, val) => {
    update({ brand: { ...brand, [key]: val } });
  };

  const setSite = (key, val) => {
    update({ site: { ...site, [key]: val } });
  };

  const setCopy = (langKey, field, val) => {
    update({
      copy: {
        ...copy,
        [langKey]: {
          ...(copy[langKey] || {}),
          [field]: val,
        },
      },
    });
  };

  const biCopy = (key, opts = {}) => (
    <BiText
      labelEn={opts.labelEn || `${key} (EN)`}
      labelKn={opts.labelKn || `${key} (KN)`}
      valueEn={en[key]}
      valueKn={kn[key]}
      onEn={(val) => setCopy("en", key, val)}
      onKn={(val) => setCopy("kn", key, val)}
      area={opts.area}
    />
  );

  const setValuesLines = (langKey, text) => {
    const lines = String(text || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setCopy(langKey, "values", lines);
  };

  const visibleTabs = stepTabs
    ? TABS.filter((t) => stepTabs.includes(t.id))
    : TABS;

  return (
    <div className="space-y-4 text-[var(--dash-text)]">
      <div className="sticky top-0 z-30 bg-[var(--dash-panel)]/95 backdrop-blur-md pb-2.5 pt-1 border-b border-[var(--dash-border-soft)] flex flex-wrap gap-1.5 overflow-x-auto">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
              tab === t.id
                ? "bg-[var(--dash-accent)] text-white shadow-md scale-105"
                : "border border-[var(--dash-border)] text-[var(--dash-text-70)] hover:bg-[var(--dash-hover)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "brand" ? (
        <div className="space-y-4">
          <Section title="Standard themes">
            <p className="text-xs text-[var(--dash-text-50)]">
              Pick a ready look. You can still fine-tune colors below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {LANDING_THEME_PRESETS.map((preset) => {
                const b = preset.brand;
                const active =
                  brand.blueDeep === b.blueDeep &&
                  brand.gold === b.gold &&
                  brand.blueBright === b.blueBright;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onChange(applyLandingThemePreset(v, preset.brand))
                    }
                    className={`text-left rounded-2xl border p-3 transition-all ${
                      active
                        ? "border-[#CCBCA5] bg-[#CCBCA5]/15 ring-2 ring-[#CCBCA5]/40"
                        : "border-[#CCBCA5]/25 hover:border-[#CCBCA5]/55 bg-[var(--dash-bg)]"
                    }`}
                  >
                    <div className="flex gap-1.5 mb-2">
                      {[b.blueDeep, b.blueBright, b.gold, b.link].map((c) => (
                        <span
                          key={`${preset.id}-${c}`}
                          className="w-6 h-6 rounded-full border border-white/20"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-black text-[var(--dash-text)]">
                      {preset.nameEn}
                    </p>
                    <p className="text-[10px] font-bold text-[var(--dash-text-40)] mt-0.5">
                      {active ? "Selected" : "Tap to apply"}
                    </p>
                  </button>
                );
              })}
            </div>
          </Section>
          <Section title="Fonts">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#CCBCA5] mb-1.5">
                  Display font (headings)
                </label>
                <select
                  value={brand.fontDisplay || "Noto Serif"}
                  onChange={(e) =>
                    onChange({
                      ...v,
                      brand: { ...brand, fontDisplay: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2 text-sm text-[var(--dash-text)]"
                >
                  {LANDING_FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#CCBCA5] mb-1.5">
                  Body font
                </label>
                <select
                  value={brand.fontBody || "Noto Sans"}
                  onChange={(e) =>
                    onChange({
                      ...v,
                      brand: { ...brand, fontBody: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2 text-sm text-[var(--dash-text)]"
                >
                  {LANDING_FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Section>
          <Section title="Brand colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BRAND_COLOR_KEYS.map((key) => (
                <ColorField
                  key={key}
                  label={BRAND_LABELS[key] || key}
                  value={brand[key]}
                  onChange={(val) =>
                    onChange({ ...v, brand: { ...brand, [key]: val } })
                  }
                />
              ))}
            </div>
          </Section>
        </div>
      ) : null}

      {tab === "header" ? (
        <div className="space-y-4">
          <Section title="Site media">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MediaUpload
                label="Karnataka logo"
                value={site.karnatakaLogo}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, karnatakaLogo: val } })
                }
              />
              <MediaUpload
                label="Party logo"
                value={site.partyLogo}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, partyLogo: val } })
                }
              />
              <MediaUpload
                label="CM photo"
                value={site.cmPhoto}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, cmPhoto: val } })
                }
              />
              <MediaUpload
                label="DCM photo"
                value={site.dcmPhoto}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, dcmPhoto: val } })
                }
              />
              <MediaUpload
                label="MLA circle logo (navbar)"
                value={site.mlaCircleLogo}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, mlaCircleLogo: val } })
                }
              />
              <MediaUpload
                label="MLA portrait"
                value={site.mlaPortrait}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, mlaPortrait: val } })
                }
              />
            </div>
          </Section>
          <Section title="Site names">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextInput
                label="Name (EN)"
                value={site.nameEn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, nameEn: val } })
                }
              />
              <TextInput
                label="Name (KN)"
                value={site.nameKn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, nameKn: val } })
                }
              />
              <TextInput
                label="Short name (EN)"
                value={site.nameShortEn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, nameShortEn: val } })
                }
              />
              <TextInput
                label="Short name (KN)"
                value={site.nameShortKn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, nameShortKn: val } })
                }
              />
              <TextInput
                label="Tagline (EN)"
                value={site.taglineEn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, taglineEn: val } })
                }
              />
              <TextInput
                label="Tagline (KN)"
                value={site.taglineKn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, taglineKn: val } })
                }
              />
              <TextInput
                label="CM name (EN)"
                value={site.cmNameEn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, cmNameEn: val } })
                }
              />
              <TextInput
                label="CM name (KN)"
                value={site.cmNameKn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, cmNameKn: val } })
                }
              />
              <TextInput
                label="CM title (EN)"
                value={site.cmTitleEn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, cmTitleEn: val } })
                }
              />
              <TextInput
                label="CM title (KN)"
                value={site.cmTitleKn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, cmTitleKn: val } })
                }
              />
              <TextInput
                label="DCM name (EN)"
                value={site.dcmNameEn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, dcmNameEn: val } })
                }
              />
              <TextInput
                label="DCM name (KN)"
                value={site.dcmNameKn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, dcmNameKn: val } })
                }
              />
              <TextInput
                label="DCM title (EN)"
                value={site.dcmTitleEn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, dcmTitleEn: val } })
                }
              />
              <TextInput
                label="DCM title (KN)"
                value={site.dcmTitleKn}
                onChange={(val) =>
                  onChange({ ...v, site: { ...site, dcmTitleKn: val } })
                }
              />
            </div>
          </Section>
          <Section title="Navbar copy">
            <div className="space-y-3">
              {biCopy("navbarTitle", { labelEn: "Navbar title (EN)", labelKn: "Navbar title (KN)" })}
              {biCopy("navHome")}
              {biCopy("navAbout")}
              {biCopy("navDevelopments")}
              {biCopy("navMedia")}
              {biCopy("navGallery")}
              {biCopy("navGrievance")}
              {biCopy("quickLinks")}
              {biCopy("medicalReferral")}
              {biCopy("photoGallery")}
              {biCopy("grievancesSuggestions")}
              {biCopy("sevaSindhu")}
              {biCopy("districtPortal")}
              {biCopy("login")}
            </div>
          </Section>
        </div>
      ) : null}

      {tab === "hero" ? (
        <div className="space-y-4">
          <Section title="Hero video & background">
            <MediaUpload
              label="Background video"
              value={hero.video}
              accept="video/*,image/*"
              onChange={(val) =>
                onChange({ ...v, hero: { ...hero, video: val } })
              }
            />
            <MediaUpload
              label="Background image (under / instead of video)"
              value={hero.backgroundImage || ""}
              onChange={(val) =>
                onChange({ ...v, hero: { ...hero, backgroundImage: val } })
              }
            />
            <TextInput
              label="Overlay opacity (0–1)"
              type="number"
              value={hero.overlayOpacity ?? 0.65}
              onChange={(val) =>
                onChange({
                  ...v,
                  hero: {
                    ...hero,
                    overlayOpacity: Math.min(
                      1,
                      Math.max(0, Number(val) || 0)
                    ),
                  },
                })
              }
            />
          </Section>
          <Section title="Slides">
            <div className="space-y-4">
              {(hero.slides || []).map((slide, index) => (
                <div
                  key={slide.id || index}
                  className="rounded-xl border border-[#CCBCA5]/20 bg-[var(--dash-bg)] p-3 sm:p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#CCBCA5]">
                      Slide {index + 1}
                    </p>
                    <ListControls
                      index={index}
                      total={(hero.slides || []).length}
                      onUp={() =>
                        onChange({
                          ...v,
                          hero: {
                            ...hero,
                            slides: moveItem(hero.slides, index, -1),
                          },
                        })
                      }
                      onDown={() =>
                        onChange({
                          ...v,
                          hero: {
                            ...hero,
                            slides: moveItem(hero.slides, index, 1),
                          },
                        })
                      }
                      onRemove={() =>
                        onChange({
                          ...v,
                          hero: {
                            ...hero,
                            slides: hero.slides.filter((_, i) => i !== index),
                          },
                        })
                      }
                    />
                  </div>
                  <BiText
                    labelEn="Badge (EN)"
                    labelKn="Badge (KN)"
                    valueEn={slide.badgeTitleEn}
                    valueKn={slide.badgeTitleKn}
                    onEn={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, badgeTitleEn: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                    onKn={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, badgeTitleKn: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                  />
                  <BiText
                    labelEn="Slogan 1 (EN)"
                    labelKn="Slogan 1 (KN)"
                    valueEn={slide.slogan1En}
                    valueKn={slide.slogan1Kn}
                    onEn={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, slogan1En: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                    onKn={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, slogan1Kn: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                  />
                  <BiText
                    labelEn="Slogan 2 (EN)"
                    labelKn="Slogan 2 (KN)"
                    valueEn={slide.slogan2En}
                    valueKn={slide.slogan2Kn}
                    onEn={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, slogan2En: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                    onKn={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, slogan2Kn: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                  />
                  <BiText
                    labelEn="Slogan 3 (EN)"
                    labelKn="Slogan 3 (KN)"
                    valueEn={slide.slogan3En}
                    valueKn={slide.slogan3Kn}
                    onEn={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, slogan3En: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                    onKn={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, slogan3Kn: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                  />
                  <BiText
                    labelEn="Subtext (EN)"
                    labelKn="Subtext (KN)"
                    valueEn={slide.subEn}
                    valueKn={slide.subKn}
                    area
                    onEn={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, subEn: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                    onKn={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, subKn: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                  />
                  <MediaUpload
                    label="MLA image"
                    value={slide.mlaImage}
                    onChange={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, mlaImage: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                  />
                  <MediaUpload
                    label="Slide background image (optional)"
                    value={slide.backgroundImage || ""}
                    onChange={(val) => {
                      const slides = hero.slides.map((s, i) =>
                        i === index ? { ...s, backgroundImage: val } : s
                      );
                      onChange({ ...v, hero: { ...hero, slides } });
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...v,
                    hero: {
                      ...hero,
                      slides: [
                        ...(hero.slides || []),
                        {
                          id: uid("h"),
                          badgeTitleKn: "",
                          badgeTitleEn: "",
                          slogan1Kn: "",
                          slogan2Kn: "",
                          slogan3Kn: "",
                          slogan1En: "",
                          slogan2En: "",
                          slogan3En: "",
                          subKn: "",
                          subEn: "",
                          mlaImage: "",
                          backgroundImage: "",
                        },
                      ],
                    },
                  })
                }
                className="px-4 py-2 rounded-full bg-[#CCBCA5] text-[#1e2223] text-xs font-black"
              >
                + Add slide
              </button>
            </div>
          </Section>
        </div>
      ) : null}

      {tab === "stats" ? (
        <div className="space-y-4">
          <Section title="Counts">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <TextInput
                label="GP count"
                type="number"
                value={stats.gpCount}
                onChange={(val) =>
                  onChange({
                    ...v,
                    stats: { ...stats, gpCount: Number(val) || 0 },
                  })
                }
              />
              <TextInput
                label="Villages count"
                type="number"
                value={stats.villagesCount}
                onChange={(val) =>
                  onChange({
                    ...v,
                    stats: { ...stats, villagesCount: Number(val) || 0 },
                  })
                }
              />
              <TextInput
                label="Villages suffix"
                value={stats.villagesSuffix}
                onChange={(val) =>
                  onChange({ ...v, stats: { ...stats, villagesSuffix: val } })
                }
              />
              <TextInput
                label="Hoblis count"
                type="number"
                value={stats.hoblisCount}
                onChange={(val) =>
                  onChange({
                    ...v,
                    stats: { ...stats, hoblisCount: Number(val) || 0 },
                  })
                }
              />
            </div>
          </Section>
          <Section title="Media">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MediaUpload
                label="People banner"
                value={stats.peopleBanner}
                onChange={(val) =>
                  onChange({ ...v, stats: { ...stats, peopleBanner: val } })
                }
              />
              <MediaUpload
                label="GP icon"
                value={stats.gpIcon}
                onChange={(val) =>
                  onChange({ ...v, stats: { ...stats, gpIcon: val } })
                }
              />
              <MediaUpload
                label="Villages icon"
                value={stats.villagesIcon}
                onChange={(val) =>
                  onChange({ ...v, stats: { ...stats, villagesIcon: val } })
                }
              />
              <MediaUpload
                label="Hoblis icon"
                value={stats.hoblisIcon}
                onChange={(val) =>
                  onChange({ ...v, stats: { ...stats, hoblisIcon: val } })
                }
              />
            </div>
          </Section>
          <Section title="Stats labels">
            <div className="space-y-3">
              {biCopy("gpLabel")}
              {biCopy("villagesLabel")}
              {biCopy("hoblisLabel")}
              {biCopy("constituencyMla")}
              {biCopy("grievancesTab")}
            </div>
          </Section>
        </div>
      ) : null}

      {tab === "about" ? (
        <div className="space-y-4">
          <Section title="About media">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MediaUpload
                label="Portrait"
                value={about.portrait}
                onChange={(val) =>
                  onChange({ ...v, about: { ...about, portrait: val } })
                }
              />
              <MediaUpload
                label="Watermark"
                value={about.watermark}
                onChange={(val) =>
                  onChange({ ...v, about: { ...about, watermark: val } })
                }
              />
            </div>
          </Section>
          <Section title="About copy">
            <div className="space-y-3">
              {biCopy("aboutHeading")}
              {biCopy("aboutDesc", { area: true })}
              {biCopy("aboutBadge")}
              {biCopy("aboutStatYearLabel")}
              {biCopy("aboutStatVillagesLabel")}
              {biCopy("aboutStatInitiativesLabel")}
              {biCopy("aboutStatBeneficiariesLabel")}
              {biCopy("aboutStatYear")}
              {biCopy("aboutStatVillages")}
              {biCopy("aboutStatInitiatives")}
              {biCopy("aboutStatBeneficiaries")}
            </div>
          </Section>
        </div>
      ) : null}

      {tab === "developments" ? (
        <Section title="Developments copy">
          <div className="space-y-3">
            {biCopy("devBadge")}
            {biCopy("devHeading")}
            {biCopy("devDesc", { area: true })}
          </div>
        </Section>
      ) : null}

      {tab === "tour" ? (
        <div className="space-y-4">
          <Section title="Tour copy">
            <div className="space-y-3">
              {biCopy("tourBadge")}
              {biCopy("tourHeading")}
              {biCopy("tourDesc", { area: true })}
            </div>
          </Section>
          <Section title="Tour media">
            <MediaUpload
              label="Default tour schedule image (fallback)"
              value={media.tourScheduleImage}
              onChange={(val) =>
                onChange({
                  ...v,
                  media: { ...media, tourScheduleImage: val },
                })
              }
            />
            <MediaUpload
              label="Media watermark"
              value={media.watermark}
              onChange={(val) =>
                onChange({ ...v, media: { ...media, watermark: val } })
              }
            />
          </Section>
          <Section title="Daily tour schedules">
            <p className="text-xs text-[var(--dash-text-50)]">
              Upload one sheet per date. Public calendar shows these dates.
            </p>
            <div className="space-y-4">
              {(media.tourSchedules || []).map((item, index) => (
                <div
                  key={item.id || index}
                  className="rounded-xl border border-[#CCBCA5]/20 bg-[var(--dash-bg)] p-3 sm:p-4 space-y-3"
                >
                  <ListControls
                    index={index}
                    total={(media.tourSchedules || []).length}
                    onUp={() =>
                      onChange({
                        ...v,
                        media: {
                          ...media,
                          tourSchedules: moveItem(
                            media.tourSchedules || [],
                            index,
                            -1
                          ),
                        },
                      })
                    }
                    onDown={() =>
                      onChange({
                        ...v,
                        media: {
                          ...media,
                          tourSchedules: moveItem(
                            media.tourSchedules || [],
                            index,
                            1
                          ),
                        },
                      })
                    }
                    onRemove={() =>
                      onChange({
                        ...v,
                        media: {
                          ...media,
                          tourSchedules: (media.tourSchedules || []).filter(
                            (_, i) => i !== index
                          ),
                        },
                      })
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextInput
                      label="Date"
                      type="date"
                      value={item.date || ""}
                      onChange={(val) => {
                        const tourSchedules = (media.tourSchedules || []).map(
                          (it, i) => (i === index ? { ...it, date: val } : it)
                        );
                        onChange({
                          ...v,
                          media: { ...media, tourSchedules },
                        });
                      }}
                    />
                    <TextInput
                      label="Title (EN)"
                      value={item.title || ""}
                      onChange={(val) => {
                        const tourSchedules = (media.tourSchedules || []).map(
                          (it, i) => (i === index ? { ...it, title: val } : it)
                        );
                        onChange({
                          ...v,
                          media: { ...media, tourSchedules },
                        });
                      }}
                    />
                    <TextInput
                      label="Title (KN)"
                      value={item.titleKn || ""}
                      onChange={(val) => {
                        const tourSchedules = (media.tourSchedules || []).map(
                          (it, i) =>
                            i === index ? { ...it, titleKn: val } : it
                        );
                        onChange({
                          ...v,
                          media: { ...media, tourSchedules },
                        });
                      }}
                    />
                  </div>
                  <MediaUpload
                    label="Daily schedule sheet"
                    value={item.imageUrl || ""}
                    onChange={(val) => {
                      const tourSchedules = (media.tourSchedules || []).map(
                        (it, i) =>
                          i === index ? { ...it, imageUrl: val } : it
                      );
                      onChange({
                        ...v,
                        media: { ...media, tourSchedules },
                      });
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...v,
                    media: {
                      ...media,
                      tourSchedules: [
                        ...(media.tourSchedules || []),
                        {
                          id: uid("ts"),
                          date: "",
                          title: "",
                          titleKn: "",
                          imageUrl: media.tourScheduleImage || "",
                          s3Key: null,
                        },
                      ],
                    },
                  })
                }
                className="px-4 py-2 rounded-full bg-[#CCBCA5] text-[#1e2223] text-xs font-black"
              >
                + Add daily schedule
              </button>
            </div>
          </Section>
        </div>
      ) : null}

      {tab === "gallery" ? (
        <div className="space-y-4">
          <Section title="Gallery copy">
            <div className="space-y-3">
              {biCopy("galleryBadge")}
              {biCopy("galleryHeading")}
              {biCopy("galleryDesc", { area: true })}
              {biCopy("farmersBadge")}
              {biCopy("farmersHeading")}
              {biCopy("farmersDesc", { area: true })}
            </div>
          </Section>
          <Section title="Gallery media">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MediaUpload
                label="Watermark"
                value={gallery.watermark}
                onChange={(val) =>
                  onChange({ ...v, gallery: { ...gallery, watermark: val } })
                }
              />
              <MediaUpload
                label="Farmers image"
                value={gallery.farmersImage}
                onChange={(val) =>
                  onChange({
                    ...v,
                    gallery: { ...gallery, farmersImage: val },
                  })
                }
              />
            </div>
          </Section>
          <Section title="Gallery items">
            <div className="space-y-4">
              {(gallery.items || []).map((item, index) => (
                <div
                  key={item.id || index}
                  className="rounded-xl border border-[#CCBCA5]/20 bg-[var(--dash-bg)] p-3 sm:p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#CCBCA5]">
                      Item {index + 1}
                    </p>
                    <ListControls
                      index={index}
                      total={(gallery.items || []).length}
                      onUp={() =>
                        onChange({
                          ...v,
                          gallery: {
                            ...gallery,
                            items: moveItem(gallery.items, index, -1),
                          },
                        })
                      }
                      onDown={() =>
                        onChange({
                          ...v,
                          gallery: {
                            ...gallery,
                            items: moveItem(gallery.items, index, 1),
                          },
                        })
                      }
                      onRemove={() =>
                        onChange({
                          ...v,
                          gallery: {
                            ...gallery,
                            items: gallery.items.filter((_, i) => i !== index),
                          },
                        })
                      }
                    />
                  </div>
                  <BiText
                    labelEn="Title (EN)"
                    labelKn="Title (KN)"
                    valueEn={item.titleEn}
                    valueKn={item.titleKn}
                    onEn={(val) => {
                      const items = gallery.items.map((it, i) =>
                        i === index ? { ...it, titleEn: val } : it
                      );
                      onChange({ ...v, gallery: { ...gallery, items } });
                    }}
                    onKn={(val) => {
                      const items = gallery.items.map((it, i) =>
                        i === index ? { ...it, titleKn: val } : it
                      );
                      onChange({ ...v, gallery: { ...gallery, items } });
                    }}
                  />
                  <BiText
                    labelEn="Description (EN)"
                    labelKn="Description (KN)"
                    valueEn={item.descEn}
                    valueKn={item.descKn}
                    area
                    onEn={(val) => {
                      const items = gallery.items.map((it, i) =>
                        i === index ? { ...it, descEn: val } : it
                      );
                      onChange({ ...v, gallery: { ...gallery, items } });
                    }}
                    onKn={(val) => {
                      const items = gallery.items.map((it, i) =>
                        i === index ? { ...it, descKn: val } : it
                      );
                      onChange({ ...v, gallery: { ...gallery, items } });
                    }}
                  />
                  <MediaUpload
                    label="Image"
                    value={item.image}
                    onChange={(val) => {
                      const items = gallery.items.map((it, i) =>
                        i === index ? { ...it, image: val } : it
                      );
                      onChange({ ...v, gallery: { ...gallery, items } });
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...v,
                    gallery: {
                      ...gallery,
                      items: [
                        ...(gallery.items || []),
                        {
                          id: uid("g"),
                          titleEn: "",
                          titleKn: "",
                          image: "",
                          descKn: "",
                          descEn: "",
                        },
                      ],
                    },
                  })
                }
                className="px-4 py-2 rounded-full bg-[#CCBCA5] text-[#1e2223] text-xs font-black"
              >
                + Add gallery item
              </button>
            </div>
          </Section>
        </div>
      ) : null}

      {tab === "grievance" ? (
        <div className="space-y-4">
          <Section title="Form copy">
            <div className="space-y-3">
              {biCopy("formBadge")}
              {biCopy("formHeading")}
              {biCopy("formSub", { area: true })}
              {biCopy("formName")}
              {biCopy("formPhone")}
              {biCopy("formVillage")}
              {biCopy("formSubject")}
              {biCopy("formMessage")}
              {biCopy("formSubmit")}
              {biCopy("formSuccess", { area: true })}
              {biCopy("formVillagePlaceholder")}
              {biCopy("grievancesTab")}
            </div>
          </Section>
          <Section title="Grievance watermark">
            <MediaUpload
              label="Watermark"
              value={grievance.watermark}
              onChange={(val) =>
                onChange({
                  ...v,
                  grievance: { ...grievance, watermark: val },
                })
              }
            />
          </Section>
          <Section title="Villages">
            <div className="space-y-3">
              {(grievance.villages || []).map((item, index) => (
                <div
                  key={`${item.value}-${index}`}
                  className="rounded-xl border border-[#CCBCA5]/20 bg-[var(--dash-bg)] p-3 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#CCBCA5]">
                      Village {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...v,
                          grievance: {
                            ...grievance,
                            villages: grievance.villages.filter(
                              (_, i) => i !== index
                            ),
                          },
                        })
                      }
                      className="px-2.5 py-1 rounded-full border border-rose-400/50 text-rose-300 text-[10px] font-black"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <TextInput
                      label="Value"
                      value={item.value}
                      onChange={(val) => {
                        const villages = grievance.villages.map((it, i) =>
                          i === index ? { ...it, value: val } : it
                        );
                        onChange({
                          ...v,
                          grievance: { ...grievance, villages },
                        });
                      }}
                    />
                    <TextInput
                      label="Label (EN)"
                      value={item.labelEn}
                      onChange={(val) => {
                        const villages = grievance.villages.map((it, i) =>
                          i === index ? { ...it, labelEn: val } : it
                        );
                        onChange({
                          ...v,
                          grievance: { ...grievance, villages },
                        });
                      }}
                    />
                    <TextInput
                      label="Label (KN)"
                      value={item.labelKn}
                      onChange={(val) => {
                        const villages = grievance.villages.map((it, i) =>
                          i === index ? { ...it, labelKn: val } : it
                        );
                        onChange({
                          ...v,
                          grievance: { ...grievance, villages },
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...v,
                    grievance: {
                      ...grievance,
                      villages: [
                        ...(grievance.villages || []),
                        { value: "", labelEn: "", labelKn: "" },
                      ],
                    },
                  })
                }
                className="px-4 py-2 rounded-full bg-[#CCBCA5] text-[#1e2223] text-xs font-black"
              >
                + Add village
              </button>
            </div>
          </Section>
        </div>
      ) : null}

      {tab === "footer" ? (
        <div className="space-y-4">
          <Section title="Footer copy">
            <div className="space-y-3">
              {biCopy("footerMotto", { area: true })}
              {biCopy("footerCopy")}
              {biCopy("footerDev")}
              {biCopy("footerQuickLinks")}
              {biCopy("footerContact")}
              {biCopy("footerRole")}
              {biCopy("footerAddress", { area: true })}
              {biCopy("footerOrbit")}
            </div>
          </Section>
          <Section title="Values (one per line)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextArea
                label="Values (EN)"
                rows={6}
                value={(en.values || []).join("\n")}
                onChange={(val) => setValuesLines("en", val)}
              />
              <TextArea
                label="Values (KN)"
                rows={6}
                value={(kn.values || []).join("\n")}
                onChange={(val) => setValuesLines("kn", val)}
              />
            </div>
          </Section>
          <Section title="Contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextInput
                label="Phone"
                value={contact.phone}
                onChange={(val) =>
                  onChange({ ...v, contact: { ...contact, phone: val } })
                }
              />
              <TextInput
                label="Phone href"
                value={contact.phoneHref}
                onChange={(val) =>
                  onChange({ ...v, contact: { ...contact, phoneHref: val } })
                }
              />
              <TextInput
                label="Email"
                value={contact.email}
                onChange={(val) =>
                  onChange({ ...v, contact: { ...contact, email: val } })
                }
              />
              <TextInput
                label="Facebook URL"
                value={contact.facebook}
                onChange={(val) =>
                  onChange({ ...v, contact: { ...contact, facebook: val } })
                }
              />
              <TextInput
                label="Instagram URL"
                value={contact.instagram}
                onChange={(val) =>
                  onChange({ ...v, contact: { ...contact, instagram: val } })
                }
              />
              <TextInput
                label="YouTube URL"
                value={contact.youtube}
                onChange={(val) =>
                  onChange({ ...v, contact: { ...contact, youtube: val } })
                }
              />
              <TextInput
                label="Twitter / X URL"
                value={contact.twitter}
                onChange={(val) =>
                  onChange({ ...v, contact: { ...contact, twitter: val } })
                }
              />
            </div>
          </Section>
          <Section title="Quick link URLs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextInput
                label="Seva Sindhu URL"
                value={quickLinks.sevaSindhuUrl}
                onChange={(val) =>
                  onChange({
                    ...v,
                    quickLinks: { ...quickLinks, sevaSindhuUrl: val },
                  })
                }
              />
              <TextInput
                label="District portal URL"
                value={quickLinks.districtPortalUrl}
                onChange={(val) =>
                  onChange({
                    ...v,
                    quickLinks: { ...quickLinks, districtPortalUrl: val },
                  })
                }
              />
              <TextInput
                label="AJSK / Nadakacheri certificates URL"
                value={quickLinks.ajskCertificatesUrl}
                onChange={(val) =>
                  onChange({
                    ...v,
                    quickLinks: { ...quickLinks, ajskCertificatesUrl: val },
                  })
                }
              />
            </div>
          </Section>
        </div>
      ) : null}
    </div>
  );
}
