import {
  Heading, DashGrid, DashCard, DataTable,
} from "../../../../components/shared/Common_Components";
import { selfDailyReport, selfDailyHistory } from "./reportsStore";
import { Phone, ClipboardList, TrendingUp, Trash2, EyeOff, Calendar } from "lucide-react";

const HISTORY_COLS = [
  { key: "date",           label: "Date" },
  { key: "totalCalls",     label: "Total Calls" },
  { key: "todayCalls",     label: "Today Calls" },
  { key: "todayProspect",  label: "Prospects" },
  { key: "todaySell",      label: "Sells" },
  { key: "todayDumpData",  label: "Dump" },
  { key: "totalUntouched", label: "Untouched" },
];

export default function DailyReport() {
  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="My Daily" secondaryText="Report" size={12} />
      </DashGrid>

      {/* ── Today's KPIs ── */}
      <DashGrid cols={12} gap={4}>
        <DashCard title="Total Calls"     value={String(selfDailyReport.totalCalls)}     icon={<Phone size={22}/>}        accentColor="#3b82f6" size={2} />
        <DashCard title="Today Calls"     value={String(selfDailyReport.todayCalls)}     icon={<Phone size={22}/>}        accentColor="#14b8a6" size={2} />
        <DashCard title="Today Prospects" value={String(selfDailyReport.todayProspect)}  icon={<ClipboardList size={22}/>} accentColor="#8b5cf6" size={2} />
        <DashCard title="Today Sells"     value={String(selfDailyReport.todaySell)}      icon={<TrendingUp size={22}/>}   accentColor="#22c55e" size={2} />
        <DashCard title="Today Dump"      value={String(selfDailyReport.todayDumpData)}  icon={<Trash2 size={22}/>}       accentColor="#f43f5e" size={2} />
        <DashCard title="Total Untouched" value={String(selfDailyReport.totalUntouched)} icon={<EyeOff size={22}/>}       accentColor="#f59e0b" size={2} />
      </DashGrid>

      <p className="text-xs text-slate-500">
        Personal report covering my activity. As Team Leader my daily numbers are tracked alongside the team.
      </p>

      {/* ── History ── */}
      <DataTable
        title="Daily Report History"
        columns={HISTORY_COLS}
        rows={selfDailyHistory}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="my_daily_report"
      />
    </div>
  );
}
