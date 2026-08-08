"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt,
  FaHardHat,
  FaFolderOpen,
  FaHandsHelping,
  FaBalanceScale,
  FaUserShield,
  FaGlobe,
  FaCommentDots,
  FaUserTie,
  FaCalendarAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

const links = [
  {
    href: "/dashboard",
    icon: FaTachometerAlt,
    labelKey: "dashboard",
    match: (p) => p === "/dashboard",
  },
  {
    href: "/dashboard/development",
    icon: FaHardHat,
    labelKey: "development",
    match: (p) => p?.startsWith("/dashboard/development"),
  },
  {
    href: "/dashboard/department-records",
    icon: FaFolderOpen,
    labelKey: "departmentRecords",
    match: (p) => p?.startsWith("/dashboard/department-records"),
  },
  {
    href: "/dashboard/demands",
    icon: FaHandsHelping,
    labelKey: "navDemands",
    match: (p) => p?.startsWith("/dashboard/demands"),
  },
  {
    href: "/dashboard/complaints",
    icon: FaCommentDots,
    labelKey: "navComplaints",
    match: (p) => p?.startsWith("/dashboard/complaints"),
  },
  {
    href: "/dashboard/medical-referrals",
    icon: FaUserShield,
    labelKey: "medicalReferrals",
    labelFallback: "Medical Referrals",
    match: (p) => p?.startsWith("/dashboard/medical-referrals"),
  },
  {
    href: "/dashboard/assembly-qa",
    icon: FaBalanceScale,
    labelKey: "navAssembly",
    match: (p) => p?.startsWith("/dashboard/assembly-qa"),
  },
  {
    href: "/dashboard/landing",
    icon: FaGlobe,
    labelKey: "landingPage",
    match: (p) => p?.startsWith("/dashboard/landing"),
  },
  {
    href: "/dashboard/leaders",
    icon: FaUserTie,
    labelKey: "navLeaders",
    match: (p) => p?.startsWith("/dashboard/leaders"),
  },
  {
    href: "/dashboard/tour-schedules",
    icon: FaCalendarAlt,
    labelKey: "navTourSchedules",
    match: (p) => p?.startsWith("/dashboard/tour-schedules"),
  },
  {
    href: "/dashboard/access",
    icon: FaUserShield,
    labelKey: "manageAccess",
    match: (p) => p?.startsWith("/dashboard/access"),
  },
];

export default function AdminSidebar({
  desktopOpen = true,
  mobileOpen = false,
  onToggleDesktop,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const collapsed = !desktopOpen;

  const renderLinks = (isCollapsed, onNavigate) => (
    <nav
      className={`flex-1 overflow-y-auto space-y-1 ${
        isCollapsed ? "p-2" : "p-3"
      }`}
    >
      {links.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={t[item.labelKey]}
            onClick={onNavigate}
            className={`flex items-center rounded-xl text-sm font-bold transition-colors ${
              isCollapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-3 py-2.5"
            } ${
              active
                ? "bg-[var(--dash-accent)] text-white shadow-sm"
                : "text-[var(--dash-text-70)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-heading)]"
            }`}
          >
            <Icon className="text-sm shrink-0" />
            {!isCollapsed ? (
              <span className="leading-tight">{t[item.labelKey] || item.labelFallback}</span>
            ) : null}
          </Link>
        );
      })}

    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex shrink-0 flex-col border-r border-[#CCBCA5]/20 bg-[var(--dash-panel-soft)] backdrop-blur-sm transition-[width] duration-200 ${
          desktopOpen ? "w-56" : "w-[4.25rem]"
        }`}
      >
        {/* Hamburger + Admin panel title in ONE block */}
        <div
          className={`border-b border-[#CCBCA5]/15 flex items-center gap-2.5 ${
            collapsed ? "justify-center px-2 py-3" : "px-3 py-3.5"
          }`}
        >
          <button
            type="button"
            onClick={onToggleDesktop}
            className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-lg border border-[#CCBCA5]/40 text-[#CCBCA5] hover:bg-[#CCBCA5]/15 transition-colors"
            aria-label={desktopOpen ? t.sidebarCollapse : t.sidebarExpand}
            title={desktopOpen ? t.sidebarCollapse : t.sidebarExpand}
          >
            <FaBars className="text-sm" />
          </button>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] leading-tight">
                {t.adminSidebarTitle}
              </p>
              <p className="text-[11px] text-[var(--dash-text-40)] mt-0.5 leading-tight">
                {t.adminSidebarHint}
              </p>
            </div>
          ) : null}
        </div>

        {renderLinks(collapsed, undefined)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-[70] flex">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
            aria-label={t.close}
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 flex h-full w-[16.5rem] max-w-[85vw] flex-col bg-[var(--dash-panel)] border-r border-[#CCBCA5]/25 shadow-2xl">
            <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-[#CCBCA5]/15">
              <button
                type="button"
                onClick={onCloseMobile}
                className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-lg border border-[#CCBCA5]/40 text-[#CCBCA5] hover:bg-[#CCBCA5]/15"
                aria-label={t.close}
              >
                <FaTimes className="text-sm" />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] leading-tight">
                  {t.adminSidebarTitle}
                </p>
                <p className="text-[11px] text-[var(--dash-text-40)] mt-0.5 leading-tight">
                  {t.adminSidebarHint}
                </p>
              </div>
            </div>
            {renderLinks(false, onCloseMobile)}
          </aside>
        </div>
      ) : null}
    </>
  );
}
