// teamStore.js — Packet 3 (My Team workspace)
// Re-exports canonical team data and adds attendance + leave-request fixtures.

import { teamExecutives, currentTL } from "../teamLeaderStore";

export { teamExecutives, currentTL };

// ─── Today / dates ──────────────────────────────────────────────────────────
const TODAY = "2026-05-07";
const DATES = ["2026-05-01", "2026-05-04", "2026-05-05", "2026-05-06", "2026-05-07"]; // skip weekend

// ─── Attendance — last 5 working days × 6 executives ────────────────────────
// Status: Present | Late | Absent | Leave
const ATTENDANCE_PATTERN = {
  "Rahul Sharma":  ["Present", "Present", "Present", "Late",    "Present"],
  "Priya Mehta":   ["Present", "Present", "Present", "Present", "Present"],
  "Arjun Kapoor":  ["Late",    "Present", "Absent",  "Present", "Present"],
  "Sneha Rajput":  ["Present", "Present", "Present", "Present", "Present"],
  "Vikram Tiwari": ["Present", "Leave",   "Leave",   "Leave",   "Leave"],
  "Kavya Patel":   ["Present", "Late",    "Present", "Present", "Late"],
};

const TIME_BY_STATUS = {
  Present: { in: "09:02", out: "18:05", hours: "9h 03m" },
  Late:    { in: "10:24", out: "18:30", hours: "8h 06m" },
  Absent:  { in: "—",     out: "—",     hours: "—" },
  Leave:   { in: "—",     out: "—",     hours: "—" },
};

export const attendanceRecords = teamExecutives.flatMap((exec) => {
  const pattern = ATTENDANCE_PATTERN[exec.name] || [];
  return DATES.map((date, i) => {
    const status = pattern[i] || "Present";
    const t = TIME_BY_STATUS[status];
    return {
      id:       `ATT-${exec.id}-${date}`,
      execId:   exec.id,
      name:     exec.name,
      role:     "Sales Executive",
      date,
      clockIn:  t.in,
      clockOut: t.out,
      hours:    t.hours,
      status,
    };
  });
});

// ─── Today's snapshot — used by KPI cards on TeamMembers / Attendance ───────
export const todayAttendance = attendanceRecords.filter((r) => r.date === TODAY);

// ─── Pending + history leave requests ───────────────────────────────────────
const baseRequests = [
  { id: "LR-001", name: "Vikram Tiwari", execId: "EX-105", type: "Sick Leave",       from: "2026-05-04", to: "2026-05-08", reason: "Viral fever — doctor advised rest",   appliedOn: "2026-05-03", status: "Pending"  },
  { id: "LR-002", name: "Priya Mehta",   execId: "EX-102", type: "Casual Leave",     from: "2026-05-12", to: "2026-05-12", reason: "Personal errand at the bank",         appliedOn: "2026-05-06", status: "Pending"  },
  { id: "LR-003", name: "Arjun Kapoor",  execId: "EX-103", type: "Sick Leave",       from: "2026-05-09", to: "2026-05-09", reason: "Migraine, doctor appointment",        appliedOn: "2026-05-06", status: "Pending"  },
  { id: "LR-004", name: "Rahul Sharma",  execId: "EX-101", type: "Earned Leave",     from: "2026-05-20", to: "2026-05-22", reason: "Family wedding out of town",          appliedOn: "2026-05-05", status: "Pending"  },
  { id: "LR-005", name: "Sneha Rajput",  execId: "EX-104", type: "Casual Leave",     from: "2026-04-25", to: "2026-04-25", reason: "Flat-shifting paperwork",             appliedOn: "2026-04-22", status: "Approved", actionOn: "2026-04-23" },
  { id: "LR-006", name: "Kavya Patel",   execId: "EX-106", type: "Sick Leave",       from: "2026-04-18", to: "2026-04-18", reason: "Stomach infection",                   appliedOn: "2026-04-17", status: "Approved", actionOn: "2026-04-17" },
  { id: "LR-007", name: "Arjun Kapoor",  execId: "EX-103", type: "Casual Leave",     from: "2026-04-30", to: "2026-04-30", reason: "Personal — declined to elaborate",    appliedOn: "2026-04-28", status: "Rejected", actionOn: "2026-04-29" },
];

export const leaveRequests = baseRequests.map((r) => ({
  ...r,
  dateRange: `${r.from} to ${r.to}`,
  days:      String(Math.round((new Date(r.to) - new Date(r.from)) / 86400000) + 1),
}));

// ─── Per-executive performance (lightweight summary for TeamMembers) ────────
export const memberPerformance = {
  "EX-101": { calls: 310, prospects: 84, sales: 42, conversion: "13.5%" },
  "EX-102": { calls: 290, prospects: 78, sales: 38, conversion: "13.1%" },
  "EX-103": { calls: 265, prospects: 71, sales: 31, conversion: "11.7%" },
  "EX-104": { calls: 240, prospects: 64, sales: 27, conversion: "11.2%" },
  "EX-105": { calls: 198, prospects: 52, sales: 22, conversion: "11.1%" },
  "EX-106": { calls: 172, prospects: 45, sales: 18, conversion: "10.5%" },
};

export const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Earned Leave", "Bereavement Leave", "Unpaid Leave"];
export const ATTENDANCE_STATUS = ["Present", "Late", "Absent", "Leave"];
