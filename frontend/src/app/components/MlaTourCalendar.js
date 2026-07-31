"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_OF_WEEK_KN = ["ಆದಿ", "ಸೋಮ", "ಮಂಗಳ", "ಬುಧ", "ಗುರು", "ಶುಕ್ರ", "ಶನಿ"];

const FALLBACK_MONTHS = [
  {
    id: "2026-06",
    nameKn: "June 2026",
    nameEn: "June 2026",
    daysCount: 30,
    startDayOffset: 1,
  },
  {
    id: "2026-07",
    nameKn: "July 2026",
    nameEn: "July 2026",
    daysCount: 31,
    startDayOffset: 3,
  },
  {
    id: "2026-08",
    nameKn: "August 2026",
    nameEn: "August 2026",
    daysCount: 31,
    startDayOffset: 6,
  },
];

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

function buildMonthsFromSchedules(schedules) {
  const months = new Set();
  for (const s of schedules || []) {
    if (s?.date && /^\d{4}-\d{2}-\d{2}$/.test(s.date)) {
      months.add(s.date.slice(0, 7));
    }
  }
  const list = [...months].sort().map(monthMeta);
  return list.length ? list : FALLBACK_MONTHS;
}

export default function MlaTourCalendar({
  lang = "kn",
  scheduleImage = "/tour_schedule_sheet_v10.png",
  schedules = [],
}) {
  const scheduleMap = useMemo(() => {
    const map = {};
    for (const s of schedules || []) {
      if (!s?.date) continue;
      map[s.date] = {
        image: s.imageUrl || scheduleImage || "/tour_schedule_sheet_v10.png",
        title: s.title || "",
        titleKn: s.titleKn || s.title || "",
      };
    }
    return map;
  }, [schedules, scheduleImage]);

  const months = useMemo(
    () => buildMonthsFromSchedules(schedules),
    [schedules]
  );

  const firstScheduled = useMemo(() => {
    const keys = Object.keys(scheduleMap).sort();
    return keys[0] || null;
  }, [scheduleMap]);

  const [selectedDate, setSelectedDate] = useState(
    firstScheduled || "2026-07-22"
  );
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (!firstScheduled) return;
    setSelectedDate(firstScheduled);
    const ym = firstScheduled.slice(0, 7);
    const idx = months.findIndex((m) => m.id === ym);
    if (idx >= 0) setSelectedMonthIdx(idx);
  }, [firstScheduled, months]);

  const activeMonth =
    months[selectedMonthIdx] || months[0] || FALLBACK_MONTHS[1];
  const fallbackImage = scheduleImage || "/tour_schedule_sheet_v10.png";
  const event = scheduleMap[selectedDate];
  const displayImage = event?.image || fallbackImage;
  const eventTitle =
    lang === "kn"
      ? event?.titleKn || event?.title || ""
      : event?.title || event?.titleKn || "";
  const dayLabels = lang === "kn" ? DAYS_OF_WEEK_KN : DAYS_OF_WEEK;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div className="lg:col-span-5 bg-white border-4 border-[#0055C4] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3.5">
          <button
            type="button"
            onClick={() =>
              selectedMonthIdx > 0 && setSelectedMonthIdx(selectedMonthIdx - 1)
            }
            disabled={selectedMonthIdx === 0}
            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 hover:bg-[#0055C4] hover:text-white text-slate-800 font-black transition-all flex items-center justify-center disabled:opacity-30"
            title="Previous Month"
          >
            ◀
          </button>

          <h4 className="text-lg sm:text-xl font-black text-[#001D56]">
            {lang === "kn" ? activeMonth.nameKn : activeMonth.nameEn}
          </h4>

          <button
            type="button"
            onClick={() =>
              selectedMonthIdx < months.length - 1 &&
              setSelectedMonthIdx(selectedMonthIdx + 1)
            }
            disabled={selectedMonthIdx >= months.length - 1}
            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 hover:bg-[#0055C4] hover:text-white text-slate-800 font-black transition-all flex items-center justify-center disabled:opacity-30"
            title="Next Month"
          >
            ▶
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-black text-[#0055C4] pb-2.5 border-b border-slate-200">
          {dayLabels.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs sm:text-sm">
          {Array.from({ length: activeMonth.startDayOffset }, (_, i) => (
            <span key={`blank-${i}`} className="p-2" />
          ))}

          {Array.from({ length: activeMonth.daysCount }, (_, i) => {
            const dayNum = i + 1;
            const dateStr = `${activeMonth.id}-${
              dayNum < 10 ? "0" + dayNum : dayNum
            }`;
            const hasEvent = !!scheduleMap[dateStr];
            const isSelected = selectedDate === dateStr;

            return (
              <button
                type="button"
                key={dayNum}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative py-3 rounded-xl font-black transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? "bg-gradient-to-r from-[#0055C4] to-[#0077E6] text-white ring-4 ring-[#0055C4]/40 shadow-lg scale-105 z-10"
                    : hasEvent
                      ? "bg-[#0055C4]/15 text-[#0055C4] border-2 border-[#0055C4]/40 hover:bg-[#0055C4]/30"
                      : "bg-[#F8FAFC] text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{dayNum}</span>
                {hasEvent ? (
                  <span
                    className={`w-2 h-2 rounded-full mt-0.5 ${
                      isSelected ? "bg-[#FFD700]" : "bg-[#0055C4]"
                    }`}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {eventTitle ? (
          <p className="text-sm font-bold text-[#001D56] text-center">
            {eventTitle}
          </p>
        ) : null}

        <div className="flex items-center justify-around pt-3 border-t border-slate-200 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#0055C4]" />
            <span>{lang === "kn" ? "Selected" : "Selected"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#0055C4]/30 border border-[#0055C4]" />
            <span>{lang === "kn" ? "Scheduled" : "Scheduled"}</span>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border-2 border-[#0055C4]/30 rounded-xl p-4 flex flex-col gap-2.5 mt-1 shadow-sm">
          <span className="text-[#0055C4] text-xs font-black uppercase tracking-wider">
            MLA Helpline Contacts
          </span>
          <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-slate-700 font-semibold">
            <div className="flex justify-between">
              <span>M. Marulasiddappa (PA):</span>
              <strong className="text-[#0055C4]">9880227338</strong>
            </div>
            <div className="flex justify-between">
              <span>Kavalli Raghavendra (PA):</span>
              <strong className="text-[#0055C4]">9880400177</strong>
            </div>
            <div className="flex justify-between">
              <span>Jan Samparka Office Kudligi:</span>
              <strong className="text-[#001D56]">9187154357</strong>
            </div>
          </div>
        </div>
      </div>

      <div
        onClick={() => setIsImageModalOpen(true)}
        className="lg:col-span-7 relative w-full h-[580px] sm:h-[680px] cursor-pointer flex items-center justify-center"
      >
        <Image
          src={displayImage}
          alt="Official MLA Tour Schedule Document Sheet"
          fill
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-contain object-top drop-shadow-xl hover:scale-[1.01] transition-transform duration-300"
          priority
          unoptimized
        />
      </div>

      <AnimatePresence>
        {isImageModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 shadow-2xl overflow-hidden flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-black shadow-xl hover:bg-red-600 transition-all"
              >
                ✕
              </button>

              <div className="relative w-full h-[82vh]">
                <Image
                  src={displayImage}
                  alt="Official MLA Tour Document High Resolution"
                  fill
                  sizes="1000px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <a
                href={displayImage}
                download
                className="mt-2 mb-1 px-4 py-2 rounded-full bg-[#0055C4] text-white text-xs font-black"
                onClick={(e) => e.stopPropagation()}
              >
                Download sheet
              </a>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
