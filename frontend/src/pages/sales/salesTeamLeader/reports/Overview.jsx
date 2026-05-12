import {
  Heading, DashGrid, DashCard,
  GLineChart, GColumnChart, GDoughnutChart,
} from "../../../../components/shared/Common_Components";
import {
  overviewKPIs,
  callsVsSalesData, leadsVsProspectsData,
  execPerfCompData,
  leadStatusData, leadStatusColors,
} from "./reportsStore";
import {
  Users, Phone, TrendingUp, CheckCircle,
  DollarSign, Trash2, AlertCircle, BarChart2,
} from "lucide-react";

const kpiIcons = [
  <Users size={22}/>, <Phone size={22}/>, <TrendingUp size={22}/>, <CheckCircle size={22}/>,
  <DollarSign size={22}/>, <Trash2 size={22}/>, <AlertCircle size={22}/>, <BarChart2 size={22}/>,
];

export default function Overview() {
  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Team Reports" secondaryText="Overview" size={12} />
      </DashGrid>

      {/* ── KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        {overviewKPIs.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={kpiIcons[i]} accentColor={k.accent} size={3} />
        ))}
      </DashGrid>

      {/* ── Charts Row 1 ── */}
      <DashGrid cols={12} gap={4}>
        <GLineChart
          title="Calls vs Sales"
          subtitle="Weekly team trend"
          data={callsVsSalesData}
          lines={[
            { key: "calls", color: "#3b82f6", label: "Calls" },
            { key: "sales", color: "#22c55e", label: "Sales" },
          ]}
          size={6} height={260}
        />
        <GLineChart
          title="Leads vs Prospects"
          subtitle="Weekly team trend"
          data={leadsVsProspectsData}
          lines={[
            { key: "leads",     color: "#8b5cf6", label: "Leads" },
            { key: "prospects", color: "#f59e0b", label: "Prospects" },
          ]}
          size={6} height={260}
        />
      </DashGrid>

      {/* ── Charts Row 2 ── */}
      <DashGrid cols={12} gap={4}>
        <GColumnChart
          title="Executive Performance"
          subtitle="Calls, Prospects & Sales per executive"
          data={execPerfCompData}
          bars={[
            { key: "calls",     color: "#3b82f6", label: "Calls" },
            { key: "prospects", color: "#8b5cf6", label: "Prospects" },
            { key: "sales",     color: "#22c55e", label: "Sales" },
          ]}
          size={8} height={260}
        />
        <GDoughnutChart
          title="Lead Status Breakdown"
          subtitle="Team-wide distribution"
          data={leadStatusData}
          colors={leadStatusColors}
          size={4} height={260}
        />
      </DashGrid>
    </div>
  );
}
