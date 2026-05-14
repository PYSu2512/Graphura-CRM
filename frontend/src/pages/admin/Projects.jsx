import React, { useState } from "react";
import {
  FolderKanban, CheckCircle, Clock, AlertCircle, AlertTriangle,
  Plus, FileDown, LayoutGrid, List, Zap, Briefcase, Layers,
  TrendingUp, TrendingDown, DollarSign, Eye, Pencil, ArrowRight,
  Shield, BarChart3,
} from "lucide-react";
import {
  Heading, DashGrid, EnhancedDashCard as DashCard, DataTable,
  GAreaChart, GBarChart, Button,
  PanelModal as Modal, openModal, closeModal,
} from "../../components/shared/Common_Components";

// ── Mock Data ──────────────────────────────────────────────────────────────

const initialProjects = [
  { id: "p1", name: "CRM Portal Revamp", client: "Acme Corp", team: "Engineering Alpha", leader: "Priya Mehta", priority: "High", status: "In Progress", progress: "72%", payment: "Partial", deadline: "30 Apr 2026", risk: "Medium" },
  { id: "p2", name: "ERP Integration", client: "Global Tech", team: "Engineering Beta", leader: "Karan Bhatia", priority: "Critical", status: "In Progress", progress: "55%", payment: "Paid", deadline: "15 May 2026", risk: "High" },
  { id: "p3", name: "Mobile App v2", client: "Nexus Labs", team: "Design Studio", leader: "Arjun Kapoor", priority: "Medium", status: "In Progress", progress: "38%", payment: "Pending", deadline: "10 Jun 2026", risk: "Low" },
  { id: "p4", name: "Data Migration", client: "Sunrise Retail", team: "Backend Team", leader: "Neha Gupta", priority: "High", status: "Delayed", progress: "80%", payment: "Pending", deadline: "05 Mar 2026", risk: "High" },
  { id: "p5", name: "Analytics Dashboard", client: "FinTech Ltd.", team: "Data Science", leader: "Priya Mehta", priority: "Low", status: "Completed", progress: "100%", payment: "Paid", deadline: "20 Apr 2026", risk: "None" },
  { id: "p6", name: "API Gateway Setup", client: "CloudBase Inc.", team: "DevOps", leader: "Karan Bhatia", priority: "Medium", status: "In Progress", progress: "45%", payment: "Partial", deadline: "01 May 2026", risk: "Medium" },
];

const projectTrendData = [
  { name: "Jan", completed: 2, inProgress: 3, delayed: 0 },
  { name: "Feb", completed: 3, inProgress: 4, delayed: 1 },
  { name: "Mar", completed: 4, inProgress: 5, delayed: 1 },
  { name: "Apr", completed: 5, inProgress: 4, delayed: 1 },
  { name: "May", completed: 6, inProgress: 3, delayed: 0 },
  { name: "Jun", completed: 7, inProgress: 4, delayed: 1 },
];

const teamProductivityData = [
  { name: "Team Alpha", tasks: 42, completed: 38 },
  { name: "Team Beta", tasks: 36, completed: 30 },
  { name: "Design", tasks: 28, completed: 25 },
  { name: "Backend", tasks: 32, completed: 22 },
  { name: "Data Sci", tasks: 38, completed: 35 },
];

const lifecycleStages = [
  { stage: "Planning", pct: 100, color: "#22c55e", team: "Strategy" },
  { stage: "Development", pct: 72, color: "#3b82f6", team: "Engineering" },
  { stage: "Review", pct: 45, color: "#f59e0b", team: "QA & Design" },
  { stage: "Testing", pct: 20, color: "#8b5cf6", team: "QA" },
  { stage: "Delivery", pct: 0, color: "#94a3b8", team: "DevOps" },
];

const activityFeed = [
  { icon: "✅", text: "Analytics Dashboard marked as Completed", time: "2 hrs ago" },
  { icon: "💰", text: "₹8,40,000 received from Acme Corp", time: "5 hrs ago" },
  { icon: "⚠️", text: "Data Migration deadline extended to 15 Mar", time: "1 day ago" },
  { icon: "🚀", text: "Mobile App v2 entered Development phase", time: "2 days ago" },
  { icon: "💬", text: "Neha Gupta commented on ERP Integration", time: "3 days ago" },
];

const aiInsights = [
  { type: "warning", Icon: AlertCircle, text: "2 projects may miss deadlines this month", color: "#f59e0b" },
  { type: "danger", Icon: TrendingDown, text: "Team productivity dropped 12% vs last quarter", color: "#ef4444" },
  { type: "success", Icon: TrendingUp, text: "Revenue from projects up 18% this quarter", color: "#22c55e" },
];

const projectColumns = [
  { key: "name", label: "Project" },
  { key: "client", label: "Client" },
  { key: "team", label: "Assigned Team" },
  { key: "leader", label: "Team Leader" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "progress", label: "Progress" },
  { key: "payment", label: "Payment" },
  { key: "deadline", label: "Deadline" },
  { key: "risk", label: "Risk Level" },
];

const kanbanStatuses = ["In Progress", "Delayed", "Completed"];

const emptyForm = { name: "", client: "", team: "", leader: "", priority: "Medium", status: "In Progress", progress: "0%", payment: "Pending", deadline: "", risk: "Low" };

// ── Professional 2D Illustrated Icon for KPI Cards ──
const KPIIcon = ({ children, gradient, shadow }) => (
  <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
    style={{ background: gradient, boxShadow: shadow }}>
    <div className="absolute inset-0 rounded-2xl opacity-30"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)" }} />
    <div className="relative text-white drop-shadow-sm">{children}</div>
  </div>
);

// ── Styled button helper (Button component has no icon prop) ──
const HeaderBtn = ({ icon, label, variant = "ghost", onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${
      variant === "primary"
        ? "text-white shadow-lg bg-[#2a465a] hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5"
        : "text-[#2a465a] bg-white border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5"
    }`}
  >
    {icon} {label}
  </button>
);

// ── Component ──────────────────────────────────────────────────────────────

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects);
  const [viewMode, setViewMode] = useState("table");
  const [selectedProject, setSelectedProject] = useState(null);
  const [formProject, setFormProject] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Computed KPIs ──
  const activeCount = projects.filter(p => p.status === "In Progress").length;
  const completedCount = projects.filter(p => p.status === "Completed").length;
  const atRiskCount = projects.filter(p => p.risk === "High").length;

  // ── CRUD Handlers ──
  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (formProject.id) {
        setProjects(prev => prev.map(p => p.id === formProject.id ? { ...formProject } : p));
      } else {
        setProjects(prev => [...prev, { ...formProject, id: `p-${Date.now()}` }]);
      }
      closeModal("project-form-modal");
      setIsSubmitting(false);
    }, 400);
  };

  const handleDelete = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setProjects(prev => prev.filter(p => p.id !== formProject.id));
      closeModal("project-form-modal");
      setIsSubmitting(false);
    }, 400);
  };

  // ── CSV Export ──
  const handleExport = () => {
    const headers = projectColumns.map(c => c.label).join(",");
    const rows = projects.map(p => projectColumns.map(c => `"${p[c.key] || ""}"`).join(","));
    const blob = new Blob([headers + "\n" + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "projects-report.csv"; a.click();
  };

  // ── Table Actions ──
  const tableActions = [
    { icon: <Eye size={14} />, tooltip: "View", variant: "ghost", onClick: (row) => { setSelectedProject(row); openModal("project-view-modal"); } },
    { icon: <Pencil size={14} />, tooltip: "Edit", variant: "primary", onClick: (row) => { setFormProject({ ...row }); openModal("project-form-modal"); } },
  ];

  // ── Form Input Helper ──
  const FormInput = ({ label, field, type = "text", disabled = false, options }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {options ? (
        <select value={formProject[field]} onChange={e => setFormProject({ ...formProject, [field]: e.target.value })}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#2a465a] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={formProject[field]} onChange={e => setFormProject({ ...formProject, [field]: e.target.value })}
          disabled={disabled}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#2a465a] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all disabled:opacity-50"
          placeholder={`Enter ${label.toLowerCase()}`} />
      )}
    </div>
  );

  // ── Kanban Card ──
  const KanbanCard = ({ project }) => (
    <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => { setSelectedProject(project); openModal("project-view-modal"); }}>
      <h4 className="text-sm font-bold text-[#2a465a] mb-1">{project.name}</h4>
      <p className="text-[11px] text-slate-400 font-semibold mb-3">{project.client}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{project.leader}</span>
        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
          project.priority === "Critical" ? "bg-rose-50 text-rose-500" :
          project.priority === "High" ? "bg-amber-50 text-amber-600" :
          "bg-slate-50 text-slate-500"
        }`}>{project.priority}</span>
      </div>
      <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-[#2a465a] transition-all duration-500" style={{ width: project.progress }} />
      </div>
      <p className="text-right text-[10px] font-bold text-slate-400 mt-1">{project.progress}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">

      {/* ── 1. Header ── */}
      <Heading primaryText="Projects" secondaryText="Command Center" size={12} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 -mt-2">
        <p className="text-sm font-semibold text-slate-400">Monitor progress, teams, risks & deliveries across all active projects.</p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white rounded-xl border border-slate-100 p-1 shadow-sm">
            <button onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-[#2a465a] text-white shadow-md" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
              <List size={16} />
            </button>
            <button onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-lg transition-all ${viewMode === "kanban" ? "bg-[#2a465a] text-white shadow-md" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
              <LayoutGrid size={16} />
            </button>
          </div>
          <HeaderBtn icon={<FileDown size={16} />} label="Export" onClick={handleExport} />
          <HeaderBtn icon={<Plus size={16} />} label="New Project" variant="primary"
            onClick={() => { setFormProject({ ...emptyForm }); openModal("project-form-modal"); }} />
        </div>
      </div>

      {/* ── 2. KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        <DashCard title="Active Projects" value={String(activeCount)} icon={<Briefcase size={22} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Completed" value={String(completedCount)} icon={<CheckCircle size={22} />} accentColor="#22c55e" size={3} />
        <DashCard title="At Risk" value={String(atRiskCount)} icon={<Shield size={22} />} accentColor="#ef4444" size={3} />
        <DashCard title="Revenue" value="₹1.84Cr" icon={<DollarSign size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      {/* ── 3. AI Insights ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiInsights.map((ins, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ins.color}15` }}>
              <ins.Icon size={20} style={{ color: ins.color }} />
            </div>
            <p className="text-sm font-semibold text-[#2a465a] leading-snug">{ins.text}</p>
          </div>
        ))}
      </div>

      {/* ── 4. Charts ── */}
      <DashGrid cols={12} gap={4}>
        <GAreaChart title="Project Completion Trends" subtitle="Monthly overview" data={projectTrendData}
          areas={[
            { key: "completed", label: "Completed", color: "#22c55e" },
            { key: "inProgress", label: "In Progress", color: "#3b82f6" },
            { key: "delayed", label: "Delayed", color: "#ef4444" },
          ]} size={8} height={280} />
        <GBarChart title="Team Productivity" subtitle="Tasks assigned vs completed" data={teamProductivityData}
          bars={[
            { key: "tasks", label: "Assigned", color: "#94a3b8" },
            { key: "completed", label: "Completed", color: "#2a465a" },
          ]} size={4} height={280} />
      </DashGrid>

      {/* ── 5. Project Lifecycle Timeline ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <KPIIcon gradient="linear-gradient(135deg, #2a465a, #3b6b8a)" shadow="0 4px 12px rgba(42,70,90,0.3)">
            <Layers size={18} />
          </KPIIcon>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#2a465a]">Project Lifecycle</h3>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Current phase progress across active projects</p>
          </div>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {lifecycleStages.map((s, i) => (
            <div key={s.stage} className="flex items-center gap-3 flex-shrink-0">
              <div className="flex flex-col items-center gap-2.5 min-w-[140px] p-5 rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style={{ background: `${s.color}06` }}>
                <KPIIcon gradient={`linear-gradient(135deg, ${s.color}, ${s.color}cc)`} shadow={`0 4px 14px ${s.color}40`}>
                  <span className="text-xs font-black">{s.pct}%</span>
                </KPIIcon>
                <span className="text-xs font-bold text-[#2a465a]">{s.stage}</span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{s.team}</span>
              </div>
              {i < lifecycleStages.length - 1 && (
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                  <div className="w-6 h-[2px] rounded-full" style={{ background: `${s.color}40` }} />
                  <ArrowRight size={14} style={{ color: `${s.color}60` }} />
                  <div className="w-6 h-[2px] rounded-full" style={{ background: `${lifecycleStages[i+1].color}40` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Table / Kanban + Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-9">
          {viewMode === "table" ? (
            <DataTable title="Projects Directory" columns={projectColumns} rows={projects}
              size={12} pageSize={10} searchable date exportable exportFileName="projects-report"
              actions={tableActions}
              filters={[
                { title: "Status", key: "status", type: "toggle", options: ["In Progress", "Completed", "Delayed"] },
                { title: "Priority", key: "priority", type: "toggle", options: ["Low", "Medium", "High", "Critical"] },
                { title: "Risk", key: "risk", type: "toggle", options: ["None", "Low", "Medium", "High"] },
                { title: "Payment", key: "payment", type: "toggle", options: ["Paid", "Partial", "Pending"] },
              ]}
            />
          ) : (
            /* Kanban View */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kanbanStatuses.map(status => (
                <div key={status} className="space-y-3">
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <div className={`w-2 h-2 rounded-full ${status === "In Progress" ? "bg-blue-500" : status === "Delayed" ? "bg-rose-500" : "bg-emerald-500"}`} />
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#2a465a]">{status}</h4>
                    <span className="text-[10px] font-bold text-slate-400 ml-auto">{projects.filter(p => p.status === status).length}</span>
                  </div>
                  {projects.filter(p => p.status === status).map(p => <KanbanCard key={p.id} project={p} />)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <KPIIcon gradient="linear-gradient(135deg, #f59e0b, #fbbf24)" shadow="0 4px 12px rgba(245,158,11,0.3)">
                <Zap size={16} />
              </KPIIcon>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#2a465a]">Live Activity</h3>
                <p className="text-[10px] font-semibold text-slate-400">Real-time updates</p>
              </div>
            </div>
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {activityFeed.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 hover:bg-slate-100/80 transition-all duration-200 hover:shadow-sm border border-transparent hover:border-slate-100">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-sm bg-white border border-slate-100 shadow-sm">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#2a465a] leading-relaxed">{item.text}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ PANEL MODALS ═══════════════════════════════════════════════════════ */}

      {/* View Details Modal */}
      <Modal id="project-view-modal" title="Project Details">
        {selectedProject && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white shadow-lg">
                <FolderKanban size={24} />
              </div>
              <div>
                <p className="text-lg font-black text-[#2a465a]">{selectedProject.name}</p>
                <p className="text-sm font-bold text-slate-500">{selectedProject.client}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Team", val: selectedProject.team },
                { label: "Leader", val: selectedProject.leader },
                { label: "Priority", val: selectedProject.priority },
                { label: "Status", val: selectedProject.status },
                { label: "Progress", val: selectedProject.progress },
                { label: "Payment", val: selectedProject.payment },
                { label: "Deadline", val: selectedProject.deadline },
                { label: "Risk Level", val: selectedProject.risk },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-white px-3 py-2.5 rounded-xl block border border-slate-100 text-sm">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("project-view-modal")} />
              <Button text="Edit Project" variant="primary" size={3} onClick={() => {
                closeModal("project-view-modal");
                setFormProject({ ...selectedProject });
                openModal("project-form-modal");
              }} />
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Form Modal */}
      <Modal id="project-form-modal" title={formProject.id ? "Edit Project" : "New Project"}>
        <div className="space-y-4">
          <FormInput label="Project Name" field="name" />
          <FormInput label="Client" field="client" />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Assigned Team" field="team" />
            <FormInput label="Team Leader" field="leader" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Priority" field="priority" options={["Low", "Medium", "High", "Critical"]} />
            <FormInput label="Status" field="status" options={["In Progress", "Completed", "Delayed"]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Progress" field="progress" />
            <FormInput label="Payment" field="payment" options={["Paid", "Partial", "Pending"]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Deadline" field="deadline" />
            <FormInput label="Risk Level" field="risk" options={["None", "Low", "Medium", "High"]} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("project-form-modal")} disabled={isSubmitting} />
            <Button text={isSubmitting ? "Saving..." : formProject.id ? "Update" : "Create"} variant="primary" size={3}
              onClick={handleSave} disabled={isSubmitting || !formProject.name || !formProject.client} />
          </div>

          {formProject.id && (
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest mr-auto">Danger Zone</span>
              <Button text="Delete Project" variant="danger" size={3} onClick={handleDelete} />
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
