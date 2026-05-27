import { useState } from "react";
import {
  Headphones, AlertCircle, Clock, CheckCircle, TrendingUp, TrendingDown,
  Eye, Pencil, Plus, FileDown, Shield, Zap, AlertTriangle,
} from "lucide-react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  GAreaChart, GBarChart, Button,
  PanelModal as Modal, openModal, closeModal,
} from "../../components/shared/Common_Components";

// ── Mock Data ──────────────────────────────────────────────────────────────

const initialTickets = [
  { id: "SUP-2104", user: "Riya Sharma", role: "Sales Executive", department: "Sales", category: "Lead Data Issue", issue: "Leads are not loading after the morning sync for west region accounts.", priority: "High", status: "Open", time: "19 Apr 2026, 10:15 AM", assignedTo: "Tech Team", sla: "4h left" },
  { id: "SUP-2098", user: "Vikram Nair", role: "Finance Manager", department: "Finance", category: "Payment Issue", issue: "Invoice export is duplicating tax rows for April statements.", priority: "Medium", status: "In Progress", time: "19 Apr 2026, 09:05 AM", assignedTo: "Developer", sla: "12h left" },
  { id: "SUP-2089", user: "Ananya Patel", role: "Management Lead", department: "Mgmt", category: "Account/Login Issue", issue: "Team leaders are getting signed out after role switch from the approvals panel.", priority: "High", status: "Resolved", time: "18 Apr 2026, 06:40 PM", assignedTo: "Super Admin", sla: "Resolved" },
  { id: "SUP-2085", user: "Priya Mehta", role: "Sales Manager", department: "Sales", category: "CRM Bug", issue: "Dashboard charts not rendering on mobile browsers.", priority: "Low", status: "Open", time: "17 Apr 2026, 03:20 PM", assignedTo: "Frontend Team", sla: "24h left" },
  { id: "SUP-2080", user: "Karan Bhatia", role: "Finance Analyst", department: "Finance", category: "Report Issue", issue: "Q1 finance report shows incorrect totals after recent update.", priority: "High", status: "Escalated", time: "16 Apr 2026, 11:45 AM", assignedTo: "Backend Team", sla: "Breached" },
];

const ticketTrendData = [
  { name: "Jan", open: 8, resolved: 6, escalated: 1 },
  { name: "Feb", open: 12, resolved: 10, escalated: 2 },
  { name: "Mar", open: 9, resolved: 8, escalated: 1 },
  { name: "Apr", open: 15, resolved: 11, escalated: 3 },
  { name: "May", open: 10, resolved: 9, escalated: 1 },
  { name: "Jun", open: 7, resolved: 7, escalated: 0 },
];

const deptIssueData = [
  { name: "Sales", tickets: 14, resolved: 11 },
  { name: "Finance", tickets: 8, resolved: 5 },
  { name: "Mgmt", tickets: 5, resolved: 4 },
  { name: "HR", tickets: 3, resolved: 3 },
];

const operationalAlerts = [
  { Icon: AlertCircle, text: "2 SLA breaches detected in last 24 hours", color: "#ef4444" },
  { Icon: TrendingDown, text: "Avg resolution time increased by 18%", color: "#f59e0b" },
  { Icon: TrendingUp, text: "Ticket volume down 12% vs last month", color: "#22c55e" },
];

const columns = [
  { key: "id", label: "Ticket ID" },
  { key: "user", label: "Reported By" },
  { key: "department", label: "Department" },
  { key: "category", label: "Category" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "sla", label: "SLA Timer" },
  { key: "time", label: "Last Activity" },
];

const defaultForm = { user: "", role: "Sales Executive", department: "Sales", category: "CRM Bug", issue: "", priority: "Medium", status: "Open", assignedTo: "", sla: "24h left" };

// ── Component ──────────────────────────────────────────────────────────────

export default function Support() {
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // KPIs
  const openCount = tickets.filter(t => t.status === "Open").length;
  const highPriority = tickets.filter(t => t.priority === "High").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved").length;
  const breachedCount = tickets.filter(t => t.sla === "Breached").length;

  const handleFormChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.user.trim() || !form.issue.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      if (form.id) {
        setTickets(prev => prev.map(t => t.id === form.id ? { ...form } : t));
      } else {
        const newTicket = {
          ...form,
          id: `SUP-${2105 + tickets.length}`,
          time: new Date().toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        };
        setTickets(prev => [newTicket, ...prev]);
      }
      closeModal("ticket-form-modal");
      setIsSubmitting(false);
    }, 400);
  };

  const handleDelete = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setTickets(prev => prev.filter(t => t.id !== form.id));
      closeModal("ticket-form-modal");
      setIsSubmitting(false);
    }, 400);
  };

  const handleExport = () => {
    const headers = columns.map(c => c.label).join(",");
    const rows = tickets.map(t => columns.map(c => `"${t[c.key] || ""}"`).join(","));
    const blob = new Blob([headers + "\n" + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "support-tickets.csv"; a.click();
  };

  const tableActions = [
    { icon: <Eye size={14} />, tooltip: "View", variant: "ghost", onClick: (row) => { setSelectedTicket(row); openModal("ticket-view-modal"); } },
    { icon: <Pencil size={14} />, tooltip: "Edit", variant: "primary", onClick: (row) => { setForm({ ...row }); openModal("ticket-form-modal"); } },
  ];

  const FormInput = ({ label, field, placeholder, multiline = false }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea value={form[field]} onChange={e => handleFormChange(field, e.target.value)} rows={3}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#2a465a] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all resize-none"
          placeholder={placeholder} />
      ) : (
        <input type="text" value={form[field]} onChange={e => handleFormChange(field, e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#2a465a] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
          placeholder={placeholder || `Enter ${label.toLowerCase()}`} />
      )}
    </div>
  );

  const FormSelect = ({ label, field, options }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <select value={form[field]} onChange={e => handleFormChange(field, e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#2a465a] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <Heading primaryText="Support" secondaryText="Command Center" size={12} />

      {/* ── Action Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 -mt-2">
        <p className="text-sm font-semibold text-slate-400">Monitor tickets, escalations, SLA compliance & team workload.</p>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-[#2a465a] bg-white border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
            <FileDown size={16} /> Export
          </button>
          <button onClick={() => { setForm({ ...defaultForm }); openModal("ticket-form-modal"); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg bg-[#2a465a] hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
            <Plus size={16} /> New Ticket
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Open Tickets" value={String(openCount)} icon={<Headphones size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="High Priority" value={String(highPriority)} icon={<AlertTriangle size={22} />} accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="SLA Breaches" value={String(breachedCount)} icon={<Shield size={22} />} accentColor="#ef4444" size={3} />
        <EnhancedDashCard title="Resolved" value={String(resolvedCount)} icon={<CheckCircle size={22} />} accentColor="#22c55e" size={3} />
      </DashGrid>

      {/* ── Operational Alerts ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {operationalAlerts.map((alert, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${alert.color}15` }}>
              <alert.Icon size={20} style={{ color: alert.color }} />
            </div>
            <p className="text-sm font-semibold text-[#2a465a] leading-snug">{alert.text}</p>
          </div>
        ))}
      </div>

      {/* ── Analytics Charts ── */}
      <DashGrid cols={12} gap={4}>
        <GAreaChart title="Ticket Trend" subtitle="Monthly breakdown"
          data={ticketTrendData}
          areas={[
            { key: "open", label: "Opened", color: "#3b82f6" },
            { key: "resolved", label: "Resolved", color: "#22c55e" },
            { key: "escalated", label: "Escalated", color: "#ef4444" },
          ]} size={8} height={260} />
        <GBarChart title="Dept Issue Distribution" subtitle="Tickets vs resolved"
          data={deptIssueData}
          bars={[
            { key: "tickets", label: "Total", color: "#94a3b8" },
            { key: "resolved", label: "Resolved", color: "#2a465a" },
          ]} size={4} height={260} />
      </DashGrid>

      {/* ── Tickets Table ── */}
      <DataTable
        title="Ticket Monitoring"
        columns={columns}
        rows={tickets}
        actions={tableActions}
        size={12} pageSize={10} searchable exportable exportFileName="support-tickets-data"
        filters={[
          { title: "Status", key: "status", type: "toggle", options: ["Open", "In Progress", "Escalated", "Resolved"] },
          { title: "Priority", key: "priority", type: "toggle", options: ["Low", "Medium", "High"] },
          { title: "Department", key: "department", type: "toggle", options: ["Sales", "Finance", "Mgmt", "HR"] },
        ]}
      />

      {/* ══ VIEW MODAL ═══════════════════════════════════════════════════════ */}
      <Modal id="ticket-view-modal" title="Ticket Details">
        {selectedTicket && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white shadow-lg">
                <Headphones size={24} />
              </div>
              <div>
                <p className="text-lg font-black text-[#2a465a]">{selectedTicket.id}</p>
                <p className="text-sm font-bold text-slate-500">{selectedTicket.user} • {selectedTicket.role}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: selectedTicket.status, cls: selectedTicket.status === "Resolved" ? "bg-emerald-50 text-emerald-600" : selectedTicket.status === "Escalated" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600" },
                { label: selectedTicket.priority, cls: selectedTicket.priority === "High" ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500" },
                { label: selectedTicket.sla, cls: selectedTicket.sla === "Breached" ? "bg-rose-50 text-rose-600" : "bg-sky-50 text-sky-600" },
              ].map(b => (
                <span key={b.label} className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${b.cls}`}>{b.label}</span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Department", val: selectedTicket.department },
                { label: "Category", val: selectedTicket.category },
                { label: "Assigned To", val: selectedTicket.assignedTo },
                { label: "Last Activity", val: selectedTicket.time },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-white px-3 py-2.5 rounded-xl block border border-slate-100 text-sm">{val}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Issue Description</p>
              <p className="text-sm font-semibold leading-relaxed text-slate-700">{selectedTicket.issue}</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("ticket-view-modal")} />
              <Button text="Edit Ticket" variant="primary" size={3} onClick={() => {
                closeModal("ticket-view-modal");
                setForm({ ...selectedTicket });
                openModal("ticket-form-modal");
              }} />
            </div>
          </div>
        )}
      </Modal>

      {/* ══ CREATE/EDIT MODAL ═════════════════════════════════════════════════ */}
      <Modal id="ticket-form-modal" title={form.id ? "Edit Ticket" : "New Ticket"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Reported By" field="user" />
            <FormSelect label="Role" field="role" options={["Sales Executive", "Sales Manager", "Finance Manager", "Finance Analyst", "Management Lead"]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Department" field="department" options={["Sales", "Finance", "Mgmt", "HR"]} />
            <FormSelect label="Category" field="category" options={["CRM Bug", "Lead Data Issue", "Payment Issue", "Account/Login Issue", "Report Issue"]} />
          </div>
          <FormInput label="Issue Description" field="issue" multiline placeholder="Describe the issue in detail" />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Priority" field="priority" options={["Low", "Medium", "High"]} />
            <FormSelect label="Status" field="status" options={["Open", "In Progress", "Escalated", "Resolved"]} />
          </div>
          <FormInput label="Assigned To" field="assignedTo" placeholder="e.g. Tech Team" />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("ticket-form-modal")} disabled={isSubmitting} />
            <Button text={isSubmitting ? "Saving..." : form.id ? "Update" : "Create"} variant="primary" size={3}
              onClick={handleSave} disabled={isSubmitting || !form.user || !form.issue} />
          </div>

          {form.id && (
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest mr-auto">Danger Zone</span>
              <Button text="Delete Ticket" variant="danger" size={3} onClick={handleDelete} />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
