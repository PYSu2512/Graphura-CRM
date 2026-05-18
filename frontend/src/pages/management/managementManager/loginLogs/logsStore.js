// logsStore.js — MM Login Logs (Self + TLs + Employees, per Brief Section 9.a)

import { currentMM, teamLeaders, employees } from "../managementManagerStore";

export const kpiLogs = [
  { title: "My Logins (Today)",    value: "1",   accent: "#3b82f6" },
  { title: "My Total Logins",      value: "11",  accent: "#8b5cf6" },
  { title: "Dept Logins (Today)",  value: "12",  accent: "#22c55e" },
  { title: "Dept Total Logins",    value: "118", accent: "#f59e0b" },
];

// MM's own login history
export const myLogRows = [
  { name: currentMM.name, email: currentMM.email, role: "Management Manager", date: "2026-05-09", time: "08:30 AM", ip: "192.168.1.02", latitude: "23.0225° N", longitude: "72.5714° E", status: "Active",   device: "Chrome / Windows 11" },
  { name: currentMM.name, email: currentMM.email, role: "Management Manager", date: "2026-05-08", time: "08:45 AM", ip: "192.168.1.02", latitude: "23.0225° N", longitude: "72.5714° E", status: "Active",   device: "Chrome / Windows 11" },
  { name: currentMM.name, email: currentMM.email, role: "Management Manager", date: "2026-05-07", time: "09:02 AM", ip: "192.168.1.02", latitude: "23.0225° N", longitude: "72.5714° E", status: "Active",   device: "Chrome / Windows 11" },
  { name: currentMM.name, email: currentMM.email, role: "Management Manager", date: "2026-05-06", time: "08:55 AM", ip: "103.45.72.88", latitude: "19.0760° N", longitude: "72.8777° E", status: "Active",   device: "Chrome / Android" },
  { name: currentMM.name, email: currentMM.email, role: "Management Manager", date: "2026-05-05", time: "09:10 AM", ip: "192.168.1.02", latitude: "23.0225° N", longitude: "72.5714° E", status: "Active",   device: "Chrome / Windows 11" },
  { name: currentMM.name, email: currentMM.email, role: "Management Manager", date: "2026-05-04", time: "10:42 AM", ip: "45.120.88.10", latitude: "Unknown",    longitude: "Unknown",    status: "Rejected", device: "Firefox / Windows 11" },
  { name: currentMM.name, email: currentMM.email, role: "Management Manager", date: "2026-05-02", time: "08:48 AM", ip: "192.168.1.02", latitude: "23.0225° N", longitude: "72.5714° E", status: "Active",   device: "Chrome / Windows 11" },
];

// ─── Team Leaders' + Employees' logs (today + recent) ───────────────────────
const tlSeed = teamLeaders.flatMap((tl, i) => ([
  { name: tl.name, email: tl.email, role: "Management Team Leader", date: "2026-05-09", time: ["09:02 AM","09:15 AM","09:08 AM","—"][i] ?? "09:10 AM", ip: ["192.168.1.12","192.168.1.18","192.168.1.22","—"][i] ?? "192.168.1.30", latitude: ["19.0760° N","12.9716° N","28.6139° N","—"][i] ?? "17.3850° N", longitude: ["72.8777° E","77.5946° E","77.2090° E","—"][i] ?? "78.4867° E", status: i === 3 ? "Pending" : "Active", device: ["Chrome / Windows 11","Safari / macOS","Firefox / Windows 11","—"][i] ?? "Chrome / Windows 11" },
  { name: tl.name, email: tl.email, role: "Management Team Leader", date: "2026-05-08", time: "09:00 AM", ip: "192.168.1.12", latitude: "19.0760° N", longitude: "72.8777° E", status: "Active", device: "Chrome / Windows 11" },
]));

const empSeed = employees.slice(0, 8).map((emp, i) => ({
  name: emp.name, email: emp.email, role: `Employee · ${emp.role}`, date: "2026-05-09",
  time: ["09:05 AM","09:12 AM","09:20 AM","09:08 AM","09:30 AM","—","09:18 AM","09:25 AM"][i],
  ip:   ["192.168.1.40","192.168.1.41","192.168.1.42","192.168.1.43","192.168.1.44","—","103.45.72.55","192.168.1.46"][i],
  latitude:  ["19.0760° N","18.5204° N","28.6139° N","12.9716° N","17.3850° N","—","Unknown","23.0225° N"][i],
  longitude: ["72.8777° E","73.8567° E","77.2090° E","77.5946° E","78.4867° E","—","Unknown","72.5714° E"][i],
  status: i === 5 ? "Pending" : (i === 6 ? "Rejected" : "Active"),
  device: ["Chrome / Windows 11","Safari / macOS","Firefox / Windows 11","Chrome / Android","Edge / Windows 11","—","Edge / Windows 11","Chrome / macOS"][i],
}));

export const teamLogRows = [...tlSeed, ...empSeed];
