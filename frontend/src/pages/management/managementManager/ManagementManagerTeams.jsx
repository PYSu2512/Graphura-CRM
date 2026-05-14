import { TreeDeciduous, UserCheck, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const TABS = [
  { to: "team-leaders", label: "Team Leaders", icon: UserCheck },
  { to: "employees", label: "Employees", icon: Users },
  { to: "structure", label: "Team Structure", icon: TreeDeciduous },
];

export default function ManagementManagerTeams() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Teams</h1>
            <p className="text-sm text-slate-500">
              Manage the Management department’s team leaders and employees, and update the structure.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
