"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_MEDIA_REPORTS = [
  {
    id: "mr1",
    paperKn: "ಕನ್ನಡ ಪ್ರಭ",
    date: "2026-03-23",
    monthKey: "2026-03",
    imageUrl: "/kannada_newspaper_clipping_main.jpg",
  },
  {
    id: "mr2",
    paperKn: "ವಿಶ್ವವಾಣಿ",
    date: "2026-03-23",
    monthKey: "2026-03",
    imageUrl: "/kannada_newspaper_clipping_main.jpg",
  },
  {
    id: "mr3",
    paperKn: "ವಿಜಯ ಕರ್ನಾಟಕ",
    date: "2026-07-22",
    monthKey: "2026-07",
    imageUrl: "/kannada_newspaper_clipping_main.jpg",
  },
  {
    id: "mr4",
    paperKn: "ಪ್ರಜಾವಾಣಿ",
    date: "2026-08-01",
    monthKey: "2026-08",
    imageUrl: "/kannada_newspaper_clipping_main.jpg",
  },
  {
    id: "mr5",
    paperKn: "ಪ್ರಜಾ ಪ್ರಗತಿ",
    date: "2026-03-22",
    monthKey: "2026-03",
    imageUrl: "/kannada_newspaper_clipping_main.jpg",
  },
  {
    id: "mr6",
    paperKn: "ವಿಶ್ವವಾಣಿ",
    date: "2026-03-23",
    monthKey: "2026-03",
    imageUrl: "/kannada_newspaper_clipping_main.jpg",
  },
  {
    id: "mr7",
    paperKn: "ಸಂಯುಕ್ತ ಕರ್ನಾಟಕ",
    date: "2026-07-24",
    monthKey: "2026-07",
    imageUrl: "/kannada_newspaper_clipping_main.jpg",
  },
  {
    id: "mr8",
    paperKn: "ವಿಜಯ ಕರ್ನಾಟಕ",
    date: "2026-08-02",
    monthKey: "2026-08",
    imageUrl: "/kannada_newspaper_clipping_main.jpg",
  }
];

export default function MediaReportsSection({
  lang = "kn",
  reports = DEFAULT_MEDIA_REPORTS,
}) {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [activeModalReport, setActiveModalReport] = useState(null);

  const displayReports = useMemo(() => {
    let items = Array.isArray(reports) && reports.length > 0 ? reports : DEFAULT_MEDIA_REPORTS;
    
    if (selectedMonth !== "All") {
      items = items.filter((r) => r.monthKey === selectedMonth || r.date?.startsWith(selectedMonth));
    }

    return items;
  }, [reports, selectedMonth]);

  const monthOptions = useMemo(() => {
    return [
      { key: "All", labelKn: "ಎಲ್ಲಾ ವರದಿಗಳು", labelEn: "All Reports" },
      { key: "2026-08", labelKn: "ಆಗಸ್ಟ್ 2026", labelEn: "August 2026" },
      { key: "2026-07", labelKn: "ಜುಲೈ 2026", labelEn: "July 2026" },
      { key: "2026-03", labelKn: "ಮಾರ್ಚ್ 2026", labelEn: "March 2026" }
    ];
  }, []);

  return (
    <section id="media-reports" className="relative py-14 bg-gradient-to-br from-[#001438] via-[#002B7F] to-[#003B95] text-white shadow-2xl overflow-hidden">
      
      {/* Background Graphic Watermark */}
      <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
        <Image
          src="/vidhana_soudha_bg.png"
          alt="Media Background Pattern"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-7">
        
        {/* Royal Blue / Saffron Gold Section Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {lang === "kn" ? "ಪತ್ರಿಕಾ ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ಮಾಧ್ಯಮ ವರದಿಗಳು" : "Press Coverage & Media Reports"}
          </h2>
          <p className="text-slate-300 text-xs sm:text-base font-semibold max-w-3xl leading-relaxed">
            {lang === "kn"
              ? "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದ ಅಭಿವೃದ್ಧಿ ಕಾರ್ಯಕ್ರಮಗಳು ಹಾಗೂ ಶಾಸಕರ ಜನಸ್ಪಂದನ ಸುದ್ದಿಗಳ ಮಾಧ್ಯಮ ವರದಿಗಳು"
              : "Official newspaper clippings, press reports & public announcements regarding Kudligi Constituency development"}
          </p>
          <div className="w-24 h-1.5 bg-[#FFD700] rounded-full mt-1 shadow-md" />
        </div>

        {/* Filter Bar: Month Selector Pills */}
        <div className="flex items-center justify-center gap-4 bg-white/10 border-2 border-white/20 p-3 sm:p-4 rounded-3xl backdrop-blur-md shadow-xl">
          <div className="flex items-center flex-nowrap gap-2 overflow-x-auto w-full pb-0.5 scrollbar-none justify-start sm:justify-center">
            {monthOptions.map((opt) => {
              const isActive = selectedMonth === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedMonth(opt.key)}
                  className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#FFD700] text-slate-950 ring-4 ring-[#FFD700]/30 shadow-lg scale-105"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  }`}
                >
                  {lang === "kn" ? opt.labelKn : opt.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Horizontal snap carousel on phones (same pattern as gallery); grid from tablet up */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0 -mx-1 px-1 scrollbar-none">
          {displayReports.map((report) => (
            <div
              key={report.id}
              onClick={() => setActiveModalReport(report)}
              className="bg-white border-2 border-white/40 shadow-xl hover:shadow-2xl hover:border-[#FFD700] transition-all duration-300 cursor-pointer relative h-[240px] sm:h-[300px] lg:h-[320px] flex items-center justify-center overflow-hidden group rounded-2xl snap-center shrink-0 w-[78vw] max-w-[300px] md:w-auto md:max-w-none md:shrink"
            >
              <Image
                src={report.imageUrl || "/kannada_newspaper_clipping_main.jpg"}
                alt={report.paperKn || "Kannada Newspaper Clipping"}
                fill
                sizes="(max-width: 768px) 78vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#001438]/95 to-transparent px-3 py-2.5">
                <p className="text-[11px] font-black text-[#FFD700] truncate">
                  {report.paperKn}
                </p>
                <p className="text-[10px] font-bold text-white/80">{report.date}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Ultra-High Z-Index Full Resolution Lightbox Modal (z-[9999]) */}
      <AnimatePresence>
        {activeModalReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden"
            onClick={() => setActiveModalReport(null)}
          >
            {/* Top Modal Header Toolbar */}
            <div
              className="w-full max-w-5xl flex items-center justify-between bg-[#001742] border-2 border-white/30 rounded-2xl px-5 py-3 shadow-2xl z-50 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-white">
                <span className="text-2xl">📰</span>
                <div className="flex flex-col text-left">
                  <span className="bg-[#FFD700] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full w-fit mb-0.5">
                    {lang === "kn" ? activeModalReport.paperKn : activeModalReport.paperEn} · {activeModalReport.date}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white line-clamp-1">
                    {lang === "kn" ? activeModalReport.titleKn || activeModalReport.paperKn : activeModalReport.titleEn || activeModalReport.paperEn}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={activeModalReport.imageUrl || "/news_media_card.png"}
                  download
                  className="px-4 py-2 rounded-xl bg-[#FFD700] hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg transition-all inline-flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>📥</span>
                  <span>{lang === "kn" ? "ಡೌನ್‌ಲೋಡ್" : "Download Clipping"}</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveModalReport(null)}
                  className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-lg flex items-center justify-center shadow-lg transition-all cursor-pointer"
                  title="Close Modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Full-Resolution Clipping Container */}
            <div
              className="relative w-full max-w-5xl h-full my-3 flex items-center justify-center overflow-auto rounded-2xl p-2 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeModalReport.imageUrl || "/news_media_card.png"}
                alt="Newspaper Clipping Full Resolution"
                width={1400}
                height={1800}
                className="max-w-full max-h-[82vh] w-auto h-auto object-contain rounded-xl shadow-2xl border-2 border-white/20 bg-white"
                unoptimized
                priority
              />
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
