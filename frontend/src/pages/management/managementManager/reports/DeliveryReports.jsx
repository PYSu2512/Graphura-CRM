import { useState } from "react";

import {
  Grid,
  DashCard,
  GColumnChart,
  GLineChart,
} from "../../../../components/shared/Common_Components";

import {
  deliveryMetrics,
} from "../reportsStore";

import {
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function DeliveryReports() {

  const [filter, setFilter] = useState("Today");

  /* DYNAMIC REPORT DATA */
  const dataMap = {
    Today: [
      { name: "Mon", delivered: 2, delayed: 0 },
      { name: "Tue", delivered: 3, delayed: 1 },
      { name: "Wed", delivered: 4, delayed: 0 },
      { name: "Thu", delivered: 2, delayed: 1 },
    ],

    Week: [
      { name: "Week 1", delivered: 8, delayed: 1 },
      { name: "Week 2", delivered: 10, delayed: 2 },
      { name: "Week 3", delivered: 12, delayed: 1 },
      { name: "Week 4", delivered: 9, delayed: 0 },
    ],

    Month: [
      { name: "Jan", delivered: 15, delayed: 2 },
      { name: "Feb", delivered: 18, delayed: 1 },
      { name: "Mar", delivered: 20, delayed: 3 },
      { name: "Apr", delivered: 25, delayed: 1 },
    ],

    Year: [
      { name: "2023", delivered: 120, delayed: 12 },
      { name: "2024", delivered: 160, delayed: 8 },
      { name: "2025", delivered: 210, delayed: 6 },
      { name: "2026", delivered: 250, delayed: 4 },
    ],
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

      {/* KPI CARDS */}
      <Grid cols={12} gap={6}>

        <div className="col-span-12 md:col-span-3">
          <DashCard
            title="Total Delivered"
            value={deliveryMetrics.totalDelivered}
            icon={<CheckCircle size={20} />}
            accentColor="#10b981"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <DashCard
            title="On-Time Delivery %"
            value={`${deliveryMetrics.onTimePercentage.toFixed(1)}%`}
            icon={<TrendingUp size={20} />}
            accentColor="#3b82f6"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <DashCard
            title="Delayed Deliveries"
            value={deliveryMetrics.delayedDelivered}
            icon={<AlertCircle size={20} />}
            accentColor="#ef4444"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <DashCard
            title="Avg Delay Days"
            value={deliveryMetrics.avgDelayDays}
            icon={<AlertCircle size={20} />}
            accentColor="#f59e0b"
          />
        </div>

      </Grid>

      {/* CHARTS */}
      <Grid cols={12} gap={6}>

        {/* DELIVERY GROWTH */}
        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Delivery Growth Analysis
            </h2>

            <FilterButtons />
          </div>

          <GLineChart
            data={chartData}
            lines={[
              {
                key: "delivered",
                label: "Delivery Growth",
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
              Delay Trend Analysis
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

        {/* MONTHLY DELIVERY TREND */}
        <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2a465a]">
              Monthly Delivery Trend
            </h2>

            <FilterButtons />
          </div>

          <GColumnChart
            data={chartData}
            bars={[
              {
                key: "delivered",
                label: "Delivered",
                color: "#10b981",
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