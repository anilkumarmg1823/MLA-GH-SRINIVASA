"use client";

import React from "react";
import { FaTimes, FaExternalLinkAlt, FaDownload } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";

function formatBytes(n) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssemblyQaDetailModal({
  open,
  row,
  onClose,
  canDownload = true,
}) {
  const { lang, t } = useLanguage();
  useEscapeKey(open, onClose);

  if (!open || !row) return null;

  const question =
    lang === "kn" && row.questionKn ? row.questionKn : row.question;
  const answer =
    lang === "kn" && row.answerKn ? row.answerKn : row.answer;

  const openFile = (file) => {
    if (!file?.dataUrl) return;
    window.open(file.dataUrl, "_blank", "noopener,noreferrer");
  };

  const downloadFile = (file) => {
    if (!file?.dataUrl) return;
    const a = document.createElement("a");
    a.href = file.dataUrl;
    a.download = file.fileName || "file";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-3 sm:px-4 py-4">
      <div
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#CCBCA5]/40 bg-[var(--dash-panel)] shadow-2xl p-5 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[var(--dash-text-40)] hover:text-[var(--dash-text)]"
          aria-label={t.close}
        >
          <FaTimes />
        </button>

        <div className="pr-8 mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {row.questionNo ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#CCBCA5]/15 text-[#CCBCA5] border border-[#CCBCA5]/35">
                {row.questionNo}
              </span>
            ) : null}
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[var(--dash-hover)] text-[var(--dash-text-70)] border border-[var(--dash-border-faint)]">
              {row.askedBy === "mla" ? t.aqTabMla : t.aqTabOther}
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                row.status === "answered"
                  ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/35"
                  : "bg-amber-400/15 text-amber-300 border-amber-400/35"
              }`}
            >
              {row.status === "answered"
                ? t.aqStatusAnswered
                : t.aqStatusPending}
            </span>
          </div>
          <h2 className="text-lg font-black text-[var(--dash-text)]">{t.aqView}</h2>
          <p className="text-xs text-[var(--dash-text-45)] mt-1">
            {row.askedByName}
            {row.partyName ? ` · ${row.partyName}` : ""}
            {row.sessionLabel ? ` · ${row.sessionLabel}` : ""}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
              {t.aqQuestion}
            </p>
            <p className="text-sm text-[var(--dash-text)]/90 leading-relaxed whitespace-pre-wrap">
              {question}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
              {t.aqAnswer}
            </p>
            <p className="text-sm text-[var(--dash-text-80)] leading-relaxed whitespace-pre-wrap">
              {answer?.trim() ? answer : t.aqNoAnswerYet}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-2">
              {t.aqFiles} ({row.files?.length || 0})
            </p>
            {!row.files?.length ? (
              <p className="text-sm text-[var(--dash-text-40)]">{t.aqNoFiles}</p>
            ) : (
              <ul className="space-y-2">
                {row.files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#CCBCA5]/20 bg-[var(--dash-bg)] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--dash-text)] truncate">
                        {file.fileName}
                      </p>
                      <p className="text-[10px] text-[var(--dash-text-40)]">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openFile(file)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#CCBCA5]/35 text-[#CCBCA5] text-[10px] font-black"
                      >
                        <FaExternalLinkAlt />
                        {t.deptOpen}
                      </button>
                      {canDownload ? (
                        <button
                          type="button"
                          onClick={() => downloadFile(file)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#CCBCA5]/35 text-[#CCBCA5] text-[10px] font-black"
                        >
                          <FaDownload />
                          {t.download}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-sm font-black"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
