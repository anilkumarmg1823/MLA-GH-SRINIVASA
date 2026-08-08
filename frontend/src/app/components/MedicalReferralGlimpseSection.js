"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaPhoneAlt,
  FaFileAlt,
  FaCheckCircle,
  FaStethoscope,
} from "react-icons/fa";

const POINTS = {
  kn: [
    "ಜಯದೇವ, ಕಿದ್ವಾಯಿ & ನಿಮ್ಹಾನ್ಸ್ ಆಸ್ಪತ್ರೆಗಳಿಗೆ ಶಾಸಕರ ಕಚೇರಿ ಶಿಫಾರಸು ಪತ್ರ",
    "ಸಿಎಂ ಪರಿಹಾರ ನಿಧಿ ನೆರವು ಹಾಗೂ ಬಿಪಿಎಲ್ ಉಚಿತ ಚಿಕಿತ್ಸೆ ಸೌಲಭ್ಯ",
    "೨೪x೭ ತಾಲೂಕು ಸಹಾಯವಾಣಿ & ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಶಾಸಕರ ಪ್ರತಿನಿಧಿಗಳ ನೆರವು",
  ],
  en: [
    "Jayadeva, Kidwai & NIMHANS Hospitals Official MLA Referral Letter",
    "CM Relief Fund Financial Assistance & Ayushman BPL Healthcare Aid",
    "24x7 Constituency Helpline & Hospital Nodal Staff Support",
  ],
};

export default function MedicalReferralGlimpseSection({ lang = "kn" }) {
  const points = POINTS[lang] || POINTS.en;

  return (
    <section
      id="medical-referral-glimpse"
      className="relative py-12 sm:py-16 bg-white shadow-xl overflow-hidden text-slate-900"
    >
      {/* Caduceus / doctor symbol only (no MLA photo wash) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.08] sm:opacity-10 pointer-events-none select-none">
        <Image
          src="/caduceus_medical_symbol.png"
          alt=""
          width={420}
          height={420}
          className="object-contain filter grayscale contrast-125"
          unoptimized
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 max-w-3xl text-left">
          <div className="w-fit inline-flex items-center gap-2 bg-[#002B7F]/10 border border-[#002B7F]/30 text-[#002B7F] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            <FaStethoscope className="w-4 h-4 text-[#002B7F]" />
            <span>
              {lang === "kn"
                ? "ಶಾಸಕರ ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಕೋಶ"
                : "MLA Medical Referral Cell"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 border-l-4 border-[#FFD700] pl-3.5">
            <h4 className="text-base sm:text-lg font-black text-[#002B7F] tracking-wide">
              {lang === "kn" ? "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ." : "Dr. Srinivas N. T."}
            </h4>
            <p className="text-xs sm:text-sm font-black text-slate-800">
              MBBS, MD (AIIMS Delhi)
            </p>
            <p className="text-xs font-bold text-slate-600">
              {lang === "kn"
                ? "ಶಾಸಕರು, ಕೂಡ್ಲಿಗಿ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ"
                : "MLA, Kudligi Assembly Constituency"}
            </p>
          </div>

          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-[#001D56] tracking-tight leading-snug">
            {lang === "kn"
              ? "ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಪತ್ರ & ಉಚಿತ ಆಸ್ಪತ್ರೆ ಚಿಕಿತ್ಸಾ ನೆರವು"
              : "Medical Referral Letters & Free Hospital Care Assistance"}
          </h2>

          <div className="w-20 h-1.5 bg-[#FFD700] rounded-full shadow-sm" />

          <p className="text-slate-700 text-xs sm:text-sm font-bold leading-relaxed">
            {lang === "kn"
              ? "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದ ಸಾರ್ವಜನಿಕರಿಗೆ ಜಯದೇವ, ಕಿದ್ವಾಯಿ, ನಿಮ್ಹಾನ್ಸ್, ವಿಕ್ಟೋರಿಯಾ ಹಾಗೂ ವಿಐಎಂಎಸ್ ಬಳ್ಳಾರಿ ಆಸ್ಪತ್ರೆಗಳಿಗೆ ಶಾಸಕರ ಕಚೇರಿಯಿಂದ ಉಚಿತ ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಪತ್ರ, ಸಿಎಂ ಪರಿಹಾರ ನಿಧಿ ಹಾಗೂ ಆದ್ಯತೆಯ ಚಿಕಿತ್ಸಾ ಮಾರ್ಗದರ್ಶನ."
              : "Official MLA recommendation letters, CM Relief Fund financial aid, and direct hospital guidance for Kudligi constituency citizens."}
          </p>

          {/* Row-wise / carousel of benefit chips on mobile */}
          <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1 scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
            {points.map((text) => (
              <div
                key={text}
                className="snap-center shrink-0 w-[78%] max-w-[260px] sm:w-auto sm:max-w-none flex items-start gap-2.5 bg-slate-50/95 p-3 rounded-2xl border border-slate-200 shadow-sm"
              >
                <FaCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                  {text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <Link
              href="/medical-referral"
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#001D56] hover:bg-[#002B7F] text-[#FFD700] text-xs sm:text-sm font-black shadow-xl transition-all border-2 border-[#FFD700] flex items-center justify-center gap-2"
            >
              <FaFileAlt className="w-4 h-4 text-[#FFD700]" />
              <span>
                {lang === "kn"
                  ? "ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಪುಟಕ್ಕೆ ತೆರಳಿ ➔"
                  : "Go to Medical Referral Page ➔"}
              </span>
            </Link>

            <a
              href="tel:9480498694"
              className="px-5 py-3 sm:py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black border border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <FaPhoneAlt className="w-3.5 h-3.5 text-[#002B7F]" />
              <span>9480498694</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
