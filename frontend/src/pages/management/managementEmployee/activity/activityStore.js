// activityStore.js — Packet 2 (Activity workspace)
// Seed data derived from managementEmployeeStore.js → myProjects[].comments
// and myProjects[].updates so the Activity pages stay in sync with the
// Dashboard's "Recent Comments" feed.

import { myProjects, currentEmployee } from "../managementEmployeeStore";

// ─── Comments by project ─────────────────────────────────────────────────────
// Shape: { [projectId]: [{ date, author, body }, ...] }
export const commentsByProject = Object.fromEntries(
  myProjects.map((p) => [p.id, p.comments ?? []])
);

// ─── Work notes by project ───────────────────────────────────────────────────
// Shape: { [projectId]: [{ date, author, body, isClientVisible }, ...] }
export const workNotesByProject = Object.fromEntries(
  myProjects.map((p) => [
    p.id,
    (p.updates ?? []).map((u) => ({
      date: u.date,
      author: currentEmployee.name,
      body: u.note,
      isClientVisible: u.isClientVisible ?? true,
    })),
  ])
);

// ─── Flat comments list (for CommentsLog table) ──────────────────────────────
export const allComments = myProjects.flatMap((p) =>
  (p.comments ?? []).map((c) => ({
    ...c,
    projectId: p.id,
    projectName: p.name,
  }))
).sort((a, b) => (a.date < b.date ? 1 : -1));

// ─── Flat work notes list (for WorkNotesLog table) ───────────────────────────
export const allWorkNotes = myProjects.flatMap((p) =>
  (p.updates ?? []).map((u) => ({
    date: u.date,
    author: currentEmployee.name,
    body: u.note,
    isClientVisible: u.isClientVisible ?? true,
    projectId: p.id,
    projectName: p.name,
  }))
).sort((a, b) => (a.date < b.date ? 1 : -1));

// ─── Pure mutators ───────────────────────────────────────────────────────────
// Both return a NEW state object — the consumer page lifts the result into
// its own useState. Neither mutates the seed arrays above.

export function addComment(state, projectId, body) {
  const newEntry = {
    date: new Date().toISOString().slice(0, 10),
    author: currentEmployee.name,
    body,
    projectId,
    projectName: myProjects.find((p) => p.id === projectId)?.name ?? projectId,
  };
  return {
    ...state,
    commentsByProject: {
      ...state.commentsByProject,
      [projectId]: [...(state.commentsByProject[projectId] ?? []), { date: newEntry.date, author: newEntry.author, body }],
    },
    allComments: [newEntry, ...state.allComments],
  };
}

export function addWorkNote(state, projectId, body, isClientVisible = true) {
  const newEntry = {
    date: new Date().toISOString().slice(0, 10),
    author: currentEmployee.name,
    body,
    isClientVisible,
    projectId,
    projectName: myProjects.find((p) => p.id === projectId)?.name ?? projectId,
  };
  return {
    ...state,
    workNotesByProject: {
      ...state.workNotesByProject,
      [projectId]: [...(state.workNotesByProject[projectId] ?? []), { date: newEntry.date, author: newEntry.author, body, isClientVisible }],
    },
    allWorkNotes: [newEntry, ...state.allWorkNotes],
  };
}