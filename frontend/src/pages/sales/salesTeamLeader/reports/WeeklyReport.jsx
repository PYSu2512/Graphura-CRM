import {
  Heading, DashGrid, DashCard, DataTable, GAreaChart,
} from "../../../../components/shared/Common_Components";
import { weeklyReport } from "./reportsStore";
import { Phone, TrendingUp, ClipboardList, DollarSign } from "lucide-react";

const COLS = [
  { key: "weekStart",  label: "Week Start" },
  { key: "weekEnd",    label: "Week End" },
  { key: "totalCalls", label: "Total Calls" },
  { key: "prospects",  label: "Prospects" },
  { key: "sales",      label: "Sales" },
  { key: "revenue",    label: "Revenue" },
  { key: "dump",       label: "Dump" },
  { key: "conversion", label: "Conversion %" },
];

export default function WeeklyReport() {
  // Latest week summary
  const latest = weeklyReport[0];

  // Convert revenue strings (₹2,40,000) to numbers for the chart
  const trend = [...weeklyReport].reverse().map((w) => ({
    name: w.weekStart.slice(5),
    calls: w.totalCalls,
    sales: w.sales,
  }));

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Weekly" secondaryText="Report" size={12} />
      </DashGrid>

      {/* ── Latest week KPIs ── */}
      <DashGrid cols={12} gap={4}>
        <DashCard title="Calls (this week)"     value={String(latest.totalCalls)} icon={<Phone size={22}/>}         accentColor="#3b82f6" size={3} />
        <DashCard title="Prospects (this week)" value={String(latest.prospects)}  icon={<ClipboardList size={22}/>} accentColor="#8b5cf6" size={3} />
        <DashCard title="Sales (this week)"     value={String(latest.sales)}      icon={<TrendingUp size={22}/>}    accentColor="#22c55e" size={3} />
        <DashCard title="Revenue (this week)"   value={latest.revenue}            icon={<DollarSign size={22}/>}    accentColor="#f59e0b" size={3} />
      </DashGrid>

      {/* ── Trend chart ── */}
      <GAreaChart
        title="Weekly Calls vs Sales Trend"
        subtitle="Team activity across recent weeks"
        data={trend}
        areas={[
          { key: "calls", label: "Calls", color: "#3b82f6" },
          { key: "sales", label: "Sales", color: "#22c55e" },
        ]}
        size={12}
        height={280}
      />

      {/* ── Weekly history ── */}
      <DataTable
        title="Weekly Report History"
        columns={COLS}
        rows={weeklyReport}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="weekly_report"
      />
    </div>
  );
}
