import { useState } from "react";

import {
  Grid,
  DataTable,
  GLineChart,
  GColumnChart,
} from "../../../../components/shared/Common_Components";

import { teamReports } from "../reportsStore";

export default function TeamReports() {

  const [filter, setFilter] = useState("Today");

  const totalProjects = teamReports.reduce(
    (acc, item) => acc + item.totalProjects,
    0
  );

  const totalCompleted = teamReports.reduce(
    (acc, item) => acc + item.completed,
    0
  );

  const totalDelayed = teamReports.reduce(
    (acc, item) => acc + item.delayed,
    0
  );

  /* FILTER DATA */
  const dataMap = {
    Today: teamReports.map((team) => ({
      name: team.name,
      completed: team.completed,
      delayed: team.delayed,
      inProgress: team.inProgress,
    })),

    Week: teamReports.map((team) => ({
      name: team.name,
      completed: team.completed + 2,
      delayed: team.delayed + 1,
      inProgress: team.inProgress + 1,
    })),

    Month: teamReports.map((team) => ({
      name: team.name,
      completed: team.completed + 5,
      delayed: team.delayed + 2,
      inProgress: team.inProgress + 3,
    })),

    Year: teamReports.map((team) => ({
      name: team.name,
      completed: team.completed + 12,
      delayed: team.delayed + 4,
      inProgress: team.inProgress + 7,
    })),
  };

  const chartData = dataMap[filter];

  /* FILTER BUTTONS */
  const FilterButtons = () => (
    <div className="flex gap-2 flex-wrap">
      {["Today", "Week", "Month", "Year"].map((item) => (
        <button
          key={item}
          onClick={() => setFilter(item)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            filter === item
              ? "bg-[#2a465a] text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">

      {/* SUMMARY CARDS */}
      <Grid cols={12} gap={6}>

        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Total Projects
          </p>

          <h2 className="text-3xl font-bold text-[#2a465a] mt-2">
            {totalProjects}
          </h2>
        </div>

        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Completed Projects
          </p>

          <h2 className="text-3xl font-bold text-emerald-600 mt-2">
            {totalCompleted}
          </h2>
        </div>

        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Delayed Projects
          </p>

          <h2 className="text-3xl font-bold text-red-500 mt-2">
            {totalDelayed}
          </h2>
        </div>

      </Grid>

      {/* CHARTS */}
      <Grid cols={12} gap={6}>

        {/* COMPLETION TREND */}
        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Completed Projects by Team
            </h2>

            <FilterButtons />
          </div>

          <GLineChart
            data={chartData}
            lines={[
              {
                key: "completed",
                label: "Completion Trend",
                color: "#2563eb",
              },
            ]}
            height={260}
            size={12}
          />

        </div>

        {/* DELAY TREND */}
        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Delayed Projects by Team
            </h2>

            <FilterButtons />
          </div>

          <GLineChart
            data={chartData}
            lines={[
              {
                key: "delayed",
                label: "Delay Trend",
                color: "#dc2626",
              },
            ]}
            height={260}
            size={12}
          />

        </div>

        {/* TEAM PERFORMANCE */}
        <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Team Performance Analytics
            </h2>

            <FilterButtons />
          </div>

          <GColumnChart
            data={chartData}
            bars={[
              {
                key: "completed",
                label: "Completed",
                color: "#10b981",
              },
              {
                key: "inProgress",
                label: "In Progress",
                color: "#f59e0b",
              },
              {
                key: "delayed",
                label: "Delayed",
                color: "#ef4444",
              },
            ]}
            height={320}
            size={12}
          />

        </div>

      </Grid>

      {/* TABLE */}
      <Grid cols={12} gap={4}>

        <DataTable
          title="Team Performance Report"
          columns={[
            { key: "id", label: "Team Leader ID" },
            { key: "name", label: "Team Leader Name" },
            { key: "totalProjects", label: "Total Projects" },
            { key: "completed", label: "Completed" },
            { key: "inProgress", label: "In Progress" },
            { key: "delayed", label: "Delayed" },
          ]}
          rows={teamReports}
          size={12}
          pageSize={10}
          searchable
          exportable
          exportFileName="team_reports_export"
        />

      </Grid>

    </div>
  );
}import { useState } from "react";

import {
  Grid,
  DataTable,
  GLineChart,
  GColumnChart,
} from "../../../../components/shared/Common_Components";

import { teamReports } from "../reportsStore";

export default function TeamReports() {

  const [filter, setFilter] = useState("Today");

  const totalProjects = teamReports.reduce(
    (acc, item) => acc + item.totalProjects,
    0
  );

  const totalCompleted = teamReports.reduce(
    (acc, item) => acc + item.completed,
    0
  );

  const totalDelayed = teamReports.reduce(
    (acc, item) => acc + item.delayed,
    0
  );

  /* FILTER DATA */
  const dataMap = {
    Today: teamReports.map((team) => ({
      name: team.name,
      completed: team.completed,
      delayed: team.delayed,
      inProgress: team.inProgress,
    })),

    Week: teamReports.map((team) => ({
      name: team.name,
      completed: team.completed + 2,
      delayed: team.delayed + 1,
      inProgress: team.inProgress + 1,
    })),

    Month: teamReports.map((team) => ({
      name: team.name,
      completed: team.completed + 5,
      delayed: team.delayed + 2,
      inProgress: team.inProgress + 3,
    })),

    Year: teamReports.map((team) => ({
      name: team.name,
      completed: team.completed + 12,
      delayed: team.delayed + 4,
      inProgress: team.inProgress + 7,
    })),
  };

  const chartData = dataMap[filter];

  /* FILTER BUTTONS */
  const FilterButtons = () => (
    <div className="flex gap-2 flex-wrap">
      {["Today", "Week", "Month", "Year"].map((item) => (
        <button
          key={item}
          onClick={() => setFilter(item)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            filter === item
              ? "bg-[#2a465a] text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">

      {/* SUMMARY CARDS */}
      <Grid cols={12} gap={6}>

        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Total Projects
          </p>

          <h2 className="text-3xl font-bold text-[#2a465a] mt-2">
            {totalProjects}
          </h2>
        </div>

        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Completed Projects
          </p>

          <h2 className="text-3xl font-bold text-emerald-600 mt-2">
            {totalCompleted}
          </h2>
        </div>

        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Delayed Projects
          </p>

          <h2 className="text-3xl font-bold text-red-500 mt-2">
            {totalDelayed}
          </h2>
        </div>

      </Grid>

      {/* CHARTS */}
      <Grid cols={12} gap={6}>

        {/* COMPLETION TREND */}
        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Completed Projects by Team
            </h2>

            <FilterButtons />
          </div>

          <GLineChart
            data={chartData}
            lines={[
              {
                key: "completed",
                label: "Completion Trend",
                color: "#2563eb",
              },
            ]}
            height={260}
            size={12}
          />

        </div>

        {/* DELAY TREND */}
        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Delayed Projects by Team
            </h2>

            <FilterButtons />
          </div>

          <GLineChart
            data={chartData}
            lines={[
              {
                key: "delayed",
                label: "Delay Trend",
                color: "#dc2626",
              },
            ]}
            height={260}
            size={12}
          />

        </div>

        {/* TEAM PERFORMANCE */}
        <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Team Performance Analytics
            </h2>

            <FilterButtons />
          </div>

          <GColumnChart
            data={chartData}
            bars={[
              {
                key: "completed",
                label: "Completed",
                color: "#10b981",
              },
              {
                key: "inProgress",
                label: "In Progress",
                color: "#f59e0b",
              },
              {
                key: "delayed",
                label: "Delayed",
                color: "#ef4444",
              },
            ]}
            height={320}
            size={12}
          />

        </div>

      </Grid>

      {/* TABLE */}
      <Grid cols={12} gap={4}>

        <DataTable
          title="Team Performance Report"
          columns={[
            { key: "id", label: "Team Leader ID" },
            { key: "name", label: "Team Leader Name" },
            { key: "totalProjects", label: "Total Projects" },
            { key: "completed", label: "Completed" },
            { key: "inProgress", label: "In Progress" },
            { key: "delayed", label: "Delayed" },
          ]}
          rows={teamReports}
          size={12}
          pageSize={10}
          searchable
          exportable
          exportFileName="team_reports_export"
        />

      </Grid>

    </div>
  );
}