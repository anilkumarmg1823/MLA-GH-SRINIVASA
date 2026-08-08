"use client";

import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { LEADER_CATEGORY_META } from "@/data/leadersSeed";

const emptyForm = {
  nameEn: "",
  nameKn: "",
  roleEn: "",
  roleKn: "",
  category: "party",
  locationKn: "",
  phone: "",
  whatsapp: "",
  photo: "/cm_photo.png",
  bioKn: "",
  isImportant: false,
};

export default function LeaderFormModal({ open, initial = null, onClose, onSubmit }) {
  const { lang, t } = useLanguage();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial?.id);

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (initial?.id) {
      setForm({
        nameEn: initial.nameEn || "",
        nameKn: initial.nameKn || "",
        roleEn: initial.roleEn || "",
        roleKn: initial.roleKn || "",
        category: initial.category || "party",
        locationKn: initial.locationKn || "",
        phone: initial.phone || "",
        whatsapp: initial.whatsapp || initial.phone || "",
        photo: initial.photo || "/cm_photo.png",
        bioKn: initial.bioKn || "",
        isImportant: Boolean(initial.isImportant),
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, initial]);

  if (!open) return null;

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nameEn.trim() && !form.nameKn.trim()) {
      setError(t.leaderNameRequired || "Name is required");
      return;
    }
    if (!form.phone.trim() && !form.whatsapp.trim()) {
      setError(t.leaderPhoneRequired || "Phone or WhatsApp number is required");
      return;
    }
    setError("");
    onSubmit?.({
      id: initial?.id,
      ...form,
      nameEn: form.nameEn.trim(),
      nameKn: form.nameKn.trim(),
      roleEn: form.roleEn.trim(),
      roleKn: form.roleKn.trim(),
      locationKn: form.locationKn.trim(),
      phone: form.phone.trim(),
      whatsapp: (form.whatsapp || form.phone).trim(),
      photo: form.photo.trim() || "/cm_photo.png",
      bioKn: form.bioKn.trim(),
    });
  };

  const fieldClass =
    "w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-panel-soft)] px-3 py-2.5 text-sm font-semibold text-[var(--dash-heading)] placeholder:text-[var(--dash-text-40)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)]/40";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
        aria-label={t.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leader-form-title"
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
          id="leader-form-title"
          className="text-lg font-black text-[var(--dash-heading)] pr-8"
        >
          {isEdit ? t.editLeader || "Edit leader" : t.addLeader || "Add leader"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wide text-[var(--dash-text-50)]">
                Name (EN)
              </span>
              <input
                className={fieldClass}
                value={form.nameEn}
                onChange={(e) => setField("nameEn", e.target.value)}
                placeholder="Name in English"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wide text-[var(--dash-text-50)]">
                Name (KN)
              </span>
              <input
                className={fieldClass}
                value={form.nameKn}
                onChange={(e) => setField("nameKn", e.target.value)}
                placeholder="ಹೆಸರು"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wide text-[var(--dash-text-50)]">
                Role (EN)
              </span>
              <input
                className={fieldClass}
                value={form.roleEn}
                onChange={(e) => setField("roleEn", e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wide text-[var(--dash-text-50)]">
                Role (KN)
              </span>
              <input
                className={fieldClass}
                value={form.roleKn}
                onChange={(e) => setField("roleKn", e.target.value)}
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wide text-[var(--dash-text-50)]">
              {lang === "kn" ? "ವರ್ಗ" : "Category"}
            </span>
            <select
              className={fieldClass}
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
            >
              {Object.entries(LEADER_CATEGORY_META).map(([id, meta]) => (
                <option key={id} value={id}>
                  {lang === "kn" ? meta.categoryKn : meta.categoryEn}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wide text-[var(--dash-text-50)]">
              {lang === "kn" ? "ಸ್ಥಳ" : "Location"}
            </span>
            <input
              className={fieldClass}
              value={form.locationKn}
              onChange={(e) => setField("locationKn", e.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wide text-[var(--dash-text-50)]">
                Phone
              </span>
              <input
                className={fieldClass}
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                inputMode="tel"
                placeholder="9876543210"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wide text-[var(--dash-text-50)]">
                WhatsApp
              </span>
              <input
                className={fieldClass}
                value={form.whatsapp}
                onChange={(e) => setField("whatsapp", e.target.value)}
                inputMode="tel"
                placeholder="Same as phone if empty"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wide text-[var(--dash-text-50)]">
              Photo URL / path
            </span>
            <input
              className={fieldClass}
              value={form.photo}
              onChange={(e) => setField("photo", e.target.value)}
              placeholder="/cm_photo.png"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wide text-[var(--dash-text-50)]">
              Bio (KN)
            </span>
            <textarea
              className={`${fieldClass} min-h-[80px] resize-y`}
              value={form.bioKn}
              onChange={(e) => setField("bioKn", e.target.value)}
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-bold text-[var(--dash-text-70)]">
            <input
              type="checkbox"
              checked={form.isImportant}
              onChange={(e) => setField("isImportant", e.target.checked)}
              className="rounded border-[#CCBCA5]/50"
            />
            {lang === "kn" ? "\u0CAA\u0CCD\u0CB0\u0CAE\u0CC1\u0C96 \u0CAE\u0CC1\u0C96\u0C82\u0CA1\u0CB0\u0CC1" : "Important leader"}
          </label>

          {error ? (
            <p className="text-sm font-bold text-rose-500">{error}</p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-black text-[var(--dash-text-70)] hover:bg-[var(--dash-panel-soft)]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-black bg-[var(--dash-accent)] text-white hover:opacity-90"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
