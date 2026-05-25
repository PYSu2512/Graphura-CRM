import { useState } from "react";

import {
  Grid,
  GLineChart,
  GBarChart,
} from "../../../../components/shared/Common_Components";

import { projectReports } from "../reportsStore";

export default function ProjectReports() {

  const [filter, setFilter] = useState("Today");

  /* FILTER DATA */
  const dataMap = {
    Today: projectReports.map((p) => ({
      name: p.date.slice(5),
      delivered: p.delivered,
      inProgress: p.inProgress,
      delayed: p.delayed,
    })),

    Week: projectReports.map((p) => ({
      name: p.date.slice(5),
      delivered: p.delivered + 2,
      inProgress: p.inProgress + 1,
      delayed: p.delayed + 1,
    })),

    Month: projectReports.map((p) => ({
      name: p.date.slice(5),
      delivered: p.delivered + 5,
      inProgress: p.inProgress + 3,
      delayed: p.delayed + 2,
    })),

    Year: projectReports.map((p) => ({
      name: p.date.slice(5),
      delivered: p.delivered + 12,
      inProgress: p.inProgress + 8,
      delayed: p.delayed + 4,
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

      {/* CHARTS */}
      <Grid cols={12} gap={6}>

        {/* COMPLETED PROJECTS */}
        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Completed Projects Growth
            </h2>

            <FilterButtons />
          </div>

          <GLineChart
            data={chartData}
            lines={[
              {
                key: "delivered",
                label: "Completion Growth",
                color: "#2563eb",
              },
            ]}
            height={260}
            size={12}
          />

        </div>

        {/* DELAY ANALYSIS */}
        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Delayed Projects Analysis
            </h2>

            <FilterButtons />
          </div>

          <GLineChart
            data={chartData}
            lines={[
              {
                key: "delayed",
                label: "Delay Analysis",
                color: "#dc2626",
              },
            ]}
            height={260}
            size={12}
          />

        </div>

        {/* MAIN OVERVIEW */}
        <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Daily Project Status Trend
            </h2>

            <FilterButtons />
          </div>

          <GBarChart
            data={chartData}
            bars={[
              {
                key: "delivered",
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

    </div>
  );
}