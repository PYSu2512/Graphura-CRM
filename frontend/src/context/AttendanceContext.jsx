/**
 * AttendanceContext — shared attendance timer state
 *
 * Status values:
 *   "idle"    — not checked in
 *   "active"  — timer running
 *   "paused"  — timer paused
 *   "done"    — checked out (cannot check in again today)
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const TARGET_SECONDS = 8 * 60 * 60; // 8 hours

function pad(n) { return String(n).padStart(2, "0"); }

export function formatElapsed(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function nowTimeStr() {
  const d = new Date();
  const h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  return `${pad(h % 12 || 12)}:${pad(m)} ${ampm}`;
}

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const [status,        setStatus]        = useState("idle");
  const [elapsed,       setElapsed]       = useState(0);
  const [checkInAt,     setCheckInAt]     = useState("");
  const [checkOutAt,    setCheckOutAt]    = useState("");
  // true only when the 8h target was auto-completed (not manual checkout)
  const [targetReached, setTargetReached] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (status === "active") {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= TARGET_SECONDS) {
            clearInterval(intervalRef.current);
            setStatus("done");
            setCheckOutAt(nowTimeStr());
            setTargetReached(true);   // auto-completed = target achieved
            return TARGET_SECONDS;
          }
          return e + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  const checkIn = useCallback(() => {
    setCheckInAt(nowTimeStr());
    setElapsed(0);
    setTargetReached(false);
    setStatus("active");
  }, []);

  const pause = useCallback(() => setStatus("paused"), []);
  const resume = useCallback(() => setStatus("active"), []);

  // Manual checkout — does NOT set targetReached
  const checkOut = useCallback(() => {
    clearInterval(intervalRef.current);
    setCheckOutAt(nowTimeStr());
    setStatus("done");
    // targetReached stays false unless auto-completed
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setStatus("idle");
    setElapsed(0);
    setCheckInAt("");
    setCheckOutAt("");
    setTargetReached(false);
  }, []);

  const pct       = Math.min((elapsed / TARGET_SECONDS) * 100, 100);
  const remaining = Math.max(TARGET_SECONDS - elapsed, 0);

  return (
    <AttendanceContext.Provider value={{
      status, elapsed, checkInAt, checkOutAt,
      pct, remaining, TARGET_SECONDS, targetReached,
      checkIn, pause, resume, checkOut, reset,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) return {
    status: "idle", elapsed: 0, pct: 0, remaining: TARGET_SECONDS,
    checkInAt: "", checkOutAt: "", targetReached: false,
    checkIn: () => {}, pause: () => {}, resume: () => {},
    checkOut: () => {}, reset: () => {},
  };
  return ctx;
}

export { TARGET_SECONDS };
