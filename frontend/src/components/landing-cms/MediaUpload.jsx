"use client";

import React, { useRef, useState } from "react";
import { uploadLandingFile } from "@/lib/landingContentStore";
import MediaImage from "./MediaImage";

export default function MediaUpload({ label, value, onChange, accept = "image/*" }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = async (file) => {
    setError("");
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadLandingFile(file);
      onChange(typeof url === "string" ? url : url?.url || "");
    } catch (e) {
      setError(e.message === "FILE_TOO_LARGE" ? "Max 4 MB" : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-70)]">
        {label}
      </span>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-[var(--dash-border)] bg-[var(--dash-panel)] shadow-sm shrink-0 flex items-center justify-center">
          {accept.includes("video") && value && !String(value).startsWith("data:image") ? (
            <video src={value} className="absolute inset-0 w-full h-full object-cover" muted />
          ) : (
            <MediaImage src={value} alt="" fill className="object-cover" sizes="112px" />
          )}
        </div>
        <div className="flex-1 w-full space-y-2">
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/path or data URL"
            className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] text-[var(--dash-text)] text-xs px-3.5 py-2 outline-none focus:border-[var(--dash-accent)] shadow-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-full bg-[var(--dash-accent)] text-white text-xs font-bold hover:opacity-90 shadow-sm transition-all disabled:opacity-60"
            >
              {busy ? "Uploading…" : "Upload"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-3.5 py-1.5 rounded-full border border-[var(--dash-border)] text-[var(--dash-text-70)] text-xs font-bold hover:bg-[var(--dash-hover)] transition-all"
              >
                Clear
              </button>
            ) : null}
          </div>
          {error ? <p className="text-xs text-rose-500 font-bold">{error}</p> : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
