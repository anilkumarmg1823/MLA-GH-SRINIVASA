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
      <span className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5]">
        {label}
      </span>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-[#CCBCA5]/30 bg-[var(--dash-bg)] shrink-0">
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
            className="w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-input)] text-[var(--dash-text)] text-xs px-3 py-2 outline-none focus:border-[#CCBCA5]"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-full bg-[#CCBCA5] text-[#1e2223] text-xs font-black hover:bg-[#d9cbb8] disabled:opacity-60"
            >
              {busy ? "Uploading…" : "Upload"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-3 py-1.5 rounded-full border border-[#CCBCA5]/40 text-[#CCBCA5] text-xs font-black"
              >
                Clear
              </button>
            ) : null}
          </div>
          {error ? <p className="text-xs text-rose-400 font-bold">{error}</p> : null}
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
