import { NavLink, Outlet } from "react-router-dom";
import { Heading } from "../../components/shared/Common_Components";
import {
  Users,
  UserCheck,
  CalendarClock,
  Trash2,
} from "lucide-react";

const tabs = [
  { name: "All Leads", path: "all", icon: Users },
  { name: "Prospects", path: "prospects", icon: UserCheck },
  { name: "Follow-ups", path: "followups", icon: CalendarClock },
  { name: "Dump Data", path: "dump", icon: Trash2 },
];

export default function Leads() {
  return (
    <div className="space-y-6">
      <Heading primaryText="Leads" secondaryText="Management" size={12} showAnimations={true} />

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
