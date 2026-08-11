"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import {
  MAX_FILE_BYTES,
  addDepartmentRecord,
} from "@/lib/departmentRecordsStore";
import { confirmEnglishSaveIfNeeded } from "@/lib/transliterateName";
import KnTextField from "@/components/ui/KnTextField";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import {
  FOLLOW_UP_STATUSES,
  getCategoryLabel,
  getRootLabel,
  isFollowUpsRoot,
} from "@/data/departmentDocumentTypes";

export default function UploadModal({
  open,
  onClose,
  root,
  category,
  onUploaded,
}) {
  const { lang, t } = useLanguage();
  const inputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [eGeneratedId, setEGeneratedId] = useState("");
  const [status, setStatus] = useState("pending");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const followUps = isFollowUpsRoot(root);

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setEGeneratedId("");
      setError("");
      setBusy(false);
      setDragging(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setStatus(
      FOLLOW_UP_STATUSES.some((s) => s.id === category) ? category : "pending"
    );
  }, [open, category]);

  if (!open) return null;

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    if (followUps && !eGeneratedId.trim()) {
      setError(t.deptEGeneratedIdRequired);
      return;
    }

    if (
      title.trim() &&
      !confirmEnglishSaveIfNeeded(lang, [title], t.confirmEnglishSave)
    ) {
      return;
    }

    setError("");
    setBusy(true);
    let saved = 0;
    const resolvedCategory = followUps ? status : category;
    const eId = eGeneratedId.trim();

    try {
      for (const file of files) {
        if (file.size > MAX_FILE_BYTES) {
          setError(t.deptFileTooLarge);
          continue;
        }
        try {
          await addDepartmentRecord({
            root,
            category: resolvedCategory,
            status: followUps ? status : undefined,
            eGeneratedId: followUps ? eId : undefined,
            title: title.trim() || file.name.replace(/\.[^.]+$/, ""),
            file,
          });
          saved += 1;
        } catch (err) {
          setError(
            err?.message === "FILE_TOO_LARGE"
              ? t.deptFileTooLarge
              : t.deptUploadFailed
          );
        }
      }
      setTitle("");
      setEGeneratedId("");
      if (inputRef.current) inputRef.current.value = "";
      onUploaded?.();
      if (saved > 0) onClose?.();
    } finally {
      setBusy(false);
      setDragging(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (busy) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dept-upload-title"
        className="relative w-full max-w-lg rounded-2xl border border-[#CCBCA5]/40 bg-[var(--dash-panel)] shadow-2xl p-5 sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[var(--dash-text-40)] hover:text-[var(--dash-text)] transition-colors"
          aria-label={t.close}
        >
          <FaTimes />
        </button>

        <div className="mb-4 pr-8">
          <h2
            id="dept-upload-title"
            className="text-lg font-black text-[var(--dash-text)]"
          >
            {t.deptUpload}
          </h2>
          <p className="text-xs text-[#CCBCA5] mt-0.5">
            {getRootLabel(root, lang)}
            {followUps
              ? ` · ${t.deptStatus}`
              : ` · ${getCategoryLabel(root, category, lang)}`}
          </p>
        </div>

        <div className="space-y-4">
          {followUps ? (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
                {t.deptEGeneratedId} *
              </label>
              <input
                type="text"
                value={eGeneratedId}
                onChange={(e) => {
                  setEGeneratedId(e.target.value);
                  if (error) setError("");
                }}
                placeholder={t.deptEGeneratedIdPlaceholder}
                className="w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20"
                autoFocus
              />
            </div>
          ) : null}

          <KnTextField
            label={t.deptTitleOptional}
            value={title}
            onChange={setTitle}
            placeholder={t.deptTitlePlaceholder}
            inputClassName="w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20"
          />

          {followUps ? (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
                {t.deptStatus}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20"
              >
                {FOLLOW_UP_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === "kn" ? s.labelKn : s.labelEn}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.txt,image/*,application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`w-full rounded-2xl border-2 border-dashed px-4 py-7 sm:py-8 text-center transition-all disabled:opacity-50 ${
              dragging
                ? "border-[#CCBCA5] bg-[#CCBCA5]/15 scale-[1.01]"
                : "border-[#CCBCA5]/40 bg-[var(--dash-input)] hover:border-[#CCBCA5]/70 hover:bg-[#CCBCA5]/08"
            }`}
          >
            <div
              className={`mx-auto mb-2 w-12 h-12 rounded-xl flex items-center justify-center border ${
                dragging
                  ? "bg-[#CCBCA5] text-[#1e2223] border-[#CCBCA5]"
                  : "bg-[#CCBCA5]/15 text-[#CCBCA5] border-[#CCBCA5]/35"
              }`}
            >
              <FaCloudUploadAlt className="text-xl" />
            </div>
            <p className="text-sm font-black text-[var(--dash-text)]">
              {busy
                ? t.deptUploading
                : dragging
                  ? t.deptDragging
                  : t.deptDropHere}
            </p>
            {!busy && !dragging && (
              <p className="text-xs text-[var(--dash-text-45)] mt-1">{t.deptDropOrClick}</p>
            )}
            <p className="text-[10px] text-[#CCBCA5]/70 mt-2">
              {t.deptUploadHint}
            </p>
          </button>

          {error && (
            <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/25 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-sm font-black hover:bg-[#CCBCA5]/10 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
