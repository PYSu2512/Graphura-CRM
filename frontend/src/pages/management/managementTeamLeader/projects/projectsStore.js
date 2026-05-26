import { useState, useEffect } from "react";

// Dummy data & constants
export const EMPLOYEES = ["Pranjal Sharma", "Madhav Singh", "Shikhar Gupta", "Kriti Verma", "Aman Jain"];
export const PRIORITIES = ["Critical", "High", "Medium", "Low"];
export const STATUSES = ["Pending", "In Progress", "Completed", "Delayed", "On Hold"];
export const REASSIGN_REASONS = ["Overloaded", "Skill Mismatch", "Leave/Absence", "Underperformance", "Other"];

export const getAvatarColor = (name) => {
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6"];
  const sum = (name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

export const getInitials = (name) => {
  if (!name) return "";
  const parts = name.split(" ");
  return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
};

let globalProjects = [
  {
    id: 1,
    name: "Employee Mobile Dashboard",
    employee: "Pranjal Sharma",
    deadline: "2026-06-15",
    priority: "High",
    status: "In Progress",
    progress: 45,
    description: "Build the initial mobile dashboard view for executives."
  },
  {
    id: 2,
    name: "CRM Analytics Overhaul",
    employee: "Madhav Singh",
    deadline: "2026-07-01",
    priority: "Critical",
    status: "Pending",
    progress: 0,
    description: "Revamp the analytics charts to use Recharts instead of ApexCharts."
  }
];

let globalReassignHistory = [
  {
    id: 1,
    project: "CRM Analytics Overhaul",
    from: "Shikhar Gupta",
    to: "Madhav Singh",
    reason: "Overloaded",
    date: "2026-05-20"
  }
];

const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const useProjectsStore = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick(t => t + 1);
    listeners.add(update);
    return () => listeners.delete(update);
  }, []);

  const addProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: Date.now(),
      status: "Pending",
      progress: 0,
    };
    globalProjects = [newProject, ...globalProjects];
    notify();
    return newProject;
  };

  const updateProgress = ({ projectId, status, progress, note }) => {
    let entry = null;
    globalProjects = globalProjects.map((p) => {
      if (p.id === projectId) {
        const updated = { ...p, status, progress, note };
        entry = { project: updated.name, newPct: progress, status };
        return updated;
      }
      return p;
    });
    notify();
    return entry || { project: "Unknown", newPct: progress, status };
  };

  const reassignProject = ({ projectId, newEmployee, reason, notes }) => {
    let entry = null;
    globalProjects = globalProjects.map((p) => {
      if (p.id === projectId) {
        entry = { project: p.name, from: p.employee, to: newEmployee, reason };
        return { ...p, employee: newEmployee };
      }
      return p;
    });

    if (entry) {
      globalReassignHistory = [
        {
          id: Date.now(),
          project: entry.project,
          from: entry.from,
          to: entry.to,
          reason,
          date: new Date().toISOString().split("T")[0],
          notes
        },
        ...globalReassignHistory
      ];
    }
    notify();
    return entry || { project: "Unknown", from: "Unknown", to: newEmployee };
  };

  return {
    projects: globalProjects,
    reassignHistory: globalReassignHistory,
    addProject,
    updateProgress,
    reassignProject
  };
};

export default globalProjects;