import { useState, useMemo } from "react";
import {
  Users,
  Flame,
  TrendingUp,
  Search,
  Download,
  Filter,
  SlidersHorizontal,
  Plus,
  Phone,
  Mail,
  Eye,
  ArrowRightCircle,
  Trash2,
  LayoutGrid,
  LayoutList,
  Globe,
  Share2,
  PhoneCall,
  Megaphone,
  Target,
  X,
  Clock,
  MessageSquare,
  Paperclip,
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

// ── Mock Leads ──
const mockLeads = [
  { id: 1, name: "Arun Kapoor", mobile: "9812345678", email: "arun@techcorp.in", source: "Website", status: "New", owner: "Rahul S.", value: "₹2,50,000", lastContact: "Today", nextFollowup: "Apr 23", avatar: "AK" },
  { id: 2, name: "Priya Mehta", mobile: "9823456789", email: "priya@startup.io", source: "Referral", status: "Contacted", owner: "Neha S.", value: "₹1,80,000", lastContact: "Yesterday", nextFollowup: "Apr 22", avatar: "PM" },
  { id: 3, name: "Vikash Sharma", mobile: "9834567890", email: "vikash@bigbiz.com", source: "Cold Call", status: "Interested", owner: "Rahul S.", value: "₹5,00,000", lastContact: "Apr 18", nextFollowup: "Apr 24", avatar: "VS" },
  { id: 4, name: "Ritu Desai", mobile: "9845678901", email: "ritu@globalfirm.co", source: "Social", status: "Proposal", owner: "Deepika N.", value: "₹3,20,000", lastContact: "Apr 17", nextFollowup: "Apr 25", avatar: "RD" },
  { id: 5, name: "Kabir Singh", mobile: "9856789012", email: "kabir@digitalhub.in", source: "Ads", status: "Won", owner: "Anita B.", value: "₹4,50,000", lastContact: "Apr 15", nextFollowup: "—", avatar: "KS" },
  { id: 6, name: "Meera Joshi", mobile: "9867890123", email: "meera@cloudnet.com", source: "Website", status: "Lost", owner: "Rahul S.", value: "₹1,20,000", lastContact: "Apr 10", nextFollowup: "—", avatar: "MJ" },
  { id: 7, name: "Deepak Rao", mobile: "9878901234", email: "deepak@innov8.io", source: "Referral", status: "New", owner: "Neha S.", value: "₹2,00,000", lastContact: "Today", nextFollowup: "Apr 22", avatar: "DR" },
  { id: 8, name: "Ananya Nair", mobile: "9889012345", email: "ananya@finserv.in", source: "Cold Call", status: "Contacted", owner: "Deepika N.", value: "₹3,80,000", lastContact: "Apr 19", nextFollowup: "Apr 23", avatar: "AN" },
  { id: 9, name: "Rohan Gupta", mobile: "9890123456", email: "rohan@luxedev.com", source: "Social", status: "Interested", owner: "Anita B.", value: "₹6,00,000", lastContact: "Apr 16", nextFollowup: "Apr 26", avatar: "RG" },
  { id: 10, name: "Sanya Patel", mobile: "9801234567", email: "sanya@nextwave.in", source: "Ads", status: "Proposal", owner: "Rahul S.", value: "₹2,75,000", lastContact: "Apr 14", nextFollowup: "Apr 28", avatar: "SP" },
  { id: 11, name: "Tarun Bhat", mobile: "9812345670", email: "tarun@alpha.co", source: "Website", status: "New", owner: "Neha S.", value: "₹1,50,000", lastContact: "Today", nextFollowup: "Apr 24", avatar: "TB" },
  { id: 12, name: "Nisha Verma", mobile: "9823456780", email: "nisha@zenith.io", source: "Referral", status: "Won", owner: "Deepika N.", value: "₹7,00,000", lastContact: "Apr 12", nextFollowup: "—", avatar: "NV" },
];

const statusOptions = ["All", "New", "Contacted", "Interested", "Proposal", "Won", "Lost"];
const sourceOptions = ["All Sources", "Website", "Referral", "Cold Call", "Social", "Ads"];
const ownerOptions = ["All Owners", "Rahul S.", "Neha S.", "Deepika N.", "Anita B."];

const statusColors = {
  New: { bg: "bg-blue-100", text: "text-blue-700" },
  Contacted: { bg: "bg-amber-100", text: "text-amber-700" },
  Interested: { bg: "bg-purple-100", text: "text-purple-700" },
  Proposal: { bg: "bg-indigo-100", text: "text-indigo-700" },
  Won: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Lost: { bg: "bg-rose-100", text: "text-rose-700" },
};

export default function AllLeads() {
  const [leads, setLeads] = useState(mockLeads);
  const [activeTab, setActiveTab] = useState("all");

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Email,Company,Status\n" + 
      leads.map(l => `${l.name},${l.email},${l.company || "N/A"},${l.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [ownerFilter, setOwnerFilter] = useState("All Owners");
  const [viewMode, setViewMode] = useState("table");
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Stats
  const totalLeads = leads.length;
  const newToday = leads.filter((l) => l.lastContact === "Today").length;
  const hotLeads = leads.filter((l) => l.status === "Interested" || l.status === "Proposal").length;
  const converted = leads.filter((l) => l.status === "Won").length;

  // Filtered
  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || lead.name.toLowerCase().includes(q) || lead.mobile.includes(q) || lead.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || lead.status === statusFilter;
      const matchSource = sourceFilter === "All Sources" || lead.source === sourceFilter;
      const matchOwner = ownerFilter === "All Owners" || lead.owner === ownerFilter;
      return matchSearch && matchStatus && matchSource && matchOwner;
    });
  }, [leads, searchQuery, statusFilter, sourceFilter, ownerFilter]);

  // Table columns
  const columns = [
    { key: "name", label: "Lead Name" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
    { key: "owner", label: "Owner" },
    { key: "value", label: "Deal Value" },
  ];

  const actions = [
    { label: "Call", icon: <Phone size={14} />, variant: "primary", onClick: (row) => { window.dispatchEvent(new CustomEvent("open-global-call", { detail: { name: row.name, mobile: row.mobile } })); } },
    { label: "View", icon: <Eye size={14} />, variant: "ghost", onClick: (row) => { setSelectedLead(row); openModal("lead-detail-modal"); } },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">All Leads</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage your complete lead pipeline</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95">
            <Download size={14} /> Export
          </button>
          <button onClick={() => openModal("add-lead-modal")} className="flex items-center gap-2 rounded-xl bg-[#2a465a] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#2a465a]/20 transition hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Total Leads" value={String(totalLeads)} icon={<Users size={22} />} accentColor="#38bdf8" size={3} />
        <EnhancedDashCard title="New Today" value={String(newToday)} icon={<TrendingUp size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Hot Leads" value={String(hotLeads)} icon={<Flame size={22} />} accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Converted" value={String(converted)} icon={<ArrowRightCircle size={22} />} accentColor="#22c55e" size={3} />
      </DashGrid>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 cursor-pointer">
              {sourceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 cursor-pointer">
              {ownerOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 p-0.5">
              <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition ${viewMode === "table" ? "bg-[#2a465a] text-white shadow-sm" : "text-slate-400 hover:text-[#2a465a]"}`}><LayoutList size={16} /></button>
              <button onClick={() => setViewMode("card")} className={`p-2 rounded-lg transition ${viewMode === "card" ? "bg-[#2a465a] text-white shadow-sm" : "text-slate-400 hover:text-[#2a465a]"}`}><LayoutGrid size={16} /></button>
            </div>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusOptions.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${statusFilter === s ? "bg-[#2a465a] text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table / Card View */}
      {viewMode === "table" ? (
        <DataTable
          title="Lead Records"
          columns={columns}
          rows={filtered}
          actions={actions}
          pageSize={5}
          searchable
          size={12}
          filters={[
            { title: "Source", type: "select", key: "source", options: ["Website", "Referral", "Cold Call", "Social", "Ads"] },
            { title: "Status", type: "toggle", key: "status", options: ["New", "Contacted", "Interested", "Proposal", "Won", "Lost"] },
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((lead) => {
            const sc = statusColors[lead.status] || { bg: "bg-slate-100", text: "text-slate-600" };
            return (
              <div key={lead.id} className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group" onClick={() => { setSelectedLead(lead); openModal("lead-detail-modal"); }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">{lead.avatar}</div>
                    <div>
                      <p className="text-base font-black text-[#2a465a]">{lead.name}</p>
                      <p className="text-xs font-bold text-slate-400 tracking-wider">{lead.mobile}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sc.bg} ${sc.text} shadow-sm border border-black/5`}>{lead.status}</span>
                </div>
                <div className="space-y-2 mb-6">
                  <p className="text-sm font-bold text-slate-600 flex items-center gap-2.5"><Mail size={14} className="text-slate-400" /> {lead.email}</p>
                  <p className="text-sm font-bold text-slate-600 flex items-center gap-2.5"><Target size={14} className="text-slate-400" /> {lead.source}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-lg font-black text-[#2a465a]">{lead.value}</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100">
                    <Users size={12} className="text-slate-400" />
                    <span className="text-[11px] font-black text-slate-500 uppercase">{lead.owner}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Detail Modal */}
      <Modal id="lead-detail-modal" title="Lead Details">
        {selectedLead && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white font-black text-xl shadow-lg">{selectedLead.avatar}</div>
              <div>
                <h3 className="text-xl font-black text-[#2a465a]">{selectedLead.name}</h3>
                <p className="text-sm font-bold text-slate-500">{selectedLead.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Mobile", val: selectedLead.mobile },
                { label: "Source", val: selectedLead.source },
                { label: "Status", val: selectedLead.status },
                { label: "Owner", val: selectedLead.owner },
                { label: "Value", val: selectedLead.value },
                { label: "Next Follow-up", val: selectedLead.nextFollowup },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-slate-50 px-3 py-2.5 rounded-xl block border border-slate-100 text-sm">{val}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Clock size={13} /> Activity Timeline
              </h4>
              <div className="space-y-4 relative ml-3 border-l-2 border-slate-100 pl-6">
                {[
                  { icon: <Phone size={13} />, text: "Call made — discussed requirements", time: "Today 2:30 PM", color: "#3b82f6" },
                  { icon: <Mail size={13} />, text: "Email sent — proposal attached", time: "Apr 19 11:00 AM", color: "#8b5cf6" },
                  { icon: <MessageSquare size={13} />, text: "Note: Very interested in premium plan", time: "Apr 18 4:15 PM", color: "#f59e0b" },
                  { icon: <Clock size={13} />, text: "Lead created from website form", time: "Apr 15 9:30 AM", color: "#22c55e" },
                ].map((activity, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-white border-[3px] border-slate-200" />
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${activity.color}15`, color: activity.color }}>{activity.icon}</div>
                      <div>
                        <p className="text-sm text-[#2a465a] font-bold">{activity.text}</p>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => { window.dispatchEvent(new CustomEvent("open-global-call", { detail: { name: selectedLead.name, mobile: selectedLead.mobile } })); }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white bg-[#2a465a] shadow-lg shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95"><Phone size={16} fill="currentColor" /> Call</button>
              <button onClick={() => { window.location.href = `mailto:${selectedLead.email}`; }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-[#2a465a] border border-slate-200 bg-white hover:bg-slate-50 transition active:scale-95"><Mail size={16} /> Email</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Lead Modal */}
      <Modal id="add-lead-modal" title="Capture New Lead">
        <div className="space-y-6 pt-2">
          <Grid cols={12} gap={4}>
            <DataField label="Lead Full Name" id="lead-name" size={12} placeholder="e.g. Arun Kapoor" />
            <DataField label="Mobile Number" id="lead-mobile" type="tel" size={6} placeholder="+91 98123 45678" />
            <DataField label="Work Email" id="lead-email" type="email" size={6} placeholder="name@company.com" />
            <SelectField label="Lead Source" id="lead-source" size={6} placeholder="How did they find you?">
              <Option value="website" label="Website" />
              <Option value="referral" label="Referral" />
              <Option value="cold_call" label="Cold Call" />
              <Option value="social" label="Social Media" />
              <Option value="ads" label="Ads" />
            </SelectField>
            <DataField label="Expected Deal Value (₹)" id="lead-value" type="number" size={6} placeholder="50000" />
            <SelectField label="Account Owner" id="lead-owner" size={12} placeholder="Assign to representative">
              <Option value="rahul" label="Rahul S." />
              <Option value="neha" label="Neha S." />
              <Option value="deepika" label="Deepika N." />
              <Option value="anita" label="Anita B." />
            </SelectField>
          </Grid>
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
            <button onClick={() => closeModal("add-lead-modal")} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={() => { closeModal("add-lead-modal"); alert("Lead added to pipeline!"); }} className="px-6 py-2.5 rounded-xl text-sm font-black text-white bg-[#2a465a] shadow-lg shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95">Save Lead</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


