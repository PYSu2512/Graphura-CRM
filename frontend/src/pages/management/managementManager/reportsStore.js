// reportsStore.js — computed from canonical store
import { projects, teamLeaders } from "./managementManagerStore";

export const teamReports = teamLeaders.map((tl) => {
  const tlProjects = projects.filter(
    (project) => project.assignedTL === tl.id
  );

  const deliveredProjects = tlProjects.filter(
    (project) => project.status === "Delivered"
  );

  const delayedProjects = tlProjects.filter(
    (project) => project.status === "Delayed"
  );

  return {
    id: tl.id,
    name: tl.name,
    totalProjects: tlProjects.length,
    completed: deliveredProjects.length,
    delayed: delayedProjects.length,
    inProgress:
      tlProjects.length -
      deliveredProjects.length -
      delayedProjects.length,
  };
});

export const tlReports = teamReports;

export const deliveryMetrics = {
  totalDelivered: projects.filter(
    (project) => project.status === "Delivered"
  ).length,

  onTimeDelivered: projects.filter(
    (project) =>
      project.status === "Delivered" &&
      project.handoverLink
  ).length,

  delayedDelivered: projects.filter(
    (project) =>
      project.status === "Delivered" &&
      !project.handoverLink
  ).length,

  onTimePercentage:
    Math.round(
      (
        projects.filter(
          (project) =>
            project.status === "Delivered" &&
            project.handoverLink
        ).length /
        Math.max(
          projects.filter(
            (project) => project.status === "Delivered"
          ).length,
          1
        )
      ) * 1000
    ) / 10,

  avgDelayDays: 2.5,
};

const monthMap = {};

projects.forEach((project) => {
  if (!project.deliveredDate) return;

  const month = new Date(
    project.deliveredDate
  ).toLocaleString("en-IN", {
    month: "short",
  });

  if (!monthMap[month]) {
    monthMap[month] = {
      month,
      delivered: 0,
      delayed: 0,
    };
  }

  monthMap[month].delivered++;
});

export const monthlyDeliveryData =
  Object.values(monthMap);

export const reportKPIs = {
  totalProjects: projects.length,

  completedProjects: projects.filter(
    (project) => project.status === "Delivered"
  ).length,

  onTimePercentage:
    deliveryMetrics.onTimePercentage,

  avgCompletionDays: 13.5,
};

const dailyMap = {};

projects.forEach((project) => {
  const date = project.lastUpdated;

  if (!dailyMap[date]) {
    dailyMap[date] = {
      date,
      delivered: 0,
      inProgress: 0,
      delayed: 0,
    };
  }

  if (project.status === "Delivered") {
    dailyMap[date].delivered++;
  }

  if (
    [
      "In Progress",
      "Work Started",
      "Review Stage",
      "Finalization",
    ].includes(project.status)
  ) {
    dailyMap[date].inProgress++;
  }

  if (project.status === "Delayed") {
    dailyMap[date].delayed++;
  }
});

export const projectReports = Object.values(
  dailyMap
).sort((a, b) => a.date.localeCompare(b.date));