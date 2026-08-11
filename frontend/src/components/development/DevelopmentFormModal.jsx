"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaVideo,
  FaImage,
  FaTrashAlt,
} from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import {
  gramPanchayats,
  getVillagesForGp,
  getVillageLabel,
} from "@/data/gramPanchayats";
import { getRecordMedia } from "@/lib/media";
import {
  hasMeaningfulText,
  isTextOnlySymbolsOrEmoji,
} from "@/lib/textValidation";
import {
  confirmEnglishSaveIfNeeded,
  hasKannadaScript,
  toKannadaText,
} from "@/lib/transliterateName";
import KnTextField from "@/components/ui/KnTextField";
import { useEscapeKey } from "@/hooks/useEscapeKey";

const MAX_MEDIA_BYTES = 50 * 1024 * 1024;
const ALLOWED_MEDIA_EXT = /\.(jpe?g|png|webp|gif|mp4|webm|mov)$/i;

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--dash-heading)] mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 py-2 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-text-40)] outline-none focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/25 disabled:opacity-50 disabled:cursor-not-allowed";

function isAllowedMediaFile(file) {
  const type = String(file?.type || "").toLowerCase();
  if (type.startsWith("image/") || type.startsWith("video/")) return true;
  return ALLOWED_MEDIA_EXT.test(file?.name || "");
}

function villageLabels(gp, village) {
  const list = getVillagesForGp(gp);
  const v = list.find((x) => x.name === village);
  return {
    en: v?.name || village || "",
    kn: v?.nameKn || v?.name || village || "",
  };
}

function placeForLang({ locationNote, locationNoteKn, gp, village, lang }) {
  const labels = villageLabels(gp, village);
  if (lang === "kn") {
    if (locationNoteKn?.trim()) return locationNoteKn.trim();
    if (locationNote?.trim()) {
      if (locationNote.trim() === labels.en) return labels.kn;
      return locationNote.trim();
    }
    return labels.kn || "";
  }
  if (locationNote?.trim()) return locationNote.trim();
  if (locationNoteKn?.trim()) {
    if (locationNoteKn.trim() === labels.kn) return labels.en;
    return locationNoteKn.trim();
  }
  return labels.en || "";
}

export default function DevelopmentFormModal({
  open,
  initial,
  gramPanchayat: initialGp,
  village: initialVillage,
  onClose,
  onSave,
}) {
  const { lang, t } = useLanguage();
  const fileInputRef = useRef(null);
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
  const [error, setError] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    setError("");
    setMediaError("");
    setDragOver(false);
    if (initial) {
      const gp = initial.gramPanchayat || initialGp || "";
      const village = initial.village || initialVillage || "";
      setFormGp(gp);
      setFormVillage(village);
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
      setLocationNote(
        placeForLang({
          locationNote: initial.locationNote,
          locationNoteKn: initial.locationNoteKn,
          gp,
          village,
          lang,
        })
      );
      setMedia(getRecordMedia(initial));
    } else {
      const gp = initialGp || "";
      const village = initialVillage || "";
      setFormGp(gp);
      setFormVillage(village);
      setName("");
      setDescription("");
      setDetails("");
      setAmountSanctioned("");
      setYojane("");
      setStatus("Ongoing");
      setBeneficiaries("");
      setDepartment("");
      setLocationNote(
        village ? getVillageLabel(gp, village, lang) || "" : ""
      );
      setMedia([]);
    }
  }, [open, initial, initialGp, initialVillage, lang]);

  if (!open) return null;

  const villages = formGp ? getVillagesForGp(formGp) : [];

  const handleGpChange = (gp) => {
    setFormGp(gp);
    setFormVillage("");
    setLocationNote("");
  };

  const handleVillageChange = (village) => {
    setFormVillage(village);
    if (village) {
      setLocationNote(getVillageLabel(formGp, village, lang) || village);
    } else {
      setLocationNote("");
    }
  };

  const appendFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const rejectedType = files.filter((f) => !isAllowedMediaFile(f));
    const rejectedSize = files.filter(
      (f) => isAllowedMediaFile(f) && f.size > MAX_MEDIA_BYTES
    );
    const accepted = files.filter(
      (f) => isAllowedMediaFile(f) && f.size <= MAX_MEDIA_BYTES
    );

    if (rejectedType.length && !accepted.length && !rejectedSize.length) {
      setMediaError(t.uploadOnlyMedia);
      return;
    }
    if (rejectedSize.length) {
      const first = rejectedSize[0];
      setMediaError(
        typeof t.uploadTooLarge === "function"
          ? t.uploadTooLarge(first.name)
          : `${t.uploadMaxSize} (${first.name})`
      );
      if (!accepted.length) return;
    } else if (rejectedType.length) {
      setMediaError(t.uploadOnlyMedia);
    } else {
      setMediaError("");
    }

    if (!accepted.length) return;

    const next = accepted.map((f) => {
      const isVideo =
        String(f.type || "").startsWith("video/") ||
        /\.(mp4|webm|mov)$/i.test(f.name);
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: URL.createObjectURL(f),
        type: isVideo ? "video" : "image",
        name: f.name,
        file: f,
      };
    });
    setMedia((prev) => [...prev, ...next]);
  };

  const handleFiles = (e) => {
    appendFiles(e.target.files);
    e.target.value = "";
  };

  const removeMedia = (id) => {
    setMedia((prev) => {
      const hit = prev.find((m) => m.id === id);
      if (hit?.url?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(hit.url);
        } catch {
          /* ignore */
        }
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const validateTextFields = () => {
    const required = [
      { value: name, label: t.colName },
      { value: yojane, label: t.colYojane },
    ];
    for (const field of required) {
      if (!String(field.value || "").trim() || !hasMeaningfulText(field.value)) {
        return t.formTextInvalid;
      }
    }
    const optional = [
      description,
      details,
      beneficiaries,
      department,
      locationNote,
    ];
    for (const value of optional) {
      if (isTextOnlySymbolsOrEmoji(value)) return t.formTextInvalid;
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const amount = Number(amountSanctioned);
    if (
      !formGp ||
      !formVillage ||
      !name.trim() ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      !yojane.trim()
    ) {
      setError(t.formFieldRequired);
      return;
    }
    const textErr = validateTextFields();
    if (textErr) {
      setError(textErr);
      return;
    }
    if (
      !confirmEnglishSaveIfNeeded(
        lang,
        [
          name,
          yojane,
          description,
          details,
          beneficiaries,
          department,
          locationNote,
        ],
        t.confirmEnglishSave
      )
    ) {
      return;
    }
    const labels = villageLabels(formGp, formVillage);
    const typed = locationNote.trim();
    let locationNoteEn = typed;
    let locationNoteKn = typed;
    if (lang === "kn") {
      locationNoteKn = typed;
      locationNoteEn =
        typed === labels.kn ? labels.en : initial?.locationNote || typed;
    } else {
      locationNoteEn = typed;
      locationNoteKn =
        typed === labels.en ? labels.kn : initial?.locationNoteKn || typed;
    }

    const nameTrim = name.trim();
    const descriptionTrim = description.trim();
    const images = media.filter((m) => m.type === "image").map((m) => m.url);
    onSave({
      gramPanchayat: formGp,
      village: formVillage,
      name: nameTrim,
      nameKn: hasKannadaScript(nameTrim)
        ? nameTrim
        : toKannadaText(nameTrim),
      description: descriptionTrim,
      descriptionKn: hasKannadaScript(descriptionTrim)
        ? descriptionTrim
        : toKannadaText(descriptionTrim),
      details: details.trim(),
      amountSanctioned: amount,
      yojane: yojane.trim(),
      status,
      statusKn: status === "Completed" ? "ಪೂರ್ಣಗೊಂಡಿದೆ" : "ಚಾಲ್ತಿಯಲ್ಲಿದೆ",
      beneficiaries: beneficiaries.trim(),
      department: department.trim(),
      locationNote: locationNoteEn,
      locationNoteKn,
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
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[var(--dash-panel)] border-2 border-[var(--dash-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[var(--dash-heading)] shrink-0">
          <h2 className="text-base sm:text-lg font-black text-[var(--dash-panel)]">
            {initial ? t.editRecord : t.addRecord}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--dash-panel)]/80 hover:bg-[var(--dash-panel)]/15"
            aria-label={t.close}
          >
            <FaTimes />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col min-h-0 flex-1 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row min-h-0 flex-1 overflow-y-auto">
            <div className="md:w-[40%] shrink-0 p-4 border-b md:border-b-0 md:border-r border-[var(--dash-border-soft)] bg-[var(--dash-bg)] flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-heading)] mb-1">
                  {t.colMedia}
                </p>
                <p className="text-[11px] text-[var(--dash-text-50)] mb-2">
                  {t.uploadMediaHint}
                </p>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    appendFiles(e.dataTransfer.files);
                  }}
                  className={`flex flex-col items-center justify-center gap-2 w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all px-4 py-7 min-h-[140px] ${
                    dragOver
                      ? "border-[var(--dash-accent)] bg-[var(--dash-accent)]/10 scale-[1.01]"
                      : "border-[var(--dash-border)] bg-[var(--dash-panel)] hover:border-[var(--dash-accent)] hover:bg-[var(--dash-hover)]"
                  }`}
                >
                  <span className="w-12 h-12 rounded-full bg-[var(--dash-accent)]/15 text-[var(--dash-accent)] flex items-center justify-center text-xl">
                    <FaCloudUploadAlt />
                  </span>
                  <span className="text-sm font-black text-[var(--dash-text)] text-center">
                    {t.uploadImages}
                  </span>
                  <span className="text-[11px] text-[var(--dash-text-55)] text-center">
                    {t.uploadDropHint}
                  </span>
                  <span className="text-[10px] font-bold tracking-wide text-[var(--dash-text-40)] text-center">
                    {t.uploadFileTypes}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov"
                    multiple
                    onChange={handleFiles}
                    className="hidden"
                  />
                </div>

                {mediaError ? (
                  <p className="mt-2 text-xs text-red-600 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">
                    {mediaError}
                  </p>
                ) : (
                  <p className="mt-2 text-[10px] text-[var(--dash-text-40)]">
                    {t.uploadMaxSize}
                  </p>
                )}
              </div>

              {media.length > 0 ? (
                <div className="space-y-3">
                  {photos.length > 0 ? (
                    <div>
                      <p className="text-[10px] font-bold text-[var(--dash-heading)] mb-1.5 flex items-center gap-1.5">
                        <FaImage /> {t.mediaPhotos} ({photos.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((m) => (
                          <div
                            key={m.id}
                            className="relative aspect-square rounded-xl overflow-hidden border border-[var(--dash-border-soft)] bg-[var(--dash-panel)]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={m.url}
                              alt={m.name || ""}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeMedia(m.id)}
                              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-500"
                              title={t.removeImage}
                              aria-label={t.removeImage}
                            >
                              <FaTrashAlt className="text-[10px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {videos.length > 0 ? (
                    <div>
                      <p className="text-[10px] font-bold text-[var(--dash-heading)] mb-1.5 flex items-center gap-1.5">
                        <FaVideo /> {t.mediaVideos} ({videos.length})
                      </p>
                      <div className="space-y-2">
                        {videos.map((m) => (
                          <div
                            key={m.id}
                            className="relative rounded-xl overflow-hidden border border-[var(--dash-border-soft)] bg-black/80"
                          >
                            <video
                              src={m.url}
                              className="w-full h-28 object-cover"
                              muted
                              playsInline
                              controls
                            />
                            <button
                              type="button"
                              onClick={() => removeMedia(m.id)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-500"
                              title={t.removeImage}
                              aria-label={t.removeImage}
                            >
                              <FaTrashAlt className="text-[10px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

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
                  onChange={(e) => handleVillageChange(e.target.value)}
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

              <KnTextField
                label={t.colName}
                value={name}
                onChange={setName}
                placeholder={t.namePlaceholder}
                required
              />

              <KnTextField
                label={t.colYojane}
                value={yojane}
                onChange={setYojane}
                placeholder={t.yojanePlaceholder}
                required
              />

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
                <KnTextField
                  label={t.colDescription}
                  value={description}
                  onChange={setDescription}
                  multiline
                  rows={2}
                  placeholder={t.descriptionPlaceholder}
                />
              </div>

              <div className="sm:col-span-2">
                <KnTextField
                  label={t.colMoreDetails}
                  value={details}
                  onChange={setDetails}
                  multiline
                  rows={2}
                  placeholder={t.descriptionPlaceholder}
                />
              </div>

              <KnTextField
                label={t.colBeneficiaries}
                value={beneficiaries}
                onChange={setBeneficiaries}
              />

              <KnTextField
                label={t.colDepartment}
                value={department}
                onChange={setDepartment}
              />

              <div className="sm:col-span-2">
                <KnTextField
                  label={t.colLocation}
                  value={locationNote}
                  onChange={setLocationNote}
                  placeholder={
                    lang === "kn"
                      ? "ಉದಾ. ಸಂಕ್ಲಾಪುರ ಮುಖ್ಯ ರಸ್ತೆ"
                      : "e.g. Sanklapur main road"
                  }
                />
              </div>

              {error ? (
                <div className="sm:col-span-2">
                  <p className="text-sm text-red-600 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">
                    {error}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-4 sm:px-6 py-3 border-t border-[var(--dash-border-soft)] bg-[var(--dash-bg)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-sm font-black text-[var(--dash-text)] border-2 border-[var(--dash-border)] hover:bg-[var(--dash-hover)] transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full text-sm font-black bg-[var(--dash-accent)] text-white hover:opacity-90 shadow-md transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
