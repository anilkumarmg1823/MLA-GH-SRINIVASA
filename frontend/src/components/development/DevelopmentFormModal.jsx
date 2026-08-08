"use client";

import React, { useEffect, useState } from "react";
import { FaTimes, FaCloudUploadAlt, FaVideo, FaImage } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { gramPanchayats, getVillagesForGp } from "@/data/gramPanchayats";
import { getRecordMedia } from "@/lib/media";
import { useEscapeKey } from "@/hooks/useEscapeKey";

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#CCBCA5]/35 bg-[var(--dash-bg)] px-3 py-2 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-text-30)] outline-none focus:border-[#CCBCA5] focus:ring-2 focus:ring-[#CCBCA5]/20";

export default function DevelopmentFormModal({
  open,
  initial,
  gramPanchayat: initialGp,
  village: initialVillage,
  onClose,
  onSave,
}) {
  const { lang, t } = useLanguage();
  const [formGp, setFormGp] = useState("");
  const [formVillage, setFormVillage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [amountSanctioned, setAmountSanctioned] = useState("");
  const [yojane, setYojane] = useState("");
  const [status, setStatus] = useState("Ongoing");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [department, setDepartment] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [media, setMedia] = useState([]);

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setFormGp(initial.gramPanchayat || initialGp || "");
      setFormVillage(initial.village || initialVillage || "");
      setName(initial.name || "");
      setDescription(initial.description || "");
      setDetails(initial.details || "");
      setAmountSanctioned(
        initial.amountSanctioned != null ? String(initial.amountSanctioned) : ""
      );
      setYojane(initial.yojane || "");
      setStatus(initial.status || "Ongoing");
      setBeneficiaries(initial.beneficiaries || "");
      setDepartment(initial.department || "");
      setLocationNote(initial.locationNote || "");
      setMedia(getRecordMedia(initial));
    } else {
      setFormGp(initialGp || "");
      setFormVillage(initialVillage || "");
      setName("");
      setDescription("");
      setDetails("");
      setAmountSanctioned("");
      setYojane("");
      setStatus("Ongoing");
      setBeneficiaries("");
      setDepartment("");
      setLocationNote("");
      setMedia([]);
    }
  }, [open, initial, initialGp, initialVillage]);

  if (!open) return null;

  const villages = formGp ? getVillagesForGp(formGp) : [];

  const handleGpChange = (gp) => {
    setFormGp(gp);
    setFormVillage("");
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const next = files.map((f) => {
      const isVideo = f.type.startsWith("video/");
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: URL.createObjectURL(f),
        type: isVideo ? "video" : "image",
        name: f.name,
        file: f,
      };
    });
    setMedia((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const removeMedia = (id) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(amountSanctioned);
    if (
      !formGp ||
      !formVillage ||
      !name.trim() ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      !yojane.trim()
    ) {
      return;
    }
    const images = media.filter((m) => m.type === "image").map((m) => m.url);
    onSave({
      gramPanchayat: formGp,
      village: formVillage,
      name: name.trim(),
      description: description.trim(),
      details: details.trim(),
      amountSanctioned: amount,
      yojane: yojane.trim(),
      status,
      statusKn: status === "Completed" ? "ಪೂರ್ಣಗೊಂಡಿದೆ" : "ಚಾಲ್ತಿಯಲ್ಲಿದೆ",
      beneficiaries: beneficiaries.trim(),
      department: department.trim(),
      locationNote: locationNote.trim(),
      startDate: initial?.startDate || new Date().toISOString().slice(0, 10),
      images,
      media,
    });
  };

  const photos = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[var(--dash-overlay)] backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[var(--dash-panel)] border-2 border-[#CCBCA5]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Gold header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-[#CCBCA5] via-[#d4c4ad] to-[#b8a890] shrink-0">
          <h2 className="text-base sm:text-lg font-black text-[#1e2223]">
            {initial ? t.editRecord : t.addRecord}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#1e2223]/70 hover:bg-[var(--dash-bg)]/10"
            aria-label={t.close}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="flex flex-col md:flex-row min-h-0 flex-1 overflow-y-auto">
            {/* Left — media */}
            <div className="md:w-[38%] shrink-0 p-4 border-b md:border-b-0 md:border-r border-[#CCBCA5]/25 bg-[var(--dash-bg)]/70 flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5] mb-1">
                  {t.colMedia}
                </p>
                <p className="text-[11px] text-[var(--dash-text-40)] mb-2">{t.uploadMediaHint}</p>

                <label className="flex flex-col items-center justify-center gap-1.5 w-full rounded-2xl border-2 border-dashed border-[#CCBCA5]/55 bg-[#CCBCA5]/10 hover:bg-[#CCBCA5]/18 cursor-pointer transition-colors px-3 py-5">
                  <FaCloudUploadAlt className="text-2xl text-[#CCBCA5]" />
                  <span className="text-xs font-bold text-[var(--dash-text)] text-center">
                    {t.uploadImages}
                  </span>
                  <span className="text-[10px] text-[var(--dash-text-30)]">JPG · PNG · MP4 · WebM</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFiles}
                    className="hidden"
                  />
                </label>
              </div>

              {media.length > 0 && (
                <div className="space-y-2">
                  {photos.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-[#CCBCA5] mb-1.5 flex items-center gap-1">
                        <FaImage /> {t.mediaPhotos} ({photos.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {photos.map((m) => (
                          <div
                            key={m.id}
                            className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#CCBCA5]/30"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={m.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeMedia(m.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[var(--dash-text)] text-[10px] leading-none"
                              title={t.removeImage}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {videos.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-[#CCBCA5] mb-1.5 flex items-center gap-1">
                        <FaVideo /> {t.mediaVideos} ({videos.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {videos.map((m) => (
                          <div
                            key={m.id}
                            className="relative w-20 h-14 rounded-lg overflow-hidden border border-[#CCBCA5]/40 bg-black/40"
                          >
                            <video
                              src={m.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                            <button
                              type="button"
                              onClick={() => removeMedia(m.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[var(--dash-text)] text-[10px] leading-none"
                              title={t.removeImage}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right — fields */}
            <div className="flex-1 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5 min-w-0 content-start">
              <Field label={t.gp}>
                <select
                  value={formGp}
                  onChange={(e) => handleGpChange(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">{t.selectGp}</option>
                  {gramPanchayats.map((gp) => (
                    <option key={gp.name} value={gp.name}>
                      {lang === "kn" ? gp.nameKn : gp.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={t.village}>
                <select
                  value={formVillage}
                  onChange={(e) => setFormVillage(e.target.value)}
                  className={inputClass}
                  disabled={!formGp}
                  required
                >
                  <option value="">{t.selectVillage}</option>
                  {villages.map((v) => (
                    <option key={v.name} value={v.name}>
                      {lang === "kn" ? v.nameKn : v.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={t.colName}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder={t.namePlaceholder}
                  required
                />
              </Field>

              <Field label={t.colYojane}>
                <input
                  value={yojane}
                  onChange={(e) => setYojane(e.target.value)}
                  className={inputClass}
                  placeholder={t.yojanePlaceholder}
                  required
                />
              </Field>

              <Field label={t.colAmount}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={amountSanctioned}
                  onChange={(e) => setAmountSanctioned(e.target.value)}
                  className={inputClass}
                  placeholder={t.amountPlaceholder}
                  required
                />
              </Field>

              <Field label={t.colStatus}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="Ongoing">
                    {lang === "kn" ? "ಚಾಲ್ತಿಯಲ್ಲಿದೆ" : "Ongoing"}
                  </option>
                  <option value="Completed">
                    {lang === "kn" ? "ಪೂರ್ಣಗೊಂಡಿದೆ" : "Completed"}
                  </option>
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field label={t.colDescription}>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder={t.descriptionPlaceholder}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label={t.colMoreDetails}>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder={t.descriptionPlaceholder}
                  />
                </Field>
              </div>

              <Field label={t.colBeneficiaries}>
                <input
                  value={beneficiaries}
                  onChange={(e) => setBeneficiaries(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label={t.colDepartment}>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label={t.colLocation}>
                  <input
                    value={locationNote}
                    onChange={(e) => setLocationNote(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-4 sm:px-6 py-3 border-t border-[#CCBCA5]/25 bg-[var(--dash-bg)]/90 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-sm font-black text-[#CCBCA5] border-2 border-[#CCBCA5] hover:bg-[#CCBCA5] hover:text-[#1e2223] transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full text-sm font-black bg-[#CCBCA5] text-[#1e2223] hover:bg-[#d9cbb8] shadow-md transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
