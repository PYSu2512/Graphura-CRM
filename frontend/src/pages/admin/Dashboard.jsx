import { useState, useEffect } from "react";
import {
  Users,
  Target,
  FolderKanban,
  IndianRupee,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Filter,
  MoreVertical,
  ArrowRight,
  Clock,
  CalendarCheck,
  AlertTriangle,
  Briefcase,
  Receipt,
  UserCheck,
  UserX,
  LogIn,
} from "lucide-react";
import {
  DashGrid,
  DashCard,
  Heading,
  GAreaChart,
} from "../../components/shared/Common_Components";
import { dashboardService } from "../../services/dashboardService";

// ── Palette ──
const C = {
  navy: "#355872",
  blue: "#7AAACE",
  sea: "#9CD5FF",
  cold: "#F7F8F0",
  muted: "#94a3b8",
  subtle: "#64748b",
};

// ── Stat cards ──
const initialStats = [
  { title: "Total Users", value: "0", icon: <Users size={22} />, accent: C.navy },
  { title: "Leads", value: "0", icon: <Target size={22} />, accent: C.blue },
  { title: "Projects", value: "0", icon: <FolderKanban size={22} />, accent: C.navy },
  { title: "Revenue", value: "₹0", icon: <IndianRupee size={22} />, accent: C.blue },
];

// ── Project progress ──
const projects = [
  { name: "Website Redesign", progress: 85, color: C.navy },
  { name: "Mobile App Dev", progress: 42, color: C.blue },
  { name: "Marketing Campaign", progress: 68, color: C.sea },
];

// ── Months list ──
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Finance chart data per period ──
const financeDataMap = {
  week: { data: [{ name: "Mon", profit: 120 }, { name: "Tue", profit: 145 }, { name: "Wed", profit: 98 }, { name: "Thu", profit: 170 }, { name: "Fri", profit: 190 }], total: "$723K", trend: "+8.2%" },
  month: { data: [{ name: "W1", profit: 620 }, { name: "W2", profit: 740 }, { name: "W3", profit: 810 }, { name: "W4", profit: 858 }], total: "$858K", trend: "+12.5%" },
  quarter: { data: [{ name: "Jan", profit: 2100 }, { name: "Feb", profit: 2450 }, { name: "Mar", profit: 2800 }], total: "$2.8M", trend: "+18.3%" },
  year: { data: [{ name: "Q1", profit: 7200 }, { name: "Q2", profit: 8100 }, { name: "Q3", profit: 9400 }, { name: "Q4", profit: 10200 }], total: "$10.2M", trend: "+22.1%" },
};
// Per-month finance data
const financeMonthData = {
  Jan: { data: [{ name: "W1", profit: 380 }, { name: "W2", profit: 420 }, { name: "W3", profit: 460 }, { name: "W4", profit: 490 }], total: "$490K", trend: "+6.1%" },
  Feb: { data: [{ name: "W1", profit: 410 }, { name: "W2", profit: 450 }, { name: "W3", profit: 510 }, { name: "W4", profit: 530 }], total: "$530K", trend: "+8.2%" },
  Mar: { data: [{ name: "W1", profit: 520 }, { name: "W2", profit: 580 }, { name: "W3", profit: 620 }, { name: "W4", profit: 670 }], total: "$670K", trend: "+11.4%" },
  Apr: { data: [{ name: "W1", profit: 600 }, { name: "W2", profit: 650 }, { name: "W3", profit: 710 }, { name: "W4", profit: 750 }], total: "$750K", trend: "+12.0%" },
  May: { data: [{ name: "W1", profit: 580 }, { name: "W2", profit: 640 }, { name: "W3", profit: 690 }, { name: "W4", profit: 720 }], total: "$720K", trend: "+9.8%" },
  Jun: { data: [{ name: "W1", profit: 640 }, { name: "W2", profit: 700 }, { name: "W3", profit: 780 }, { name: "W4", profit: 820 }], total: "$820K", trend: "+14.3%" },
  Jul: { data: [{ name: "W1", profit: 550 }, { name: "W2", profit: 610 }, { name: "W3", profit: 660 }, { name: "W4", profit: 700 }], total: "$700K", trend: "+7.5%" },
  Aug: { data: [{ name: "W1", profit: 590 }, { name: "W2", profit: 650 }, { name: "W3", profit: 720 }, { name: "W4", profit: 760 }], total: "$760K", trend: "+10.1%" },
  Sep: { data: [{ name: "W1", profit: 620 }, { name: "W2", profit: 690 }, { name: "W3", profit: 740 }, { name: "W4", profit: 800 }], total: "$800K", trend: "+11.9%" },
  Oct: { data: [{ name: "W1", profit: 650 }, { name: "W2", profit: 720 }, { name: "W3", profit: 790 }, { name: "W4", profit: 840 }], total: "$840K", trend: "+13.2%" },
  Nov: { data: [{ name: "W1", profit: 600 }, { name: "W2", profit: 680 }, { name: "W3", profit: 750 }, { name: "W4", profit: 810 }], total: "$810K", trend: "+12.0%" },
  Dec: { data: [{ name: "W1", profit: 620 }, { name: "W2", profit: 740 }, { name: "W3", profit: 810 }, { name: "W4", profit: 858 }], total: "$858K", trend: "+12.5%" },
};

const periodLabels = { week: "This Week", month: "This Month", quarter: "This Quarter", year: "This Year" };

// ── Sales performance data per period ──
const circumference = 2 * Math.PI * 14; // ~87.96
const salesDataMap = {
  week: { pct: 58, target: "$500K", current: "$290K" },
  month: { pct: 72, target: "$2.5M", current: "$1.8M" },
  quarter: { pct: 81, target: "$7.5M", current: "$6.1M" },
  year: { pct: 89, target: "$30M", current: "$26.7M" },
};
// Per-month sales data
const salesMonthData = {
  Jan: { pct: 45, target: "$2.0M", current: "$900K" },
  Feb: { pct: 52, target: "$2.0M", current: "$1.04M" },
  Mar: { pct: 60, target: "$2.2M", current: "$1.32M" },
  Apr: { pct: 65, target: "$2.5M", current: "$1.63M" },
  May: { pct: 58, target: "$2.5M", current: "$1.45M" },
  Jun: { pct: 72, target: "$2.5M", current: "$1.8M" },
  Jul: { pct: 55, target: "$2.3M", current: "$1.27M" },
  Aug: { pct: 68, target: "$2.5M", current: "$1.7M" },
  Sep: { pct: 74, target: "$2.5M", current: "$1.85M" },
  Oct: { pct: 78, target: "$2.8M", current: "$2.18M" },
  Nov: { pct: 70, target: "$2.8M", current: "$1.96M" },
  Dec: { pct: 82, target: "$3.0M", current: "$2.46M" },
};

// ── Recent projects ──
const recentProjects = [
  { abbr: "GR", name: "Graphura Rebrand", status: "In Progress", statusColor: C.blue, team: 4, extra: "+2", deadline: "Oct 24, 2023" },
  { abbr: "NX", name: "Nexus Integration", status: "Review", statusColor: "#f59e0b", team: 3, extra: "+3", deadline: "Nov 02, 2023" },
  { abbr: "AP", name: "Alpha Portal Dev", status: "Planning", statusColor: C.navy, team: 2, extra: "", deadline: "Dec 15, 2023" },
  { abbr: "ST", name: "System Upgrade", status: "On Hold", statusColor: C.subtle, team: 1, extra: "", deadline: "TBD" },
];

// ── Support tickets ──
const tickets = [
  { severity: "HIGH", sevColor: "#ef4444", time: "10m ago", title: "Database connection failing in prod", desc: "Multiple users reporting inability t..." },
  { severity: "MEDIUM", sevColor: "#f59e0b", time: "1h ago", title: "Payment gateway timeout", desc: "Stripe integration taking longer..." },
  { severity: "LOW", sevColor: "#22c55e", time: "3h ago", title: "Update user profile avatar bug", desc: "Images larger than 5MB are not..." },
];

// ── Shared card style ──
const card = {
  background: C.cold,
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.04)",
};

// ── Lead Pipeline Funnel ──
const pipeline = [
  { stage: "Untouched", count: 1240, pct: 100 },
  { stage: "Talk", count: 860, pct: 69 },
  { stage: "Interested", count: 520, pct: 42 },
  { stage: "Prospect", count: 280, pct: 23 },
  { stage: "Converted", count: 145, pct: 12 },
];

// ── Department Overview ──
const departments = [
  { name: "Sales", icon: <Target size={20} />, active: 18, metric: "320 leads today", color: C.navy },
  { name: "Management", icon: <Briefcase size={20} />, active: 12, metric: "24 active projects", color: C.blue },
  { name: "Finance", icon: <Receipt size={20} />, active: 3, metric: "8 pending invoices", color: C.sea },
];

// ── HRM Snapshot ──
const hrmData = { present: 28, absent: 5, late: 3, pendingLeaves: 4, totalEmployees: 33 };

// ── Recent Logins ──
const recentLogins = [
  { name: "Rahul Sharma", role: "Sales Exec", time: "2m ago", ip: "192.168.1.45" },
  { name: "Priya Patel", role: "Mgmt TL", time: "8m ago", ip: "10.0.0.12" },
  { name: "Amit Verma", role: "Finance Mgr", time: "15m ago", ip: "172.16.0.8" },
  { name: "Neha Singh", role: "Sales TL", time: "22m ago", ip: "192.168.1.67" },
  { name: "Vikram Das", role: "Mgmt Emp", time: "35m ago", ip: "10.0.0.34" },
];

// ── Sales Target vs Achieved ──
const salesTargets = [
  { team: "Team Alpha", target: 120, achieved: 98 },
  { team: "Team Beta", target: 100, achieved: 85 },
  { team: "Team Gamma", target: 90, achieved: 92 },
  { team: "Team Delta", target: 110, achieved: 72 },
];

// ── Revenue vs Expense ──
const revExpData = [
  { name: "Jan", revenue: 480, expense: 320 },
  { name: "Feb", revenue: 530, expense: 290 },
  { name: "Mar", revenue: 670, expense: 380 },
  { name: "Apr", revenue: 750, expense: 410 },
  { name: "May", revenue: 720, expense: 350 },
  { name: "Jun", revenue: 820, expense: 420 },
];

// ── Underperformers ──
const underperformers = [
  { name: "Ravi Kumar", role: "Sales Exec", target: 50, achieved: 18, pct: 36 },
  { name: "Sneha Joshi", role: "Sales Exec", target: 50, achieved: 22, pct: 44 },
  { name: "Arun Mehta", role: "Sales TL", target: 150, achieved: 78, pct: 52 },
];

function Dashboard() {
  const [financePeriod, setFinancePeriod] = useState("month");
  const [financeMonth, setFinanceMonth] = useState("");
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(prev => prev.map(s => 
          s.title === "Total Users" ? { ...s, value: String(data.data.users.length) } : s
        ));
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  const activeFinance = financeMonth ? financeMonthData[financeMonth] : (financeDataMap[financePeriod] || financeDataMap.month);

  const [salesPeriod, setSalesPeriod] = useState("month");
  const [salesMonth, setSalesMonth] = useState("");
  const activeSales = salesMonth ? salesMonthData[salesMonth] : (salesDataMap[salesPeriod] || salesDataMap.month);
  const salesOffset = circumference * (1 - activeSales.pct / 100);

  return (
    <div>
      <Heading primaryText="Dashboard" size={12} />

      {/* ── Stat Cards ── */}
      <div className="mt-6">
        <DashGrid cols={12} gap={4}>
          {stats.map((item) => (
            <DashCard
              key={item.title}
              title={item.title}
              value={item.value}
              icon={item.icon}
              accentColor={item.accent}
              size={3}
            />
          ))}
        </DashGrid>
      </div>

      {/* ── Finance Summary (9) | Sales Performance (3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
        {/* Finance Summary */}
        <div className="lg:col-span-9 rounded-2xl p-5 flex flex-col" style={card}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>Finance Summary</h3>
            <div className="flex items-center gap-2">
              <select
                value={financeMonth}
                onChange={(e) => { setFinanceMonth(e.target.value); if (e.target.value) setFinancePeriod(""); }}
                className="rounded-lg px-2 py-1.5 text-xs font-bold border-none outline-none cursor-pointer"
                style={{ background: `${C.sea}30`, color: C.navy }}
              >
                <option value="">By Month</option>
                {months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: `${C.sea}30` }}>
                {Object.keys(periodLabels).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setFinancePeriod(key); setFinanceMonth(""); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                    style={{
                      background: financePeriod === key && !financeMonth ? C.navy : "transparent",
                      color: financePeriod === key && !financeMonth ? "#fff" : C.subtle,
                    }}
                  >
                    {periodLabels[key]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-1">
            <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>Net Profit</span>
            <div className="flex items-center gap-2 mt-1">
              <span style={{ color: C.navy, fontSize: 28, fontWeight: 800 }}>{activeFinance.total}</span>
              <div className="flex items-center gap-1">
                <TrendingUp size={14} style={{ color: C.blue }} />
                <span style={{ color: C.blue, fontSize: 12, fontWeight: 700 }}>{activeFinance.trend}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-2">
            <GAreaChart title="" data={activeFinance.data} areas={[{ key: "profit", color: C.blue }]} size={12} height={180} />
          </div>
        </div>

        {/* Sales Performance */}
        <div className="lg:col-span-3 rounded-2xl p-5 flex flex-col" style={card}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>Sales</h3>
            <div className="flex items-center gap-1">
              <select
                value={salesMonth}
                onChange={(e) => { setSalesMonth(e.target.value); if (e.target.value) setSalesPeriod(""); }}
                className="rounded-lg px-2 py-1 text-xs font-bold border-none outline-none cursor-pointer"
                style={{ background: `${C.sea}30`, color: C.navy }}
              >
                <option value="">By Month</option>
                {months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                value={salesPeriod}
                onChange={(e) => { setSalesPeriod(e.target.value); setSalesMonth(""); }}
                className="rounded-lg px-2 py-1 text-xs font-bold border-none outline-none cursor-pointer"
                style={{ background: `${C.sea}30`, color: C.navy }}
              >
                <option value="">Period</option>
                {Object.entries(periodLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center my-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke={C.sea} strokeWidth="3.5" />
                <circle cx="18" cy="18" r="14" fill="none" stroke={C.navy} strokeWidth="3.5" strokeDasharray={circumference} strokeDashoffset={salesOffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ color: C.navy, fontSize: 28, fontWeight: 800 }}>{activeSales.pct}%</span>
                <span style={{ color: C.subtle, fontSize: 11 }}>Target Reached</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-auto pt-4 border-t border-slate-100">
            <div>
              <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>Target</span>
              <p style={{ color: C.navy, fontWeight: 700, fontSize: 14 }}>{activeSales.target}</p>
            </div>
            <div className="text-right">
              <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>Current</span>
              <p style={{ color: C.blue, fontWeight: 700, fontSize: 14 }}>{activeSales.current}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Project Progress ── */}
      <div className="mt-6">
        <div className="rounded-2xl p-5 flex flex-col" style={card}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>Project Progress</h3>
            <a href="#" style={{ color: C.blue, fontSize: 13, fontWeight: 600 }} className="hover:underline">View All</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projects.map((p) => (
              <div key={p.name}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span style={{ color: C.navy, fontSize: 13, fontWeight: 600, flex: 1 }}>{p.name}</span>
                  <span style={{ color: C.subtle, fontSize: 13, fontWeight: 700 }}>{p.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: `${C.sea}40` }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Projects | Support Tickets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 rounded-2xl p-5 flex flex-col" style={card}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>Recent Projects</h3>
            <div className="flex items-center gap-2">
              <MoreVertical size={16} style={{ color: C.muted }} className="cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 pb-3 border-b border-slate-100">
            <div className="col-span-4" style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Project Name</div>
            <div className="col-span-3" style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</div>
            <div className="col-span-2" style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned Team</div>
            <div className="col-span-3" style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline</div>
          </div>

          {recentProjects.map((p) => (
            <div key={p.abbr} className="grid grid-cols-12 gap-2 items-center py-4 border-b border-slate-50 last:border-0">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.sea}30`, color: C.navy, fontSize: 11, fontWeight: 800 }}>
                  {p.abbr}
                </div>
                <span style={{ color: C.navy, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
              </div>

              <div className="col-span-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ color: p.statusColor, backgroundColor: `${p.statusColor}15` }}>
                  {p.status}
                </span>
              </div>

              <div className="col-span-2 flex items-center">
                <div className="flex -space-x-2">
                  {Array.from({ length: Math.min(p.team, 3) }).map((_, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: C.navy }} />
                  ))}
                </div>
                {p.extra && (
                  <span style={{ color: C.muted, fontSize: 11, fontWeight: 600, marginLeft: 4 }}>{p.extra}</span>
                )}
              </div>

              <div className="col-span-3">
                <span style={{ color: C.subtle, fontSize: 13, fontWeight: 500 }}>{p.deadline}</span>
              </div>
            </div>
          ))}

          <div className="text-center pt-4">
            <a href="#" className="inline-flex items-center gap-1 hover:underline" style={{ color: C.blue, fontSize: 13, fontWeight: 600 }}>
              View All Projects <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="rounded-2xl p-5 flex flex-col" style={card}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>Support Tickets</h3>
            <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ color: "#ef4444", backgroundColor: "#fef2f2" }}>3 Critical</span>
          </div>

          <div className="flex flex-col gap-5">
            {tickets.map((t) => (
              <div key={t.title} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: t.sevColor }}>{t.severity}</span>
                  <span style={{ color: C.muted, fontSize: 11 }}>{t.time}</span>
                </div>
                <p style={{ color: C.navy, fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>{t.title}</p>
                <p style={{ color: C.muted, fontSize: 12 }}>{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <button className="w-full py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90" style={{ background: C.navy, color: "#ffffff", border: "none" }}>
              Go to Support Desk
            </button>
          </div>
        </div>
      </div>

      {/* ── Lead Pipeline Funnel ── */}
      <div className="mt-6">
        <div className="rounded-2xl p-5" style={card}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>Lead Pipeline</h3>
            <span style={{ color: C.muted, fontSize: 12, fontWeight: 600 }}>
              Conversion: {((145 / 1240) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {pipeline.map((s, i) => (
              <div key={s.stage} className="flex items-center gap-4">
                <span style={{ color: C.navy, fontSize: 13, fontWeight: 600, width: 90 }}>{s.stage}</span>
                <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{ background: `${C.sea}20` }}>
                  <div
                    className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                    style={{ width: `${s.pct}%`, background: i < 3 ? C.blue : C.navy, minWidth: 60 }}
                  >
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{s.count}</span>
                  </div>
                </div>
                {i < pipeline.length - 1 && (
                  <span style={{ color: C.muted, fontSize: 11, fontWeight: 600, width: 50, textAlign: "right" }}>
                    {((pipeline[i + 1].count / s.count) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Department Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {departments.map((d) => (
          <div key={d.name} className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:translate-y-[-4px]" style={card}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${d.color}20`, color: d.color }}
            >
              {d.icon}
            </div>
            <div className="flex-1">
              <h4 style={{ color: C.navy, fontWeight: 700, fontSize: 14 }}>{d.name} Dept</h4>
              <p style={{ color: C.muted, fontSize: 12, fontWeight: 500 }}>{d.active} active members</p>
              <p style={{ color: C.blue, fontSize: 12, fontWeight: 600 }}>{d.metric}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── HRM Snapshot | Recent Logins ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* HRM */}
        <div className="rounded-2xl p-5" style={card}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>HRM Snapshot</h3>
            <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ color: C.navy, background: `${C.sea}30` }}>
              Today
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Present", val: hrmData.present, icon: <UserCheck size={16} />, color: "#22c55e" },
              { label: "Absent", val: hrmData.absent, icon: <UserX size={16} />, color: "#ef4444" },
              { label: "Late", val: hrmData.late, icon: <Clock size={16} />, color: "#f59e0b" },
              { label: "Leave Req", val: hrmData.pendingLeaves, icon: <CalendarCheck size={16} />, color: C.blue },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: `${item.color}10` }}>
                <div className="flex justify-center mb-1" style={{ color: item.color }}>{item.icon}</div>
                <span style={{ color: C.navy, fontSize: 22, fontWeight: 800 }}>{item.val}</span>
                <p style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>{item.label}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>Attendance Rate</span>
              <span style={{ color: C.navy, fontSize: 12, fontWeight: 700 }}>
                {((hrmData.present / hrmData.totalEmployees) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: `${C.sea}30` }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(hrmData.present / hrmData.totalEmployees) * 100}%`,
                  background: `linear-gradient(90deg, ${C.navy}, ${C.blue})`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Logins */}
        <div className="rounded-2xl p-5" style={card}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>Recent Login Activity</h3>
            <LogIn size={16} style={{ color: C.muted }} />
          </div>
          <div className="flex flex-col">
            {recentLogins.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3"
                style={{ borderBottom: i < recentLogins.length - 1 ? `1px solid ${C.sea}20` : "none" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${C.sea}30`, color: C.navy, fontSize: 11, fontWeight: 800 }}
                >
                  {l.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: C.navy, fontSize: 13, fontWeight: 600 }}>{l.name}</span>
                  <p style={{ color: C.muted, fontSize: 11 }}>
                    {l.role} &bull; {l.ip}
                  </p>
                </div>
                <span style={{ color: C.subtle, fontSize: 11, fontWeight: 500 }}>{l.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sales Target vs Achieved ── */}
      <div className="mt-6">
        <div className="rounded-2xl p-5" style={card}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>Sales Target vs Achieved</h3>
            <span style={{ color: C.muted, fontSize: 12, fontWeight: 600 }}>This Month</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {salesTargets.map((t) => {
              const pct = ((t.achieved / t.target) * 100).toFixed(0);
              const met = t.achieved >= t.target;
              return (
                <div key={t.team} className="rounded-xl p-4 transition-all duration-300 hover:translate-y-[-4px]" style={{ background: met ? "#22c55e08" : `${C.sea}15` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ color: C.navy, fontSize: 13, fontWeight: 700 }}>{t.team}</span>
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-bold"
                      style={{
                        color: met ? "#22c55e" : "#f59e0b",
                        background: met ? "#22c55e15" : "#f59e0b15",
                      }}
                    >
                      {met ? "On Track" : "Behind"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="w-full h-6 rounded-lg overflow-hidden relative" style={{ background: `${C.sea}25` }}>
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%`, background: met ? C.navy : C.sea }}
                      />
                      <span
                        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                        style={{ color: C.navy }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: C.muted, fontSize: 11 }}>
                      Target: <b style={{ color: C.navy }}>{t.target}</b>
                    </span>
                    <span style={{ color: C.muted, fontSize: 11 }}>
                      Done: <b style={{ color: met ? C.navy : C.blue }}>{t.achieved}</b>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Revenue vs Expense ── */}
      <div className="mt-6">
        <div className="rounded-2xl p-5" style={card}>
          <div className="flex items-center justify-between mb-2">
            <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>Revenue vs Expense</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ background: C.navy }} />
                <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ background: C.sea }} />
                <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>Expense</span>
              </div>
            </div>
          </div>
          <GAreaChart
            title=""
            data={revExpData}
            areas={[
              { key: "revenue", color: C.navy },
              { key: "expense", color: C.sea },
            ]}
            size={12}
            height={200}
          />
        </div>
      </div>

      {/* ── Underperformer Alerts ── */}
      <div className="mt-6 mb-6">
        <div className="rounded-2xl p-5" style={card}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} style={{ color: "#f59e0b" }} />
              <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>Underperformer Alerts</h3>
            </div>
            <span
              className="px-2 py-0.5 rounded-lg text-xs font-bold"
              style={{ color: "#f59e0b", background: "#f59e0b15" }}
            >
              {underperformers.length} flagged
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {underperformers.map((u) => (
              <div
                key={u.name}
                className="flex items-center gap-4 rounded-xl p-3"
                style={{ background: "#f59e0b08" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${C.sea}30`, color: C.navy, fontSize: 12, fontWeight: 800 }}
                >
                  {u.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: C.navy, fontSize: 13, fontWeight: 700 }}>{u.name}</span>
                  <p style={{ color: C.muted, fontSize: 11 }}>
                    {u.role} &bull; Target: {u.target} | Achieved: {u.achieved}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: `${C.sea}30` }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${u.pct}%`, background: u.pct < 40 ? "#ef4444" : "#f59e0b" }}
                    />
                  </div>
                  <span style={{ color: u.pct < 40 ? "#ef4444" : "#f59e0b", fontSize: 12, fontWeight: 800 }}>
                    {u.pct}%
                  </span>
                  <TrendingDown size={14} style={{ color: "#ef4444" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;