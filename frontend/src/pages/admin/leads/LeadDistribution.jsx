import { useState } from "react";
import {
  GitBranch,
  RefreshCw,
  Shuffle,
  MapPin,
  BarChart3,
  Plus,
  Users,
  Clock,
  CheckCircle,
  Zap,
} from "lucide-react";
import {
  DashGrid,
  DashCard,
  GDoughnutChart,
  GBarChart,
  DataTable,
  SelectField,
  Option,
} from "../../../components/shared/Common_Components";

// ── Assignment modes ──
const modes = [
  { key: "round_robin", label: "Round Robin", icon: RefreshCw, desc: "Distribute evenly among all active members" },
  { key: "load_balanced", label: "Load Balanced", icon: BarChart3, desc: "Based on current individual workload" },
  { key: "by_source", label: "By Source", icon: GitBranch, desc: "Route based on lead's origin source" },
  { key: "by_region", label: "By Region", icon: MapPin, desc: "Geographical routing based on location" },
];

// ── Mock rules ──
const mockRules = [
  { id: 1, condition: "Source = Website", assignTo: "Rahul S.", priority: "High" },
  { id: 2, condition: "Source = Referral", assignTo: "Neha S.", priority: "High" },
  { id: 3, condition: "Region = Mumbai", assignTo: "Deepika N.", priority: "Medium" },
  { id: 4, condition: "Value > ₹5L", assignTo: "Anita B.", priority: "High" },
  { id: 5, condition: "Source = Cold Call", assignTo: "Team Alpha", priority: "Low" },
];

// ── Mock unassigned leads ──
const unassignedLeads = [
  { id: 1, name: "Rohit Menon", mobile: "9812345600", source: "Website", value: "₹2,80,000", created: "Today" },
  { id: 2, name: "Lakshmi Iyer", mobile: "9823456700", source: "Ads", value: "₹1,50,000", created: "Today" },
  { id: 3, name: "Manish Tiwari", mobile: "9834567800", source: "Social", value: "₹3,40,000", created: "Yesterday" },
  { id: 4, name: "Shreya Kapoor", mobile: "9845678900", source: "Website", value: "₹4,20,000", created: "Yesterday" },
  { id: 5, name: "Varun Bhatia", mobile: "9856789012", source: "Cold Call", value: "₹1,20,000", created: "Yesterday" },
];

// ── Chart data ──
const leadsPerExec = [
  { name: "Rahul S.", value: 45 },
  { name: "Neha S.", value: 38 },
  { name: "Deepika N.", value: 32 },
  { name: "Anita B.", value: 28 },
];

const responseTimeData = [
  { name: "Rahul S.", avgTime: 12 },
  { name: "Neha S.", avgTime: 8 },
  { name: "Deepika N.", avgTime: 15 },
  { name: "Anita B.", avgTime: 10 },
];

export default function LeadDistribution() {
  const [activeMode, setActiveMode] = useState("round_robin");
  const [rules] = useState(mockRules);
  const [leads, setLeads] = useState(unassignedLeads);

  const rulesColumns = [
    { key: "condition", label: "Condition" },
    { key: "assignTo", label: "Assign To" },
    { key: "priority", label: "Priority" },
  ];

  const unassignedColumns = [
    { key: "name", label: "Lead Name" },
    { key: "mobile", label: "Mobile" },
    { key: "source", label: "Source" },
    { key: "value", label: "Value" },
    { key: "created", label: "Created" },
  ];

  const unassignedActions = [
    {
      label: "Assign",
      icon: <CheckCircle size={14} />,
      variant: "primary",
      onClick: (row) => {
        alert(`Assigned ${row.name} manually`);
        setLeads((prev) => prev.filter((l) => l.id !== row.id));
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#2a465a] flex items-center gap-2">
            Lead Distribution <Zap className="text-amber-500 fill-amber-500" size={24} />
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Configure auto-assignment rules and manage intelligent lead routing</p>
        </div>
        <button onClick={() => alert("Global settings...")} className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-50 hover:border-[#2a465a]/20 active:scale-95 shadow-sm">
           Advanced Config
        </button>
      </div>

      {/* Auto-assignment Mode Selector */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1e3445]/20 bg-gradient-to-r from-[#1e3445] via-[#1e3445]/10 to-slate-50/30 p-7 shadow-sm z-0">
        
        {/* Deep Dark Sidebar-Color Base (Left 15%) */}
        <div className="absolute top-0 left-0 w-[15%] h-full bg-[#1e3445] blur-xl z-[-2]" />

        {/* Floating Bubble Drops Background */}
        <div className="absolute inset-0 z-[-1] pointer-events-none opacity-80">
          <div className="absolute top-[10%] left-[5%] w-24 h-24 rounded-[40%] bg-gradient-to-br from-[#1e3445]/40 to-[#3e8ca7]/30 blur-sm" style={{ animation: "dropRipple1 8s infinite ease-in-out" }} />
          <div className="absolute top-[50%] left-[25%] w-48 h-48 rounded-[50%] bg-gradient-to-tr from-[#2a465a]/30 to-[#1e3445]/20 blur-md" style={{ animation: "dropRipple2 10s infinite ease-in-out" }} />
          <div className="absolute top-[15%] right-[20%] w-20 h-20 rounded-[45%] bg-gradient-to-bl from-[#3e8ca7]/40 to-[#1e3445]/20 blur-sm" style={{ animation: "dropRipple3 7s infinite ease-in-out" }} />
          <div className="absolute bottom-[5%] right-[5%] w-64 h-64 rounded-full bg-gradient-to-tl from-[#1e3445]/30 to-[#3e8ca7]/20 blur-xl" style={{ animation: "dropRipple1 12s infinite ease-in-out reverse" }} />
        </div>
        
        <h3 className="text-xs font-black text-white/90 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 drop-shadow-md">
          <Shuffle size={14} /> Intelligence Engine Mode
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.key;
            return (
              <button
                key={mode.key}
                onClick={() => setActiveMode(mode.key)}
                className={`group flex flex-col rounded-2xl border-2 p-5 text-left transition-all duration-500 hover:-translate-y-1.5 backdrop-blur-md ${
                  isActive
                    ? "border-[#2a465a] bg-gradient-to-br from-[#2a465a] to-[#1e3a52] text-white shadow-xl shadow-[#2a465a]/20"
                    : "border-slate-300/30 bg-slate-200/20 hover:border-[#2a465a]/30 hover:bg-white/40 hover:shadow-lg"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mb-4 transition-transform duration-500 group-hover:scale-110 ${isActive ? "bg-white/20 text-white shadow-inner" : "bg-white/80 text-[#2a465a] shadow-sm backdrop-blur-sm"}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <p className={`text-base font-black ${isActive ? "text-white" : "text-[#1e3445]"}`}>{mode.label}</p>
                <p className={`text-xs mt-2 leading-relaxed ${isActive ? "text-white/70 font-medium" : "text-slate-500 font-bold"}`}>{mode.desc}</p>
                
                {isActive && (
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                    <CheckCircle size={10} /> Currently Active
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules Table */}
      <DataTable 
        title="Active Assignment Rules"
        columns={rulesColumns} 
        rows={rules} 
        pageSize={5} 
        searchable
        size={12}
      />

      {/* Manual Reassignment */}
      <DataTable 
        title="Unassigned Queue"
        columns={unassignedColumns} 
        rows={leads} 
        actions={unassignedActions} 
        pageSize={5} 
        searchable
        size={12}
      />

      {/* Distribution Stats */}
      <DashGrid cols={12} gap={6}>
        <div className="col-span-12 lg:col-span-6 rounded-3xl border border-slate-200/60 bg-white p-7 shadow-sm">
          <GDoughnutChart
            title="Leads per Executive"
            subtitle="Current active load distribution"
            data={leadsPerExec}
            colors={["#2a465a", "#38bdf8", "#818cf8", "#f59e0b"]}
            height={280}
          />
        </div>
        <div className="col-span-12 lg:col-span-6 rounded-3xl border border-slate-200/60 bg-white p-7 shadow-sm">
          <GBarChart
            title="Performance Speed"
            subtitle="Average minutes to first contact"
            data={responseTimeData}
            bars={[{ key: "avgTime", label: "Avg Minutes", color: "#2a465a" }]}
            height={280}
          />
        </div>
      </DashGrid>
    </div>
  );
}

