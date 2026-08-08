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
import {
  FaArrowLeft,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaRedoAlt,
  FaCheckCircle,
  FaDesktop,
  FaTabletAlt,
  FaMobileAlt,
} from "react-icons/fa";
import PageLoader from "@/components/ui/PageLoader";

const BUILDER_STEPS = [
  {
    step: 1,
    id: "step-brand-hero",
    title: "1. Brand & Hero",
    titleKn: "೧. ಲೋಗೋ ಮತ್ತು ಬ್ಯಾನರ್",
    subtitle: "Header, logos & hero banner section",
    tabs: ["brand", "hero"],
    icon: "🚀",
  },
  {
    step: 2,
    id: "step-mla-profile",
    title: "2. MLA Profile & Quote",
    titleKn: "೨. ಶಾಸಕರ ಪರಿಚಯ",
    subtitle: "Dr. Srinivas N.T. bio & quote",
    tabs: ["mla", "quote"],
    icon: "👤",
  },
  {
    step: 3,
    id: "step-taluk-sectors",
    title: "3. Taluk & Sectors",
    titleKn: "೩. ಕ್ಷೇತ್ರಗಳ ಅಭಿವೃದ್ಧಿ",
    subtitle: "3D map, stats & key sectors",
    tabs: ["taluk", "sectors"],
    icon: "🗺️",
  },
  {
    step: 4,
    id: "step-projects-media",
    title: "4. Projects & Media",
    titleKn: "೪. ಯೋಜನೆ ಮತ್ತು ವೀಡಿಯೊ",
    subtitle: "DRRP works, photo gallery & video",
    tabs: ["drrp", "gallery", "video"],
    icon: "🎬",
  },
  {
    step: 5,
    id: "step-connect-footer",
    title: "5. Connect & Footer",
    titleKn: "೫. ಸಂಪರ್ಕ ಮತ್ತು ಅಡಿಟಿಪ್ಪಣಿ",
    subtitle: "Office contact, phone & footer copy",
    tabs: ["connect", "footer"],
    icon: "☎️",
  },
];

export default function LandingStudioPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [allowed, setAllowed] = useState(false);
  const [draft, setDraft] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [activeTab, setActiveTab] = useState("brand");
  const [previewViewport, setPreviewViewport] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'
  const [previewLang, setPreviewLang] = useState("kn"); // 'kn' | 'en'
  const [mobilePane, setMobilePane] = useState("edit"); // 'edit' | 'preview' (phones)
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
  const syncLabel = t?.landingSync || "Sync & Publish";
  const resetLabel = t?.landingReset || "Reset to Defaults";
  const syncedLabel = t?.landingSynced || "Synced to live site";
  const resetDoneLabel = t?.landingResetDone || "Reset to defaults";

  const flash = (msg) => {
    setSavedMsg(msg);
    window.setTimeout(() => setSavedMsg(""), 3000);
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

  const handleStepSelect = (stepObj) => {
    setActiveStep(stepObj.step);
    if (stepObj.tabs && stepObj.tabs.length > 0) {
      setActiveTab(stepObj.tabs[0]);
    }
  };

  const currentStepObj =
    BUILDER_STEPS.find((s) => s.step === activeStep) || BUILDER_STEPS[0];

  if (!allowed || !draft) {
    return (
      <PageLoader
        full
        subKn="ಸ್ಟುಡಿಯೋ ತೆರೆಯುತ್ತಿದೆ…"
        subEn="Opening studio…"
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--dash-bg)] text-[var(--dash-text)] overflow-hidden">
      {/* Studio Top Control Header */}
      <header className="sticky top-0 z-50 bg-[var(--dash-panel)] border-b border-[var(--dash-border)] px-4 py-3 shadow-md flex items-center justify-between gap-4 shrink-0">
        {/* Left Exit Handle & Title */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => router.push("/dashboard/landing")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-bg)] hover:bg-[var(--dash-hover)] text-xs font-bold text-[var(--dash-text)] transition-all shadow-sm shrink-0"
          >
            <FaArrowLeft className="text-xs" />
            <span className="hidden sm:inline">{isKn ? "ಎಕ್ಸಿಟ್ Studio" : "Exit Studio"}</span>
            <span className="sm:hidden">{isKn ? "ಹಿಂದೆ" : "Exit"}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 border-l border-[var(--dash-border-soft)] pl-4">
            <span className="text-sm font-black text-[var(--dash-heading)] tracking-wide">
              Landing Page Studio
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--dash-accent)] text-white text-[10px] font-black uppercase tracking-wider">
              Full Screen
            </span>
          </div>

          {savedMsg ? (
            <p className="text-xs font-bold text-[var(--dash-accent)] flex items-center gap-1 animate-pulse shrink-0">
              <FaCheckCircle className="text-sm" />
              <span>{savedMsg}</span>
            </p>
          ) : null}
        </div>

        {/* Center Viewport Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-[var(--dash-bg)] p-1 rounded-full border border-[var(--dash-border-soft)]">
            <button
              type="button"
              onClick={() => setPreviewLang("kn")}
              className={`px-2.5 py-0.5 text-xs font-black rounded-full transition-all ${
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
              className={`px-2.5 py-0.5 text-xs font-black rounded-full transition-all ${
                previewLang === "en"
                  ? "bg-[var(--dash-accent)] text-white shadow-sm"
                  : "text-[var(--dash-text-60)] hover:text-[var(--dash-text)]"
              }`}
            >
              EN
            </button>
          </div>

          {/* Viewport Toggles */}
          <div className="hidden sm:flex items-center gap-1 bg-[var(--dash-bg)] p-1 rounded-full border border-[var(--dash-border-soft)]">
            <button
              type="button"
              onClick={() => setPreviewViewport("desktop")}
              className={`p-1.5 rounded-full text-xs transition-all ${
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
              className={`p-1.5 rounded-full text-xs transition-all ${
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
              className={`p-1.5 rounded-full text-xs transition-all ${
                previewViewport === "mobile"
                  ? "bg-[var(--dash-accent)] text-white"
                  : "text-[var(--dash-text-60)] hover:text-[var(--dash-text)]"
              }`}
              title="Mobile View (375px)"
            >
              <FaMobileAlt />
            </button>
          </div>
        </div>

        {/* Right Publish & Reset Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSync}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--dash-accent)] text-white text-xs font-black hover:opacity-90 shadow-md transition-all active:scale-95"
          >
            <FaSyncAlt className="text-xs" />
            <span className="hidden md:inline">{syncLabel}</span>
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
      </header>

      {/* Guided Step Progress Bar */}
      <div className="bg-[var(--dash-panel)] border-b border-[var(--dash-border-soft)] px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 shadow-sm">
        {BUILDER_STEPS.map((s) => {
          const active = s.step === activeStep;
          const isPast = s.step < activeStep;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStepSelect(s)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? "border-[var(--dash-accent)] bg-[var(--dash-accent)] text-white shadow-sm"
                  : isPast
                  ? "border-[var(--dash-border-soft)] bg-[var(--dash-bg)] text-[var(--dash-text-80)] hover:border-[var(--dash-border)]"
                  : "border-transparent text-[var(--dash-text-60)] hover:text-[var(--dash-text)]"
              }`}
            >
              <span>{s.icon}</span>
              <span>{isKn ? s.titleKn : s.title}</span>
              {isPast ? <FaCheckCircle className="text-xs opacity-90" /> : null}
            </button>
          );
        })}
      </div>

      {/* Mobile Edit / Preview switch */}
      <div className="lg:hidden flex gap-1 px-3 py-2 border-b border-[var(--dash-border)] bg-[var(--dash-panel)] shrink-0">
        <button
          type="button"
          onClick={() => setMobilePane("edit")}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            mobilePane === "edit"
              ? "bg-[var(--dash-accent)] text-white"
              : "bg-[var(--dash-bg)] text-[var(--dash-text-60)]"
          }`}
        >
          {isKn ? "ಸಂಪಾದಿಸಿ" : "Edit"}
        </button>
        <button
          type="button"
          onClick={() => setMobilePane("preview")}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            mobilePane === "preview"
              ? "bg-[var(--dash-accent)] text-white"
              : "bg-[var(--dash-bg)] text-[var(--dash-text-60)]"
          }`}
        >
          {isKn ? "ಪೂರ್ವವೀಕ್ಷಣೆ" : "Preview"}
        </button>
      </div>

      {/* Main Studio Viewport Grid (100% Height) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Customization Inspector Dock */}
        <aside
          className={`w-full lg:w-[440px] xl:w-[480px] bg-[var(--dash-panel)] border-r border-[var(--dash-border)] p-4 space-y-4 overflow-y-auto shrink-0 shadow-lg ${
            mobilePane === "preview" ? "hidden lg:block" : ""
          }`}
        >
          <div className="flex items-center justify-between border-b border-[var(--dash-border-soft)] pb-2.5">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[var(--dash-accent)] flex items-center gap-1.5">
                <span>⚙️</span>
                <span>Step {activeStep}: {currentStepObj.title}</span>
              </span>
              <p className="text-[11px] text-[var(--dash-text-70)] mt-0.5">
                {currentStepObj.subtitle}
              </p>
            </div>
          </div>

          <LandingCmsEditor
            value={draft}
            onChange={setDraft}
            activeTab={activeTab}
            onTabChange={(tabId) => {
              setActiveTab(tabId);
              const step = BUILDER_STEPS.find((s) => s.tabs.includes(tabId));
              if (step) setActiveStep(step.step);
            }}
            stepTabs={currentStepObj.tabs}
          />

          {/* Next / Previous Step Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--dash-border-soft)]">
            <button
              type="button"
              disabled={activeStep <= 1}
              onClick={() => {
                const prevStep = activeStep - 1;
                if (prevStep >= 1) handleStepSelect(BUILDER_STEPS[prevStep - 1]);
              }}
              className="px-4 py-1.5 rounded-full border border-[var(--dash-border)] text-xs font-bold text-[var(--dash-text)] disabled:opacity-30 hover:bg-[var(--dash-hover)] transition-all"
            >
              ← {isKn ? "ಹಿಂದಿನ ಹಂತ" : "Previous Step"}
            </button>
            <button
              type="button"
              disabled={activeStep >= 5}
              onClick={() => {
                const nextStep = activeStep + 1;
                if (nextStep <= 5) handleStepSelect(BUILDER_STEPS[nextStep - 1]);
              }}
              className="px-4 py-1.5 rounded-full bg-[var(--dash-accent)] text-white text-xs font-bold disabled:opacity-30 hover:opacity-90 transition-all shadow-sm"
            >
              {isKn ? "ಮುಂದಿನ ಹಂತ" : "Next Step"} →
            </button>
          </div>
        </aside>

        {/* Right Main Live Interactive Canvas Viewport */}
        <main
          className={`flex-1 bg-slate-950 p-2 sm:p-4 overflow-y-auto flex flex-col justify-start items-center ${
            mobilePane === "edit" ? "hidden lg:flex" : ""
          }`}
        >
          <div className="w-full max-w-[1400px] my-auto">
            <LandingCmsLiveCanvas
              content={draft}
              lang={previewLang}
              viewport={previewViewport}
              activeSection={activeTab}
              onSelectSection={(secId) => {
                setActiveTab(secId);
                const step = BUILDER_STEPS.find((s) => s.tabs.includes(secId));
                if (step) setActiveStep(step.step);
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
