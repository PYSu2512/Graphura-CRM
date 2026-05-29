export const attendanceRecords = [
  { id: "AR-001", date: "2026-05-18", clockIn: "09:03", clockOut: "18:05", hours: "9h 2m", status: "Present" },
  { id: "AR-002", date: "2026-05-19", clockIn: "09:15", clockOut: "18:00", hours: "8h 45m", status: "Present" },
  { id: "AR-003", date: "2026-05-20", clockIn: "09:08", clockOut: "18:12", hours: "9h 4m", status: "Present" },
  { id: "AR-004", date: "2026-05-21", clockIn: "09:02", clockOut: "18:09", hours: "9h 7m", status: "Present" },
  { id: "AR-005", date: "2026-05-22", clockIn: "09:12", clockOut: "18:05", hours: "8h 53m", status: "Present" },
  { id: "AR-006", date: "2026-05-23", clockIn: "09:05", clockOut: "18:10", hours: "9h 5m", status: "Present" },
  { id: "AR-007", date: "2026-05-24", clockIn: "09:10", clockOut: "18:02", hours: "8h 52m", status: "Present" },
  { id: "AR-008", date: "2026-05-25", clockIn: "09:06", clockOut: "18:08", hours: "9h 2m", status: "Present" },
];

export const leaveApplications = [
  {
    id: "LV-101",
    leaveType: "Sick Leave",
    reason: "Recovering from a mild fever.",
    fromDate: "2026-04-10",
    toDate: "2026-04-12",
    days: 3,
    appliedOn: "2026-04-05",
    status: "Approved",
  },
  {
    id: "LV-102",
    leaveType: "Casual Leave",
    reason: "Family event in the evening.",
    fromDate: "2026-05-02",
    toDate: "2026-05-02",
    days: 1,
    appliedOn: "2026-04-28",
    status: "Approved",
  },
  {
    id: "LV-103",
    leaveType: "Earned Leave",
    reason: "Short break after project delivery.",
    fromDate: "2026-05-29",
    toDate: "2026-05-31",
    days: 3,
    appliedOn: "2026-05-20",
    status: "Pending",
  },
];
