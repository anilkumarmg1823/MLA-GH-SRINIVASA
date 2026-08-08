"use client";

import React, { useEffect, useRef } from "react";
import MediaImage from "./MediaImage";
import { brandStyleVars } from "@/lib/landingContentStore";

/**
 * High-fidelity interactive live preview canvas for Landing CMS
 * Displays all landing sections with live color/copy/media binding
 * Provides contextual section edit buttons and scroll-spy detection
 */
export default function LandingCmsLiveCanvas({
  content = {},
  lang = "kn",
  viewport = "desktop",
  activeSection = "brand",
  onSelectSection = () => {},
  onScrollSectionChange = () => {},
}) {
  const containerRef = useRef(null);
  const brand = content.brand || {};
  const site = content.site || {};
  const copy = content.copy?.[lang] || content.copy?.en || {};
  const heroSlides = content.hero?.slides || [];
  const slide = heroSlides[0] || {};
  const stats = content.stats || {};
  const about = content.about || {};
  const media = content.media || {};
  const gallery = content.gallery?.items || [];
  const grievance = content.grievance || {};
  const contact = content.contact || {};
  const brandVars = brandStyleVars(brand);

  // Viewport container width constraints
  const viewportStyles = {
    desktop: "w-full min-h-screen rounded-2xl",
    tablet: "w-[768px] max-w-full min-h-[900px] rounded-3xl border-8 border-slate-800 shadow-2xl mx-auto overflow-hidden",
    mobile: "w-[375px] max-w-full min-h-[750px] rounded-[36px] border-[10px] border-slate-900 shadow-2xl mx-auto overflow-hidden",
  };

  // Scroll spy to detect visible section
  useEffect(() => {
    const parentEl = containerRef.current;
    if (!parentEl) return;

    const sections = parentEl.querySelectorAll("[data-section-id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            const id = entry.target.getAttribute("data-section-id");
            if (id) onScrollSectionChange(id);
          }
        });
      },
      { root: parentEl, threshold: [0.3] }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [onScrollSectionChange]);

  // Auto-scroll active section into view smoothly when activeSection tab changes
  useEffect(() => {
    if (!activeSection || !containerRef.current) return;
    const target = containerRef.current.querySelector(
      `[data-section-id="${activeSection}"]`
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeSection]);

  const SectionWrapper = ({ id, label, children }) => {
    const isActive = activeSection === id;
    return (
      <div
        data-section-id={id}
        className={`relative group transition-all duration-300 ${
          isActive
            ? "ring-4 ring-[#CCBCA5] ring-offset-2 ring-offset-slate-900 z-20"
            : "hover:outline hover:outline-2 hover:outline-[#CCBCA5]/60"
        }`}
      >
        {/* Floating Contextual Customize Button Overlay */}
        <div className="absolute top-3 right-4 z-40 opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectSection(id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black shadow-xl backdrop-blur-md transition-all duration-200 flex items-center gap-1.5 ${
              isActive
                ? "bg-[#CCBCA5] text-[#1e2223] scale-105"
                : "bg-slate-900/90 text-[#CCBCA5] border border-[#CCBCA5]/50 hover:bg-[#CCBCA5] hover:text-slate-900"
            }`}
          >
            <span>✏️</span>
            <span>Customize {label}</span>
          </button>
        </div>

        {/* Section Header Tag Badge on Left */}
        <div className="absolute top-3 left-4 z-40 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-black/60 text-[#CCBCA5] border border-[#CCBCA5]/30 backdrop-blur-md">
            {label}
          </span>
        </div>

        {children}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`bg-[var(--land-bg)] text-white overflow-y-auto selection:bg-[var(--land-link)] selection:text-white transition-all duration-300 ${viewportStyles[viewport] || viewportStyles.desktop}`}
      style={brandVars}
    >
      {/* 1. HEADER SECTION */}
      <SectionWrapper id="header" label="Header">
        <header className="bg-gradient-to-r from-[var(--land-blue-deep)] via-[var(--land-blue-mid)] to-[var(--land-blue-bright)] border-b-4 border-[var(--land-gold)] shadow-xl px-4 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Logos & Site Title — Seal | MLA | Party */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 shrink-0 hidden sm:block">
                <MediaImage
                  src={site.karnatakaLogo}
                  alt="Karnataka"
                  fill
                  className="object-contain"
                  sizes="36px"
                />
              </div>
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--land-gold)] bg-white shrink-0">
                <MediaImage
                  src={site.mlaCircleLogo || "/mla_official_circle_logo.jpg"}
                  alt="MLA"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <div className="relative w-9 h-9 shrink-0">
                <MediaImage
                  src={site.partyLogo}
                  alt="Party"
                  fill
                  className="object-contain"
                  sizes="36px"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm sm:text-base tracking-wider uppercase text-white leading-tight">
                  {copy.navbarTitle || site.nameEn}
                </span>
                <span className="text-[var(--land-gold)] text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5">
                  {site.taglineEn === site.taglineKn || !site.taglineKn
                    ? site.taglineEn
                    : `${site.taglineEn} | ${site.taglineKn}`}
                </span>
              </div>
            </div>

            {/* Navigation Pills */}
            <div className="hidden md:flex items-center gap-4 text-xs font-black">
              <span className="text-[var(--land-gold)]">{copy.navHome}</span>
              <span className="text-white/90">{copy.navAbout}</span>
              <span className="text-white/90">{copy.navDevelopments}</span>
            </div>

            {/* CM + DCM Badge & Login */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-[var(--land-blue-deep)]/80 px-2.5 py-1 rounded-full border border-[var(--land-gold)]/40">
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[var(--land-gold)] bg-white shrink-0">
                  <MediaImage
                    src={site.cmPhoto}
                    alt="CM"
                    fill
                    sizes="28px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white font-extrabold text-[9px] leading-tight">
                    {lang === "kn" ? site.cmNameKn : site.cmNameEn}
                  </span>
                  <span className="text-[var(--land-gold)] font-black text-[7px]">
                    {lang === "kn" ? site.cmTitleKn : site.cmTitleEn}
                  </span>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-[var(--land-blue-deep)]/80 px-2.5 py-1 rounded-full border border-[var(--land-gold)]/40">
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[var(--land-gold)] bg-white shrink-0">
                  <MediaImage
                    src={site.dcmPhoto}
                    alt="DCM"
                    fill
                    sizes="28px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white font-extrabold text-[9px] leading-tight">
                    {lang === "kn" ? site.dcmNameKn : site.dcmNameEn}
                  </span>
                  <span className="text-[var(--land-gold)] font-black text-[7px]">
                    {lang === "kn" ? site.dcmTitleKn : site.dcmTitleEn}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-black text-[var(--land-gold)] border border-[var(--land-gold)] rounded-full">
                {copy.login || "LOGIN"}
              </span>
            </div>
          </div>
        </header>
      </SectionWrapper>

      {/* 2. HERO SECTION */}
      <SectionWrapper id="hero" label="Hero Banner">
        <section className="relative min-h-[360px] sm:min-h-[420px] p-6 sm:p-10 flex items-center overflow-hidden bg-gradient-to-r from-[var(--land-blue-deep)] via-[var(--land-blue-mid)] to-[var(--land-blue-bright)] border-b-4 border-[var(--land-gold)]">
          <div className="max-w-4xl space-y-4 z-10">
            <div className="inline-flex items-center gap-2 bg-[var(--land-gold)] text-slate-950 text-xs font-black px-3.5 py-1 rounded-full shadow-lg">
              <span>{lang === "kn" ? slide.badgeTitleKn : slide.badgeTitleEn}</span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-md">
              {lang === "kn" ? slide.slogan1Kn : slide.slogan1En}{" "}
              <span className="text-[var(--land-gold)]">
                • {lang === "kn" ? slide.slogan2Kn : slide.slogan2En}
              </span>
            </h1>

            <p className="text-xs sm:text-sm font-bold text-slate-100 max-w-2xl leading-relaxed bg-[var(--land-blue-deep)]/80 p-4 rounded-2xl border border-[var(--land-gold)]/40 shadow-xl">
              {lang === "kn" ? slide.subKn : slide.subEn}
            </p>
          </div>

          {/* MLA Image preview right edge */}
          <div className="absolute right-2 bottom-0 w-[180px] sm:w-[260px] h-[280px] sm:h-[360px] pointer-events-none opacity-90 hidden sm:block">
            <MediaImage
              src={slide.mlaImage || site.mlaPortrait}
              alt="MLA"
              fill
              className="object-contain object-bottom"
              sizes="260px"
            />
          </div>
        </section>
      </SectionWrapper>

      {/* 3. STATS SECTION */}
      <SectionWrapper id="stats" label="Constituency Stats">
        <section className="relative py-6 px-4 bg-gradient-to-r from-[var(--land-blue-mid)] via-[var(--land-blue-bright)] to-[var(--land-blue-light)] border-b-2 border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {/* GP */}
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md border border-white/40 p-3 rounded-2xl">
              <div className="relative w-9 h-9 bg-white rounded-lg p-0.5 shrink-0">
                <MediaImage src={stats.gpIcon} alt="" fill className="object-contain" sizes="36px" />
              </div>
              <div>
                <p className="text-xl font-black text-white">{stats.gpCount || 33}</p>
                <p className="text-[10px] font-black text-[var(--land-gold)] uppercase">{copy.gpLabel}</p>
              </div>
            </div>

            {/* Villages */}
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md border border-white/40 p-3 rounded-2xl">
              <div className="relative w-9 h-9 bg-white rounded-lg p-0.5 shrink-0">
                <MediaImage src={stats.villagesIcon} alt="" fill className="object-contain" sizes="36px" />
              </div>
              <div>
                <p className="text-xl font-black text-white">{stats.villagesCount || 160}{stats.villagesSuffix || "+"}</p>
                <p className="text-[10px] font-black text-[var(--land-gold)] uppercase">{copy.villagesLabel}</p>
              </div>
            </div>

            {/* Hoblis */}
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md border border-white/40 p-3 rounded-2xl">
              <div className="relative w-9 h-9 bg-white rounded-lg p-0.5 shrink-0">
                <MediaImage src={stats.hoblisIcon} alt="" fill className="object-contain" sizes="36px" />
              </div>
              <div>
                <p className="text-xl font-black text-white">{stats.hoblisCount || 4}</p>
                <p className="text-[10px] font-black text-[var(--land-gold)] uppercase">{copy.hoblisLabel}</p>
              </div>
            </div>

            {/* MLA Badge */}
            <div className="flex items-center gap-3 bg-white/30 border border-white/60 p-3 rounded-2xl">
              <div className="relative w-9 h-9 bg-white rounded-full overflow-hidden shrink-0">
                <MediaImage src={site.mlaPortrait} alt="" fill className="object-cover object-top" sizes="36px" />
              </div>
              <div>
                <p className="text-xs font-black text-white">{copy.constituencyMla}</p>
                <p className="text-[9px] font-black text-[var(--land-gold)] uppercase">{lang === "kn" ? site.nameShortKn : site.nameShortEn}</p>
              </div>
            </div>
          </div>
        </section>
      </SectionWrapper>

      {/* 4. ABOUT SECTION */}
      <SectionWrapper id="about" label="About Us">
        <section className="bg-white text-slate-900 py-10 px-6 sm:px-10 border-b border-slate-200">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-[var(--land-blue-bright)] shadow-2xl bg-white">
                <MediaImage
                  src={about.portrait || site.mlaPortrait}
                  alt="About portrait"
                  fill
                  className="object-contain"
                  sizes="224px"
                />
              </div>
            </div>
            <div className="md:col-span-8 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--land-blue-bright)] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                ✦ {copy.aboutBadge}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--land-blue-mid)]">
                {copy.aboutHeading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {copy.aboutDesc}
              </p>

              {/* Stats badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {[
                  { n: copy.aboutStatYear, l: copy.aboutStatYearLabel },
                  { n: copy.aboutStatVillages, l: copy.aboutStatVillagesLabel },
                  { n: copy.aboutStatInitiatives, l: copy.aboutStatInitiativesLabel },
                  { n: copy.aboutStatBeneficiaries, l: copy.aboutStatBeneficiariesLabel },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-center">
                    <p className="text-base font-black text-[var(--land-blue-bright)]">{s.n}</p>
                    <p className="text-[9px] font-extrabold text-slate-500 uppercase">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionWrapper>

      {/* 5. DEVELOPMENTS SECTION */}
      <SectionWrapper id="developments" label="Developments">
        <section className="bg-gradient-to-br from-[var(--land-blue)] to-[var(--land-blue-bright)] text-white py-10 px-6 sm:px-10 border-b-4 border-white">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--land-gold)] bg-white/10 px-3 py-1 rounded-full border border-white/20">
              ✦ {copy.devBadge}
            </span>
            <h2 className="text-2xl font-black text-white drop-shadow-md">
              {copy.devHeading}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl mx-auto">
              {copy.devDesc}
            </p>
            <div className="p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md text-xs font-bold text-slate-200">
              🗺️ Village-wise Development Map & Project Explorer Canvas Preview
            </div>
          </div>
        </section>
      </SectionWrapper>

      {/* 6. TOUR SECTION */}
      <SectionWrapper id="tour" label="Tour Schedule">
        <section className="bg-slate-50 text-slate-900 py-10 px-6 sm:px-10 border-b border-slate-200">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--land-blue-bright)] bg-blue-100 px-3 py-1 rounded-full">
              ✦ {copy.tourBadge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--land-blue)]">
              {copy.tourHeading}
            </h2>
            <p className="text-xs text-slate-600 max-w-xl mx-auto font-medium">
              {copy.tourDesc}
            </p>
            {media.tourScheduleImage ? (
              <div className="relative w-full max-w-lg h-56 mx-auto rounded-2xl overflow-hidden border border-slate-300 shadow-md">
                <MediaImage src={media.tourScheduleImage} alt="Tour Schedule" fill className="object-cover" sizes="512px" />
              </div>
            ) : null}
          </div>
        </section>
      </SectionWrapper>

      {/* 8. GALLERY SECTION */}
      <SectionWrapper id="gallery" label="Gallery">
        <section className="bg-white text-slate-900 py-10 px-6 sm:px-10 border-b border-slate-200">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--land-blue-bright)] bg-blue-50 px-3 py-1 rounded-full">
                ✦ {copy.galleryBadge}
              </span>
              <h2 className="text-2xl font-black text-[var(--land-blue)]">
                {copy.galleryHeading}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {gallery.map((g, i) => (
                <div key={g.id || i} className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-50">
                  <div className="relative w-full h-32 bg-slate-200">
                    <MediaImage src={g.image} alt="" fill className="object-cover" sizes="200px" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-black text-slate-900">{lang === "kn" ? g.titleKn : g.titleEn}</p>
                    <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">{lang === "kn" ? g.descKn : g.descEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionWrapper>

      {/* 9. GRIEVANCE SECTION */}
      <SectionWrapper id="grievance" label="Grievances">
        <section className="bg-slate-900 text-white py-10 px-6 sm:px-10 border-b-4 border-slate-700">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--land-gold)] bg-black/50 px-3 py-1 rounded-full border border-[var(--land-gold)]/30">
              ✦ {copy.formBadge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">{copy.formHeading}</h2>
            <p className="text-xs text-slate-300">{copy.formSub}</p>
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-left text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-900 rounded border border-slate-700 text-slate-400">{copy.formName}</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-700 text-slate-400">{copy.formPhone}</div>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-700 text-slate-400">{copy.formVillage}</div>
              <div className="p-2 bg-slate-900 rounded border border-slate-700 text-slate-400">{copy.formMessage}</div>
            </div>
          </div>
        </section>
      </SectionWrapper>

      {/* 10. FOOTER SECTION */}
      <SectionWrapper id="footer" label="Footer">
        <footer
          className="p-6 sm:p-8 text-center text-xs space-y-3 border-t-4"
          style={{ background: brand.footerBg || "#0f1314", borderColor: brand.gold || "#FFD700" }}
        >
          <p className="font-black text-white tracking-widest uppercase text-[11px]">{copy.footerMotto}</p>
          <p className="text-[10px] text-[#CCBCA5] font-bold">{copy.footerCopy}</p>
          <p className="text-[9px] text-white/50">{copy.footerDev}</p>
        </footer>
      </SectionWrapper>
    </div>
  );
}
