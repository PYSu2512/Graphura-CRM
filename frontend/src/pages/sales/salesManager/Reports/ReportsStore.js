// selfReportStore.js — dummy data for Self Report page

export const kpiReport = [
  { title: "Total Calls",       value: "1,240", accent: "#3b82f6" },
  { title: "Today Calls",       value: "48",    accent: "#14b8a6" },
  { title: "Today Prospects",   value: "12",    accent: "#8b5cf6" },
  { title: "Today Sales",       value: "6",     accent: "#22c55e" },
  { title: "Today Dump Data",   value: "4",     accent: "#f43f5e" },
  { title: "Total Untouched",   value: "186",   accent: "#f59e0b" },
];

export const ReportRows = [
  { leadName: "Rohan Verma",    mobile: "98765-43210", callCount: 4, status: "Converted", prospect: "Yes", sale: "Yes", dump: "No",  untouched: "No",  date: "2025-06-01" },
  { leadName: "Kavita Singh",   mobile: "91234-56789", callCount: 2, status: "Follow-up", prospect: "Yes", sale: "No",  dump: "No",  untouched: "No",  date: "2025-06-01" },
  { leadName: "Nilesh Patil",   mobile: "99887-76655", callCount: 1, status: "New",       prospect: "No",  sale: "No",  dump: "No",  untouched: "Yes", date: "2025-06-01" },
  { leadName: "Anjali Rao",     mobile: "88001-12233", callCount: 5, status: "Dump",      prospect: "No",  sale: "No",  dump: "Yes", untouched: "No",  date: "2025-06-01" },
  { leadName: "Suresh Menon",   mobile: "77654-32100", callCount: 3, status: "Prospect",  prospect: "Yes", sale: "No",  dump: "No",  untouched: "No",  date: "2025-06-01" },
  { leadName: "Deepa Nair",     mobile: "90011-22334", callCount: 2, status: "Converted", prospect: "Yes", sale: "Yes", dump: "No",  untouched: "No",  date: "2025-06-01" },
  { leadName: "Rajesh Kumar",   mobile: "80044-55667", callCount: 0, status: "New",       prospect: "No",  sale: "No",  dump: "No",  untouched: "Yes", date: "2025-06-01" },
  { leadName: "Pooja Sharma",   mobile: "70099-88776", callCount: 3, status: "In Progress",prospect:"Yes", sale: "No",  dump: "No",  untouched: "No",  date: "2025-06-01" },
];