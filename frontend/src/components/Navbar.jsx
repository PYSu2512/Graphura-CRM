import { memo, useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Menu, PanelLeft, Search, LogIn, LogOut, Pause, Play, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAttendance, formatElapsed } from "../context/AttendanceContext";
import NotificationBell from "./NotificationBell";

const ROLE_LABELS = {
  "super-admin":         { short: "SA",  label: "Super Admin"           },
  admin:                 { short: "AD",  label: "Admin"                 },
  "sales-manager":       { short: "SM",  label: "Sales Manager"         },
  "sales-team-leader":   { short: "STL", label: "Sales Team Leader"     },
  "sales-executive":     { short: "SE",  label: "Sales Executive"       },
  finance:               { short: "FN",  label: "Finance"               },
  "management-manager":  { short: "MM",  label: "Management Manager"    },
  "management-leader":   { short: "ML",  label: "Management Team Leader"},
  "management-employee": { short: "ME",  label: "Management Employee"   },
  client:                { short: "CL",  label: "Client"                },
};

// Map URL path segment → backend role string (for NotificationBell)
const PATH_TO_BACKEND_ROLE = {
  "sales-team-leader":   "SALES_TL",
  "sales-executive":     "SALES_EXECUTIVE",
  "sales-manager":       "SALES_MANAGER",
  admin:                 "ADMIN",
  "super-admin":         "SUPER_ADMIN",
};

function useRole() {
  const { pathname } = useLocation();
  const roles = [
    "super-admin","admin","sales-manager","sales-team-leader",
    "sales-executive","finance","management-manager",
    "management-leader","management-employee","client",
  ];
  return roles.find((r) => pathname.startsWith(`/${r}`)) ?? "admin";
}

// ── Mini Attendance Widget (Navbar) ───────────────────────────────────────────
function NavAttendance() {
  const { status, elapsed, pct, checkIn, pause, resume, checkOut } = useAttendance();
  const [open,        setOpen]        = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dropPos,     setDropPos]     = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);

  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        const portal = document.getElementById("att-dropdown-portal");
        if (portal && portal.contains(e.target)) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const barColor =
    pct >= 100 ? "bg-emerald-500" :
    pct >= 75  ? "bg-blue-500"    :
    pct >= 40  ? "bg-amber-400"   : "bg-rose-400";

  const statusColor =
    status === "active" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    status === "paused" ? "text-amber-600 bg-amber-50 border-amber-200"       :
    status === "done"   ? "text-blue-600 bg-blue-50 border-blue-200"          :
                          "text-slate-500 bg-slate-100 border-slate-200";

  const dropdown = open ? createPortal(
    <div
      id="att-dropdown-portal"
      className="fixed w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/60 overflow-hidden"
      style={{ top: dropPos.top, right: dropPos.right, zIndex: 9999 }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#2a465a] via-blue-400 to-emerald-400" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-[#2a465a] uppercase tracking-widest">
            {status === "idle"   && "Not checked in"}
            {status === "active" && "Session active"}
            {status === "paused" && "Session paused"}
            {status === "done"   && "Session done ✓"}
          </p>
          <span className="text-lg font-black text-[#2a465a] tabular-nums">
            {formatElapsed(elapsed)}
          </span>
        </div>
        <div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-1 text-right">
            {pct.toFixed(1)}% of 8h target
          </p>
        </div>
        <div className="flex gap-2">
          {status === "idle" && (
            <button onClick={() => { checkIn(); setOpen(false); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#2a465a] text-white text-xs font-bold hover:bg-[#1e3a52] transition active:scale-95 shadow-md shadow-[#2a465a]/20">
              <LogIn size={13} /> Check In
            </button>
          )}
          {status === "active" && (
            <>
              <button onClick={pause}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition active:scale-95">
                <Pause size={13} /> Pause
              </button>
              <button onClick={() => { setOpen(false); setShowConfirm(true); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition active:scale-95">
                <LogOut size={13} /> Check Out
              </button>
            </>
          )}
          {status === "paused" && (
            <>
              <button onClick={resume}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition active:scale-95">
                <Play size={13} /> Resume
              </button>
              <button onClick={() => { setOpen(false); setShowConfirm(true); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition active:scale-95">
                <LogOut size={13} /> Check Out
              </button>
            </>
          )}
          {status === "done" && (
            <div className="text-center text-xs text-slate-500 font-semibold py-1">
              Checked out for today
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openDropdown}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 ${statusColor}`}
      >
        <Clock size={13} className={status === "active" ? "animate-pulse" : ""} />
        <span className="font-black tabular-nums">{formatElapsed(elapsed)}</span>
        {status === "active" && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </button>
      {dropdown}
      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-4 z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <LogOut size={20} className="text-rose-600" />
              </div>
              <div>
                <p className="text-base font-black text-[#2a465a]">Confirm Check Out</p>
                <p className="text-xs text-slate-500 mt-0.5">You have worked {formatElapsed(elapsed)} today</p>
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-medium leading-relaxed">
              ⚠️ <strong>Need a break?</strong> Use <strong>Pause</strong> instead.<br />
              <span className="text-amber-700 text-xs mt-1 block">
                Once you check out, you <strong>cannot check in again</strong> for today.
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition active:scale-95">
                Cancel
              </button>
              <button onClick={() => { setShowConfirm(false); pause(); }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition active:scale-95">
                <Pause size={13} className="inline mr-1" /> Pause
              </button>
              <button onClick={() => { setShowConfirm(false); checkOut(); }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition active:scale-95">
                <LogOut size={13} className="inline mr-1" /> Check Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ onToggleDesktop, onToggleMobile }) {
  const role = useRole();
  const { short, label } = ROLE_LABELS[role] ?? ROLE_LABELS.admin;

  // Derive backend role string for NotificationBell
  const backendRole = useMemo(() => {
    // Try sessionStorage first (most reliable)
    try {
      const stored = sessionStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.role) return parsed.role;
      }
    } catch { /* ignore */ }
    // Fallback: derive from URL path
    return PATH_TO_BACKEND_ROLE[role] || null;
  }, [role]);

  return (
    <div className="flex h-16 w-full items-center justify-between">

      {/* Left */}
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onToggleDesktop}
          className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700"
          title="Toggle sidebar"
        >
          <PanelLeft size={20} />
        </button>
        <button
          onClick={onToggleMobile}
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700"
          title="Open menu"
        >
          <Menu size={22} />
        </button>
        <div className="hidden items-center gap-2 rounded-full bg-gray-100/80 px-4 py-1.5 text-gray-500 transition-colors duration-150 focus-within:bg-gray-100 md:flex">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search anywhere..."
            className="w-64 border-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* ── Attendance mini widget ── */}
        <NavAttendance />

        {/* ── Notification Bell — real API for TL/Executive, static for others ── */}
        <NotificationBell userRole={backendRole} />

        <div className="flex cursor-pointer items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
            {short}
          </div>
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(Navbar);
