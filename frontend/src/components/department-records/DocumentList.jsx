"use client";

import React from "react";
import {
  FaTrashAlt,
  FaExternalLinkAlt,
  FaDownload,
} from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import {
  FOLLOW_UP_STATUSES,
  getFollowUpStatusLabel,
  isFollowUpsRoot,
} from "@/data/departmentDocumentTypes";

function formatBytes(n) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso, lang) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(lang === "kn" ? "kn-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function isImage(mimeType) {
  return Boolean(mimeType?.startsWith("image/"));
}

function isPdf(mimeType) {
  return mimeType === "application/pdf" || Boolean(mimeType?.includes("pdf"));
}

function getPreviewSrc(doc) {
  if (doc.coverUrl) return doc.coverUrl;
  if (isImage(doc.mimeType) && (doc.dataUrl || doc.url)) return doc.dataUrl || doc.url;
  if ((doc.dataUrl || doc.url) && /^https?:\/\//i.test(doc.dataUrl || doc.url)) {
    return doc.dataUrl || doc.url;
  }
  return null;
}

function statusTone(status) {
  if (status === "completed") return "bg-emerald-400/15 text-emerald-300 border-emerald-400/35";
  if (status === "in_progress") return "bg-sky-400/15 text-sky-300 border-sky-400/35";
  return "bg-amber-400/15 text-amber-300 border-amber-400/35";
}

function PreviewFace({ doc }) {
  const src = getPreviewSrc(doc);
  if (src) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={doc.title || doc.fileName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {isPdf(doc.mimeType) ? (
          <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--dash-bg)]/85 text-[#CCBCA5] border border-[#CCBCA5]/40">
            PDF
          </span>
        ) : null}
      </>
    );
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--dash-panel)] via-[var(--dash-panel)] to-[var(--dash-bg)] flex flex-col items-center justify-center gap-2 p-4">
      <div className="w-14 h-[4.5rem] rounded-sm bg-[#CCBCA5]/20 border border-[#CCBCA5]/35 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#CCBCA5]/35" />
        <div className="absolute top-4 left-2 right-2 space-y-1.5">
          <div className="h-1 rounded bg-[#CCBCA5]/40 w-full" />
          <div className="h-1 rounded bg-[#CCBCA5]/25 w-4/5" />
          <div className="h-1 rounded bg-[#CCBCA5]/25 w-3/5" />
          <div className="h-1 rounded bg-[#CCBCA5]/20 w-full" />
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5]/70">
        {doc.fileName?.split(".").pop() || "FILE"}
      </span>
    </div>
  );
}

export default function DocumentList({
  rows,
  onDelete,
  onStatusChange,
  canDownload = true,
  canDelete = true,
  canChangeStatus = false,
}) {
  const { lang, t } = useLanguage();

  if (!rows?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#CCBCA5]/35 bg-[var(--dash-panel-soft)] px-6 py-16 text-center text-[var(--dash-text-50)] text-sm">
        {t.deptEmpty}
      </div>
    );
  }

  const handleOpen = (doc) => {
    if (!doc.dataUrl && !doc.url) return;
    window.open(doc.dataUrl || doc.url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = (doc) => {
    if (!doc.dataUrl && !doc.url) return;
    const a = document.createElement("a");
    a.href = doc.dataUrl || doc.url;
    a.download = doc.fileName || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {rows.map((doc) => {
        const showStatus = isFollowUpsRoot(doc.root);
        const status = doc.status || doc.category || "pending";

        return (
          <li
            key={doc.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#CCBCA5]/25 bg-[var(--dash-panel)] shadow-lg hover:border-[#CCBCA5]/55 transition-all"
          >
            <button
              type="button"
              onClick={() => handleOpen(doc)}
              className="relative aspect-[4/3] w-full bg-[var(--dash-bg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCBCA5] focus-visible:ring-inset"
            >
              <PreviewFace doc={doc} />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--dash-bg)]/95 via-[var(--dash-bg)]/20 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                {showStatus && doc.eGeneratedId ? (
                  <p className="text-[10px] font-black text-[#CCBCA5] mb-0.5 text-left tracking-wide">
                    {doc.eGeneratedId}
                  </p>
                ) : null}
                <p className="text-sm font-black text-[var(--dash-text)] line-clamp-2 text-left leading-snug">
                  {lang === "kn" && doc.titleKn
                    ? doc.titleKn
                    : doc.title || doc.fileName}
                </p>
              </div>
            </button>

            <div className="p-2.5 flex flex-col gap-2 flex-1">
              <div className="min-w-0">
                {showStatus && doc.eGeneratedId ? (
                  <p className="text-[10px] font-black text-[#CCBCA5] mb-1 truncate">
                    {t.deptEGeneratedId}: {doc.eGeneratedId}
                  </p>
                ) : null}
                {showStatus ? (
                  canChangeStatus ? (
                    <select
                      value={status}
                      onChange={(e) => onStatusChange?.(doc, e.target.value)}
                      className={`w-full mb-1.5 rounded-lg border px-2 py-1 text-[10px] font-black outline-none ${statusTone(
                        status
                      )} bg-[var(--dash-bg)]`}
                      aria-label={t.deptStatus}
                    >
                      {FOLLOW_UP_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {lang === "kn" ? s.labelKn : s.labelEn}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`inline-flex mb-1.5 px-2 py-0.5 rounded-md border text-[10px] font-black ${statusTone(
                        status
                      )}`}
                    >
                      {getFollowUpStatusLabel(status, lang)}
                    </span>
                  )
                ) : null}
                <p className="text-[10px] text-[var(--dash-text-45)] truncate">
                  {doc.fileName} · {formatBytes(doc.size)}
                </p>
                <p className="text-[9px] text-[var(--dash-text-30)] mt-0.5">
                  {formatDate(doc.uploadedAt, lang)}
                  {doc.uploadedBy ? ` · ${doc.uploadedBy}` : ""}
                </p>
              </div>

              <div
                className={`mt-auto grid gap-1 ${
                  canDownload && canDelete
                    ? "grid-cols-3"
                    : canDownload || canDelete
                      ? "grid-cols-2"
                      : "grid-cols-1"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleOpen(doc)}
                  className="inline-flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg border border-[#CCBCA5]/30 text-[#CCBCA5] text-[9px] font-black hover:bg-[#CCBCA5]/10 transition-colors"
                  title={t.deptOpen}
                >
                  <FaExternalLinkAlt className="text-[10px]" />
                  {t.deptOpen}
                </button>
                {canDownload ? (
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="inline-flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg border border-[#CCBCA5]/30 text-[#CCBCA5] text-[9px] font-black hover:bg-[#CCBCA5]/10 transition-colors"
                    title={t.download}
                  >
                    <FaDownload className="text-[10px]" />
                    {t.download}
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(doc)}
                    className="inline-flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg border border-red-400/35 text-red-300 text-[9px] font-black hover:bg-red-400/10 transition-colors"
                    title={t.delete}
                  >
                    <FaTrashAlt className="text-[10px]" />
                    {t.delete}
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
