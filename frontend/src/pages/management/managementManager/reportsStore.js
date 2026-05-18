// reportsStore.js — computed from canonical store
import { projects, teamLeaders } from "./managementManagerStore";

const getDaysDifference = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  return Math.max(
    Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    ),
    0
  );
};

const deliveredProjects = projects.filter(
  (project) =>
    project.status === "Delivered" &&
    project.deliveredDate
);

const onTimeProjects = deliveredProjects.filter(
  (project) =>
    new Date(project.deliveredDate) <=
    new Date(project.deadline)
);

const delayedDeliveredProjects =
  deliveredProjects.filter(
    (project) =>
      new Date(project.deliveredDate) >
      new Date(project.deadline)
  );

const avgDelayDays =
  delayedDeliveredProjects.length > 0
    ? Math.round(
        delayedDeliveredProjects.reduce(
          (total, project) =>
            total +
            getDaysDifference(
              project.deadline,
              project.deliveredDate
            ),
          0
        ) / delayedDeliveredProjects.length
      )
    : 0;

const avgCompletionDays =
  deliveredProjects.length > 0
    ? Math.round(
        deliveredProjects.reduce(
          (total, project) =>
            total +
            getDaysDifference(
              project.startDate,
              project.deliveredDate
            ),
          0
        ) / deliveredProjects.length
      )
    : 0;

export const teamReports = teamLeaders.map((tl) => {
  const tlProjects = projects.filter(
    (project) => project.assignedTL === tl.id
  );

  const delivered = tlProjects.filter(
    (project) => project.status === "Delivered"
  ).length;

  const delayed = tlProjects.filter(
    (project) => project.status === "Delayed"
  ).length;

  const inProgress = tlProjects.filter((project) =>
    [
      "In Progress",
      "Work Started",
      "Review Stage",
      "Finalization",
    ].includes(project.status)
  ).length;

  return {
    id: tl.id,
    name: tl.name,
    totalProjects: tlProjects.length,
    completed: delivered,
    delayed,
    inProgress,
  };
});

export const tlReports = teamReports;

export const deliveryMetrics = {
  totalDelivered: deliveredProjects.length,

  onTimeDelivered: onTimeProjects.length,

  delayedDelivered:
    delayedDeliveredProjects.length,

  onTimePercentage:
    Math.round(
      (onTimeProjects.length /
        Math.max(deliveredProjects.length, 1)) *
        1000
    ) / 10,

  avgDelayDays,
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

  if (
    new Date(project.deliveredDate) >
    new Date(project.deadline)
  ) {
    monthMap[month].delayed++;
  }
});

export const monthlyDeliveryData =
  Object.values(monthMap);

export const reportKPIs = {
  totalProjects: projects.length,

  completedProjects:
    deliveredProjects.length,

  onTimePercentage:
    deliveryMetrics.onTimePercentage,

  avgCompletionDays,
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
).sort((a, b) =>
  a.date.localeCompare(b.date)
);