// hrmStore.js — HRM data for the Management Manager workspace
// Scope: MM + every TL + every Employee in the Management department.
// People list comes from the canonical store; only HRM-specific state lives here.

import { currentMM, teamLeaders, employees } from "../managementManagerStore";

export { currentMM, teamLeaders, employees };

export const LEAVE_TYPES = ["Casual Leave", "Sick Leave", "Earned Leave", "Unpaid Leave"];

export const ATTENDANCE_STATUS = ["Present", "Late", "Absent", "Leave", "Half Day"];

// ─── Today's attendance, one row per TL + Employee ───────────────────────────
// Mirrors the Sales TL pattern: SessionTimer drives the MM's own row separately,
// so the table omits the MM and lists the team members only.
const today = "2026-05-09";

const peopleForToday = [
  ...teamLeaders.map((tl) => ({ ...tl, role: "Management Team Leader" })),
  ...employees.map((emp) => ({ ...emp, role: `Employee · ${emp.role}` })),
];

// Build today's attendance: most Present, a few Absent / Leave / Late.
const todaySeed = {
  "TL-104": { status: "Leave",   clockIn: "—",        clockOut: "—",        hours: "—"   }, // Pooja Reddy = On Leave per canonical
  "EM-206": { status: "Leave",   clockIn: "—",        clockOut: "—",        hours: "—"   }, // Aisha Verma = On Leave per canonical
  "EM-202": { status: "Late",    clockIn: "10:15 AM", clockOut: "—",        hours: "—"   },
  "EM-209": { status: "Absent",  clockIn: "—",        clockOut: "—",        hours: "—"   },
  "EM-212": { status: "Half Day",clockIn: "09:30 AM", clockOut: "01:30 PM", hours: "4h"  },
};

export const todayAttendance = peopleForToday.map((p) => {
  const seed = todaySeed[p.id];
  if (seed) return { id: p.id, name: p.name, role: p.role, date: today, ...seed };
  return {
    id: p.id, name: p.name, role: p.role, date: today,
    status: "Present", clockIn: "09:00 AM", clockOut: "—", hours: "—",
  };
});

// ─── Attendance log (past 7 days, scattered) — for the dept-wide table ──────
const past = ["2026-05-08", "2026-05-07", "2026-05-06", "2026-05-05", "2026-05-02"];

const past7 = past.flatMap((d) =>
  peopleForToday.slice(0, 8).map((p, i) => ({
    id:       `${p.id}-${d}`,
    name:     p.name,
    role:     p.role,
    date:     d,
    clockIn:  i % 5 === 0 ? "10:05 AM" : "09:00 AM",
    clockOut: "06:00 PM",
    hours:    "8h",
    status:   i % 5 === 0 ? "Late" : "Present",
  })),
);

export const attendanceRecords = [...todayAttendance, ...past7];

// ─── MM's own leaves (My Leaves table) ──────────────────────────────────────
export const myLeavesInit = [
  {
    id: "MM-LV-001",
    type: "Casual Leave",
    reason: "Family function",
    from: "2026-04-12", to: "2026-04-13", days: "2",
    appliedOn: "2026-04-05", status: "Approved",
  },
  {
    id: "MM-LV-002",
    type: "Sick Leave",
    reason: "Fever",
    from: "2026-05-15", to: "2026-05-15", days: "1",
    appliedOn: "2026-05-08", status: "Pending",
  },
];

// ─── Department-wide leave requests (TLs + Employees → MM) ──────────────────
// MM approves / rejects these.
export const leaveRequests = [
  {
    id: "DEPT-LV-001", name: "Ravi Khanna",   role: "Management Team Leader",
    type: "Casual Leave", reason: "Cousin's wedding",
    from: "2026-05-20", to: "2026-05-22", days: "3",
    appliedOn: "2026-05-06", status: "Pending",
  },
  {
    id: "DEPT-LV-002", name: "Karan Malhotra", role: "Employee · Frontend",
    type: "Sick Leave", reason: "Migraine",
    from: "2026-05-10", to: "2026-05-11", days: "2",
    appliedOn: "2026-05-08", status: "Pending",
  },
  {
    id: "DEPT-LV-003", name: "Divya Iyer",     role: "Employee · Backend",
    type: "Earned Leave", reason: "Vacation",
    from: "2026-06-01", to: "2026-06-05", days: "5",
    appliedOn: "2026-05-07", status: "Pending",
  },
  {
    id: "DEPT-LV-004", name: "Anjali Sinha",   role: "Management Team Leader",
    type: "Casual Leave", reason: "Personal work",
    from: "2026-04-25", to: "2026-04-25", days: "1",
    appliedOn: "2026-04-20", status: "Approved", actionOn: "2026-04-21",
  },
  {
    id: "DEPT-LV-005", name: "Tushar Rao",     role: "Employee · DevOps",
    type: "Sick Leave", reason: "Food poisoning",
    from: "2026-04-18", to: "2026-04-19", days: "2",
    appliedOn: "2026-04-17", status: "Approved", actionOn: "2026-04-17",
  },
  {
    id: "DEPT-LV-006", name: "Sara Khan",      role: "Employee · Frontend",
    type: "Unpaid Leave", reason: "Personal emergency, no balance",
    from: "2026-04-15", to: "2026-04-16", days: "2",
    appliedOn: "2026-04-14", status: "Rejected", actionOn: "2026-04-14",
  },
  {
    id: "DEPT-LV-007", name: "Manish Joshi",   role: "Employee · Designer",
    type: "Casual Leave", reason: "Travel",
    from: "2026-05-25", to: "2026-05-26", days: "2",
    appliedOn: "2026-05-09", status: "Pending",
  },
];
