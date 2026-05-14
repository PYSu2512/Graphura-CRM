// notificationsStore.js — data for Management Team Leader Notifications module

export const kpiNotifications = [
  { title: "Total Notifications", value: "45", accent: "#3b82f6" },
  { title: "Unread Notifications", value: "10", accent: "#f43f5e" },
  { title: "Deadline Alerts",     value: "5",  accent: "#f59e0b" },
  { title: "Task Reminders",      value: "12", accent: "#22c55e" },
];

export const notificationRows = [
  { id: "NTF-101", type: "Deadline Alert",    priority: "High",   subject: "Submit Q3 Sales Projections",     date: "2026-05-14 10:00 AM", status: "Unread", employeeName: "Rahul Sharma", projectName: "Project Alpha" },
  { id: "NTF-102", type: "Ticket Alert",      priority: "High",   subject: "Server Load Spiked on Cluster B", date: "2026-05-13 08:45 AM", status: "Unread", employeeName: "System",       projectName: "DevOps Core" },
  { id: "NTF-103", type: "Leave Notification",priority: "Medium", subject: "Divya Iyer requested leave",      date: "2026-05-13 07:30 AM", status: "Unread", employeeName: "Divya Iyer",   projectName: "-" },
  { id: "NTF-104", type: "Reminder",          priority: "Low",    subject: "Weekly Team Sync at 3 PM",        date: "2026-05-13 09:00 AM", status: "Read",   employeeName: "Admin",        projectName: "General" },
  { id: "NTF-105", type: "Project Update",    priority: "Low",    subject: "Design assets uploaded",          date: "2026-05-12 11:00 PM", status: "Read",   employeeName: "Priya Singh",  projectName: "Project Beta" },
  { id: "NTF-106", type: "Deadline Alert",    priority: "Medium", subject: "Complete Performance Reviews",    date: "2026-05-20 05:00 PM", status: "Unread", employeeName: "Karan Malhotra", projectName: "HR" },
  { id: "NTF-107", type: "Project Update",    priority: "Low",    subject: "New Designer joined the team",    date: "2026-05-11 09:30 AM", status: "Read",   employeeName: "HR Dept",      projectName: "Onboarding" },
  { id: "NTF-108", type: "Ticket Alert",      priority: "High",   subject: "Unusual Login Attempt Detected",  date: "2026-05-10 02:15 AM", status: "Read",   employeeName: "SecurityBot",  projectName: "Security" },
  { id: "NTF-109", type: "Reminder",          priority: "Medium", subject: "Follow up with client Alpha",     date: "2026-05-14 11:30 AM", status: "Unread", employeeName: "Manish Joshi", projectName: "Sales Pipeline" },
  { id: "NTF-110", type: "Project Update",    priority: "Medium", subject: "Project Delta deployed",          date: "2026-05-09 04:00 PM", status: "Read",   employeeName: "Dev Team",     projectName: "Project Delta" },
];

export const NOTIFICATION_TYPES = ["Deadline Alert", "Reminder", "Leave Notification", "Ticket Alert", "Project Update"];
export const NOTIFICATION_PRIORITIES = ["High", "Medium", "Low"];
export const NOTIFICATION_STATUS = ["Unread", "Read"];

export const alertItems = [
  { id: "ALT-01", type: "Deadline Alert", message: "Project deadline missed", priority: "High", action1: "View Project", action2: "Reassign Task" },
  { id: "ALT-02", type: "Delay Alert", message: "Task delayed by 2 days", priority: "Medium", action1: "View Project", action2: "Send Reminder" },
  { id: "ALT-03", type: "High Priority Issue", message: "Urgent support ticket", priority: "High", action1: "View Ticket", action2: "Reassign Task" },
  { id: "ALT-04", type: "Attendance Alert", message: "Employee absent today", priority: "Normal", action1: "View Profile", action2: "Send Reminder" },
];

export const reminderRows = [
  { id: "REM-01", reminder: "Submit weekly report", relatedTo: "Reports", time: "5:00 PM", repeat: "Weekly", type: "Automatic" },
  { id: "REM-02", reminder: "Team meeting", relatedTo: "Team Management", time: "3:00 PM", repeat: "Daily", type: "Scheduled" },
  { id: "REM-03", reminder: "Review timesheets", relatedTo: "HRM", time: "10:00 AM", repeat: "Weekly", type: "Automatic" },
  { id: "REM-04", reminder: "Client follow-up calls", relatedTo: "Sales", time: "11:30 AM", repeat: "Daily", type: "Scheduled" },
];

export const activityRows = [
  { id: "ACT-01", activity: "Rahul completed CRM dashboard", time: "10 mins ago", type: "Task", user: "Rahul" },
  { id: "ACT-02", activity: "Neha updated attendance module", time: "1 hour ago", type: "Update", user: "Neha" },
  { id: "ACT-03", activity: "New support ticket created", time: "3 hours ago", type: "Ticket", user: "System" },
  { id: "ACT-04", activity: "Leave request approved", time: "Yesterday", type: "HR", user: "Admin" },
];

export const notificationTypeData = [
  { name: "Alerts", value: 45 },
  { name: "Reminders", value: 30 },
  { name: "Updates", value: 25 },
];

export const priorityDistributionData = [
  { name: "High", value: 20 },
  { name: "Medium", value: 45 },
  { name: "Low", value: 35 },
];

export const weeklyNotificationData = [
  { day: "Mon", notifications: 12 },
  { day: "Tue", notifications: 18 },
  { day: "Wed", notifications: 15 },
  { day: "Thu", notifications: 22 },
  { day: "Fri", notifications: 30 },
  { day: "Sat", notifications: 5 },
  { day: "Sun", notifications: 2 },
];

export const employeeNotificationData = [
  { name: "Rahul", alerts: 5, reminders: 12 },
  { name: "Divya", alerts: 2, reminders: 8 },
  { name: "Karan", alerts: 8, reminders: 5 },
  { name: "Neha", alerts: 3, reminders: 15 },
];

export const deadlineAlertData = [
  { week: "W1", missed: 2, approaching: 5 },
  { week: "W2", missed: 1, approaching: 8 },
  { week: "W3", missed: 4, approaching: 3 },
  { week: "W4", missed: 0, approaching: 10 },
];
