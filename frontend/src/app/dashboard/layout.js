"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { getSession } from "@/lib/auth";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardWaveBackground from "@/components/dashboard/DashboardWaveBackground";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

function DashboardShell({ children }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [session, setSessionState] = useState(null);
  const [ready, setReady] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSessionState(s);
    setReady(true);
  }, [router]);

  if (!ready || !session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[var(--dash-bg)] text-[var(--dash-text-50)]"
        data-theme={theme}
      >
        Loading…
      </div>
    );
  }

  const isAdmin = session.role === "admin";

  return (
    <div
      className="relative min-h-screen flex flex-col text-[var(--dash-text)]"
      data-theme={theme}
    >
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
