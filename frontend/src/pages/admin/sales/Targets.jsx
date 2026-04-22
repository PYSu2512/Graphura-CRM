import { useState } from "react";
import {
  Target,
  IndianRupee,
  Handshake,
  Phone,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard as DashCard,
  GBarChart,
  PanelModal as Modal,
  openModal,
  closeModal,
  EnhancedDataTable as DataTable,
  DataField,
  SelectField,
  Option,
  Grid,
} from "../../../components/shared/Common_Components";

// ── Period selector ──
const periods = ["Monthly", "Quarterly", "Yearly"];

// ── Big target cards ──
const bigTargets = [
  { label: "Revenue Goal", achieved: 1850000, target: 2500000, icon: IndianRupee, color: "#38bdf8" },
  { label: "Deals Goal", achieved: 14, target: 20, icon: Handshake, color: "#22c55e" },
  { label: "Phone Activity", achieved: 342, target: 500, icon: Phone, color: "#818cf8" },
];

// ── Team targets ──
const teamTargets = [
  { id: 1, name: "Rahul S.", targetValue: "₹8L", achievedValue: "₹7.6L", pct: 95, trend: "+12%", status: "On Track" },
  { id: 2, name: "Neha S.", targetValue: "₹6L", achievedValue: "₹4.8L", pct: 80, trend: "+5%", status: "On Track" },
  { id: 3, name: "Deepika N.", targetValue: "₹5L", achievedValue: "₹3.2L", pct: 64, trend: "-2%", status: "At Risk" },
  { id: 4, name: "Anita B.", targetValue: "₹4L", achievedValue: "₹1.8L", pct: 45, trend: "+3%", status: "Behind" },
  { id: 5, name: "Vikram D.", targetValue: "₹3L", achievedValue: "₹2.4L", pct: 80, trend: "+8%", status: "On Track" },
];

// ── Chart data (target vs actual) ──
const comparisonData = [
  { name: "Rahul S.", target: 800, actual: 760 },
  { name: "Neha S.", target: 600, actual: 480 },
  { name: "Deepika N.", target: 500, actual: 320 },
  { name: "Anita B.", target: 400, actual: 180 },
  { name: "Vikram D.", target: 300, actual: 240 },
];

const statusColors = {
  "On Track": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "At Risk": { bg: "bg-amber-100", text: "text-amber-700" },
  Behind: { bg: "bg-rose-100", text: "text-rose-700" },
};

export default function Targets() {
  const [activePeriod, setActivePeriod] = useState("Monthly");

  const formatCurrency = (num) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
  };

  const columns = [
    { key: "name", label: "Representative" },
    { key: "targetValue", label: "Assigned Target" },
    { key: "achievedValue", label: "Actual Achieved" },
    { key: "pctDisplay", label: "Progress" },
    { key: "trend", label: "Growth Trend" },
    { key: "status", label: "Health Status" },
  ];

  const rows = teamTargets.map(t => ({
    ...t,
    pctDisplay: (
      <div className="flex items-center gap-3 min-w-[120px]">
        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
           <div className="h-full rounded-full bg-gradient-to-r from-[#2a465a] to-[#38bdf8] transition-all duration-1000" style={{ width: `${t.pct}%` }} />
        </div>
        <span className="text-xs font-black text-[#2a465a]">{t.pct}%</span>
      </div>
    )
  }));

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#2a465a] flex items-center gap-2">
            Performance Targets <Target className="text-[#38bdf8]" size={24} />
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Strive for excellence with real-time goal tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1.5 shadow-inner">
            {periods.map((p) => (
              <button key={p} onClick={() => setActivePeriod(p)} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activePeriod === p ? "bg-[#2a465a] text-white shadow-lg" : "text-slate-500 hover:text-[#2a465a] hover:bg-white"}`}>{p}</button>
            ))}
          </div>
          <button onClick={() => openModal("set-target-modal")} className="flex items-center gap-2 rounded-2xl bg-[#2a465a] px-5 py-3 text-xs font-black text-white shadow-xl shadow-[#2a465a]/20 transition hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-2xl active:scale-95 shiny-sweep">
            <Sparkles size={14} fill="currentColor" /> SET NEW GOAL
          </button>
        </div>
      </div>

      {/* Big Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bigTargets.map((t) => {
          const Icon = t.icon;
          const pct = Math.round((t.achieved / t.target) * 100);
          const circumference = 2 * Math.PI * 34; // Adjusted radius
          const dashOffset = circumference - (pct / 100) * circumference;
          return (
            <div key={t.label} className="group relative rounded-[2.5rem] dark-shiny-border bg-white p-7 shadow-sm hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-500" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}dd)` }}>
                    <Icon size={28} strokeWidth={2.5} />
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.label}</p>
                    <div className="flex items-center justify-end gap-1 text-emerald-500 font-black text-xs mt-1">
                       <ArrowUpRight size={14} strokeWidth={3} /> +8.4%
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-6 relative z-10">
                <div className="relative flex-shrink-0">
                  <svg width="84" height="84" className="-rotate-90 drop-shadow-md">
                    <circle cx="42" cy="42" r="34" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle cx="42" cy="42" r="34" fill="none" stroke={t.color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} className="transition-all duration-[1.5s] cubic-bezier(0.4, 0, 0.2, 1)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-black text-[#2a465a]">{pct}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-black text-[#2a465a] tracking-tighter">
                     {typeof t.achieved === "number" && t.achieved > 1000 ? formatCurrency(t.achieved) : t.achieved}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                     <p className="text-xs font-bold text-slate-400 tracking-tight">target: {typeof t.target === "number" && t.target > 1000 ? formatCurrency(t.target) : t.target}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Targets Table */}
      <DataTable 
        title="Representative Progress Log"
        columns={columns} 
        rows={rows} 
        pageSize={5} 
        importantColumnsCount={4}
      />

      {/* Target vs Actual Chart Section */}
      <div className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <Target size={120} />
        </div>
        <GBarChart
          title="Yield vs Projection Mapping"
          subtitle="Revenue comparison across individual sales vectors (₹ in thousands)"
          data={comparisonData}
          bars={[
            { key: "target", label: "Projected", color: "#e2e8f0" },
            { key: "actual", label: "Yield", color: "#2a465a" },
          ]}
          height={320}
        />
      </div>

      {/* Set Target Modal */}
      <Modal id="set-target-modal" title="Establish High-Level Goal">
        <div className="space-y-6 pt-2">
          <Grid cols={12} gap={4}>
            <SelectField label="Select Representative" id="target-user" size={6} placeholder="Assignee">
              {teamTargets.map(t => <Option key={t.name} value={t.name} label={t.name} />)}
            </SelectField>
            <SelectField label="Temporal Cycle" id="target-period" size={6} placeholder="Period">
              {periods.map(p => <Option key={p} value={p} label={p} />)}
            </SelectField>
            <SelectField label="KPI Vector" id="target-metric" size={6} placeholder="Dimension">
              <Option value="revenue" label="Total Revenue" />
              <Option value="deals" label="Closed Deals" />
              <Option value="calls" label="Outbound Activity" />
            </SelectField>
            <DataField label="Target Magnitude" id="target-value" type="number" size={6} placeholder="e.g. 500000" />
          </Grid>
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
            <button onClick={() => closeModal("set-target-modal")} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition">Discard</button>
            <button onClick={() => { closeModal("set-target-modal"); alert("Strategic target locked!"); }} className="px-7 py-2.5 rounded-xl text-sm font-black text-white bg-[#2a465a] shadow-xl shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95 uppercase tracking-wider shiny-sweep">Lock Target</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

