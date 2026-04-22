import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  FolderKanban,
  UserCog,
  LifeBuoy,
  BarChart3,
  Settings,
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "User Management", path: "/admin/users", icon: Users },
  { name: "Leads & Sales", path: "/admin/leads", icon: DollarSign },
  { name: "Projects", path: "/admin/projects", icon: FolderKanban },
  { name: "Finance", path: "/admin/finance", icon: Briefcase },
  { name: "HRM", path: "/admin/hrm", icon: UserCog },
  { name: "Support", path: "/admin/support", icon: LifeBuoy },
  { name: "Reports", path: "/admin/reports", icon: BarChart3 },
  { name: "System", path: "/admin/system", icon: Settings },
];

function Sidebar() {
  return (
    <div className="h-full flex flex-col bg-[#355872] text-white">

      {/* 🔥 Logo */}
      <div className="p-5 text-xl font-bold border-b border-white/10 tracking-wide">
        CRM Admin
      </div>

      {/* 🔥 Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                ${isActive
                  ? "bg-[#7AAACE] text-white shadow-md"
                  : "text-gray-200 hover:bg-[#426b8c] hover:text-white hover:translate-x-1"
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          );
        })}

      </nav>

      {/* 🔥 Footer */}
      <div className="p-4 border-t border-white/10 text-xs text-gray-300 text-center">
        © 2026 CRM System
      </div>

    </div>
  );
}

export default Sidebar;