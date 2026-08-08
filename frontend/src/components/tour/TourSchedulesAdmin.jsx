"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaFileImage,
  FaTimes,
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import MediaUpload from "@/components/landing-cms/MediaUpload";
import MediaImage from "@/components/landing-cms/MediaImage";
import {
  loadLandingContent,
  syncLandingContent,
} from "@/lib/landingContentStore";
import { resolveTourScheduleForDate } from "@/lib/tourScheduleResolve";
import PageLoader from "@/components/ui/PageLoader";

const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_KN = ["ಆದಿ", "ಸೋಮ", "ಮಂಗಳ", "ಬುಧ", "ಗುರು", "ಶುಕ್ರ", "ಶನಿ"];

function uid(prefix = "ts") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function toYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthLabel(year, monthIndex, lang) {
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleString(lang === "kn" ? "kn-IN" : "en-IN", {
    month: "long",
    year: "numeric",
  });
}

/** View-only: day already has its own upload */
function ViewDayModal({ open, date, item, onClose, onRemove }) {
  const { t } = useLanguage();
  useEscapeKey(open, onClose);
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
        aria-label={t.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl rounded-2xl border border-[#CCBCA5]/40 bg-[var(--dash-panel)] shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[var(--dash-text-40)] hover:text-[var(--dash-text)]"
          aria-label={t.close}
        >
          <FaTimes />
        </button>

        <h2 className="text-lg font-black text-[var(--dash-heading)] pr-8">
          {t.tourViewDay || "Schedule for this day"}
        </h2>
        <p className="text-xs font-bold text-[var(--dash-accent)] mt-1">{date}</p>

        <div className="relative mt-4 w-full min-h-[280px] h-[50vh] rounded-xl overflow-hidden border border-[#CCBCA5]/30 bg-[var(--dash-panel-soft)]">
          <MediaImage
            src={item.imageUrl}
            alt={`Tour schedule ${date}`}
            fill
            className="object-contain"
            sizes="640px"
          />
        </div>

        <div className="flex items-center justify-between gap-2 mt-4">
          <button
            type="button"
            onClick={() => onRemove?.(item)}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-rose-400/40 text-rose-500 text-xs font-black hover:bg-rose-500/10"
          >
            <FaTrashAlt />
            {t.remove || "Remove"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-black bg-[var(--dash-accent)] text-white hover:opacity-90"
          >
            {t.close || "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Upload only image for an empty day — auto-publishes on save */
function UploadDayModal({ open, date, onClose, onUpload, busy }) {
  const { t } = useLanguage();
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    setImageUrl("");
    setError("");
  }, [open, date]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl) {
      setError(t.tourImageRequired || "Please upload a schedule image");
      return;
    }
    setError("");
    onUpload?.({
      id: uid("ts"),
      date,
      title: "",
      titleKn: "",
      imageUrl: imageUrl.trim(),
      s3Key: null,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
        aria-label={t.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl border border-[#CCBCA5]/40 bg-[var(--dash-panel)] shadow-2xl p-5 sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[var(--dash-text-40)] hover:text-[var(--dash-text)]"
          aria-label={t.close}
        >
          <FaTimes />
        </button>

        <h2 className="text-lg font-black text-[var(--dash-heading)] pr-8">
          {t.tourUploadDay || "Upload schedule image"}
        </h2>
        <p className="text-xs font-bold text-[var(--dash-accent)] mt-1">{date}</p>
        <p className="text-xs text-[var(--dash-text-50)] mt-1 font-medium">
          {t.tourUploadOnlyHint ||
            "Upload the schedule sheet image only. It publishes automatically."}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <MediaUpload
            label={t.tourDayImage || "Daily schedule sheet"}
            value={imageUrl}
            onChange={setImageUrl}
          />

          {error ? (
            <p className="text-sm font-bold text-rose-500">{error}</p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2.5 rounded-xl text-sm font-black text-[var(--dash-text-70)] hover:bg-[var(--dash-panel-soft)]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 rounded-xl text-sm font-black bg-[var(--dash-accent)] text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "…" : t.tourUploadPublish || "Upload & publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TourSchedulesAdmin() {
  const { lang, t } = useLanguage();
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [content, setContent] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [fallbackImage, setFallbackImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [modalDate, setModalDate] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadLandingContent();
      setContent(data);
      setSchedules([...(data?.media?.tourSchedules || [])]);
      setFallbackImage(data?.media?.tourScheduleImage || "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byDate = useMemo(() => {
    const map = {};
    for (const s of schedules) {
      if (s?.date) map[s.date] = s;
    }
    return map;
  }, [schedules]);

  const calendar = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    return { startOffset, daysInMonth };
  }, [viewYear, viewMonth]);

  const dayLabels = lang === "kn" ? DAYS_KN : DAYS_EN;
  const todayStr = toYmd(today);
  const exactForModal = modalDate ? byDate[modalDate] || null : null;
  const canUploadDate = (dateStr) => Boolean(dateStr && dateStr >= todayStr);

  const openDay = (dateStr, hasFile) => {
    if (hasFile) {
      setModalDate(dateStr);
      return;
    }
    // Upload only for today + upcoming days
    if (canUploadDate(dateStr)) {
      setModalDate(dateStr);
    }
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const publish = async (nextSchedules) => {
    if (!content) return;
    const sorted = [...nextSchedules].sort((a, b) =>
      String(a.date || "").localeCompare(String(b.date || ""))
    );
    const latest = [...sorted].reverse().find((s) => s.imageUrl);
    const nextFallback = latest?.imageUrl || fallbackImage;
    const next = {
      ...content,
      media: {
        ...(content.media || {}),
        tourScheduleImage: nextFallback,
        tourSchedules: sorted,
      },
    };
    const saved = await syncLandingContent(next);
    setContent(saved);
    setSchedules([...(saved?.media?.tourSchedules || [])]);
    setFallbackImage(saved?.media?.tourScheduleImage || "");
  };

  const handleUpload = async (item) => {
    if (!canUploadDate(item.date)) {
      setStatus(
        t.tourPastNoUpload ||
          "Upload is only allowed for today and upcoming days"
      );
      return;
    }
    setSaving(true);
    setStatus("");
    try {
      const withoutDate = schedules.filter((r) => r.date !== item.date);
      await publish([...withoutDate, item]);
      setModalDate(null);
      setStatus(t.tourSynced || "Synced to landing page");
    } catch (e) {
      setStatus(e?.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (item) => {
    const ok = window.confirm(
      t.tourRemoveConfirm ||
        "Remove this day's schedule sheet from the public calendar?"
    );
    if (!ok) return;
    setSaving(true);
    setStatus("");
    try {
      await publish(schedules.filter((r) => r.id !== item.id));
      setModalDate(null);
      setStatus(t.tourSynced || "Synced to landing page");
    } catch (e) {
      setStatus(e?.message || "Remove failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--dash-heading)]">
          {t.tourPageTitle || t.navTourSchedules || "MLA Tour Program"}
        </h1>
        <p className="text-sm text-[var(--dash-text-50)] font-medium mt-0.5 max-w-2xl">
          {t.tourCalendarHint ||
            "Today and upcoming days: upload a schedule image. If a day already has a file, click to view it. Past empty days are locked."}
        </p>
      </div>

      {status ? (
        <p className="text-xs font-bold text-[var(--dash-accent)]">{status}</p>
      ) : null}

      <div className="bg-[var(--dash-panel)] border border-[#CCBCA5]/25 rounded-2xl p-4 sm:p-6 shadow-sm w-full">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#CCBCA5]/20">
          <button
            type="button"
            onClick={goPrevMonth}
            className="w-9 h-9 rounded-xl border border-[#CCBCA5]/30 text-[var(--dash-heading)] hover:bg-[var(--dash-panel-soft)] inline-flex items-center justify-center"
            aria-label="Previous month"
          >
            <FaChevronLeft className="text-xs" />
          </button>
          <h2 className="text-base sm:text-lg font-black text-[var(--dash-heading)]">
            {monthLabel(viewYear, viewMonth, lang)}
          </h2>
          <button
            type="button"
            onClick={goNextMonth}
            className="w-9 h-9 rounded-xl border border-[#CCBCA5]/30 text-[var(--dash-heading)] hover:bg-[var(--dash-panel-soft)] inline-flex items-center justify-center"
            aria-label="Next month"
          >
            <FaChevronRight className="text-xs" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-black text-[var(--dash-accent)] pb-2 mb-1">
          {dayLabels.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: calendar.startOffset }, (_, i) => (
            <span key={`b-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: calendar.daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const exact = byDate[dateStr];
            const hasFile = Boolean(exact?.imageUrl);
            const isPast = dateStr < todayStr;
            const canUpload = !hasFile && canUploadDate(dateStr);
            const clickable = hasFile || canUpload;
            const inherited =
              !hasFile &&
              Boolean(
                resolveTourScheduleForDate(dateStr, schedules, fallbackImage)
                  ?.imageUrl
              );
            const isToday = dateStr === todayStr;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={!clickable}
                onClick={() => openDay(dateStr, hasFile)}
                title={
                  hasFile
                    ? t.tourViewDay || "View schedule"
                    : canUpload
                      ? t.tourUploadDay || "Upload schedule"
                      : t.tourPastNoUpload || "Past day — upload closed"
                }
                className={`relative aspect-square rounded-xl font-black text-sm transition-all flex items-center justify-center border ${
                  hasFile
                    ? "bg-[var(--dash-accent)]/15 border-[var(--dash-accent)]/50 text-[var(--dash-heading)] hover:bg-[var(--dash-accent)]/25"
                    : canUpload
                      ? "bg-[var(--dash-panel-soft)] border-[#CCBCA5]/20 text-[var(--dash-text-70)] hover:border-[var(--dash-accent)]/40 hover:text-[var(--dash-heading)]"
                      : isPast
                        ? "bg-[var(--dash-panel-soft)]/60 border-[#CCBCA5]/15 text-[var(--dash-text-40)] cursor-not-allowed opacity-60"
                        : "bg-[var(--dash-panel-soft)] border-[#CCBCA5]/20 text-[var(--dash-text-70)]"
                } ${isToday ? "ring-2 ring-[var(--dash-accent)] ring-offset-1 ring-offset-[var(--dash-panel)]" : ""} ${
                  inherited && !hasFile && canUpload
                    ? "border-[var(--dash-accent)]/25"
                    : ""
                }`}
              >
                <span>{dayNum}</span>
                {hasFile ? (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-md bg-[var(--dash-accent)] text-white inline-flex items-center justify-center shadow-sm">
                    <FaFileImage className="text-[10px]" />
                  </span>
                ) : inherited && canUpload ? (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--dash-accent)]/70" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[#CCBCA5]/20 text-[11px] font-bold text-[var(--dash-text-50)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-[var(--dash-accent)] text-white inline-flex items-center justify-center">
              <FaFileImage className="text-[10px]" />
            </span>
            {t.tourHasFile || "Uploaded — click to view"}
          </span>
          <span>
            {t.tourUploadFromToday ||
              "Upload allowed: today & upcoming days only"}
          </span>
        </div>
      </div>

      {exactForModal ? (
        <ViewDayModal
          open={Boolean(modalDate)}
          date={modalDate}
          item={exactForModal}
          onClose={() => setModalDate(null)}
          onRemove={handleRemove}
        />
      ) : canUploadDate(modalDate) ? (
        <UploadDayModal
          open={Boolean(modalDate)}
          date={modalDate}
          onClose={() => setModalDate(null)}
          onUpload={handleUpload}
          busy={saving}
        />
      ) : null}
    </div>
  );
}
