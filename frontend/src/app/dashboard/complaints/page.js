"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaSearch } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getSession } from "@/lib/auth";
import {
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
} from "@/lib/complaintsStore";
import {
  downloadComplaintsExcel,
  downloadComplaintsPdf,
} from "@/lib/exportComplaints";
import ListDownloadModal from "@/components/shared/ListDownloadModal";

const STATUS_OPTS = ["new", "read", "closed"];

export default function ComplaintsPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  const refresh = useCallback(async () => {
    setRows(await getAllComplaints());
  }, []);

  useEffect(() => {
    if (!allowed) return;
    refresh();
  }, [allowed, refresh]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!query) return true;
      return (
        r.name?.toLowerCase().includes(query) ||
        r.phone?.includes(query) ||
        r.village?.toLowerCase().includes(query) ||
        r.subject?.toLowerCase().includes(query) ||
        r.message?.toLowerCase().includes(query)
      );
    });
  }, [rows, q, statusFilter]);

  const handleStatus = async (id, status) => {
    await updateComplaintStatus(id, status);
    await refresh();
  };

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        t.archiveConfirm ||
          "Archive this complaint? It will be hidden, not permanently deleted."
      )
    ) {
      return;
    }
    await deleteComplaint(row.id);
    await refresh();
  };

  if (!allowed) {
    return (
      <div className="text-[var(--dash-text-50)] text-sm py-8 text-center">
        Loading…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[var(--dash-text)] tracking-wide">
            {t.navComplaints || "Complaints"}
          </h1>
          <p className="text-sm text-[var(--dash-text-50)] mt-1">
            {t.complaintsPageDesc ||
              "Public landing complaint submissions inbox"}
          </p>
          {filtered.length > 0 ? (
            <p className="text-sm text-[#CCBCA5] mt-1">
              {filtered.length} {lang === "kn" ? "records" : "records"}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setDownloadOpen(true)}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border-2 border-[#CCBCA5]/50 text-[#CCBCA5] text-sm font-black hover:bg-[#CCBCA5]/15"
        >
          <FaDownload className="text-xs" />
          {t.download || "Download"}
        </button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-40)] text-xs" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search || "Search"}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-panel)] text-sm text-[var(--dash-text)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-panel)] text-sm font-bold text-[var(--dash-text)]"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-[#CCBCA5]/20 overflow-hidden bg-[var(--dash-panel)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#CCBCA5]/15 text-[var(--dash-text)]">
                <th className="text-left px-3 py-2.5 font-black">Name</th>
                <th className="text-left px-3 py-2.5 font-black">Phone</th>
                <th className="text-left px-3 py-2.5 font-black">Village</th>
                <th className="text-left px-3 py-2.5 font-black">Subject</th>
                <th className="text-left px-3 py-2.5 font-black">Status</th>
                <th className="text-left px-3 py-2.5 font-black">Date</th>
                <th className="text-left px-3 py-2.5 font-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-[var(--dash-text-50)]"
                  >
                    No complaints yet
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[#CCBCA5]/15 align-top"
                  >
                    <td className="px-3 py-2.5 font-bold text-[var(--dash-text)]">
                      {row.name}
                      <p className="text-xs font-normal text-[var(--dash-text-50)] mt-1 max-w-xs line-clamp-2">
                        {row.message}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-[var(--dash-text-70)]">
                      {row.phone}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--dash-text-70)]">
                      {row.village}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--dash-text-70)]">
                      {row.subject || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={row.status}
                        onChange={(e) => handleStatus(row.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-[#CCBCA5]/40 bg-[var(--dash-bg)] text-xs font-bold"
                      >
                        {STATUS_OPTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5 text-[var(--dash-text-50)] whitespace-nowrap">
                      {row.createdAt
                        ? String(row.createdAt).slice(0, 10)
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="text-xs font-black text-amber-200 hover:text-amber-100"
                      >
                        {t.archive || "Archive"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ListDownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        title={t.navComplaints || "Complaints"}
        rowCount={filtered.length}
        onDownloadExcel={() => downloadComplaintsExcel(filtered, lang)}
        onDownloadPdf={() => downloadComplaintsPdf(filtered, lang)}
      />
    </div>
  );
}
