"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { resolveTourScheduleForDate } from "@/lib/tourScheduleResolve";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_OF_WEEK_KN = ["ಆದಿ", "ಸೋಮ", "ಮಂಗಳ", "ಬುಧ", "ಗುರು", "ಶುಕ್ರ", "ಶನಿ"];

function toYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthMeta(ym) {
  const [y, m] = ym.split("-").map(Number);
  const daysCount = new Date(y, m, 0).getDate();
  const startDayOffset = new Date(y, m - 1, 1).getDay();
  const date = new Date(y, m - 1, 1);
  return {
    id: ym,
    daysCount,
    startDayOffset,
    nameEn: date.toLocaleString("en-IN", { month: "long", year: "numeric" }),
    nameKn: date.toLocaleString("kn-IN", { month: "long", year: "numeric" }),
  };
}

/** Months from uploads + current/next month so visitors can open today/tomorrow. */
function buildMonths(schedules) {
  const months = new Set();
  for (const s of schedules || []) {
    if (s?.date && /^\d{4}-\d{2}-\d{2}$/.test(s.date)) {
      months.add(s.date.slice(0, 7));
    }
  }
  const now = new Date();
  months.add(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  months.add(
    `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`
  );
  return [...months].sort().map(monthMeta);
}

export default function MlaTourCalendar({
  lang = "kn",
  scheduleImage = "/tour_schedule_sheet_v10.png",
  schedules = [],
}) {
  const todayStr = useMemo(() => toYmd(new Date()), []);
  const fallbackImage = scheduleImage || "/tour_schedule_sheet_v10.png";

  const exactDates = useMemo(() => {
    const set = new Set();
    for (const s of schedules || []) {
      if (s?.date && s?.imageUrl) set.add(s.date);
    }
    return set;
  }, [schedules]);

  const months = useMemo(() => buildMonths(schedules), [schedules]);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSelectedDate(todayStr);
    const ym = todayStr.slice(0, 7);
    const idx = months.findIndex((m) => m.id === ym);
    if (idx >= 0) setSelectedMonthIdx(idx);
  }, [todayStr, months]);

  // Prevent background page body scroll while modal is open
  useEffect(() => {
    if (isImageModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isImageModalOpen]);

  const activeMonth = months[selectedMonthIdx] || months[0];
  const resolved = useMemo(
    () => resolveTourScheduleForDate(selectedDate, schedules, fallbackImage),
    [selectedDate, schedules, fallbackImage]
  );
  const displayImage = resolved?.imageUrl || fallbackImage;
  const eventTitle =
    lang === "kn"
      ? resolved?.titleKn || resolved?.title || ""
      : resolved?.title || resolved?.titleKn || "";
  const dayLabels = lang === "kn" ? DAYS_OF_WEEK_KN : DAYS_OF_WEEK;

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center justify-center">
      {/* Left Column: Ultra Compact White Theme Calendar Card */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white border-4 border-[#0055C4] rounded-3xl p-3.5 sm:p-4 shadow-2xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
          <button
            type="button"
            onClick={() =>
              selectedMonthIdx > 0 && setSelectedMonthIdx(selectedMonthIdx - 1)
            }
            disabled={selectedMonthIdx === 0}
            className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 hover:bg-[#0055C4] hover:text-white text-slate-800 font-black transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer text-xs"
            title="Previous Month"
          >
            ◀
          </button>

          <h4 className="text-sm sm:text-base font-black text-[#001D56]">
            {lang === "kn" ? activeMonth.nameKn : activeMonth.nameEn}
          </h4>

          <button
            type="button"
            onClick={() =>
              selectedMonthIdx < months.length - 1 &&
              setSelectedMonthIdx(selectedMonthIdx + 1)
            }
            disabled={selectedMonthIdx >= months.length - 1}
            className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 hover:bg-[#0055C4] hover:text-white text-slate-800 font-black transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer text-xs"
            title="Next Month"
          >
            ▶
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-[11px] font-black text-[#0055C4] pb-1 border-b border-slate-200">
          {dayLabels.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: activeMonth.startDayOffset }, (_, i) => (
            <span key={`blank-${i}`} className="p-0.5" />
          ))}

          {Array.from({ length: activeMonth.daysCount }, (_, i) => {
            const dayNum = i + 1;
            const dateStr = `${activeMonth.id}-${
              dayNum < 10 ? "0" + dayNum : dayNum
            }`;
            const hasExact = exactDates.has(dateStr);
            const hasResolved = Boolean(
              resolveTourScheduleForDate(dateStr, schedules, fallbackImage)
                ?.imageUrl
            );
            const isSelected = selectedDate === dateStr;

            return (
              <button
                type="button"
                key={dayNum}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative py-1 sm:py-1.5 rounded-lg font-black transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-[#0055C4] to-[#0077E6] text-white ring-2 ring-[#0055C4]/40 shadow-md scale-105 z-10"
                    : hasExact
                      ? "bg-[#0055C4]/15 text-[#0055C4] border border-[#0055C4]/40 hover:bg-[#0055C4]/30"
                      : hasResolved
                        ? "bg-[#F8FAFC] text-[#0055C4] border border-[#0055C4]/25 hover:bg-slate-100"
                        : "bg-[#F8FAFC] text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{dayNum}</span>
                {hasExact ? (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected ? "bg-[#FFD700]" : "bg-[#0055C4]"
                    }`}
                  />
                ) : hasResolved ? (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected ? "bg-white/80" : "bg-[#0055C4]/50"
                    }`}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {eventTitle ? (
          <p className="text-[11px] font-bold text-[#001D56] text-center bg-slate-50 p-1 rounded-lg border border-slate-200 truncate">
            📌 {eventTitle}
          </p>
        ) : null}

        <div className="flex items-center justify-around pt-1.5 border-t border-slate-200 text-[10px] font-bold text-slate-700">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0055C4]" />
            <span>{lang === "kn" ? "Selected" : "Selected"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0055C4]/30 border border-[#0055C4]" />
            <span>{lang === "kn" ? "Scheduled" : "Scheduled"}</span>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-[#0055C4]/30 rounded-xl p-2 flex flex-col gap-0.5 shadow-sm">
          <span className="text-[#0055C4] text-[9px] font-black uppercase tracking-wider">
            MLA Helpline Contacts
          </span>
          <div className="flex flex-col gap-0.5 text-[10px] text-slate-700 font-semibold">
            <div className="flex justify-between">
              <span>M. Marulasiddappa (PA):</span>
              <strong className="text-[#0055C4]">9880227338</strong>
            </div>
            <div className="flex justify-between">
              <span>Kavalli Raghavendra (PA):</span>
              <strong className="text-[#0055C4]">9880400177</strong>
            </div>
            <div className="flex justify-between">
              <span>Jan Samparka Office:</span>
              <strong className="text-[#001D56]">9187154357</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Pure Frameless Schedule Document Sheet (No Boxes / No Borders) */}
      <div
        onClick={() => setIsImageModalOpen(true)}
        className="lg:col-span-7 xl:col-span-8 relative w-full h-[520px] sm:h-[580px] lg:h-[650px] cursor-pointer flex items-center justify-center group my-auto"
      >
        <Image
          src={displayImage}
          alt="Official MLA Tour Schedule Document Sheet"
          fill
          sizes="(max-width: 1024px) 100vw, 75vw"
          className="object-contain object-center drop-shadow-2xl hover:scale-[1.01] transition-transform duration-300"
          priority
          unoptimized
        />
      </div>

      {/* Lightbox Modal Rendered via Portal directly into document.body (z-[99999999] guarantees no header overlap) */}
      {mounted && isImageModalOpen
        ? createPortal(
            <AnimatePresence>
              <div
                onClick={() => setIsImageModalOpen(false)}
                className="fixed inset-0 z-[99999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-2xl cursor-pointer overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-3xl p-3 sm:p-5 shadow-2xl overflow-hidden flex flex-col items-center gap-3 border-2 border-[#0055C4]/30"
                >
                  {/* Modal Header & Close Button */}
                  <div className="w-full flex items-center justify-between pb-2 border-b border-slate-200 shrink-0 pr-12">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#0055C4] text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                        📄 {selectedDate}
                      </span>
                      <h3 className="text-xs sm:text-base font-black text-[#001D56] truncate max-w-[280px] sm:max-w-[500px]">
                        {eventTitle || (lang === "kn" ? "ಶಾಸಕರ ಅಧಿಕೃತ ಪ್ರವಾಸ ಪಟ್ಟಿ" : "Official MLA Tour Schedule")}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(false)}
                    className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-slate-900 hover:bg-red-600 text-white flex items-center justify-center text-lg font-black shadow-xl transition-all cursor-pointer"
                    title="Close"
                  >
                    ✕
                  </button>

                  {/* High Resolution Document Viewport (Fits 100% inside modal without cutoffs) */}
                  <div className="relative w-full h-[78vh] sm:h-[82vh] overflow-y-auto rounded-2xl bg-slate-50 p-2 flex items-center justify-center border border-slate-200 shadow-inner">
                    <img
                      src={displayImage}
                      alt="Official MLA Tour Document High Resolution"
                      className="max-h-full max-w-full object-contain mx-auto shadow-md rounded-lg"
                    />
                  </div>

                  {/* Modal Bottom Action Bar */}
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={displayImage}
                      download="MLA_Tour_Schedule.png"
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0055C4] to-[#0077E6] hover:from-[#0040A8] hover:to-[#0055C4] text-white text-xs font-black shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>📥</span>
                      <span>{lang === "kn" ? "ಪ್ರವಾಸ ಪಟ್ಟಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ" : "Download Official Sheet"}</span>
                    </a>
                  </div>
                </motion.div>
              </div>
            </AnimatePresence>,
            document.body
          )
        : null}
    </div>
  );
}
