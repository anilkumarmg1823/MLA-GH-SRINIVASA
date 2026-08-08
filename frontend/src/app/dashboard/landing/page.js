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
import LandingCmsLiveCanvas from "@/components/landing-cms/LandingCmsLiveCanvas";
import {
  FaMagic,
  FaExternalLinkAlt,
  FaRedoAlt,
  FaCheckCircle,
  FaDesktop,
  FaTabletAlt,
  FaMobileAlt,
} from "react-icons/fa";
import PageLoader from "@/components/ui/PageLoader";

export default function LandingCmsPreviewPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [allowed, setAllowed] = useState(false);
  const [draft, setDraft] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [previewViewport, setPreviewViewport] = useState("desktop");
  const [previewLang, setPreviewLang] = useState("kn");
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

  const isKn = lang === "kn";
  const openLabel = t?.landingOpenPreview || "View Public Site";
  const resetLabel = t?.landingReset || "Reset Defaults";
  const resetDoneLabel = t?.landingResetDone || "Reset to defaults";

  const flash = (msg) => {
    setSavedMsg(msg);
    window.setTimeout(() => setSavedMsg(""), 3000);
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

  const onOpenPublicSite = async () => {
    if (draft) {
      await syncLandingContent(draft);
    }
    previewWin.current = window.open("/", "mla-landing-preview");
  };

  if (!allowed || !draft) {
    return (
      <PageLoader
        subKn="ಲ್ಯಾಂಡಿಂಗ್ ಪುಟ ತೆರೆಯುತ್ತಿದೆ…"
        subEn="Opening landing preview…"
      />
    );
  }

  return (
    <div className="text-[var(--dash-text)] space-y-4 pb-8">
      {/* Floating Top Control Toolbar */}
      <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)] p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-40 backdrop-blur-md">
        {/* Title & Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-[var(--dash-heading)]">
              {isKn ? "ಲ್ಯಾಂಡಿಂಗ್ ಪುಟದ ಮುನ್ನೋಟ" : "Landing Page Live Preview"}
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              Live Preview
            </span>
          </div>
          <p className="text-xs text-[var(--dash-text-70)] mt-0.5 font-medium">
            Full-width preview of the public website. Click &quot;Open Studio Editor&quot; to edit content step-by-step.
          </p>
          {savedMsg ? (
            <p className="text-xs font-bold text-[var(--dash-accent)] mt-1 flex items-center gap-1 animate-pulse">
              <FaCheckCircle className="text-sm" />
              <span>{savedMsg}</span>
            </p>
          ) : null}
        </div>

        {/* Viewport Toggles & Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-[var(--dash-bg)] p-1 rounded-full border border-[var(--dash-border-soft)]">
            <button
              type="button"
              onClick={() => setPreviewLang("kn")}
              className={`px-3 py-1 text-xs font-extrabold rounded-full transition-all ${
                previewLang === "kn"
                  ? "bg-[var(--dash-accent)] text-white shadow-sm"
                  : "text-[var(--dash-text-60)] hover:text-[var(--dash-text)]"
              }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang("en")}
              className={`px-3 py-1 text-xs font-extrabold rounded-full transition-all ${
                previewLang === "en"
                  ? "bg-[var(--dash-accent)] text-white shadow-sm"
                  : "text-[var(--dash-text-60)] hover:text-[var(--dash-text)]"
              }`}
            >
              EN
            </button>
          </div>

          {/* Viewport Toggles */}
          <div className="flex items-center gap-1 bg-[var(--dash-bg)] p-1 rounded-full border border-[var(--dash-border-soft)]">
            <button
              type="button"
              onClick={() => setPreviewViewport("desktop")}
              className={`p-2 rounded-full text-xs transition-all ${
                previewViewport === "desktop"
                  ? "bg-[var(--dash-accent)] text-white"
                  : "text-[var(--dash-text-60)] hover:text-[var(--dash-text)]"
              }`}
              title="Desktop View"
            >
              <FaDesktop />
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport("tablet")}
              className={`p-2 rounded-full text-xs transition-all ${
                previewViewport === "tablet"
                  ? "bg-[var(--dash-accent)] text-white"
                  : "text-[var(--dash-text-60)] hover:text-[var(--dash-text)]"
              }`}
              title="Tablet View (768px)"
            >
              <FaTabletAlt />
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport("mobile")}
              className={`p-2 rounded-full text-xs transition-all ${
                previewViewport === "mobile"
                  ? "bg-[var(--dash-accent)] text-white"
                  : "text-[var(--dash-text-60)] hover:text-[var(--dash-text)]"
              }`}
              title="Mobile View (375px)"
            >
              <FaMobileAlt />
            </button>
          </div>

          {/* Top Right Main Action Buttons */}
          <button
            type="button"
            onClick={() => router.push("/dashboard/landing/studio")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--dash-accent)] text-white text-xs sm:text-sm font-black hover:opacity-95 shadow-md transition-all active:scale-95 ring-2 ring-[var(--dash-accent)]/40"
          >
            <FaMagic className="text-sm" />
            <span>{isKn ? "✏️ Studio ಎಡಿಟರ್ ತೆರೆಯಿರಿ" : "✏️ Open Studio Editor"}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPublicSite}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-panel)] text-[var(--dash-text)] text-xs font-bold hover:bg-[var(--dash-hover)] transition-all shadow-sm"
          >
            <FaExternalLinkAlt className="text-xs text-[var(--dash-text-60)]" />
            <span>{openLabel}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-full border border-rose-400/40 text-rose-500 text-xs font-bold hover:bg-rose-500/10 transition-all"
            title={resetLabel}
          >
            <FaRedoAlt className="text-xs" />
          </button>
        </div>
      </div>

      {/* Main Full-Width Preview Canvas */}
      <div className="bg-[var(--dash-panel)] p-2 sm:p-4 rounded-2xl border border-[var(--dash-border)] shadow-xl space-y-3">
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--dash-bg)] rounded-xl border border-[var(--dash-border-soft)]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-mono text-[var(--dash-text-70)] ml-2 hidden sm:inline bg-[var(--dash-panel)] px-3 py-0.5 rounded-full border border-[var(--dash-border-soft)]">
              https://kudligimla.gov.in
            </span>
          </div>
          <span className="text-xs text-[var(--dash-accent)] font-black uppercase tracking-wider">
            Live Preview Mode
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] p-1 bg-slate-950/40 min-h-[750px]">
          <LandingCmsLiveCanvas
            content={draft}
            lang={previewLang}
            viewport={previewViewport}
            onSelectSection={() => {
              router.push("/dashboard/landing/studio");
            }}
          />
        </div>
      </div>
    </div>
  );
}
