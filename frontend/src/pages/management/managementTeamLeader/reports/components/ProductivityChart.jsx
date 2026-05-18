import { GColumnChart, GDoughnutChart, GAreaChart, Grid } from "../../../../../components/shared/Common_Components";
import { productivityTrend, projectStatusData, workloadData } from "../reportData";

export default function ProductivityChart() {
  return (
    <Grid cols={12} gap={6}>
      <GAreaChart
        title="Team Productivity Trend"
        subtitle="Daily completion rhythm and delay pressure"
        data={productivityTrend}
        xKey="name"
        areas={[
          { key: "productivity", label: "Productivity %", color: "#0f766e" },
          { key: "completed", label: "Completed", color: "#2563eb" },
          { key: "delayed", label: "Delayed", color: "#dc2626" },
        ]}
        size={5}
        height={320}
      />
      <GColumnChart
        title="Team Workload"
        subtitle="Assigned vs completed project load"
        data={workloadData}
        bars={[
          { key: "assigned", label: "Assigned", color: "#7c3aed" },
          { key: "completed", label: "Completed", color: "#16a34a" },
        ]}
        size={4}
        height={320}
      />
      <GDoughnutChart
        title="Project Status"
        subtitle="Completed, active, pending, delayed"
        data={projectStatusData}
        colors={["#16a34a", "#f59e0b", "#dc2626", "#2563eb"]}
        size={3}
        height={320}
      />
    </Grid>
  );
}
