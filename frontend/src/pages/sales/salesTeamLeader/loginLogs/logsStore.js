// logsStore.js — TL Login Logs (self + team executives only)

import { teamExecutives, currentTL } from "../teamLeaderStore";

export const kpiLogs = [
  { title: "My Logins (Today)",    value: "1",  accent: "#3b82f6" },
  { title: "My Total Logins",      value: "7",  accent: "#8b5cf6" },
  { title: "Team Logins (Today)",  value: "5",  accent: "#22c55e" },
  { title: "Team Total Logins",    value: "42", accent: "#f59e0b" },
];

// TL's own login history
export const myLogRows = [
  { name: currentTL.name, email: currentTL.email, role: "Team Leader", date: "2026-05-06", time: "08:45 AM", ip: "192.168.1.05", latitude: "23.0225° N", longitude: "72.5714° E", status: "Active",   device: "Chrome / Windows 11" },
  { name: currentTL.name, email: currentTL.email, role: "Team Leader", date: "2026-05-05", time: "09:01 AM", ip: "192.168.1.05", latitude: "23.0225° N", longitude: "72.5714° E", status: "Active",   device: "Chrome / Windows 11" },
  { name: currentTL.name, email: currentTL.email, role: "Team Leader", date: "2026-05-04", time: "08:58 AM", ip: "192.168.1.05", latitude: "23.0225° N", longitude: "72.5714° E", status: "Active",   device: "Chrome / Windows 11" },
  { name: currentTL.name, email: currentTL.email, role: "Team Leader", date: "2026-05-03", time: "09:12 AM", ip: "103.45.72.88", latitude: "19.0760° N", longitude: "72.8777° E", status: "Active",   device: "Chrome / Android" },
  { name: currentTL.name, email: currentTL.email, role: "Team Leader", date: "2026-05-02", time: "08:50 AM", ip: "192.168.1.05", latitude: "23.0225° N", longitude: "72.5714° E", status: "Active",   device: "Chrome / Windows 11" },
  { name: currentTL.name, email: currentTL.email, role: "Team Leader", date: "2026-05-01", time: "10:30 AM", ip: "45.120.88.10", latitude: "Unknown",    longitude: "Unknown",    status: "Rejected", device: "Firefox / Windows 11" },
  { name: currentTL.name, email: currentTL.email, role: "Team Leader", date: "2026-04-30", time: "09:05 AM", ip: "192.168.1.05", latitude: "23.0225° N", longitude: "72.5714° E", status: "Active",   device: "Chrome / Windows 11" },
];

// Team executives' login records (today + recent — scoped to TL's team only)
export const teamLogRows = [
  { name: teamExecutives[0].name, email: teamExecutives[0].email, role: "Executive", date: "2026-05-06", time: "09:02 AM", ip: "192.168.1.12", latitude: "19.0760° N", longitude: "72.8777° E", status: "Active",   device: "Chrome / Windows 11" },
  { name: teamExecutives[1].name, email: teamExecutives[1].email, role: "Executive", date: "2026-05-06", time: "09:15 AM", ip: "192.168.1.18", latitude: "18.5204° N", longitude: "73.8567° E", status: "Active",   device: "Safari / macOS" },
  { name: teamExecutives[2].name, email: teamExecutives[2].email, role: "Executive", date: "2026-05-06", time: "09:18 AM", ip: "192.168.1.22", latitude: "28.6139° N", longitude: "77.2090° E", status: "Active",   device: "Firefox / Windows 11" },
  { name: teamExecutives[3].name, email: teamExecutives[3].email, role: "Executive", date: "2026-05-06", time: "09:10 AM", ip: "192.168.1.30", latitude: "12.9716° N", longitude: "77.5946° E", status: "Active",   device: "Chrome / Android" },
  { name: teamExecutives[4].name, email: teamExecutives[4].email, role: "Executive", date: "2026-05-06", time: "—",        ip: "—",            latitude: "—",          longitude: "—",          status: "Pending",  device: "—" },
  { name: teamExecutives[5].name, email: teamExecutives[5].email, role: "Executive", date: "2026-05-06", time: "09:45 AM", ip: "103.45.72.11", latitude: "Unknown",    longitude: "Unknown",    status: "Rejected", device: "Edge / Windows 11" },
  { name: teamExecutives[0].name, email: teamExecutives[0].email, role: "Executive", date: "2026-05-05", time: "08:55 AM", ip: "192.168.1.12", latitude: "19.0760° N", longitude: "72.8777° E", status: "Active",   device: "Chrome / Windows 11" },
  { name: teamExecutives[1].name, email: teamExecutives[1].email, role: "Executive", date: "2026-05-05", time: "09:00 AM", ip: "192.168.1.18", latitude: "18.5204° N", longitude: "73.8567° E", status: "Active",   device: "Safari / macOS" },
  { name: teamExecutives[2].name, email: teamExecutives[2].email, role: "Executive", date: "2026-05-05", time: "08:48 AM", ip: "192.168.1.22", latitude: "28.6139° N", longitude: "77.2090° E", status: "Active",   device: "Firefox / Windows 11" },
  { name: teamExecutives[3].name, email: teamExecutives[3].email, role: "Executive", date: "2026-05-05", time: "09:08 AM", ip: "192.168.1.30", latitude: "12.9716° N", longitude: "77.5946° E", status: "Active",   device: "Chrome / Android" },
];
