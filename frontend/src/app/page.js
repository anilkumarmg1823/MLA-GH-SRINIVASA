
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import VillageDevelopmentMap from "./components/VillageDevelopmentMap";
import MlaTourCalendar from "./components/MlaTourCalendar";
import MediaReportsSection from "./components/MediaReportsSection";
import MedicalReferralGlimpseSection from "./components/MedicalReferralGlimpseSection";
import MediaImage from "@/components/landing-cms/MediaImage";
import { landingContentSeed } from "@/data/landingContentSeed";
import {
  loadLandingContent,
  brandStyleVars,
  LANDING_SYNC_EVENT,
  LANDING_STORAGE_KEY,
} from "@/lib/landingContentStore";
import { loadPublicDevelopments } from "@/lib/publicDevelopments";
import { submitComplaint } from "@/lib/complaintsStore";
import {
  FaUsers, FaHandshake, FaChartLine, FaShieldAlt, FaLaptop,
  FaFacebookF, FaTwitter, FaYoutube, FaInstagram, FaPhoneAlt, FaEnvelope,
  FaHospitalUser, FaImages, FaClipboardList, FaLandmark, FaGlobe,
  FaBuilding, FaHome, FaMapMarkerAlt, FaBars, FaTimes
} from "react-icons/fa";

// Animated Counter Component for Constituency Stats
function AnimatedCounter({ end, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{count}{suffix}</>;
}

export default function Home() {
  const [lang, setLang] = useState("kn"); // Default to Kannada
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSending, setFormSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    village: "",
    subject: "",
    message: "",
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [socialSidebarCollapsed, setSocialSidebarCollapsed] = useState(false);
  const [content, setContent] = useState(landingContentSeed);
  const [publicDevelopments, setPublicDevelopments] = useState([]);

  useEffect(() => {
    const hydrate = async () => {
      const next = await loadLandingContent();
      setContent(next);
    };
    hydrate();
    loadPublicDevelopments().then(setPublicDevelopments);

    const onSync = (e) => {
      if (e?.detail) setContent(e.detail);
      else hydrate();
    };
    const onStorage = (e) => {
      if (e.key === LANDING_STORAGE_KEY || e.key === null) hydrate();
    };

    window.addEventListener(LANDING_SYNC_EVENT, onSync);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", hydrate);
    return () => {
      window.removeEventListener(LANDING_SYNC_EVENT, onSync);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", hydrate);
    };
  }, []);

  const currentText = content.copy?.[lang] || content.copy?.en || {};
  const site = content.site || {};
  const heroSlides = content.hero?.slides || [];
  const galleryItems = content.gallery?.items || [];
  const brandVars = brandStyleVars(content.brand);

  useEffect(() => {
    if (!heroSlides.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSending(true);
    try {
      await submitComplaint(form);
      setFormSubmitted(true);
      setForm({
        name: "",
        phone: "",
        village: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (err) {
      setFormError(
        err?.message ||
        (lang === "kn"
          ? "Could not submit. Please try again."
          : "Could not submit. Please try again.")
      );
    } finally {
      setFormSending(false);
    }
  };

  const closeMobileNav = () => {
    setMobileNavOpen(false);
    setQuickLinksOpen(false);
  };

  const scrollAndCloseMobile = (id) => {
    handleScroll(id);
    closeMobileNav();
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-[var(--land-bg)] text-white flex flex-col justify-between relative selection:bg-[var(--land-link)] selection:text-white"
      style={{
        ...brandVars,
        fontFamily: "var(--land-font-body)",
      }}
    >

      {/* 1. FLOATING SOCIAL SIDEBAR (Collapsible on black header click) */}
      <div
        className={`fixed left-0 top-[35%] z-40 hidden xl:flex flex-col shadow-2xl overflow-hidden rounded-r-lg border-y border-r border-black/20 transition-transform duration-300 ${socialSidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          }`}
      >
        {/* Top collapse / left arrow header */}
        <button
          type="button"
          onClick={() => setSocialSidebarCollapsed(true)}
          className="bg-black p-3.5 text-white flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors"
          title="Collapse Sidebar"
        >
          <span className="text-sm font-bold">←</span>
        </button>
        {/* Facebook Block */}
        <a href={content.contact?.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="bg-[#3b5998] p-3.5 text-white flex items-center justify-center hover:brightness-110 transition-all">
          <FaFacebookF className="w-5 h-5 text-white" />
        </a>
        {/* Instagram Gradient Block */}
        <a href={content.contact?.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-3.5 text-white flex items-center justify-center hover:brightness-110 transition-all">
          <FaInstagram className="w-5 h-5 text-white" />
        </a>
        {/* YouTube Block */}
        <a href={content.contact?.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="bg-[#ff0000] p-3.5 text-white flex items-center justify-center hover:brightness-110 transition-all">
          <FaYoutube className="w-5 h-5 text-white" />
        </a>
        {/* X / Twitter Block */}
        <a href={content.contact?.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="bg-[#1da1f2] p-3.5 text-white flex items-center justify-center hover:brightness-110 transition-all">
          <FaTwitter className="w-5 h-5 text-white" />
        </a>
      </div>

      {/* Expand Button when Collapsed */}
      {socialSidebarCollapsed && (
        <button
          type="button"
          onClick={() => setSocialSidebarCollapsed(false)}
          className="fixed left-0 top-[35%] z-40 hidden xl:flex bg-black p-3.5 text-white rounded-r-lg shadow-2xl border-y border-r border-black/20 hover:bg-black/80 transition-all cursor-pointer"
          title="Expand Social Sidebar"
        >
          <span className="text-sm font-bold">→</span>
        </button>
      )}

      {/* 2. FLOATING GRIEVANCES VERTICAL TAB (Right Edge - Dynamic Kannada / English) */}
      <button
        type="button"
        onClick={() => handleScroll("grievance-form")}
        className="fixed right-0 top-[90%] -translate-y-1/2 z-50 bg-[var(--land-gold)] hover:bg-white text-slate-950 font-black px-3 py-5 text-xs sm:text-sm rounded-l-2xl shadow-2xl border-2 border-r-0 border-white transition-all duration-300 cursor-pointer flex items-center justify-center tracking-wider text-slate-900 hover:px-4 whitespace-nowrap overflow-visible select-none"
        style={{ writingMode: "vertical-rl" }}
      >
        <span className="whitespace-nowrap inline-block leading-none">
          {lang === "kn"
            ? (content.copy?.kn?.grievancesTab || currentText.grievancesTab || "ದೂರು / ಸಲಹೆಗಳು")
            : (content.copy?.en?.grievancesTab || currentText.grievancesTab || "Complaint / Suggestion")}
        </span>
      </button>

      {/* Raw CSS Injection for Background Float Animations & Hiding Video Controls */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -45px) scale(1.18); }
        }
        .rotate-270 {
          transform: rotate(-90deg);
        }
        video::-webkit-media-controls,
        video::-webkit-media-controls-enclosure,
        video::-webkit-media-controls-panel,
        video::-webkit-media-controls-play-button,
        video::-webkit-media-controls-start-playback-button,
        video::-webkit-media-controls-overlay-play-button {
          display: none !important;
          -webkit-appearance: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}} />

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[var(--land-blue-deep)] via-[var(--land-blue-mid)] to-[var(--land-blue-bright)] border-b-4 border-[var(--land-gold)] shadow-xl backdrop-blur-md">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">

          {/* Logo Brand Header — Seal | MLA (center) | Party  (same as dashboard navbar) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Government State Seal */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 hidden md:block filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
              <MediaImage
                src={site.karnatakaLogo}
                alt="Government of Karnataka Seal"
                fill
                sizes="(max-width: 640px) 36px, 44px"
                className="object-contain"
                priority
              />
            </div>

            {/* Official Circular MLA Logo (centre) */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[var(--land-gold)] shadow-md shrink-0 bg-white">
              <MediaImage
                src={site.mlaCircleLogo || "/mla_official_circle_logo.jpg"}
                alt="Dr. Srinivas N. T. MLA"
                fill
                sizes="(max-width: 640px) 40px, 48px"
                className="object-contain"
                priority
              />
            </div>

            {/* Congress Party Logo */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
              <MediaImage
                src={site.partyLogo}
                alt="Indian National Congress Hand Logo"
                fill
                sizes="(max-width: 640px) 36px, 44px"
                className="object-contain"
                priority
              />
            </div>

            <div className="flex flex-col text-left min-w-0 max-w-[42vw] sm:max-w-none">
              <span className="font-black text-[10px] sm:text-base tracking-wider uppercase text-white leading-tight truncate">
                {currentText.navbarTitle}
              </span>
              <span className="text-[var(--land-gold)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5 truncate hidden sm:block">
                {site.taglineEn === site.taglineKn || !site.taglineKn
                  ? site.taglineEn
                  : `${site.taglineEn} | ${site.taglineKn}`}
              </span>
            </div>
          </div>

          {/* Navigation Items (Clean Text Layout with Quick Links Dropdown) */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-black tracking-wide shrink-0">
            <button onClick={() => handleScroll("home")} className="text-[var(--land-gold)] hover:text-white transition-colors">{currentText.navHome}</button>
            <button onClick={() => handleScroll("about")} className="text-white/90 hover:text-[var(--land-gold)] transition-colors">{currentText.navAbout}</button>
            <button onClick={() => handleScroll("developments")} className="text-white/90 hover:text-[var(--land-gold)] transition-colors">{currentText.navDevelopments}</button>

            {/* Quick Links Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setQuickLinksOpen(!quickLinksOpen)}
                className="inline-flex items-center gap-1.5 text-white/90 hover:text-[var(--land-gold)] transition-colors text-sm font-black tracking-wide cursor-pointer py-1"
              >
                <span>{currentText.quickLinks}</span>
                <span className="text-[10px] text-[var(--land-gold)] transition-transform duration-200">{quickLinksOpen ? "▲" : "▼"}</span>
              </button>

              {quickLinksOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#001742]/95 backdrop-blur-2xl rounded-2xl p-2.5 shadow-2xl border-2 border-[var(--land-gold)]/60 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/medical-referral"
                    onClick={() => setQuickLinksOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-slate-100 hover:text-[var(--land-gold)] hover:bg-white/10 rounded-xl transition-all text-left group"
                  >
                    <FaHospitalUser className="w-4 h-4 text-[var(--land-gold)] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{currentText.medicalReferral}</span>
                  </Link>

                  <button
                    onClick={() => { handleScroll("gallery"); setQuickLinksOpen(false); }}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-slate-100 hover:text-[var(--land-gold)] hover:bg-white/10 rounded-xl transition-all text-left cursor-pointer group"
                  >
                    <FaImages className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{currentText.photoGallery}</span>
                  </button>

                  <button
                    onClick={() => { handleScroll("grievance-form"); setQuickLinksOpen(false); }}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-slate-100 hover:text-[var(--land-gold)] hover:bg-white/10 rounded-xl transition-all text-left cursor-pointer group"
                  >
                    <FaClipboardList className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{currentText.grievancesSuggestions}</span>
                  </button>

                  <a
                    href={content.quickLinks?.sevaSindhuUrl || "https://sevasindhu.karnataka.gov.in"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setQuickLinksOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-slate-100 hover:text-[var(--land-gold)] hover:bg-white/10 rounded-xl transition-all text-left group"
                  >
                    <FaLandmark className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{currentText.sevaSindhu}</span>
                  </a>

                  <a
                    href={content.quickLinks?.districtPortalUrl || "https://vijayanagara.nic.in"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setQuickLinksOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-slate-100 hover:text-[var(--land-gold)] hover:bg-white/10 rounded-xl transition-all text-left group"
                  >
                    <FaGlobe className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{currentText.districtPortal}</span>
                  </a>
                </div>
              )}
            </div>

          </nav>

          {/* Header Action Badges, Language Selector & Login Button */}
          <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[var(--land-blue-deep)]/80 p-1 rounded-full border border-[var(--land-gold)]/40 h-fit">
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-black rounded-full transition-all duration-300 ${lang === "en"
                    ? "bg-[var(--land-gold)] text-slate-900 shadow-md"
                    : "text-white/70 hover:text-white"
                  }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("kn")}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-black rounded-full transition-all duration-300 ${lang === "kn"
                    ? "bg-[var(--land-gold)] text-slate-900 shadow-md"
                    : "text-white/70 hover:text-white"
                  }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* CM + DCM badges (Hidden on mobile to save space) */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[var(--land-blue-deep)]/80 px-3 py-1 rounded-full border border-[var(--land-gold)]/40 shadow-sm h-fit">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--land-gold)] bg-white shrink-0">
                  <MediaImage
                    src={site.cmPhoto}
                    alt={site.cmNameEn || "Chief Minister"}
                    fill
                    sizes="32px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-white font-extrabold text-[10px] leading-tight tracking-wide">
                    {lang === "kn" ? site.cmNameKn : site.cmNameEn}
                  </span>
                  <span className="text-[var(--land-gold)] font-extrabold text-[8px] tracking-wide leading-normal">
                    {lang === "kn" ? site.cmTitleKn : site.cmTitleEn}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[var(--land-blue-deep)]/80 px-3 py-1 rounded-full border border-[var(--land-gold)]/40 shadow-sm h-fit">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--land-gold)] bg-white shrink-0">
                  <MediaImage
                    src={site.dcmPhoto || "/dcm_g_parameshwar.png"}
                    alt={site.dcmNameEn || "Deputy Chief Minister"}
                    fill
                    sizes="32px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-white font-extrabold text-[10px] leading-tight tracking-wide">
                    {lang === "kn"
                      ? site.dcmNameKn || "ಜಿ. ಪರಮೇಶ್ವರ್"
                      : site.dcmNameEn || "G. Parameshwar"}
                  </span>
                  <span className="text-[var(--land-gold)] font-extrabold text-[8px] tracking-wide leading-normal">
                    {lang === "kn"
                      ? site.dcmTitleKn || "ಉಪಮುಖ್ಯಮಂತ್ರಿ"
                      : site.dcmTitleEn || "Deputy Chief Minister"}
                  </span>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <Link
              href="/login"
              className="hidden sm:inline-flex px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs md:text-sm font-black text-[var(--land-gold)] border-2 border-[var(--land-gold)] rounded-full hover:bg-[var(--land-gold)] hover:text-slate-900 transition-all duration-300 shadow-md whitespace-nowrap items-center"
            >
              {currentText.login || 'LOGIN'}
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="xl:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 border-[var(--land-gold)]/70 text-[var(--land-gold)] hover:bg-[var(--land-gold)]/15"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* Mobile / tablet navigation drawer */}
        {mobileNavOpen ? (
          <div className="xl:hidden border-t border-[var(--land-gold)]/30 bg-[var(--land-blue-deep)]/98 backdrop-blur-xl px-4 py-3 flex flex-col gap-1 shadow-2xl max-h-[min(70vh,520px)] overflow-y-auto">
            <button type="button" onClick={() => scrollAndCloseMobile("home")} className="text-left px-3 py-2.5 rounded-xl text-sm font-black text-[var(--land-gold)] hover:bg-white/10">
              {currentText.navHome}
            </button>
            <button type="button" onClick={() => scrollAndCloseMobile("about")} className="text-left px-3 py-2.5 rounded-xl text-sm font-black text-white/90 hover:bg-white/10">
              {currentText.navAbout}
            </button>
            <button type="button" onClick={() => scrollAndCloseMobile("developments")} className="text-left px-3 py-2.5 rounded-xl text-sm font-black text-white/90 hover:bg-white/10">
              {currentText.navDevelopments}
            </button>
            <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-[var(--land-gold)]/80">
              {currentText.quickLinks}
            </p>
            <Link href="/medical-referral" onClick={closeMobileNav} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-extrabold text-slate-100 hover:bg-white/10">
              <FaHospitalUser className="w-4 h-4 text-[var(--land-gold)] shrink-0" />
              {currentText.medicalReferral}
            </Link>
            <button type="button" onClick={() => scrollAndCloseMobile("gallery")} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-extrabold text-slate-100 hover:bg-white/10 text-left">
              <FaImages className="w-4 h-4 text-emerald-400 shrink-0" />
              {currentText.photoGallery}
            </button>
            <button type="button" onClick={() => scrollAndCloseMobile("grievance-form")} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-extrabold text-slate-100 hover:bg-white/10 text-left">
              <FaClipboardList className="w-4 h-4 text-amber-400 shrink-0" />
              {currentText.grievancesSuggestions}
            </button>
            <a href={content.quickLinks?.sevaSindhuUrl || "https://sevasindhu.karnataka.gov.in"} target="_blank" rel="noopener noreferrer" onClick={closeMobileNav} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-extrabold text-slate-100 hover:bg-white/10">
              <FaLandmark className="w-4 h-4 text-blue-400 shrink-0" />
              {currentText.sevaSindhu}
            </a>
            <a href={content.quickLinks?.districtPortalUrl || "https://vijayanagara.nic.in"} target="_blank" rel="noopener noreferrer" onClick={closeMobileNav} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-extrabold text-slate-100 hover:bg-white/10">
              <FaGlobe className="w-4 h-4 text-cyan-400 shrink-0" />
              {currentText.districtPortal}
            </a>
            <Link
              href="/login"
              onClick={closeMobileNav}
              className="sm:hidden mt-2 mx-1 text-center px-4 py-2.5 text-sm font-black text-slate-900 bg-[var(--land-gold)] rounded-full"
            >
              {currentText.login || "LOGIN"}
            </Link>
          </div>
        ) : null}
      </header>

      {/* 3. HERO BANNER AREA (Rich Royal Blue Theme with Animated Slogan & Photo Carousel) */}
      <section
        id="home"
        className="relative w-full overflow-hidden bg-gradient-to-r from-[var(--land-blue-deep)] via-[var(--land-blue-mid)] to-[var(--land-blue-bright)] border-b-4 border-[var(--land-gold)] shadow-2xl min-h-[420px] sm:min-h-[460px] lg:h-[510px]"
        style={{ fontFamily: "var(--land-font-display)" }}
      >
        {(() => {
          const slide = heroSlides[currentSlide] || heroSlides[0] || {};
          const slideBg = slide.backgroundImage || content.hero?.backgroundImage;
          const overlay =
            typeof content.hero?.overlayOpacity === "number"
              ? content.hero.overlayOpacity
              : 0.65;
          return (
            <div className="absolute inset-0 z-0 overflow-hidden bg-[var(--land-blue-deep)] select-none pointer-events-none">
              {content.hero?.video ? (
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                  <video
                    key={content.hero.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    controls={false}
                    tabIndex={-1}
                    aria-hidden="true"
                    controlsList="nodownload nofullscreen noremoteplayback"
                    className="object-cover object-center w-full h-full opacity-40 filter brightness-110 contrast-110 saturate-110 pointer-events-none select-none"
                    style={{ pointerEvents: "none" }}
                    src={content.hero.video}
                  />
                </div>
              ) : null}
              {slideBg ? (
                <MediaImage
                  src={slideBg}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover object-center opacity-50"
                />
              ) : null}
              <div
                className="absolute inset-0 z-10 pointer-events-none select-none"
                style={{
                  background: `linear-gradient(to right, color-mix(in srgb, var(--land-blue-deep) ${Math.round(overlay * 100)}%, transparent), color-mix(in srgb, var(--land-blue-mid) ${Math.round(overlay * 70)}%, transparent), transparent)`,
                }}
              />
            </div>
          );
        })()}

        {/* Banner Main Content — mobile: pin text+photo to bottom; desktop: classic left text */}
        <div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 w-full h-full flex items-end sm:items-center pb-0 pt-5 sm:py-6 lg:py-0 min-h-[420px] sm:min-h-[460px] lg:min-h-0 lg:h-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-6 items-end sm:items-center w-full mt-auto sm:my-auto">

            {/* LEFT: slogans */}
            <div className="lg:col-span-8 flex flex-col gap-2 sm:gap-3.5 text-left items-start z-30 max-w-3xl min-w-0 w-[58%] sm:w-full pr-1 sm:pr-[38%] md:pr-[36%] lg:pr-[8%] pb-3 sm:pb-0 self-end sm:self-auto">

              <motion.div
                key={`badge-${currentSlide}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-[var(--land-gold)] text-slate-950 text-[10px] sm:text-sm font-black px-2.5 sm:px-4.5 py-1 sm:py-1.5 rounded-full shadow-xl border border-white max-w-full"
              >
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[var(--land-blue)] animate-pulse shrink-0" />
                <span className="leading-snug line-clamp-2 sm:line-clamp-none">
                  {lang === "kn"
                    ? (heroSlides[currentSlide] || heroSlides[0] || {}).badgeTitleKn
                    : (heroSlides[currentSlide] || heroSlides[0] || {}).badgeTitleEn}
                </span>
              </motion.div>

              <motion.div
                key={`text-${currentSlide}`}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-1.5 sm:gap-2 text-white w-full min-w-0"
              >
                <h1 className="text-sm sm:text-3xl lg:text-4xl font-black leading-snug sm:leading-tight tracking-tight drop-shadow-md flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-0.5 sm:gap-2 text-white">
                  <span>
                    {lang === "kn"
                      ? (heroSlides[currentSlide] || heroSlides[0] || {}).slogan1Kn
                      : (heroSlides[currentSlide] || heroSlides[0] || {}).slogan1En}
                  </span>
                  <span className="text-[var(--land-gold)] font-extrabold text-[11px] sm:text-3xl lg:text-4xl">
                    •{" "}
                    {lang === "kn"
                      ? (heroSlides[currentSlide] || heroSlides[0] || {}).slogan2Kn
                      : (heroSlides[currentSlide] || heroSlides[0] || {}).slogan2En}
                  </span>
                </h1>

                <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-black text-[var(--land-gold)] bg-[var(--land-blue-deep)]/80 backdrop-blur-md px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl w-fit shadow-lg border border-[var(--land-gold)]/60 max-w-full">
                  <span className="line-clamp-2 sm:line-clamp-none leading-snug">
                    ✦{" "}
                    {lang === "kn"
                      ? (heroSlides[currentSlide] || heroSlides[0] || {}).slogan3Kn
                      : (heroSlides[currentSlide] || heroSlides[0] || {}).slogan3En}
                  </span>
                </div>
                <p className="text-[10px] sm:text-sm font-bold text-slate-100 w-full max-w-2xl lg:max-w-3xl mt-0.5 sm:mt-1.5 leading-relaxed bg-[var(--land-blue-deep)]/80 backdrop-blur-xl p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[var(--land-gold)]/40 sm:border-2 shadow-2xl line-clamp-4 sm:line-clamp-none">
                  {lang === "kn"
                    ? (heroSlides[currentSlide] || heroSlides[0] || {}).subKn
                    : (heroSlides[currentSlide] || heroSlides[0] || {}).subEn}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile MLA portrait — flush to bottom border */}
        <div className="absolute right-0 bottom-0 z-30 sm:hidden w-[46%] max-w-[190px] h-[280px] pointer-events-none">
          <motion.div
            key={`mla-portrait-mobile-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-full"
          >
            <MediaImage
              src={
                (heroSlides[currentSlide] || heroSlides[0] || {}).mlaImage ||
                site.mlaPortrait ||
                "/Picsart_24-11-21_17-11-01-713 (1).png"
              }
              alt="Dr. Srinivas N. T. MLA Kudligi"
              fill
              sizes="190px"
              className="object-contain object-bottom object-right drop-shadow-2xl"
              priority
            />
          </motion.div>
        </div>

        {/* Desktop / tablet: right-flushed MLA portrait */}
        <div className="absolute right-0 bottom-0 z-30 hidden sm:block w-[280px] md:w-[330px] lg:w-[420px] xl:w-[450px] h-[320px] md:h-[360px] lg:h-[400px] xl:h-[425px] pointer-events-none">
          <motion.div
            key={`mla-portrait-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-full flex items-end justify-end"
          >
            <MediaImage
              src={
                (heroSlides[currentSlide] || heroSlides[0] || {}).mlaImage ||
                site.mlaPortrait ||
                "/Picsart_24-11-21_17-11-01-713 (1).png"
              }
              alt="Dr. Srinivas N. T. MLA Kudligi"
              fill
              sizes="(max-width: 1024px) 330px, 450px"
              className="object-contain object-bottom object-right drop-shadow-2xl"
              priority
            />
          </motion.div>
        </div>

      </section>

      {/* 3.5 CONSTITUENCY STATS BAR (Unique Royal Blue Political Banner with Gold Accent & Kudligi People Background) */}
      <div className="relative w-full text-white py-7 shadow-2xl overflow-hidden z-20 bg-gradient-to-r from-[var(--land-blue-mid)] via-[var(--land-blue-bright)] to-[var(--land-blue-light)]">

        {/* Low Opacity Full-Width Kudligi People & Community Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <MediaImage
            src={content.stats?.peopleBanner || content.leaders?.watermark}
            alt="Smiling People of Kudligi Constituency"
            fill
            sizes="100vw"
            className="object-cover object-center w-full h-full opacity-35 filter brightness-125 contrast-110 mix-blend-overlay"
            priority
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--land-blue-mid)]/80 via-[var(--land-blue-bright)]/60 to-[var(--land-blue-mid)]/80 z-[1]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">

          {/* Constituency stats — 2×2 on mobile/tablet, equation row on desktop */}
          <div className="grid grid-cols-2 lg:flex lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3.5 w-full">

            {/* 1. Gram Panchayats */}
            <div className="flex-1 w-full flex items-center gap-2 sm:gap-3.5 bg-white/20 backdrop-blur-md border-2 border-white px-2.5 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl shadow-xl hover:bg-white/30 transition-all min-w-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#FFD700] to-[#FFA500] text-slate-950 shrink-0 shadow-lg flex items-center justify-center border-2 border-white">
                <FaBuilding className="w-4 h-4 sm:w-6 sm:h-6 text-slate-950" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                  <span className="text-xl sm:text-3xl font-black text-white drop-shadow-md">
                    <AnimatedCounter end={Number(content.stats?.gpCount) || 33} duration={1.8} />
                  </span>
                  <span className="text-[9px] sm:text-xs font-black text-[var(--land-gold)] uppercase tracking-wider">G.P.</span>
                </div>
                <span className="text-[9px] sm:text-xs font-black text-white uppercase tracking-wide truncate">
                  {currentText.gpLabel}
                </span>
              </div>
            </div>

            {/* Plus Operator 1 */}
            <div className="hidden lg:flex items-center justify-center shrink-0 py-1 lg:py-0">
              <div className="w-8 h-8 rounded-full bg-[var(--land-gold)] text-slate-950 font-black text-xl flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                +
              </div>
            </div>

            {/* 2. Revenue Villages */}
            <div className="flex-1 w-full flex items-center gap-2 sm:gap-3.5 bg-white/20 backdrop-blur-md border-2 border-white px-2.5 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl shadow-xl hover:bg-white/30 transition-all min-w-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 text-white shrink-0 shadow-lg flex items-center justify-center border-2 border-white">
                <FaHome className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                  <span className="text-xl sm:text-3xl font-black text-white drop-shadow-md">
                    <AnimatedCounter end={Number(content.stats?.villagesCount) || 160} duration={2.2} suffix={content.stats?.villagesSuffix || "+"} />
                  </span>
                  <span className="text-[9px] sm:text-xs font-black text-[var(--land-gold)] uppercase tracking-wider">Villages</span>
                </div>
                <span className="text-[9px] sm:text-xs font-black text-white uppercase tracking-wide truncate">
                  {currentText.villagesLabel}
                </span>
              </div>
            </div>

            {/* Plus Operator 2 */}
            <div className="hidden lg:flex items-center justify-center shrink-0 py-1 lg:py-0">
              <div className="w-8 h-8 rounded-full bg-[var(--land-gold)] text-slate-950 font-black text-xl flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                +
              </div>
            </div>

            {/* 3. Hoblis */}
            <div className="flex-1 w-full flex items-center gap-2 sm:gap-3.5 bg-white/20 backdrop-blur-md border-2 border-white px-2.5 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl shadow-xl hover:bg-white/30 transition-all min-w-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shrink-0 shadow-lg flex items-center justify-center border-2 border-white">
                <FaMapMarkerAlt className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                  <span className="text-xl sm:text-3xl font-black text-white drop-shadow-md">
                    <AnimatedCounter end={Number(content.stats?.hoblisCount) || 4} duration={1.5} />
                  </span>
                  <span className="text-[9px] sm:text-xs font-black text-[var(--land-gold)] uppercase tracking-wider">Hoblis</span>
                </div>
                <span className="text-[9px] sm:text-xs font-black text-white uppercase tracking-wide truncate">
                  {currentText.hoblisLabel}
                </span>
              </div>
            </div>

            {/* Equals Operator */}
            <div className="hidden lg:flex items-center justify-center shrink-0 py-1 lg:py-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-[#FFD700] text-slate-950 font-black text-2xl flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-amber-300/40">
                =
              </div>
            </div>

            {/* 4. Constituency MLA */}
            <div className="flex-1 w-full flex items-center gap-2 sm:gap-3.5 bg-gradient-to-r from-[var(--land-gold)]/30 to-amber-500/20 backdrop-blur-md border-2 border-[var(--land-gold)] px-2.5 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl shadow-2xl hover:bg-white/30 transition-all ring-2 ring-[var(--land-gold)]/40 min-w-0">
              <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white bg-white shadow-lg shrink-0">
                <MediaImage
                  src={site.mlaPortrait}
                  alt="Dr. Srinivas N. T. MLA"
                  fill
                  sizes="48px"
                  className="object-cover object-top scale-110"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                  <span className="text-xl sm:text-3xl font-black text-[var(--land-gold)] drop-shadow-md">
                    <AnimatedCounter end={1} duration={1} />
                  </span>
                  <span className="text-[9px] sm:text-xs font-black text-white uppercase tracking-wider">
                    {lang === 'kn' ? 'ಕ್ಷೇತ್ರ / ಶಾಸಕರು' : 'Constituency MLA'}
                  </span>
                </div>
                <span className="text-[9px] sm:text-xs font-black text-white uppercase tracking-wide truncate">
                  {lang === 'kn' ? site.nameShortKn : site.nameShortEn}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4. ABOUT SECTION — Clean Light Theme with Seamless MLA Photo Background & Vidhana Soudha Watermark */}
      <section id="about" className="relative bg-[var(--land-surface)] py-14 sm:py-16 overflow-hidden text-slate-900">

        {/* Vidhana Soudha low-opacity background image watermark */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-10">
          <MediaImage
            src={content.about?.watermark || content.media?.watermark}
            alt="Background watermark"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter grayscale"
          />
        </div>

        {/* Seamless Full-Opacity MLA Photo — fade on small screens so bio stays readable */}
        <div className="absolute left-0 bottom-0 top-0 w-full sm:w-5/12 lg:w-[38%] z-0 pointer-events-none select-none opacity-25 sm:opacity-100">
          <MediaImage
            src="/mla_about_hd_cutout.png"
            alt="Dr. Srinivas N. T. MLA"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-contain object-bottom filter drop-shadow-lg"
            priority
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Right-Shifted Content: Shifted to lg:col-start-6 for perfect spacing */}
            <div className="lg:col-span-7 lg:col-start-6 flex flex-col gap-5 text-left pl-0 lg:pl-4">

              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-[#001D56]">
                {currentText.aboutHeading}
              </h2>
              <div className="w-20 h-1.5 bg-[#FFD700] rounded-full shadow-sm" />

              {/* Bio Paragraph */}
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify font-bold bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-md">
                {currentText.aboutDesc}
              </p>

              {/* Stats row — animated on scroll */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full mt-1">
                {[
                  { num: currentText.aboutStatYear, label: currentText.aboutStatYearLabel },
                  { num: currentText.aboutStatVillages, label: currentText.aboutStatVillagesLabel },
                  { num: currentText.aboutStatInitiatives, label: currentText.aboutStatInitiativesLabel },
                  { num: currentText.aboutStatBeneficiaries, label: currentText.aboutStatBeneficiariesLabel },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex flex-col items-start bg-white border-2 border-slate-200/90 rounded-2xl px-4 py-3 gap-0.5 shadow-md hover:border-[#002B7F] transition-all"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-[#002B7F]">{s.num}</span>
                    <span className="text-slate-600 text-[11px] font-extrabold uppercase tracking-wide leading-tight">{s.label}</span>
                  </motion.div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. DEVELOPMENTS FOCUS SECTOR CARDS & INTERACTIVE VILLAGE MAP (ಅಭಿವೃದ್ಧಿಗಳು - Full Width Royal Blue Banner) */}
      <section id="developments" className="relative bg-gradient-to-br from-[var(--land-blue)] via-[var(--land-blue-alt)] to-[var(--land-blue-bright)] pt-10 sm:pt-12 pb-14 sm:pb-16 border-y-4 border-white text-white shadow-2xl overflow-hidden">

        {/* Background Video Player for Development Projects Section */}
        <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
          <video
            key={content.media?.developmentsVideo || "dev-bg"}
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            controls={false}
            tabIndex={-1}
            aria-hidden="true"
            controlsList="nodownload nofullscreen noremoteplayback"
            onLoadedMetadata={(e) => {
              if (e.target.currentTime < 5.5) {
                e.target.currentTime = 5.5;
              }
            }}
            onTimeUpdate={(e) => {
              if (e.target.currentTime < 5.5) {
                e.target.currentTime = 5.5;
              }
            }}
            className="object-cover object-center w-full h-full opacity-65 filter brightness-110 contrast-110 pointer-events-none select-none"
            style={{ pointerEvents: "none" }}
            src={
              content.media?.developmentsVideo ||
              "/lv_0_20251107090516.mp4#t=5.5"
            }
          />
          {/* Soft Translucent Overlay for High Video Visibility & Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#001438]/50 via-[#002B7F]/40 to-[#001D56]/50 z-[1]" />
        </div>

        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-7 sm:gap-9">

          <header className="text-center max-w-3xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl lg:text-[2.65rem] font-black tracking-tight text-white leading-tight"
              style={{ fontFamily: "var(--land-font-display)" }}
            >
              {currentText.devHeading}
            </h2>
            <p className="text-white/75 text-sm sm:text-[15px] mt-3 max-w-xl mx-auto font-medium leading-relaxed">
              {currentText.devDesc}
            </p>
            <div className="w-16 h-1 bg-[var(--land-gold)] mx-auto mt-4 rounded-full" />
          </header>

          <VillageDevelopmentMap
            lang={lang}
            developments={publicDevelopments}
          />
        </div>
      </section>

      {/* 6. MLA TOUR PROGRAM CALENDAR & OFFICIAL SCHEDULE DOCUMENT (ಶಾಸಕರ ಪ್ರವಾಸ ಕಾರ್ಯಕ್ರಮ - Clean White Theme) */}
      <section id="media" className="relative bg-[var(--land-surface)] pt-4 sm:pt-6 pb-12 text-slate-900 shadow-xl overflow-hidden">

        {/* Vidhana Soudha & Kudligi Watermark Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-10 select-none">
          <MediaImage
            src={content.about?.watermark || content.media?.watermark}
            alt="Vidhana Soudha Watermark"
            fill
            sizes="100vw"
            className="object-cover object-center filter contrast-125"
          />
        </div>

        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-8">

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-[var(--land-blue)] drop-shadow-sm">
              {currentText.tourHeading}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-1.5 font-bold max-w-3xl mx-auto text-center px-2 leading-relaxed">
              {currentText.tourDesc}
            </p>
            <div className="w-20 h-1.5 bg-[var(--land-blue-bright)] mx-auto mt-2 rounded-full shadow-md" />
          </div>

          {/* Interactive MLA Tour Calendar & Official Schedule Sheet Component */}
          <MlaTourCalendar
            lang={lang}
            scheduleImage={content.media?.tourScheduleImage}
            schedules={content.media?.tourSchedules || []}
          />

        </div>
      </section>

      {/* 6.5 MEDIA REPORTS & PRESS CLIPPINGS SECTION (ಮಾಧ್ಯಮ ವರದಿಗಳು) */}
      <MediaReportsSection
        lang={lang}
        reports={content.media?.reports || []}
      />

      {/* 6.8 MEDICAL REFERRAL GLIMPSE SECTION (ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಕೋಶ) */}
      <MedicalReferralGlimpseSection lang={lang} />

      {/* 7. TOURIST PLACES & CULTURAL HERITAGE SECTION (ಪ್ರವಾಸಿ ತಾಣಗಳು - Royal Blue Theme) */}
      <section id="gallery" className="relative py-16 bg-gradient-to-br from-[#001438] via-[#002B7F] to-[#003B95] shadow-2xl overflow-hidden text-white">

        {/* Tourism Map & Heritage Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none select-none">
          <MediaImage
            src={content.gallery?.watermark}
            alt="Kudligi Tourism Map Background"
            fill
            sizes="100vw"
            className="object-cover filter contrast-125 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">

          <div className="text-center flex flex-col items-center gap-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-white drop-shadow-md">
              {currentText.galleryHeading}
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-1.5 max-w-2xl mx-auto font-semibold leading-relaxed">
              {currentText.galleryDesc}
            </p>
            <div className="w-24 h-1.5 bg-[#FFD700] mx-auto mt-2 rounded-full shadow-md" />
          </div>

          {/* Horizontal snap carousel on phones; grid from tablet up */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0 -mx-1 px-1 scrollbar-none">
            {[
              ...galleryItems.map((item, index) => ({
                id: item.id || `g-${index}`,
                title: lang === "kn" ? item.titleKn : item.titleEn,
                desc: lang === "kn" ? item.descKn : item.descEn,
                image: item.image,
                badge: lang === "kn" ? "ಪ್ರವಾಸಿ ತಾಣ" : "Heritage Spot",
                index: index + 1,
              })),
              {
                id: "farmers",
                title: currentText.farmersHeading || (lang === "kn" ? "ಕೂಡ್ಲಿಗಿ ರೈತರ ಪ್ರಮುಖ ಬೆಳೆಗಳು" : "Kudligi Agricultural Crops"),
                desc: currentText.farmersDesc || (lang === "kn" ? "ಸ್ಥಳೀಯ ಕೂಡ್ಲಿಗಿ ಭಾಗದ ರೈತರ ಪ್ರಮುಖ ಕೃಷಿ ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು." : "Commercial crops and agriculture in Kudligi."),
                image: content.gallery?.farmersImage || "/gallery_farmers.png",
                badge: currentText.farmersBadge || (lang === "kn" ? "ಕೃಷಿ & ರೈತ" : "Agriculture & Farmers"),
                index: galleryItems.length + 1,
              },
            ].map((card, index) => (
              <motion.div
                key={card.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gradient-to-b from-[#001D56]/90 via-[#002B7F]/80 to-[#001438]/95 border-2 border-white/20 hover:border-[#FFD700] rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl hover:shadow-[#FFD700]/20 transition-all duration-300 flex flex-col group snap-center shrink-0 w-[78vw] max-w-[300px] md:w-auto md:max-w-none md:shrink"
              >
                {/* Top Image Container */}
                <div className="relative w-full h-[210px] overflow-hidden shrink-0">
                  <MediaImage
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Top-Left Index Badge */}
                  <span className="absolute top-3 left-3 bg-[#FFD700] text-slate-950 text-xs font-black px-3 py-0.5 rounded-full shadow-lg border border-white">
                    0{card.index}
                  </span>
                  {/* Top-Right Category Pill */}
                  <span className="absolute top-3 right-3 bg-[#001438]/90 text-[#FFD700] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#FFD700]/50 backdrop-blur-md shadow-md">
                    ✦ {card.badge}
                  </span>
                </div>

                {/* Card Content Body */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-[#FFD700] transition-colors">
                      {card.title}
                    </h3>
                    <div className="w-10 h-1 bg-[#FFD700] rounded-full shadow-sm" />
                    <p className="text-slate-200 text-xs leading-relaxed font-semibold bg-white/5 p-3 rounded-2xl border border-white/10 mt-0.5">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. COMPLAINTS & SUGGESTIONS INPUT FORM (ದೂರುಗಳು - Clean White Theme) */}
      <section id="grievance-form" className="relative py-16 bg-white border-t-4 border-[#FFD700] shadow-xl overflow-hidden text-slate-900">

        {/* Background Watermark */}
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none select-none">
          <MediaImage
            src={content.stats?.peopleBanner || content.leaders?.watermark}
            alt="Kudligi Background"
            fill
            sizes="100vw"
            className="object-cover filter grayscale contrast-125"
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-center flex flex-col items-center gap-2"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-[#001D56]">
              {lang === "kn" ? "ದೂರುಗಳು ಮತ್ತು ಸಲಹೆಗಳ ಪೋರ್ಟಲ್" : "COMPLAINTS & SUGGESTIONS PORTAL"}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-bold">
              {lang === "kn"
                ? "ನಿಮ್ಮ ಶಾಸಕರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ. ನಿಮ್ಮ ಅಹವಾಲುಗಳನ್ನು ನೇರವಾಗಿ ದಾಖಲಿಸಿ."
                : "Connect with your MLA. Log your suggestions or grievances directly."}
            </p>
            <div className="w-20 h-1.5 bg-[#FFD700] mx-auto mt-2 rounded-full shadow-md" />
          </motion.div>

          {/* Form Card Grid */}
          <div className="bg-slate-50 rounded-3xl border-2 border-[#002B7F]/30 p-6 sm:p-10 shadow-2xl">
            {formSubmitted ? (
              <div className="text-center py-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#001D56] text-[#FFD700] flex items-center justify-center text-3xl font-black shadow-xl">
                  ✓
                </div>
                <span className="text-slate-900 font-black text-lg sm:text-xl mt-2">
                  {currentText.formSuccess}
                </span>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
                {formError ? (
                  <p className="text-rose-700 text-xs font-bold bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                    {formError}
                  </p>
                ) : null}

                {/* Row 1: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[#001D56] text-xs font-black uppercase tracking-wider">
                      {currentText.formName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="bg-white border-2 border-slate-300 rounded-xl p-3.5 text-slate-900 text-xs sm:text-sm font-bold focus:border-[#002B7F] focus:outline-none transition-colors shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[#001D56] text-xs font-black uppercase tracking-wider">
                      {currentText.formPhone} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="bg-white border-2 border-slate-300 rounded-xl p-3.5 text-slate-900 text-xs sm:text-sm font-bold focus:border-[#002B7F] focus:outline-none transition-colors shadow-sm"
                    />
                  </div>
                </div>

                {/* Row 2: Dropdown selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#001D56] text-xs font-black uppercase tracking-wider">
                    {currentText.formVillage} *
                  </label>
                  <select
                    required
                    value={form.village}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, village: e.target.value }))
                    }
                    className="bg-white border-2 border-slate-300 rounded-xl p-3.5 text-slate-900 text-xs sm:text-sm font-bold focus:border-[#002B7F] focus:outline-none transition-colors cursor-pointer shadow-sm"
                  >
                    <option value="" className="bg-white text-slate-900">
                      {currentText.formVillagePlaceholder}
                    </option>
                    {(content.grievance?.villages || []).map((v) => (
                      <option
                        key={v.value}
                        value={v.value}
                        className="bg-white text-slate-900"
                      >
                        {v.labelEn} / {v.labelKn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#001D56] text-xs font-black uppercase tracking-wider">
                    {currentText.formSubject}
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    placeholder="e.g. Drinking water / Road / Electricity"
                    className="bg-white border-2 border-slate-300 rounded-xl p-3.5 text-slate-900 text-xs sm:text-sm font-bold focus:border-[#002B7F] focus:outline-none transition-colors shadow-sm"
                  />
                </div>

                {/* Message textarea */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#001D56] text-xs font-black uppercase tracking-wider">
                    {currentText.formMessage} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    className="bg-white border-2 border-slate-300 rounded-xl p-3.5 text-slate-900 text-xs sm:text-sm font-bold focus:border-[#002B7F] focus:outline-none transition-colors shadow-sm"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={formSending}
                  className="mt-2 bg-[#001D56] hover:bg-[#002B7F] text-[#FFD700] font-black text-sm py-4 rounded-2xl shadow-xl transition-all duration-300 border-2 border-[#FFD700] cursor-pointer hover:scale-[1.02] active:scale-95 tracking-wide disabled:opacity-60"
                >
                  {formSending
                    ? "..."
                    : `${currentText.formSubmit || "Submit"} ➔`}
                </button>

              </form>
            )}
          </div>

        </div>
      </section>

      {/* FOOTER - Royal Blue & Saffron Gold Theme */}
      <footer className="w-full bg-gradient-to-b from-[#001030] via-[#001948] to-[#000B22] border-t-4 border-[var(--land-gold)] text-white relative z-10 overflow-hidden shadow-2xl">

        {/* Dynamic Background Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 rounded-full filter blur-[120px] pointer-events-none" />

        {/* Main Footer Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-start">

          {/* LEFT COLUMN: MLA Profile & Leadership Branding (4 Cols) */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start gap-5 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-5 bg-white/5 border border-white/15 p-4 sm:p-5 rounded-3xl backdrop-blur-md shadow-xl w-full">
              {/* Circular Orbit MLA Photo */}
              <div className="relative w-[130px] h-[130px] shrink-0">
                <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "20s" }}>
                  <defs>
                    <path id="orbitPath" d="M80,80 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" />
                  </defs>
                  <text fill="var(--land-gold)" fontSize="8.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="2.5">
                    <textPath href="#orbitPath" startOffset="0%">{currentText.footerOrbit}</textPath>
                  </text>
                </svg>
                <div className="absolute inset-[14px] rounded-full overflow-hidden border-3 border-[var(--land-gold)] shadow-2xl bg-[#001742]">
                  <MediaImage
                    src={site.mlaPortrait}
                    alt="Dr. Srinivas N. T."
                    fill
                    sizes="128px"
                    className="object-cover object-top"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-start gap-1">
                <span className="bg-[var(--land-gold)] text-slate-950 font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
                  {lang === 'kn' ? 'ಶಾಸಕರು - ಕೂಡ್ಲಿಗಿ' : 'MLA - KUDLIGI'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-wide leading-tight mt-1">
                  {lang === 'kn' ? site.nameShortKn : site.nameShortEn}
                </h3>
                <p className="text-white/70 text-xs font-semibold">
                  {currentText.footerRole}
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium max-w-md">
              {currentText.footerMotto}
            </p>

            {/* Values / Principles Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
              {currentText.values.map((v, i) => (
                <span key={i} className="text-[10px] font-black text-[#FFD700] bg-white/10 border border-[#FFD700]/30 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm">
                  ✦ {v}
                </span>
              ))}
            </div>
          </div>

          {/* MIDDLE COLUMN: Quick Links Navigation (3 Cols) */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start gap-4">
            <h4 className="text-[var(--land-gold)] font-black text-sm uppercase tracking-widest flex items-center gap-2 border-b-2 border-[var(--land-gold)]/40 pb-2 w-full">
              <span>✦</span>
              <span>{currentText.quickLinks}</span>
            </h4>

            <nav className="flex flex-col gap-2.5 w-full">
              {[
                { id: "home", label: currentText.navHome },
                { id: "about", label: currentText.navAbout },
                { id: "developments", label: currentText.navDevelopments },
                { id: "media", label: currentText.navMedia },
                { id: "gallery", label: currentText.navGallery },
                { id: "grievance-form", label: currentText.navGrievance },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleScroll(link.id)}
                  className="group flex items-center gap-2 text-white/80 hover:text-[var(--land-gold)] text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 text-left py-1 px-2 rounded-lg hover:bg-white/10"
                >
                  <span className="text-[var(--land-gold)] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-transform">➔</span>
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* RIGHT COLUMN: Official Contact & Headquarters Info (4 Cols) */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start gap-4">
            <h4 className="text-[var(--land-gold)] font-black text-sm uppercase tracking-widest flex items-center gap-2 border-b-2 border-[var(--land-gold)]/40 pb-2 w-full">
              <span>✦</span>
              <span>{currentText.footerContact}</span>
            </h4>

            <div className="flex flex-col gap-3 w-full">
              {/* Phone Link */}
              <a
                href={content.contact?.phoneHref}
                className="flex items-center gap-3 bg-white/5 border border-white/15 hover:border-[var(--land-gold)] p-3 rounded-2xl text-white/90 hover:text-white transition-all shadow-md group"
              >
                <div className="w-8 h-8 rounded-xl bg-[var(--land-gold)] text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                  <FaPhoneAlt className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold group-hover:text-[var(--land-gold)] transition-colors">
                  {content.contact?.phone}
                </span>
              </a>

              {/* Email Link */}
              <a
                href={`mailto:${content.contact?.email}`}
                className="flex items-center gap-3 bg-white/5 border border-white/15 hover:border-[var(--land-gold)] p-3 rounded-2xl text-white/90 hover:text-white transition-all shadow-md group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <FaEnvelope className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold group-hover:text-[var(--land-gold)] transition-colors truncate">
                  {content.contact?.email}
                </span>
              </a>

              {/* Office Address */}
              <div className="bg-white/5 border border-white/15 p-3 rounded-2xl flex items-start gap-3">
                <span className="text-base mt-0.5">📍</span>
                <p className="text-white/70 text-xs leading-relaxed font-semibold">
                  {currentText.footerAddress}
                </p>
              </div>
            </div>

            {/* Branded Social Media Buttons */}
            <div className="flex items-center gap-3 mt-1">
              {[
                { icon: FaFacebookF, href: content.contact?.facebook || "https://facebook.com", label: "Facebook", color: "bg-[#1877F2]" },
                { icon: FaInstagram, href: content.contact?.instagram || "https://instagram.com", label: "Instagram", color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" },
                { icon: FaYoutube, href: content.contact?.youtube || "https://youtube.com", label: "YouTube", color: "bg-[#FF0000]" },
                { icon: FaTwitter, href: content.contact?.twitter || "https://twitter.com", label: "Twitter", color: "bg-[#1DA1F2]" },
              ].map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 rounded-xl ${color} text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 border border-white/30`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Official Emblem Container */}
            <div className="flex items-center gap-4 bg-white/10 border border-white/20 px-4 py-2 rounded-2xl shadow-md mt-1">
              <div className="relative w-8 h-8">
                <MediaImage src={site.karnatakaLogo} alt="Karnataka Seal" fill className="object-contain" sizes="32px" />
              </div>
              <div className="h-6 w-px bg-white/30" />
              <div className="relative w-8 h-8">
                <MediaImage src={site.partyLogo} alt="INC Logo" fill className="object-contain" sizes="32px" />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="border-t border-white/15 py-5 px-4 bg-[#00081B] text-center relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-white/60 font-semibold">{currentText.footerCopy}</span>
            <span className="text-[var(--land-gold)] font-bold">{currentText.footerDev}</span>
          </div>
        </div>

      </footer>

    </div>
  );
}
