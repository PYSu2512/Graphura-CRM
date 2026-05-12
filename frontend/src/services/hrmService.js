// hrmService.js — API layer for HRM module
// Replace delay() + mock data with real fetch() calls when backend is ready.

export const MOCK_ATTENDANCE = [
  { id: "AV", employee: "Ankit Verma", role: "Team Leader", teamLeader: "Self", date: "2026-05-03", day: "Sun", checkIn: "08:55", checkOut: "—", hours: "4h 45m", status: "Present", attendancePct: "97%" },
  { id: "AK", employee: "Arjun Kapoor", role: "Executive", teamLeader: "Ankit Verma", date: "2026-05-03", day: "Sun", checkIn: "09:45", checkOut: "—", hours: "6h 30m", status: "Late", attendancePct: "76%" },
  { id: "DN", employee: "Divya Nair", role: "Executive", teamLeader: "Ankit Verma", date: "2026-05-03", day: "Sun", checkIn: "—", checkOut: "—", hours: "—", status: "Absent", attendancePct: "55%" },
  { id: "KP", employee: "Kavya Patel", role: "Executive", teamLeader: "Ankit Verma", date: "2026-05-03", day: "Sun", checkIn: "10:00", checkOut: "—", hours: "3h 20m", status: "Late", attendancePct: "58%" },
  { id: "MJ", employee: "Mohit Joshi", role: "Executive", teamLeader: "Ankit Verma", date: "2026-05-03", day: "Sun", checkIn: "09:30", checkOut: "18:30", hours: "9h 00m", status: "Present", attendancePct: "90%" },
  { id: "NP", employee: "Nisha Patel", role: "Team Leader", teamLeader: "Self", date: "2026-05-03", day: "Sun", checkIn: "08:50", checkOut: "—", hours: "5h 10m", status: "Present", attendancePct: "93%" },
  { id: "PM", employee: "Priya Mehta", role: "Executive", teamLeader: "Nisha Patel", date: "2026-05-03", day: "Sun", checkIn: "09:15", checkOut: "18:00", hours: "8h 45m", status: "Present", attendancePct: "88%" },
  { id: "RS", employee: "Rahul Sharma", role: "Executive", teamLeader: "Nisha Patel", date: "2026-05-03", day: "Sun", checkIn: "09:02", checkOut: "18:05", hours: "9h 03m", status: "Present", attendancePct: "94%" },
  { id: "SR", employee: "Sneha Rajput", role: "Executive", teamLeader: "Nisha Patel", date: "2026-05-03", day: "Sun", checkIn: "—", checkOut: "—", hours: "—", status: "Absent", attendancePct: "62%" },
  { id: "SG", employee: "Sonal Gupta", role: "Team Leader", teamLeader: "Self", date: "2026-05-03", day: "Sun", checkIn: "09:00", checkOut: "18:00", hours: "9h 00m", status: "Present", attendancePct: "95%" },
];

export const MOCK_LEAVES_INIT = [
  { id: 1, type: "Sick",   from: "2026-05-13", to: "2026-05-14", days: 2, reason: "Fever and rest.",     status: "Approved" },
  { id: 2, type: "Casual", from: "2026-04-10", to: "2026-04-10", days: 1, reason: "Personal work.",      status: "Approved" },
  { id: 3, type: "Paid",   from: "2026-03-20", to: "2026-03-22", days: 3, reason: "Family function.",    status: "Rejected" },
  { id: 4, type: "Sick",   from: "2026-06-02", to: "2026-06-02", days: 1, reason: "Doctor appointment.", status: "Pending"  },
];

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

export const hrmService = {
  // GET /hrm/summary
  async getSummary() {
    await delay();
    return {
      success: true,
      data: {
        totalWorkingDays: MOCK_ATTENDANCE.filter(r => !["Weekend","Holiday"].includes(r.status)).length,
        presentDays:      MOCK_ATTENDANCE.filter(r => r.status === "Present").length,
        absentDays:       MOCK_ATTENDANCE.filter(r => r.status === "Absent").length,
        monthLabel:       "May 2026",
      },
    };
  },

  // GET /hrm/attendance
  async getAttendance() {
    await delay();
    return { success: true, data: MOCK_ATTENDANCE };
  },

  // GET /hrm/leaves
  async getLeaves() {
    await delay();
    return { success: true, data: MOCK_LEAVES_INIT };
  },

  // POST /hrm/leaves
  async applyLeave(payload) {
    await delay(900);
    // Replace with: const res = await fetch("/api/leaves", { method: "POST", body: JSON.stringify(payload) });
    return { success: true, data: { ...payload, id: Date.now(), status: "Pending" } };
  },

  // POST /hrm/attendance/clock-in
  async clockIn() {
    await delay(600);
    return { success: true, data: { time: new Date().toISOString() } };
  },

  // POST /hrm/attendance/clock-out
  async clockOut() {
    await delay(600);
    return { success: true, data: { time: new Date().toISOString() } };
  },

  // POST /hrm/attendance/auto-mark  (called on login)
  async autoMarkAttendance() {
    await delay(200);
    const today = new Date().toISOString().slice(0, 10);
    const record = MOCK_ATTENDANCE.find(r => r.date === today);
    return { success: true, data: { status: record?.status ?? null, record } };
  },
};
