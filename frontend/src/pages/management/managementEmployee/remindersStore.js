// remindersStore.js — Packet 3 (Reminders)
// Personal, private reminders for the logged-in ME (Brief Section 11.b.ii).
// Not shared with TL/MM. No backend wiring yet — seeded in-memory.

import { myProjects } from "./managementEmployeeStore";

export const REMINDER_STATUSES = ["Pending", "Done"];

export const initialReminders = [
  {
    id: "REM-001",
    title: "Submit UI report",
    note: "Weekly UI status email to Anjali (TL).",
    dueAt: "2026-05-28",
    linkedProjectId: "PRJ-009",  // Acme Marketing Microsite
    status: "Pending",
    createdAt: "2026-05-22",
  },
  {
    id: "REM-002",
    title: "Client meeting prep",
    note: "Prepare demo flow for Bluewave QA round 2.",
    dueAt: "2026-05-30",
    linkedProjectId: "PRJ-002",  // Bluewave Mobile App
    status: "Done",
    createdAt: "2026-05-18",
  },
  {
    id: "REM-003",
    title: "Push final logo updates",
    note: "Replace placeholder logo on the Acme microsite once received.",
    dueAt: "2026-05-26",
    linkedProjectId: "PRJ-009",
    status: "Pending",
    createdAt: "2026-05-23",
  },
];

// Helper to resolve a linked project's name for the table display.
export function projectName(linkedProjectId) {
  if (!linkedProjectId) return "—";
  return myProjects.find((p) => p.id === linkedProjectId)?.name ?? linkedProjectId;
}
