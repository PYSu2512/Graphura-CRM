import { useState } from "react";
import {
  UserCheck,
  TrendingUp,
  IndianRupee,
  BarChart3,
  Eye,
  Pencil,
  BadgeCheck,
  Plus,
  CheckCircle,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard,
  DataTable,
  PanelModal as Modal,
  openModal,
  closeModal,
  DataField,
  SelectField,
  Option,
  Grid,
} from "../../../components/shared/Common_Components";

// ── Mock prospects (Interested + Proposal) ──
const mockProspects = [
  { id: 1, name: "Vikash Sharma", mobile: "9834567890", email: "vikash@bigbiz.com", service: "CRM Enterprise", budget: "₹5,00,000", assignedTL: "Rahul S.", status: "Hot", probability: 60, avatar: "VS" },
  { id: 2, name: "Ritu Desai", mobile: "9845678901", email: "ritu@globalfirm.co", service: "Digital Marketing", budget: "₹3,20,000", assignedTL: "Deepika N.", status: "Warm", probability: 80, avatar: "RD" },
  { id: 3, name: "Rohan Gupta", mobile: "9890123456", email: "rohan@luxedev.com", service: "Website Development", budget: "₹6,00,000", assignedTL: "Anita B.", status: "Hot", probability: 45, avatar: "RG" },
  { id: 4, name: "Sanya Patel", mobile: "9801234567", email: "sanya@nextwave.in", service: "SEO Optimization", budget: "₹2,75,000", assignedTL: "Rahul S.", status: "Warm", probability: 75, avatar: "SP" },
  { id: 5, name: "Arjun Malhotra", mobile: "9812345671", email: "arjun@techlab.in", service: "CRM Enterprise", budget: "₹4,20,000", assignedTL: "Neha S.", status: "Cold", probability: 55, avatar: "AM" },
  { id: 6, name: "Kavita Reddy", mobile: "9823456782", email: "kavita@digimart.co", service: "App Development", budget: "₹8,50,000", assignedTL: "Deepika N.", status: "Hot", probability: 90, avatar: "KR" },
  { id: 7, name: "Manish Tiwari", mobile: "9834567800", email: "manish@corp.in", service: "Digital Marketing", budget: "₹1,80,000", assignedTL: "Neha S.", status: "Warm", probability: 65, avatar: "MT" },
  { id: 8, name: "Lakshmi Iyer", mobile: "9823456700", email: "lakshmi@firm.co", service: "Website Development", budget: "₹3,50,000", assignedTL: "Anita B.", status: "Cold", probability: 40, avatar: "LI" },
];

const TEAM_LEADERS = [
  { id: 1, name: "Rahul S." },
  { id: 2, name: "Neha S." },
  { id: 3, name: "Deepika N." },
  { id: 4, name: "Anita B." },
];

export default function Prospects() {
  const [prospects, setProspects] = useState(mockProspects);

  // ── View modal ──
  const [viewRow, setViewRow] = useState(null);

  // ── Edit modal ──
  const [editRow, setEditRow] = useState(null);

  // ── Send to Finance bulk result ──
  const [financeResult, setFinanceResult] = useState([]);

  const sendToFinance = (rows) => {
    setFinanceResult(rows);
    openModal("pr-finance-modal");
  };

  const saveEdit = () => {
    setProspects((prev) => prev.map((p) => (p.id === editRow.id ? editRow : p)));
    closeModal("pr-edit-modal");
  };

  // Stats
  const totalPipeline = prospects.reduce((sum, p) => {
    const val = parseInt(p.budget.replace(/[₹,]/g, "")) || 0;
    return sum + val;
  }, 0);
  const hotCount = prospects.filter(p => p.status === "Hot").length;
  const warmCount = prospects.filter(p => p.status === "Warm").length;

  const formatCurrency = (num) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
  };

  return (
    <>
      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2a465a]">Prospects</h2>
            <p className="text-sm text-slate-500 mt-0.5">Leads with high conversion probability</p>
          </div>
          <button
            onClick={() => openModal("add-prospect-modal")}
            className="flex items-center gap-2 rounded-xl bg-[#2a465a] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#2a465a]/20 transition hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={14} /> Add Prospect
          </button>
        </div>

        {/* Pipeline Summary Cards */}
        <DashGrid cols={12} gap={4}>
          <EnhancedDashCard title="Total Pipeline" value={formatCurrency(totalPipeline)} icon={<IndianRupee size={22} />} accentColor="#38bdf8" size={4} />
          <EnhancedDashCard title="Hot Prospects" value={String(hotCount)} icon={<TrendingUp size={22} />} accentColor="#f43f5e" size={4} />
          <EnhancedDashCard title="Warm Prospects" value={String(warmCount)} icon={<BarChart3 size={22} />} accentColor="#f59e0b" size={4} />
        </DashGrid>

        {/* Prospects DataTable — SM Pattern */}
        <DataTable
          title="Prospects"
          columns={[
            { key: "name", label: "Name" },
            { key: "service", label: "Service" },
            { key: "budget", label: "Budget" },
            { key: "assignedTL", label: "Assigned TL" },
            { key: "status", label: "Status" },
          ]}
          rows={prospects}
          searchable
          size={12}
          pageSize={10}
          bulkAction
          bulkActions={[
            {
              title: "Send to Finance",
              icon: <IndianRupee size={14} />,
              onClick: (selected) => sendToFinance(selected),
            },
          ]}
          filters={[
            { title: "Status", type: "toggle", key: "status", options: ["Hot", "Warm", "Cold"] },
            { title: "Assigned TL", type: "select", key: "assignedTL", options: TEAM_LEADERS.map((t) => t.name) },
          ]}
          actions={[
            {
              icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
              onClick: (row) => { setViewRow(prospects.find((p) => p.id === row.id)); openModal("pr-view-modal"); },
            },
            {
              icon: <Pencil size={15} />, tooltip: "Edit", variant: "ghost",
              onClick: (row) => { setEditRow({ ...prospects.find((p) => p.id === row.id) }); openModal("pr-edit-modal"); },
            },
            {
              icon: <BadgeCheck size={15} />, tooltip: "Send to Finance", variant: "primary",
              onClick: (row) => sendToFinance([row]),
            },
          ]}
        />
      </div>

      {/* ── View Modal ── */}
      <Modal id="pr-view-modal" title="Prospect Details">
        {viewRow && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white font-black text-xl shadow-lg">
                {viewRow.avatar}
              </div>
              <div>
                <p className="text-lg font-black text-[#2a465a]">{viewRow.name}</p>
                <p className="text-sm font-bold text-slate-500">{viewRow.assignedTL} · {viewRow.status}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Mobile", val: viewRow.mobile },
                { label: "Email", val: viewRow.email },
                { label: "Service", val: viewRow.service },
                { label: "Budget", val: viewRow.budget },
                { label: "Assigned TL", val: viewRow.assignedTL },
                { label: "Status", val: viewRow.status },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-white px-3 py-2.5 rounded-xl block border border-slate-100 text-sm">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => closeModal("pr-view-modal")} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal id="pr-edit-modal" title="Edit Prospect">
        {editRow && (
          <div className="space-y-4">
            <Grid cols={12} gap={4}>
              <DataField label="Name" id="pr-name" value={editRow.name} size={6} onChange={(e) => setEditRow((p) => ({ ...p, name: e.target.value }))} />
              <DataField label="Mobile" id="pr-mobile" value={editRow.mobile} size={6} onChange={(e) => setEditRow((p) => ({ ...p, mobile: e.target.value }))} />
              <DataField label="Email" id="pr-email" value={editRow.email} size={12} type="email" onChange={(e) => setEditRow((p) => ({ ...p, email: e.target.value }))} />
              <DataField label="Service" id="pr-service" value={editRow.service} size={6} onChange={(e) => setEditRow((p) => ({ ...p, service: e.target.value }))} />
              <DataField label="Budget" id="pr-budget" value={editRow.budget} size={6} onChange={(e) => setEditRow((p) => ({ ...p, budget: e.target.value }))} />
              <SelectField label="Assigned TL" value={editRow.assignedTL} size={6} onChange={(e) => setEditRow((p) => ({ ...p, assignedTL: e.target.value }))}>
                {TEAM_LEADERS.map((tl) => <Option key={tl.id} value={tl.name} label={tl.name} />)}
              </SelectField>
              <SelectField label="Status" value={editRow.status} size={6} onChange={(e) => setEditRow((p) => ({ ...p, status: e.target.value }))}>
                {["Hot", "Warm", "Cold"].map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
            </Grid>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => closeModal("pr-edit-modal")} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
              <button onClick={saveEdit} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] shadow-lg shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add Prospect Modal ── */}
      <Modal id="add-prospect-modal" title="Add New Prospect">
        <div className="space-y-6 pt-2">
          <Grid cols={12} gap={4}>
            <DataField label="Prospect Name" id="new-p-name" size={12} placeholder="e.g. Vikash Sharma" />
            <DataField label="Mobile Contact" id="new-p-mobile" type="tel" size={6} placeholder="+91 00000 00000" />
            <DataField label="Email Address" id="new-p-email" type="email" size={6} placeholder="client@company.com" />
            <DataField label="Service" id="new-p-service" size={6} placeholder="e.g. CRM Enterprise" />
            <DataField label="Budget (₹)" id="new-p-budget" type="number" size={6} placeholder="500000" />
            <SelectField label="Assigned TL" id="new-p-tl" size={6} placeholder="Select team leader">
              {TEAM_LEADERS.map((tl) => <Option key={tl.id} value={tl.name} label={tl.name} />)}
            </SelectField>
            <SelectField label="Status" id="new-p-status" size={6} placeholder="Select status">
              {["Hot", "Warm", "Cold"].map((s) => <Option key={s} value={s} label={s} />)}
            </SelectField>
          </Grid>
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
            <button onClick={() => closeModal("add-prospect-modal")} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={() => { closeModal("add-prospect-modal"); alert("Prospect added!"); }} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] shadow-lg shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95">Save Prospect</button>
          </div>
        </div>
      </Modal>

      {/* ── Send to Finance Result Modal ── */}
      <Modal id="pr-finance-modal" title="Sent to Finance">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl">
            <CheckCircle size={18} className="flex-shrink-0" />
            <p className="text-sm font-semibold">
              {financeResult.length} prospect{financeResult.length !== 1 ? "s" : ""} sent to Finance successfully.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#2a465a] to-[#3a5a7a]">
                  <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Service</th>
                  <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Budget</th>
                </tr>
              </thead>
              <tbody>
                {financeResult.map((row, i) => (
                  <tr key={row.id ?? i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="py-3 px-4 font-semibold text-[#2a465a]">{row.name}</td>
                    <td className="py-3 px-4 text-slate-600">{row.service}</td>
                    <td className="py-3 px-4 text-slate-600">{row.budget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <button onClick={() => closeModal("pr-finance-modal")} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] shadow-lg shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95">Close</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
