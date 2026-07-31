"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaSearch, FaDownload } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getSession, canAccessAssemblyQa, canDo } from "@/lib/auth";
import {
  addAssemblyQa,
  deleteAssemblyQa,
  getAllAssemblyQa,
} from "@/lib/assemblyQaStore";
import {
  downloadAssemblyQaExcel,
  downloadAssemblyQaPdf,
} from "@/lib/exportAssemblyQa";
import AssemblyQaTabs from "@/components/assembly-qa/AssemblyQaTabs";
import AssemblyQaList from "@/components/assembly-qa/AssemblyQaList";
import AssemblyQaFormModal from "@/components/assembly-qa/AssemblyQaFormModal";
import AssemblyQaDetailModal from "@/components/assembly-qa/AssemblyQaDetailModal";
import AssemblyQaSearchModal from "@/components/assembly-qa/AssemblyQaSearchModal";
import ListDownloadModal from "@/components/shared/ListDownloadModal";

export default function AssemblyQaPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [allowed, setAllowed] = useState(false);
  const [session, setSessionState] = useState(null);
  const [askedByTab, setAskedByTab] = useState("all");
  const [rows, setRows] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || !canAccessAssemblyQa(s)) {
      router.replace("/login");
      return;
    }
    setSessionState(s);
    setAllowed(true);
  }, [router]);

  const refresh = useCallback(async () => {
    setRows(await getAllAssemblyQa());
  }, []);

  useEffect(() => {
    if (!allowed) return;
    refresh();
  }, [allowed, refresh]);

  const mlaRows = useMemo(
    () => rows.filter((r) => r.askedBy === "mla"),
    [rows]
  );
  const otherRows = useMemo(
    () => rows.filter((r) => r.askedBy === "other"),
    [rows]
  );
  const displayRows =
    askedByTab === "mla"
      ? mlaRows
      : askedByTab === "other"
        ? otherRows
        : rows;

  const handleSave = async (payload) => {
    const sessionUser = getSession();
    await addAssemblyQa({
      ...payload,
      uploadedBy: sessionUser?.name || "Staff",
    });
    setFormOpen(false);
    setAskedByTab(payload.askedBy === "mla" ? "mla" : "other");
    await refresh();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(t.aqConfirmDelete)) return;
    await deleteAssemblyQa(row.id);
    if (detailRow?.id === row.id) setDetailRow(null);
    await refresh();
  };

  if (!allowed) {
    return (
      <div className="text-[var(--dash-text-50)] text-sm py-8 text-center">Loading…</div>
    );
  }

  const canAdd = canDo(session, "assembly_qa", "add");
  const canDelete = canDo(session, "assembly_qa", "delete");
  const canDownload = canDo(session, "assembly_qa", "download");

  return (
    <div>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[var(--dash-text)] tracking-wide">
            {t.navAssembly}
          </h1>
          <p className="text-sm text-[var(--dash-text-50)] mt-1">{t.aqPageDesc}</p>
          {displayRows.length > 0 ? (
            <p className="text-sm text-[#CCBCA5] mt-1">
              {displayRows.length} {t.aqRecords}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border-2 border-[#CCBCA5]/50 text-[#CCBCA5] text-sm font-black hover:bg-[#CCBCA5]/15 transition-colors backdrop-blur-sm bg-[var(--dash-hover)]"
          >
            <FaSearch className="text-xs" />
            {t.search}
          </button>
          {canDownload ? (
            <button
              type="button"
              onClick={() => setDownloadOpen(true)}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border-2 border-[#CCBCA5]/50 text-[#CCBCA5] text-sm font-black hover:bg-[#CCBCA5]/15 transition-colors backdrop-blur-sm bg-[var(--dash-hover)]"
            >
              <FaDownload className="text-xs" />
              {t.download}
            </button>
          ) : null}
          {canAdd ? (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8] shadow-md transition-colors"
            >
              <FaPlus className="text-xs" />
              {t.aqAdd}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-5 max-w-xl">
        <AssemblyQaTabs
          value={askedByTab}
          onChange={setAskedByTab}
          mlaCount={mlaRows.length}
          otherCount={otherRows.length}
        />
      </div>

      <AssemblyQaList
        rows={displayRows}
        onOpen={setDetailRow}
        onDelete={handleDelete}
        canDelete={canDelete}
      />

      <AssemblyQaFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
      />

      <AssemblyQaDetailModal
        open={Boolean(detailRow)}
        row={detailRow}
        onClose={() => setDetailRow(null)}
        canDownload={canDownload}
      />

      <AssemblyQaSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        records={rows}
        onSelect={(row) => {
          setSearchOpen(false);
          setAskedByTab(row.askedBy === "mla" ? "mla" : "other");
          setDetailRow(row);
        }}
      />

      <ListDownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        title={t.navAssembly}
        rowCount={displayRows.length}
        canDownload={canDownload}
        onDownloadExcel={() => downloadAssemblyQaExcel(displayRows, lang)}
        onDownloadPdf={() => downloadAssemblyQaPdf(displayRows, lang)}
      />
    </div>
  );
}
