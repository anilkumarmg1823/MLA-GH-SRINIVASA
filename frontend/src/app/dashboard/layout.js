"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { getSession, wasSessionReplaced } from "@/lib/auth";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardWaveBackground from "@/components/dashboard/DashboardWaveBackground";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import KudligiLoader from "@/components/ui/KudligiLoader";
import SessionSync from "@/components/auth/SessionSync";

function DashboardShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [session, setSessionState] = useState(null);
  const [ready, setReady] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (wasSessionReplaced()) {
      router.replace("/login?reason=session_replaced");
      return;
    }
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSessionState(s);
    // Prefetch GP/village master from DB (hydrates @/data/gramPanchayats)
    import("@/lib/locations")
      .then((m) => m.ensureLocationsTree())
      .catch(() => {})
      .finally(() => setReady(true));
  }, [router]);

  if (!ready || !session) {
    return (
      <div data-theme={theme}>
        <KudligiLoader
          variant="full"
          subKn="ಪ್ರವೇಶ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…"
          subEn="Checking access…"
        />
      </div>
    );
  }

  const isStudioMode = pathname === "/dashboard/landing/studio";

  if (isStudioMode) {
    return (
      <div
        className="relative min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text)] overflow-x-hidden"
        data-theme={theme}
      >
        <SessionSync />
        <DashboardWaveBackground />
        <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
      </div>
    );
  }

  const isAdmin = session.role === "admin";

  return (
    <div
      className="relative min-h-screen flex flex-col text-[var(--dash-text)]"
      data-theme={theme}
    >
      <SessionSync />
      <DashboardWaveBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <DashboardNavbar
          session={session}
          onMenuClick={isAdmin ? () => setMobileOpen(true) : undefined}
        />
        <div className="flex flex-1 min-h-0">
          {isAdmin ? (
            <AdminSidebar
              desktopOpen={desktopOpen}
              mobileOpen={mobileOpen}
              onToggleDesktop={() => setDesktopOpen((v) => !v)}
              onCloseMobile={() => setMobileOpen(false)}
            />
          ) : null}
          <main className="flex-1 w-full px-3 sm:px-5 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <DashboardShell>{children}</DashboardShell>
      </ThemeProvider>
    </LanguageProvider>
  );
}
