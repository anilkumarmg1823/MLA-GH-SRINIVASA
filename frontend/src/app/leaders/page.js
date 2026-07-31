"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  FaPhoneAlt, FaWhatsapp, FaUserCheck, FaSearch, 
  FaUserTie, FaMapMarkerAlt, FaMedal, FaHome 
} from "react-icons/fa";

// Leaders Comprehensive Dataset
const LEADERS_DATA = [
  {
    id: 1,
    nameKn: "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ.",
    nameEn: "Dr. Srinivas N. T.",
    roleKn: "ಶಾಸಕರು - ಕೂಡ್ಲಿಗಿ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ",
    roleEn: "MLA - Kudligi Constituency",
    category: "district",
    categoryKn: "ಜಿಲ್ಲಾ ಮುಖಂಡರು",
    categoryEn: "District Leader",
    locationKn: "ಕೂಡ್ಲಿಗಿ / ವಿಜಯನಗರ",
    phone: "9187154357",
    whatsapp: "9187154357",
    photo: "/Picsart_26-02-05_14-31-10-288 (1).png",
    bioKn: "ಕೂಡ್ಲಿಗಿ ಶಾಸಕರು, ಜನಸೇವಕರು ಹಾಗೂ ತಾಲೂಕಿನ ಅಭಿವೃದ್ಧಿಯ ರೂವಾರಿ.",
    isImportant: true
  },
  {
    id: 2,
    nameKn: "ಎಚ್.ಎನ್. ತಿಪ್ಪೇಸ್ವಾಮಿ",
    nameEn: "H.N. Thippeswamy",
    roleKn: "ತಾಲೂಕು ಕಾಂಗ್ರೆಸ್ ಸಮಿತಿ ಅಧ್ಯಕ್ಷರು",
    roleEn: "Taluk Congress President",
    category: "taluk",
    categoryKn: "ತಾಲೂಕು ಮುಖಂಡರು",
    categoryEn: "Taluk Leader",
    locationKn: "ಕೂಡ್ಲಿಗಿ ತಾಲೂಕು",
    phone: "9845123456",
    whatsapp: "9845123456",
    photo: "/cm_photo.png",
    bioKn: "ಕೂಡ್ಲಿಗಿ ತಾಲೂಕು ಕಾಂಗ್ರೆಸ್ ಪಕ್ಷದ ಹಿರಿಯ ಸಂಘಟಕರು.",
    isImportant: true
  },
  {
    id: 3,
    nameKn: "ಎಂ. ಮರುಳಸಿದ್ಧಪ್ಪ",
    nameEn: "M. Marulasiddappa",
    roleKn: "ಶಾಸಕರ ಆಪ್ತ ಸಹಾಯಕರು (PA)",
    roleEn: "Personal Assistant to MLA",
    category: "party",
    categoryKn: "ಪಕ್ಷದ ಮುಖಂಡರು",
    categoryEn: "Party Leader",
    locationKn: "ಕೂಡ್ಲಿಗಿ ಪಟ್ಟಣ",
    phone: "9880227338",
    whatsapp: "9880227338",
    photo: "/cm_photo.png",
    bioKn: "ಸಾರ್ವಜನಿಕ ಅಹವಾಲು ಸ್ವೀಕಾರ ಹಾಗೂ ಕಚೇರಿ ಉಸ್ತುವಾರಿ.",
    isImportant: true
  },
  {
    id: 4,
    nameKn: "ಕಾವಲ್ಲಿ ರಾಘವೇಂದ್ರ",
    nameEn: "Kavalli Raghavendra",
    roleKn: "ಶಾಸಕರ ಆಪ್ತ ಸಹಾಯಕರು (PA)",
    roleEn: "Personal Assistant to MLA",
    category: "party",
    categoryKn: "ಪಕ್ಷದ ಮುಖಂಡರು",
    categoryEn: "Party Leader",
    locationKn: "ಕೂಡ್ಲಿಗಿ ತಾಲೂಕು",
    phone: "9880400177",
    whatsapp: "9880400177",
    photo: "/cm_photo.png",
    bioKn: "ಕ್ಷೇತ್ರದ ಗ್ರಾಮೀಣ ಅಭಿವೃದ್ಧಿ ಸಂಘಟನೆ ಉಸ್ತುವಾರಿ.",
    isImportant: true
  },
  {
    id: 5,
    nameKn: "ಕೆ. ಬಿ. ಮಂಜುನಾಥ್",
    nameEn: "K. B. Manjunath",
    roleKn: "ಜಿಲ್ಲಾ ಕಾಂಗ್ರೆಸ್ ಉಪಾಧ್ಯಕ್ಷರು",
    roleEn: "District Congress Vice President",
    category: "district",
    categoryKn: "ಜಿಲ್ಲಾ ಮುಖಂಡರು",
    categoryEn: "District Leader",
    locationKn: "ವಿಜಯನಗರ ಜಿಲ್ಲೆ",
    phone: "9900112233",
    whatsapp: "9900112233",
    photo: "/cm_photo.png",
    bioKn: "ವಿಜಯನಗರ ಜಿಲ್ಲಾ ಕಾಂಗ್ರೆಸ್ ಹಿರಿಯ ಮುಖಂಡರು.",
    isImportant: false
  },
  {
    id: 6,
    nameKn: "ಬಿ. ವಿ. ಶಿವಯೋಗಿ",
    nameEn: "B. V. Shivayogi",
    roleKn: "ಕೊಟ್ಟೂರು ಹೋಬಳಿ ಪ್ರಮುಖ ಮುಖಂಡರು",
    roleEn: "Kottur Hobli Key Leader",
    category: "taluk",
    categoryKn: "ತಾಲೂಕು ಮುಖಂಡರು",
    categoryEn: "Taluk Leader",
    locationKn: "ಕೊಟ್ಟೂರು ಹೋಬಳಿ",
    phone: "9844223344",
    whatsapp: "9844223344",
    photo: "/cm_photo.png",
    bioKn: "ಕೊಟ್ಟೂರು ಹೋಬಳಿಯ ಪ್ರಮುಖ ಸಮಾಜ ಸೇವಕರು.",
    isImportant: false
  },
  {
    id: 7,
    nameKn: "ಎನ್. ಬಸವರಾಜ್",
    nameEn: "N. Basavaraj",
    roleKn: "ಉಜ್ಜಿನಿ ಹೋಬಳಿ ಹಿರಿಯ ಮುಖಂಡರು",
    roleEn: "Ujjini Hobli Senior Leader",
    category: "taluk",
    categoryKn: "ತಾಲೂಕು ಮುಖಂಡರು",
    categoryEn: "Taluk Leader",
    locationKn: "ಉಜ್ಜಿನಿ ಹೋಬಳಿ",
    phone: "9733445566",
    whatsapp: "9733445566",
    photo: "/cm_photo.png",
    bioKn: "ಉಜ್ಜಿನಿ ಕ್ಷೇತ್ರದ ಪ್ರಮುಖ ಕಾಂಗ್ರೆಸ್ ಹಿರಿಯರು.",
    isImportant: false
  },
  {
    id: 8,
    nameKn: "ಜಿ. ವೀರೇಶ್",
    nameEn: "G. Veeresh",
    roleKn: "ಗುಡೆಕೋಟೆ ಹೋಬಳಿ ಮುಖಂಡರು",
    roleEn: "Gudekote Hobli Leader",
    category: "party",
    categoryKn: "ಪಕ್ಷದ ಮುಖಂಡರು",
    categoryEn: "Party Leader",
    locationKn: "ಗುಡೆಕೋಟೆ ಹೋಬಳಿ",
    phone: "9611889900",
    whatsapp: "9611889900",
    photo: "/cm_photo.png",
    bioKn: "ಗುಡೆಕೋಟೆ ಗ್ರಾಮ ಪಂಚಾಯತಿ ಪ್ರಮುಖ ಮುಖಂಡರು.",
    isImportant: false
  },
  {
    id: 9,
    nameKn: "ಟಿ. ಹುಸೇನಪ್ಪ",
    nameEn: "T. Hosenappa",
    roleKn: "ಚೋರನೂರು ಹೋಬಳಿ ಪ್ರಮುಖ ನಾಯಕರು",
    roleEn: "Choranur Hobli Key Leader",
    category: "party",
    categoryKn: "ಪಕ್ಷದ ಮುಖಂಡರು",
    categoryEn: "Party Leader",
    locationKn: "ಚೋರನೂರು ಹೋಬಳಿ",
    phone: "9888776655",
    whatsapp: "9888776655",
    photo: "/cm_photo.png",
    bioKn: "ಚೋರನೂರು ಭಾಗದ ಯುವ ಸಂಘಟಕರು.",
    isImportant: false
  },
  {
    id: 10,
    nameKn: "ಕೆ.ಆರ್. ಹನುಮಂತಪ್ಪ",
    nameEn: "K.R. Hanumanthappa",
    roleKn: "ಹೊಸಹಳ್ಳಿ ಹೋಬಳಿ ಕಾಂಗ್ರೆಸ್ ಮುಖಂಡರು",
    roleEn: "Hosahalli Hobli Congress Leader",
    category: "taluk",
    categoryKn: "ತಾಲೂಕು ಮುಖಂಡರು",
    categoryEn: "Taluk Leader",
    locationKn: "ಹೊಸಹಳ್ಳಿ ಹೋಬಳಿ",
    phone: "9448112244",
    whatsapp: "9448112244",
    photo: "/cm_photo.png",
    bioKn: "ಹೊಸಹಳ್ಳಿ ಭಾಗದ ಹಿರಿಯ ಮುಖಂಡರು.",
    isImportant: false
  }
];

export default function LeadersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [lang, setLang] = useState("kn");

  const filteredLeaders = LEADERS_DATA.filter((leader) => {
    const matchesTab = activeTab === "all" || leader.category === activeTab;
    const matchesSearch =
      leader.nameKn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.roleKn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.locationKn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#0055C4] selection:text-white">
      
      {/* 1. Sticky Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#001D56] text-white border-b-4 border-[#FFD700] shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand Header */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 filter drop-shadow-md">
              <Image
                src="/karnataka_logo.png"
                alt="Government of Karnataka Seal"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div className="relative w-10 h-10 filter drop-shadow-md">
              <Image
                src="/party_logo_v2.png"
                alt="Congress Party Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-base tracking-wider uppercase text-white group-hover:text-[#FFD700] transition-colors">
                {lang === "kn" ? "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ." : "DR. SRINIVAS N. T."}
              </span>
              <span className="text-[#FFD700] text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                {lang === "kn" ? "ಶಾಸಕರ ಆಡಳಿತ ಕಚೇರಿ ಕೂಡ್ಲಿಗಿ" : "MLA Office Kudligi"}
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-full border border-white/20 transition-all"
            >
              <FaHome className="text-[#FFD700]" />
              <span>{lang === "kn" ? "ಮುಖ್ಯ ಪುಟ" : "Home Page"}</span>
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/20">
              <button
                onClick={() => setLang("kn")}
                className={`px-2.5 py-1 text-xs font-black rounded-full transition-all ${
                  lang === "kn" ? "bg-[#FFD700] text-slate-900 shadow" : "text-white/70 hover:text-white"
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 text-xs font-black rounded-full transition-all ${
                  lang === "en" ? "bg-[#FFD700] text-slate-900 shadow" : "text-white/70 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* 2. Hero Header Banner */}
      <section className="relative bg-gradient-to-r from-[#001438] via-[#002B7F] to-[#0055C4] text-white py-12 sm:py-16 overflow-hidden border-b-4 border-[#0055C4]">
        <div className="absolute inset-0 opacity-10 bg-[url('/vidhana_soudha_bg.png')] bg-cover bg-center pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center gap-3">
          <span className="bg-[#FFD700] text-slate-900 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-white">
            {lang === "kn" ? "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದ ಪ್ರಮುಖ ನಾಯಕರು" : "Key Leaders of Kudligi Constituency"}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {lang === "kn" ? "ಕೂಡ್ಲಿಗಿ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರದ ಮುಖಂಡರು" : "Kudligi Constituency Leaders"}
          </h1>

          <p className="text-slate-200 text-sm sm:text-base max-w-3xl font-medium leading-relaxed">
            {lang === "kn"
              ? "ಪಕ್ಷದ ಮುಖಂಡರು, ತಾಲೂಕು ಮುಖಂಡರು, ಜಿಲ್ಲಾ ಮುಖಂಡರು ಹಾಗೂ ಹಿರಿಯ ನಾಯಕರ ಸಂಪೂರ್ಣ ಪಟ್ಟಿ. ಅವರ ಸಂಪರ್ಕ ಸಂಖ್ಯೆಗೆ ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ."
              : "Comprehensive contacts and profiles of Party Leaders, Taluk Leaders, District Leaders & Key Organizers of Kudligi."}
          </p>

          {/* Live Search Input */}
          <div className="w-full max-w-md mt-4 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === "kn" ? "ಮುಖಂಡರ ಹೆಸರು ಅಥವಾ ಸ್ಥಳ ಹುಡುಕಿ..." : "Search leaders by name or area..."}
              className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-2xl border-2 border-[#FFD700] shadow-xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#FFD700]/40"
            />
          </div>
        </div>
      </section>

      {/* 3. Category Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white border-2 border-[#0055C4]/30 rounded-2xl p-2 sm:p-3 shadow-xl flex flex-wrap items-center justify-center gap-2">
          
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
              activeTab === "all"
                ? "bg-[#0055C4] text-white shadow-lg scale-105"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            🌟 {lang === "kn" ? "ಎಲ್ಲಾ ಮುಖಂಡರು" : "All Leaders"}
          </button>

          <button
            onClick={() => setActiveTab("party")}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
              activeTab === "party"
                ? "bg-[#0055C4] text-white shadow-lg scale-105"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            ✋ {lang === "kn" ? "ಪಕ್ಷದ ಮುಖಂಡರು" : "Party Leaders"}
          </button>

          <button
            onClick={() => setActiveTab("taluk")}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
              activeTab === "taluk"
                ? "bg-[#0055C4] text-white shadow-lg scale-105"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            🏛️ {lang === "kn" ? "ತಾಲೂಕು ಮುಖಂಡರು" : "Taluk Leaders"}
          </button>

          <button
            onClick={() => setActiveTab("district")}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
              activeTab === "district"
                ? "bg-[#0055C4] text-white shadow-lg scale-105"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            🏆 {lang === "kn" ? "ಜಿಲ್ಲಾ ಮುಖಂಡರು" : "District Leaders"}
          </button>

        </div>
      </section>

      {/* 4. Leaders Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {filteredLeaders.length === 0 ? (
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">🔍</span>
            <h3 className="text-xl font-black text-slate-800">
              {lang === "kn" ? "ಯಾವುದೇ ಮುಖಂಡರು ಕಂಡುಬಂದಿಲ್ಲ" : "No leaders found"}
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              {lang === "kn" ? "ದಯವಿಟ್ಟು ಬೇರೆ ಪದಗಳನ್ನು ಬಳಸಿ ಹುಡುಕಿ." : "Please try searching with different words."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeaders.map((leader) => (
              <div
                key={leader.id}
                className="bg-white border-4 border-[#0055C4]/30 rounded-3xl p-5 shadow-xl hover:shadow-2xl hover:border-[#0055C4] transition-all duration-300 flex flex-col justify-between gap-4 group"
              >
                
                {/* Header Info */}
                <div className="flex items-start gap-4">
                  
                  {/* Photo Avatar Frame */}
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-[#0055C4] bg-slate-100 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <Image
                      src={leader.photo}
                      alt={leader.nameKn}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="bg-[#0055C4]/10 text-[#0055C4] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full w-fit mb-1 border border-[#0055C4]/30">
                      {leader.categoryKn}
                    </span>

                    <h3 className="text-lg font-black text-[#001D56] group-hover:text-[#0055C4] transition-colors leading-tight">
                      {lang === "kn" ? leader.nameKn : leader.nameEn}
                    </h3>

                    <span className="text-xs font-bold text-slate-600 mt-1">
                      {lang === "kn" ? leader.roleKn : leader.roleEn}
                    </span>

                    <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt className="text-[#0055C4]" />
                      {leader.locationKn}
                    </span>
                  </div>

                </div>

                {/* Brief Description */}
                <p className="text-xs text-slate-600 font-medium bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 leading-relaxed">
                  {leader.bioKn}
                </p>

                {/* Action Call & WhatsApp Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <a
                    href={`tel:${leader.phone}`}
                    className="flex items-center justify-center gap-2 bg-[#0055C4] hover:bg-[#003B95] text-white font-black text-xs py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <FaPhoneAlt />
                    <span>{lang === "kn" ? "ಕರೆ ಮಾಡಿ" : "Call Now"}</span>
                  </a>

                  <a
                    href={`https://wa.me/91${leader.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <FaWhatsapp className="text-sm" />
                    <span>{lang === "kn" ? "ವಾಟ್ಸಾಪ್" : "WhatsApp"}</span>
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

      {/* Footer */}
      <footer className="bg-[#001D56] text-white py-8 border-t-4 border-[#FFD700] text-center text-xs font-bold">
        <p>© 2026 ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ. ಶಾಸಕರ ಕಚೇರಿ ಕೂಡ್ಲಿಗಿ. ಪ್ರಮುಖ ಮುಖಂಡರ ಮಾಹಿತಿ ವಿಭಾಗ.</p>
      </footer>

    </div>
  );
}
