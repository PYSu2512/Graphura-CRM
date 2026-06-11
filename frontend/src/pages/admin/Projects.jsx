/**
 * Admin Projects.jsx
 * Fully dynamic: list, view detail, update status, delete.
 * Right-side toast notifications auto-dismiss in 4s.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FolderKanban, CheckCircle, Shield, DollarSign,
  TrendingUp, TrendingDown, AlertCircle,
  FileDown, Eye, Pencil, Trash2, X, CheckCircle2, AlertTriangle, RefreshCw,
} from "lucide-react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  GAreaChart, GBarChart, Button,
  PanelModal as Modal, openModal, closeModal,
  SelectField, Option,
} from "../../components/shared/Common_Components";
import apiClient from "../../services/apiClient";

// ── Toast system ──────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none" style={{ minWidth: 300 }}>
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-xl border pointer-events-auto transition-all ${
            t.type === "success" ? "bg-white border-emerald-200"
            : t.type === "error"   ? "bg-white border-rose-200"
            :                        "bg-white border-blue-200"
          }`}
          style={{ maxWidth: 360 }}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            t.type === "success" ? "bg-emerald-100" : t.type === "error" ? "bg-rose-100" : "bg-blue-100"
          }`}>
            {t.type === "success"
              ? <CheckCircle2 size={16} className="text-emerald-600" />
              : <AlertTriangle size={16} className={t.type === "error" ? "text-rose-600" : "text-blue-600"} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${
              t.type === "success" ? "text-emerald-700" : t.type === "error" ? "text-rose-700" : "text-blue-700"
            }`}>{t.title}</p>
            {t.msg && <p className="text-xs text-slate-500 mt-0.5">{t.msg}</p>}
          </div>
          <button type="button" onClick={() => onRemove(t.id)} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});
  const show = useCallback((title, msg, type = "success", ms = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, title, msg, type }]);
    timers.current[id] = setTimeout(() => {
      setToasts((p) => p.filter((t) => t.id !== id));
      delete timers.current[id];
    }, ms);
  }, []);
  const remove = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);
  return { toasts, show, remove };
}

// ── Status pill ───────────────────────────────────────────────────────────────
const STATUS_CFG = {
  "Completed":    { bg:"#dcfce7", color:"#16a34a" },
  "Delivered":    { bg:"#d1fae5", color:"#059669" },
  "In Progress":  { bg:"#dbeafe", color:"#2563eb" },
  "Work Started": { bg:"#ede9fe", color:"#7c3aed" },
  "Not Started":  { bg:"#f1f5f9", color:"#64748b" },
  "Delayed":      { bg:"#fee2e2", color:"#dc2626" },
  "Review Stage": { bg:"#fef3c7", color:"#d97706" },
  "Finalization": { bg:"#fce7f3", color:"#db2777" },
};
function StatusPill({ status }) {
  const s = STATUS_CFG[status] ?? { bg:"#f1f5f9", color:"#64748b" };
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}>{status}</span>
  );
}

const ALL_STATUSES = [
  "Not Started","Work Started","In Progress",
  "Review Stage","Finalization","Completed","Delivered","Delayed",
];

const projectColumns = [
  { key: "name",       label: "Project" },
  { key: "client",     label: "Client" },
  { key: "manager",    label: "Project Manager" },
  { key: "status",     label: "Status",   render: (v) => <StatusPill status={v} /> },
  { key: "progress",   label: "Progress" },
  { key: "dealAmount", label: "Deal Amount" },
  { key: "deadline",   label: "Deadline" },
];

const fmtRevenue = (n) => {
  if (!n) return "₹0";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

export default function Projects() {
  const { toasts, show: toast, remove: removeToast } = useToasts();

  const [projects,  setProjects]  = useState([]);
  const [stats,     setStats]     = useState({});
  const [trend,     setTrend]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [viewProj,  setViewProj]  = useState(null);
  const [editProj,  setEditProj]  = useState(null);   // for status update
  const [delProj,   setDelProj]   = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isSaving,  setIsSaving]  = useState(false);
  const [isDeleting,setIsDeleting]= useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/projects");
      setProjects(res.data?.data?.projects || []);
      setStats(res.data?.data?.stats       || {});
      setTrend(res.data?.data?.trend       || []);
    } catch (err) {
      toast("Failed to load projects", err?.message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Status update ──────────────────────────────────────────────────────────
  const openStatusModal = (row) => {
    const full = projects.find((p) => p.id === row.id) || row;
    setEditProj(full);
    setNewStatus(full.status);
    openModal("admin-proj-status-modal");
  };

  const handleStatusSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch(`/admin/projects/${editProj.id}/status`, { status: newStatus });
      toast("Status updated", `${editProj.name} → ${newStatus}`, "success");
      closeModal("admin-proj-status-modal");
      fetchProjects();
    } catch (err) {
      toast("Update failed", err?.message, "error");
    } finally { setIsSaving(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const openDeleteModal = (row) => {
    setDelProj(projects.find((p) => p.id === row.id) || row);
    openModal("admin-proj-delete-modal");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/admin/projects/${delProj.id}`);
      toast("Project deleted", `"${delProj.name}" has been removed.`, "success");
      closeModal("admin-proj-delete-modal");
      setDelProj(null);
      fetchProjects();
    } catch (err) {
      toast("Delete failed", err?.message, "error");
    } finally { setIsDeleting(false); }
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const hdr = "Project,Client,Manager,Status,Progress,Amount,Deadline\n";
    const rows = projects.map((p) =>
      `"${p.name}","${p.client}","${p.manager}","${p.status}","${p.progress}","${p.dealAmount}","${p.deadline}"`
    ).join("\n");
    const a = document.createElement("a");
    a.href = encodeURI("data:text/csv;charset=utf-8," + hdr + rows);
    a.download = "projects.csv"; a.click();
  };

  const tableActions = [
    {
      icon: <Eye size={14} />, tooltip: "View", variant: "ghost",
      onClick: (row) => { setViewProj(projects.find((p) => p.id === row.id) || row); openModal("admin-proj-view-modal"); },
    },
    {
      icon: <Pencil size={14} />, tooltip: "Update Status", variant: "primary",
      onClick: openStatusModal,
    },
    {
      icon: <Trash2 size={14} />, tooltip: "Delete", variant: "danger",
      onClick: openDeleteModal,
    },
  ];

  const aiInsights = [
    stats.atRisk > 0
      ? { Icon: AlertCircle,  text: `${stats.atRisk} project${stats.atRisk > 1 ? "s are" : " is"} past deadline`, color: "#f59e0b" }
      : { Icon: CheckCircle,  text: "No projects are past deadline", color: "#22c55e" },
    { Icon: TrendingUp, text: `${stats.completed || 0} project${stats.completed !== 1 ? "s" : ""} completed`, color: "#22c55e" },
    { Icon: DollarSign, text: `Total revenue: ${fmtRevenue(stats.totalRevenue)}`, color: "#8b5cf6" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Heading primaryText="Project" secondaryText="Dashboard" size={12} />

      {/* Header actions */}
      <div className="flex items-center justify-end gap-2 -mt-2">
        <button onClick={fetchProjects}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition active:scale-95">
          <RefreshCw size={15} /> Refresh
        </button>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition active:scale-95">
          <FileDown size={15} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Active Projects" value={loading ? "—" : String(stats.active    ?? 0)} icon={<FolderKanban size={22}/>} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Completed"        value={loading ? "—" : String(stats.completed ?? 0)} icon={<CheckCircle size={22}/>}  accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="At Risk"           value={loading ? "—" : String(stats.atRisk    ?? 0)} icon={<Shield size={22}/>}       accentColor="#ef4444" size={3} />
        <EnhancedDashCard title="Revenue"           value={loading ? "—" : fmtRevenue(stats.totalRevenue)} icon={<DollarSign size={22}/>} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiInsights.map((ins, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ins.color}15` }}>
              <ins.Icon size={20} style={{ color: ins.color }} />
            </div>
            <p className="text-sm font-semibold text-[#2a465a]">{ins.text}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashGrid cols={12} gap={4}>
        <GAreaChart title="Project Completion Trends" subtitle="Monthly overview" data={trend}
          areas={[
            { key: "completed",  label: "Completed",   color: "#22c55e" },
            { key: "inProgress", label: "In Progress", color: "#3b82f6" },
            { key: "delayed",    label: "Delayed",     color: "#ef4444" },
          ]} size={8} height={280} />
        <GBarChart title="Status Breakdown" subtitle="Projects by current status"
          data={[
            { name: "Active",    value: stats.active    || 0 },
            { name: "Completed", value: stats.completed || 0 },
            { name: "Delayed",   value: stats.delayed   || 0 },
            { name: "At Risk",   value: stats.atRisk    || 0 },
          ]}
          bars={[{ key: "value", label: "Projects", color: "#2a465a" }]}
          size={4} height={280} />
      </DashGrid>

      {/* Table */}
      <DataTable
        title="Projects Directory"
        columns={projectColumns}
        rows={projects}
        size={12} pageSize={10} searchable exportable exportFileName="projects"
        loading={loading}
        actions={tableActions}
        filters={[
          { title: "Status",   key: "status",   type: "toggle", options: ALL_STATUSES },
          { title: "Priority", key: "priority", type: "toggle", options: ["Low","Medium","High","Urgent"] },
        ]}
      />

      {/* ── View Modal ── */}
      <Modal id="admin-proj-view-modal" title="Project Details">
        {viewProj && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white shadow-lg">
                <FolderKanban size={22} />
              </div>
              <div>
                <p className="text-lg font-black text-[#2a465a]">{viewProj.name}</p>
                <p className="text-sm text-slate-500">{viewProj.client} · {viewProj.projectNumber}</p>
              </div>
              <div className="ml-auto"><StatusPill status={viewProj.status} /></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Project Manager", viewProj.manager],
                ["Deal Amount",     viewProj.dealAmount],
                ["Progress",        viewProj.progress],
                ["Priority",        viewProj.priority],
                ["Start Date",      viewProj.startDate],
                ["Deadline",        viewProj.deadline],
                ["Delivered At",    viewProj.deliveredAt || "—"],
                ["Drive Link",      viewProj.driveLink   || "—"],
                ["Handover Link",   viewProj.handoverLink || "—"],
                ["At Risk",         viewProj.isAtRisk ? "⚠ Yes" : "No"],
              ].map(([label, val]) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-white px-3 py-2 rounded-xl block border border-slate-100 text-sm truncate">{val}</span>
                </div>
              ))}
            </div>

            {viewProj.description && (
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Description</span>
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">{viewProj.description}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("admin-proj-view-modal")} />
              <Button text="Update Status" variant="primary" size={4} onClick={() => {
                closeModal("admin-proj-view-modal");
                openStatusModal(viewProj);
              }} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Status Update Modal ── */}
      <Modal id="admin-proj-status-modal" title="Update Project Status">
        {editProj && (
          <div className="space-y-5">
            <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <p className="font-bold text-[#2a465a] text-sm">{editProj.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{editProj.client} · Current: {editProj.status}</p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <AlertCircle size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">As Admin you can only update the project status. Content changes must be made through the Management Manager panel.</p>
            </div>

            <SelectField label="New Status" id="admin-proj-status" value={newStatus} searchable={false}
              onChange={(e) => setNewStatus(e.target.value)}>
              {ALL_STATUSES.map((s) => <Option key={s} value={s} label={s} />)}
            </SelectField>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button onClick={() => closeModal("admin-proj-status-modal")}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">
                Cancel
              </button>
              <button onClick={handleStatusSave} disabled={isSaving || newStatus === editProj.status}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] shadow-lg hover:bg-[#1e3a52] transition active:scale-95 disabled:opacity-60">
                {isSaving ? "Saving…" : "Update Status"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal id="admin-proj-delete-modal" title="Delete Project">
        {delProj && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertTriangle size={20} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-700">This action cannot be undone</p>
                <p className="text-sm text-rose-600 mt-1">
                  Delete <strong>"{delProj.name}"</strong>? All associated task assignments will remain but the project will be archived.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Client</span><span className="font-semibold">{delProj.client}</span></div>
              <div><span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Status</span><StatusPill status={delProj.status} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => closeModal("admin-proj-delete-modal")}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 shadow-lg hover:bg-rose-600 transition active:scale-95 disabled:opacity-60">
                {isDeleting ? "Deleting…" : "Delete Project"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
