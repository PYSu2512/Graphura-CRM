/**
 * ManagementManagerReports.jsx
 * Fully dynamic — fetches from /api/management/reports?period=today|week|month|year
 * All 4 tabs (Project / Team / Delivery / TL) share one API call.
 */

import { useState, useEffect, useCallback } from "react";
import { FolderOpen, CheckCircle2, Percent, Clock, RefreshCw } from "lucide-react";
import { Heading, DashGrid, EnhancedDashCard } from "../../../components/shared/Common_Components";
import apiClient from "../../../services/apiClient";
import toast from "react-hot-toast";

import ProjectReports  from "./reports/ProjectReports";
import TeamReports     from "./reports/TeamReports";
import DeliveryReports from "./reports/DeliveryReports";
import TLReports       from "./reports/TLReports";

const KPI_ICONS   = [<FolderOpen size={20}/>, <CheckCircle2 size={20}/>, <Percent size={20}/>, <Clock size={20}/>];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b"];

const TABS = [
  { id: "project",  label: "Project Reports"  },
  { id: "team",     label: "Team Reports"     },
  { id: "delivery", label: "Delivery Reports" },
  { id: "tl",       label: "TL Reports"       },
];

const PERIODS = ["today", "week", "month", "year"];
const PERIOD_LABELS = { today: "Today", week: "Week", month: "Month", year: "Year" };

export default function ManagementManagerReports() {
  const [activeTab, setActiveTab] = useState("project");
  const [period,    setPeriod]    = useState("today");
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/management/reports?period=${p}`);
      setData(res.data?.data || null);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(period); }, [period, load]);

  const kpis = data ? [
    { title: "Total Projects",      value: String(data.kpis.totalProjects)    },
    { title: "Completed",           value: String(data.kpis.completed)        },
    { title: "On-time %",           value: `${data.kpis.onTimePercentage.toFixed(1)}%` },
    { title: "Avg Completion Days", value: String(data.kpis.avgCompletionDays) },
  ] : Array(4).fill({ title: "—", value: "—" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Heading primaryText="Performance" secondaryText="Reports" size={12} />
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                period === p ? "bg-[#2a465a] text-white border-[#2a465a]" : "bg-white text-slate-500 border-slate-200 hover:border-[#2a465a]/40"
              }`}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
          <button onClick={() => load(period)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 hover:text-[#2a465a] hover:bg-slate-50 transition-colors">
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
      </div>

      <DashGrid cols={12} gap={4}>
        {kpis.map((k, i) => (
          <EnhancedDashCard key={i} title={k.title} value={loading ? "—" : k.value}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </DashGrid>

      {/* Tab bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.id ? "bg-[#2a465a] text-white shadow" : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "project"  && <ProjectReports  data={data} loading={loading} period={period} onPeriodChange={setPeriod} />}
      {activeTab === "team"     && <TeamReports     data={data} loading={loading} period={period} onPeriodChange={setPeriod} />}
      {activeTab === "delivery" && <DeliveryReports data={data} loading={loading} period={period} onPeriodChange={setPeriod} />}
      {activeTab === "tl"       && <TLReports       data={data} loading={loading} period={period} onPeriodChange={setPeriod} />}
    </div>
  );
}
