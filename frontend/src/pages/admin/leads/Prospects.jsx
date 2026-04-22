import { useState, useMemo } from "react";
import {
  UserCheck,
  TrendingUp,
  IndianRupee,
  BarChart3,
  Phone,
  Eye,
  ArrowRightCircle,
  Plus,
  Target,
  Mail,
  Clock,
  Sparkles
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard as DashCard,
  PanelModal as Modal,
  openModal,
  closeModal,
  DataField,
  SelectField,
  Option,
  Grid
} from "../../../components/shared/Common_Components";

// ── Mock prospects (Interested + Proposal) ──
const mockProspects = [
  { id: 1, name: "Vikash Sharma", mobile: "9834567890", email: "vikash@bigbiz.com", source: "Cold Call", status: "Interested", owner: "Rahul S.", value: "₹5,00,000", probability: 60, lastContact: "Apr 18", nextFollowup: "Apr 24", avatar: "VS" },
  { id: 2, name: "Ritu Desai", mobile: "9845678901", email: "ritu@globalfirm.co", source: "Social", status: "Proposal", owner: "Deepika N.", value: "₹3,20,000", probability: 80, lastContact: "Apr 17", nextFollowup: "Apr 25", avatar: "RD" },
  { id: 3, name: "Rohan Gupta", mobile: "9890123456", email: "rohan@luxedev.com", source: "Social", status: "Interested", owner: "Anita B.", value: "₹6,00,000", probability: 45, lastContact: "Apr 16", nextFollowup: "Apr 26", avatar: "RG" },
  { id: 4, name: "Sanya Patel", mobile: "9801234567", email: "sanya@nextwave.in", source: "Ads", status: "Proposal", owner: "Rahul S.", value: "₹2,75,000", probability: 75, lastContact: "Apr 14", nextFollowup: "Apr 28", avatar: "SP" },
  { id: 5, name: "Arjun Malhotra", mobile: "9812345671", email: "arjun@techlab.in", source: "Website", status: "Interested", owner: "Neha S.", value: "₹4,20,000", probability: 55, lastContact: "Apr 19", nextFollowup: "Apr 24", avatar: "AM" },
  { id: 6, name: "Kavita Reddy", mobile: "9823456782", email: "kavita@digimart.co", source: "Referral", status: "Proposal", owner: "Deepika N.", value: "₹8,50,000", probability: 90, lastContact: "Apr 20", nextFollowup: "Apr 22", avatar: "KR" },
];

export default function Prospects() {
  const [prospects] = useState(mockProspects);

  const totalPipeline = prospects.reduce((sum, p) => {
    const val = parseInt(p.value.replace(/[₹,]/g, "")) || 0;
    return sum + val;
  }, 0);

  const weightedValue = prospects.reduce((sum, p) => {
    const val = parseInt(p.value.replace(/[₹,]/g, "")) || 0;
    return sum + (val * p.probability) / 100;
  }, 0);

  const avgDealSize = prospects.length > 0 ? Math.round(totalPipeline / prospects.length) : 0;

  const formatCurrency = (num) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
  };

  const statusColors = {
    Interested: { bg: "bg-purple-100", text: "text-purple-700" },
    Proposal: { bg: "bg-indigo-100", text: "text-indigo-700" },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#2a465a] flex items-center gap-2">
            Prospects <Sparkles className="text-amber-500" size={20} />
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Leads with high conversion probability</p>
        </div>
        <button
          onClick={() => openModal("add-prospect-modal")}
          className="flex items-center gap-2 rounded-2xl bg-[#2a465a] px-5 py-3 text-xs font-black text-white shadow-xl shadow-[#2a465a]/20 transition hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-2xl hover:-translate-y-1 active:scale-95 shiny-sweep"
        >
          <Plus size={16} strokeWidth={3} /> Add New Prospect
        </button>
      </div>

      {/* Pipeline Summary Cards */}
      <DashGrid cols={12} gap={4}>
        <DashCard title="Total Pipeline" value={formatCurrency(totalPipeline)} icon={<IndianRupee size={22} />} accentColor="#38bdf8" size={4} />
        <DashCard title="Weighted Value" value={formatCurrency(Math.round(weightedValue))} icon={<TrendingUp size={22} />} accentColor="#22c55e" size={4} />
        <DashCard title="Avg Deal Value" value={formatCurrency(avgDealSize)} icon={<BarChart3 size={22} />} accentColor="#f59e0b" size={4} />
      </DashGrid>

      {/* Prospects Card Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prospects.map((lead) => {
          const sc = statusColors[lead.status] || { bg: "bg-slate-100", text: "text-slate-600" };
          return (
            <div
              key={lead.id}
              className="group rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-[#2a465a]/20"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {lead.avatar}
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#2a465a] leading-tight mb-1">{lead.name}</p>
                    <p className="text-xs text-slate-400 font-bold tracking-widest">{lead.mobile}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sc.bg} ${sc.text} border border-black/5 shadow-sm`}>
                  {lead.status}
                </span>
              </div>
              
              <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <p className="text-sm font-bold text-slate-500 flex items-center gap-3">
                  <Mail size={16} className="text-slate-400" /> {lead.email}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Deal Value</span>
                      <span className="text-base font-black text-[#2a465a]">{lead.value}</span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-right">Probability</span>
                      <div className="flex items-center gap-2">
                         <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${lead.probability}%` }} />
                         </div>
                         <span className="text-sm font-black text-emerald-600">{lead.probability}%</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  className="flex-1 py-3.5 rounded-2xl text-xs font-black text-white bg-[#2a465a] shadow-lg shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition-all flex items-center justify-center gap-2 active:scale-95 shiny-sweep"
                  onClick={() => { window.dispatchEvent(new CustomEvent("open-global-call", { detail: { name: lead.name, mobile: lead.mobile } })); }}
                >
                  <Phone size={14} fill="currentColor" /> CALL
                </button>
                <button
                  className="flex-1 py-3.5 rounded-2xl text-xs font-black text-[#2a465a] border-2 border-[#2a465a]/10 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                  onClick={() => { window.location.href = `mailto:${lead.email}`; }}
                >
                  <Mail size={14} /> EMAIL
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal id="add-prospect-modal" title="New High-Level Prospect">
        <div className="space-y-6 pt-2">
          <Grid cols={12} gap={4}>
            <DataField label="Prospect Name" id="p-name" size={12} placeholder="e.g. Vikash Sharma" />
            <DataField label="Mobile Contact" id="p-mobile" type="tel" size={6} placeholder="+91 00000 00000" />
            <DataField label="Email Address" id="p-email" type="email" size={6} placeholder="client@company.com" />
            <DataField label="Deal Value (₹)" id="p-value" type="number" size={6} placeholder="500000" />
            <DataField label="Conv. Probability (%)" id="p-prob" type="number" size={6} placeholder="60" />
            <SelectField label="Executive Assigned" id="p-owner" size={12} placeholder="Select responsible member">
              <Option value="rahul" label="Rahul S." />
              <Option value="neha" label="Neha S." />
              <Option value="deepika" label="Deepika N." />
            </SelectField>
          </Grid>
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
            <button onClick={() => closeModal("add-prospect-modal")} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={() => { closeModal("add-prospect-modal"); alert("Prospect added!"); }} className="px-6 py-2.5 rounded-xl text-sm font-black text-white bg-[#2a465a] shadow-lg shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95 shiny-sweep">Save Prospect</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

