import { useState } from "react";
import { Heading, Grid } from "../../../components/shared/Common_Components";
import ProjectReports  from "./reports/ProjectReports";
import TeamReports     from "./reports/TeamReports";
import DeliveryReports from "./reports/DeliveryReports";
import TLReports       from "./reports/TLReports";

export default function ManagementManagerReports() {
  const [activeTab, setActiveTab] = useState("project");

  const tabs = [
    { id: "project",  label: "Project Reports"  },
    { id: "team",     label: "Team Reports"     },
    { id: "delivery", label: "Delivery Reports" },
    { id: "tl",       label: "TL Reports"       },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Reports"
          secondaryText="Project, team, and delivery analytics"
          size={12}
        />
      </Grid>

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