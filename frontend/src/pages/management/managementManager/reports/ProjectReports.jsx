import {
  Grid,
  GLineChart,
} from "../../../../components/shared/Common_Components";
import { projectReports } from "../reportsStore";

export default function ProjectReports() {
  const chartData = projectReports.map((p) => ({
    name: p.date.slice(5),
    delivered: p.delivered,
    inProgress: p.inProgress,
    delayed: p.delayed,
  }));

  const totalDelivered = chartData.reduce(
    (acc, item) => acc + item.delivered,
    0
  );

  const totalInProgress = chartData.reduce(
    (acc, item) => acc + item.inProgress,
    0
  );

  const totalDelayed = chartData.reduce(
    (acc, item) => acc + item.delayed,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <Grid cols={12} gap={4}>
        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Completed
          </p>

          <h2 className="text-3xl font-bold text-emerald-600 mt-2">
            {totalDelivered}
          </h2>
        </div>

        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            In Progress
          </p>

          <h2 className="text-3xl font-bold text-amber-500 mt-2">
            {totalInProgress}
          </h2>
        </div>

        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Delayed Projects
          </p>

          <h2 className="text-3xl font-bold text-red-500 mt-2">
            {totalDelayed}
          </h2>
        </div>
      </Grid>

      {/* Main Charts */}
      <Grid cols={12} gap={6}>
        <GLineChart
          data={chartData}
          lines={[
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
          title="Daily Project Status Trend"
          height={320}
          size={12}
        />

        <GLineChart
          data={chartData}
          lines={[
            {
              key: "delivered",
              label: "Completion Growth",
              color: "#2563eb",
            },
          ]}
          title="Completed Projects Growth"
          height={300}
          size={6}
        />

        <GLineChart
          data={chartData}
          lines={[
            {
              key: "delayed",
              label: "Delay Analysis",
              color: "#dc2626",
            },
          ]}
          title="Delayed Projects Analysis"
          height={300}
          size={6}
        />
      </Grid>
    </div>
  );
}