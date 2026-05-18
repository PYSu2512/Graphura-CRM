import { GAreaChart, GBarChart, GPieChart, Grid } from "../../../../../components/shared/Common_Components";
import { executiveConversions, leadSourcePerformance, weeklyConversions } from "../data/progressData";

export default function ConversionAnalytics() {
  return (
    <Grid cols={12} gap={6}>
      <GAreaChart
        title="Weekly Conversion & Revenue Trend"
        subtitle="Daily conversions, revenue, and call velocity"
        data={weeklyConversions}
        areas={[
          { key: "conversions", label: "Conversions", color: "#16a34a" },
          { key: "revenue", label: "Revenue (L)", color: "#2563eb" },
        ]}
        size={5}
        height={320}
      />
      <GBarChart
        title="Executive Conversion Comparison"
        subtitle="Prospects created vs converted"
        data={executiveConversions}
        bars={[
          { key: "prospects", label: "Prospects", color: "#7c3aed" },
          { key: "converted", label: "Converted", color: "#16a34a" },
        ]}
        size={4}
        height={320}
      />
      <GPieChart
        title="Lead Source Performance"
        subtitle="Conversion contribution by source"
        data={leadSourcePerformance}
        colors={["#2563eb", "#16a34a", "#f59e0b", "#7c3aed", "#0891b2"]}
        size={3}
        height={320}
      />
    </Grid>
  );
}
