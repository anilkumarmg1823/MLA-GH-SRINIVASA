"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaSearch, FaWhatsapp, FaGlobe } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getSession } from "@/lib/auth";
import {
  getAllComplaints,
  updateComplaintStatus,
  replyToComplaint,
  deleteComplaint,
} from "@/lib/complaintsStore";
import {
  downloadComplaintsExcel,
  downloadComplaintsPdf,
} from "@/lib/exportComplaints";
import ListDownloadModal from "@/components/shared/ListDownloadModal";
import PageLoader from "@/components/ui/PageLoader";
import KnTextField from "@/components/ui/KnTextField";
import KnTranslateButtons from "@/components/ui/KnTranslateButtons";
import {
  confirmEnglishSaveIfNeeded,
  textMatchesSearch,
} from "@/lib/transliterateName";

const STATUS_OPTS = ["new", "read", "closed"];

export default function ComplaintsPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyError, setReplyError] = useState("");

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
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
      if (!q.trim()) return true;
      const hay = [
        r.name,
        r.phone,
        r.village,
        r.gramPanchayat,
        r.subject,
        r.message,
      ]
        .filter(Boolean)
        .join(" ");
      return textMatchesSearch(hay, q);
    });
  }, [rows, q, statusFilter, sourceFilter]);

  const active = useMemo(
    () => filtered.find((r) => r.id === activeId) || null,
    [filtered, activeId]
  );

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
    if (activeId === row.id) setActiveId(null);
    await refresh();
  };

  const handleSendReply = async () => {
    if (!active || !replyDraft.trim()) return;
    if (
      !confirmEnglishSaveIfNeeded(lang, [replyDraft], t.confirmEnglishSave)
    ) {
      return;
    }
    setReplyBusy(true);
    setReplyError("");
    try {
      const data = await replyToComplaint(active.id, replyDraft.trim(), {
        status: "closed",
        sendWhatsApp: active.source === "whatsapp",
      });
      if (data?.waError) {
        setReplyError(
          `Reply saved, but WhatsApp send failed: ${data.waError}`
        );
      } else {
        setReplyDraft("");
      }
      await refresh();
    } catch (err) {
      setReplyError(err?.message || "Failed to send reply");
    } finally {
      setReplyBusy(false);
    }
  };

  if (!allowed) {
    return <PageLoader />;
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
              "Web + WhatsApp complaint inbox"}
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
            className="w-full pl-9 pr-[5.5rem] py-2.5 rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-panel)] text-sm text-[var(--dash-text)]"
          />
          <KnTranslateButtons
            value={q}
            onChange={setQ}
            compact
            className="absolute right-2 top-1/2 -translate-y-1/2"
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
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-panel)] text-sm font-bold text-[var(--dash-text)]"
        >
          <option value="all">All sources</option>
          <option value="web">Web</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl border border-[#CCBCA5]/20 overflow-hidden bg-[var(--dash-panel)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#CCBCA5]/15 text-[var(--dash-text)]">
                  <th className="text-left px-3 py-2.5 font-black">Source</th>
                  <th className="text-left px-3 py-2.5 font-black">Name</th>
                  <th className="text-left px-3 py-2.5 font-black">Place</th>
                  <th className="text-left px-3 py-2.5 font-black">Status</th>
                  <th className="text-left px-3 py-2.5 font-black">Date</th>
                  <th className="text-left px-3 py-2.5 font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-[var(--dash-text-50)]"
                    >
                      No complaints yet
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setActiveId(row.id);
                        setReplyDraft(row.replyText || "");
                        setReplyError("");
                      }}
                      className={`border-t border-[#CCBCA5]/15 align-top cursor-pointer ${
                        activeId === row.id ? "bg-[#CCBCA5]/10" : "hover:bg-[#CCBCA5]/05"
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        {row.source === "whatsapp" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-300">
                            <FaWhatsapp /> WA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-sky-300">
                            <FaGlobe /> Web
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-[var(--dash-text)]">
                        {row.name}
                        <p className="text-xs font-normal text-[var(--dash-text-50)] mt-1 max-w-xs line-clamp-2">
                          {row.message}
                        </p>
                        <p className="text-[10px] text-[var(--dash-text-40)] mt-0.5">
                          {row.phone}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-[var(--dash-text-70)]">
                        <div className="font-bold">{row.village}</div>
                        {row.gramPanchayat ? (
                          <div className="text-[10px] text-[var(--dash-text-40)]">
                            GP: {row.gramPanchayat}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
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
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
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

        <div className="lg:col-span-2 rounded-2xl border border-[#CCBCA5]/20 bg-[var(--dash-panel)] p-4 min-h-[280px]">
          {!active ? (
            <p className="text-sm text-[var(--dash-text-50)]">
              Select a complaint to view details and send a reply.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-[var(--dash-text)]">
                    {active.name}
                  </h2>
                  <p className="text-xs text-[var(--dash-text-50)]">
                    {active.phone}
                    {active.source === "whatsapp" ? " · WhatsApp" : " · Web"}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5]">
                  {active.id.slice(-8)}
                </span>
              </div>

              <div className="text-xs text-[var(--dash-text-70)] space-y-1">
                <p>
                  <span className="font-black text-[var(--dash-text)]">GP:</span>{" "}
                  {active.gramPanchayat || "—"}
                </p>
                <p>
                  <span className="font-black text-[var(--dash-text)]">Village:</span>{" "}
                  {active.village}
                </p>
                <p>
                  <span className="font-black text-[var(--dash-text)]">Subject:</span>{" "}
                  {active.subject || "—"}
                </p>
              </div>

              <p className="text-sm text-[var(--dash-text)] whitespace-pre-wrap leading-relaxed bg-[var(--dash-bg)] rounded-xl p-3 border border-[#CCBCA5]/20">
                {active.message}
              </p>

              {Array.isArray(active.photos) && active.photos.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {active.photos.map((p) => (
                    <a
                      key={p.s3Key || p.url}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#CCBCA5]/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt="Complaint attachment"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : null}

              {active.replyText ? (
                <div className="text-xs rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-100">
                  <p className="font-black mb-1">Previous reply</p>
                  <p className="whitespace-pre-wrap">{active.replyText}</p>
                </div>
              ) : null}

              <div>
                <KnTextField
                  label={
                    active.source === "whatsapp"
                      ? "Officer reply (also sends on WhatsApp)"
                      : "Officer reply"
                  }
                  value={replyDraft}
                  onChange={setReplyDraft}
                  multiline
                  rows={4}
                  placeholder="Type the response to the citizen…"
                  inputClassName="w-full px-3 py-2 rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] text-sm text-[var(--dash-text)]"
                />
                {replyError ? (
                  <p className="text-xs text-red-300 mt-1">{replyError}</p>
                ) : null}
                <button
                  type="button"
                  disabled={replyBusy || !replyDraft.trim()}
                  onClick={handleSendReply}
                  className="mt-2 w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-black"
                >
                  {replyBusy
                    ? "Sending…"
                    : active.source === "whatsapp"
                      ? "Send reply + WhatsApp"
                      : "Save reply"}
                </button>
              </div>
            </div>
          )}
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
