"use client";

import React, { use } from "react";
import { useParams } from "next/navigation";
import { decodeRoute } from "@/lib/routeEncoder";

import LoginPage from "@/app/login/page";
import MedicalReferralPage from "@/app/medical-referral/page";
import DashboardPage from "@/app/dashboard/page";
import DevelopmentPage from "@/app/dashboard/development/page";
import DepartmentRecordsPage from "@/app/dashboard/department-records/page";
import DemandsPage from "@/app/dashboard/demands/page";
import ComplaintsPage from "@/app/dashboard/complaints/page";
import MedicalReferralsPage from "@/app/dashboard/medical-referrals/page";
import AssemblyQaPage from "@/app/dashboard/assembly-qa/page";
import LandingCmsPage from "@/app/dashboard/landing/page";
import StudioPage from "@/app/dashboard/landing/studio/page";
import TourSchedulesPage from "@/app/dashboard/tour-schedules/page";
import DashboardLeadersPage from "@/app/dashboard/leaders/page";
import AccessPage from "@/app/dashboard/access/page";
import DashboardLayout from "@/app/dashboard/layout";

export default function EncodedRoutePage({ params: paramsProp }) {
  const nextParams = useParams();
  const rawParams = paramsProp ? (typeof paramsProp.then === "function" ? use(paramsProp) : paramsProp) : nextParams;
  const slug = rawParams?.slug;
  const decodedPath = decodeRoute(slug);

  if (decodedPath === "/login") {
    return <LoginPage />;
  }
  if (decodedPath === "/medical-referral") {
    return <MedicalReferralPage />;
  }
  if (decodedPath === "/dashboard") {
    return (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/development") {
    return (
      <DashboardLayout>
        <DevelopmentPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/department-records") {
    return (
      <DashboardLayout>
        <DepartmentRecordsPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/demands") {
    return (
      <DashboardLayout>
        <DemandsPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/complaints") {
    return (
      <DashboardLayout>
        <ComplaintsPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/medical-referrals") {
    return (
      <DashboardLayout>
        <MedicalReferralsPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/assembly-qa") {
    return (
      <DashboardLayout>
        <AssemblyQaPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/landing") {
    return (
      <DashboardLayout>
        <LandingCmsPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/landing/studio") {
    return (
      <DashboardLayout>
        <StudioPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/leaders" || decodedPath === "/leaders") {
    return (
      <DashboardLayout>
        <DashboardLeadersPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/tour-schedules") {
    return (
      <DashboardLayout>
        <TourSchedulesPage />
      </DashboardLayout>
    );
  }
  if (decodedPath === "/dashboard/access") {
    return (
      <DashboardLayout>
        <AccessPage />
      </DashboardLayout>
    );
  }

  // Fallback to Login
  return <LoginPage />;
}
