/**
 * ReportsPage.jsx — Management Team Leader
 * Fully dynamic — data from /api/management-tl/reports-data?type=daily|weekly
 */

import { useState, useEffect, useCallback } from "react";
import { CalendarCheck, History, RefreshCw } from "lucide-react";
import {
  Heading, EnhancedDashCard, DashGrid, GLineChart, GColumnChart, GPieChart, DataTable,
} from "../../../../components/shared/Common_Components";
import apiClient from "../../../../services/apiClient";
import toast from "react-hot-toast";

// ── UI atoms ──────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    "Completed":    { bg:"#dcfce7", color:"#16a34a" },
    "In Progress":  { bg:"#dbeafe", color:"#2563eb" },
    "Not Started":  { bg:"#f1f5f9", color:"#64748b" },
    "Delayed":      { bg:"#fee2e2", color:"#dc2626" },
    "Review Stage": { bg:"#fef3c7", color:"#d97706" },
    "Excellent":    { bg:"#dcfce7", color:"#16a34a" },
    "Good":         { bg:"#dbeafe", color:"#2563eb" },
    "Average":      { bg:"#fef3c7", color:"#d97706" },
  };
  const s = map[status] || { bg:"#f1f5f9", color:"#64748b" };
  return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ background:s.bg, color:s.color }}>{status}</span>;
}

function PriorityBadge({ priority }) {
  const map = {
    Critical:{bg:"#fef2f2",color:"#dc2626",border:"#fecaca"},
    High:    {bg:"#fff7ed",color:"#ea580c",border:"#fed7aa"},
    Medium:  {bg:"#fffbeb",color:"#d97706",border:"#fde68a"},
    Low:     {bg:"#f0fdf4",color:"#16a34a",border:"#bbf7d0"},
  };
  const s = map[priority] || map["Medium"];
  return <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border" style={{background:s.bg,color:s.color,borderColor:s.border}}>{priority}</span>;
}

function ProgressBar({ value }) {
  const color = value === 100 ? "#22c55e" : value > 0 ? "#3b82f6" : "#94a3b8";
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full" style={{ width:`${value}%`, background:`linear-gradient(90deg,#2a465a,${color})` }} />
      </div>
      <span className="text-xs font-bold text-slate-600 w-7">{value}%</span>
    </div>
  );
}

// ── KPI accent colors ─────────────────────────────────────────────────────────
const DAILY_ACCENTS  = ["#2563eb","#f59e0b","#16a34a","#7c3aed"];
const WEEKLY_ACCENTS = ["#2563eb","#16a34a","#dc2626","#7c3aed"];

const DAILY_COLS = [
  { key: "id",          label: "ID" },
  { key: "projectName", label: "Project" },
  { key: "status",      label: "Status",   render: (v) => <StatusPill status={v} /> },
  { key: "progress",    label: "Progress", render: (v) => <ProgressBar value={v} />, sortValue: (row) => row.progress },
  { key: "deadline",    label: "Deadline",
    render: (v, row) => <span className={row.isOverdue ? "text-rose-600 font-bold" : ""}>{v || "—"}</span> },
  { key: "priority",    label: "Priority", render: (v) => <PriorityBadge priority={v} /> },
  { key: "totalTasks",  label: "Tasks" },
  { key: "completed",   label: "Done",     render: (v) => <span className="text-emerald-700 font-bold">{v}</span> },
  { key: "delayed",     label: "Delayed",  render: (v) => <span className={v > 0 ? "text-rose-600 font-bold" : "text-slate-500"}>{v}</span> },
];

const WEEKLY_COLS = [
  { key: "name",         label: "Employee" },
  { key: "totalTasks",   label: "Total Tasks" },
  { key: "completed",    label: "Completed" },
  { key: "pending",      label: "Pending" },
  { key: "delayed",      label: "Delayed",   render: (v) => <span className={v > 0 ? "text-rose-600 font-bold" : "text-slate-400"}>{v}</span> },
  { key: "productivity", label: "Productivity" },
  { key: "weeklyStatus", label: "Status", render: (v) => <StatusPill status={v} /> },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("daily");
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);

  const load = useCallback(async (type) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/management-tl/reports-data?type=${type}`);
      setData(res.data?.data || null);
    } catch {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(reportType); }, [reportType, load]);

  const dailyKpiLabels  = ["Total Tasks",        "Pending",         "Completed",        "Delayed"];
  const weeklyKpiLabels = ["Total Employees",     "Excellent",       "Delayed Status",   "Avg Productivity"];

  const kpiValues = data ? (
    reportType === 'daily'
      ? [data.metrics?.total, data.metrics?.pending, data.metrics?.completed, data.metrics?.delayed]
      : [data.metrics?.totalReports, data.metrics?.excellent, data.metrics?.delayed, data.metrics?.avgProductivity]
  ) : Array(4).fill("—");

  const kpiLabels  = reportType === 'daily' ? dailyKpiLabels : weeklyKpiLabels;
  const kpiAccents = reportType === 'daily' ? DAILY_ACCENTS  : WEEKLY_ACCENTS;

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Management Team" secondaryText="Reports" showAnimations />

      {/* Tab bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm w-fit">
          {[
            { key: "daily",  label: "Daily Progress Report", icon: CalendarCheck },
            { key: "weekly", label: "Weekly Update",          icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => setReportType(key)}
              className={`flex items-center gap-2.5 rounded-[14px] px-5 py-2.5 text-[15px] font-bold transition-all ${
                reportType === key
                  ? "bg-[#2a465a] text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => load(reportType)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:text-[#2a465a] hover:bg-slate-50 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI cards */}
      <DashGrid cols={12} gap={4}>
        {kpiLabels.map((label, i) => (
          <EnhancedDashCard key={label} title={label}
            value={loading ? "—" : String(kpiValues[i] ?? 0)}
            accentColor={kpiAccents[i]} size={3} />
        ))}
      </DashGrid>

      {/* Daily charts */}
      {reportType === 'daily' && data && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7">
            <GLineChart
              title="Daily Completion Trend"
              subtitle="Completed vs pending tasks — last 7 days"
              data={data.dailyTrend || []}
              lines={[
                { key: "completed", label: "Completed", color: "#22c55e" },
                { key: "pending",   label: "Pending",   color: "#f59e0b" },
              ]}
              height={280}
            />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <GPieChart
              title="Report Status"
              subtitle="Task status distribution"
              data={data.statusData || []}
              colors={["#22c55e","#ef4444","#f59e0b"]}
              height={280}
            />
          </div>
        </div>
      )}

      {/* Daily table */}
      {reportType === 'daily' && (
        <DataTable
          title="Project Progress Report"
          columns={DAILY_COLS}
          rows={data?.projectRows || []}
          pageSize={5}
          searchable
          exportable
          exportFileName="daily_report"
          loading={loading}
          filters={[
            { title: "Status",   type: "toggle", key: "status",   options: ["Not Started","In Progress","Review Stage","Completed","Delayed"] },
            { title: "Priority", type: "toggle", key: "priority", options: ["Critical","High","Medium","Low"] },
          ]}
        />
      )}

      {/* Weekly charts */}
      {reportType === 'weekly' && data && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7">
            <GColumnChart
              title="Employee Productivity"
              subtitle="Completed vs pending per team member"
              data={data.performanceData || []}
              bars={[
                { key: "completed", label: "Completed", color: "#22c55e" },
                { key: "pending",   label: "Pending",   color: "#f59e0b" },
              ]}
              height={280}
            />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <GColumnChart
              title="Productivity %"
              subtitle="Task completion rate per employee"
              data={data.productivityData || []}
              bars={[
                { key: "productivity", label: "Productivity %", color: "#3b82f6" },
              ]}
              height={280}
            />
          </div>
        </div>
      )}

      {/* Weekly table */}
      {reportType === 'weekly' && (
        <DataTable
          title="Weekly Employee Performance"
          columns={WEEKLY_COLS}
          rows={data?.weeklyRows || []}
          pageSize={5}
          searchable
          exportable
          exportFileName="weekly_report"
          loading={loading}
          filters={[
            { title: "Status", type: "toggle", key: "weeklyStatus", options: ["Excellent","Good","Average","Delayed"] },
          ]}
        />
      )}
    </div>
  );
}
