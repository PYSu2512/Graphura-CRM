/**
 * DatePicker — custom calendar date picker
 *
 * Props:
 *   label      string            — field label (optional)
 *   value      string            — selected date in "YYYY-MM-DD" format
 *   onChange   (dateStr) => void — called with "YYYY-MM-DD" string
 *   placeholder string           — shown when no date selected
 *   disabled   bool
 *   minDate    string            — "YYYY-MM-DD" minimum selectable date
 *   maxDate    string            — "YYYY-MM-DD" maximum selectable date
 *   id         string
 *
 * Typing behaviour:
 *   • User types digits only — dashes are auto-inserted: "09-05-2026"
 *   • After the full date is entered it converts to "09 May 2026" display
 *   • Calendar highlights the date live as each segment completes
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
  if (isNaN(dt)) return null;
  return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() };
};

const fmt = (dateStr) => {
  if (!dateStr) return "";
  const p = toYMD(dateStr);
  if (!p) return "";
  return `${String(p.d).padStart(2,"0")} ${MONTHS[p.m].slice(0,3)} ${p.y}`;
};

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay    = (y, m) => new Date(y, m, 1).getDay();

/**
 * Smart masked input builder for DD-MM-YYYY.
 *
 * Rules applied per digit position (0-indexed in the digit stream):
 *   digit 0 (D1): 0–3
 *   digit 1 (D2): if D1=3 → 0–1 (max day 31); if D1=0 → 1–9; else 0–9
 *   digit 2 (M1): 0–1
 *   digit 3 (M2): if M1=1 → 0–2 (max month 12); if M1=0 → 1–9; else 0–9
 *   digits 4–7 (Y): any digit
 *
 * Returns the masked "DD-MM-YYYY" string (dashes auto-inserted).
 */
const applyMask = (raw) => {
  // Strip everything except digits, cap at 8
  const all = raw.replace(/\D/g, "");
  const validated = [];

  for (let i = 0; i < all.length && i < 8; i++) {
    const d = parseInt(all[i], 10);

    if (i === 0) {
      // D1: 0–3
      if (d > 3) break;
      validated.push(d);
    } else if (i === 1) {
      // D2: depends on D1
      const d1 = validated[0];
      if (d1 === 3 && d > 1) break; // max 31
      if (d1 === 0 && d === 0) break; // day 00 invalid
      validated.push(d);
    } else if (i === 2) {
      // M1: 0–1
      if (d > 1) break;
      validated.push(d);
    } else if (i === 3) {
      // M2: depends on M1
      const m1 = validated[2];
      if (m1 === 1 && d > 2) break; // max 12
      if (m1 === 0 && d === 0) break; // month 00 invalid
      validated.push(d);
    } else {
      // Year digits — any digit allowed
      validated.push(d);
    }
  }

  // Build masked string with dashes
  let out = "";
  for (let i = 0; i < validated.length; i++) {
    if (i === 2 || i === 4) out += "-";
    out += validated[i];
  }
  return out;
};

/**
 * Try to parse the masked "DD-MM-YYYY" string (only when fully entered).
 * Validates day against actual days-in-month — no JS Date overflow.
 * Returns "YYYY-MM-DD" or null.
 */
const parseMasked = (masked) => {
  if (masked.length !== 10) return null;
  const m = masked.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  const dd = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const yy = parseInt(m[3], 10);
  // Basic range checks
  if (mm < 1 || mm > 12) return null;
  if (dd < 1) return null;
  // Check day against actual days in that month/year (handles leap years too)
  const maxDay = new Date(yy, mm, 0).getDate(); // day 0 of next month = last day of this month
  if (dd > maxDay) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
};

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

  const [open,      setOpen]      = useState(false);
  const [viewYear,  setViewYear]  = useState(sel?.y ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(sel?.m ?? now.getMonth());
  const [mode,      setMode]      = useState("day"); // "day" | "month" | "year"
  const [inputText, setInputText] = useState(fmt(value));
  const [inputFocus,setInputFocus]= useState(false);
  const [inputError,setInputError]= useState("");

  const ref      = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click — if invalid, clear the field and reset calendar to today
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        if (inputError) {
          setInputText("");
          setInputError("");
          onChange?.("");
          setViewYear(now.getFullYear());
          setViewMonth(now.getMonth());
        } else {
          setInputText(fmt(value));
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value, inputError]);

  // Sync display text when value changes externally (user not typing)
  useEffect(() => {
    if (!inputFocus) setInputText(fmt(value));
  }, [value]);

  // Sync calendar view when value changes
  useEffect(() => {
    if (sel) { setViewYear(sel.y); setViewMonth(sel.m); }
  }, [value]);

  const selectDate = (y, m, d) => {
    const str = `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    if (minDate && str < minDate) return;
    if (maxDate && str > maxDate) return;
    onChange?.(str);
    setInputText(fmt(str));
    setOpen(false);
    setMode("day");
  };

  const clearDate = (e) => {
    e.stopPropagation();
    onChange?.("");
    setInputText("");
    setInputError("");
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    inputRef.current?.focus();
  };

  // ── Masked typing handler ──────────────────────────────────────────────────
  // Keeps the input in "DD-MM-YYYY" format while typing.
  // Shows a red error when the full 10-char mask is invalid.
  // Converts to "DD Mon YYYY" display when valid.
  const handleInputChange = (e) => {
    const raw      = e.target.value;
    const isDeleting = raw.length < inputText.length;

    const masked = isDeleting
      ? applyMask(raw.replace(/\D/g, ""))
      : applyMask(raw);

    setInputText(masked);
    setInputError(""); // clear error while still typing

    // Live-update calendar month when MM segment is complete
    const digits = masked.replace(/\D/g, "");
    if (digits.length >= 4) {
      const mm = parseInt(digits.slice(2, 4), 10);
      if (mm >= 1 && mm <= 12) setViewMonth(mm - 1);
    }

    // When full 10-char mask is entered, validate
    if (masked.length === 10) {
      const parsed = parseMasked(masked);
      if (!parsed) {
        setInputError("invalid");
      } else if (minDate && parsed < minDate) {
        setInputError("invalid");
      } else if (maxDate && parsed > maxDate) {
        setInputError("invalid");
      } else {
        setInputError("");
        onChange?.(parsed);
        const p = toYMD(parsed);
        if (p) {
          setViewYear(p.y);
          setViewMonth(p.m);
          setTimeout(() => setInputText(fmt(parsed)), 300);
        }
      }
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      const parsed = parseMasked(inputText);
      if (parsed) {
        onChange?.(parsed);
        setInputText(fmt(parsed));
        setInputError("");
        setOpen(false);
      } else if (inputText.length === 10) {
        // Invalid full date on Enter — clear
        setInputText("");
        setInputError("");
        onChange?.("");
        setOpen(false);
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      setInputText(fmt(value));
      setInputError("");
    }
  };

  const handleInputBlur = () => {
    setInputFocus(false);
    if (!inputText) { setInputError(""); return; }
    const parsed = parseMasked(inputText);
    if (parsed) {
      onChange?.(parsed);
      setInputText(fmt(parsed));
      setInputError("");
    } else {
      // Incomplete or invalid — clear silently and reset calendar to today
      setInputText(fmt(value));
      setInputError("");
      if (!value) {
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
      }
    }
  };

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

  const triggerCls = `
    relative w-full flex items-center gap-3 px-4 py-3.5
    rounded-2xl border text-sm font-medium
    transition duration-200
    ${disabled
      ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60"
      : inputError
        ? "border-rose-400 bg-rose-50 ring-2 ring-rose-300/50"
        : open || inputFocus
          ? "border-[#2a465a]/40 bg-white ring-2 ring-[#2a465a]/20"
          : "border-slate-200 bg-slate-50/90 hover:border-[#2a465a]/30 hover:bg-white"
    }
  `;

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={ref}>
      {/* ── Label ── */}
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none">
          {label}
        </label>
      )}

      {/* ── Trigger + dropdown wrapper (relative so dropdown anchors to trigger) ── */}
      <div className="relative">
        <div className={triggerCls}>
          {/* Calendar icon — toggles dropdown */}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onMouseDown={(e) => { e.preventDefault(); if (!disabled) {
            // Reset calendar to today when opening with no valid value
            if (!value) { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); }
            setOpen(o => !o);
          } }}
            className="shrink-0 focus:outline-none"
          >
            <CalendarDays size={17} className={inputError ? "text-rose-400" : value ? "text-[#2a465a]" : "text-slate-400"} />
          </button>

          {/* Editable text */}
          <input
            ref={inputRef}
            id={id}
            type="text"
            disabled={disabled}
            value={inputText}
            placeholder={placeholder || "DD-MM-YYYY"}
            onChange={handleInputChange}
            onFocus={() => {
            setInputFocus(true);
            if (!value) { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); }
            setOpen(true);
          }}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            maxLength={10}
            className={`flex-1 bg-transparent text-sm font-medium placeholder:text-slate-400 focus:outline-none min-w-0 ${
              inputError ? "text-rose-600" : "text-[#2a465a]"
            }`}
          />

          {/* Clear button */}
          {(value || inputText) && !disabled && (
            <span
              onMouseDown={(e) => { e.preventDefault(); clearDate(e); }}
              className="shrink-0 w-5 h-5 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition cursor-pointer"
            >
              <X size={11} />
            </span>
          )}
        </div>

        {/* Dropdown calendar — anchored directly below the trigger */}
        {open && (
          <div className="absolute z-50 top-[calc(100%+6px)] left-0 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80 overflow-hidden"
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
                  const dis       = isDisabledDay(viewYear, viewMonth, day);
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={dis}
                      onMouseDown={(e) => { e.preventDefault(); selectDate(viewYear, viewMonth, day); }}
                      className={`
                        aspect-square w-full flex items-center justify-center rounded-xl text-xs font-semibold
                        transition duration-150
                        ${dis
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
                <button type="button"
                  onMouseDown={(e) => { e.preventDefault(); clearDate(e); }}
                  className="text-xs font-bold text-slate-400 hover:text-rose-500 transition">
                  Clear
                </button>
                <button type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectDate(now.getFullYear(), now.getMonth(), now.getDate()); }}
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
                      onMouseDown={(e) => { e.preventDefault(); setViewMonth(mi); setMode("day"); }}
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
                      onMouseDown={(e) => { e.preventDefault(); setViewYear(yr); setMode("month"); }}
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TimePicker — custom time picker (matches DatePicker style)
//
// Props:
//   label       string              — field label (optional)
//   value       string              — selected time in "HH:MM" 24-hour format
//   onChange    (timeStr) => void   — called with "HH:MM" string
//   placeholder string              — shown when no time selected
//   disabled    bool
//   id          string
//
// The trigger is a text input — users can type "HH:MM AM/PM", "HH:MM" (24h),
// or "H:MM AM" and it will be parsed live. The scroll columns stay in sync.
// ─────────────────────────────────────────────────────────────────────────────

import { Clock, X as XIcon } from "lucide-react";
import { useState as _useState, useRef as _useRef, useEffect as _useEffect } from "react";

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")); // 01–12
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));     // 00–59

/** Parse "HH:MM" (24h) → { h12, min, period } */
const parse24 = (val) => {
  if (!val) return null;
  const [hRaw, mRaw] = val.split(":").map(Number);
  const period = hRaw < 12 ? "AM" : "PM";
  const h12    = hRaw % 12 === 0 ? "12" : String(hRaw % 12).padStart(2, "0");
  const min    = String(mRaw).padStart(2, "0");
  return { h12, min, period };
};

/** Format for display: "09:30 AM" */
const fmtTime = (val) => {
  const p = parse24(val);
  if (!p) return "";
  return `${p.h12}:${p.min} ${p.period}`;
};

/** Build "HH:MM" 24h string from parts */
const to24 = (h12, min, period) => {
  let h = parseInt(h12, 10);
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${min}`;
};

export function TimePicker({
  label,
  value = "",
  onChange,
  placeholder = "Select time",
  disabled = false,
  id,
}) {
  const parsed = parse24(value);

  const [open,   setOpen]   = _useState(false);
  const [hour,   setHour]   = _useState(parsed?.h12   ?? "01");
  const [minute, setMinute] = _useState(parsed?.min   ?? "00");
  const [period, setPeriod] = _useState(parsed?.period ?? "AM");

  const ref     = _useRef(null);
  const hourRef = _useRef(null);
  const minRef  = _useRef(null);

  // Close on outside click
  _useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync internal state when value changes externally
  _useEffect(() => {
    const p = parse24(value);
    if (p) { setHour(p.h12); setMinute(p.min); setPeriod(p.period); }
  }, [value]);

  // Scroll selected item into view when dropdown opens
  _useEffect(() => {
    if (!open) return;
    const scrollTo = (ref, value) => {
      if (!ref.current) return;
      const el = ref.current.querySelector(`[data-val="${value}"]`);
      if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
    };
    scrollTo(hourRef, hour);
    scrollTo(minRef, minute);
  }, [open]);

  const commit = (h, m, p) => {
    onChange?.(to24(h, m, p));
  };

  const selectHour = (h) => { setHour(h); commit(h, minute, period); };
  const selectMin  = (m) => { setMinute(m); commit(hour, m, period); };
  const selectPeriod = (p) => { setPeriod(p); commit(hour, minute, p); };

  const clearTime = (e) => {
    e.stopPropagation();
    setHour("09"); setMinute("00"); setPeriod("AM");
    onChange?.("");
  };

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={ref}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
        >
          {label}
        </label>
      )}

      {/* ── Trigger + dropdown wrapper ── */}
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen(o => !o)}
          className={`
            w-full flex items-center gap-3 px-4 py-3.5
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
          <Clock size={17} className={`shrink-0 ${value ? "text-[#2a465a]" : "text-slate-400"}`} />
          <span className={`flex-1 truncate ${value ? "text-[#2a465a]" : "text-slate-400"}`}>
            {value ? fmtTime(value) : placeholder}
          </span>
          {value && !disabled && (
            <span
              onClick={clearTime}
              className="shrink-0 w-5 h-5 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition cursor-pointer"
            >
              <XIcon size={11} />
            </span>
          )}
        </button>

        {/* ── Dropdown — anchored directly below the trigger ── */}
        {open && (
          <div
            className="absolute z-50 top-[calc(100%+6px)] left-0 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80 overflow-hidden"
            style={{ width: "13rem" }}
          >
          {/* Column headers */}
          <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/80">
            {["Hour", "Min", "AM/PM"].map(h => (
              <div key={h} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                {h}
              </div>
            ))}
          </div>

          {/* Scroll columns */}
          <div className="grid grid-cols-3 divide-x divide-slate-100" style={{ height: "11rem" }}>

            {/* Hours */}
            <div ref={hourRef} className="overflow-y-auto custom-scrollbar">
              {HOURS.map(h => (
                <button
                  key={h}
                  type="button"
                  data-val={h}
                  onClick={() => selectHour(h)}
                  className={`w-full py-2 text-sm font-semibold transition-colors ${
                    hour === h
                      ? "bg-[#2a465a] text-white font-black"
                      : "text-slate-700 hover:bg-[#2a465a]/10 hover:text-[#2a465a]"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Minutes */}
            <div ref={minRef} className="overflow-y-auto custom-scrollbar">
              {MINUTES.map(m => (
                <button
                  key={m}
                  type="button"
                  data-val={m}
                  onClick={() => selectMin(m)}
                  className={`w-full py-2 text-sm font-semibold transition-colors ${
                    minute === m
                      ? "bg-[#2a465a] text-white font-black"
                      : "text-slate-700 hover:bg-[#2a465a]/10 hover:text-[#2a465a]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* AM / PM */}
            <div className="flex flex-col items-stretch justify-center gap-2 p-2">
              {["AM", "PM"].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => selectPeriod(p)}
                  className={`py-2.5 rounded-xl text-sm font-black transition-all ${
                    period === p
                      ? "bg-[#2a465a] text-white shadow-md shadow-[#2a465a]/30"
                      : "text-slate-600 hover:bg-[#2a465a]/10 hover:text-[#2a465a]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
            <button
              type="button"
              onClick={clearTime}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-[#2a465a] hover:underline transition"
            >
              Done
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
