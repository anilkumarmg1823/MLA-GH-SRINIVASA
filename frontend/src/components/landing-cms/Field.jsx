"use client";

export function TextInput({ label, value, onChange, type = "text", className = "" }) {
  return (
    <label className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5]">
        {label}
      </span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-input)] text-[var(--dash-text)] text-sm px-3 py-2 outline-none focus:border-[#CCBCA5]"
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3, className = "" }) {
  return (
    <label className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5]">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-input)] text-[var(--dash-text)] text-sm px-3 py-2 outline-none focus:border-[#CCBCA5] resize-y"
      />
    </label>
  );
}

export function ColorField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-black uppercase tracking-wider text-[#CCBCA5]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-[#CCBCA5]/40 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-[#CCBCA5]/30 bg-[var(--dash-input)] text-[var(--dash-text)] text-sm px-3 py-2 outline-none focus:border-[#CCBCA5] font-mono"
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
