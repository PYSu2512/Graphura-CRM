import { useState } from "react";
import { LayoutGrid, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { Heading } from "../../../components/shared/Common_Components.jsx";
import { projects as initialProjects } from "./managementManagerStore";

import AllProjects       from "./projects/AllProjects";
import ActiveProjects    from "./projects/ActiveProjects";
import DeliveredProjects from "./projects/DeliveredProjects";
import DelayedProjects   from "./projects/DelayedProjects";

const TABS = [
  { key: "All",       label: "All Projects",      icon: LayoutGrid     },
  { key: "Active",    label: "Active",            icon: Activity       },
  { key: "Delivered", label: "Delivered",         icon: CheckCircle2   },
  { key: "Delayed",   label: "Delayed",           icon: AlertTriangle  },
];

export default function ManagementManagerProjects() {
  const [active, setActive] = useState("All");

  // Single source of truth for project state — passed down to each tab.
  // Edits / status flips / TL reassigns mutate this array via setProjects.
  const [projects, setProjects] = useState(initialProjects);

  const updateProject = (id, patch) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div className="flex flex-col gap-6">

      <Heading
        primaryText="Projects"
        secondaryText="View, edit, assign, update status and confirm delivery for every project in the Management department."
        fontSize="2xl"
        size={12}
      />

      {/* ── Tab nav ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              active === key
                ? "bg-[#2a465a] text-white shadow"
                : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
            }`}
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Section content ──────────────────────────────────────────────── */}
      {active === "All"       && <AllProjects       projects={projects} updateProject={updateProject} />}
      {active === "Active"    && <ActiveProjects    projects={projects} updateProject={updateProject} />}
      {active === "Delivered" && <DeliveredProjects projects={projects} updateProject={updateProject} />}
      {active === "Delayed"   && <DelayedProjects   projects={projects} updateProject={updateProject} />}
    </div>
  );
}
