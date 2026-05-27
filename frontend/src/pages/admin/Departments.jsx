import { useState, useEffect } from "react";
import {
  Building2, Users, UserCheck, Target, DollarSign, TrendingUp,
  TrendingDown, Briefcase, Activity, AlertCircle, Clock,
  CheckCircle, CreditCard, Plus, Eye, Pencil, Trash2,
} from "lucide-react";
import {
  DashGrid, EnhancedDashCard, DataTable, Heading, P,
  PanelModal as Modal, openModal, closeModal, DataField, Grid,
  GAreaChart, GBarChart, Button,
} from "../../components/shared/Common_Components";
import { userService } from "../../services/userService";

// ─── Mock Data (role-based) ─────────────────────────────────────────────────

const salesEmployees = [
  { name: "Priya Mehta", role: "Manager", totalLeads: 210, activeLeads: 85, dumpLeads: 30, calls: 340, conversion: "40%", revenue: "₹18,50,000", missedFollowups: 4, status: "Active", date: "2026-04-10" },
  { name: "Arjun Kapoor", role: "TL", totalLeads: 160, activeLeads: 70, dumpLeads: 20, calls: 280, conversion: "43%", revenue: "₹14,20,000", missedFollowups: 2, status: "Active", date: "2026-04-11" },
  { name: "Sneha Joshi", role: "Executive", totalLeads: 95, activeLeads: 40, dumpLeads: 15, calls: 180, conversion: "42%", revenue: "₹8,80,000", missedFollowups: 6, status: "Active", date: "2026-04-12" },
  { name: "Vikram Nair", role: "Executive", totalLeads: 88, activeLeads: 32, dumpLeads: 22, calls: 150, conversion: "36%", revenue: "₹7,40,000", missedFollowups: 8, status: "Inactive", date: "2026-04-08" },
  { name: "Neha Gupta", role: "TL", totalLeads: 145, activeLeads: 60, dumpLeads: 18, calls: 260, conversion: "41%", revenue: "₹12,60,000", missedFollowups: 3, status: "Active", date: "2026-04-14" },
  { name: "Rohit Verma", role: "Executive", totalLeads: 102, activeLeads: 45, dumpLeads: 12, calls: 195, conversion: "44%", revenue: "₹9,20,000", missedFollowups: 1, status: "Active", date: "2026-04-13" },
  { name: "Ananya Singh", role: "Executive", totalLeads: 78, activeLeads: 28, dumpLeads: 20, calls: 140, conversion: "35%", revenue: "₹6,10,000", missedFollowups: 9, status: "Inactive", date: "2026-04-07" },
  { name: "Karan Bhatia", role: "Manager", totalLeads: 195, activeLeads: 80, dumpLeads: 25, calls: 310, conversion: "41%", revenue: "₹16,90,000", missedFollowups: 3, status: "Active", date: "2026-04-15" },
];

const projects = [
  { project: "CRM Portal Revamp", client: "Acme Corp", assignedTo: "Arjun Kapoor", startDate: "01 Feb 2026", deadline: "30 Apr 2026", status: "In Progress", progress: "72%", priority: "High", date: "2026-02-01" },
  { project: "ERP Integration", client: "Global Tech", assignedTo: "Neha Gupta", startDate: "15 Jan 2026", deadline: "15 May 2026", status: "In Progress", progress: "55%", priority: "Critical", date: "2026-01-15" },
  { project: "Mobile App v2", client: "Nexus Labs", assignedTo: "Rohit Verma", startDate: "10 Mar 2026", deadline: "10 Jun 2026", status: "In Progress", progress: "38%", priority: "Medium", date: "2026-03-10" },
  { project: "Data Migration", client: "Sunrise Retail", assignedTo: "Karan Bhatia", startDate: "05 Dec 2025", deadline: "05 Mar 2026", status: "Delayed", progress: "80%", priority: "High", date: "2025-12-05" },
  { project: "Analytics Dashboard", client: "FinTech Ltd.", assignedTo: "Priya Mehta", startDate: "20 Jan 2026", deadline: "20 Apr 2026", status: "Completed", progress: "100%", priority: "Low", date: "2026-01-20" },
  { project: "API Gateway Setup", client: "CloudBase Inc.", assignedTo: "Vikram Nair", startDate: "01 Mar 2026", deadline: "01 May 2026", status: "In Progress", progress: "45%", priority: "Medium", date: "2026-03-01" },
];

const financeRecords = [
  { client: "Acme Corp", project: "CRM Portal Revamp", total: "₹12,00,000", paid: "₹8,40,000", remaining: "₹3,60,000", type: "Milestone", status: "Partial", date: "2026-04-01" },
  { client: "Global Tech", project: "ERP Integration", total: "₹22,50,000", paid: "₹22,50,000", remaining: "₹0", type: "Full Payment", status: "Paid", date: "2026-03-20" },
  { client: "Nexus Labs", project: "Mobile App v2", total: "₹9,80,000", paid: "₹4,90,000", remaining: "₹4,90,000", type: "Milestone", status: "Partial", date: "2026-04-10" },
  { client: "Sunrise Retail", project: "Data Migration", total: "₹6,40,000", paid: "₹0", remaining: "₹6,40,000", type: "Post-Delivery", status: "Pending", date: "2026-03-05" },
  { client: "FinTech Ltd.", project: "Analytics Dashboard", total: "₹15,00,000", paid: "₹15,00,000", remaining: "₹0", type: "Full Payment", status: "Paid", date: "2026-04-18" },
  { client: "CloudBase Inc.", project: "API Gateway Setup", total: "₹7,20,000", paid: "₹3,60,000", remaining: "₹3,60,000", type: "Milestone", status: "Partial", date: "2026-04-05" },
];

const revenueChartData = [
  { name: "Jan", revenue: 820000, expenses: 420000 },
  { name: "Feb", revenue: 940000, expenses: 460000 },
  { name: "Mar", revenue: 1100000, expenses: 510000 },
  { name: "Apr", revenue: 1350000, expenses: 590000 },
  { name: "May", revenue: 1200000, expenses: 550000 },
  { name: "Jun", revenue: 1480000, expenses: 620000 },
];

const deptPerformanceData = [
  { name: "Sales", target: 90, achieved: 87 },
  { name: "Management", target: 85, achieved: 80 },
  { name: "Finance", target: 95, achieved: 92 },
];

// ─── Column Definitions ─────────────────────────────────────────────────────

const salesColumns = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "activeLeads", label: "Active Leads" },
  { key: "calls", label: "Calls" },
  { key: "conversion", label: "Conversion %" },
  { key: "revenue", label: "Revenue" },
  { key: "status", label: "Status" },
];

const projectColumns = [
  { key: "project", label: "Project Name" },
  { key: "client", label: "Client" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "status", label: "Status" },
  { key: "progress", label: "Progress %" },
  { key: "priority", label: "Priority" },
];

const financeColumns = [
  { key: "client", label: "Client" },
  { key: "project", label: "Project" },
  { key: "total", label: "Total Amount" },
  { key: "paid", label: "Paid" },
  { key: "remaining", label: "Remaining" },
  { key: "status", label: "Status" },
];

// ─── Component ──────────────────────────────────────────────────────────────

const initialDepts = [
  { id: "dept-1", name: "sales", displayName: "Sales Department", totalUsers: 8, activeUsers: 6, roles: "Manager, TL, Executive", createdAt: "10 Apr 2026" },
  { id: "dept-2", name: "management", displayName: "Management", totalUsers: 6, activeUsers: 5, roles: "Admin, Project Manager", createdAt: "15 Jan 2026" },
  { id: "dept-3", name: "finance", displayName: "Finance", totalUsers: 4, activeUsers: 4, roles: "Analyst, Accountant", createdAt: "05 Dec 2025" },
];

export default function Departments() {
  const [departments, setDepartments] = useState(initialDepts);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDept, setFormDept] = useState({ name: "", displayName: "" });
  const [deptToDelete, setDeptToDelete] = useState(null);

  const fetchDepartments = () => {
    // Replaced by mock state
  };

  const totalDepts = departments.length;
  const totalUsers = departments.reduce((sum, d) => sum + d.totalUsers, 0);
  const totalActive = departments.reduce((sum, d) => sum + d.activeUsers, 0);

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (formDept.id) {
        setDepartments(prev => prev.map(d => d.id === formDept.id ? { ...d, displayName: formDept.displayName, name: formDept.name } : d));
      } else {
        const newDept = {
          id: `dept-${Date.now()}`,
          name: formDept.name,
          displayName: formDept.displayName,
          totalUsers: 0,
          activeUsers: 0,
          roles: "—",
          createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        };
        setDepartments(prev => [...prev, newDept]);
      }
      closeModal("dept-form-modal");
      setIsSubmitting(false);
    }, 500);
  };

  const handleDelete = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setDepartments(prev => prev.filter(d => d.id !== deptToDelete.id));
      closeModal("dept-delete-modal");
      setIsSubmitting(false);
    }, 500);
  };

  const deptColumns = [
    { key: "displayName", label: "Department" },
    { key: "name", label: "System Key" },
    { key: "totalUsers", label: "Total Users" },
    { key: "activeUsers", label: "Active Users" },
    { key: "roles", label: "Roles" },
    { key: "createdAt", label: "Created" },
  ];

  const deptActions = [
    { icon: <Eye size={15} />, tooltip: "View", variant: "ghost", onClick: (row) => { setSelectedDept(row); openModal("dept-detail-modal"); } },
    { icon: <Pencil size={15} />, tooltip: "Edit", variant: "primary", onClick: (row) => { setFormDept({ id: row.id, name: row.name, displayName: row.displayName }); openModal("dept-form-modal"); } },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-5 mb-4">
        <div className="w-full">
          <Heading primaryText="Department" secondaryText="Overview" size={12} />
          <P text="Manage departments and view role-based performance metrics." size="sm" />
        </div>
        <div className="flex justify-start">
          <button
            onClick={() => { setFormDept({ name: "", displayName: "" }); openModal("dept-form-modal"); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm shadow-lg bg-[#2a465a] hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <Plus size={16} /> Add Department
          </button>
        </div>
      </div>

      {/* ── Global KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Total Departments" value={String(totalDepts)} icon={<Building2 size={22} />} accentColor="#38bdf8" size={3} />
        <EnhancedDashCard title="Total Users" value={String(totalUsers)} icon={<Users size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Active Users" value={String(totalActive)} icon={<UserCheck size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Total Revenue" value="₹1.84Cr" icon={<DollarSign size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      {/* ── Charts ── */}
      <DashGrid cols={12} gap={4}>
        <GAreaChart
          title="Revenue & Expense Trend"
          subtitle="Monthly breakdown"
          data={revenueChartData}
          areas={[
            { key: "revenue", label: "Revenue", color: "#3b82f6" },
            { key: "expenses", label: "Expenses", color: "#f43f5e" },
          ]}
          size={8} height={300}
        />
        <GBarChart
          title="Department Performance"
          subtitle="Target vs Achieved"
          data={deptPerformanceData}
          bars={[
            { key: "target", label: "Target", color: "#94a3b8" },
            { key: "achieved", label: "Achieved", color: "#2a465a" },
          ]}
          size={4} height={300}
        />
      </DashGrid>

      {/* ── Department Directory Table ── */}
      <DataTable
        title="Department Directory"
        columns={deptColumns}
        rows={departments}
        actions={deptActions}
        pageSize={10}
        searchable
        size={12}
      />

      {/* ══ SALES DEPARTMENT ══════════════════════════════════════════════════ */}
      <DashGrid cols={12} gap={4}>
        <div className="col-span-12"><Heading primaryText="Sales" secondaryText="Department" size={12} /></div>
        <EnhancedDashCard title="Total Leads" value="1,073" icon={<Target size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Active Leads" value="440" icon={<Activity size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Dump Leads" value="162" icon={<AlertCircle size={22} />} accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Avg Conversion" value="40.3%" icon={<TrendingUp size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>
      <DataTable
        title="Sales Employees"
        columns={salesColumns}
        rows={salesEmployees}
        size={12} pageSize={5} searchable date={false}
        filters={[
          { title: "Role", key: "role", type: "toggle", options: ["Manager", "TL", "Executive"] },
          { title: "Status", key: "status", type: "toggle", options: ["Active", "Inactive"] },
        ]}
      />

      {/* ══ MANAGEMENT DEPARTMENT ═════════════════════════════════════════════ */}
      <DashGrid cols={12} gap={4}>
        <div className="col-span-12"><Heading primaryText="Management" secondaryText="Department" size={12} /></div>
        <EnhancedDashCard title="Total Projects" value="6" icon={<Briefcase size={22} />} accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="In Progress" value="4" icon={<Clock size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Completed" value="1" icon={<CheckCircle size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Delayed" value="1" icon={<AlertCircle size={22} />} accentColor="#f43f5e" size={3} />
      </DashGrid>
      <DataTable
        title="Project Management"
        columns={projectColumns}
        rows={projects}
        size={12} pageSize={5} searchable date={true}
        filters={[
          { title: "Status", key: "status", type: "toggle", options: ["In Progress", "Completed", "Delayed"] },
          { title: "Priority", key: "priority", type: "toggle", options: ["Low", "Medium", "High", "Critical"] },
        ]}
      />

      {/* ══ FINANCE DEPARTMENT ════════════════════════════════════════════════ */}
      <DashGrid cols={12} gap={4}>
        <div className="col-span-12"><Heading primaryText="Finance" secondaryText="Department" size={12} /></div>
        <EnhancedDashCard title="Total Revenue" value="₹72,90,000" icon={<DollarSign size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Pending" value="₹18,70,000" icon={<Clock size={22} />} accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Expenses" value="₹31,50,000" icon={<CreditCard size={22} />} accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Net Profit" value="₹41,40,000" icon={<TrendingUp size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>
      <DataTable
        title="Finance & Payments"
        columns={financeColumns}
        rows={financeRecords}
        size={12} pageSize={5} searchable date={true}
        filters={[
          { title: "Status", key: "status", type: "toggle", options: ["Paid", "Partial", "Pending"] },
          { title: "Type", key: "type", type: "toggle", options: ["Milestone", "Full Payment", "Post-Delivery"] },
        ]}
      />

      {/* ══ PANEL MODALS ═════════════════════════════════════════════════════ */}

      {/* Detail Modal */}
      <Modal id="dept-detail-modal" title="Department Details">
        {selectedDept && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white shadow-lg">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-lg font-black text-[#2a465a]">{selectedDept.displayName}</p>
                <p className="text-sm font-bold text-slate-500">System Key: {selectedDept.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Users", val: selectedDept.totalUsers },
                { label: "Active Users", val: selectedDept.activeUsers },
                { label: "Roles", val: selectedDept.roles },
                { label: "Created", val: selectedDept.createdAt },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-white px-3 py-2.5 rounded-xl block border border-slate-100 text-sm">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("dept-detail-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal (Add/Edit) */}
      <Modal id="dept-form-modal" title={formDept.id ? "Edit Department" : "Add Department"}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
            <input type="text" value={formDept.displayName} onChange={(e) => setFormDept({ ...formDept, displayName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#2a465a] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
              placeholder="e.g. Human Resources" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Key (Unique)</label>
            <input type="text" value={formDept.name} onChange={(e) => setFormDept({ ...formDept, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#2a465a] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
              placeholder="e.g. hr_dept" disabled={!!formDept.id} />
            {formDept.id && <p className="text-xs text-amber-600 font-medium mt-1">System keys cannot be changed after creation.</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("dept-form-modal")} disabled={isSubmitting} />
            <Button text={isSubmitting ? "Saving..." : formDept.id ? "Update" : "Create"} variant="primary" size={3} onClick={handleSave} disabled={isSubmitting || !formDept.displayName || !formDept.name} />
          </div>

          {formDept.id && (
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest mr-auto">Danger Zone</span>
              <Button text="Delete Department" variant="danger" size={3} onClick={() => {
                closeModal("dept-form-modal");
                setDeptToDelete({ id: formDept.id, displayName: formDept.displayName });
                openModal("dept-delete-modal");
              }} />
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal id="dept-delete-modal" title="Confirm Deletion">
        {deptToDelete && (
          <div className="space-y-5">
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
              <h4 className="text-rose-800 font-bold mb-1">Warning</h4>
              <p className="text-sm text-rose-600 font-medium leading-relaxed">
                Are you sure you want to delete <strong>{deptToDelete.displayName}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("dept-delete-modal")} disabled={isSubmitting} />
              <Button text={isSubmitting ? "Deleting..." : "Delete Department"} variant="danger" size={3} onClick={handleDelete} disabled={isSubmitting} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
