import {
  GAreaChart,
  GBarChart,
  GLineChart,
  GPieChart,
  Grid,
} from "../../../../../components/shared/Common_Components";

export default function ReportCharts({ type = "daily", completionData = [], statusData = [], productivityData = [], performanceData = [] }) {
  if (type === "weekly") {
    return (
      <Grid cols={12} gap={4}>
        <GLineChart
          title="Weekly Productivity"
          data={productivityData}
          lines={[{ key: "productivity", label: "Productivity %", color: "#2563eb" }]}
          size={6}
          height={260}
        />
        <GBarChart
          title="Employee Performance"
          data={performanceData}
          bars={[
            { key: "completed", label: "Completed", color: "#16a34a" },
            { key: "pending", label: "Pending", color: "#f59e0b" },
          ]}
          size={6}
          height={260}
        />
      </Grid>
    );
  }

  return (
    <Grid cols={12} gap={4}>
      <GAreaChart
        title="Daily Completion Trend"
        data={completionData}
        areas={[
          { key: "completed", label: "Completed", color: "#16a34a" },
          { key: "pending", label: "Pending", color: "#f59e0b" },
        ]}
        size={6}
        height={260}
      />
      <GPieChart
        title="Report Status"
        data={statusData}
        colors={["#16a34a", "#f59e0b", "#dc2626"]}
        size={6}
        height={260}
      />
    </Grid>
  );
}
