import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart2,
  Briefcase,
  DollarSign,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Users,
  ShieldAlert,
  Building2,
  Receipt,
  MessageSquare,
  History,
  Database,
  Webhook
} from "lucide-react";

const adminMenu = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "User Management", path: "/admin/users", icon: Users },
  { name: "Leads & Sales", path: "/admin/leads", icon: DollarSign },
  { name: "Projects", path: "/admin/projects", icon: FolderOpen },
  { name: "Finance", path: "/admin/finance", icon: Briefcase },
  { name: "HRM", path: "/admin/hrm", icon: Users },
  { name: "Support", path: "/admin/support", icon: LifeBuoy },
  { name: "Reports", path: "/admin/reports", icon: BarChart2 },
  { name: "System", path: "/admin/system", icon: Settings },
];

const superAdminMenu = [
  { name: "Dashboard", path: "/super-admin/", icon: LayoutDashboard },
  { name: "Admins", path: "/super-admin/admins", icon: ShieldAlert },
  { name: "Departments", path: "/super-admin/departments", icon: Building2 },
  { name: "Billing", path: "/super-admin/billing", icon: Receipt },
  { name: "Communication", path: "/super-admin/communication", icon: MessageSquare },
  { name: "Login Logs", path: "/super-admin/login-logs", icon: History },
  { name: "Support", path: "/super-admin/support", icon: LifeBuoy },
  { name: "API Config", path: "/super-admin/api-config", icon: Webhook },
  { name: "Data Management", path: "/super-admin/data-management", icon: Database },
];

export default function Sidebar() {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith("/super-admin");
  const menu = isSuperAdmin ? superAdminMenu : adminMenu;

  return (
    <div className="flex h-full w-64 flex-col border-r border-[#152532] bg-[#1e3445] pb-4 font-sans text-gray-300">
      <div className="flex items-center gap-2 p-6 text-xl font-bold text-white">
        {isSuperAdmin ? "CRM Super Admin" : "CRM Admin"}
      </div>

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin" || item.path === "/super-admin/dashboard"}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#3e8ca7] text-white"
                    : "hover:bg-[#2a455a] hover:text-white"
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="text-[14px]">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-4 text-center text-xs text-gray-500">
        © 2026 CRM System
      </div>
    </div>
  );
}
