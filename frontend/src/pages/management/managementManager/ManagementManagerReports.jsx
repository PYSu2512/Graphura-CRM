import { useState } from "react";
import { FolderOpen, CheckCircle2, Percent, Clock } from "lucide-react";
import { Heading, DashGrid, DashCard } from "../../../components/shared/Common_Components";
import { reportKPIs } from "./reportsStore";

import ProjectReports  from "./reports/ProjectReports";
import TeamReports     from "./reports/TeamReports";
import DeliveryReports from "./reports/DeliveryReports";
import TLReports       from "./reports/TLReports";

const KPI_ICONS   = [<FolderOpen size={20} />, <CheckCircle2 size={20} />, <Percent size={20} />, <Clock size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b"];

export default function ManagementManagerReports() {
  const [activeTab, setActiveTab] = useState("project");

  const tabs = [
    { id: "project",  label: "Project Reports"  },
    { id: "team",     label: "Team Reports"     },
    { id: "delivery", label: "Delivery Reports" },
    { id: "tl",       label: "TL Reports"       },
  ];

  const kpis = [
    { title: "Total Projects",       value: String(reportKPIs.totalProjects)        },
    { title: "Completed",            value: String(reportKPIs.completedProjects)    },
    { title: "On-time %",            value: `${reportKPIs.onTimePercentage.toFixed(1)}%` },
    { title: "Avg Completion Days",  value: String(reportKPIs.avgCompletionDays)    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Performance" secondaryText="Reports" size={12} />

      <DashGrid cols={12} gap={4}>
        {kpis.map((k, i) => (
          <DashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={KPI_ACCENTS[i]}
            size={3}
          />
        ))}
      </DashGrid>

      {/* Pill Tab Navigation — matches ManagementManagerProjects style */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-[#2a465a] text-white shadow"
                : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "project"  && <ProjectReports  />}
      {activeTab === "team"     && <TeamReports     />}
      {activeTab === "delivery" && <DeliveryReports />}
      {activeTab === "tl"       && <TLReports       />}
    </div>
  );
}
