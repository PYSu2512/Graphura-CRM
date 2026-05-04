/**
 * SessionTimer — reusable timer display widget
 *
 * This is a PURE DISPLAY component — it holds NO internal timer state.
 * All state and actions must be passed in as props, typically from a
 * shared context (e.g. AttendanceContext) so the same timer is reflected
 * everywhere it is rendered (Navbar, HRM page, etc.).
 *
 * ── PROPS ────────────────────────────────────────────────────────────────────
 *
 *   label         string    Header label shown above the status text.
 *                           Example: "Today's Attendance", "Break Timer"
 *
 *   targetSeconds number    Target duration in seconds. Default: 8 * 3600 (8h)
 *                           Used only for display (progress bar, milestone labels).
 *
 *   // ── Timer state (from context / parent) ──
 *   status        string    "idle" | "active" | "paused" | "done"
 *   elapsed       number    Elapsed seconds
 *   pct           number    0–100 progress percentage
 *   remaining     number    Remaining seconds
 *   checkInAt     string    Clock-in time string, e.g. "09:02 AM"
 *   checkOutAt    string    Clock-out time string, e.g. "06:01 PM"
 *   targetReached bool      true only when auto-completed at target
 *
 *   // ── Actions (from context / parent) ──
 *   onCheckIn     fn        Called when user clicks Start / Check In
 *   onPause       fn        Called when user clicks Pause
 *   onResume      fn        Called when user clicks Resume
 *   onCheckOut    fn        Called when user confirms Check Out
 *
 * ── USAGE ────────────────────────────────────────────────────────────────────
 *
 *   // Driven by AttendanceContext (shared between Navbar + HRM page)
 *   import { useAttendance, formatElapsed } from "../../context/AttendanceContext";
 *   import SessionTimer from "../../components/shared/SessionTimer";
 *
 *   function AttendanceWidget() {
 *     const ctx = useAttendance();
 *     return (
 *       <SessionTimer
 *         label="Today's Attendance"
 *         targetSeconds={8 * 60 * 60}
 *         {...ctx}
 *         onCheckIn={ctx.checkIn}
 *         onPause={ctx.pause}
 *         onResume={ctx.resume}
 *         onCheckOut={ctx.checkOut}
 *       />
 *     );
 *   }
 *
 *   // Standalone with a custom target (30 min break)
 *   const [breakState, breakActions] = useBreakTimer(30 * 60);
 *   <SessionTimer label="Break Timer" targetSeconds={30 * 60} {...breakState} {...breakActions} />
 */

import { useState } from "react";
import { Clock, LogIn, LogOut, Pause, Play, CheckCircle2, AlertTriangle } from "lucide-react";
import { openModal, closeModal, Modal } from "./Common_Components";

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }

export function formatTimer(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// ── SessionTimer ──────────────────────────────────────────────────────────────
export default function SessionTimer({
  label         = "Session Timer",
  targetSeconds = 8 * 60 * 60,

  // State — all driven by parent/context
  status        = "idle",
  elapsed       = 0,
  pct           = 0,
  remaining,
  checkInAt     = "",
  checkOutAt    = "",
  targetReached = false,

  // Actions
  onCheckIn,
  onPause,
  onResume,
  onCheckOut,
}) {
  const rem = remaining ?? Math.max(targetSeconds - elapsed, 0);

  const MODAL_ID = `session-timer-confirm-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const barColor =
    pct >= 100 ? "bg-emerald-500" :
    pct >= 75  ? "bg-blue-500"    :
    pct >= 40  ? "bg-amber-400"   : "bg-rose-400";

  const timerBadgeCls =
    status === "active" ? "bg-[#2a465a] text-white shadow-lg shadow-[#2a465a]/20" :
    status === "paused" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"  :
    status === "done"   ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                          "bg-slate-100 text-slate-500";

  return (
    <>
      <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
        {/* Gradient top band */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#2a465a] via-blue-400 to-emerald-400" />

        <div className="p-6 flex flex-col gap-5">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-lg font-black text-[#2a465a] mt-0.5">
                {status === "idle"   && "Not started yet"}
                {status === "active" && "Session in progress"}
                {status === "paused" && "Session paused"}
                {status === "done"   && (targetReached ? "Target achieved! 🎉" : "Session ended")}
              </p>
            </div>
            {/* Live timer badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black tabular-nums ${timerBadgeCls}`}>
              <Clock size={15} className={status === "active" ? "animate-pulse" : ""} />
              {formatTimer(elapsed)}
              {status === "active" && (
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              )}
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">
                Progress toward {Math.floor(targetSeconds / 3600)}h target
              </span>
              <span className={`text-xs font-black ${pct >= 100 ? "text-emerald-600" : pct >= 75 ? "text-blue-600" : "text-slate-500"}`}>
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-slate-400">0h</span>
              {status === "active" && (
                <span className="text-[11px] text-slate-400">{formatTimer(rem)} remaining</span>
              )}
              {status === "done" && targetReached && (
                <span className="text-[11px] text-emerald-600 font-bold">Target achieved!</span>
              )}
              <span className="text-[11px] text-slate-400">{Math.floor(targetSeconds / 3600)}h</span>
            </div>
          </div>

          {/* ── Timestamps + action buttons ── */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* Check-in stamp */}
            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border flex-1 min-w-[130px] ${
              checkInAt ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
            }`}>
              <LogIn size={15} className={checkInAt ? "text-emerald-600" : "text-slate-400"} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Check In</p>
                <p className={`text-sm font-black ${checkInAt ? "text-emerald-700" : "text-slate-400"}`}>
                  {checkInAt || "—"}
                </p>
              </div>
            </div>

            {/* Check-out stamp */}
            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border flex-1 min-w-[130px] ${
              checkOutAt ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50"
            }`}>
              <LogOut size={15} className={checkOutAt ? "text-rose-600" : "text-slate-400"} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Check Out</p>
                <p className={`text-sm font-black ${checkOutAt ? "text-rose-700" : "text-slate-400"}`}>
                  {checkOutAt || "—"}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 shrink-0">
              {status === "idle" && (
                <button onClick={onCheckIn}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#2a465a] text-white text-sm font-black shadow-lg shadow-[#2a465a]/25 hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                  <LogIn size={16} /> Check In
                </button>
              )}
              {status === "active" && (
                <>
                  <button onClick={onPause}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 text-white text-sm font-black shadow-lg shadow-amber-500/25 hover:bg-amber-600 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                    <Pause size={16} /> Pause
                  </button>
                  <button onClick={() => openModal(MODAL_ID)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-500 text-white text-sm font-black shadow-lg shadow-rose-500/25 hover:bg-rose-600 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                    <LogOut size={16} /> Check Out
                  </button>
                </>
              )}
              {status === "paused" && (
                <>
                  <button onClick={onResume}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                    <Play size={16} /> Resume
                  </button>
                  <button onClick={() => openModal(MODAL_ID)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-500 text-white text-sm font-black shadow-lg shadow-rose-500/25 hover:bg-rose-600 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                    <LogOut size={16} /> Check Out
                  </button>
                </>
              )}
              {status === "done" && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 text-slate-500 text-sm font-bold">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Checked out for today
                </div>
              )}
            </div>
          </div>

          {/* ── Milestone markers ── */}
          <div className="flex items-center justify-between pt-1">
            {[25, 50, 75, 100].map((mark) => {
              const reached = pct >= mark;
              const hrs     = (targetSeconds * mark / 100 / 3600).toFixed(mark === 100 ? 0 : 1);
              return (
                <div key={mark} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                    reached ? "bg-emerald-500 shadow-md shadow-emerald-500/30" : "bg-slate-100"
                  }`}>
                    {reached && <CheckCircle2 size={13} className="text-white" />}
                  </div>
                  <span className={`text-[10px] font-bold ${reached ? "text-emerald-600" : "text-slate-400"}`}>
                    {hrs}h
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── Check Out Confirmation Modal (Common_Components Modal) ── */}
      <Modal id={MODAL_ID} title="Confirm Check Out" size="md">
        <div className="flex flex-col gap-4">

          {/* Warning icon + elapsed */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-black text-[#2a465a]">You have worked {formatTimer(elapsed)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Are you sure you want to check out?</p>
            </div>
          </div>

          {/* Warning message */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-medium leading-relaxed">
            ⚠️ <strong>Need a break?</strong> Use <strong>Pause</strong> instead — you can resume later.<br />
            <span className="text-amber-700 text-xs mt-1 block">
              Once you check out, you <strong>cannot check in again</strong> for today.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => closeModal(MODAL_ID)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => { closeModal(MODAL_ID); onPause?.(); }}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition active:scale-95"
            >
              <Pause size={13} className="inline mr-1" /> Pause Instead
            </button>
            <button
              onClick={() => { closeModal(MODAL_ID); onCheckOut?.(); }}
              className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition active:scale-95"
            >
              <LogOut size={13} className="inline mr-1" /> Check Out
            </button>
          </div>

        </div>
      </Modal>
    </>
  );
}
