"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaSearch,
  FaMapMarkerAlt,
  FaPlus,
  FaEdit,
  FaArchive,
} from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import LeaderFormModal from "@/components/leaders/LeaderFormModal";
import {
  getActiveLeaders,
  addLeader,
  updateLeader,
  archiveLeader,
  whatsappChatUrl,
  telHref,
} from "@/lib/leadersStore";

const CATEGORY_TABS = [
  { id: "all", emoji: "🌟", kn: "ಎಲ್ಲಾ ಮುಖಂಡರು", en: "All Leaders" },
  { id: "party", emoji: "✋", kn: "ಪಕ್ಷದ ಮುಖಂಡರು", en: "Party Leaders" },
  { id: "taluk", emoji: "🏛️", kn: "ತಾಲೂಕು ಮುಖಂಡರು", en: "Taluk Leaders" },
  { id: "district", emoji: "🏆", kn: "ಜಿಲ್ಲಾ ಮುಖಂಡರು", en: "District Leaders" },
];

function filterLeaders(rows, activeTab, searchTerm) {
  const q = searchTerm.toLowerCase().trim();
  return rows.filter((leader) => {
    const matchesTab = activeTab === "all" || leader.category === activeTab;
    if (!matchesTab) return false;
    if (!q) return true;
    return (
      leader.nameKn?.toLowerCase().includes(q) ||
      leader.nameEn?.toLowerCase().includes(q) ||
      leader.roleKn?.toLowerCase().includes(q) ||
      leader.roleEn?.toLowerCase().includes(q) ||
      leader.locationKn?.toLowerCase().includes(q)
    );
  });
}

export default function LeadersDirectory() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const refresh = () => setRows(getActiveLeaders());

  useEffect(() => {
    refresh();
  }, []);

  const filteredLeaders = filterLeaders(rows, activeTab, searchTerm);

  const handleSave = (payload) => {
    if (payload.id) updateLeader(payload.id, payload);
    else addLeader(payload);
    setFormOpen(false);
    setEditing(null);
    refresh();
  };

  const handleArchive = (leader) => {
    const ok = window.confirm(
      t.archiveConfirm ||
        "Archive this leader? They will be hidden, not permanently deleted."
    );
    if (!ok) return;
    archiveLeader(leader.id);
    refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--dash-heading)]">
            {lang === "kn" ? "ಮುಖಂಡರು" : "Leaders"}
          </h1>
          <p className="text-sm text-[var(--dash-text-50)] font-medium mt-0.5">
            {lang === "kn"
              ? "ಸೇರಿಸಿ, ಸಂಪಾದಿಸಿ ಅಥವಾ ಆರ್ಕೈವ್ ಮಾಡಿ"
              : "Add, edit, or archive leaders"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-40)] text-base" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                lang === "kn"
                  ? "ಮುಖಂಡರ ಹೆಸರು ಅಥವಾ ಸ್ಥಳ ಹುಡುಕಿ..."
                  : "Search leaders by name or area..."
              }
              className="w-full pl-11 pr-4 py-3 bg-[var(--dash-panel)] text-[var(--dash-heading)] rounded-2xl border border-[#CCBCA5]/30 shadow-sm text-sm font-bold placeholder:text-[var(--dash-text-40)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)]/40"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--dash-accent)] text-white text-sm font-black shadow-sm hover:opacity-90 whitespace-nowrap"
          >
            <FaPlus />
            {t.addLeader || (lang === "kn" ? "ಸೇರಿಸಿ" : "Add leader")}
          </button>
        </div>
      </div>

      <div className="bg-[var(--dash-panel)] border border-[#CCBCA5]/25 rounded-2xl p-2 sm:p-3 shadow-sm flex flex-wrap items-center justify-center gap-2">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
              activeTab === tab.id
                ? "bg-[var(--dash-accent)] text-white shadow-md"
                : "bg-[var(--dash-panel-soft)] text-[var(--dash-text-70)] hover:bg-[#CCBCA5]/20 hover:text-[var(--dash-heading)]"
            }`}
          >
            {tab.emoji} {lang === "kn" ? tab.kn : tab.en}
          </button>
        ))}
      </div>

      {filteredLeaders.length === 0 ? (
        <div className="bg-[var(--dash-panel)] border border-[#CCBCA5]/20 rounded-2xl p-12 text-center">
          <h3 className="text-lg font-black text-[var(--dash-heading)]">
            {lang === "kn" ? "ಯಾವುದೇ ಮುಖಂಡರು ಕಂಡುಬಂದಿಲ್ಲ" : "No leaders found"}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredLeaders.map((leader) => {
            const wa = whatsappChatUrl(leader.whatsapp || leader.phone);
            const call = telHref(leader.phone);
            return (
              <div
                key={leader.id}
                className="bg-[var(--dash-panel)] border border-[#CCBCA5]/25 rounded-2xl p-5 shadow-sm hover:border-[var(--dash-accent)]/50 transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[var(--dash-accent)]/40 bg-[var(--dash-panel-soft)] shrink-0">
                    <Image
                      src={leader.photo || "/cm_photo.png"}
                      alt={leader.nameEn || leader.nameKn || "Leader"}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="bg-[var(--dash-accent)]/10 text-[var(--dash-accent)] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full w-fit mb-1 border border-[var(--dash-accent)]/25">
                      {lang === "kn" ? leader.categoryKn : leader.categoryEn}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[var(--dash-heading)] leading-tight">
                      {lang === "kn"
                        ? leader.nameKn || leader.nameEn
                        : leader.nameEn || leader.nameKn}
                    </h3>
                    <span className="text-xs font-bold text-[var(--dash-text-70)] mt-1">
                      {lang === "kn"
                        ? leader.roleKn || leader.roleEn
                        : leader.roleEn || leader.roleKn}
                    </span>
                    {leader.locationKn ? (
                      <span className="text-[11px] text-[var(--dash-text-50)] font-semibold flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt className="text-[var(--dash-accent)] shrink-0" />
                        {leader.locationKn}
                      </span>
                    ) : null}
                  </div>
                </div>

                {leader.bioKn ? (
                  <p className="text-xs text-[var(--dash-text-70)] font-medium bg-[var(--dash-panel-soft)] border border-[#CCBCA5]/15 rounded-xl p-3 leading-relaxed">
                    {leader.bioKn}
                  </p>
                ) : null}

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#CCBCA5]/15">
                  {call ? (
                    <a
                      href={call}
                      className="flex items-center justify-center gap-2 bg-[var(--dash-accent)] hover:opacity-90 text-white font-black text-xs py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      <FaPhoneAlt />
                      <span>{lang === "kn" ? "ಕರೆ ಮಾಡಿ" : "Call Now"}</span>
                    </a>
                  ) : (
                    <span className="flex items-center justify-center text-xs font-bold text-[var(--dash-text-40)] py-2.5">
                      —
                    </span>
                  )}
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      <FaWhatsapp className="text-sm" />
                      <span>{lang === "kn" ? "ವಾಟ್ಸಾಪ್" : "WhatsApp"}</span>
                    </a>
                  ) : (
                    <span className="flex items-center justify-center text-xs font-bold text-[var(--dash-text-40)] py-2.5">
                      —
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(leader);
                      setFormOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 py-2 rounded-xl border border-[#CCBCA5]/30 text-[var(--dash-heading)] text-xs font-black hover:bg-[var(--dash-panel-soft)]"
                  >
                    <FaEdit />
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleArchive(leader)}
                    className="inline-flex items-center justify-center gap-2 py-2 rounded-xl border border-rose-400/40 text-rose-500 text-xs font-black hover:bg-rose-500/10"
                  >
                    <FaArchive />
                    {t.archive}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LeaderFormModal
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
      />
    </div>
  );
}
