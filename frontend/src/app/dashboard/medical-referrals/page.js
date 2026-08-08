"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaUserMd, FaHospital, FaPhoneAlt, FaSearch, FaFileAlt, FaSync } from "react-icons/fa";
import { getSession } from "@/lib/auth";
import { getToken } from "@/lib/api";
import PageLoader from "@/components/ui/PageLoader";

export default function AdminMedicalReferralsPage() {
  const router = useRouter();
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
      const token = getToken() || localStorage.getItem("mla_token") || localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:4000/api/medical-referrals/admin", {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.referrals) {
        setReferrals(data.data.referrals || []);
      } else {
        // Fallback: search public status or empty list
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
      const token = getToken() || localStorage.getItem("mla_token") || localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:4000/api/medical-referrals/admin/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setReferrals(prev =>
          prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        const errData = await res.json();
        alert(errData.error?.message || "ಸ್ಥಿತಿ ನವೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.");
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
      const token = getToken() || localStorage.getItem("mla_token") || localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:4000/api/medical-referrals/admin/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ hospitalName: newHospital })
      });
      if (res.ok) {
        setReferrals(prev =>
          prev.map(r => (r.id === id ? { ...r, hospitalName: newHospital } : r))
        );
      }
    } catch (err) {
      console.error("Failed to assign hospital:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return referrals.filter(r => {
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.referenceId.toLowerCase().includes(q) ||
        r.patientName.toLowerCase().includes(q) ||
        r.mobile.includes(q) ||
        (r.village && r.village.toLowerCase().includes(q)) ||
        (r.gramPanchayat && r.gramPanchayat.toLowerCase().includes(q)) ||
        r.hospitalName.toLowerCase().includes(q) ||
        r.disease.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [referrals, statusFilter, search]);

  if (!allowed) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6 text-[var(--dash-text)]">
      
      {/* Header aligned with Dashboard Theme */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--dash-panel)] p-6 rounded-2xl border border-[#CCBCA5]/20 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#002B7F] to-[#0055C4] text-[#FFD700] flex items-center justify-center font-black text-xl shadow-md border border-[#FFD700]/40">
            <FaUserMd />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest bg-[#002B7F]/60 px-2.5 py-0.5 rounded-full border border-[#FFD700]/30">
              MLA Office Health Assistance Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--dash-heading)] leading-tight mt-1">
              ಶಾಸಕರ ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಅರ್ಜಿಗಳ ನಿರ್ವಹಣೆ (Medical Referrals)
            </h1>
          </div>
        </div>

        <button
          onClick={fetchReferrals}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#CCBCA5]/40 text-[#CCBCA5] hover:bg-[#CCBCA5]/15 text-xs font-black transition-all shadow-sm"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          <span>ರಿಫ್ರೆಶ್ ಮಾಡಿ (Refresh)</span>
        </button>
      </div>

      {/* Filter & Search Bar aligned with Dashboard Theme */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--dash-panel)] p-4 rounded-2xl border border-[#CCBCA5]/20 shadow-md">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: "ALL", label: "ಎಲ್ಲವೂ (All)" },
            { id: "APPLIED", label: "📋 ನೂತನ" },
            { id: "IN_PROCESS", label: "⏳ ಪರಿಶೀಲನೆ" },
            { id: "APPROVED", label: "✓ ಅನುಮೋದಿತ" },
            { id: "COMPLETED", label: "🔵 ಪೂರ್ಣಗೊಂಡಿದೆ" },
            { id: "REJECTED", label: "❌ ತಿರಸ್ಕೃತ" }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                statusFilter === st.id
                  ? "bg-gradient-to-r from-[#002B7F] to-[#0055C4] text-white shadow-md border border-[#FFD700]/40"
                  : "bg-black/20 text-[var(--dash-text-70)] hover:bg-[var(--dash-hover)] hover:text-white border border-[#CCBCA5]/20"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dash-text-40)] text-xs" />
          <input
            type="text"
            placeholder="ರೆಫರೆನ್ಸ್, ರೋಗಿ ಹೆಸರು, ಮೊಬೈಲ್..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/20 rounded-xl border border-[#CCBCA5]/30 focus:border-[#FFD700] outline-none font-bold text-xs text-[var(--dash-text)]"
          />
        </div>

      </div>

      {/* Data Table aligned with Dashboard Theme */}
      <div className="rounded-2xl border border-[#CCBCA5]/20 overflow-hidden bg-[var(--dash-panel)] shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-[#CCBCA5] font-bold">
            ಅರ್ಜಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ... (Loading applications...)
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[var(--dash-text-50)] font-bold">
            ಯಾವುದೇ ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಅರ್ಜಿಗಳು ಸಿಕ್ಕಿಲ್ಲ. (No medical referral records found)
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead className="bg-[#001438] text-[#FFD700] uppercase tracking-wider font-black border-b border-[#CCBCA5]/20">
                <tr>
                  <th className="p-4">Reference ID</th>
                  <th className="p-4">ರೋಗಿಯ ಹೆಸರು / ವಿವರ</th>
                  <th className="p-4">ಆಸ್ಪತ್ರೆ</th>
                  <th className="p-4">ಗ್ರಾಮ ಪಂಚಾಯಿತಿ / ಸ್ಥಳ</th>
                  <th className="p-4">ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ (Status)</th>
                  <th className="p-4 text-right">ಕ್ರಮಗಳು (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCBCA5]/10">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--dash-hover)] transition-all">
                    
                    <td className="p-4 font-mono font-black text-[#FFD700]">
                      {item.referenceId}
                      <span className="block text-[10px] text-[var(--dash-text-40)] font-normal mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-black text-[var(--dash-heading)] text-sm">{item.patientName}</div>
                      <div className="text-[var(--dash-text-70)] font-bold mt-0.5">ವಯಸ್ಸು: {item.age}ವ | 📞 {item.mobile}</div>
                      <div className="text-[#60A5FA] font-bold text-[11px] mt-0.5">ರೋಗ: {item.disease}</div>
                    </td>

                    <td className="p-4 font-bold text-[var(--dash-text)] min-w-[140px] sm:min-w-[220px]">
                      <div className="flex items-center gap-1.5 text-[#FFD700] font-black mb-1">
                        <FaHospital className="text-xs" />
                        <span className="text-xs">{item.hospitalName}</span>
                      </div>
                      <select
                        disabled={updatingId === item.id}
                        value={item.hospitalName}
                        onChange={(e) => handleUpdateHospital(item.id, e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-[#CCBCA5]/30 font-bold text-[10px] outline-none bg-black/60 text-[#60A5FA] shadow-sm focus:border-[#FFD700]"
                      >
                        <option value={item.hospitalName}>🏥 ಆಸ್ಪತ್ರೆ ಬದಲಾಯಿಸಿ / ಶಿಫಾರಸು ಮಾಡಿ...</option>
                        <option value="ಶ್ರೀ ಜಯದೇವ ಹೃದ್ರೋಗ ವಿಜ್ಞಾನ ಮತ್ತು ಸಂಶೋಧನಾ ಸಂಸ್ಥೆ, ಬೆಂಗಳೂರು">ಶ್ರೀ ಜಯದೇವ ಹೃದ್ರೋಗ ಸಂಸ್ಥೆ, ಬೆಂಗಳೂರು</option>
                        <option value="ಕಿದ್ವಾಯಿ ಸ್ಮಾರಕ ಗ್ರಂಥಿ ಸಂಸ್ಥೆ (ಕ್ಯಾನ್ಸರ್ ಆಸ್ಪತ್ರೆ), ಬೆಂಗಳೂರು">ಕಿದ್ವಾಯಿ ಕ್ಯಾನ್ಸರ್ ಆಸ್ಪತ್ರೆ, ಬೆಂಗಳೂರು</option>
                        <option value="ನಿಮ್ಹಾನ್ಸ್ (NIMHANS), ಬೆಂಗಳೂರು">ನಿಮ್ಹಾನ್ಸ್ (NIMHANS), ಬೆಂಗಳೂರು</option>
                        <option value="ವಿಕ್ಟೋರಿಯಾ ಸರಕಾರಿ ಬೋಧನಾ ಆಸ್ಪತ್ರೆ, ಬೆಂಗಳೂರು">ವಿಕ್ಟೋರಿಯಾ ಸರಕಾರಿ ಆಸ್ಪತ್ರೆ, ಬೆಂಗಳೂರು</option>
                        <option value="ಕಿಮ್ಸ್ (KIMS) ಆಸ್ಪತ್ರೆ ಹಾಗೂ ಸಂಶೋಧನಾ ಕೇಂದ್ರ, ಹುಬ್ಬಳ್ಳಿ">ಕಿಮ್ಸ್ (KIMS) ಆಸ್ಪತ್ರೆ, ಹುಬ್ಬಳ್ಳಿ</option>
                        <option value="ಕೆ. ಆರ್. ಸರಕಾರಿ ಆಸ್ಪತ್ರೆ, ಮೈಸೂರು">ಕೆ. ಆರ್. ಸರಕಾರಿ ಆಸ್ಪತ್ರೆ, ಮೈಸೂರು</option>
                        <option value="ಎಸ್. ಎಸ್. ಇನ್‌ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಮೆಡಿಕಲ್ ಸೈನ್ಸಸ್ (SSIMS), ದಾವಣಗೆರೆ">SSIMS ಆಸ್ಪತ್ರೆ, ದಾವಣಗೆರೆ</option>
                        <option value="ವಿಜಯನಗರ ಇನ್‌ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಮೆಡಿಕಲ್ ಸೈನ್ಸಸ್ (VIMS), ಬಳ್ಳಾರಿ">VIMS ಆಸ್ಪತ್ರೆ, ಬಳ್ಳಾರಿ</option>
                      </select>
                    </td>

                    <td className="p-4 font-bold text-[var(--dash-text-70)]">
                      📍 {item.village}
                      {item.gramPanchayat && (
                        <span className="block text-[10px] text-[#CCBCA5]">GP: {item.gramPanchayat}</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                        item.status === "COMPLETED" ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" :
                        item.status === "IN_PROCESS" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                        item.status === "REJECTED" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                        "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Status Select */}
                        <select
                          disabled={updatingId === item.id}
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#CCBCA5]/30 font-bold text-[11px] outline-none bg-black/40 text-[var(--dash-text)] shadow-sm focus:border-[#FFD700]"
                        >
                          <option value="APPLIED">APPLIED</option>
                          <option value="IN_PROCESS">IN_PROCESS</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>

                        {/* Print PDF Letter Link */}
                        <a
                          href={`http://localhost:4000/api/medical-referrals/${item.referenceId}/pdf?autoprint=true`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-xs shadow-md transition-all flex items-center justify-center border border-emerald-400/40"
                          title="Print Official Letter PDF"
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
