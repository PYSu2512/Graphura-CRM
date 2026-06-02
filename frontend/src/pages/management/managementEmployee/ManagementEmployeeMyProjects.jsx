import { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Grid,
  Heading,
  DashGrid,
  EnhancedDashCard,
} from "../../../components/shared/Common_Components.jsx";
import {
  FolderOpen,
  Activity,
  CheckCircle2,
  AlertTriangle,
  List,
  PlayCircle,
  CheckSquare,
} from "lucide-react";
import { myProjects as initialProjects } from "./managementEmployeeStore";

const KPI_ICONS   = [<FolderOpen size={20} />, <Activity size={20} />, <CheckCircle2 size={20} />, <AlertTriangle size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#14b8a6", "#22c55e", "#f59e0b"];

const TABS = [
  { label: "All Assigned", path: ".",         icon: List,        end: true },
  { label: "Active",       path: "active",    icon: PlayCircle },
  { label: "Completed",    path: "completed", icon: CheckSquare },
];

// Today is locked to the brief's current date for predictable demo behaviour
// (matches managementEmployeeStore.js → TODAY).
const TODAY = "2026-05-25";

export default function ManagementEmployeeMyProjects() {
  const [projects, setProjects] = useState(initialProjects);

  const updateProject = (id, patch) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  // ── Live KPIs (recompute when projects state changes) ───────────────────
  const kpis = useMemo(() => [
    { title: "My Projects",           value: String(projects.length) },
    { title: "Active",                value: String(projects.filter((p) => p.status === "In Progress").length) },
    { title: "Completed",             value: String(projects.filter((p) => p.status === "Completed").length) },
    { title: "Pending Status Update", value: String(projects.filter((p) => p.status === "Not Started" && p.startDate <= TODAY).length) },
  ], [projects]);

  return (
    <div>
      <Grid cols={12} gap={6}>
        <Heading
          primaryText="My"
          secondaryText="Projects"
          size={12}
          fontSize="2xl"
        />

        {/* KPI strip */}
        <div className="col-span-12">
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
        </div>

        {/* Tab nav */}
        <div className="col-span-12">
          <div className="flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            {TABS.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={label}
                to={path}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#2a465a] text-white shadow"
                      : "text-slate-500 hover:bg-slate-100 hover:text-[#2a465a]"
                  }`
                }
              >
                <Icon size={15} className="flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Sub-page content */}
        <div className="col-span-12">
          <Outlet context={{ projects, updateProject }} />
        </div>
      </Grid>
    </div>
  );
}
