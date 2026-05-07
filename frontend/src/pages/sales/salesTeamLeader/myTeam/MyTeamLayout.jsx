import { NavLink, Outlet } from "react-router-dom";
import { Users, CalendarCheck, Palmtree } from "lucide-react";
import { Heading } from "../../../../components/shared/Common_Components.jsx";

const TABS = [
  { to: "",                label: "Team Members",   icon: Users,         end: true },
  { to: "attendance",      label: "Attendance",     icon: CalendarCheck             },
  { to: "leave-approvals", label: "Leave Approvals", icon: Palmtree                 },
];

export default function MyTeamLayout() {
  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="My" secondaryText="Team" size={12} />

      {/* ── Tab nav ── */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "bg-[#2a465a] text-white shadow"
                  : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
              }`
            }
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </div>

      {/* ── Sub-page content ── */}
      <Outlet />
    </div>
  );
}
