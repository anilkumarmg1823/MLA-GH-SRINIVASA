"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MAP_VILLAGE_PINS,
  buildMapVillagePins,
} from "@/data/mapGramPanchayats";
import { getVillagesForGp } from "@/data/gramPanchayats";
import { ensureLocationsTree } from "@/lib/locations";
import { seedDevelopments } from "@/data/developments";
import {
  filterDevelopmentsByVillage,
  loadPublicDevelopments,
  mapDevToProject,
} from "@/lib/publicDevelopments";
import { useEscapeKey } from "@/hooks/useEscapeKey";

/** Official GPs for map — PIN_XY fallback until /locations/tree hydrates */
const INITIAL_PINS =
  MAP_VILLAGE_PINS.length > 0
    ? MAP_VILLAGE_PINS
    : buildMapVillagePins([]);
const SEED_PROJECTS = seedDevelopments.map(mapDevToProject);
const DEFAULT_PIN =
  INITIAL_PINS.find((v) => v.gpName === "Kudligi Town") || INITIAL_PINS[0] || null;

// Project thumbnail images pool
const PROJECT_PHOTOS = [
  "/gp_building_3d_v2.png",
  "/village_houses_3d_v2.png",
  "/sector_agriculture.png",
  "/sector_irrigation.png",
  "/sector_environment.png"
];

const ITEMS_PER_PAGE = 3;

function formatStatus(statusStr, lang) {
  const s = String(statusStr || "");
  const isCompleted = s.toLowerCase().includes("completed") || s.includes("ಪೂರ್ಣ");
  const isProposed = s.toLowerCase().includes("proposed") || s.includes("ಪ್ರಸ್ತಾವಿತ");
  
  if (lang === "kn") {
    if (isCompleted) return "ಪೂರ್ಣಗೊಂಡಿದೆ";
    if (isProposed) return "ಪ್ರಸ್ತಾವಿತ";
    return "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ";
  } else {
    if (isCompleted) return "Completed";
    if (isProposed) return "Proposed";
    return "In Progress";
  }
}

export default function VillageDevelopmentMap({
  lang = "kn",
  developments = null,
}) {
  const [villagePins, setVillagePins] = useState(INITIAL_PINS);
  const [selectedPin, setSelectedPin] = useState(DEFAULT_PIN);
  const [selectedGpFilter, setSelectedGpFilter] = useState("All");
  const [selectedVillage, setSelectedVillage] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // "All" | "Completed" | "InProgress"
  const [searchQuery, setSearchQuery] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullGalleryOpen, setIsFullGalleryOpen] = useState(false);
  const [activeModalProject, setActiveModalProject] = useState(null);
  
  const [allRows, setAllRows] = useState(() =>
    Array.isArray(developments) && developments.length > 0
      ? developments
      : SEED_PROJECTS
  );
  const [worksReady, setWorksReady] = useState(
    Array.isArray(developments) && developments.length > 0
  );

  const closeModal = useCallback(() => {
    setActiveModalProject(null);
    setIsFullGalleryOpen(false);
  }, []);
  useEscapeKey(Boolean(activeModalProject || isFullGalleryOpen), closeModal);

  const activeGp =
    selectedGpFilter !== "All" ? selectedGpFilter : selectedPin?.gpName;

  // Hydrate GP labels from DB locations tree
  useEffect(() => {
    let cancelled = false;
    ensureLocationsTree()
      .then((tree) => {
        if (cancelled) return;
        const next = buildMapVillagePins(tree);
        if (!next.length) return;
        setVillagePins(next);
        setSelectedPin((prev) => {
          if (prev?.gpName) {
            const match = next.find((p) => p.gpName === prev.gpName);
            if (match) return match;
          }
          return (
            next.find((v) => v.gpName === "Kudligi Town") || next[0] || null
          );
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(developments) && developments.length > 0) {
      setAllRows(developments);
      setWorksReady(true);
    }
  }, [developments]);

  // Load full works once — GP/village filters stay client-side
  useEffect(() => {
    if (Array.isArray(developments) && developments.length > 0) return;
    let cancelled = false;
    (async () => {
      const list = await loadPublicDevelopments({});
      if (cancelled || !list.length) return;
      setAllRows(list);
      setWorksReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [developments]);

  // Reset village filter & page whenever GP changes
  useEffect(() => {
    setSelectedVillage("All");
    setCurrentPage(1);
  }, [activeGp]);

  // Reset page when village or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedVillage, searchQuery, statusFilter]);

  const projectSource = allRows.length ? allRows : SEED_PROJECTS;

  const gpProjects = useMemo(() => {
    return filterDevelopmentsByVillage(projectSource, {
      gp: activeGp,
      village: null,
      query: "",
    });
  }, [projectSource, activeGp]);

  /** Villages with real works under this GP */
  const villageOptions = useMemo(() => {
    const counts = new Map();
    for (const p of gpProjects) {
      const key = String(p.destGp || "").trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const master = getVillagesForGp(activeGp) || [];
    const knByName = new Map(
      master.map((v) => [String(v.name).toLowerCase(), v.nameKn || v.name])
    );
    return [...counts.entries()]
      .map(([name, count]) => ({
        name,
        nameKn: knByName.get(name.toLowerCase()) || name,
        count,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [gpProjects, activeGp]);

  const displayProjects = useMemo(() => {
    let list = filterDevelopmentsByVillage(projectSource, {
      gp: activeGp,
      village: selectedVillage !== "All" ? selectedVillage : null,
      query: searchQuery,
    });

    if (statusFilter !== "All") {
      list = list.filter((p) => {
        const st = String(p.status || "").toLowerCase();
        if (statusFilter === "Completed") return st.includes("completed") || st.includes("ಪೂರ್ಣ");
        if (statusFilter === "InProgress") return st.includes("progress") || st.includes("ಪ್ರಗತಿ");
        return true;
      });
    }

    return list;
  }, [projectSource, activeGp, selectedVillage, searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(displayProjects.length / ITEMS_PER_PAGE) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [displayProjects, currentPage]);

  /** When zoomed into a GP, fan village pins around that GP on the map */
  const mapVillagePins = useMemo(() => {
    if (!isZoomed || !selectedPin) return [];
    if (!villageOptions.length) return [];
    const cx = selectedPin.x;
    const cy = selectedPin.y;
    const n = villageOptions.length;
    const radius = Math.min(11, 5.5 + n * 0.35);
    return villageOptions.map((v, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const r = radius + (i % 2) * 2.2;
      return {
        ...v,
        x: Math.min(93, Math.max(7, cx + Math.cos(angle) * r)),
        y: Math.min(92, Math.max(8, cy + Math.sin(angle) * r)),
      };
    });
  }, [isZoomed, selectedPin, villageOptions]);

  const selectGp = (pin) => {
    startTransition(() => {
      setSelectedPin(pin);
      setSelectedGpFilter(pin.gpName);
      setSelectedVillage("All");
      setIsZoomed(true);
    });
  };

  const handleGpPinClick = (v) => {
    selectGp(v);
  };

  const pickVillage = (villageName) => {
    startTransition(() => {
      setSelectedVillage(villageName);
      setIsZoomed(true);
    });
  };

  const handleMapVillageClick = (villageName) => {
    pickVillage(villageName);
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl border-4 border-white/40 rounded-3xl p-4 sm:p-5 lg:p-7 shadow-2xl overflow-hidden flex flex-col gap-5 text-white">
      
      {/* Gram Panchayats Quick Selector Filter Bar (All 33 Gram Panchayats) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <span className="text-[#FFD700] text-xs font-black shrink-0 mr-1">
          {lang === "kn" ? "೩೩ ಗ್ರಾಮ ಪಂಚಾಯತಿಗಳು:" : "33 Gram Panchayats:"}
        </span>
        <button
          type="button"
          onClick={() => {
            setSelectedGpFilter("All");
            setSelectedVillage("All");
            setIsZoomed(false);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 border cursor-pointer ${
            selectedGpFilter === "All"
              ? "bg-[#FFD700] text-slate-900 border-white shadow-lg font-black"
              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          }`}
        >
          {lang === "kn" ? "ಎಲ್ಲಾ ೩೩ ಪಂಚಾಯತಿಗಳು" : "All 33 Panchayats"}
        </button>

        {villagePins.map((pin) => (
          <button
            type="button"
            key={pin.id}
            onClick={() => selectGp(pin)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
              activeGp === pin.gpName
                ? "bg-[#FFD700] text-slate-900 border-white font-black shadow-lg"
                : "bg-white/10 text-white/90 border-white/20 hover:bg-white/20"
            }`}
          >
            {lang === "kn" ? pin.name : pin.gpName}
          </button>
        ))}
      </div>

      {/* Main Grid: map (desktop) + side list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Mobile: no pin map — chips carousel + selected summary */}
        <div className="lg:hidden w-full bg-slate-950/50 border-2 border-white/30 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD700]">
                {lang === "kn" ? "ಆಯ್ದ ಪಂಚಾಯತಿ" : "Selected Panchayat"}
              </p>
              <h3 className="text-lg font-black text-white truncate">
                {selectedPin?.fullName}
              </h3>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#FFD700] text-slate-900 text-[10px] font-black">
              {worksReady
                ? lang === "kn"
                  ? `${displayProjects.length} ಕಾಮಗಾರಿ`
                  : `${displayProjects.length} works`
                : "…"}
            </span>
          </div>
          <p className="text-[11px] text-white/75 font-semibold leading-relaxed">
            {lang === "kn"
              ? "ಕೆಳಗಿನ ಕಾರ್ಡ್‌ಗಳನ್ನು ಸ್ವೈಪ್ ಮಾಡಿ ಪಂಚಾಯತಿ ಆಯ್ಕೆ ಮಾಡಿ. ವಿವರಗಳು ಕೆಳಗಿನ ಪಟ್ಟಿಯಲ್ಲಿವೆ."
              : "Swipe cards below to pick a panchayat. Details are in the list below."}
          </p>
          <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none -mx-1 px-1">
            {villagePins.map((pin) => {
              const active = activeGp === pin.gpName;
              return (
                <button
                  key={`mcard-${pin.id}`}
                  type="button"
                  onClick={() => selectGp(pin)}
                  className={`snap-center shrink-0 w-[72%] max-w-[240px] rounded-2xl border-2 px-3.5 py-3.5 text-left transition-all ${
                    active
                      ? "bg-[#FFD700] text-slate-900 border-white shadow-lg"
                      : "bg-white/10 text-white border-white/25"
                  }`}
                >
                  <p className="text-sm font-black truncate">
                    {lang === "kn" ? pin.name : pin.gpName}
                  </p>
                  <p
                    className={`text-[10px] font-bold mt-1 ${
                      active ? "text-slate-700" : "text-white/70"
                    }`}
                  >
                    {lang === "kn" ? "ಆಯ್ಕೆ ಮಾಡಿ →" : "Select →"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop map only */}
        <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 relative w-full bg-slate-950/40 backdrop-blur-md border-2 border-white/30 rounded-2xl p-4 shadow-2xl overflow-hidden min-h-[520px] h-[590px] flex-col items-center justify-center">
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-[#001D56]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 text-xs text-white shadow-lg min-w-0 max-w-[60%]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold truncate">
              {lang === "kn"
                ? `ಆಯ್ದ ಪಂಚಾಯತಿ: ${selectedPin?.fullName}`
                : `Selected: ${selectedPin?.fullName}`}
            </span>
          </div>

          <div className="absolute top-4 right-4 z-30">
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="bg-[#FFD700] hover:bg-[#FFC000] text-slate-900 text-xs font-black px-3.5 py-1.5 rounded-xl border border-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔍</span>
              {isZoomed
                ? lang === "kn"
                  ? "ಸಾಮಾನ್ಯ ನೋಟ"
                  : "Reset Zoom"
                : lang === "kn"
                  ? "ಝೂಮ್ ಪ್ರದರ್ಶನ"
                  : "Zoom In"}
            </button>
          </div>

          <div
            className={`relative w-full h-[510px] transition-transform duration-700 ease-out transform ${
              isZoomed ? "scale-135" : "scale-100"
            }`}
            style={{
              transformOrigin: selectedPin
                ? `${selectedPin.x}% ${selectedPin.y}%`
                : "center center",
            }}
          >
            <Image
              src="/kudligi_taluk_map_v2.png"
              alt="Kudligi Constituency Interactive Map"
              fill
              sizes="65vw"
              className="object-contain filter brightness-110 contrast-125 drop-shadow-xl"
              priority
            />

            {villagePins.map((v) => {
              const isSelected =
                selectedPin?.id === v.id ||
                activeGp?.toLowerCase() === v.gpName.toLowerCase();
              const dimmed = isZoomed && !isSelected;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleGpPinClick(v)}
                  style={{ left: `${v.x}%`, top: `${v.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-300 ${
                    isSelected
                      ? "scale-125 z-40"
                      : dimmed
                        ? "scale-75 opacity-25 hover:opacity-60"
                        : "hover:scale-110 opacity-95"
                  }`}
                  title={v.fullName}
                >
                  <div className="relative flex flex-col items-center">
                    {isSelected && (
                      <span className="absolute inset-0 rounded-full bg-[#FFD700]/60 animate-ping filter blur-sm" />
                    )}
                    <div
                      className={`flex px-2.5 py-0.5 rounded-lg text-xs font-black shadow-2xl border transition-all items-center gap-1 whitespace-nowrap ${
                        isSelected
                          ? "bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-slate-900 border-white ring-2 ring-amber-300"
                          : "bg-gradient-to-r from-[#002B7F] via-[#0055C4] to-[#0077E6] text-white border-white/80"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{lang === "kn" ? v.name : v.gpName}</span>
                    </div>
                  </div>
                </button>
              );
            })}

            <AnimatePresence>
              {isZoomed &&
                mapVillagePins.map((v) => {
                  const isActive = selectedVillage === v.name;
                  return (
                    <motion.button
                      key={`vil-${v.name}`}
                      type="button"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: isActive ? 1.15 : 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMapVillageClick(v.name);
                      }}
                      style={{ left: `${v.x}%`, top: `${v.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-50 group ${
                        isActive ? "z-[60]" : ""
                      }`}
                      title={`${v.name} (${v.count})`}
                    >
                      <div className="relative flex flex-col items-center gap-0.5">
                        {isActive ? (
                          <span className="absolute -inset-1 rounded-full bg-emerald-400/50 animate-ping" />
                        ) : null}
                        <span
                          className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow ${
                            isActive ? "bg-[#FFD700]" : "bg-emerald-400"
                          }`}
                        />
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-black whitespace-nowrap border shadow-lg max-w-[7.5rem] truncate ${
                            isActive
                              ? "bg-[#FFD700] text-slate-900 border-white"
                              : "bg-[#001D56]/95 text-white border-emerald-400/70"
                          }`}
                        >
                          {lang === "kn" ? v.nameKn || v.name : v.name}
                          <span className="opacity-80"> · {v.count}</span>
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Clean Side Panel (Height Aligned with Map) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-start gap-3 bg-slate-950/40 backdrop-blur-md border-2 border-white/30 rounded-2xl p-4 sm:p-4.5 shadow-2xl h-auto lg:h-[590px] overflow-y-auto no-scrollbar scrollbar-none">
          
          {/* Selected GP Header & Full Gallery Action */}
          <div className="bg-white/10 border-2 border-white/30 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2 shadow-xl backdrop-blur-md shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="bg-[#FFD700] text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-0.5">
                {lang === "kn" ? "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರ" : "Kudligi Constituency"}
              </span>
              <h4 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                {selectedPin?.fullName}
              </h4>
              {selectedVillage !== "All" && (
                <p className="text-[11px] text-[#FFD700] font-bold truncate">
                  {lang === "kn" ? "ಆಯ್ದ ಗ್ರಾಮ:" : "Village:"} {selectedVillage}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsFullGalleryOpen(true)}
              className="bg-[#FFD700] hover:bg-[#FFC000] text-slate-950 font-black text-xs py-2 px-3 rounded-xl border border-white shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              title="View All in Grid"
            >
              <span>🖼️</span>
              <span className="hidden sm:inline">
                {lang === "kn" ? `ಎಲ್ಲಾ (${displayProjects.length})` : `All (${displayProjects.length})`}
              </span>
            </button>
          </div>

          {/* Village picker — one horizontal row */}
          <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-b from-emerald-500/10 via-white/[0.04] to-transparent p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-[11px] font-black tracking-wide text-emerald-300">
                {lang === "kn" ? "ಗ್ರಾಮ ಆಯ್ಕೆ ಮಾಡಿ" : "Choose a village"}
              </p>
              <span className="text-[10px] text-white/50 font-bold">
                {villageOptions.length} {lang === "kn" ? "ಗ್ರಾಮಗಳು" : "villages"}
              </span>
            </div>

            <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1 no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => pickVillage("All")}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black border transition-colors cursor-pointer whitespace-nowrap ${
                  selectedVillage === "All"
                    ? "bg-[#FFD700] text-slate-900 border-white shadow-md"
                    : "bg-[#001D56]/80 text-white border-white/20 hover:border-emerald-300/60"
                }`}
              >
                {lang === "kn" ? "ಎಲ್ಲಾ ಗ್ರಾಮಗಳು" : "All villages"}
                <span className="ml-1.5 opacity-80">({gpProjects.length})</span>
              </button>

              {villageOptions.map((v) => {
                const active = selectedVillage === v.name;
                return (
                  <button
                    type="button"
                    key={v.name}
                    onClick={() => pickVillage(v.name)}
                    title={`${v.name} · ${v.count}`}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? "bg-[#FFD700] text-slate-900 border-white shadow-md"
                        : "bg-[#001D56]/70 text-white border-white/15 hover:border-[#FFD700]/70"
                    }`}
                  >
                    {lang === "kn" ? v.nameKn || v.name : v.name}
                    <span
                      className={`ml-1.5 text-[10px] font-bold ${
                        active ? "text-slate-800" : "text-emerald-300"
                      }`}
                    >
                      ({v.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search + Status Filter Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "kn" ? "ಕಾಮಗಾರಿ ಹುಡುಕಿ..." : "Search work..."}
                className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#FFD700]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Status Filter */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/20 shrink-0">
              {["All", "Completed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {st === "All" ? (lang === "kn" ? "ಎಲ್ಲಾ" : "All") : (lang === "kn" ? "ಪೂರ್ಣ" : "Completed")}
                </button>
              ))}
            </div>
          </div>

          {/* PAGINATED CLEAN PROJECTS LIST (No Cramped Long Scrollbar!) */}
          <div className="flex flex-col gap-2.5">
            {displayProjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 px-4 py-8 text-center text-xs text-white/70">
                {lang === "kn"
                  ? "ಯಾವುದೇ ಕಾಮಗಾರಿಗಳು ಲಭ್ಯವಿಲ್ಲ"
                  : "No development works found"}
              </div>
            ) : (
              paginatedProjects.map((p, idx) => {
                const thumb =
                  (p.images && p.images[0]) ||
                  PROJECT_PHOTOS[idx % PROJECT_PHOTOS.length];
                return (
                  <motion.div
                    key={p.id}
                    onClick={() => setActiveModalProject(p)}
                    whileHover={{ scale: 1.01, x: 3 }}
                    className="bg-white/10 border border-white/20 hover:border-[#FFD700] rounded-2xl p-3 flex items-center gap-3 transition-all shadow-md cursor-pointer group"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 bg-[#001D56] shrink-0">
                      <Image
                        src={thumb}
                        alt={p.name}
                        fill
                        sizes="64px"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded truncate ${
                            String(p.status || "").includes("Completed") ||
                            String(p.status || "").includes("ಪೂರ್ಣ")
                              ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/30"
                              : "bg-amber-500/30 text-amber-200 border border-amber-400/30"
                          }`}
                        >
                          {formatStatus(p.status, lang)}
                        </span>
                      </div>

                      <h5 className="text-white font-bold text-xs leading-snug truncate group-hover:text-[#FFD700] transition-colors">
                        {lang === "en" && p.nameEn ? p.nameEn : p.name}
                      </h5>

                      <div className="flex items-center justify-between text-[10px] text-white/70">
                        <span className="truncate max-w-[60%] text-emerald-300 font-medium">
                          📍 {p.destGp || p.gp}
                        </span>
                        <span className="text-[#FFD700] font-black">
                          {p.budget}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs font-black text-white mt-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  ◀ {lang === "kn" ? "ಹಿಂದಿನ" : "Prev"}
                </button>

                <span className="text-white/80">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {lang === "kn" ? "ಮುಂದಿನ" : "Next"} ▶
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* FULL GALLERY GRID MODAL (User-Friendly Grid for High-Volume Works) */}
      <AnimatePresence>
        {isFullGalleryOpen && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-950/30 backdrop-blur-sm overscroll-none"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden bg-gradient-to-br from-[#001D56] via-[#002B7F] to-[#001438] border-4 border-white rounded-3xl p-6 shadow-2xl text-white flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/20 pb-4 pr-10">
                <div>
                  <span className="bg-[#FFD700] text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedPin?.fullName}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {selectedVillage !== "All"
                      ? `${selectedVillage} ${lang === "kn" ? "ಗ್ರಾಮದ ಕಾಮಗಾರಿಗಳು" : "Village Works"}`
                      : `${lang === "kn" ? "ಪಂಚಾಯತಿ ಅಭಿವೃದ್ಧಿ ಕಾಮಗಾರಿಗಳು" : "Panchayat Development Works"}`}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-lg font-black transition-all border border-white/40 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Full Grid Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin">
                {displayProjects.map((p, idx) => {
                  const thumb =
                    (p.images && p.images[0]) ||
                    PROJECT_PHOTOS[idx % PROJECT_PHOTOS.length];
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveModalProject(p)}
                      className="bg-white/10 border border-white/20 hover:border-[#FFD700] rounded-2xl p-3 flex flex-col justify-between gap-3 shadow-lg cursor-pointer group transition-all"
                    >
                      <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/20 bg-[#001D56]">
                        <Image
                          src={thumb}
                          alt={p.name}
                          fill
                          sizes="300px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-emerald-300">
                          📍 {p.destGp || p.gp}
                        </span>
                        <h4 className="text-white font-bold text-xs leading-snug line-clamp-2 group-hover:text-[#FFD700]">
                          {lang === "en" && p.nameEn ? p.nameEn : p.name}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 mt-auto">
                        <span className="text-white/70 text-[10px]">{formatStatus(p.status, lang)}</span>
                        <span className="text-[#FFD700] font-black">{p.budget}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE PROJECT DETAIL MODAL */}
      <AnimatePresence>
        {activeModalProject && (
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-sm overscroll-none"
            onClick={() => setActiveModalProject(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain bg-gradient-to-br from-[#002B7F] via-[#003B95] to-[#001D56] border-4 border-white rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col gap-5"
            >
              <button
                type="button"
                onClick={() => setActiveModalProject(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-lg font-black transition-all border border-white/40 z-10 cursor-pointer"
              >
                ✕
              </button>

              <div className="flex flex-col gap-1.5 border-b border-white/20 pb-4 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full border border-white/30">
                    {activeModalProject.destGp || activeModalProject.gp}{" "}
                    {lang === "kn" ? "ಪಂಚಾಯತಿ / ಗ್ರಾಮ" : "Panchayat / Village"}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1">
                  {activeModalProject.name}
                </h3>
              </div>

              {activeModalProject.images?.[0] ? (
                <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/20 bg-slate-900">
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
                    {lang === "kn" ? "ಅನುದಾನ" : "Sanctioned Budget"}
                  </span>
                  <span className="text-2xl font-black text-[#FFD700] drop-shadow-md">
                    {activeModalProject.budget}
                  </span>
                </div>

                <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 flex flex-col gap-0.5">
                  <span className="text-white/70 text-xs font-semibold uppercase">
                    {lang === "kn" ? "ಗ್ರಾಮ" : "Village"}
                  </span>
                  <span className="text-lg font-black text-white">
                    {activeModalProject.destGp || "—"}
                  </span>
                </div>

                <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 flex flex-col gap-0.5">
                  <span className="text-white/70 text-xs font-semibold uppercase">
                    {lang === "kn" ? "ಇಲಾಖೆ" : "Department"}
                  </span>
                  <span className="text-xs font-bold text-white leading-snug">
                    {activeModalProject.department ||
                      activeModalProject.type ||
                      "—"}
                  </span>
                </div>

                <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 flex flex-col gap-0.5">
                  <span className="text-white/70 text-xs font-semibold uppercase">
                    {lang === "kn" ? "ಸ್ಥಿತಿ" : "Status"}
                  </span>
                  <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    {formatStatus(activeModalProject.status, lang)}
                  </span>
                </div>
              </div>

              {(activeModalProject.beneficiaries ||
                activeModalProject.startDate ||
                activeModalProject.locationNote) && (
                <div className="text-xs text-white/70 space-y-1 border-t border-white/20 pt-3">
                  {activeModalProject.beneficiaries ? (
                    <p>
                      <strong className="text-white">Beneficiaries:</strong> 
                      {activeModalProject.beneficiaries}
                    </p>
                  ) : null}
                  {activeModalProject.startDate ? (
                    <p>
                      <strong className="text-white">Start:</strong> 
                      {activeModalProject.startDate}
                    </p>
                  ) : null}
                  {activeModalProject.locationNote ? (
                    <p>
                      <strong className="text-white">Location:</strong> 
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
