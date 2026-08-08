"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import LeadersDirectory from "@/components/leaders/LeadersDirectory";
import PageLoader from "@/components/ui/PageLoader";

export default function DashboardLeadersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <PageLoader />;
  }

  return <LeadersDirectory />;
}
