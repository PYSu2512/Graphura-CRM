/**
 * DatePicker — custom calendar date picker
 *
 * Props:
 *   label      string          — field label (optional)
 *   value      string          — selected date in "YYYY-MM-DD" format
 *   onChange   (dateStr) => void — called with "YYYY-MM-DD" string
 *   placeholder string         — shown when no date selected
 *   disabled   bool
 *   minDate    string          — "YYYY-MM-DD" minimum selectable date
 *   maxDate    string          — "YYYY-MM-DD" maximum selectable date
 *   id         string
 */

import { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

const DAYS   = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const toYMD = (d) => {
  if (!d) return null;
  const dt = new Date(d + "T00:00:00");
  return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() };
};

const fmt = (dateStr) => {
  if (!dateStr) return "";
  const { y, m, d } = toYMD(dateStr);
  return `${String(d).padStart(2,"0")} ${MONTHS[m].slice(0,3)} ${y}`;
};

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay    = (y, m) => new Date(y, m, 1).getDay();

export default function DatePicker({
  label,
  value = "",
  onChange,
  placeholder = "Select date",
  disabled = false,
  minDate,
  maxDate,
  id,
}) {
  const now     = new Date();
  const sel     = toYMD(value);

  const [open,     setOpen]     = useState(false);
  const [viewYear, setViewYear] = useState(sel?.y ?? now.getFullYear());
  const [viewMonth,setViewMonth]= useState(sel?.m ?? now.getMonth());
  const [mode,     setMode]     = useState("day"); // "day" | "month" | "year"

  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync view when value changes externally
  useEffect(() => {
    if (sel) { setViewYear(sel.y); setViewMonth(sel.m); }
  }, [value]);

  const selectDate = (y, m, d) => {
    const str = `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    if (minDate && str < minDate) return;
    if (maxDate && str > maxDate) return;
    onChange?.(str);
    setOpen(false);
    setMode("day");
  };

  const clearDate = (e) => { e.stopPropagation(); onChange?.(""); };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDay(viewYear, viewMonth);

  // Year range for year picker (±6 around current view)
  const yearStart = viewYear - 6;
  const years     = Array.from({ length: 13 }, (_, i) => yearStart + i);

  const isDisabledDay = (y, m, d) => {
    const str = `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    if (minDate && str < minDate) return true;
    if (maxDate && str > maxDate) return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={ref}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`
          relative w-full flex items-center gap-3 px-4 py-3.5
          rounded-2xl border text-sm font-medium text-left
          transition duration-200
          ${disabled
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
            : open
              ? "border-[#2a465a]/40 bg-white ring-2 ring-[#2a465a]/20 text-[#2a465a]"
              : "border-slate-200 bg-slate-50/90 text-[#2a465a] hover:border-[#2a465a]/30 hover:bg-white"
          }
        `}
      >
        <CalendarDays size={17} className={`shrink-0 ${value ? "text-[#2a465a]" : "text-slate-400"}`} />
        <span className={`flex-1 truncate ${value ? "text-[#2a465a]" : "text-slate-400"}`}>
          {value ? fmt(value) : placeholder}
        </span>
        {value && !disabled && (
          <span
            onClick={clearDate}
            className="shrink-0 w-5 h-5 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition cursor-pointer"
          >
            <X size={11} />
          </span>
        )}
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80 overflow-hidden"
          style={{ marginTop: "calc(3.5rem + 0.5rem)" }}
        >
          {/* ── Day view ── */}
          {mode === "day" && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode("month")}
                  className="text-sm font-black text-[#2a465a] hover:text-[#1e3a52] transition flex items-center gap-1"
                >
                  {MONTHS[viewMonth]} {viewYear}
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={prevMonth}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#2a465a] transition">
                    <ChevronLeft size={15} />
                  </button>
                  <button type="button" onClick={nextMonth}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#2a465a] transition">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const isToday   = day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
                  const isSelected= sel && sel.d === day && sel.m === viewMonth && sel.y === viewYear;
                  const disabled  = isDisabledDay(viewYear, viewMonth, day);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectDate(viewYear, viewMonth, day)}
                      className={`
                        aspect-square w-full flex items-center justify-center rounded-xl text-xs font-semibold
                        transition duration-150
                        ${disabled
                          ? "text-slate-300 cursor-not-allowed"
                          : isSelected
                            ? "bg-[#2a465a] text-white shadow-md shadow-[#2a465a]/30 font-black"
                            : isToday
                              ? "border-2 border-[#2a465a] text-[#2a465a] font-black hover:bg-[#2a465a]/10"
                              : "text-slate-700 hover:bg-[#2a465a]/10 hover:text-[#2a465a]"
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                <button type="button" onClick={clearDate}
                  className="text-xs font-bold text-slate-400 hover:text-rose-500 transition">
                  Clear
                </button>
                <button type="button"
                  onClick={() => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); }}
                  className="text-xs font-bold text-[#2a465a] hover:underline transition">
                  Today
                </button>
              </div>
            </>
          )}

          {/* ── Month view ── */}
          {mode === "month" && (
            <>
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
                <button type="button" onClick={() => setMode("year")}
                  className="text-sm font-black text-[#2a465a] hover:text-[#1e3a52] transition flex items-center gap-1">
                  {viewYear}
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setViewYear(y => y - 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
                    <ChevronLeft size={15} />
                  </button>
                  <button type="button" onClick={() => setViewYear(y => y + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-4">
                {MONTHS.map((mn, mi) => {
                  const isCurrentMonth = mi === now.getMonth() && viewYear === now.getFullYear();
                  const isSelected     = sel && sel.m === mi && sel.y === viewYear;
                  return (
                    <button key={mn} type="button"
                      onClick={() => { setViewMonth(mi); setMode("day"); }}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? "bg-[#2a465a] text-white shadow-md"
                          : isCurrentMonth
                            ? "border-2 border-[#2a465a] text-[#2a465a]"
                            : "text-slate-600 hover:bg-[#2a465a]/10 hover:text-[#2a465a]"
                      }`}>
                      {mn.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Year view ── */}
          {mode === "year" && (
            <>
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-black text-[#2a465a]">{yearStart} – {yearStart + 12}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setViewYear(y => y - 13)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
                    <ChevronLeft size={15} />
                  </button>
                  <button type="button" onClick={() => setViewYear(y => y + 13)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-4">
                {years.map(yr => {
                  const isCurrentYear = yr === now.getFullYear();
                  const isSelected    = sel && sel.y === yr;
                  return (
                    <button key={yr} type="button"
                      onClick={() => { setViewYear(yr); setMode("month"); }}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? "bg-[#2a465a] text-white shadow-md"
                          : isCurrentYear
                            ? "border-2 border-[#2a465a] text-[#2a465a]"
                            : "text-slate-600 hover:bg-[#2a465a]/10 hover:text-[#2a465a]"
                      }`}>
                      {yr}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
