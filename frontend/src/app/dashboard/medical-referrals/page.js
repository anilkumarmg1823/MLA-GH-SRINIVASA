"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FaHospital,
  FaSearch,
  FaFileAlt,
  FaSync,
  FaClipboardList,
  FaHourglassHalf,
  FaCheckCircle,
  FaCheckDouble,
  FaTimesCircle,
  FaListUl,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { getSession } from "@/lib/auth";
import { getToken } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import PageLoader from "@/components/ui/PageLoader";
import KnTranslateButtons from "@/components/ui/KnTranslateButtons";
import { textMatchesSearch } from "@/lib/transliterateName";

export default function AdminMedicalReferralsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [allowed, setAllowed] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const token =
        getToken() ||
        localStorage.getItem("mla_token") ||
        localStorage.getItem("token") ||
        "";
      const res = await fetch("http://localhost:4000/api/medical-referrals/admin", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.referrals) {
        setReferrals(data.data.referrals || []);
      } else {
        console.error("Admin fetch returned:", data);
        setReferrals([]);
      }
    } catch (err) {
      console.error("Failed to fetch medical referrals:", err);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allowed) {
      fetchReferrals();
    }
  }, [allowed]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const token =
        getToken() ||
        localStorage.getItem("mla_token") ||
        localStorage.getItem("token") ||
        "";
      const res = await fetch(
        `http://localhost:4000/api/medical-referrals/admin/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        setReferrals((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        const errData = await res.json();
        alert(errData.error?.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateHospital = async (id, newHospital) => {
    setUpdatingId(id);
    try {
      const token =
        getToken() ||
        localStorage.getItem("mla_token") ||
        localStorage.getItem("token") ||
        "";
      const res = await fetch(
        `http://localhost:4000/api/medical-referrals/admin/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ hospitalName: newHospital }),
        }
      );
      if (res.ok) {
        setReferrals((prev) =>
          prev.map((r) => (r.id === id ? { ...r, hospitalName: newHospital } : r))
        );
      }
    } catch (err) {
      console.error("Failed to assign hospital:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return referrals.filter((r) => {
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      if (!search.trim()) return matchesStatus;
      const hay = [
        r.referenceId,
        r.patientName,
        r.mobile,
        r.village,
        r.gramPanchayat,
      ]
        .filter(Boolean)
        .join(" ");
      return matchesStatus && textMatchesSearch(hay, search);
    });
  }, [referrals, statusFilter, search]);

  const statusTabs = [
    { id: "ALL", label: t.mrFilterAll, icon: FaListUl },
    { id: "APPLIED", label: t.mrFilterNew, icon: FaClipboardList },
    { id: "IN_PROCESS", label: t.mrFilterReview, icon: FaHourglassHalf },
    { id: "APPROVED", label: t.mrFilterApproved, icon: FaCheckCircle },
    { id: "COMPLETED", label: t.mrFilterCompleted, icon: FaCheckDouble },
    { id: "REJECTED", label: t.mrFilterRejected, icon: FaTimesCircle },
  ];

  if (!allowed) return <PageLoader />;

  return (
    <div className="text-[var(--dash-text)]">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <h1 className="text-2xl font-black text-[var(--dash-text)] tracking-wide">
          {t.medicalReferrals}
        </h1>
        <button
          type="button"
          onClick={fetchReferrals}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border-2 border-[#CCBCA5]/50 text-[#CCBCA5] text-sm font-black hover:bg-[#CCBCA5]/15"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          {t.mrRefresh}
        </button>
      </div>

      <div className="mb-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {statusTabs.map((st) => {
            const Icon = st.icon;
            return (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all inline-flex items-center gap-1.5 ${
                  statusFilter === st.id
                    ? "bg-[#CCBCA5]/25 text-[var(--dash-heading)] shadow-md border border-[#CCBCA5]/60"
                    : "bg-[var(--dash-panel)] text-[var(--dash-text-70)] hover:bg-[var(--dash-hover)] hover:text-white border border-[#CCBCA5]/30"
                }`}
              >
                {Icon ? <Icon className="text-xs shrink-0" /> : null}
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dash-text-40)] text-xs" />
          <input
            type="text"
            placeholder={t.mrSearchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-[5.5rem] py-2.5 rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-panel)] text-sm text-[var(--dash-text)]"
          />
          <KnTranslateButtons
            value={search}
            onChange={setSearch}
            compact
            className="absolute right-2 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#CCBCA5]/20 overflow-hidden bg-[var(--dash-panel)] shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-[#CCBCA5] font-bold">{t.mrLoading}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[var(--dash-text-50)] font-bold">
            {t.mrEmpty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#CCBCA5]/15 text-[var(--dash-text)]">
                  <th className="text-left px-3 py-2.5 font-black">{t.mrColReference}</th>
                  <th className="text-left px-3 py-2.5 font-black">{t.mrColPatient}</th>
                  <th className="text-left px-3 py-2.5 font-black">{t.mrColHospital}</th>
                  <th className="text-left px-3 py-2.5 font-black">{t.mrColPlace}</th>
                  <th className="text-left px-3 py-2.5 font-black">{t.mrColStatus}</th>
                  <th className="text-right px-3 py-2.5 font-black">{t.mrColActions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-[#CCBCA5]/15 align-top hover:bg-[#CCBCA5]/05"
                  >
                    <td className="px-3 py-2.5 font-mono font-black text-[#CCBCA5]">
                      {item.referenceId}
                      <span className="block text-[10px] text-[var(--dash-text-40)] font-normal mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="font-bold text-[var(--dash-text)] text-sm">
                        {item.patientName}
                      </div>
                      <div className="text-[var(--dash-text-70)] text-xs mt-0.5 flex items-center gap-1.5">
                        <span>{t.mrAge}: {item.age}</span>
                        <span>|</span>
                        <FaPhoneAlt className="text-[10px] text-[#CCBCA5]" />
                        <span>{item.mobile}</span>
                      </div>
                      <div className="text-[var(--dash-text-50)] text-[11px] mt-0.5">
                        {t.mrDisease}: {item.disease}
                      </div>
                    </td>

                    <td className="px-3 py-2.5 font-bold text-[var(--dash-text)] min-w-[140px] sm:min-w-[220px]">
                      <div className="flex items-center gap-1.5 text-[#CCBCA5] font-black mb-1">
                        <FaHospital className="text-xs" />
                        <span className="text-xs">{item.hospitalName}</span>
                      </div>
                      <select
                        disabled={updatingId === item.id}
                        value={item.hospitalName}
                        onChange={(e) =>
                          handleUpdateHospital(item.id, e.target.value)
                        }
                        className="w-full px-2 py-1 rounded-lg border border-[#CCBCA5]/40 bg-[var(--dash-bg)] text-[10px] font-bold outline-none text-[var(--dash-text)]"
                      >
                        <option value={item.hospitalName}>
                          {t.mrChangeHospital}
                        </option>
                        <option value="ಶ್ರೀ ಜಯದೇವ ಹೃದ್ರೋಗ ವಿಜ್ಞಾನ ಮತ್ತು ಸಂಶೋಧನಾ ಸಂಸ್ಥೆ, ಬೆಂಗಳೂರು">
                          ಶ್ರೀ ಜಯದೇವ ಹೃದ್ರೋಗ ಸಂಸ್ಥೆ, ಬೆಂಗಳೂರು
                        </option>
                        <option value="ಕಿದ್ವಾಯಿ ಸ್ಮಾರಕ ಗ್ರಂಥಿ ಸಂಸ್ಥೆ (ಕ್ಯಾನ್ಸರ್ ಆಸ್ಪತ್ರೆ), ಬೆಂಗಳೂರು">
                          ಕಿದ್ವಾಯಿ ಕ್ಯಾನ್ಸರ್ ಆಸ್ಪತ್ರೆ, ಬೆಂಗಳೂರು
                        </option>
                        <option value="ನಿಮ್ಹಾನ್ಸ್ (NIMHANS), ಬೆಂಗಳೂರು">
                          ನಿಮ್ಹಾನ್ಸ್ (NIMHANS), ಬೆಂಗಳೂರು
                        </option>
                        <option value="ವಿಕ್ಟೋರಿಯಾ ಸರಕಾರಿ ಬೋಧನಾ ಆಸ್ಪತ್ರೆ, ಬೆಂಗಳೂರು">
                          ವಿಕ್ಟೋರಿಯಾ ಸರಕಾರಿ ಆಸ್ಪತ್ರೆ, ಬೆಂಗಳೂರು
                        </option>
                        <option value="ಕಿಮ್ಸ್ (KIMS) ಆಸ್ಪತ್ರೆ ಹಾಗೂ ಸಂಶೋಧನಾ ಕೇಂದ್ರ, ಹುಬ್ಬಳ್ಳಿ">
                          ಕಿಮ್ಸ್ (KIMS) ಆಸ್ಪತ್ರೆ, ಹುಬ್ಬಳ್ಳಿ
                        </option>
                        <option value="ಕೆ. ಆರ್. ಸರಕಾರಿ ಆಸ್ಪತ್ರೆ, ಮೈಸೂರು">
                          ಕೆ. ಆರ್. ಸರಕಾರಿ ಆಸ್ಪತ್ರೆ, ಮೈಸೂರು
                        </option>
                        <option value="ಎಸ್. ಎಸ್. ಇನ್‌ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಮೆಡಿಕಲ್ ಸೈನ್ಸಸ್ (SSIMS), ದಾವಣಗೆರೆ">
                          SSIMS ಆಸ್ಪತ್ರೆ, ದಾವಣಗೆರೆ
                        </option>
                        <option value="ವಿಜಯನಗರ ಇನ್‌ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಮೆಡಿಕಲ್ ಸೈನ್ಸಸ್ (VIMS), ಬಳ್ಳಾರಿ">
                          VIMS ಆಸ್ಪತ್ರೆ, ಬಳ್ಳಾರಿ
                        </option>
                      </select>
                    </td>

                    <td className="px-3 py-2.5 font-bold text-[var(--dash-text-70)]">
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs text-[#CCBCA5]" />
                        <span>{item.village}</span>
                      </div>
                      {item.gramPanchayat && (
                        <span className="block text-[10px] text-[var(--dash-text-40)]">
                          GP: {item.gramPanchayat}
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-2.5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : item.status === "COMPLETED"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              : item.status === "IN_PROCESS"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : item.status === "REJECTED"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        }`}
                      >
                        {item.status === "APPLIED"
                          ? t.mrFilterNew
                          : item.status === "IN_PROCESS"
                            ? t.mrFilterReview
                            : item.status === "APPROVED"
                              ? t.mrFilterApproved
                              : item.status === "COMPLETED"
                                ? t.mrFilterCompleted
                                : item.status === "REJECTED"
                                  ? t.mrFilterRejected
                                  : item.status}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          disabled={updatingId === item.id}
                          value={item.status}
                          onChange={(e) =>
                            handleUpdateStatus(item.id, e.target.value)
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-[#CCBCA5]/40 bg-[var(--dash-bg)] font-bold text-[11px] outline-none text-[var(--dash-text)]"
                        >
                          <option value="APPLIED">{t.mrFilterNew}</option>
                          <option value="IN_PROCESS">{t.mrFilterReview}</option>
                          <option value="APPROVED">{t.mrFilterApproved}</option>
                          <option value="COMPLETED">{t.mrFilterCompleted}</option>
                          <option value="REJECTED">{t.mrFilterRejected}</option>
                        </select>

                        <a
                          href={`http://localhost:4000/api/medical-referrals/${item.referenceId}/pdf?autoprint=true`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-xs shadow-md transition-all flex items-center justify-center border border-emerald-400/40"
                          title={t.mrPrintLetter}
                        >
                          <FaFileAlt />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
