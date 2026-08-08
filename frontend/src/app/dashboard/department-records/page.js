"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaSearch, FaDownload } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import {
  getSession,
  canAccessDepartmentRecords,
  canDo,
} from "@/lib/auth";
import {
  DOC_ROOTS,
  getCategoryLabel,
  getRootLabel,
  isFollowUpsRoot,
} from "@/data/departmentDocumentTypes";
import {
  countByRootCategory,
  deleteDepartmentRecord,
  getDocumentsForCategory,
  getAllDepartmentRecords,
  updateDepartmentRecord,
} from "@/lib/departmentRecordsStore";
import {
  downloadDepartmentRecordsExcel,
  downloadDepartmentRecordsPdf,
} from "@/lib/exportDepartmentRecords";
import CategorySidebar from "@/components/department-records/CategorySidebar";
import UploadModal from "@/components/department-records/UploadModal";
import DocumentList from "@/components/department-records/DocumentList";
import DepartmentSearchModal from "@/components/department-records/DepartmentSearchModal";
import ListDownloadModal from "@/components/shared/ListDownloadModal";
import PageLoader from "@/components/ui/PageLoader";

export default function DepartmentRecordsPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [allowed, setAllowed] = useState(false);
  const [rootId, setRootId] = useState(DOC_ROOTS[0].id);
  const [categoryId, setCategoryId] = useState(DOC_ROOTS[0].categories[0].id);
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [allDocs, setAllDocs] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [session, setSessionState] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (!s || !canAccessDepartmentRecords(s)) {
      router.replace("/login");
      return;
    }
    setSessionState(s);
    setAllowed(true);
  }, [router]);

  const refresh = useCallback(async () => {
    const [docs, countsData, all] = await Promise.all([
      getDocumentsForCategory(rootId, categoryId),
      countByRootCategory(),
      getAllDepartmentRecords(),
    ]);
    setRows(docs);
    setCounts(countsData);
    setAllDocs(all);
  }, [rootId, categoryId]);

  useEffect(() => {
    if (!allowed) return;
    refresh();
  }, [allowed, refresh]);

  const handleRootChange = (nextRoot) => {
    setRootId(nextRoot);
    const root = DOC_ROOTS.find((r) => r.id === nextRoot) || DOC_ROOTS[0];
    setCategoryId(root.categories[0].id);
  };

  const handleSearchSelect = async (doc) => {
    setSearchOpen(false);
    setRootId(doc.root);
    setCategoryId(doc.category);
    const [docs, countsData] = await Promise.all([
      getDocumentsForCategory(doc.root, doc.category),
      countByRootCategory(),
    ]);
    setRows(docs);
    setCounts(countsData);
    if (doc.dataUrl || doc.url) {
      window.open(doc.dataUrl || doc.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(t.deptConfirmDelete)) return;
    await deleteDepartmentRecord(doc.id);
    await refresh();
  };

  const handleStatusChange = async (doc, status) => {
    await updateDepartmentRecord(doc.id, { status });
    await refresh();
  };


  if (!allowed) {
    return <PageLoader />;
  }

  const canAdd = canDo(session, "department_records", "add");
  const canDelete = canDo(session, "department_records", "delete");
  const canDownload = canDo(session, "department_records", "download");
  const canChangeStatus =
    isFollowUpsRoot(rootId) &&
    (canDo(session, "department_records", "edit") || canAdd);

  return (
    <div>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[var(--dash-text)] tracking-wide">
            {t.departmentRecords}
          </h1>
          <p className="text-sm text-[#CCBCA5] mt-1">
            {getRootLabel(rootId, lang)} ·{" "}
            {getCategoryLabel(rootId, categoryId, lang)}
            {rows.length > 0 ? ` · ${rows.length}` : ""}
          </p>
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
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8] shadow-md transition-colors"
            >
              <FaPlus className="text-xs" />
              {t.deptUpload}
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
        <CategorySidebar
          rootId={rootId}
          categoryId={categoryId}
          counts={counts}
          onRootChange={handleRootChange}
          onCategoryChange={setCategoryId}
        />

        <div className="min-w-0">
          <DocumentList
            rows={rows}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            canDownload={canDownload}
            canDelete={canDelete}
            canChangeStatus={canChangeStatus}
          />
        </div>
      </div>

      <DepartmentSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        records={allDocs}
        onSelect={handleSearchSelect}
      />

      <ListDownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        title={t.departmentRecords}
        rowCount={rows.length}
        canDownload={canDownload}
        onDownloadExcel={() => downloadDepartmentRecordsExcel(rows, lang)}
        onDownloadPdf={() => downloadDepartmentRecordsPdf(rows, lang)}
      />

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        root={rootId}
        category={categoryId}
        onUploaded={refresh}
      />
    </div>
  );
}
