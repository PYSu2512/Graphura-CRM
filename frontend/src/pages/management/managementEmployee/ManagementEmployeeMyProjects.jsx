/**
 * ManagementEmployeeMyProjects.jsx
 * Layout shell for the employee My Tasks section.
 * Fetches stats + tasks once, passes down via Outlet context.
 * Tabs: All Assigned | Active | Completed
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Grid,
  Heading,
  DashGrid,
  EnhancedDashCard,
} from "../../../components/shared/Common_Components.jsx";
import {
  FolderOpen, Activity, CheckCircle2, AlertTriangle,
  List, PlayCircle, CheckSquare,
} from "lucide-react";
import { fetchTasks } from "./projects/employeeTasksApi";
import toast from "react-hot-toast";

const TABS = [
  { label: "All Assigned", path: ".",         icon: List,        end: true },
  { label: "Active",       path: "active",    icon: PlayCircle },
  { label: "Completed",    path: "completed", icon: CheckSquare },
];

export default function ManagementEmployeeMyProjects() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTasks();
      setTasks(res.data?.data?.tasks || []);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // KPIs derived from live tasks
  const kpis = useMemo(() => {
    const total     = tasks.length;
    const active    = tasks.filter((t) => ["In Progress", "Review"].includes(t.status)).length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const overdue   = tasks.filter((t) => t.isOverdue).length;
    return [
      { title: "My Tasks",        value: String(total),     icon: <FolderOpen size={20} />, accent: "#3b82f6" },
      { title: "Active",          value: String(active),    icon: <Activity size={20} />,   accent: "#14b8a6" },
      { title: "Completed",       value: String(completed), icon: <CheckCircle2 size={20}/>,accent: "#22c55e" },
      { title: "Overdue",         value: String(overdue),   icon: <AlertTriangle size={20}/>,accent: "#f59e0b" },
    ];
  }, [tasks]);

  return (
    <div>
      <Grid cols={12} gap={6}>
        <Heading primaryText="My" secondaryText="Projects" size={12} fontSize="2xl" />

        {/* KPI strip */}
        <div className="col-span-12">
          <DashGrid cols={12} gap={4}>
            {kpis.map((k) => (
              <EnhancedDashCard key={k.title} title={k.title} value={k.value}
                icon={k.icon} accentColor={k.accent} size={3} />
            ))}
          </DashGrid>
        </div>

        {/* Tab nav */}
        <div className="col-span-12">
          <div className="flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            {TABS.map(({ label, path, icon: Icon, end }) => (
              <NavLink key={label} to={path} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#2a465a] text-white shadow"
                      : "text-slate-500 hover:bg-slate-100 hover:text-[#2a465a]"
                  }`
                }>
                <Icon size={15} className="flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Sub-page content */}
        <div className="col-span-12">
          <Outlet context={{ tasks, loading, onRefresh: load }} />
        </div>
      </Grid>
    </div>
  );
}
