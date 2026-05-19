// hrmStore.js — data for Management Team Leader HRM module

// ─── Logged-in TL ─────────────────────────────────────────────────────────────
export const currentTL = {
  id:   "TL-101",
  name: "Ravi Khanna",
  team: "Team Ravi",
};

// ─── Attendance KPIs ──────────────────────────────────────────────────────────
export const kpiAttendance = [
  { title: "Total Members",  value: "12", accent: "#3b82f6" },
  { title: "Present Today",  value: "9",  accent: "#22c55e" },
  { title: "Absent Today",   value: "2",  accent: "#f43f5e" },
  { title: "On Leave",       value: "1",  accent: "#f59e0b" },
];

// ─── Attendance records ───────────────────────────────────────────────────────
export const attendanceRows = [
  { id: "A001", employeeId: "EM-201", name: "Karan Malhotra", role: "Frontend", department: "Engineering", team: "Alpha Titans", date: "2026-05-12", clockIn: "09:05", clockOut: "18:10", hours: "9h 05m" },
  { id: "A002", employeeId: "EM-202", name: "Divya Iyer",     role: "Backend",  department: "Engineering", team: "Beta Builders", date: "2026-05-12", clockIn: "09:20", clockOut: "18:00", hours: "8h 40m" },
  { id: "A003", employeeId: "EM-203", name: "Manish Joshi",   role: "Designer", department: "Design",      team: "Creative Minds", date: "2026-05-12", clockIn: "10:15", clockOut: "18:15", hours: "8h 00m" },
  { id: "A004", employeeId: "EM-204", name: "Sara Khan",      role: "Frontend", department: "Engineering", team: "Delta Force", date: "2026-05-12", clockIn: "09:00", clockOut: "18:00", hours: "9h 00m" },
  { id: "A005", employeeId: "EM-205", name: "Rohit Bansal",   role: "Backend",  department: "Engineering", team: "Echo Elite", date: "2026-05-12", clockIn: "—",     clockOut: "—",     hours: "—",      status: "Absent"   },
  { id: "A006", employeeId: "EM-206", name: "Aisha Verma",    role: "QA",       department: "QA",          team: "QA Wizards", date: "2026-05-12", clockIn: "—",     clockOut: "—",     hours: "—",      status: "Leave"    },
  { id: "A007", employeeId: "EM-207", name: "Tushar Rao",     role: "DevOps",   department: "DevOps",      team: "DevOps Ninjas", date: "2026-05-12", clockIn: "08:55", clockOut: "18:05", hours: "9h 10m" },
  { id: "A008", employeeId: "EM-208", name: "Meera Pillai",   role: "Backend",  department: "Engineering", team: "Backend Bears", date: "2026-05-12", clockIn: "09:10", clockOut: "13:30", hours: "4h 20m" },
  { id: "A009", employeeId: "EM-209", name: "Yash Chauhan",   role: "Frontend", department: "Engineering", team: "Frontend Falcons", date: "2026-05-12", clockIn: "09:02", clockOut: "18:02", hours: "9h 00m" },
  { id: "A010", employeeId: "EM-210", name: "Ritika Singh",   role: "Designer", department: "Design",      team: "Design Dynamos", date: "2026-05-12", clockIn: "09:30", clockOut: "18:30", hours: "9h 00m" },
  { id: "A011", employeeId: "EM-211", name: "Aditya Nair",    role: "Backend",  department: "Engineering", team: "Engineering Hawks", date: "2026-05-12", clockIn: "—",     clockOut: "—",     hours: "—",      status: "Absent"   },
  { id: "A012", employeeId: "EM-212", name: "Nikita Bhat",    role: "QA",       department: "QA",          team: "QA Spartans", date: "2026-05-12", clockIn: "09:08", clockOut: "18:08", hours: "9h 00m" },
].map(row => {
  if (row.clockIn !== "—" && row.hours !== "—") {
    const hoursMatch = row.hours.match(/(\d+)h/);
    const totalHours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const [h, m] = row.clockIn.split(":").map(Number);
    const clockInMinutes = h * 60 + m;
    
    let autoStatus = "Present";
    if (totalHours < 5) {
      autoStatus = "Half Day";
    } else if (clockInMinutes > 9 * 60 + 30) {
      autoStatus = "Late";
    }
    return { ...row, status: autoStatus };
  }
  return row;
});

export const ATTENDANCE_STATUS = ["Present", "Absent", "Late", "Half Day", "Leave"];

// ─── Weekly attendance trend (column chart) ───────────────────────────────────
export const weeklyAttendance = [
  { day: "Mon", present: 10, absent: 1, late: 1 },
  { day: "Tue", present: 11, absent: 1, late: 0 },
  { day: "Wed", present: 9,  absent: 2, late: 1 },
  { day: "Thu", present: 10, absent: 1, late: 1 },
  { day: "Fri", present: 9,  absent: 2, late: 1 },
];

// ─── Attendance status distribution (doughnut) ────────────────────────────────
export const attendanceDistribution = [
  { name: "Present",  value: 9 },
  { name: "Absent",   value: 2 },
  { name: "Late",     value: 1 },
  { name: "Half Day", value: 1 },
  { name: "Leave",    value: 1 },
];

// ─── Leave KPIs ───────────────────────────────────────────────────────────────
export const kpiLeaves = [
  { title: "Total Leaves", value: "18", accent: "#3b82f6" },
  { title: "Approved",     value: "11", accent: "#22c55e" },
  { title: "Pending",      value: "4",  accent: "#f59e0b" },
  { title: "Rejected",     value: "3",  accent: "#f43f5e" },
];

// ─── Leave types ──────────────────────────────────────────────────────────────
export const LEAVE_TYPES = [
  "Sick Leave", "Casual Leave", "Earned Leave",
  "Maternity Leave", "Paternity Leave", "Bereavement Leave",
  "Unpaid Leave", "Other",
];

// ─── Monthly leave trend (area chart) ────────────────────────────────────────
export const monthlyLeaveTrend = [
  { month: "Jan", approved: 3, rejected: 1, pending: 0 },
  { month: "Feb", approved: 2, rejected: 0, pending: 1 },
  { month: "Mar", approved: 4, rejected: 1, pending: 0 },
  { month: "Apr", approved: 5, rejected: 2, pending: 1 },
  { month: "May", approved: 3, rejected: 1, pending: 2 },
];

// ─── Leave type distribution (pie chart) ─────────────────────────────────────
export const leaveTypeDistribution = [
  { name: "Sick Leave",   value: 7 },
  { name: "Casual Leave", value: 5 },
  { name: "Earned Leave", value: 4 },
  { name: "Other",        value: 2 },
];

// ─── TL's own leaves ──────────────────────────────────────────────────────────
export const myLeavesSeed = [
  { id: "ML001", type: "Sick Leave",   from: "2026-04-10", to: "2026-04-11", days: "2", appliedOn: "2026-04-09", reason: "Fever and body ache",            status: "Approved" },
  { id: "ML002", type: "Casual Leave", from: "2026-04-22", to: "2026-04-22", days: "1", appliedOn: "2026-04-20", reason: "Personal errand",                status: "Rejected" },
  { id: "ML003", type: "Earned Leave", from: "2026-05-01", to: "2026-05-03", days: "3", appliedOn: "2026-04-28", reason: "Family trip planned in advance",  status: "Approved" },
  { id: "ML004", type: "Casual Leave", from: "2026-06-10", to: "2026-06-10", days: "1", appliedOn: "2026-06-08", reason: "Home maintenance work",           status: "Pending"  },
  { id: "ML005", type: "Sick Leave",   from: "2026-06-18", to: "2026-06-19", days: "2", appliedOn: "2026-06-15", reason: "Viral infection — rest advised",  status: "Pending"  },
].map((r) => ({ ...r, dateRange: `${r.from} to ${r.to}` }));

// ─── Team members' leave requests ─────────────────────────────────────────────
export const teamLeaveRequests = [
  { id: "TL001", name: "Karan Malhotra", role: "Frontend", type: "Sick Leave",   from: "2026-05-14", to: "2026-05-15", days: "2", appliedOn: "2026-05-13", reason: "Severe food poisoning after eating out last night", status: "Pending",  actionOn: ""           },
  { id: "TL002", name: "Divya Iyer",     role: "Backend",  type: "Casual Leave", from: "2026-05-20", to: "2026-05-20", days: "1", appliedOn: "2026-05-18", reason: "Need to renew passport and other government documents", status: "Pending",  actionOn: ""           },
  { id: "TL003", name: "Manish Joshi",   role: "Designer", type: "Earned Leave", from: "2026-05-22", to: "2026-05-24", days: "3", appliedOn: "2026-05-19", reason: "Attending a close friend's wedding ceremony out of state",  status: "Pending",  actionOn: ""           },
  { id: "TL004", name: "Rohit Bansal",   role: "Backend",  type: "Sick Leave",   from: "2026-05-12", to: "2026-05-12", days: "1", appliedOn: "2026-05-12", reason: "Doctor appointment and full medical checkup scheduled", status: "Pending",  actionOn: ""           },
  { id: "TL005", name: "Aisha Verma",    role: "QA",       type: "Casual Leave", from: "2026-05-10", to: "2026-05-10", days: "1", appliedOn: "2026-05-09", reason: "Taking care of sick child resting at home",status: "Approved", actionOn: "2026-05-09" },
  { id: "TL006", name: "Tushar Rao",     role: "DevOps",   type: "Earned Leave", from: "2026-04-28", to: "2026-04-30", days: "3", appliedOn: "2026-04-25", reason: "Relocating to a new apartment in the city",   status: "Approved", actionOn: "2026-04-26" },
  { id: "TL007", name: "Meera Pillai",   role: "Backend",  type: "Sick Leave",   from: "2026-04-15", to: "2026-04-15", days: "1", appliedOn: "2026-04-14", reason: "Recovering from minor dental surgery procedure",status: "Rejected", actionOn: "2026-04-14" },
  { id: "TL008", name: "Yash Chauhan",   role: "Frontend", type: "Casual Leave", from: "2026-04-05", to: "2026-04-05", days: "1", appliedOn: "2026-04-04", reason: "Attending parent teacher meeting at school",status: "Approved", actionOn: "2026-04-04" },
].map((r) => ({ ...r, dateRange: `${r.from} to ${r.to}` }));

// ─── My Timing Logs ──────────────────────────────────────────────────────────
export const myTimingLogs = [
  { id: "MTL01", date: "2026-05-12", clockIn: "09:05", clockOut: "18:10", hours: "9h 05m", late: "No",  overtime: "1h 05m" },
  { id: "MTL02", date: "2026-05-11", clockIn: "09:15", clockOut: "17:00", hours: "7h 45m", late: "Yes", overtime: "0h" },
  { id: "MTL03", date: "2026-05-10", clockIn: "09:00", clockOut: "19:30", hours: "10h 30m", late: "No",  overtime: "2h 30m" },
  { id: "MTL04", date: "2026-05-09", clockIn: "08:55", clockOut: "18:00", hours: "9h 05m", late: "No",  overtime: "1h 05m" },
  { id: "MTL05", date: "2026-05-08", clockIn: "09:00", clockOut: "18:00", hours: "9h 00m", late: "No",  overtime: "1h" },
];

// ─── Charts Data ──────────────────────────────────────────────────────────────

export const monthlyAttendanceGraph = [
  { month: "Jan", present: 220, absent: 10, leave: 15 },
  { month: "Feb", present: 205, absent: 8,  leave: 12 },
  { month: "Mar", present: 230, absent: 12, leave: 18 },
  { month: "Apr", present: 215, absent: 5,  leave: 20 },
  { month: "May", present: 190, absent: 15, leave: 10 },
];

export const employeeAttendanceBar = [
  { name: "Karan",  present: 24, absent: 1 },
  { name: "Divya",  present: 25, absent: 0 },
  { name: "Manish", present: 22, absent: 2 },
  { name: "Sara",   present: 26, absent: 0 },
  { name: "Rohit",  present: 20, absent: 5 },
];

export const clockInTrendGraph = [
  { day: "Mon", avgClockIn: 9.1 },
  { day: "Tue", avgClockIn: 9.0 },
  { day: "Wed", avgClockIn: 9.2 },
  { day: "Thu", avgClockIn: 9.05 },
  { day: "Fri", avgClockIn: 9.3 },
];
// ─── Employee Attendance Summary ─────────────────────────────────────────────
export const employeeAttendanceSummary = [
  { id: "EAS01", name: "Karan Malhotra", department: "Engineering", present: 24, absent: 1, leaves: 2, percentage: 96, workingDays: 25, remainingLeaves: 10 },
  { id: "EAS02", name: "Divya Iyer",     department: "Engineering", present: 25, absent: 0, leaves: 2, percentage: 100, workingDays: 27, remainingLeaves: 8 },
  { id: "EAS03", name: "Manish Joshi",   department: "Design",      present: 22, absent: 2, leaves: 3, percentage: 92, workingDays: 24, remainingLeaves: 5 },
  { id: "EAS04", name: "Sara Khan",      department: "Engineering", present: 26, absent: 0, leaves: 1, percentage: 100, workingDays: 26, remainingLeaves: 12 },
  { id: "EAS05", name: "Rohit Bansal",   department: "Engineering", present: 16, absent: 5, leaves: 2, percentage: 65, workingDays: 23, remainingLeaves: 6 },
  { id: "EAS06", name: "Aisha Verma",    department: "QA",          present: 23, absent: 1, leaves: 1, percentage: 95, workingDays: 25, remainingLeaves: 10 },
  { id: "EAS07", name: "Tushar Rao",     department: "DevOps",      present: 24, absent: 2, leaves: 0, percentage: 92, workingDays: 26, remainingLeaves: 9 },
  { id: "EAS08", name: "Meera Pillai",   department: "Engineering", present: 20, absent: 3, leaves: 2, percentage: 86, workingDays: 25, remainingLeaves: 4 },
  { id: "EAS09", name: "Yash Chauhan",   department: "Engineering", present: 25, absent: 0, leaves: 1, percentage: 100, workingDays: 26, remainingLeaves: 11 },
  { id: "EAS10", name: "Ritika Singh",   department: "Design",      present: 21, absent: 4, leaves: 0, percentage: 84, workingDays: 25, remainingLeaves: 8 },
  { id: "EAS11", name: "Aditya Nair",    department: "Engineering", present: 18, absent: 3, leaves: 4, percentage: 85, workingDays: 25, remainingLeaves: 3 },
  { id: "EAS12", name: "Nikita Bhat",    department: "QA",          present: 24, absent: 0, leaves: 1, percentage: 100, workingDays: 25, remainingLeaves: 12 },
];