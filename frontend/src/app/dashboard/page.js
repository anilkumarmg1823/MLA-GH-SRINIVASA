"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaHardHat,
  FaFolderOpen,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaUsers,
  FaLandmark,
  FaMapMarkerAlt,
  FaUserFriends,
} from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import dynamic from "next/dynamic";
import { getSession } from "@/lib/auth";
import { getAllDevelopments } from "@/lib/developmentsStore";
import { getAllDepartmentRecords } from "@/lib/departmentRecordsStore";
import { getAllStaffAccess } from "@/lib/permissionsStore";
import {
  CONSTITUENCY_POPULATION,
  getGramPanchayatCount,
  getVillageCount,
} from "@/data/gramPanchayats";

const AdminDashboardCharts = dynamic(
  () => import("@/components/dashboard/AdminDashboardCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-[#CCBCA5]/20 bg-[var(--dash-panel-soft)] px-6 py-16 text-center text-[var(--dash-text-40)] text-sm">
        Loading charts…
      </div>
    ),
  }
);

function formatInrShort(amount) {
  const n = Number(amount) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCount(n) {
  return new Intl.NumberFormat("en-IN").format(Number(n) || 0);
}

export default function DashboardHomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [session, setSessionState] = useState(null);
  const [works, setWorks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    if (s.role === "development") {
      router.replace("/dashboard/development");
      return;
    }
    if (s.role === "department_records") {
      router.replace("/dashboard/department-records");
      return;
    }
    if (s.role === "demands") {
      router.replace("/dashboard/demands");
      return;
    }
    if (s.role === "assembly_qa") {
      router.replace("/dashboard/assembly-qa");
      return;
    }
    setSessionState(s);
    (async () => {
      try {
        const [worksData, docsData, staffData] = await Promise.all([
          getAllDevelopments(),
          getAllDepartmentRecords(),
          getAllStaffAccess(),
        ]);
        setWorks(worksData);
        setDocuments(docsData);
        setStaff(staffData);
      } catch {
        setWorks([]);
        setDocuments([]);
        setStaff([]);
      }
    })();
  }, [router]);

  const stats = useMemo(() => {
    let ongoing = 0;
    let completed = 0;
    let totalAmount = 0;
    works.forEach((r) => {
      totalAmount += Number(r.amountSanctioned) || 0;
      if (r.status === "Completed" || r.statusKn === "ಪೂರ್ಣಗೊಂಡಿದೆ") {
        completed += 1;
      } else {
        ongoing += 1;
      }
    });
    return {
      total: works.length,
      totalAmount,
      ongoing,
      completed,
      docs: documents.length,
      staff: staff.length,
      population: CONSTITUENCY_POPULATION,
      gramPanchayats: getGramPanchayatCount(),
      villages: getVillageCount(),
    };
  }, [works, documents, staff]);

  if (!session || session.role !== "admin") {
    return (
      <div className="text-[var(--dash-text-50)] text-sm py-8 text-center">Loading…</div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--dash-text)] mb-1">
          {t.adminHomeTitle}
        </h1>
        <p className="text-[var(--dash-text-55)] max-w-2xl">{t.adminHomeDesc}</p>
      </div>

      {/* Mobile/tablet: 2 rows max on lg (5+4). Desktop xl+: one row of 9. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2 sm:gap-3 mb-8">
        {[
          {
            label: t.adminStatPopulation,
            value: formatCount(stats.population),
            Icon: FaUserFriends,
          },
          {
            label: t.adminStatGps,
            value: formatCount(stats.gramPanchayats),
            Icon: FaLandmark,
          },
          {
            label: t.adminStatVillages,
            value: formatCount(stats.villages),
            Icon: FaMapMarkerAlt,
          },
          {
            label: t.chartTotalWorks,
            value: String(stats.total),
            Icon: FaHardHat,
          },
          {
            label: t.chartTotalAmount,
            value: formatInrShort(stats.totalAmount),
            Icon: FaRupeeSign,
          },
          {
            label: t.chartOngoing,
            value: String(stats.ongoing),
            Icon: FaClock,
          },
          {
            label: t.chartCompleted,
            value: String(stats.completed),
            Icon: FaCheckCircle,
          },
          {
            label: t.adminStatDocs,
            value: String(stats.docs),
            Icon: FaFolderOpen,
          },
          {
            label: t.adminStatStaff,
            value: String(stats.staff),
            Icon: FaUsers,
          },
        ].map((card) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl bg-[var(--dash-panel)] border border-[#CCBCA5]/25 p-2.5 sm:p-3 shadow-lg flex xl:flex-col items-start gap-2 sm:gap-2.5 min-w-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#CCBCA5]/15 border border-[#CCBCA5]/30 flex items-center justify-center shrink-0 text-[#CCBCA5]">
                <Icon className="text-sm" />
              </div>
              <div className="min-w-0 w-full">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-[#CCBCA5] mb-0.5 leading-tight line-clamp-2">
                  {card.label}
                </p>
                <p className="text-base sm:text-lg xl:text-xl font-black text-[var(--dash-text)] truncate">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <AdminDashboardCharts works={works} />
    </div>
  );
}
