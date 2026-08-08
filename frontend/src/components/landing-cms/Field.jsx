"use client";

import React from "react";

export function TextInput({ label, value, onChange, type = "text", className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-70)]">
        {label}
      </span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] text-[var(--dash-text)] text-sm px-3.5 py-2.5 outline-none focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/20 shadow-sm transition-all"
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-70)]">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] text-[var(--dash-text)] text-sm px-3.5 py-2.5 outline-none focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/20 shadow-sm transition-all resize-y"
      />
    </label>
  );
}

export function ColorField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-70)]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl border border-[var(--dash-border)] bg-transparent cursor-pointer p-0.5 shadow-sm"
        />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] text-[var(--dash-text)] text-sm px-3.5 py-2.5 outline-none focus:border-[var(--dash-accent)] font-mono shadow-sm"
        />
      </div>
    </label>
  );
}

export function BiText({ labelEn, labelKn, valueEn, valueKn, onEn, onKn, area }) {
  const Comp = area ? TextArea : TextInput;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Comp label={labelEn || "English"} value={valueEn} onChange={onEn} />
      <Comp label={labelKn || "Kannada"} value={valueKn} onChange={onKn} />
    </div>
  );
}
