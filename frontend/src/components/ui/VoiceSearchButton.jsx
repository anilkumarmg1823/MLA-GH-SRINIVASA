"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaStop, FaTimes } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function MicHelpModal({ open, onClose, reason }) {
  const { t } = useLanguage();
  useEscapeKey(open, onClose);
  if (!open) return null;

  const unsupported = reason === "unsupported";
  const title = unsupported
    ? t.voiceUnsupported
    : reason === "missing"
      ? t.voiceMicMissingTitle
      : t.voiceMicDeniedTitle;
  const message = unsupported
    ? t.voiceUnsupported
    : reason === "missing"
      ? t.voiceMicMissingBody
      : t.voiceMicDeniedBody;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-mic-help-title"
        className="relative w-full max-w-sm rounded-2xl border border-[#CCBCA5]/40 bg-[var(--dash-panel)] shadow-2xl p-5"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[var(--dash-text-40)] hover:text-[var(--dash-text)]"
          aria-label={t.close}
        >
          <FaTimes />
        </button>
        <div className="flex items-center gap-3 mb-3 pr-8">
          <div className="w-11 h-11 rounded-full bg-[#CCBCA5]/15 border border-[#CCBCA5]/40 flex items-center justify-center text-[#CCBCA5]">
            <FaMicrophone />
          </div>
          <h2
            id="voice-mic-help-title"
            className="text-base font-black text-[var(--dash-text)]"
          >
            {title}
          </h2>
        </div>
        <p className="text-sm text-[var(--dash-text-70)] leading-relaxed mb-4">{message}</p>
        {!unsupported ? (
          <ol className="text-xs text-[var(--dash-text-55)] space-y-1.5 mb-5 list-decimal pl-4">
            <li>{t.voiceMicStep1}</li>
            <li>{t.voiceMicStep2}</li>
            <li>{t.voiceMicStep3}</li>
          </ol>
        ) : (
          <p className="text-xs text-[var(--dash-text-45)] mb-5">{t.voiceUseChrome}</p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8]"
        >
          {t.voiceMicGotIt}
        </button>
      </div>
    </div>
  );
}

/**
 * Native Web Speech API — speak and text appears in the search box immediately.
 */
export default function VoiceSearchButton({ active = true, onTranscript }) {
  const { t } = useLanguage();
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpReason, setHelpReason] = useState("denied");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(false);

  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  const finalRef = useRef("");
  const wantListenRef = useRef(false);
  const fallbackTriedRef = useRef(false);
  const fallbackTimerRef = useRef(null);

  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  const clearFallbackTimer = () => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  const stopRecognition = () => {
    wantListenRef.current = false;
    clearFallbackTimer();
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      try {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.onstart = null;
        rec.stop();
      } catch {
        /* ignore */
      }
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    }
    setListening(false);
    setBusy(false);
  };

  const beginRecognition = (speechLang) => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setHelpReason("unsupported");
      setHelpOpen(true);
      setBusy(false);
      return;
    }

    // Tear down previous instance without clearing wantListen
    const prev = recognitionRef.current;
    recognitionRef.current = null;
    if (prev) {
      try {
        prev.onresult = null;
        prev.onerror = null;
        prev.onend = null;
        prev.onstart = null;
        prev.abort();
      } catch {
        /* ignore */
      }
    }

    const recognition = new Ctor();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setBusy(false);
    };

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) {
          finalRef.current = `${finalRef.current} ${piece}`.trim();
        } else {
          interim += piece;
        }
      }
      const text = `${finalRef.current} ${interim}`.trim();
      if (text) {
        onTranscriptRef.current?.(text);
      }
    };

    recognition.onerror = (event) => {
      const err = event?.error;
      if (err === "not-allowed" || err === "service-not-allowed") {
        wantListenRef.current = false;
        setHelpReason("denied");
        setHelpOpen(true);
      } else if (err === "audio-capture") {
        wantListenRef.current = false;
        setHelpReason("missing");
        setHelpOpen(true);
      }
      // no-speech / aborted: allow onend to decide
    };

    recognition.onend = () => {
      if (wantListenRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start();
          return;
        } catch {
          /* ignore */
        }
      }
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
      setListening(false);
      setBusy(false);
    };

    try {
      recognition.start();
      setListening(true);
    } catch {
      wantListenRef.current = false;
      setHelpReason("denied");
      setHelpOpen(true);
      setListening(false);
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!active) {
      stopRecognition();
      finalRef.current = "";
      setHelpOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => () => stopRecognition(), []);

  const handleToggle = async () => {
    if (!supported) {
      setHelpReason("unsupported");
      setHelpOpen(true);
      return;
    }

    if (listening || wantListenRef.current) {
      stopRecognition();
      return;
    }

    setBusy(true);
    finalRef.current = "";
    fallbackTriedRef.current = false;
    wantListenRef.current = true;

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      wantListenRef.current = false;
      setBusy(false);
      const name = err?.name || "";
      setHelpReason(
        name === "NotFoundError" || name === "DevicesNotFoundError"
          ? "missing"
          : "denied"
      );
      setHelpOpen(true);
      return;
    }

    // Start with en-IN — most reliable for getting text into the box quickly.
    // User can speak English or Kannada names; empty kn-IN was the main bug.
    beginRecognition("en-IN");

    // If still no text after 2s, hard-restart once (Chrome flakiness)
    clearFallbackTimer();
    fallbackTimerRef.current = window.setTimeout(() => {
      if (!wantListenRef.current) return;
      if (finalRef.current.trim()) return;
      if (fallbackTriedRef.current) return;
      fallbackTriedRef.current = true;
      beginRecognition("en-US");
    }, 2000);
  };

  if (!supported) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setHelpReason("unsupported");
            setHelpOpen(true);
          }}
          title={t.voiceUnsupported}
          aria-label={t.voiceUnsupported}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--dash-text-40)] hover:bg-[var(--dash-hover-strong)] shrink-0"
        >
          <FaMicrophone className="text-sm" />
        </button>
        <MicHelpModal
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          reason="unsupported"
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1.5 shrink-0">
        {listening ? (
          <span className="hidden sm:inline text-[10px] font-black text-red-300 animate-pulse whitespace-nowrap">
            {t.voiceListeningShort}
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleToggle}
          disabled={busy}
          title={listening ? t.voiceListening : t.voiceTapToSpeak}
          aria-label={listening ? t.voiceListening : t.voiceTapToSpeak}
          aria-pressed={listening}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 ${
            listening
              ? "bg-red-500/25 text-red-300 border border-red-400/60 animate-pulse"
              : "text-[#CCBCA5] hover:bg-[#CCBCA5]/15 border border-[#CCBCA5]/35"
          }`}
        >
          {listening ? (
            <FaStop className="text-xs" />
          ) : (
            <FaMicrophone className="text-sm" />
          )}
        </button>
      </div>
      <MicHelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        reason={helpReason}
      />
    </>
  );
}
