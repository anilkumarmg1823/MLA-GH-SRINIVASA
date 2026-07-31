"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GRAM_PANCHAYATS, DRRP_PROJECTS } from "../../data/drrpData";
import {
  filterDevelopmentsByVillage,
  loadPublicDevelopments,
} from "@/lib/publicDevelopments";

// ALL 33 Official Gram Panchayats of Kudligi Constituency mapped with Coordinates (%)
const VILLAGE_PINS = [
  { id: "kudligi", gpName: "Kudligi Town", name: "ಕೂಡ್ಲಿಗಿ", fullName: "ಕೂಡ್ಲಿಗಿ (Kudligi Town)", hobli: "Kudligi", x: 48, y: 46 },
  { id: "hosahalli", gpName: "Hosahalli", name: "ಹೊಸಹಳ್ಳಿ", fullName: "ಹೊಸಹಳ್ಳಿ (Hosahalli)", hobli: "Hosahalli", x: 68, y: 58 },
  { id: "choranur", gpName: "Choranur", name: "ಚೋರನೂರು", fullName: "ಚೋರನೂರು (Choranur)", hobli: "Choranur", x: 72, y: 38 },
  { id: "ujjini", gpName: "Ujjini", name: "ಉಜ್ಜಿನಿ", fullName: "ಉಜ್ಜಿನಿ (Ujjini)", hobli: "Ujjini", x: 30, y: 75 },
  { id: "kottur", gpName: "Kottur", name: "ಕೊಟ್ಟೂರು", fullName: "ಕೊಟ್ಟೂರು (Kottur)", hobli: "Kottur", x: 22, y: 58 },
  { id: "gudekote", gpName: "Gudekote", name: "ಗುಡೆಕೋಟೆ", fullName: "ಗುಡೆಕೋಟೆ (Gudekote)", hobli: "Kudligi", x: 82, y: 48 },
  { id: "ambaliganur", gpName: "Ambaliganur", name: "ಅಂಬಲಿಗನೂರು", fullName: "ಅಂಬಲಿಗನೂರು (Ambaliganur)", hobli: "Choranur", x: 60, y: 22 },
  { id: "banavikallu", gpName: "Banavikallu", name: "ಬನವಿಕಲ್ಲು", fullName: "ಬನವಿಕಲ್ಲು (Banavikallu)", hobli: "Kudligi", x: 44, y: 38 },
  { id: "belagatta", gpName: "Belagatta", name: "ಬೆಳಗಟ್ಟ", fullName: "ಬೆಳಗಟ್ಟ (Belagatta)", hobli: "Kudligi", x: 26, y: 34 },
  { id: "channapura", gpName: "Channapura", name: "ಚನ್ನಪುರ", fullName: "ಚನ್ನಪುರ (Channapura)", hobli: "Hosahalli", x: 76, y: 52 },
  { id: "chilakanahatti", gpName: "Chilakanahatti", name: "ಚಿಲಕನಹಟ್ಟಿ", fullName: "ಚಿಲಕನಹಟ್ಟಿ (Chilakanahatti)", hobli: "Kudligi", x: 36, y: 42 },
  { id: "g_basapur", gpName: "G.Basapur", name: "ಜಿ.ಬಸಾಪೂರ", fullName: "ಜಿ.ಬಸಾಪೂರ (G.Basapur)", hobli: "Kudligi", x: 52, y: 40 },
  { id: "gowripura", gpName: "Gowripura", name: "ಗೌರಿಪುರ", fullName: "ಗೌರಿಪುರ (Gowripura)", hobli: "Choranur", x: 66, y: 26 },
  { id: "gunthagola", gpName: "Gunthagola", name: "ಗುಂತಗೋಳ", fullName: "ಗುಂತಗೋಳ (Gunthagola)", hobli: "Choranur", x: 78, y: 32 },
  { id: "halasagara", gpName: "Halasagara", name: "ಹಳಸಾಗರ", fullName: "ಹಳಸಾಗರ (Halasagara)", hobli: "Choranur", x: 62, y: 32 },
  { id: "hirekumbalgunte", gpName: "Hirekumbalgunte", name: "ಹಿರೆಕುಂಬಳಗುಂಟೆ", fullName: "ಹಿರೆಕುಂಬಳಗುಂಟೆ (Hirekumbalgunte)", hobli: "Ujjini", x: 36, y: 78 },
  { id: "huchangidurga", gpName: "Huchangidurga", name: "ಹುಚಂಗಿದುರ್ಗ", fullName: "ಹುಚಂಗಿದುರ್ಗ (Huchangidurga)", hobli: "Kottur", x: 16, y: 64 },
  { id: "hulikunte", gpName: "Hulikunte", name: "ಹುಲಿಕುಂಟೆ", fullName: "ಹುಲಿಕುಂಟೆ (Hulikunte)", hobli: "Kottur", x: 38, y: 64 },
  { id: "huralihalli", gpName: "Huralihalli", name: "ಹುರಳಿಹಳ್ಳಿ", fullName: "ಹುರಳಿಹಳ್ಳಿ (Huralihalli)", hobli: "Kudligi", x: 54, y: 34 },
  { id: "jarimale", gpName: "Jarimale", name: "ಜರಿಮಲೆ", fullName: "ಜರಿಮಲೆ (Jarimale)", hobli: "Kudligi", x: 52, y: 68 },
  { id: "kadekolla", gpName: "Kadekolla", name: "ಕಡೆಕೊಳ್ಳ", fullName: "ಕಡೆಕೊಳ್ಳ (Kadekolla)", hobli: "Hosahalli", x: 62, y: 64 },
  { id: "kalyanapura", gpName: "Kalyanapura", name: "ಕಲ್ಯಾಣಪುರ", fullName: "ಕಲ್ಯಾಣಪುರ (Kalyanapura)", hobli: "Ujjini", x: 24, y: 70 },
  { id: "kanamadugu", gpName: "Kanamadugu", name: "ಕಾನಮಡುಗು", fullName: "ಕಾನಮಡುಗು (Kanamadugu)", hobli: "Hosahalli", x: 72, y: 70 },
  { id: "kyasapur", gpName: "Kyasapur", name: "ಕ್ಯಾಸಾಪುರ", fullName: "ಕ್ಯಾಸಾಪುರ (Kyasapur)", hobli: "Kudligi", x: 42, y: 52 },
  { id: "moraba", gpName: "Moraba", name: "ಮೊರಬ", fullName: "ಮೊರಬ (Moraba)", hobli: "Hosahalli", x: 64, y: 72 },
  { id: "nd_halli", gpName: "N.D.Halli", name: "ಎನ್.ಡಿ.ಹಳ್ಳಿ", fullName: "ಎನ್.ಡಿ.ಹಳ್ಳಿ (N.D.Halli)", hobli: "Kudligi", x: 34, y: 22 },
  { id: "nimidagalla", gpName: "Nimidagalla", name: "ನಿಮಿಡಗಲ್ಲ", fullName: "ನಿಮಿಡಗಲ್ಲ (Nimidagalla)", hobli: "Ujjini", x: 26, y: 80 },
  { id: "rampura", gpName: "Rampura", name: "ರಾಮಪುರ", fullName: "ರಾಮಪುರ (Rampura)", hobli: "Kudligi", x: 30, y: 24 },
  { id: "salhunse", gpName: "Salhunse", name: "ಸಾಲಹುಣಸೆ", fullName: "ಸಾಲಹುಣಸೆ (Salhunse)", hobli: "Kottur", x: 18, y: 54 },
  { id: "shivapura", gpName: "Shivapura", name: "ಶಿವಪುರ", fullName: "ಶಿವಪುರ (Shivapura)", hobli: "Kudligi", x: 56, y: 54 },
  { id: "sooladahalli", gpName: "Sooladahalli", name: "ಸೂಲದಹಳ್ಳಿ", fullName: "ಸೂಲದಹಳ್ಳಿ (Sooladahalli)", hobli: "Ujjini", x: 42, y: 72 },
  { id: "t_rampura", gpName: "T.Rampura", name: "ಟಿ.ರಾಮಪುರ", fullName: "ಟಿ.ರಾಮಪುರ (T.Rampura)", hobli: "Kudligi", x: 32, y: 28 },
  { id: "virupapur", gpName: "Virupapur", name: "ವಿರೂಪಾಪುರ", fullName: "ವಿರೂಪಾಪುರ (Virupapur)", hobli: "Hosahalli", x: 74, y: 66 }
];

// Project thumbnail images pool
const PROJECT_PHOTOS = [
  "/gp_building_3d_v2.png",
  "/village_houses_3d_v2.png",
  "/sector_agriculture.png",
  "/sector_irrigation.png",
  "/sector_environment.png"
];

export default function VillageDevelopmentMap({
  lang = "kn",
  developments = null,
}) {
  const [selectedPin, setSelectedPin] = useState(VILLAGE_PINS[0]);
  const [selectedGpFilter, setSelectedGpFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeModalProject, setActiveModalProject] = useState(null);
  const [liveRows, setLiveRows] = useState(() =>
    Array.isArray(developments) ? developments : []
  );
  const apiEnabledRef = useRef(
    Array.isArray(developments) && developments.length > 0
  );
  const usingApi =
    apiEnabledRef.current ||
    (Array.isArray(developments) && developments.length > 0) ||
    liveRows.some((r) => r._source === "api");

  useEffect(() => {
    if (Array.isArray(developments)) {
      setLiveRows(developments);
      if (developments.length > 0) apiEnabledRef.current = true;
    }
  }, [developments]);

  useEffect(() => {
    if (!apiEnabledRef.current) return;
    let cancelled = false;
    (async () => {
      const params =
        selectedGpFilter !== "All"
          ? { gramPanchayat: selectedGpFilter }
          : {};
      const list = await loadPublicDevelopments(params);
      if (!cancelled) {
        setLiveRows(list);
        if (list.length) apiEnabledRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedGpFilter]);

  const projectSource = useMemo(() => {
    if (apiEnabledRef.current || usingApi) return liveRows;
    return DRRP_PROJECTS;
  }, [usingApi, liveRows]);

  // Combine default Gram Panchayats list with VILLAGE_PINS
  const allGramPanchayats = GRAM_PANCHAYATS.length > 0 ? GRAM_PANCHAYATS : VILLAGE_PINS.map((v) => v.gpName);

  const displayProjects = useMemo(() => {
    if (usingApi) {
      return filterDevelopmentsByVillage(projectSource, {
        gp: selectedGpFilter !== "All" ? selectedGpFilter : selectedPin?.gpName,
        village: null,
        query: searchQuery,
      });
    }
    return filterDevelopmentsByVillage(projectSource, {
      gp: selectedGpFilter !== "All" ? selectedGpFilter : selectedPin?.gpName,
      village: null,
      query: searchQuery,
    });
  }, [usingApi, projectSource, selectedGpFilter, selectedPin, searchQuery]);

  const handleVillageClick = (v) => {
    setSelectedPin(v);
    setSelectedGpFilter("All");
    setIsZoomed(true);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#001845] via-[#002B7F] to-[#0040A8] border-4 border-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl overflow-hidden flex flex-col gap-6 text-white">
      
      {/* Gram Panchayats Quick Selector Filter Bar (All 33 Gram Panchayats) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-[#FFD700] text-xs font-black shrink-0 mr-1">
          {lang === "kn" ? "೩೩ ಗ್ರಾಮ ಪಂಚಾಯತಿಗಳು:" : "33 Gram Panchayats:"}
        </span>
        <button
          onClick={() => {
            setSelectedGpFilter("All");
            setIsZoomed(false);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 border ${
            selectedGpFilter === "All"
              ? "bg-[#FFD700] text-slate-900 border-white shadow-lg font-black"
              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          }`}
        >
          {lang === "kn" ? "ಎಲ್ಲಾ ೩೩ ಪಂಚಾಯತಿಗಳು" : "All 33 Panchayats"}
        </button>

        {allGramPanchayats.map((gp) => (
          <button
            key={gp}
            onClick={() => {
              setSelectedGpFilter(gp);
              setIsZoomed(true);
              const matchedPin = VILLAGE_PINS.find((v) => v.gpName.toLowerCase() === gp.toLowerCase());
              if (matchedPin) {
                setSelectedPin(matchedPin);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              selectedGpFilter === gp || (selectedPin && selectedPin.gpName.toLowerCase() === gp.toLowerCase() && selectedGpFilter === "All")
                ? "bg-[#FFD700] text-slate-900 border-white font-black shadow-lg"
                : "bg-white/10 text-white/90 border-white/20 hover:bg-white/20"
            }`}
          >
            {gp}
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Map (Left - 7-8 Cols) + Project Details Drawer (Right - 4-5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Map Container with Direct Written Names (Larger Width 7-8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 relative w-full bg-[#001438] border-2 border-white/30 rounded-2xl p-4 shadow-2xl overflow-hidden min-h-[500px] sm:min-h-[580px] flex flex-col items-center justify-center">
          
          {/* Map Controls Header */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-[#001D56]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 text-xs text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">
              {lang === "kn"
                ? `ಆಯ್ದ ಪಂಚಾಯತಿ: ${selectedGpFilter !== "All" ? selectedGpFilter : selectedPin.fullName}`
                : `Selected: ${selectedGpFilter !== "All" ? selectedGpFilter : selectedPin.fullName}`}
            </span>
          </div>

          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="bg-[#FFD700] hover:bg-[#FFC000] text-slate-900 text-xs font-black px-3.5 py-1.5 rounded-xl border border-white shadow-md transition-all flex items-center gap-1.5"
            >
              <span>🔍</span>
              {isZoomed ? (lang === "kn" ? "ಸಾಮಾನ್ಯ ನೋಟ" : "Reset Zoom") : (lang === "kn" ? "ಝೂಮ್ ಪ್ರದರ್ಶನ" : "Zoom In")}
            </button>
          </div>

          {/* Zoomable Map Wrapper */}
          <div
            className={`relative w-full h-[460px] sm:h-[540px] transition-transform duration-700 ease-out transform ${
              isZoomed ? "scale-135" : "scale-100"
            }`}
            style={{
              transformOrigin: selectedPin ? `${selectedPin.x}% ${selectedPin.y}%` : "center center",
            }}
          >
            {/* Kudligi Constituency Map Graphic */}
            <Image
              src="/kudligi_taluk_map_v2.png"
              alt="Kudligi Constituency Interactive Map"
              fill
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-contain filter brightness-110 contrast-125 drop-shadow-xl"
              priority
            />

            {/* Interactive Direct Village Text Badges Written on Map for all 33 Gram Panchayats */}
            {VILLAGE_PINS.map((v) => {
              const isSelected = selectedPin.id === v.id || selectedGpFilter.toLowerCase() === v.gpName.toLowerCase();
              return (
                <button
                  key={v.id}
                  onClick={() => handleVillageClick(v)}
                  style={{ left: `${v.x}%`, top: `${v.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-300 ${
                    isSelected ? "scale-125 z-40" : "hover:scale-110 opacity-95"
                  }`}
                  title={v.fullName}
                >
                  <div className="relative flex flex-col items-center">
                    
                    {/* Glowing Ripple Pulse under Selected Text */}
                    {isSelected && (
                      <span className="absolute inset-0 rounded-full bg-[#FFD700]/60 animate-ping filter blur-sm" />
                    )}

                    {/* Direct Text Badge Written on Map */}
                    <div
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-black shadow-2xl border transition-all flex items-center gap-1 whitespace-nowrap ${
                        isSelected
                          ? "bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-slate-900 border-white ring-2 ring-amber-300 shadow-amber-500/40"
                          : "bg-gradient-to-r from-[#002B7F] via-[#0055C4] to-[#0077E6] text-white border-white/80 shadow-md group-hover:border-[#FFD700]"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{lang === "kn" ? v.name : v.gpName}</span>
                    </div>

                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Projects Drawer with Clean Text Header & 2-Column Grid Layout (4-5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 bg-[#001438] border-2 border-white/30 rounded-2xl p-4 sm:p-5 shadow-2xl min-h-[500px]">
          
          {/* Selected Village Info Header Card (No Photo Header) */}
          <div className="bg-white/10 border-2 border-white/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#FFD700] text-slate-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  {selectedPin.hobli} {lang === "kn" ? "ಹೋಬಳಿ" : "Hobli"}
                </span>
                <span className="text-emerald-300 text-xs font-extrabold">
                  {lang === "kn" ? "ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕಾಮಗಾರಿಗಳು" : "Panchayat Development Works"}
                </span>
              </div>
              <h4 className="text-xl font-black text-white">
                {selectedGpFilter !== "All" ? selectedGpFilter : selectedPin.fullName}
              </h4>
            </div>

            <span className="text-[#FFD700] text-sm font-black bg-white/20 border border-white/40 px-3 py-1.5 rounded-xl shrink-0">
              {displayProjects.length} {lang === "kn" ? "ಕಾಮಗಾರಿಗಳು" : "Projects"}
            </span>
          </div>

          {/* Search Input Filter */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "kn" ? "ರಸ್ತೆ ಕಾಮಗಾರಿ ಅಥವಾ ಪಂಚಾಯತಿ ಹುಡುಕಿ..." : "Search road project or Gram Panchayat..."}
              className="w-full bg-white/10 border border-white/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#FFD700]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Projects List — 2 Column Grid Layout per row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
            {displayProjects.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-white/30 bg-white/5 px-4 py-10 text-center text-sm text-white/70">
                {lang === "kn"
                  ? "ಈ ಗ್ರಾಮ ಪಂಚಾಯತಿಗೆ ಕಾಮಗಾರಿ ದಾಖಲೆಗಳಿಲ್ಲ"
                  : "No development works for this village / GP"}
              </div>
            ) : (
            <AnimatePresence mode="wait">
              {displayProjects.map((p, idx) => {
                const thumb =
                  (p.images && p.images[0]) ||
                  PROJECT_PHOTOS[idx % PROJECT_PHOTOS.length];
                return (
                <motion.div
                  key={p.id}
                  onClick={() => setActiveModalProject(p)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -3 }}
                  className="bg-white/10 border border-white/20 hover:border-[#FFD700] rounded-2xl p-3 flex flex-col justify-between gap-2.5 transition-all shadow-md cursor-pointer group overflow-hidden"
                >
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-white/20 bg-[#001D56] shrink-0">
                    <Image
                      src={thumb}
                      alt={p.name}
                      fill
                      sizes="220px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001438] via-transparent to-transparent opacity-80" />
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-[#FFD700] text-[10px] font-black px-2 py-0.5 rounded-md border border-white/20">
                      {p.code}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md self-start ${
                        String(p.status || "").includes("Completed") ||
                        String(p.status || "").includes("ಪೂರ್ಣಗೊಂಡಿದೆ")
                          ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50"
                          : "bg-amber-500/30 text-amber-200 border border-amber-400/50"
                      }`}
                    >
                      {p.status}
                    </span>

                    <p className="text-white font-bold text-xs leading-snug line-clamp-2 group-hover:text-[#FFD700] transition-colors">
                      {lang === "en" && p.nameEn ? p.nameEn : p.name}
                    </p>
                    {p.description ? (
                      <p className="text-white/60 text-[10px] line-clamp-2">
                        {p.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/80 pt-2 border-t border-white/10 mt-auto">
                    <span className="truncate max-w-[45%]">
                      {p.destGp || p.gp || "—"}
                    </span>
                    <span className="text-[#FFD700] font-black group-hover:underline flex items-center gap-1">
                      {p.budget}
                    </span>
                  </div>
                </motion.div>
              );
              })}
            </AnimatePresence>
            )}
          </div>

        </div>

      </div>

      {/* Interactive Project Details Modal Overlay */}
      <AnimatePresence>
        {activeModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-gradient-to-br from-[#002B7F] via-[#003B95] to-[#001D56] border-4 border-white rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col gap-5 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalProject(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-lg font-black transition-all border border-white/40"
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="flex flex-col gap-1.5 border-b border-white/20 pb-4 pr-8">
                <div className="flex items-center gap-2">
                  <span className="bg-[#FFD700] text-slate-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {activeModalProject.code}
                  </span>
                  <span className="bg-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full border border-white/30">
                    {activeModalProject.gp} {lang === "kn" ? "ಪಂಚಾಯತಿ" : "Panchayat"}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1">
                  {activeModalProject.name}
                </h3>
              </div>

              {activeModalProject.images?.[0] ? (
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-white/20">
                  <Image
                    src={activeModalProject.images[0]}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : null}

              {activeModalProject.description ? (
                <p className="text-sm text-white/85 leading-relaxed">
                  {activeModalProject.description}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 flex flex-col gap-0.5">
                  <span className="text-white/70 text-xs font-semibold uppercase">
                    {lang === "kn" ? "Budget" : "Sanctioned Budget"}
                  </span>
                  <span className="text-2xl font-black text-[#FFD700] drop-shadow-md">
                    {activeModalProject.budget}
                  </span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 flex flex-col gap-0.5">
                  <span className="text-white/70 text-xs font-semibold uppercase">
                    Village
                  </span>
                  <span className="text-lg font-black text-white">
                    {activeModalProject.destGp || "—"}
                  </span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 flex flex-col gap-0.5">
                  <span className="text-white/70 text-xs font-semibold uppercase">
                    Department
                  </span>
                  <span className="text-xs font-bold text-white leading-snug">
                    {activeModalProject.department ||
                      activeModalProject.type ||
                      "—"}
                  </span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 flex flex-col gap-0.5">
                  <span className="text-white/70 text-xs font-semibold uppercase">
                    Status
                  </span>
                  <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    {activeModalProject.status}
                  </span>
                </div>
              </div>

              {(activeModalProject.beneficiaries ||
                activeModalProject.startDate ||
                activeModalProject.locationNote) && (
                <div className="text-xs text-white/70 space-y-1 border-t border-white/20 pt-3">
                  {activeModalProject.beneficiaries ? (
                    <p>
                      <strong className="text-white">Beneficiaries:</strong>{" "}
                      {activeModalProject.beneficiaries}
                    </p>
                  ) : null}
                  {activeModalProject.startDate ? (
                    <p>
                      <strong className="text-white">Start:</strong>{" "}
                      {activeModalProject.startDate}
                    </p>
                  ) : null}
                  {activeModalProject.locationNote ? (
                    <p>
                      <strong className="text-white">Location:</strong>{" "}
                      {activeModalProject.locationNote}
                    </p>
                  ) : null}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
