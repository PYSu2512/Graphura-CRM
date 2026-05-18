import { Grid, GLineChart } from "../../../../components/shared/Common_Components";
import { projectReports } from "../reportsStore";

export default function ProjectReports() {
  const chartData = projectReports.map((p) => ({
    name:       p.date.slice(5),
    delivered:  p.delivered,
    inProgress: p.inProgress,
    delayed:    p.delayed,
  }));

  return (
    <Grid cols={12} gap={4}>
      <GLineChart
        data={chartData}
        lines={[
          { key: "delivered",  label: "Delivered",   color: "#10b981" },
          { key: "inProgress", label: "In Progress", color: "#f59e0b" },
          { key: "delayed",    label: "Delayed",     color: "#ef4444" },
        ]}
        title="Daily Project Status Trend"
        height={300}
        size={12}
      />
    </Grid>
  );
}