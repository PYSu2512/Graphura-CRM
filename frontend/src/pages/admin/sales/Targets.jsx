import { useState, useMemo } from "react";
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
  Trophy,
  Users,
  Building2,
  RotateCcw,
  PercentCircle,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard as DashCard,
  GBarChart,
  PanelModal as Modal,
  openModal,
  closeModal,
  DataTable,
  DataField,
  SelectField,
  Option,
  Grid,
} from "../../../components/shared/Common_Components";

// ── Period selector ──
const periods = ["Daily", "Weekly", "Monthly"];

// ── Department filter options ──
const departments = ["All Departments", "Sales", "Finance", "Management"];

// ── Big target cards per department ──
const bigTargetsData = {
  "All Departments": [
    { label: "Revenue Goal", achieved: 1850000, target: 2500000, icon: IndianRupee, color: "#38bdf8", growth: "+8.4%" },
    { label: "Deals Closed", achieved: 14, target: 20, icon: Handshake, color: "#22c55e", growth: "+6.2%" },
    { label: "Phone Activity", achieved: 342, target: 500, icon: Phone, color: "#818cf8", growth: "+11.3%" },
    { label: "Follow-ups", achieved: 218, target: 300, icon: RotateCcw, color: "#f59e0b", growth: "+4.1%" },
    { label: "Conversion Rate", achieved: 28, target: 40, icon: PercentCircle, color: "#f43f5e", growth: "+2.8%" },
  ],
  Sales: [
    { label: "Revenue Goal", achieved: 1250000, target: 1800000, icon: IndianRupee, color: "#38bdf8", growth: "+9.1%" },
    { label: "Deals Closed", achieved: 10, target: 14, icon: Handshake, color: "#22c55e", growth: "+7.5%" },
    { label: "Phone Activity", achieved: 280, target: 400, icon: Phone, color: "#818cf8", growth: "+12.0%" },
    { label: "Follow-ups", achieved: 175, target: 220, icon: RotateCcw, color: "#f59e0b", growth: "+5.2%" },
    { label: "Conversion Rate", achieved: 32, target: 40, icon: PercentCircle, color: "#f43f5e", growth: "+3.1%" },
  ],
  Finance: [
    { label: "Collections", achieved: 420000, target: 600000, icon: IndianRupee, color: "#38bdf8", growth: "+4.5%" },
    { label: "Invoices Cleared", achieved: 38, target: 50, icon: Handshake, color: "#22c55e", growth: "+6.8%" },
    { label: "Follow-ups", achieved: 32, target: 60, icon: RotateCcw, color: "#f59e0b", growth: "+3.2%" },
    { label: "Payment Success", achieved: 85, target: 100, icon: PercentCircle, color: "#f43f5e", growth: "+1.9%" },
    { label: "Calls Made", achieved: 48, target: 80, icon: Phone, color: "#818cf8", growth: "+2.0%" },
  ],
  Management: [
    { label: "Projects Delivered", achieved: 8, target: 12, icon: Handshake, color: "#22c55e", growth: "+5.0%" },
    { label: "Team Utilization", achieved: 78, target: 95, icon: PercentCircle, color: "#38bdf8", growth: "+3.6%" },
    { label: "Escalations Resolved", achieved: 5, target: 6, icon: CheckCircle2, color: "#f43f5e", growth: "+8.3%" },
    { label: "Budget Used", achieved: 1200000, target: 1500000, icon: IndianRupee, color: "#f59e0b", growth: "+2.1%" },
    { label: "Reviews Completed", achieved: 15, target: 20, icon: RotateCcw, color: "#818cf8", growth: "+4.0%" },
  ],
};

// ── Team targets per department ──
const teamTargetsData = {
  "All Departments": [
    { id: 1, name: "Rahul S.", department: "Sales", targetValue: "₹8L", achievedValue: "₹7.6L", pct: 95, trend: "+12%", status: "On Track", followUps: 42, conversionRate: "34%" },
    { id: 2, name: "Neha S.", department: "Sales", targetValue: "₹6L", achievedValue: "₹4.8L", pct: 80, trend: "+5%", status: "On Track", followUps: 38, conversionRate: "28%" },
    { id: 3, name: "Deepika N.", department: "Finance", targetValue: "₹5L", achievedValue: "₹3.2L", pct: 64, trend: "-2%", status: "At Risk", followUps: 25, conversionRate: "20%" },
    { id: 4, name: "Anita B.", department: "Management", targetValue: "₹4L", achievedValue: "₹1.8L", pct: 45, trend: "+3%", status: "Behind", followUps: 15, conversionRate: "12%" },
    { id: 5, name: "Vikram D.", department: "Sales", targetValue: "₹3L", achievedValue: "₹2.4L", pct: 80, trend: "+8%", status: "On Track", followUps: 35, conversionRate: "31%" },
    { id: 6, name: "Priya K.", department: "Finance", targetValue: "₹4.5L", achievedValue: "₹4.1L", pct: 91, trend: "+10%", status: "On Track", followUps: 28, conversionRate: "30%" },
    { id: 7, name: "Arjun M.", department: "Management", targetValue: "₹3.5L", achievedValue: "₹2.0L", pct: 57, trend: "+1%", status: "At Risk", followUps: 18, conversionRate: "16%" },
  ],
  Sales: [],
  Finance: [],
  Management: [],
};

// Derive department-specific lists from "All"
teamTargetsData.Sales = teamTargetsData["All Departments"].filter(t => t.department === "Sales");
teamTargetsData.Finance = teamTargetsData["All Departments"].filter(t => t.department === "Finance");
teamTargetsData.Management = teamTargetsData["All Departments"].filter(t => t.department === "Management");

// ── Chart data per department ──
const comparisonDataMap = {
  "All Departments": [
    { name: "Rahul S.", target: 800, actual: 760 },
    { name: "Neha S.", target: 600, actual: 480 },
    { name: "Deepika N.", target: 500, actual: 320 },
    { name: "Anita B.", target: 400, actual: 180 },
    { name: "Vikram D.", target: 300, actual: 240 },
    { name: "Priya K.", target: 450, actual: 410 },
    { name: "Arjun M.", target: 350, actual: 200 },
  ],
  Sales: [
    { name: "Rahul S.", target: 800, actual: 760 },
    { name: "Neha S.", target: 600, actual: 480 },
    { name: "Vikram D.", target: 300, actual: 240 },
  ],
  Finance: [
    { name: "Deepika N.", target: 500, actual: 320 },
    { name: "Priya K.", target: 450, actual: 410 },
  ],
  Management: [
    { name: "Anita B.", target: 400, actual: 180 },
    { name: "Arjun M.", target: 350, actual: 200 },
  ],
};

const statusColors = {
  "On Track": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "At Risk": { bg: "bg-amber-100", text: "text-amber-700" },
  Behind: { bg: "bg-rose-100", text: "text-rose-700" },
};

export default function Targets() {
  const [activePeriod, setActivePeriod] = useState("Monthly");
  const [activeDepartment, setActiveDepartment] = useState("All Departments");

  const formatCurrency = (num) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
  };

  const bigTargets = bigTargetsData[activeDepartment] || bigTargetsData["All Departments"];
  const teamTargets = teamTargetsData[activeDepartment] || teamTargetsData["All Departments"];
  const comparisonData = comparisonDataMap[activeDepartment] || comparisonDataMap["All Departments"];

  // Find top performer
  const topPerformer = useMemo(() => {
    if (teamTargets.length === 0) return null;
    return teamTargets.reduce((best, cur) => (cur.pct > best.pct ? cur : best), teamTargets[0]);
  }, [teamTargets]);

  const columns = [
    { key: "name", label: "Representative" },
    { key: "departmentBadge", label: "Department" },
    { key: "targetValue", label: "Assigned Target" },
    { key: "achievedValue", label: "Actual Achieved" },
    { key: "pctDisplay", label: "Progress" },
    { key: "followUps", label: "Follow-ups" },
    { key: "conversionRate", label: "Conv. Rate" },
    { key: "trend", label: "Trend" },
    { key: "statusBadge", label: "Health" },
  ];

  const rows = teamTargets.map(t => ({
    ...t,
    departmentBadge: (
      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
        t.department === "Sales" ? "bg-sky-100 text-sky-700" :
        t.department === "Finance" ? "bg-violet-100 text-violet-700" :
        "bg-teal-100 text-teal-700"
      }`}>
        {t.department}
      </span>
    ),
    pctDisplay: (
      <div className="flex items-center gap-3 min-w-[120px]">
        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
           <div className="h-full rounded-full bg-gradient-to-r from-[#2a465a] to-[#38bdf8] transition-all duration-1000" style={{ width: `${t.pct}%` }} />
        </div>
        <span className="text-xs font-black text-[#2a465a]">{t.pct}%</span>
      </div>
    ),
    statusBadge: (
      <div className="flex items-center gap-1.5">
        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full ${statusColors[t.status]?.bg} ${statusColors[t.status]?.text}`}>
          {t.status}
        </span>
        {topPerformer && t.id === topPerformer.id && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-200">
            <Trophy size={10} /> Top
          </span>
        )}
      </div>
    ),
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
        <div className="flex flex-wrap items-center gap-3">
          {/* Department selector */}
          <div className="relative">
            <select
              value={activeDepartment}
              onChange={(e) => setActiveDepartment(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-[#2a465a] shadow-sm outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 transition cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Period selector */}
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

      {/* Top Performer Banner */}
      {topPerformer && (
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/60 px-6 py-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Trophy size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Top Performer — {activePeriod}</p>
            <p className="text-base font-black text-[#2a465a] mt-0.5">{topPerformer.name} <span className="font-bold text-slate-400">·</span> <span className="text-sm font-bold text-slate-500">{topPerformer.department}</span></p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-black text-[#2a465a]">{topPerformer.pct}%</p>
            <p className="text-xs font-bold text-emerald-600">{topPerformer.trend} growth</p>
          </div>
        </div>
      )}

      {/* Big Progress Cards — first 3 large, remaining 2 smaller */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bigTargets.slice(0, 3).map((t) => {
          const Icon = t.icon;
          const pct = Math.round((t.achieved / t.target) * 100);
          const circumference = 2 * Math.PI * 34;
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
                       <ArrowUpRight size={14} strokeWidth={3} /> {t.growth}
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

      {/* Secondary KPI strip */}
      {bigTargets.length > 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bigTargets.slice(3).map((t) => {
            const Icon = t.icon;
            const pct = Math.round((t.achieved / t.target) * 100);
            return (
              <div key={t.label} className="flex items-center gap-5 rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}dd)` }}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">{t.label}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${t.color}, ${t.color}aa)` }} />
                    </div>
                    <span className="text-xs font-black text-[#2a465a]">{pct}%</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-black text-[#2a465a]">{typeof t.achieved === "number" && t.achieved > 1000 ? formatCurrency(t.achieved) : t.achieved}</p>
                  <p className="text-[10px] font-bold text-emerald-500">{t.growth}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Targets Table */}
      <DataTable 
        title="Representative Progress Log"
        columns={columns} 
        rows={rows} 
        pageSize={5} 
        searchable
        size={12}
      />

      {/* Target vs Actual Chart Section */}
      <div className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <Target size={120} />
        </div>
        <GBarChart
          title="Yield vs Projection Mapping"
          subtitle={`Revenue comparison across ${activeDepartment === "All Departments" ? "all" : activeDepartment} vectors (₹ in thousands)`}
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
              {teamTargetsData["All Departments"].map(t => <Option key={t.name} value={t.name} label={t.name} />)}
            </SelectField>
            <SelectField label="Department" id="target-dept" size={6} placeholder="Department">
              {departments.filter(d => d !== "All Departments").map(d => <Option key={d} value={d} label={d} />)}
            </SelectField>
            <SelectField label="Temporal Cycle" id="target-period" size={6} placeholder="Period">
              {periods.map(p => <Option key={p} value={p} label={p} />)}
            </SelectField>
            <SelectField label="KPI Vector" id="target-metric" size={6} placeholder="Dimension">
              <Option value="revenue" label="Total Revenue" />
              <Option value="deals" label="Closed Deals" />
              <Option value="calls" label="Outbound Activity" />
              <Option value="followups" label="Follow-ups Completed" />
              <Option value="conversion" label="Conversion Rate" />
            </SelectField>
            <DataField label="Target Magnitude" id="target-value" type="number" size={12} placeholder="e.g. 500000" />
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
