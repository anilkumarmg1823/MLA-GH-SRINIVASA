
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import VillageDevelopmentMap from "./components/VillageDevelopmentMap";
import MlaTourCalendar from "./components/MlaTourCalendar";
import MediaImage from "@/components/landing-cms/MediaImage";
import { landingContentSeed, LEADER_BADGE_TONES } from "@/data/landingContentSeed";
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
  FaFacebookF, FaTwitter, FaYoutube, FaInstagram, FaPhoneAlt, FaEnvelope 
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
  const leaderItems = content.leaders?.items || [];
  const leadersLoop = [...leaderItems, ...leaderItems];
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

  return (
    <div
      className="min-h-screen w-full bg-[var(--land-bg)] text-white flex flex-col justify-between relative selection:bg-[var(--land-link)] selection:text-white"
      style={{
        ...brandVars,
        fontFamily: "var(--land-font-body)",
      }}
    >
      
      {/* 1. FLOATING SOCIAL SIDEBAR (Matching reference image: Black arrow header + stacked solid brand blocks) */}
      <div className="fixed left-0 top-[35%] z-40 hidden xl:flex flex-col shadow-2xl overflow-hidden rounded-r-lg border-y border-r border-black/20">
        {/* Top collapse / left arrow header */}
        <div className="bg-black p-3.5 text-white flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors">
          <span className="text-sm font-bold">←</span>
        </div>
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

      {/* 2. FLOATING GRIEVANCES VERTICAL TAB (Right Edge - Royal Gold Theme) */}
      <button 
        onClick={() => handleScroll("grievance-form")}
        className="fixed right-0 top-[90%] -translate-y-1/2 z-50 bg-[var(--land-gold)] hover:bg-white text-slate-950 font-black px-2.5 py-4 text-xs sm:text-sm rounded-l-xl shadow-2xl border-2 border-r-0 border-white transition-all duration-300 cursor-pointer flex items-center justify-center tracking-widest text-slate-900 hover:px-3.5"
        style={{ writingMode: "vertical-rl" }}
      >
        <span>{currentText.grievancesTab}</span>
      </button>

      {/* Raw CSS Injection for Background Float Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -45px) scale(1.18); }
        }
        .rotate-270 {
          transform: rotate(-90deg);
        }
      `}} />

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[var(--land-blue-deep)] via-[var(--land-blue-mid)] to-[var(--land-blue-bright)] border-b-4 border-[var(--land-gold)] shadow-xl backdrop-blur-md">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Logo Brand Header - Side-by-Side State Seal and Party Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Government State Seal (Hidden on mobile for responsiveness) */}
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

            <div className="flex flex-col text-left">
              <span className="font-black text-xs sm:text-base tracking-wider uppercase text-white leading-tight">
                {currentText.navbarTitle}
              </span>
              <span className="text-[var(--land-gold)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5">
                {site.taglineEn} | {site.taglineKn}
              </span>
            </div>
          </div>

          {/* Navigation Items (Clean Text Layout with Quick Links Dropdown) */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-black tracking-wide shrink-0">
            <button onClick={() => handleScroll("home")} className="text-[var(--land-gold)] hover:text-white transition-colors">{currentText.navHome}</button>
            <button onClick={() => handleScroll("about")} className="text-white/90 hover:text-[var(--land-gold)] transition-colors">{currentText.navAbout}</button>
            <button onClick={() => handleScroll("developments")} className="text-white/90 hover:text-[var(--land-gold)] transition-colors">{currentText.navDevelopments}</button>
            <Link
              href="/leaders"
              className="text-white/90 hover:text-[var(--land-gold)] transition-colors font-black"
            >
              {currentText.navLeaders}
            </Link>

            {/* Quick Links Dropdown Menu (Contains Medical Referral, Gallery, Grievance & Govt Links - Clean Text Only) */}
            <div className="relative">
              <button
                onClick={() => setQuickLinksOpen(!quickLinksOpen)}
                className="inline-flex items-center gap-1.5 text-white/90 hover:text-[var(--land-gold)] transition-colors font-black bg-[var(--land-blue-deep)]/80 px-4 py-1.5 rounded-full border border-[var(--land-gold)]/40 shadow-sm text-xs cursor-pointer"
              >
                <span>{currentText.quickLinks}</span>
                <span className="text-[10px] text-[var(--land-gold)]">{quickLinksOpen ? "▲" : "▼"}</span>
              </button>

              {quickLinksOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--land-blue-deep)] backdrop-blur-2xl rounded-2xl p-2 shadow-2xl border-2 border-[var(--land-gold)]/50 flex flex-col gap-1 z-50">
                  <Link
                    href="/medical-referral"
                    onClick={() => setQuickLinksOpen(false)}
                    className="px-3.5 py-2 text-xs font-black text-slate-200 hover:text-[var(--land-gold)] hover:bg-white/10 rounded-xl transition-all text-left"
                  >
                    {currentText.medicalReferral}
                  </Link>

                  <button
                    onClick={() => { handleScroll("gallery"); setQuickLinksOpen(false); }}
                    className="px-3.5 py-2 text-xs font-black text-slate-200 hover:text-[var(--land-gold)] hover:bg-white/10 rounded-xl transition-all text-left"
                  >
                    {currentText.photoGallery}
                  </button>

                  <button
                    onClick={() => { handleScroll("grievance-form"); setQuickLinksOpen(false); }}
                    className="px-3.5 py-2 text-xs font-black text-slate-200 hover:text-[var(--land-gold)] hover:bg-white/10 rounded-xl transition-all text-left"
                  >
                    {currentText.grievancesSuggestions}
                  </button>

                  <a
                    href={content.quickLinks?.sevaSindhuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setQuickLinksOpen(false)}
                    className="px-3.5 py-2 text-xs font-black text-slate-200 hover:text-[var(--land-gold)] hover:bg-white/10 rounded-xl transition-all text-left"
                  >
                    {currentText.sevaSindhu}
                  </a>

                  <a
                    href={content.quickLinks?.districtPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setQuickLinksOpen(false)}
                    className="px-3.5 py-2 text-xs font-black text-slate-200 hover:text-[var(--land-gold)] hover:bg-white/10 rounded-xl transition-all text-left"
                  >
                    {currentText.districtPortal}
                  </a>
                </div>
              )}
            </div>

          </nav>

          {/* Header Action Badges, Language Selector & Login Button */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[var(--land-blue-deep)]/80 p-1 rounded-full border border-[var(--land-gold)]/40 h-fit">
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-black rounded-full transition-all duration-300 ${
                  lang === "en" 
                    ? "bg-[var(--land-gold)] text-slate-900 shadow-md" 
                    : "text-white/70 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("kn")}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-black rounded-full transition-all duration-300 ${
                  lang === "kn" 
                    ? "bg-[var(--land-gold)] text-slate-900 shadow-md" 
                    : "text-white/70 hover:text-white"
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* D.K. Shivakumar Chief Minister Badge (Hidden on mobile to save space) */}
            <div className="hidden md:flex items-center gap-2 bg-[var(--land-blue-deep)]/80 px-3 py-1 rounded-full border border-[var(--land-gold)]/40 shadow-sm h-fit">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--land-gold)] bg-white shrink-0">
                <MediaImage
                  src={site.cmPhoto}
                  alt="D.K. Shivakumar"
                  fill
                  sizes="32px"
                  className="object-cover object-top"
                />
              </div>
              <div className="flex flex-col text-left justify-center">
                <span className="text-white font-extrabold text-[10px] leading-tight tracking-wide">
                  {lang === 'kn' ? site.cmNameKn : site.cmNameEn}
                </span>
                <span className="text-[var(--land-gold)] font-extrabold text-[8px] tracking-wide leading-normal">
                  {lang === 'kn' ? site.cmTitleKn : site.cmTitleEn}
                </span>
              </div>
            </div>

            {/* Login Button */}
            <Link
              href="/login"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs md:text-sm font-black text-[var(--land-gold)] border-2 border-[var(--land-gold)] rounded-full hover:bg-[var(--land-gold)] hover:text-slate-900 transition-all duration-300 shadow-md whitespace-nowrap inline-flex items-center"
            >
              {currentText.login || 'LOGIN'}
            </Link>

          </div>
        </div>
      </header>

      {/* 3. HERO BANNER AREA (Rich Royal Blue Theme with Animated Slogan & Photo Carousel) */}
      <section
        id="home"
        className="relative w-full overflow-hidden bg-gradient-to-r from-[var(--land-blue-deep)] via-[var(--land-blue-mid)] to-[var(--land-blue-bright)] border-t-4 border-[var(--land-blue-bright)] border-b-4 border-[var(--land-gold)] shadow-2xl min-h-[400px] sm:min-h-[460px] lg:h-[510px]"
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
            <video
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              className="object-cover object-center w-full h-full opacity-40 filter brightness-110 contrast-110 saturate-110 pointer-events-none select-none"
              style={{ pointerEvents: "none" }}
            >
              <source src={content.hero.video} type="video/mp4" />
            </video>
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

        {/* Banner Main Content with Animated Slogan & Photo Carousel */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full h-full flex flex-col justify-center py-6 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto">
            
            {/* LEFT COLUMN: Animated Development Work Slogans (Expanded Width 8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-3.5 text-left items-start z-30 max-w-3xl">
              
              <motion.div
                key={`badge-${currentSlide}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2.5 bg-[var(--land-gold)] text-slate-950 text-xs sm:text-sm font-black px-4.5 py-1.5 rounded-full shadow-xl border border-white"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--land-blue)] animate-pulse" />
                <span>
                  {lang === "kn"
                    ? (heroSlides[currentSlide] || heroSlides[0] || {}).badgeTitleKn
                    : (heroSlides[currentSlide] || heroSlides[0] || {}).badgeTitleEn}
                </span>
              </motion.div>

              {/* Slogan & Description Text Card */}
              <motion.div
                key={`text-${currentSlide}`}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-2 text-white w-full"
              >
                {/* Main Heading & Sub Heading in ONE Single Line */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight drop-shadow-md flex flex-wrap items-center gap-2 text-white">
                  <span>{lang === "kn" ? (heroSlides[currentSlide] || heroSlides[0] || {}).slogan1Kn : (heroSlides[currentSlide] || heroSlides[0] || {}).slogan1En}</span>
                  <span className="text-[var(--land-gold)] font-extrabold">• {lang === "kn" ? (heroSlides[currentSlide] || heroSlides[0] || {}).slogan2Kn : (heroSlides[currentSlide] || heroSlides[0] || {}).slogan2En}</span>
                </h1>

                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-[var(--land-gold)] bg-[var(--land-blue-deep)]/80 backdrop-blur-md px-4 py-1.5 rounded-xl w-fit mt-0.5 shadow-lg border border-[var(--land-gold)]/60">
                  <span>✦ {lang === "kn" ? (heroSlides[currentSlide] || heroSlides[0] || {}).slogan3Kn : (heroSlides[currentSlide] || heroSlides[0] || {}).slogan3En}</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-100 w-full max-w-2xl lg:max-w-3xl mt-1.5 leading-relaxed bg-[var(--land-blue-deep)]/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border-2 border-[var(--land-gold)]/40 shadow-2xl">
                  {lang === "kn"
                    ? (heroSlides[currentSlide] || heroSlides[0] || {}).subKn
                    : (heroSlides[currentSlide] || heroSlides[0] || {}).subEn}
                </p>
              </motion.div>

            </div>

          </div>
        </div>

        {/* Right End Flushed Dynamic MLA Portrait Image (Changes per Slide) */}
        <div className="absolute right-0 lg:right-6 bottom-0 z-30 w-[300px] sm:w-[420px] lg:w-[540px] h-[350px] sm:h-[430px] lg:h-[485px] pointer-events-none">
          <motion.div
            key={`mla-portrait-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-full flex items-end justify-end"
          >
            <MediaImage
              src={(heroSlides[currentSlide] || heroSlides[0] || {}).mlaImage}
              alt="Dr. Srinivas N. T. MLA Kudligi"
              fill
              sizes="(max-width: 640px) 300px, (max-width: 1024px) 420px, 540px"
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-5">
          
          {/* Grid of Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 w-full lg:w-auto flex-1">
            
            {/* 1. Gram Panchayats */}
            <div className="flex items-center gap-3.5 bg-white/20 backdrop-blur-md border-2 border-white px-5 py-3.5 rounded-2xl shadow-xl hover:bg-white/30 transition-all">
              <div className="relative w-12 h-12 rounded-xl bg-white p-1 overflow-hidden shrink-0 shadow-md flex items-center justify-center border border-white/80">
                <MediaImage
                  src={content.stats?.gpIcon}
                  alt="3D Gram Panchayat Building Icon"
                  fill
                  sizes="48px"
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                    <AnimatedCounter end={Number(content.stats?.gpCount) || 33} duration={1.8} />
                  </span>
                  <span className="text-xs font-black text-[var(--land-gold)] uppercase tracking-wider">G.P.</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wide">
                  {currentText.gpLabel}
                </span>
              </div>
            </div>

            {/* 2. Revenue Villages */}
            <div className="flex items-center gap-3.5 bg-white/20 backdrop-blur-md border-2 border-white px-5 py-3.5 rounded-2xl shadow-xl hover:bg-white/30 transition-all">
              <div className="relative w-12 h-12 rounded-xl bg-white p-1 overflow-hidden shrink-0 shadow-md flex items-center justify-center border border-white/80">
                <MediaImage
                  src={content.stats?.villagesIcon}
                  alt="3D Village Houses Icon"
                  fill
                  sizes="48px"
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                    <AnimatedCounter end={Number(content.stats?.villagesCount) || 160} duration={2.2} suffix={content.stats?.villagesSuffix || "+"} />
                  </span>
                  <span className="text-xs font-black text-[var(--land-gold)] uppercase tracking-wider">Villages</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wide">
                  {currentText.villagesLabel}
                </span>
              </div>
            </div>

            {/* 3. Hoblis */}
            <div className="flex items-center gap-3.5 bg-white/20 backdrop-blur-md border-2 border-white px-5 py-3.5 rounded-2xl shadow-xl hover:bg-white/30 transition-all col-span-2 md:col-span-1">
              <div className="relative w-12 h-12 rounded-xl bg-white p-1 overflow-hidden shrink-0 shadow-md flex items-center justify-center border border-white/80">
                <MediaImage
                  src={content.stats?.hoblisIcon}
                  alt="3D Hoblis Location Pin Icon"
                  fill
                  sizes="48px"
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                    <AnimatedCounter end={Number(content.stats?.hoblisCount) || 4} duration={1.5} />
                  </span>
                  <span className="text-xs font-black text-[var(--land-gold)] uppercase tracking-wider">Hoblis</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wide">
                  {currentText.hoblisLabel}
                </span>
              </div>
            </div>

          </div>

          {/* MLA Round Photo Badge Box */}
          <div className="flex items-center gap-4 bg-white/25 backdrop-blur-md border-2 border-white px-6 py-3.5 rounded-2xl shadow-2xl shrink-0 w-full sm:w-auto justify-center sm:justify-start">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white bg-white shadow-xl shrink-0">
              <MediaImage
                src={site.mlaPortrait}
                alt="Dr. Srinivas N. T. MLA"
                fill
                sizes="56px"
                className="object-cover object-top scale-110"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-white font-black text-base sm:text-lg tracking-wide drop-shadow-md">
                <AnimatedCounter end={1} duration={1} /> {currentText.constituencyMla}
              </span>
              <span className="text-[var(--land-gold)] text-xs font-black uppercase tracking-wider mt-0.5">
                {lang === 'kn' ? site.nameShortKn : site.nameShortEn}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. ABOUT SECTION — Clean White Theme with Low Opacity Watermark Background */}
      <section id="about" className="relative bg-[var(--land-surface)] py-10 sm:py-12 border-b-2 border-slate-200 overflow-hidden text-slate-900">

        {/* Vidhana Soudha / Kudligi Map low-opacity background image watermark */}
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-4">
          
          {/* Photo on Left */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="p-3 rounded-[32px] bg-white shadow-2xl border-4 border-[var(--land-blue-bright)] shadow-blue-500/20 w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[480px] overflow-hidden">
              <div className="relative w-full rounded-[24px] overflow-hidden bg-white aspect-square flex items-center justify-center">
                <MediaImage
                  src={content.about?.portrait}
                  alt="Dr. Srinivas N. T. MLA Kudligi"
                  fill
                  sizes="(max-width: 1024px) 420px, 480px"
                  className="object-contain object-center scale-105"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right: Heading + stats + description */}
          <div className="lg:col-span-7 flex flex-col gap-4 text-center lg:text-left items-center lg:items-start">
            
            {/* Constituency badge */}
            <span className="inline-flex items-center gap-2 bg-[var(--land-blue-bright)]/10 border border-[var(--land-blue-bright)]/30 text-[var(--land-blue-alt)] text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
              ✦ {currentText.aboutBadge}
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-[var(--land-blue-mid)]">
              {currentText.aboutHeading}
            </h2>
            <div className="w-16 h-1.5 bg-[var(--land-blue-bright)] rounded-full" />

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify font-sans font-medium max-w-2xl">
              {currentText.aboutDesc}
            </p>

            {/* Stats row — animated on scroll */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full mt-2">
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
                  className="flex flex-col items-center lg:items-start bg-white border-2 border-slate-200/80 rounded-2xl px-4 py-3 gap-0.5 shadow-md hover:border-[var(--land-blue-bright)] transition-all"
                >
                  <span className="text-2xl sm:text-3xl font-black text-[var(--land-blue-bright)]">{s.num}</span>
                  <span className="text-slate-600 text-[11px] font-extrabold uppercase tracking-wide leading-tight">{s.label}</span>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 5. DEVELOPMENTS FOCUS SECTOR CARDS & INTERACTIVE VILLAGE MAP (ಅಭಿವೃದ್ಧಿಗಳು - Full Width Royal Blue Banner) */}
      <section id="developments" className="relative bg-gradient-to-br from-[var(--land-blue)] via-[var(--land-blue-alt)] to-[var(--land-blue-bright)] pt-6 sm:pt-8 pb-12 border-y-4 border-white text-white shadow-2xl overflow-hidden">
        
        {/* Vidhana Soudha & Development Infrastructure Watermark Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-10 select-none">
          <MediaImage
            src={content.about?.watermark || content.media?.watermark}
            alt="Infrastructure Development Watermark"
            fill
            sizes="100vw"
            className="object-cover object-center filter brightness-125"
          />
        </div>

        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-8">
          
          <div className="text-center">
            <span className="inline-flex items-center gap-2 bg-white/20 border border-white/40 text-[var(--land-gold)] text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md mb-1.5">
              ✦ {currentText.devBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-white drop-shadow-lg">
              {currentText.devHeading}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm mt-1.5 max-w-2xl mx-auto font-medium">{currentText.devDesc}</p>
            <div className="w-20 h-1.5 bg-[var(--land-gold)] mx-auto mt-2 rounded-full shadow-md" />
          </div>

          {/* Interactive Village-wise Development Map & DRRP Projects Explorer */}
          <VillageDevelopmentMap
            lang={lang}
            developments={publicDevelopments}
          />



        </div>
      </section>

      {/* 6. MLA TOUR PROGRAM CALENDAR & OFFICIAL SCHEDULE DOCUMENT (ಶಾಸಕರ ಪ್ರವಾಸ ಕಾರ್ಯಕ್ರಮ - Clean White Theme) */}
      <section id="media" className="relative bg-[var(--land-surface)] pt-4 sm:pt-6 pb-12 border-b-4 border-[var(--land-blue-bright)] text-slate-900 shadow-xl overflow-hidden">
        
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
            <span className="inline-flex items-center gap-2 bg-[var(--land-blue-bright)]/10 border border-[var(--land-blue-bright)]/30 text-[var(--land-blue-bright)] text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm mb-1.5">
              ✦ {currentText.tourBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-[var(--land-blue)] drop-shadow-sm">
              {currentText.tourHeading}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-2xl mx-auto font-semibold">
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

      {/* 6.5 MUKANDARU / LEADERS MOVING CAROUSEL SECTION */}
      <section id="leaders" className="relative py-14 bg-gradient-to-r from-[var(--land-blue-deep)] via-[var(--land-blue-mid)] to-[var(--land-blue-bright)] border-t-4 border-[var(--land-blue-bright)] border-b-4 border-[var(--land-gold)] shadow-2xl overflow-hidden">
        
        {/* Low Opacity Background Watermark */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none select-none">
          <MediaImage
            src={content.stats?.peopleBanner || content.leaders?.watermark}
            alt="Kudligi Background"
            fill
            sizes="100vw"
            className="object-cover filter brightness-125 contrast-110 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-8">
          
          {/* Header Title Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--land-gold)]/30 pb-5">
            <div className="flex flex-col text-center sm:text-left">
              <span className="inline-flex items-center gap-2 bg-[var(--land-gold)] text-slate-950 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full w-fit mx-auto sm:mx-0 shadow-md mb-1 border border-white">
                ✦ {currentText.leadersBadge}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-white drop-shadow-md">
                {currentText.leadersHeading}
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm mt-1 font-semibold">
                {currentText.leadersDesc}
              </p>
            </div>

            {/* View All Button linking to /leaders */}
            <Link
              href="/leaders"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--land-gold)] hover:bg-white text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-xl border-2 border-white hover:scale-105 transition-all whitespace-nowrap shrink-0"
            >
              <span>{currentText.leadersViewAll}</span>
            </Link>
          </div>

          {/* Leaders Auto-Scrolling Moving Marquee Track */}
          <div className="w-full overflow-hidden relative group py-2">
            
            {/* Left & Right Fade Shadows */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--land-blue-deep)] to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--land-blue-bright)] to-transparent z-20 pointer-events-none" />

            <div className="animate-marquee-scroll flex gap-6 items-center">
              {leadersLoop.map((leader, idx) => (
                <Link
                  key={`${leader.id}-${idx}`}
                  href={`/leaders?id=${leader.id}`}
                  className="w-[260px] sm:w-[290px] shrink-0 group relative bg-[var(--land-blue-deep)]/85 backdrop-blur-xl rounded-3xl p-5 border-2 border-[var(--land-gold)]/40 hover:border-[var(--land-gold)] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--land-blue-deep)] via-[var(--land-blue-bright)] to-[var(--land-gold)]" />
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full shadow-md mb-3 ${
                      LEADER_BADGE_TONES[leader.badgeTone] || LEADER_BADGE_TONES.gold
                    }`}
                  >
                    {lang === "kn"
                      ? leader.categoryKn
                      : leader.categoryEn || leader.categoryKn}
                  </span>
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[var(--land-gold)] shadow-xl mb-3 group-hover:scale-105 transition-transform duration-300 bg-white/10">
                    <MediaImage
                      src={leader.photo}
                      alt={leader.nameEn}
                      fill
                      sizes="112px"
                      className="object-cover object-top"
                    />
                  </div>
                  <h3 className="font-black text-base sm:text-lg text-white group-hover:text-[var(--land-gold)] transition-colors leading-snug">
                    {lang === "kn" ? leader.nameKn : leader.nameEn}
                  </h3>
                  <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                    {lang === "kn" ? leader.roleKn : leader.roleEn}
                  </p>
                  <div className="mt-4 w-full pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-xs font-black text-[var(--land-gold)] group-hover:text-slate-950 bg-[var(--land-blue)] group-hover:bg-[var(--land-gold)] py-2 rounded-xl transition-all shadow-md">
                    <FaPhoneAlt className="w-3.5 h-3.5" />
                    <span>{currentText.leadersDetails}</span>
                  </div>
                </Link>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 7. TOURIST PLACES & CULTURAL HERITAGE SECTION (ಪ್ರವಾಸಿ ತಾಣಗಳು - Clean Light Theme with Tourism Background) */}
      <section id="gallery" className="relative py-16 bg-[var(--land-surface)] border-t-4 border-[var(--land-blue-bright)] border-b-4 border-[var(--land-gold)] shadow-inner overflow-hidden">
        
        {/* Tourism Map & Heritage Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none select-none">
          <MediaImage
            src={content.gallery?.watermark}
            alt="Kudligi Tourism Map Background"
            fill
            sizes="100vw"
            className="object-cover filter contrast-125"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">

          <div className="text-center">
            <span className="inline-flex items-center gap-2 bg-[var(--land-blue-bright)]/10 border border-[var(--land-blue-bright)]/30 text-[var(--land-blue-bright)] text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm mb-1.5">
              ✦ {currentText.galleryBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-[var(--land-blue)] drop-shadow-sm">
              {currentText.galleryHeading}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-2xl mx-auto font-semibold">
              {currentText.galleryDesc}
            </p>
            <div className="w-20 h-1.5 bg-[var(--land-blue-bright)] mx-auto mt-2 rounded-full shadow-md" />
          </div>

          {/* Alternating rows */}
          <div className="flex flex-col gap-8">
            {galleryItems.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex flex-col lg:flex-row ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  } gap-0 rounded-3xl overflow-hidden border-2 border-slate-200 bg-white shadow-xl group hover:border-[var(--land-blue-bright)] transition-all`}
                >
                  {/* Image side */}
                  <div className="relative w-full lg:w-1/2 h-[280px] lg:h-[340px] overflow-hidden shrink-0">
                    <MediaImage
                      src={item.image}
                      alt={item.titleEn}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Index badge */}
                    <span className="absolute top-3 left-3 bg-[var(--land-blue)] text-[var(--land-gold)] text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-[var(--land-gold)]/50">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Content side */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center gap-4 px-6 py-8 lg:px-10">
                    <span className="bg-[var(--land-blue-bright)] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit shadow-sm border border-blue-300">
                      ✦ {lang === "kn" ? "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರ" : "Kudligi Constituency"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--land-blue)] leading-tight">
                      {lang === 'kn' ? item.titleKn : item.titleEn}
                    </h3>
                    <div className="w-14 h-1.5 bg-[var(--land-gold)] rounded-full shadow-sm" />
                    <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-bold bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                      {lang === 'kn' ? item.descKn : item.descEn}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Kudligi Farmers Feature Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row-reverse gap-0 rounded-3xl overflow-hidden border-2 border-slate-200 bg-white shadow-xl group hover:border-[var(--land-blue-bright)] transition-all"
          >
            {/* Farmers image */}
            <div className="relative w-full lg:w-1/2 h-[280px] lg:h-[340px] overflow-hidden shrink-0">
              <MediaImage
                src={content.gallery?.farmersImage}
                alt="Kudligi Farmers"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center gap-4 px-6 py-8 lg:px-10">
              <span className="bg-[var(--land-blue-bright)] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit shadow-sm border border-blue-300">
                ✦ {currentText.farmersBadge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--land-blue)] leading-tight">
                {currentText.farmersHeading}
              </h3>
              <div className="w-14 h-1.5 bg-[var(--land-gold)] rounded-full shadow-sm" />
              <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-bold bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                {currentText.farmersDesc}
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 8. COMPLAINTS & SUGGESTIONS INPUT FORM (ದೂರುಗಳು - Royal Blue Theme) */}
      <section id="grievance-form" className="relative py-16 bg-gradient-to-r from-[var(--land-blue-deep)] via-[var(--land-blue-mid)] to-[var(--land-blue-bright)] border-t-4 border-[var(--land-blue-bright)] border-b-4 border-[var(--land-gold)] shadow-2xl overflow-hidden text-white">
        
        {/* Background People Watermark */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none select-none">
          <MediaImage
            src={content.stats?.peopleBanner || content.leaders?.watermark}
            alt="Kudligi Background"
            fill
            sizes="100vw"
            className="object-cover filter brightness-125 contrast-110 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 bg-[var(--land-gold)] text-slate-950 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md mb-2 border border-white">
              ✦ {currentText.formBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-white drop-shadow-md">
              {currentText.formHeading}
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-1.5 font-semibold">{currentText.formSub}</p>
            <div className="w-20 h-1.5 bg-[var(--land-gold)] mx-auto mt-2.5 rounded-full shadow-md" />
          </motion.div>

          {/* Form Card Grid */}
          <div className="bg-[var(--land-blue-deep)]/90 backdrop-blur-xl rounded-3xl border-2 border-[var(--land-gold)]/50 p-6 sm:p-10 shadow-2xl">
            {formSubmitted ? (
              <div className="text-center py-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[var(--land-gold)] text-slate-950 flex items-center justify-center text-3xl font-black shadow-xl">
                  ✓
                </div>
                <span className="text-white font-black text-lg sm:text-xl mt-2 drop-shadow-sm">
                  {currentText.formSuccess}
                </span>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
                {formError ? (
                  <p className="text-rose-200 text-xs font-bold bg-rose-900/40 border border-rose-300/40 rounded-xl px-3 py-2">
                    {formError}
                  </p>
                ) : null}

                {/* Row 1: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[var(--land-gold)] text-xs font-black uppercase tracking-wider">
                      {currentText.formName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="bg-[var(--land-blue)]/90 border-2 border-[var(--land-gold)]/30 rounded-xl p-3.5 text-white text-xs sm:text-sm font-bold focus:border-[var(--land-gold)] focus:outline-none transition-colors shadow-inner"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[var(--land-gold)] text-xs font-black uppercase tracking-wider">
                      {currentText.formPhone} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="bg-[var(--land-blue)]/90 border-2 border-[var(--land-gold)]/30 rounded-xl p-3.5 text-white text-xs sm:text-sm font-bold focus:border-[var(--land-gold)] focus:outline-none transition-colors shadow-inner"
                    />
                  </div>
                </div>

                {/* Row 2: Dropdown selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[var(--land-gold)] text-xs font-black uppercase tracking-wider">
                    {currentText.formVillage} *
                  </label>
                  <select
                    required
                    value={form.village}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, village: e.target.value }))
                    }
                    className="bg-[var(--land-blue)]/90 border-2 border-[var(--land-gold)]/30 rounded-xl p-3.5 text-white text-xs sm:text-sm font-bold focus:border-[var(--land-gold)] focus:outline-none transition-colors cursor-pointer shadow-inner"
                  >
                    <option value="" className="bg-[var(--land-blue)] text-white">
                      {currentText.formVillagePlaceholder}
                    </option>
                    {(content.grievance?.villages || []).map((v) => (
                      <option
                        key={v.value}
                        value={v.value}
                        className="bg-[var(--land-blue)] text-white"
                      >
                        {v.labelEn} / {v.labelKn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label className="text-[var(--land-gold)] text-xs font-black uppercase tracking-wider">
                    {currentText.formSubject}
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    placeholder="e.g. Drinking water / Road / Electricity"
                    className="bg-[var(--land-blue)]/90 border-2 border-[var(--land-gold)]/30 rounded-xl p-3.5 text-white text-xs sm:text-sm font-bold focus:border-[var(--land-gold)] focus:outline-none transition-colors shadow-inner"
                  />
                </div>

                {/* Message textarea */}
                <div className="flex flex-col gap-2">
                  <label className="text-[var(--land-gold)] text-xs font-black uppercase tracking-wider">
                    {currentText.formMessage} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    className="bg-[var(--land-blue)]/90 border-2 border-[var(--land-gold)]/30 rounded-xl p-3.5 text-white text-xs sm:text-sm font-bold focus:border-[var(--land-gold)] focus:outline-none transition-colors shadow-inner"
                  />
                </div>

                {/* Submit button */}
                <button 
                  type="submit"
                  disabled={formSending}
                  className="mt-2 bg-[var(--land-gold)] hover:bg-white text-slate-950 font-black text-sm py-4 rounded-2xl shadow-2xl transition-all duration-300 border-2 border-white cursor-pointer hover:scale-[1.02] active:scale-95 tracking-wide disabled:opacity-60"
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

      {/* FOOTER */}
      <footer className="w-full bg-[var(--land-footer-bg)] border-t-2 border-[var(--land-footer-accent)]/50 relative z-10">

        {/* Top footer bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

          {/* LEFT: MLA circular badge + tagline */}
          <div className="flex flex-col items-center md:items-start gap-4">
            {/* Circular badge — orbit text effect using SVG */}
            <div className="relative w-[160px] h-[160px] shrink-0">
              {/* Orbit ring */}
              <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "18s" }}>
                <defs>
                  <path id="orbitPath" d="M80,80 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" />
                </defs>
                <text fill="var(--land-footer-accent)" fontSize="8.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="2.5">
                  <textPath href="#orbitPath" startOffset="0%">{currentText.footerOrbit}</textPath>
                </text>
              </svg>
              {/* Inner circle photo */}
              <div className="absolute inset-[16px] rounded-full overflow-hidden border-4 border-[var(--land-footer-accent)] shadow-2xl bg-[#282c2d]">
                <MediaImage
                  src={site.mlaPortrait}
                  alt="Dr. Srinivas N. T."
                  fill
                  sizes="128px"
                  className="object-cover object-top"
                />
              </div>
            </div>

            <div className="text-center md:text-left">
              <p className="text-[var(--land-footer-accent)] font-black text-sm tracking-widest uppercase">
                {lang === 'kn' ? site.nameShortKn : site.nameShortEn}
              </p>
              <p className="text-white/50 text-[11px] mt-0.5">
                {currentText.footerRole}
              </p>
              <p className="text-white/40 text-[10px] mt-3 leading-relaxed max-w-[200px]">
                {currentText.footerMotto}
              </p>
            </div>
          </div>

          {/* CENTER: Quick links */}
          <div className="flex flex-col items-center gap-4">
            <h4 className="text-[var(--land-footer-accent)] font-black text-sm uppercase tracking-widest border-b border-[var(--land-footer-accent)]/30 pb-2 w-full text-center">
              {currentText.quickLinks}
            </h4>
            <nav className="flex flex-col gap-2 text-center">
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
                  className="text-white/60 hover:text-[var(--land-footer-accent)] text-xs font-semibold tracking-wider transition-colors"
                >
                  → {link.label}
                </button>
              ))}
            </nav>

            {/* Values tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {currentText.values.map((v, i) => (
                <span key={i} className="text-[9px] font-black text-[var(--land-link)] border border-[var(--land-link)]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: Contact + Social */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <h4 className="text-[var(--land-footer-accent)] font-black text-sm uppercase tracking-widest border-b border-[var(--land-footer-accent)]/30 pb-2 w-full text-center md:text-right">
              {currentText.footerContact}
            </h4>

            <div className="flex flex-col gap-2 text-right items-center md:items-end">
              <a href={content.contact?.phoneHref} className="flex items-center gap-2 text-white/60 hover:text-[var(--land-footer-accent)] text-xs transition-colors">
                <FaPhoneAlt className="w-3 h-3 text-[var(--land-link)] shrink-0" />
                <span>{content.contact?.phone}</span>
              </a>
              <a href={`mailto:${content.contact?.email}`} className="flex items-center gap-2 text-white/60 hover:text-[var(--land-footer-accent)] text-xs transition-colors">
                <FaEnvelope className="w-3 h-3 text-[var(--land-link)] shrink-0" />
                <span>{content.contact?.email}</span>
              </a>
              <p className="text-white/40 text-[10px] max-w-[200px] text-center md:text-right leading-relaxed mt-1">
                {currentText.footerAddress}
              </p>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-2">
              {[
                { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
                { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
                { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
                { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-[#282c2d] border border-[var(--land-footer-accent)]/20 flex items-center justify-center text-white/60 hover:text-[var(--land-link)] hover:border-[var(--land-link)] transition-all duration-300"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>

            {/* Logos row */}
            <div className="flex items-center gap-4 mt-2 opacity-60">
              <div className="relative w-10 h-10">
                <MediaImage src={site.karnatakaLogo} alt="Karnataka Seal" fill className="object-contain" sizes="40px" />
              </div>
              <div className="relative w-10 h-10">
                <MediaImage src={site.partyLogo} alt="INC Logo" fill className="object-contain" sizes="40px" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--land-footer-accent)]/10 py-4 px-4 text-center flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <span className="text-white/30 text-[10px]">{currentText.footerCopy}</span>
          <span className="text-white/20 text-[10px]">{currentText.footerDev}</span>
        </div>

      </footer>

    </div>
  );
}
