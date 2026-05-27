import { useState } from "react";
import {
  IndianRupee,
  Handshake,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard,
  GDoughnutChart,
  GRadarChart,
  GAreaChart,
} from "../../../components/shared/Common_Components";

// ── Period selector ──
const periods = ["Today", "Week", "Month", "Quarter", "YTD", "Custom"];

// ── KPI data ──
const kpiData = {
  revenue: "₹18.5L",
  revenueChange: "+12.4%",
  deals: "14",
  conversionRate: "11.7%",
  avgDeal: "₹1.32L",
};

// ── Revenue trend data ──
const revenueTrend = [
  { name: "Jan", revenue: 820 }, { name: "Feb", revenue: 940 }, { name: "Mar", revenue: 1100 },
  { name: "Apr", revenue: 980 }, { name: "May", revenue: 1250 }, { name: "Jun", revenue: 1180 },
  { name: "Jul", revenue: 1350 }, { name: "Aug", revenue: 1420 }, { name: "Sep", revenue: 1580 },
  { name: "Oct", revenue: 1650 }, { name: "Nov", revenue: 1720 }, { name: "Dec", revenue: 1850 },
];

// ── Funnel data ──
const funnelStages = [
  { stage: "Leads", count: 1240, pct: 100 },
  { stage: "Contacted", count: 860, pct: 69 },
  { stage: "Qualified", count: 520, pct: 42 },
  { stage: "Proposal", count: 280, pct: 23 },
  { stage: "Won", count: 145, pct: 12 },
];

// ── Source breakdown ──
const sourceData = [
  { name: "Website", value: 380 },
  { name: "Referral", value: 280 },
  { name: "Cold Call", value: 210 },
  { name: "Social", value: 180 },
  { name: "Ads", value: 150 },
];

// ── Team performance radar ──
const teamRadar = [
  { subject: "Calls", rahul: 85, neha: 72, deepika: 65 },
  { subject: "Emails", rahul: 70, neha: 88, deepika: 75 },
  { subject: "Meetings", rahul: 60, neha: 55, deepika: 80 },
  { subject: "Deals", rahul: 90, neha: 65, deepika: 72 },
  { subject: "Revenue", rahul: 95, neha: 78, deepika: 68 },
  { subject: "Follow-ups", rahul: 75, neha: 82, deepika: 70 },
];

// ── Top performers ──
const topPerformers = [
  { name: "Rahul S.", deals: 28, revenue: "₹8.2L", pct: 95 },
  { name: "Neha S.", deals: 22, revenue: "₹5.8L", pct: 78 },
  { name: "Deepika N.", deals: 18, revenue: "₹4.5L", pct: 65 },
  { name: "Anita B.", deals: 15, revenue: "₹3.2L", pct: 52 },
  { name: "Vikram D.", deals: 12, revenue: "₹2.8L", pct: 45 },
];

// ── Heatmap data ──
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM"];
const heatmapData = days.map(() => hours.map(() => Math.random()));

const cardStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
};

export default function Analytics() {
  const [activePeriod, setActivePeriod] = useState("Month");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">Sales Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Comprehensive sales performance insights</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          {periods.map((p) => (
            <button key={p} onClick={() => setActivePeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${activePeriod === p ? "bg-[#2a465a] text-white shadow" : "text-slate-500 hover:text-[#2a465a]"}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Revenue This Month" value={kpiData.revenue} icon={<IndianRupee size={22} />} accentColor="#38bdf8" size={3} />
        <EnhancedDashCard title="Deals Won" value={kpiData.deals} icon={<Handshake size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Conversion Rate" value={kpiData.conversionRate} icon={<TrendingUp size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Avg Deal Size" value={kpiData.avgDeal} icon={<BarChart3 size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      {/* Row 2: Revenue Trend (full width) */}
      <GAreaChart
        title="Revenue Trend"
        subtitle="Monthly revenue (₹ in thousands)"
        data={revenueTrend}
        areas={[{ key: "revenue", label: "Revenue", color: "#2a465a" }]}
        size={12}
        height={280}
      />

      {/* Row 3: Sales Funnel + Lead Source — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <div className="rounded-2xl p-6 flex flex-col h-[340px] overflow-hidden" style={cardStyle}>
          <div className="flex-shrink-0">
            <p className="text-[15px] font-bold text-[#0f172a]">Sales Funnel</p>
            <p className="text-xs text-slate-500 mt-1 mb-5">Lead to conversion pipeline</p>
          </div>
          <div className="flex flex-col gap-3 flex-1 justify-center overflow-y-auto custom-scrollbar pr-2">
            {funnelStages.map((s, i) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#2a465a] w-20 flex-shrink-0">{s.stage}</span>
                <div className="flex-1 h-9 rounded-lg overflow-hidden bg-slate-100">
                  <div
                    className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                    style={{
                      width: `${s.pct}%`,
                      background: `linear-gradient(135deg, ${i < 2 ? "#7AAACE" : i < 4 ? "#5a8fb5" : "#2a465a"}, ${i < 2 ? "#9CD5FF" : i < 4 ? "#7AAACE" : "#3d6880"})`,
                      minWidth: 60,
                    }}
                  >
                    <span className="text-white text-xs font-bold">{s.count}</span>
                  </div>
                </div>
                {i < funnelStages.length - 1 && (
                  <span className="text-xs font-bold text-slate-400 w-10 text-right flex-shrink-0">
                    {((funnelStages[i + 1].count / s.count) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lead Source Breakdown */}
        <div className="h-[340px] overflow-hidden">
          <GDoughnutChart
            title="Lead Source Breakdown"
            subtitle="By origin channel"
            data={sourceData}
            colors={["#2a465a", "#7AAACE", "#9CD5FF", "#f59e0b", "#22c55e"]}
            size={12}
            height={280}
          />
        </div>
      </div>

      {/* Row 4: Team Performance + Top Performers — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[340px] overflow-hidden">
          <GRadarChart
            title="Team Performance"
            subtitle="Multi-metric comparison"
            data={teamRadar}
            radars={[
              { key: "rahul", label: "Rahul S.", color: "#2a465a" },
              { key: "neha", label: "Neha S.", color: "#7AAACE" },
              { key: "deepika", label: "Deepika N.", color: "#f59e0b" },
            ]}
            size={12}
            height={280}
          />
        </div>

        {/* Top Performers */}
        <div className="rounded-2xl p-6 flex flex-col h-[340px] overflow-hidden" style={cardStyle}>
          <div className="flex-shrink-0">
            <p className="text-[15px] font-bold text-[#0f172a]">Top Performers</p>
            <p className="text-xs text-slate-500 mt-1 mb-5">Ranked by deals closed</p>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {topPerformers.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700 ring-2 ring-amber-200" : i === 1 ? "bg-slate-200 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-[#2a465a] truncate pr-2">{p.name}</span>
                    <span className="text-xs font-bold text-[#7AAACE]">{p.revenue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#2a465a] to-[#7AAACE] transition-all duration-500" style={{ width: `${p.pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 flex-shrink-0 w-12 text-right">{p.deals} deals</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 5: Conversion Heatmap (full width) */}
      <div className="rounded-2xl p-6 overflow-hidden" style={cardStyle}>
        <p className="text-[15px] font-bold text-[#0f172a]">Conversion Heatmap</p>
        <p className="text-xs text-slate-500 mt-1 mb-5">Best times for lead conversion (Day × Hour)</p>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Header row */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-12" />
              {hours.map((h) => (
                <div key={h} className="flex-1 text-center text-[10px] font-bold text-slate-400 uppercase">{h}</div>
              ))}
            </div>
            {/* Heat rows */}
            {days.map((day, di) => (
              <div key={day} className="flex items-center gap-1.5 mb-1.5">
                <div className="w-12 text-xs font-bold text-[#2a465a]">{day}</div>
                {heatmapData[di].map((val, hi) => {
                  const intensity = Math.round(val * 100);
                  const opacity = 0.08 + val * 0.85;
                  return (
                    <div
                      key={hi}
                      className="flex-1 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-200 hover:scale-110 hover:z-10 hover:shadow-md cursor-pointer"
                      style={{
                        backgroundColor: `rgba(42, 70, 90, ${opacity})`,
                        color: val > 0.45 ? "#fff" : "#2a465a",
                      }}
                    >
                      {intensity}%
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
