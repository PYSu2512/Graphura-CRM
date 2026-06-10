import { useCallback, useEffect, useState } from "react";
import {
  Grid,
  Heading,
  EnhancedDashCard,
  GAreaChart,
  GBarChart,
  GPieChart,
  DataTable,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  Button,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components.jsx";
import {
  FolderOpen,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Percent,
  Link2,
  Loader2,
} from "lucide-react";
import apiClient from "../../../services/apiClient.js";
import toast from "react-hot-toast";

// KPI icon order matches the kpis array below
const KPI_ICONS = [
  <FolderOpen size={20} />,
  <Activity size={20} />,
  <CheckCircle2 size={20} />,
  <AlertTriangle size={20} />,
  <Percent size={20} />,
  <Link2 size={20} />,
];

const KPI_ACCENTS = ["#3b82f6", "#14b8a6", "#22c55e", "#f43f5e", "#8b5cf6", "#f59e0b"];

const RECENT_COLS = [
  { key: "projectNumber", label: "ID" },
  { key: "name",           label: "Project" },
  { key: "clientName",     label: "Client" },
  { key: "assignedTLName", label: "Team Leader" },
  { key: "deadline",       label: "Deadline" },
  {
    key: "progressPercent",
    label: "Progress",
    render: (v) => (
      <div className="flex items-center gap-2 min-w-[80px]">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#2a465a] rounded-full" style={{ width: `${v || 0}%` }} />
        </div>
        <span className="text-xs font-bold text-slate-600 shrink-0">{v || 0}%</span>
      </div>
    ),
  },
  { key: "priority", label: "Priority" },
  { key: "status",   label: "Status" },
];

const BLANK_DASHBOARD = {
  kpis:              { totalProjects: 0, activeProjects: 0, completedThisMonth: 0, delayed: 0, onTimeDeliveryPct: 0, pendingHandoverLink: 0 },
  statusFunnel:      [],
  monthlyThroughput: [],
  tlLoad:            [],
  recentProjects:    [],
  totalTLs:          0,
};

export default function ManagementManagerDashboard() {
  const [data,            setData]            = useState(BLANK_DASHBOARD);
  const [loading,         setLoading]         = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/management/dashboard");
      setData(res?.data?.data ?? BLANK_DASHBOARD);
    } catch (err) {
      toast.error(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const { kpis, statusFunnel, monthlyThroughput, tlLoad, recentProjects, totalTLs } = data;

  const kpiCards = [
    { title: "Total Projects",         value: String(kpis.totalProjects         ?? 0) },
    { title: "Active Projects",        value: String(kpis.activeProjects         ?? 0) },
    { title: "Completed (This Month)", value: String(kpis.completedThisMonth    ?? 0) },
    { title: "Delayed",                value: String(kpis.delayed               ?? 0) },
    { title: "On-time Delivery %",     value: `${kpis.onTimeDeliveryPct         ?? 0}%` },
    { title: "Pending Handover Links", value: String(kpis.pendingHandoverLink   ?? 0) },
  ];

  const openProjectDetails = (row) => {
    const full = recentProjects.find((p) => p.id === row.id) ?? row;
    setSelectedProject(full);
    openModal("mm-dash-project-view");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-slate-400 text-sm">
        <Loader2 size={20} className="animate-spin" /> Loading dashboard…
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Manager"
          secondaryText={`${totalTLs} TLs · ${kpis.totalProjects} projects`}
          size={12}
        />
      </Grid>

      {/* ── 2. KPI Cards ──────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        {kpiCards.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={KPI_ACCENTS[i]}
            size={2}
          />
        ))}
      </Grid>

      {/* ── 3. Monthly Throughput + Status Funnel ─────────────────────────── */}
      <Grid cols={12} gap={4}>
        <GAreaChart
          title="Project Throughput"
          subtitle="Projects started vs delivered, last 12 months"
          data={monthlyThroughput}
          areas={[
            { key: "started",   label: "Started",   color: "#3b82f6" },
            { key: "delivered", label: "Delivered", color: "#22c55e" },
          ]}
          size={8}
          height={300}
        />
        <GPieChart
          title="Project Status Funnel"
          subtitle="Live status breakdown"
          data={statusFunnel.filter(s => s.value > 0)}
          colors={["#94a3b8", "#0ea5e9", "#f59e0b", "#8b5cf6", "#14b8a6", "#22c55e", "#475569", "#f43f5e"]}
          size={4}
          height={300}
        />
      </Grid>

      {/* ── 4. Per-TL Load ────────────────────────────────────────────────── */}
      {tlLoad.length > 0 && (
        <Grid cols={12} gap={4}>
          <GBarChart
            title="Team Leader Load"
            subtitle="Active vs completed vs delayed projects per TL"
            data={tlLoad}
            bars={[
              { key: "active",    label: "Active",    color: "#3b82f6" },
              { key: "completed", label: "Completed", color: "#22c55e" },
              { key: "delayed",   label: "Delayed",   color: "#f43f5e" },
            ]}
            size={12}
            height={320}
          />
        </Grid>
      )}

      {/* ── 5. Recent Projects ────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Recent Projects"
          columns={RECENT_COLS}
          rows={recentProjects}
          actions={[
            {
              icon: <span className="text-xs">👁</span>,
              tooltip: "View Details",
              variant: "ghost",
              onClick: openProjectDetails,
            },
          ]}
          size={12}
          pageSize={8}
          searchable
          exportable
          exportFileName="recent_projects"
          filters={[
            {
              title: "Status",
              type: "toggle",
              key: "status",
              options: ["Not Started", "Work Started", "In Progress", "Review Stage", "Finalization", "Completed", "Delivered", "Delayed"],
            },
            {
              title: "Priority",
              type: "toggle",
              key: "priority",
              options: ["High", "Medium", "Low", "Urgent"],
            },
          ]}
        />
      </Grid>

      {/* ── Project Detail Modal ──────────────────────────────────────────── */}
      <Modal id="mm-dash-project-view" title="Project Details" size="lg">
        {selectedProject && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selectedProject.name}
              subtitle={`${selectedProject.clientName} · ${selectedProject.assignedTLName}`}
              meta={`${selectedProject.projectNumber} · Deadline ${selectedProject.deadline ?? "—"}`}
            />
            <ModalGrid title="Overview" cols={3}>
              <ModalData label="Status"       value={selectedProject.status} />
              <ModalData label="Priority"     value={selectedProject.priority} />
              <ModalData label="Progress"     value={`${selectedProject.progressPercent ?? 0}%`} />
              <ModalData label="Start Date"   value={selectedProject.startDate   ?? "—"} />
              <ModalData label="Deadline"     value={selectedProject.deadline    ?? "—"} />
              <ModalData label="Completed On" value={selectedProject.deliveredAt ?? "—"} />
            </ModalGrid>
            <ModalGrid title="Client" cols={2}>
              <ModalData label="Name"   value={selectedProject.clientName   ?? "—"} />
              <ModalData label="Mobile" value={selectedProject.clientMobile ?? "—"} />
            </ModalGrid>
            <ModalGrid title="Links" cols={1}>
              <ModalData label="Drive Link"    value={selectedProject.driveLink    ?? "—"} />
              <ModalData label="Handover Link" value={selectedProject.handoverLink ?? "— (mandatory before delivery)"} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3}
                onClick={() => closeModal("mm-dash-project-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
