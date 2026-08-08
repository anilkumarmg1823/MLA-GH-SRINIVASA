"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import TourSchedulesAdmin from "@/components/tour/TourSchedulesAdmin";
import PageLoader from "@/components/ui/PageLoader";

export default function DashboardTourSchedulesPage() {
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

  return <TourSchedulesAdmin />;
}
