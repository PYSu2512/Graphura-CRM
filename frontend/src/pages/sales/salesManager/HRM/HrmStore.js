// hrmStore.js — dummy data for HRM pages

export const kpiAttendance = [
  { title: "Total Employees", value: "48",  accent: "#3b82f6" },
  { title: "Present Today",   value: "38",  accent: "#22c55e" },
  { title: "Absent Today",    value: "5",   accent: "#f43f5e" },
  { title: "On Leave",        value: "3",   accent: "#f59e0b" },
  { title: "Late Check-ins",  value: "2",   accent: "#8b5cf6" },
];

export const attendanceRows = [
  { name: "Rahul Sharma",  role: "Executive",    teamLeader: "Ankit Verma",  date: "2025-06-01", clockIn: "09:02", clockOut: "18:05", hours: "9h 03m", status: "Active" },
  { name: "Priya Mehta",   role: "Executive",    teamLeader: "Sonal Gupta",  date: "2025-06-01", clockIn: "09:15", clockOut: "18:00", hours: "8h 45m", status: "Active" },
  { name: "Arjun Kapoor",  role: "Executive",    teamLeader: "Ankit Verma",  date: "2025-06-01", clockIn: "09:45", clockOut: "18:00", hours: "8h 15m", status: "Pending" },
  { name: "Sneha Rajput",  role: "Executive",    teamLeader: "Nisha Patel",  date: "2025-06-01", clockIn: "—",     clockOut: "—",     hours: "—",      status: "Rejected" },
  { name: "Vikram Tiwari", role: "Executive",    teamLeader: "Sonal Gupta",  date: "2025-06-01", clockIn: "09:10", clockOut: "18:10", hours: "9h 00m", status: "Active" },
  { name: "Ankit Verma",   role: "Team Leader",  teamLeader: "Self",         date: "2025-06-01", clockIn: "08:55", clockOut: "18:30", hours: "9h 35m", status: "Active" },
  { name: "Sonal Gupta",   role: "Team Leader",  teamLeader: "Self",         date: "2025-06-01", clockIn: "09:00", clockOut: "18:00", hours: "9h 00m", status: "Active" },
  { name: "Kavya Patel",   role: "Executive",    teamLeader: "Nisha Patel",  date: "2025-06-01", clockIn: "—",     clockOut: "—",     hours: "—",      status: "Rejected" },
];

export const kpiLeaves = [
  { title: "Total Leaves",    value: "64",  accent: "#3b82f6" },
  { title: "Approved Leaves", value: "42",  accent: "#22c55e" },
  { title: "Pending Leaves",  value: "12",  accent: "#f59e0b" },
  { title: "Rejected Leaves", value: "10",  accent: "#f43f5e" },
];

export const leaveRows = [
  { name: "Arjun Kapoor",  role: "Executive",   teamLeader: "Ankit Verma",  type: "Sick Leave",    from: "2025-05-20", to: "2025-05-21", days: 2, reason: "Fever",           status: "Approved" },
  { name: "Kavya Patel",   role: "Executive",   teamLeader: "Nisha Patel",  type: "Casual Leave",  from: "2025-05-25", to: "2025-05-25", days: 1, reason: "Personal work",   status: "Approved" },
  { name: "Mohit Joshi",   role: "Executive",   teamLeader: "Ankit Verma",  type: "Earned Leave",  from: "2025-06-03", to: "2025-06-05", days: 3, reason: "Vacation",        status: "Pending" },
  { name: "Divya Nair",    role: "Executive",   teamLeader: "Nisha Patel",  type: "Sick Leave",    from: "2025-06-02", to: "2025-06-02", days: 1, reason: "Medical",         status: "Pending" },
  { name: "Sneha Rajput",  role: "Executive",   teamLeader: "Nisha Patel",  type: "Casual Leave",  from: "2025-05-28", to: "2025-05-28", days: 1, reason: "Festival",        status: "Rejected" },
  { name: "Sonal Gupta",   role: "Team Leader", teamLeader: "Self",         type: "Earned Leave",  from: "2025-05-15", to: "2025-05-17", days: 3, reason: "Annual leave",    status: "Approved" },
];

export const approvalRows = [
  { name: "Mohit Joshi",   role: "Executive",   teamLeader: "Ankit Verma", type: "Earned Leave", dates: "03 Jun – 05 Jun", days: 3, appliedOn: "2025-06-01", reason: "Vacation trip",   status: "Pending" },
  { name: "Divya Nair",    role: "Executive",   teamLeader: "Nisha Patel", type: "Sick Leave",   dates: "02 Jun – 02 Jun", days: 1, appliedOn: "2025-06-01", reason: "Medical checkup", status: "Pending" },
  { name: "Vikram Tiwari", role: "Executive",   teamLeader: "Sonal Gupta", type: "Casual Leave", dates: "07 Jun – 07 Jun", days: 1, appliedOn: "2025-06-03", reason: "Family event",    status: "Pending" },
];