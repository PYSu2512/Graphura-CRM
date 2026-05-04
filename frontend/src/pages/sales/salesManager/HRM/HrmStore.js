// hrmStore.js — dummy data for HRM pages

export const kpiAttendance = [
  { title: "Total Employees", value: "48", accent: "#3b82f6" },
  { title: "Present Today",   value: "38", accent: "#22c55e" },
  { title: "Absent Today",    value: "5",  accent: "#f43f5e" },
  { title: "On Leave",        value: "3",  accent: "#f59e0b" },
];

export const attendanceRows = [
  { name: "Rahul Sharma",  role: "Executive",   teamLeader: "Ankit Verma", date: "2026-05-03", clockIn: "09:02", clockOut: "18:05", hours: "9h 03m", status: "Completed",   attendancePct: "94%" },
  { name: "Priya Mehta",   role: "Executive",   teamLeader: "Sonal Gupta", date: "2026-05-03", clockIn: "09:15", clockOut: "18:00", hours: "8h 45m", status: "Completed",   attendancePct: "88%" },
  { name: "Arjun Kapoor",  role: "Executive",   teamLeader: "Ankit Verma", date: "2026-05-03", clockIn: "09:45", clockOut: "—",     hours: "6h 30m", status: "Working",     attendancePct: "76%" },
  { name: "Sneha Rajput",  role: "Executive",   teamLeader: "Nisha Patel", date: "2026-05-03", clockIn: "—",     clockOut: "—",     hours: "—",      status: "Not Working", attendancePct: "62%" },
  { name: "Vikram Tiwari", role: "Executive",   teamLeader: "Sonal Gupta", date: "2026-05-03", clockIn: "09:10", clockOut: "18:10", hours: "9h 00m", status: "Completed",   attendancePct: "91%" },
  { name: "Ankit Verma",   role: "Team Leader", teamLeader: "Self",        date: "2026-05-03", clockIn: "08:55", clockOut: "—",     hours: "4h 45m", status: "Paused",      attendancePct: "97%" },
  { name: "Sonal Gupta",   role: "Team Leader", teamLeader: "Self",        date: "2026-05-03", clockIn: "09:00", clockOut: "18:00", hours: "9h 00m", status: "Completed",   attendancePct: "95%" },
  { name: "Kavya Patel",   role: "Executive",   teamLeader: "Nisha Patel", date: "2026-05-03", clockIn: "10:00", clockOut: "—",     hours: "3h 20m", status: "Paused",      attendancePct: "58%" },
  { name: "Mohit Joshi",   role: "Executive",   teamLeader: "Nisha Patel", date: "2026-05-03", clockIn: "09:30", clockOut: "18:30", hours: "9h 00m", status: "Completed",   attendancePct: "90%" },
  { name: "Divya Nair",    role: "Executive",   teamLeader: "Ankit Verma", date: "2026-05-03", clockIn: "—",     clockOut: "—",     hours: "—",      status: "Not Working", attendancePct: "55%" },
  { name: "Nisha Patel",   role: "Team Leader", teamLeader: "Self",        date: "2026-05-03", clockIn: "08:50", clockOut: "—",     hours: "5h 10m", status: "Working",     attendancePct: "93%" },
];

export const kpiLeaves = [
  { title: "Total Leaves",    value: "64", accent: "#3b82f6" },
  { title: "Accepted Leaves", value: "42", accent: "#22c55e" },
  { title: "Pending Leaves",  value: "12", accent: "#f59e0b" },
  { title: "Rejected Leaves", value: "10", accent: "#f43f5e" },
];

// Pending leave requests — awaiting manager action
export const pendingLeaveRows = [
  { id: "L003", name: "Mohit Joshi",   role: "Executive",   teamLeader: "Ankit Verma",  type: "Earned Leave", from: "2025-06-03", to: "2025-06-05", days: 3, appliedOn: "2025-06-01", reason: "Vacation trip with family",   status: "Pending",    actionOn: "" },
  { id: "L004", name: "Divya Nair",    role: "Executive",   teamLeader: "Nisha Patel",  type: "Sick Leave",   from: "2025-06-02", to: "2025-06-02", days: 1, appliedOn: "2025-06-01", reason: "Medical checkup appointment", status: "Pending",    actionOn: "" },
  { id: "L006", name: "Vikram Tiwari", role: "Executive",   teamLeader: "Sonal Gupta",  type: "Casual Leave", from: "2025-06-07", to: "2025-06-07", days: 1, appliedOn: "2025-06-03", reason: "Family event at home town",   status: "Pending",    actionOn: "" },
];

// Leave history — already actioned
export const leaveHistoryRows = [
  { id: "L001", name: "Arjun Kapoor",  role: "Executive",   teamLeader: "Ankit Verma",  type: "Sick Leave",   from: "2025-05-20", to: "2025-05-21", days: 2, appliedOn: "2025-05-18", reason: "Fever and body ache",          status: "Accepted",    actionOn: "2025-05-19" },
  { id: "L002", name: "Kavya Patel",   role: "Executive",   teamLeader: "Nisha Patel",  type: "Casual Leave", from: "2025-05-25", to: "2025-05-25", days: 1, appliedOn: "2025-05-23", reason: "Personal work at home",        status: "Accepted",    actionOn: "2025-05-24" },
  { id: "L005", name: "Sneha Rajput",  role: "Executive",   teamLeader: "Nisha Patel",  type: "Casual Leave", from: "2025-05-28", to: "2025-05-28", days: 1, appliedOn: "2025-05-26", reason: "Festival celebration at home", status: "Rejected",    actionOn: "2025-05-27" },
  { id: "L007", name: "Sonal Gupta",   role: "Team Leader", teamLeader: "Self",         type: "Earned Leave", from: "2025-05-15", to: "2025-05-17", days: 3, appliedOn: "2025-05-12", reason: "Annual leave planned trip",    status: "Accepted",    actionOn: "2025-05-13" },
  { id: "L008", name: "Rahul Sharma",  role: "Executive",   teamLeader: "Ankit Verma",  type: "Sick Leave",   from: "2025-04-10", to: "2025-04-10", days: 1, appliedOn: "2025-04-09", reason: "Headache and cold symptoms",   status: "Not Respond", actionOn: "" },
];
