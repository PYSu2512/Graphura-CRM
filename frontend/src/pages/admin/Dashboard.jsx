/**
 * Admin Dashboard — fully dynamic
 * Data from GET /api/admin/dashboard
 */

import { useState, useEffect, useCallback } from "react";
import {
  Users, Target, FolderKanban, IndianRupee,
  UserCheck, UserX, Clock, CalendarCheck,
  Eye, RefreshCw, AlertCircle,
} from "lucide-react";
import {
  Grid, DashGrid, EnhancedDashCard, Heading,
  GAreaChart, GColumnChart, GPieChart, GDoughnutChart, GBarChart,
  DataTable, Modal, ModalData, ModalGrid, Button, openModal, closeModal,
} from "../../components/shared/Common_Components";
import apiClient from "../../services/apiClient";

const fmtRevenue = (n = 0) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const pipelineColors = ["#64748b","#3b82f6","#8b5cf6","#14b8a6","#22c55e"];

const recentProjectCols = [
  { key: "name",     label: "Project Name" },
  { key: "status",   label: "Status"       },
  { key: "progress", label: "Progress %"   },
  { key: "deadline", label: "Deadline"     },
];

const loginCols = [
  { key: "name", label: "Name"       },
  { key: "role", label: "Role"       },
  { key: "ip",   label: "IP Address" },
  { key: "time", label: "Time"       },
];

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [selProj, setSelProj] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiClient.get("/admin/dashboard");
      setData(res.data?.data || null);
    } catch (err) {
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis     = data?.kpis          || {};
  const projStats= data?.projStats      || {};
  const pipeline = data?.leadPipeline   || [];
  const revTrend = data?.revenueTrend   || [];
  const revExp   = data?.revExpTrend    || [];
  const projProg = data?.projectProgress|| [];
  const hrm      = data?.hrmSnapshot    || {};
  const logins   = data?.loginRows      || [];

  // Sales donut — use lead conversion ratio
  const convRate = kpis.totalLeads > 0
    ? Math.round((pipeline.find((p) => p.name === "Prospect")?.value || 0) / kpis.totalLeads * 100)
    : 0;

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      <Grid cols={12} gap={4}>
        <Heading primaryText="Admin " secondaryText="Dashboard" size={12} />
      </Grid>

      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm col-span-12">
          <AlertCircle size={16} /> {error}
          <button onClick={load} className="ml-auto flex items-center gap-1 text-xs underline"><RefreshCw size={12}/> Retry</button>
        </div>
      )}

      {/* KPI Cards */}
      <Grid cols={12} gap={4}>
        <EnhancedDashCard title="Total Users"  value={loading ? "—" : String(kpis.totalUsers  ?? 0)} icon={<Users size={20}/>}        accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Leads"         value={loading ? "—" : String(kpis.totalLeads  ?? 0)} icon={<Target size={20}/>}        accentColor="#8b5cf6" size={3} />
        <EnhancedDashCard title="Projects"      value={loading ? "—" : String(kpis.totalProjects ?? 0)} icon={<FolderKanban size={20}/>} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Revenue"       value={loading ? "—" : fmtRevenue(kpis.totalRevenue)}  icon={<IndianRupee size={20}/>} accentColor="#f59e0b" size={3} />
      </Grid>

      {/* Finance trend + Sales donut */}
      <Grid cols={12} gap={4}>
        <GAreaChart
          title="Finance Summary"
          subtitle="Net profit trend (last 6 months)"
          data={revTrend}
          areas={[{ key: "profit", label: "Profit (₹K)", color: "#3b82f6" }]}
          size={8} height={300}
        />
        <GDoughnutChart
          title="Sales Performance"
          subtitle={`Leads: ${kpis.totalLeads || 0} | Converted: ${pipeline.find((p) => p.name === "Prospect")?.value || 0}`}
          data={[
            { name: "Target Reached", value: convRate          },
            { name: "Remaining",      value: 100 - convRate    },
          ]}
          colors={["#2a465a","#cbd5e1"]}
          size={4} height={300}
        />
      </Grid>

      {/* Lead Pipeline + Project stats */}
      <Grid cols={12} gap={4}>
        <GPieChart
          title="Lead Pipeline"
          subtitle={`Total: ${kpis.totalLeads || 0} leads`}
          data={pipeline.length > 0 ? pipeline : [{ name: "No leads", value: 1 }]}
          colors={pipelineColors}
          size={4} height={300}
        />
        <GColumnChart
          title="Project Status"
          subtitle="Active, completed, delayed"
          data={[
            { name: "Active",     value: projStats.active    || 0 },
            { name: "Completed",  value: projStats.completed || 0 },
            { name: "Delayed",    value: projStats.delayed   || 0 },
          ]}
          bars={[{ key: "value", label: "Projects", color: "#8b5cf6" }]}
          size={8} height={300}
        />
      </Grid>

      {/* HRM Snapshot */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Present"    value={loading ? "—" : String(hrm.present      ?? 0)} icon={<UserCheck size={20}/>}    accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Absent"     value={loading ? "—" : String(hrm.absent       ?? 0)} icon={<UserX size={20}/>}        accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Late"       value={loading ? "—" : String(hrm.late         ?? 0)} icon={<Clock size={20}/>}        accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Leave Req"  value={loading ? "—" : String(hrm.pendingLeaves ?? 0)} icon={<CalendarCheck size={20}/>} accentColor="#38bdf8" size={3} />
      </DashGrid>

      {/* Revenue vs Expense */}
      <Grid cols={12} gap={4}>
        <GAreaChart
          title="Revenue vs Expense"
          subtitle="Monthly comparison (₹K)"
          data={revExp}
          areas={[
            { key: "revenue", label: "Revenue", color: "#22c55e" },
            { key: "expense", label: "Expense", color: "#f43f5e" },
          ]}
          size={12} height={280}
        />
      </Grid>

      {/* Project Progress */}
      {projProg.length > 0 && (
        <Grid cols={12} gap={4}>
          <GBarChart
            title="Project Progress"
            subtitle="Current completion %"
            data={projProg}
            bars={[{ key: "progress", label: "Progress %", color: "#8b5cf6" }]}
            size={12} height={220}
          />
        </Grid>
      )}

      {/* Recent Login Activity */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Recent Login Activity"
          columns={loginCols}
          rows={logins}
          loading={loading}
          size={12} pageSize={5} searchable
        />
      </Grid>

      {/* Project view modal */}
      <Modal id="admin-dash-proj-view" title="Project Details" size="md">
        {selProj && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Project Info" cols={2}>
              <ModalData label="Project Name" value={selProj.name} />
              <ModalData label="Status"       value={selProj.status} />
              <ModalData label="Progress"     value={selProj.progress} />
              <ModalData label="Deadline"     value={selProj.deadline} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("admin-dash-proj-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
