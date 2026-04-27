import React from "react";
import FieldMeta from "./FieldMeta";

const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  note,
  error,
  disabled = false,
}) => (
  <div className="col-span-12 flex flex-col gap-1.5">
    <label className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={4}
      className={`
        w-full rounded-2xl border bg-slate-50/90 px-4 py-3.5 text-sm font-medium text-[#2a465a]
        placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20
        resize-y transition duration-200
        ${error ? "border-rose-300" : "border-slate-200"}
        ${disabled ? "cursor-not-allowed opacity-60" : ""}
      `}
    />
    <FieldMeta note={note} error={error} />
  </div>
);

export default TextAreaField;
