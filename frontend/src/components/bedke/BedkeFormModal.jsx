"use client";

import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getGpLabel, getVillageLabel } from "@/data/gramPanchayats";
import { confirmEnglishSaveIfNeeded } from "@/lib/transliterateName";
import KnTextField from "@/components/ui/KnTextField";
import { useEscapeKey } from "@/hooks/useEscapeKey";

const emptyForm = {
  name: "",
  approach: "civil",
  subject: "",
  status: "Pending",
};

const STATUS_KEYS = {
  Pending: "bedkePending",
  InProgress: "bedkeInProgress",
  Completed: "bedkeCompleted",
  Rejected: "bedkeRejected",
};

export default function BedkeFormModal({
  open,
  gramPanchayat,
  village,
  defaultApproach = "civil",
  initial = null,
  onClose,
  onSubmit,
}) {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState("form");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial?.id);

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    setStep("form");
    setError("");
    if (initial?.id) {
      setForm({
        name: initial.name || "",
        approach:
          initial.approach === "personal" ? "personal" : "civil",
        subject: initial.subject || "",
        status: initial.status || "Pending",
      });
    } else {
      setForm({
        ...emptyForm,
        approach: defaultApproach === "personal" ? "personal" : "civil",
      });
    }
  }, [open, defaultApproach, initial]);

  if (!open) return null;

  const approachLabel =
    form.approach === "personal" ? t.bedkeTabPersonal : t.bedkeTabCivil;
  const statusLabel = t[STATUS_KEYS[form.status]] || form.status;

  const handlePreview = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const subject = form.subject.trim();
    if (!name) {
      setError(t.bedkeNameRequired);
      return;
    }
    if (!subject) {
      setError(t.bedkeSubjectRequired);
      return;
    }
    if (!gramPanchayat || !village) {
      setError(t.bedkeSelectVillageFirst);
      return;
    }
    if (
      !confirmEnglishSaveIfNeeded(
        lang,
        [name, subject],
        t.confirmEnglishSave
      )
    ) {
      return;
    }
    setError("");
    setStep("preview");
  };

  const handleConfirm = () => {
    const name = form.name.trim();
    const subject = form.subject.trim();
    if (
      !confirmEnglishSaveIfNeeded(
        lang,
        [name, subject],
        t.confirmEnglishSave
      )
    ) {
      return;
    }
    onSubmit?.({
      id: initial?.id,
      gramPanchayat,
      village,
      name,
      approach: form.approach,
      subject,
      status: form.status || "Pending",
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bedke-form-title"
        className="relative w-full max-w-lg rounded-2xl border border-[#CCBCA5]/40 bg-[var(--dash-panel)] shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[var(--dash-text-40)] hover:text-[var(--dash-text)] transition-colors"
          aria-label={t.close}
        >
          <FaTimes />
        </button>

        <h2
          id="bedke-form-title"
          className="text-lg font-black text-[var(--dash-text)] pr-8 mb-1"
        >
          {step === "preview"
            ? t.bedkePreviewTitle
            : isEdit
              ? t.bedkeEdit || "Edit demand"
              : t.bedkeAdd}
        </h2>
        <p className="text-xs text-[#CCBCA5] mb-5">
          {getGpLabel(gramPanchayat, lang)} ·{" "}
          {getVillageLabel(gramPanchayat, village, lang)}
        </p>

        {step === "form" ? (
          <form onSubmit={handlePreview} className="space-y-4">
            <KnTextField
              label={t.bedkeName}
              value={form.name}
              onChange={(name) => setForm((f) => ({ ...f, name }))}
              placeholder={t.bedkeNamePlaceholder}
              inputClassName="w-full rounded-lg border border-[#CCBCA5]/30 bg-[var(--dash-bg)]/90 px-3 py-2.5 text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20"
            />

            <div>
              <label className="block text-sm font-medium text-[#CCBCA5] mb-1.5">
                {t.bedkeApproach}
              </label>
              <select
                value={form.approach}
                onChange={(e) =>
                  setForm((f) => ({ ...f, approach: e.target.value }))
                }
                className="w-full rounded-lg border border-[#CCBCA5]/30 bg-[var(--dash-bg)]/90 px-3 py-2.5 text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20"
              >
                <option value="civil">{t.bedkeTabCivil}</option>
                <option value="personal">{t.bedkeTabPersonal}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#CCBCA5] mb-1.5">
                {t.bedkeStatus}
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full rounded-lg border border-[#CCBCA5]/30 bg-[var(--dash-bg)]/90 px-3 py-2.5 text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20"
              >
                <option value="Pending">{t.bedkePending}</option>
                <option value="InProgress">
                  {t.bedkeInProgress || "In progress"}
                </option>
                <option value="Completed">
                  {t.bedkeCompleted || "Completed"}
                </option>
                <option value="Rejected">
                  {t.bedkeRejected || "Rejected"}
                </option>
              </select>
            </div>

            <KnTextField
              label={t.bedkeSubject}
              value={form.subject}
              onChange={(subject) => setForm((f) => ({ ...f, subject }))}
              multiline
              rows={4}
              placeholder={t.bedkeSubjectPlaceholder}
              inputClassName="w-full rounded-lg border border-[#CCBCA5]/30 bg-[var(--dash-bg)]/90 px-3 py-2.5 text-[var(--dash-text)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20 resize-y"
            />

            {error ? (
              <p className="text-sm text-red-300 font-medium">{error}</p>
            ) : null}

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-sm font-black hover:bg-[#CCBCA5]/10"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8]"
              >
                {t.bedkePreview}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#CCBCA5]/25 bg-[var(--dash-bg)]/70 p-4 space-y-3 text-sm">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5]/70">
                  {t.bedkeName}
                </p>
                <p className="text-[var(--dash-text)] font-bold mt-0.5">
                  {form.name.trim()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5]/70">
                  {t.bedkeApproach}
                </p>
                <p className="text-[var(--dash-text)] font-bold mt-0.5">
                  {approachLabel}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5]/70">
                  {t.bedkeSubject}
                </p>
                <p className="text-[var(--dash-text)]/85 mt-0.5 whitespace-pre-wrap">
                  {form.subject.trim()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5]/70">
                  {t.gp} / {t.village}
                </p>
                <p className="text-[var(--dash-text-80)] mt-0.5">
                  {getGpLabel(gramPanchayat, lang)} ·{" "}
                  {getVillageLabel(gramPanchayat, village, lang)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5]/70">
                  {t.bedkeStatus}
                </p>
                <p className="text-amber-300 font-bold mt-0.5">{statusLabel}</p>
              </div>
            </div>

            <p className="text-xs text-[var(--dash-text-50)]">
              {t.bedkePreviewHint}
            </p>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="px-4 py-2.5 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-sm font-black hover:bg-[#CCBCA5]/10"
              >
                {t.bedkeBackEdit}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-sm font-black hover:bg-[#d9cbb8]"
              >
                {isEdit
                  ? t.bedkeConfirmSave || "Confirm & save"
                  : t.bedkeConfirmSubmit}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
