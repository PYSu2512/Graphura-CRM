import React, { useState } from "react";
import {
  Heading,
  DashCard,
  GPieChart,
} from "../../../components/shared/Common_Components";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ---------------- PERFORMANCE DATA ---------------- */

const allData = {
  week: [
    { label: "Mon", score: 65 },
    { label: "Tue", score: 72 },
    { label: "Wed", score: 68 },
    { label: "Thu", score: 80 },
    { label: "Fri", score: 75 },
    { label: "Sat", score: 85 },
    { label: "Sun", score: 78 },
  ],

  month: [
    { label: "Week 1", score: 70 },
    { label: "Week 2", score: 75 },
    { label: "Week 3", score: 80 },
    { label: "Week 4", score: 82 },
  ],

  year: [
    { label: "Jan", score: 60 },
    { label: "Feb", score: 65 },
    { label: "Mar", score: 70 },
    { label: "Apr", score: 75 },
    { label: "May", score: 78 },
    { label: "Jun", score: 80 },
  ],
};

const pieData = [
  {
    name: "Completed",
    value: 40,
  },
  {
    name: "In Progress",
    value: 35,
  },
  {
    name: "Pending",
    value: 25,
  },
];

export default function ManagementEmployeePerformance() {
  const [filter, setFilter] = useState("week");

  return (
    <div className="p-6 bg-[#f4f7fb] min-h-screen space-y-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <Heading
          title="My Performance"
          subtitle="Track your work performance and analytics"
        />

        <div className="flex gap-2 flex-wrap">
          {["week", "month", "year"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === type
                  ? "bg-[#2a465a] text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              {type === "week"
                ? "This Week"
                : type === "month"
                ? "This Month"
                : "This Year"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">

        <DashCard
          title="Total Assigned"
          value="18"
        />

        <DashCard
          title="Completed"
          value="12"
        />

        <DashCard
          title="Active Projects"
          value="4"
        />

        <DashCard
          title="On-Time %"
          value="76%"
        />

      </div>

      {/* CHART SECTION */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* LINE CHART */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">

          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">
            Performance Overview
          </h2>

          <div className="h-[320px]">

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={allData[filter]}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="label" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2a465a"
                  strokeWidth={3}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">

          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">
            Project Status Mix
          </h2>

          <div className="h-[320px]">

            <GPieChart
              data={pieData}
              dataKey="value"
              nameKey="name"
              colors={[
                "#22c55e",
                "#f59e0b",
                "#ef4444",
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  );
}