"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import {
  MAX_AQ_FILE_BYTES,
  filesToAttachments,
} from "@/lib/assemblyQaStore";
import { useEscapeKey } from "@/hooks/useEscapeKey";

const empty = {
  questionNo: "",
  sessionLabel: "",
  sessionDate: "",
  askedBy: "other",
  askedByName: "",
  partyName: "",
  question: "",
  answer: "",
  status: "pending",
};

export default function AssemblyQaFormModal({ open, onClose, onSubmit }) {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    setForm(empty);
    setFiles([]);
    setBusy(false);
    setError("");
    setDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  }, [open]);

  if (!open) return null;

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "askedBy" && value === "mla") {
        next.askedByName = next.askedByName || "Dr. Srinivas N. T.";
        next.partyName = "";
      }
      if (key === "answer") {
        next.status = value.trim() ? "answered" : "pending";
      }
      return next;
    });
  };

  const addFiles = async (fileList) => {
    const list = Array.from(fileList || []);
    if (!list.length) return;
    setError("");
    setBusy(true);
    try {
      for (const file of list) {
        if (file.size > MAX_AQ_FILE_BYTES) {
          setError(t.deptFileTooLarge);
          continue;
        }
      }
      const ok = list.filter((f) => f.size <= MAX_AQ_FILE_BYTES);
      if (!ok.length) return;
      const attachments = await filesToAttachments(ok);
      setFiles((prev) => [...prev, ...attachments]);
    } catch {
      setError(t.deptUploadFailed);
    } finally {
      setBusy(false);
      setDragging(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const question = form.question.trim();
    const askedByName = form.askedByName.trim();
    if (!question) {
      setError(t.aqQuestionRequired);
      return;
    }
    if (!askedByName) {
      setError(t.aqAskedByNameRequired);
      return;
    }
    if (form.askedBy === "other" && !form.partyName.trim()) {
      setError(t.aqPartyRequired);
      return;
    }
    setError("");
    onSubmit?.({
      ...form,
      question,
      askedByName,
      partyName: form.askedBy === "other" ? form.partyName.trim() : "",
      answer: form.answer.trim(),
      status: form.answer.trim() ? "answered" : form.status || "pending",
      files,
    });
  };

  const fieldClass =
    "w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-bg)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-3 sm:px-4 py-4">
      <div
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#CCBCA5]/40 bg-[var(--dash-panel)] shadow-2xl p-5 sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[var(--dash-text-40)] hover:text-[var(--dash-text)]"
          aria-label={t.close}
        >
          <FaTimes />
        </button>

        <h2 className="text-lg font-black text-[var(--dash-text)] pr-8 mb-1">{t.aqAdd}</h2>
        <p className="text-xs text-[#CCBCA5] mb-4">{t.aqFormHint}</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
                {t.aqQuestionNo}
              </label>
              <input
                value={form.questionNo}
                onChange={(e) => setField("questionNo", e.target.value)}
                placeholder="UQ-12"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
                {t.aqSessionDate}
              </label>
              <input
                type="date"
                value={form.sessionDate}
                onChange={(e) => setField("sessionDate", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
              {t.aqSessionLabel}
            </label>
            <input
              value={form.sessionLabel}
              onChange={(e) => setField("sessionLabel", e.target.value)}
              placeholder={t.aqSessionPlaceholder}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
              {t.aqAskedBy} *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "mla", label: t.aqTabMla },
                { id: "other", label: t.aqTabOther },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setField("askedBy", opt.id)}
                  className={`py-2.5 rounded-full text-xs font-black border-2 transition-colors ${
                    form.askedBy === opt.id
                      ? "bg-[#CCBCA5] border-[#CCBCA5] text-[#1e2223]"
                      : "border-[#CCBCA5]/40 text-[#CCBCA5]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
                {t.aqAskedByName} *
              </label>
              <input
                value={form.askedByName}
                onChange={(e) => setField("askedByName", e.target.value)}
                placeholder={t.aqAskedByNamePlaceholder}
                className={fieldClass}
              />
            </div>
            {form.askedBy === "other" ? (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
                  {t.aqParty} *
                </label>
                <input
                  value={form.partyName}
                  onChange={(e) => setField("partyName", e.target.value)}
                  placeholder={t.aqPartyPlaceholder}
                  className={fieldClass}
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
                  {t.aqStatus}
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                  className={fieldClass}
                >
                  <option value="pending">{t.aqStatusPending}</option>
                  <option value="answered">{t.aqStatusAnswered}</option>
                </select>
              </div>
            )}
          </div>

          {form.askedBy === "other" ? (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
                {t.aqStatus}
              </label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className={fieldClass}
              >
                <option value="pending">{t.aqStatusPending}</option>
                <option value="answered">{t.aqStatusAnswered}</option>
              </select>
            </div>
          ) : null}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
              {t.aqQuestion} *
            </label>
            <textarea
              value={form.question}
              onChange={(e) => setField("question", e.target.value)}
              rows={3}
              placeholder={t.aqQuestionPlaceholder}
              className={`${fieldClass} resize-y min-h-[84px]`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
              {t.aqAnswer}
            </label>
            <textarea
              value={form.answer}
              onChange={(e) => setField("answer", e.target.value)}
              rows={3}
              placeholder={t.aqAnswerPlaceholder}
              className={`${fieldClass} resize-y min-h-[84px]`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
              {t.aqAttachFiles}
            </label>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.txt,image/*,application/pdf"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`w-full rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-all disabled:opacity-50 ${
                dragging
                  ? "border-[#CCBCA5] bg-[#CCBCA5]/15"
                  : "border-[#CCBCA5]/40 bg-[var(--dash-input)] hover:border-[#CCBCA5]/70"
              }`}
            >
              <FaCloudUploadAlt className="mx-auto text-[#CCBCA5] text-xl mb-1" />
              <p className="text-sm font-black text-[var(--dash-text)]">
                {busy ? t.deptUploading : t.deptDropHere}
              </p>
              <p className="text-[10px] text-[#CCBCA5]/70 mt-1">
                {t.deptUploadHint}
              </p>
            </button>
            {files.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {files.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-2 text-xs text-[var(--dash-text-70)] bg-[var(--dash-bg)] border border-[#CCBCA5]/20 rounded-lg px-3 py-2"
                  >
                    <span className="truncate">{f.fileName}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles((prev) => prev.filter((x) => x.id !== f.id))
                      }
                      className="text-red-300 font-black shrink-0"
                    >
                      {t.delete}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/25 rounded-xl px-3 py-2">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-sm font-black"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8]"
            >
              {t.aqSave}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
