"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaPowerOff, FaTimes, FaBars, FaSun, FaMoon } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import {
  clearSession,
  canAccessDevelopment,
  canAccessDepartmentRecords,
  canAccessDemands,
  canAccessAssemblyQa,
  getRoleDashboardPath,
} from "@/lib/auth";
import { useEscapeKey } from "@/hooks/useEscapeKey";

function LogoutConfirmModal({ open, onClose, onConfirm }) {
  const { t } = useLanguage();
  useEscapeKey(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        className="relative w-full max-w-sm rounded-2xl border border-[#CCBCA5]/40 bg-[var(--dash-panel)] shadow-2xl p-5 sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[var(--dash-text-40)] hover:text-[var(--dash-text)] transition-colors"
          aria-label={t.close}
        >
          <FaTimes />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-[#CCBCA5]/15 border border-[#CCBCA5]/40 flex items-center justify-center text-[#CCBCA5]">
            <FaPowerOff className="text-sm" />
          </div>
          <h2
            id="logout-confirm-title"
            className="text-lg font-black text-[var(--dash-text)] pr-6"
          >
            {t.logoutConfirmTitle}
          </h2>
        </div>

        <p className="text-sm text-[var(--dash-text-60)] leading-relaxed mb-6">
          {t.logoutConfirmMessage}
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-sm font-black hover:bg-[#CCBCA5]/10 transition-colors"
          >
            {t.logoutConfirmNo}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8] transition-colors"
          >
            {t.logoutConfirmYes}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardNavbar({ session, onMenuClick }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, t, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const displayName =
    lang === "kn"
      ? session?.nameKn?.trim() || session?.name
      : session?.name;
  const showDev = canAccessDevelopment(session);
  const showDept = canAccessDepartmentRecords(session);
  const showDemands = canAccessDemands(session);
  const showAssembly = canAccessAssemblyQa(session);
  const isAdmin = session?.role === "admin";
  const homePath = getRoleDashboardPath(session);

  const confirmLogout = () => {
    clearSession();
    setLogoutOpen(false);
    router.replace("/login");
  };

  const navLinkClass = (active) =>
    `transition-colors whitespace-nowrap ${
      active
        ? "text-[var(--dash-heading)]"
        : "text-[var(--dash-text-80)] hover:text-[var(--dash-heading)]"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--dash-panel-soft)] border-b-2 border-[#CCBCA5] shadow-lg backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isAdmin && onMenuClick ? (
              <button
                type="button"
                onClick={onMenuClick}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#CCBCA5]/40 text-[#CCBCA5] hover:bg-[#CCBCA5]/15 shrink-0"
                aria-label={t.sidebarExpand}
              >
                <FaBars />
              </button>
            ) : null}

            <Link
              href={homePath}
              className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0"
            >
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 hidden md:block filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                <Image
                  src="/karnataka_logo.png"
                  alt="Government of Karnataka Seal"
                  fill
                  sizes="(max-width: 640px) 36px, 44px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                <Image
                  src="/party_logo_v2.png"
                  alt="Indian National Congress Hand Logo"
                  fill
                  sizes="(max-width: 640px) 36px, 44px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-black text-xs sm:text-base tracking-wider uppercase text-[var(--dash-text)] leading-tight truncate">
                  {lang === "kn" ? "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ." : "DR. SRINIVAS N. T."}
                </span>
                <span className="text-[#CCBCA5] text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5">
                  Nimmondige | ನಿಮ್ಮೊಂದಿಗೆ
                </span>
              </div>
            </Link>
          </div>

          {!isAdmin ? (
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-6 text-sm font-black tracking-wide px-2">
              {showDev && (
                <Link
                  href="/dashboard/development"
                  className={navLinkClass(
                    pathname?.startsWith("/dashboard/development")
                  )}
                >
                  {t.development}
                </Link>
              )}
              {showDept && (
                <Link
                  href="/dashboard/department-records"
                  className={navLinkClass(
                    pathname?.startsWith("/dashboard/department-records")
                  )}
                >
                  {t.departmentRecords}
                </Link>
              )}
              {showDemands && (
                <Link
                  href="/dashboard/demands"
                  className={navLinkClass(
                    pathname?.startsWith("/dashboard/demands")
                  )}
                >
                  {t.navDemands}
                </Link>
              )}
              {showAssembly && (
                <Link
                  href="/dashboard/assembly-qa"
                  className={navLinkClass(
                    pathname?.startsWith("/dashboard/assembly-qa")
                  )}
                >
                  {t.navAssembly}
                </Link>
              )}
            </nav>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === "dark" ? t.themeLight : t.themeDark}
              aria-label={t.themeToggle}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] hover:bg-[#CCBCA5]/15 transition-colors shrink-0"
            >
              {theme === "dark" ? (
                <FaSun className="text-sm" />
              ) : (
                <FaMoon className="text-sm" />
              )}
            </button>

            <div className="flex items-center gap-1 bg-[var(--dash-bg)]/80 p-1 rounded-full border border-[var(--dash-border-soft)] h-fit">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-black rounded-full transition-all duration-300 ${
                  lang === "en"
                    ? "bg-[#CCBCA5] text-[#1e2223] shadow-md"
                    : "text-[var(--dash-text-60)] hover:text-[var(--dash-text)]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("kn")}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-black rounded-full transition-all duration-300 ${
                  lang === "kn"
                    ? "bg-[#CCBCA5] text-[#1e2223] shadow-md"
                    : "text-[var(--dash-text-60)] hover:text-[var(--dash-text)]"
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-[var(--dash-bg)] px-3 py-1 rounded-full border border-[#CCBCA5]/40 shadow-sm h-fit">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#CCBCA5] bg-white shrink-0">
                <Image
                  src="/cm_photo.png"
                  alt="D.K. Shivakumar"
                  fill
                  sizes="32px"
                  className="object-cover object-top"
                />
              </div>
              <div className="flex flex-col text-left justify-center">
                <span className="text-[var(--dash-text)] font-extrabold text-[10px] leading-tight tracking-wide">
                  {lang === "kn" ? "ಡಿ.ಕೆ. ಶಿವಕುಮಾರ್" : "D.K. Shivakumar"}
                </span>
                <span className="text-[#CCBCA5] font-extrabold text-[8px] tracking-wide leading-normal">
                  {lang === "kn" ? "ಮುಖ್ಯಮಂತ್ರಿ" : "Chief Minister"}
                </span>
              </div>
            </div>

            <span className="hidden xl:inline text-[10px] text-[var(--dash-text-50)] max-w-[100px] truncate">
              {displayName}
            </span>

            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs md:text-sm font-black text-[#CCBCA5] border-2 border-[#CCBCA5] rounded-full hover:bg-[#CCBCA5] hover:text-[#1e2223] transition-all duration-300 shadow-md whitespace-nowrap"
            >
              {t.logout}
            </button>
          </div>
        </div>

        {!isAdmin ? (
          <div className="lg:hidden border-t border-[#CCBCA5]/20 px-4 py-2 flex gap-2 overflow-x-auto">
            {showDev && (
              <Link
                href="/dashboard/development"
                className={`text-xs px-3 py-1.5 rounded-full shrink-0 font-bold ${
                  pathname?.startsWith("/dashboard/development")
                    ? "bg-[#CCBCA5] text-[#1e2223]"
                    : "text-[var(--dash-heading)] border border-[var(--dash-heading)]/40"
                }`}
              >
                {t.development}
              </Link>
            )}
            {showDept && (
              <Link
                href="/dashboard/department-records"
                className={`text-xs px-3 py-1.5 rounded-full shrink-0 font-bold ${
                  pathname?.startsWith("/dashboard/department-records")
                    ? "bg-[#CCBCA5] text-[#1e2223]"
                    : "text-[var(--dash-heading)] border border-[var(--dash-heading)]/40"
                }`}
              >
                {t.departmentRecords}
              </Link>
            )}
            {showDemands && (
              <Link
                href="/dashboard/demands"
                className={`text-xs px-3 py-1.5 rounded-full shrink-0 font-bold ${
                  pathname?.startsWith("/dashboard/demands")
                    ? "bg-[#CCBCA5] text-[#1e2223]"
                    : "text-[var(--dash-heading)] border border-[var(--dash-heading)]/40"
                }`}
              >
                {t.navDemands}
              </Link>
            )}
            {showAssembly && (
              <Link
                href="/dashboard/assembly-qa"
                className={`text-xs px-3 py-1.5 rounded-full shrink-0 font-bold ${
                  pathname?.startsWith("/dashboard/assembly-qa")
                    ? "bg-[#CCBCA5] text-[#1e2223]"
                    : "text-[var(--dash-heading)] border border-[var(--dash-heading)]/40"
                }`}
              >
                {t.navAssembly}
              </Link>
            )}
          </div>
        ) : null}
      </header>

      <LogoutConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}
