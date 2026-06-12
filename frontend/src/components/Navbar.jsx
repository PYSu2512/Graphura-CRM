import { memo, useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Menu,
  PanelLeft,
  Search,
  LogIn,
  LogOut,
  Pause,
  Play,
  Clock,
  RotateCcw,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAttendance, formatElapsed } from "../context/AttendanceContext";
import NotificationBell from "./NotificationBell";
import UserAvatar from "./shared/UserAvatar";

const ROLE_LABELS = {
  "super-admin": { short: "SA", label: "Super Admin" },
  admin: { short: "AD", label: "Admin" },
  "sales-manager": { short: "SM", label: "Sales Manager" },
  "sales-team-leader": { short: "STL", label: "Sales Team Leader" },
  "sales-executive": { short: "SE", label: "Sales Executive" },
  finance: { short: "FN", label: "Finance" },
  "management-manager": { short: "MM", label: "Management Manager" },
  "management-team-leader": { short: "ML", label: "Management Team Leader" },
  "management-employee": { short: "ME", label: "Management Employee" },
  client: { short: "CL", label: "Client" },
};

// Map URL path segment → backend role string (for NotificationBell)
const PATH_TO_BACKEND_ROLE = {
  "sales-team-leader": "SALES_TL",
  "sales-executive": "SALES_EXECUTIVE",
  "sales-manager": "SALES_MANAGER",
  "management-manager": "MANAGEMENT_MANAGER",
  "management-team-leader": "MANAGEMENT_TL",
  "management-employee": "MANAGEMENT_EMPLOYEE",
  finance: "FINANCE_MANAGER",
  admin: "ADMIN",
  "super-admin": "SUPER_ADMIN",
};

const normalizeBackendRole = (value) => {
  if (!value || typeof value !== "string") return null;
  const role = value.trim();
  const direct = {
    "sales-team-leader": "SALES_TL",
    "sales-executive": "SALES_EXECUTIVE",
    "sales-manager": "SALES_MANAGER",
    "management-manager": "MANAGEMENT_MANAGER",
    "management-team-leader": "MANAGEMENT_TL",
    "management-employee": "MANAGEMENT_EMPLOYEE",
    finance: "FINANCE_MANAGER",
    admin: "ADMIN",
    "super-admin": "SUPER_ADMIN",
  };
  return direct[role.toLowerCase()] || role.toUpperCase().replace(/-/g, "_");
};

function useRole() {
  const { pathname } = useLocation();
  const roles = [
    "super-admin",
    "admin",
    "sales-manager",
    "sales-team-leader",
    "sales-executive",
    "finance",
    "management-manager",
    "management-team-leader",
    "management-employee",
    "client",
  ];
  return roles.find((r) => pathname.startsWith(`/${r}`)) ?? "admin";
}

// ── Mini Attendance Widget (Navbar) ───────────────────────────────────────────
function NavAttendance() {
  const { status, elapsed, pct, checkIn, pause, resume, checkOut } =
    useAttendance();
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);

  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
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
    pct >= 100
      ? "bg-emerald-500"
      : pct >= 75
        ? "bg-blue-500"
        : pct >= 40
          ? "bg-amber-400"
          : "bg-rose-400";

  const statusColor =
    status === "active"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : status === "paused"
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : status === "done"
          ? "text-blue-600 bg-blue-50 border-blue-200"
          : "text-slate-500 bg-slate-100 border-slate-200";

  const dropdown = open
    ? createPortal(
        <div
          id="att-dropdown-portal"
          className="fixed w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/60 overflow-hidden"
          style={{ top: dropPos.top, right: dropPos.right, zIndex: 9999 }}
        >
          <div className="h-1 w-full bg-gradient-to-r from-[#2a465a] via-blue-400 to-emerald-400" />
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-[#2a465a] uppercase tracking-widest">
                {status === "idle" && "Not checked in"}
                {status === "active" && "Session active"}
                {status === "paused" && "Session paused"}
                {status === "done" && "Session done ✓"}
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
                <button
                  onClick={() => {
                    checkIn();
                    setOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#2a465a] text-white text-xs font-bold hover:bg-[#1e3a52] transition active:scale-95 shadow-md shadow-[#2a465a]/20"
                >
                  <LogIn size={13} /> Check In
                </button>
              )}
              {status === "active" && (
                <>
                  <button
                    onClick={pause}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition active:scale-95"
                  >
                    <Pause size={13} /> Pause
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setShowConfirm(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition active:scale-95"
                  >
                    <LogOut size={13} /> Check Out
                  </button>
                </>
              )}
              {status === "paused" && (
                <>
                  <button
                    onClick={resume}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition active:scale-95"
                  >
                    <Play size={13} /> Resume
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setShowConfirm(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition active:scale-95"
                  >
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
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openDropdown}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 ${statusColor}`}
      >
        <Clock
          size={13}
          className={status === "active" ? "animate-pulse" : ""}
        />
        <span className="font-black tabular-nums">
          {formatElapsed(elapsed)}
        </span>
        {status === "active" && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </button>
      {dropdown}
      {showConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                  <LogOut size={20} className="text-rose-600" />
                </div>
                <div>
                  <p className="text-base font-black text-[#2a465a]">
                    Confirm Check Out
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You have worked {formatElapsed(elapsed)} today
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-medium leading-relaxed">
                ⚠️ <strong>Need a break?</strong> Use <strong>Pause</strong>{" "}
                instead.
                <br />
                <span className="text-amber-700 text-xs mt-1 block">
                  Once you check out, you <strong>cannot check in again</strong>{" "}
                  for today.
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    pause();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition active:scale-95"
                >
                  <Pause size={13} className="inline mr-1" /> Pause
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    checkOut();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition active:scale-95"
                >
                  <LogOut size={13} className="inline mr-1" /> Check Out
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function getStoredProfile() {
  try {
    const storedKeys = [
      { key: "user", storage: sessionStorage },
      { key: "admin", storage: sessionStorage },
      { key: "superAdmin", storage: sessionStorage },
    ];

    for (const { key, storage } of storedKeys) {
      const raw = storage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function getProfileDisplayName(profile) {
  if (!profile) return "";
  return (
    profile.fullName ||
    profile.name ||
    profile.firstName ||
    profile.email ||
    "Profile"
  );
}

function getProfileAvatar(profile) {
  if (!profile) return null;
  return (
    profile.avatarUrl ||
    profile.photo ||
    profile.profilePic ||
    profile.picture ||
    null
  );
}

function Navbar({ onToggleDesktop, onToggleMobile }) {
  const navigate = useNavigate();
  const role = useRole();
  const storedProfile = useMemo(() => getStoredProfile(), []);
  const displayName = getProfileDisplayName(storedProfile);
  const avatarUrl = getProfileAvatar(storedProfile);
  const { short, label } = ROLE_LABELS[role] ?? ROLE_LABELS.admin;
  const profilePath = [
    "super-admin",
    "admin",
    "sales-manager",
    "sales-team-leader",
    "management-manager",
    "management-team-leader",
    "management-employee",
    "sales-executive",
    "client",
    "finance",
  ].includes(role)
    ? `/${role}/profile`
    : "/admin/profile";

  // Derive backend role string for NotificationBell
  const backendRole = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.role) return normalizeBackendRole(parsed.role);
      }
    } catch {
      // ignore
    }
    return PATH_TO_BACKEND_ROLE[role] || normalizeBackendRole(role);
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
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* ── Attendance mini widget ── */}
        {/* Hide timer for Admin, Super Admin and Client panels */}
        {!["admin", "super-admin", "client"].includes(role) && <NavAttendance />}

        {!["client"].includes(role) && <NotificationBell userRole={backendRole} />}

        <button
          type="button"
          onClick={() => navigate(profilePath)}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-1.5 py-1.5 shadow-sm shadow-slate-200/40 transition duration-200 hover:border-slate-300 hover:bg-slate-50"
          aria-label="Go to Profile"
        >
          <UserAvatar
            name={displayName || label}
            src={avatarUrl}
            size={32}
            className="shrink-0"
          />
          <span className="hidden text-sm pr-1.5 font-medium text-slate-700 sm:block">
            {label}
          </span>
        </button>
      </div>
    </div>
  );
}

export default memo(Navbar);
