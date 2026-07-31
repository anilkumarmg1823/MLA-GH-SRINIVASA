"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getSession } from "@/lib/auth";
import {
  loadLandingContent,
  syncLandingContent,
  resetLandingContent,
} from "@/lib/landingContentStore";
import LandingCmsEditor from "@/components/landing-cms/LandingCmsEditor";
import LandingCmsLiveCanvas from "@/components/landing-cms/LandingCmsLiveCanvas";

export default function LandingCmsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [allowed, setAllowed] = useState(false);
  const [draft, setDraft] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [activeTab, setActiveTab] = useState("brand");
  const [previewViewport, setPreviewViewport] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'
  const [previewLang, setPreviewLang] = useState("kn"); // 'kn' | 'en'
  const previewWin = useRef(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    setAllowed(true);
    loadLandingContent().then(setDraft);
  }, [router]);

  const title = t?.landingPage || "Landing Page Builder";
  const syncLabel = t?.landingSync || "Sync to landing";
  const resetLabel = t?.landingReset || "Reset to defaults";
  const openLabel = t?.landingOpenPreview || "Open Live Site";
  const syncedLabel = t?.landingSynced || "Synced to landing page";
  const resetDoneLabel = t?.landingResetDone || "Reset to defaults";

  const flash = (msg) => {
    setSavedMsg(msg);
    window.setTimeout(() => setSavedMsg(""), 2500);
  };

  const onSync = async () => {
    if (!draft) return;
    const next = await syncLandingContent(draft);
    setDraft(next);
    flash(syncedLabel);
    try {
      if (previewWin.current && !previewWin.current.closed) {
        previewWin.current.location.reload();
      }
    } catch {
      /* ignore */
    }
  };

  const onReset = async () => {
    if (
      !window.confirm(
        t?.landingResetConfirm ||
          "Reset all landing content to defaults? This cannot be undone."
      )
    ) {
      return;
    }
    const next = await resetLandingContent();
    setDraft(next);
    flash(resetDoneLabel);
  };

  const onOpenPreview = async () => {
    if (draft) {
      const next = await syncLandingContent(draft);
      setDraft(next);
    }
    previewWin.current = window.open("/", "mla-landing-preview");
    flash(t?.landingPreviewOpened || "Live landing page opened in new tab");
  };

  if (!allowed || !draft) {
    return (
      <div className="text-[var(--dash-text)] text-sm font-bold opacity-70 p-4">
        Loading Landing Page Builder…
      </div>
    );
  }

  return (
    <div className="text-[var(--dash-text)] space-y-4">
      {/* Top Header & Toolbar Bar */}
      <div className="rounded-2xl border border-[#CCBCA5]/30 bg-[var(--dash-panel-soft)] p-4 shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Title & Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-[var(--dash-heading)]">
              {title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#CCBCA5]/20 text-[#CCBCA5] text-[10px] font-black border border-[#CCBCA5]/30 uppercase">
              Live Customizer
            </span>
          </div>
          <p className="text-xs text-[var(--dash-text-50)] mt-0.5">
            Interactive canvas preview. Scroll or click any section to customize directly.
          </p>
          {savedMsg ? (
            <p className="text-xs font-black text-[#CCBCA5] mt-1 animate-pulse">
              ✓ {savedMsg}
            </p>
          ) : null}
        </div>

        {/* Viewport Toggles & Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Language Selector for Live Preview */}
          <div className="flex items-center gap-1 bg-[var(--dash-bg)] p-1 rounded-full border border-[#CCBCA5]/30">
            <button
              type="button"
              onClick={() => setPreviewLang("kn")}
              className={`px-2.5 py-1 text-xs font-black rounded-full transition-all ${
                previewLang === "kn"
                  ? "bg-[#CCBCA5] text-[#1e2223] shadow-md"
                  : "text-[var(--dash-text-50)] hover:text-white"
              }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang("en")}
              className={`px-2.5 py-1 text-xs font-black rounded-full transition-all ${
                previewLang === "en"
                  ? "bg-[#CCBCA5] text-[#1e2223] shadow-md"
                  : "text-[var(--dash-text-50)] hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          {/* Viewport Scale Controls */}
          <div className="flex items-center gap-1 bg-[var(--dash-bg)] p-1 rounded-full border border-[#CCBCA5]/30">
            <button
              type="button"
              onClick={() => setPreviewViewport("desktop")}
              className={`px-3 py-1 text-xs font-black rounded-full transition-all flex items-center gap-1 ${
                previewViewport === "desktop"
                  ? "bg-[#CCBCA5] text-[#1e2223] shadow-md"
                  : "text-[var(--dash-text-50)] hover:text-white"
              }`}
              title="Desktop View"
            >
              <span>💻</span>
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport("tablet")}
              className={`px-3 py-1 text-xs font-black rounded-full transition-all flex items-center gap-1 ${
                previewViewport === "tablet"
                  ? "bg-[#CCBCA5] text-[#1e2223] shadow-md"
                  : "text-[var(--dash-text-50)] hover:text-white"
              }`}
              title="Tablet View (768px)"
            >
              <span>📱</span>
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport("mobile")}
              className={`px-3 py-1 text-xs font-black rounded-full transition-all flex items-center gap-1 ${
                previewViewport === "mobile"
                  ? "bg-[#CCBCA5] text-[#1e2223] shadow-md"
                  : "text-[var(--dash-text-50)] hover:text-white"
              }`}
              title="Mobile View (375px)"
            >
              <span>📱</span>
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSync}
              className="px-4 py-2 rounded-full bg-[#CCBCA5] text-[#1e2223] text-xs font-black hover:bg-[#d9cbb8] shadow-md transition-all active:scale-95"
            >
              {syncLabel}
            </button>
            <button
              type="button"
              onClick={onOpenPreview}
              className="px-3.5 py-2 rounded-full border-2 border-[#CCBCA5] text-[#CCBCA5] text-xs font-black hover:bg-[#CCBCA5]/15 transition-all"
            >
              {openLabel}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-3.5 py-2 rounded-full border border-rose-400/40 text-rose-300 text-xs font-black hover:bg-rose-500/10 transition-all"
            >
              {resetLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Main Builder Grid: Left Dock Customize Inspector + Large Interactive Live Preview Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sticky Inspector Dock Toolbar */}
        <aside className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-4 rounded-2xl border border-[#CCBCA5]/25 bg-[var(--dash-panel-soft)] p-3 sm:p-4 space-y-3 max-h-[calc(100vh-100px)] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#CCBCA5]/20 pb-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#CCBCA5] flex items-center gap-1.5">
              <span>⚙️</span>
              <span>Customize Toolbar</span>
            </span>
            <span className="text-[10px] font-bold text-[var(--dash-text-40)]">
              Active: {activeTab.toUpperCase()}
            </span>
          </div>

          <LandingCmsEditor
            value={draft}
            onChange={setDraft}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </aside>

        {/* Right Main Large Live Preview Canvas */}
        <main className="lg:col-span-8 xl:col-span-8 bg-[var(--dash-bg)] p-3 sm:p-4 rounded-2xl border border-[#CCBCA5]/30 shadow-2xl space-y-2">
          <div className="flex items-center justify-between px-2 pb-1 border-b border-[#CCBCA5]/15">
            <span className="text-xs font-black uppercase tracking-widest text-[#CCBCA5] flex items-center gap-1.5">
              <span>👁️</span>
              <span>Live Preview Canvas</span>
            </span>
            <span className="text-[10px] text-[var(--dash-text-40)] font-bold">
              Click any section button overlay to edit
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#CCBCA5]/20 p-1 sm:p-2 bg-slate-950/50 min-h-[700px]">
            <LandingCmsLiveCanvas
              content={draft}
              lang={previewLang}
              viewport={previewViewport}
              activeSection={activeTab}
              onSelectSection={(secId) => setActiveTab(secId)}
              onScrollSectionChange={(secId) => {
                // Keep active tab synced as user scrolls down preview
                setActiveTab(secId);
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
