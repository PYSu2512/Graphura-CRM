import { useMemo, useState } from "react";
import { FolderOpen, Activity, AlertTriangle, Link2 } from "lucide-react";
import { Heading, DashGrid, EnhancedDashCard } from "../../../components/shared/Common_Components.jsx";
import { projects as initialProjects, ACTIVE_STATUSES } from "./managementManagerStore";
import AllProjects from "./projects/AllProjects";

const KPI_ICONS   = [<FolderOpen size={20} />, <Activity size={20} />, <AlertTriangle size={20} />, <Link2 size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#14b8a6", "#f43f5e", "#f59e0b"];

export default function ManagementManagerProjects() {
  const [projects, setProjects] = useState(initialProjects);

  const updateProject = (id, patch) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const addProject = (project) =>
    setProjects((prev) => [project, ...prev]);

  // ── Live KPIs (recompute when projects state changes) ───────────────────
  const kpis = useMemo(() => [
    { title: "Total Projects",         value: String(projects.length) },
    { title: "Active",                 value: String(projects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length) },
    { title: "Delayed",                value: String(projects.filter((p) => p.status === "Delayed").length) },
    { title: "Pending Handover Links", value: String(projects.filter((p) => p.status === "Completed" && !p.handoverLink).length) },
  ], [projects]);

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Project" secondaryText="Management" size={12} />

      <DashGrid cols={12} gap={4}>
        {kpis.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={KPI_ACCENTS[i]}
            size={3}
          />
        ))}
      </DashGrid>

      <AllProjects
        projects={projects}
        updateProject={updateProject}
        addProject={addProject}
      />
    </div>
  );
}
