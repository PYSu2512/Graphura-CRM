export const progressStats = [
  { title: "Total Assigned Leads", value: "1,248", accent: "#2563eb" },
  { title: "Active Leads", value: "642", accent: "#0891b2" },
  { title: "Interested Leads", value: "284", accent: "#16a34a" },
  { title: "Converted Leads", value: "96", accent: "#0f766e" },
  { title: "Dump Leads", value: "118", accent: "#64748b" },
  { title: "Pending Follow-Ups", value: "73", accent: "#f59e0b" },
  { title: "Total Calls Made", value: "2,814", accent: "#7c3aed" },
  { title: "Team Conversion Rate %", value: "18.6%", accent: "#22c55e" },
  { title: "Today's Revenue", value: "₹8.4L", accent: "#059669" },
  { title: "Prospect Count", value: "156", accent: "#ea580c" },
  { title: "Best Performing Executive", value: "Priya", accent: "#0284c7" },
  { title: "SLA Violations", value: "9", accent: "#dc2626" },
];

export const executives = [
  { id: "EX-101", name: "Priya Nair", totalLeads: 214, callsMade: 486, interested: 62, prospects: 34, converted: 21, dumpCount: 12, followupsPending: 8, conversion: "28%", lastActivity: "Converted BluePeak CRM", productivity: 94, status: "Top Performer" },
  { id: "EX-102", name: "Rohit Shah", totalLeads: 198, callsMade: 421, interested: 51, prospects: 28, converted: 15, dumpCount: 18, followupsPending: 14, conversion: "21%", lastActivity: "Updated 9 lead statuses", productivity: 86, status: "On Track" },
  { id: "EX-103", name: "Aman Verma", totalLeads: 176, callsMade: 352, interested: 39, prospects: 21, converted: 10, dumpCount: 25, followupsPending: 22, conversion: "16%", lastActivity: "Created follow-up reminders", productivity: 72, status: "Needs Attention" },
  { id: "EX-104", name: "Neha Kapoor", totalLeads: 221, callsMade: 538, interested: 71, prospects: 41, converted: 24, dumpCount: 9, followupsPending: 6, conversion: "31%", lastActivity: "Won enterprise lead", productivity: 97, status: "Top Performer" },
  { id: "EX-105", name: "Sahil Khan", totalLeads: 184, callsMade: 318, interested: 31, prospects: 18, converted: 8, dumpCount: 29, followupsPending: 19, conversion: "12%", lastActivity: "Dumped 4 Not Talk leads", productivity: 64, status: "Low Activity" },
];

export const leadPipeline = [
  { stage: "Untouched", count: 226, dropoff: "18%" },
  { stage: "Talk", count: 418, dropoff: "12%" },
  { stage: "Interested", count: 284, dropoff: "20%" },
  { stage: "Prospect", count: 156, dropoff: "9%" },
  { stage: "Converted", count: 96, dropoff: "0%" },
];

export const activityLogs = [
  { id: 1, time: "11:50 AM", executive: "Rohit Shah", action: "updated lead status to Interested", lead: "Crestline Systems", tone: "success" },
  { id: 2, time: "11:35 AM", executive: "Aman Verma", action: "created follow-up reminder", lead: "Nova Retail", tone: "warning" },
  { id: 3, time: "11:10 AM", executive: "Priya Nair", action: "converted lead to Prospect", lead: "BluePeak CRM", tone: "success" },
  { id: 4, time: "10:45 AM", executive: "Sahil Khan", action: "dumped lead after 3 attempts", lead: "Metro Foods", tone: "danger" },
  { id: 5, time: "10:20 AM", executive: "Neha Kapoor", action: "logged WhatsApp response", lead: "Vertex Finance", tone: "info" },
];

export const followups = [
  { id: "FU-881", lead: "Crestline Systems", executive: "Rohit Shah", type: "Today", priority: "High", due: "02:30 PM", status: "Pending" },
  { id: "FU-874", lead: "Metro Foods", executive: "Sahil Khan", type: "Missed", priority: "Critical", due: "Yesterday", status: "Missed" },
  { id: "FU-869", lead: "Nova Retail", executive: "Aman Verma", type: "Upcoming", priority: "Medium", due: "Tomorrow", status: "Scheduled" },
  { id: "FU-852", lead: "BluePeak CRM", executive: "Priya Nair", type: "High Priority", priority: "High", due: "04:00 PM", status: "Pending" },
];

export const weeklyConversions = [
  { name: "Mon", conversions: 12, revenue: 4.2, calls: 420 },
  { name: "Tue", conversions: 16, revenue: 5.8, calls: 465 },
  { name: "Wed", conversions: 14, revenue: 5.1, calls: 438 },
  { name: "Thu", conversions: 21, revenue: 8.4, calls: 512 },
  { name: "Fri", conversions: 18, revenue: 6.9, calls: 489 },
];

export const executiveConversions = [
  { name: "Priya", converted: 21, prospects: 34 },
  { name: "Rohit", converted: 15, prospects: 28 },
  { name: "Aman", converted: 10, prospects: 21 },
  { name: "Neha", converted: 24, prospects: 41 },
  { name: "Sahil", converted: 8, prospects: 18 },
];

export const leadSourcePerformance = [
  { name: "Website", value: 34 },
  { name: "Referral", value: 27 },
  { name: "Cold Call", value: 18 },
  { name: "WhatsApp", value: 13 },
  { name: "Campaign", value: 8 },
];

export const dumpReasons = [
  { name: "Not Talk", value: 48 },
  { name: "Wrong Number", value: 19 },
  { name: "No Budget", value: 24 },
  { name: "Not Interested", value: 27 },
];

export const dumpRiskLeads = [
  { lead: "Metro Foods", executive: "Sahil Khan", attempts: 3, status: "Not Talk", warning: "Lead nearing dump threshold" },
  { lead: "Omega Labs", executive: "Aman Verma", attempts: 3, status: "Not Talk", warning: "Lead nearing dump threshold" },
  { lead: "Bright EDU", executive: "Rohit Shah", attempts: 2, status: "Not Talk", warning: "One attempt remaining" },
];

export const attendanceSnapshot = [
  { label: "Present Executives", value: "18" },
  { label: "Absent Executives", value: "2" },
  { label: "Late Logins", value: "3" },
  { label: "Avg Working Hours", value: "7.4h" },
  { label: "Active Sessions", value: "16" },
];

export const targets = [
  { label: "Daily Target vs Achieved", target: 120, achieved: 94 },
  { label: "Monthly Sales Target", target: 1200000, achieved: 840000, currency: true },
  { label: "Team Achievement %", target: 100, achieved: 78 },
  { label: "Revenue Progress", target: 1500000, achieved: 980000, currency: true },
];

export const risks = [
  { title: "Pending follow-ups > 24h", count: 18, tone: "danger" },
  { title: "Leads untouched > 48h", count: 26, tone: "warning" },
  { title: "High-value leads inactive", count: 7, tone: "danger" },
  { title: "Escalated support tickets", count: 5, tone: "info" },
  { title: "Low-performing executives", count: 2, tone: "warning" },
];

export const filterOptions = {
  executives: ["All", "Priya Nair", "Rohit Shah", "Aman Verma", "Neha Kapoor", "Sahil Khan"],
  teams: ["All", "North Team", "South Team", "Enterprise Team"],
  statuses: ["All", "Untouched", "Talk", "Interested", "Prospect", "Converted", "Dump"],
  priorities: ["All", "Low", "Medium", "High", "Critical"],
  sources: ["All", "Website", "Referral", "Cold Call", "WhatsApp", "Campaign"],
};
