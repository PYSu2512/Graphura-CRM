import { NavLink, Outlet } from "react-router-dom";
import { Heading } from "../../components/shared/Common_Components";
import {
  BarChart3,
  Kanban,
  Target,
  Phone,
  Ticket,
} from "lucide-react";

const tabs = [
  { name: "Analytics", path: "analytics", icon: BarChart3 },
  { name: "Pipeline", path: "pipeline", icon: Kanban },
  { name: "Targets", path: "targets", icon: Target },
  { name: "Call Panel", path: "calls", icon: Phone },
  { name: "Tickets", path: "tickets", icon: Ticket },
];

export default function Sales() {
  return (
    <div className="space-y-6">
      <Heading primaryText="Sales" secondaryText="Dashboard" size={12} showAnimations={true} />

      {/* Tab Bar */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[#2a465a] text-white shadow-lg shadow-[#2a465a]/20"
                    : "text-slate-500 hover:text-[#1e3445] hover:bg-[#38bdf8]/15 hover:shadow-sm"
                }`
              }
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  );
}
