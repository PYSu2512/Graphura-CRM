import { GBarChart, GColumnChart, GLineChart, GPieChart, Grid } from "../../../../../components/shared/Common_Components";
import {
  completedPendingData,
  employeePerformanceComparison,
  productivityTrend,
  projectStatusData,
} from "../reportData";

export default function ProductivityChart() {
  return (
    <Grid cols={12} gap={6}>
      <GColumnChart
        title="Completed vs Pending"
        subtitle="Daily project completion comparison"
        data={completedPendingData}
        bars={[
          { key: "completed", label: "Completed", color: "#16a34a" },
          { key: "pending", label: "Pending", color: "#f59e0b" },
        ]}
        size={6}
        height={320}
      />
      <GLineChart
        title="Weekly Productivity Trend"
        subtitle="Team efficiency movement across the week"
        data={productivityTrend}
        lines={[
          { key: "productivity", label: "Productivity %", color: "#0f766e" },
        ]}
        size={6}
        height={320}
      />
      <GPieChart
        title="Project Distribution by Status"
        subtitle="Active, completed, pending, and delayed projects"
        data={projectStatusData}
        colors={["#16a34a", "#f59e0b", "#dc2626", "#2563eb"]}
        size={4}
        height={320}
      />
      <GBarChart
        title="Employee Performance Comparison"
        subtitle="Completed, pending, delayed, and quality issue counts"
        data={employeePerformanceComparison}
        bars={[
          { key: "completed", label: "Completed", color: "#16a34a" },
          { key: "pending", label: "Pending", color: "#f59e0b" },
          { key: "delayed", label: "Delayed", color: "#dc2626" },
          { key: "qualityIssues", label: "Quality Issues", color: "#7c3aed" },
        ]}
        size={8}
        height={320}
      />
    </Grid>
  );
}
