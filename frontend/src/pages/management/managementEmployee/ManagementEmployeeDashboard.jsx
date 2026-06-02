import {
  Grid,
  Heading,
  EnhancedDashCard,
  DataTable,
  GColumnChart,
  GPieChart,
} from "../../../components/shared/Common_Components.jsx";
import {
  FolderOpen,
  Activity,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import {
  currentEmployee,
  myTL,
  myProjects,
  dashboardKPIs,
  statusFunnel,
  weeklyNotesAdded,
  upcomingDeadlines,
  recentComments,
} from "./managementEmployeeStore";

const KPI_ICONS = [
  <FolderOpen size={20} />,
  <Activity size={20} />,
  <CheckCircle2 size={20} />,
  <AlertTriangle size={20} />,
];

const DEADLINE_COLS = [
  { key: "id",            label: "ID" },
  { key: "name",          label: "Project" },
  { key: "clientName",    label: "Client" },
  { key: "deadline",      label: "Deadline" },
  { key: "progress",      label: "Progress" },
  { key: "projectStatus", label: "Project Status" },
  { key: "status",        label: "Bucket" },
];

export default function ManagementEmployeeDashboard() {
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* ── 1. Header ──────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText={`Hi, ${currentEmployee.name.split(" ")[0]}`}
          secondaryText={`${myProjects.length} projects · TL: ${myTL.name}`}
          size={12}
        />
      </Grid>

      {/* ── 2. KPI Cards (4 metrics) ──────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        {dashboardKPIs.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={k.accent}
            size={3}
          />
        ))}
      </Grid>

      {/* ── 3. Status mix + Weekly notes ──────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <GPieChart
          title="My Status Mix"
          subtitle="Where each of your projects sits today"
          data={statusFunnel.filter((s) => s.value > 0)}
          colors={["#94a3b8", "#0ea5e9", "#f59e0b", "#8b5cf6", "#14b8a6", "#22c55e", "#f43f5e"]}
          size={5}
          height={300}
        />
        <GColumnChart
          title="My Activity"
          subtitle="Work notes added per week"
          data={weeklyNotesAdded}
          bars={[{ key: "count", label: "Notes added", color: "#3b82f6" }]}
          size={7}
          height={300}
        />
      </Grid>

      {/* ── 4. Upcoming deadlines table ───────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Upcoming Deadlines"
          columns={DEADLINE_COLS}
          rows={upcomingDeadlines}
          size={12}
          pageSize={6}
          searchable
          filters={[
            { title: "Bucket",  type: "toggle", key: "status",        options: ["Overdue", "This Week", "This Month", "Future"] },
            { title: "Project", type: "toggle", key: "projectStatus", options: ["Not Started", "Work Started", "In Progress", "Review Stage", "Finalization", "Delayed"] },
          ]}
        />
      </Grid>

      {/* ── 5. Recent comments feed ───────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <div className="col-span-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-[#2a465a]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Recent Comments
            </h3>
          </div>
          {recentComments.length === 0 ? (
            <p className="text-sm text-slate-500">You haven't added any comments yet.</p>
          ) : (
            <div className="space-y-2">
              {recentComments.map((c, i) => (
                <div
                  key={`${c.projectId}-${i}`}
                  className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2a465a]">
                      {c.projectId} · {c.projectName}
                    </span>
                    <span className="text-xs text-slate-500">{c.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Grid>
    </div>
  );
}
