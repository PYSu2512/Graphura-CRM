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
import { hrmService } from "../services/hrmService";

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

function formatToTimeStr(date) {
  if (!date) return "";
  const d = new Date(date);
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
  const [loading,       setLoading]       = useState(true);
  const [breakSeconds,  setBreakSeconds]  = useState(0);
  // true only when the 8h target was auto-completed (not manual checkout)
  const [targetReached, setTargetReached] = useState(false);
  const intervalRef = useRef(null);

  const syncState = useCallback((attendance) => {
    if (!attendance) {
      setStatus("idle");
      setElapsed(0);
      setCheckInAt("");
      setCheckOutAt("");
      setBreakSeconds(0);
      return;
    }

    const { clockIn, clockOut, breaks = [] } = attendance;
    setCheckInAt(formatToTimeStr(clockIn));
    
    if (clockOut) {
      setCheckOutAt(formatToTimeStr(clockOut));
      setStatus("done");
      // Calculate final elapsed
      const totalMs = new Date(clockOut) - new Date(clockIn);
      let breakMs = 0;
      (breaks || []).forEach(b => {
        if (b.startedAt && b.endedAt) breakMs += (new Date(b.endedAt) - new Date(b.startedAt));
      });
      setElapsed(Math.floor((totalMs - breakMs) / 1000));
      setBreakSeconds(Math.floor(breakMs / 1000));
    } else {
      const activeBreak = (breaks || []).find(b => !b.endedAt);
      setStatus(activeBreak ? "paused" : "active");
      
      const now = new Date();
      const totalMsSoFar = now - new Date(clockIn);
      let breakMs = 0;
      (breaks || []).forEach(b => {
        if (b.startedAt && b.endedAt) {
          breakMs += (new Date(b.endedAt) - new Date(b.startedAt));
        } else if (b.startedAt && !b.endedAt) {
          breakMs += (now - new Date(b.startedAt));
        }
      });
      setElapsed(Math.floor((totalMsSoFar - breakMs) / 1000));
      setBreakSeconds(Math.floor(breakMs / 1000));
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const res = await hrmService.getTodayStatus();
        if (res.success && res.data) {
          syncState(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch attendance status:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [syncState]);


  useEffect(() => {
    if (status === "active") {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= TARGET_SECONDS) {
            // Auto clock-out if target reached? 
            // The user didn't explicitly ask for auto-clockout, but current logic has it.
            // Let's keep it but ideally it should call the API too.
            clearInterval(intervalRef.current);
            setStatus("done");
            setCheckOutAt(nowTimeStr());
            setTargetReached(true);
            hrmService.clockOut().catch(console.error);
            return TARGET_SECONDS;
          }
          return e + 1;
        });
      }, 1000);
    } else if (status === "paused") {
      intervalRef.current = setInterval(() => {
        setBreakSeconds(b => b + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  const checkIn = useCallback(async () => {
    try {
      const res = await hrmService.clockIn();
      if (res.success) {
        syncState(res.data);
      }
    } catch (err) {
      console.error("Clock in failed:", err);
    }
  }, [syncState]);

  const pause = useCallback(async () => {
    try {
      const res = await hrmService.toggleBreak("pause");
      if (res.success) {
        syncState(res.data);
      }
    } catch (err) {
      console.error("Pause failed:", err);
    }
  }, [syncState]);

  const resume = useCallback(async () => {
    try {
      const res = await hrmService.toggleBreak("resume");
      if (res.success) {
        syncState(res.data);
      }
    } catch (err) {
      console.error("Resume failed:", err);
    }
  }, [syncState]);

  const checkOut = useCallback(async () => {
    try {
      const res = await hrmService.clockOut();
      if (res.success) {
        syncState(res.data);
      }
    } catch (err) {
      console.error("Clock out failed:", err);
    }
  }, [syncState]);

  const reset = useCallback(() => {
    // Reset might not be needed with backend, but keeping for local state clearing if needed
    clearInterval(intervalRef.current);
    setStatus("idle");
    setElapsed(0);
    setCheckInAt("");
    setCheckOutAt("");
    setBreakSeconds(0);
    setTargetReached(false);
  }, []);

  const pct       = Math.min((elapsed / TARGET_SECONDS) * 100, 100);
  const remaining = Math.max(TARGET_SECONDS - elapsed, 0);
  const overtime  = Math.max(elapsed - TARGET_SECONDS, 0);

  return (
    <AttendanceContext.Provider value={{
      status, elapsed, checkInAt, checkOutAt,
      breakSeconds, overtime,
      pct, remaining, TARGET_SECONDS, targetReached,
      loading,
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
    breakSeconds: 0, overtime: 0,
    checkInAt: "", checkOutAt: "", targetReached: false,
    loading: false,
    checkIn: () => {}, pause: () => {}, resume: () => {},
    checkOut: () => {}, reset: () => {},
  };
  return ctx;
}

export { TARGET_SECONDS };

