import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart2,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  TrendingUp,
  Users,
  Target,
  PieChart,
  ShieldAlert,
  Building2,
  Receipt,
  MessageSquare,
  History,
  Database,
  Webhook
} from "lucide-react";

/* ── Admin Menu items ── */
const topMenu = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "User Management", path: "/admin/users", icon: Users },
];

const leadsSalesChildren = [
  { name: "Leads", path: "/admin/leads", icon: Target },
  { name: "Sales", path: "/admin/sales", icon: PieChart },
];

const bottomMenu = [
  { name: "Projects", path: "/admin/projects", icon: FolderOpen },
  { name: "Finance", path: "/admin/finance", icon: Briefcase },
  { name: "HRM", path: "/admin/hrm", icon: Users },
  { name: "Support", path: "/admin/support", icon: LifeBuoy },
  { name: "Reports", path: "/admin/reports", icon: BarChart2 },
  { name: "System", path: "/admin/system", icon: Settings },
];

/* ── Super Admin Menu items ── */
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

/* ── NavLink styling helper ── */
const linkCls = (isActive) =>
  `group flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
    isActive
      ? "bg-[#3e8ca7] text-white"
      : "hover:bg-[#2a455a] hover:text-white"
  }`;

export default function Sidebar({ isCollapsed, toggleCollapse }) {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith("/super-admin");

  const [lsOpen, setLsOpen] = useState(() => {
    return (
      location.pathname.startsWith("/admin/leads") ||
      location.pathname.startsWith("/admin/sales")
    );
  });

  const isLsActive =
    location.pathname.startsWith("/admin/leads") ||
    location.pathname.startsWith("/admin/sales");

  return (
    <div className={`relative flex h-full w-full flex-col border-r border-[#152532] bg-[#1e3445] pb-4 font-sans text-gray-300 transition-all duration-300`}>
      {toggleCollapse && (
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-7 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-[#152532] bg-[#1e3445] text-white hover:bg-[#3e8ca7] shadow-md transition-colors duration-200"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}

      <div className={`flex items-center p-6 text-xl font-bold text-white transition-all duration-300 ${isCollapsed ? "justify-center px-0 text-sm" : "gap-2"}`}>
        {isCollapsed ? "CRM" : (isSuperAdmin ? "CRM Super Admin" : "CRM Admin")}
      </div>

      <nav className={`mt-2 flex-1 overflow-y-auto custom-scrollbar ${isCollapsed ? "px-2 space-y-2" : "px-4 space-y-1"}`}>
        {isSuperAdmin ? (
          /* Super Admin Menu */
          superAdminMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/super-admin/"}
                className={({ isActive }) => linkCls(isActive)}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-[14px]">{item.name}</span>}
              </NavLink>
            );
          })
        ) : (
          /* Admin Menu */
          <>
            {topMenu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) => linkCls(isActive)}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="text-[14px]">{item.name}</span>}
                </NavLink>
              );
            })}

            {/* Leads & Sales Dropdown */}
            <div className="relative group/ls">
              <button
                onClick={() => {
                  if (isCollapsed && toggleCollapse) {
                    toggleCollapse();
                    setLsOpen(true);
                  } else {
                    setLsOpen((v) => !v);
                  }
                }}
                className={`group flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
                  isLsActive
                    ? "bg-[#3e8ca7]/40 text-white"
                    : "hover:bg-[#2a455a] hover:text-white"
                }`}
              >
                <TrendingUp size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="flex-1 text-left text-[14px]">Leads & Sales</span>}
                {!isCollapsed && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      lsOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  lsOpen && !isCollapsed ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-3 space-y-0.5 border-l border-white/10 pl-3">
                  {leadsSalesChildren.map((child) => {
                    const Icon = child.icon;
                    return (
                      <NavLink
                        key={child.name}
                        to={child.path}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-[#3e8ca7] text-white"
                              : "hover:bg-[#2a455a] hover:text-white"
                          }`
                        }
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        <span>{child.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              {isCollapsed && (
                <div className="absolute left-full top-0 ml-3 hidden w-44 flex-col rounded-xl bg-[#1e3445]/95 backdrop-blur-md p-2 shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-white/10 opacity-0 transition-opacity duration-200 group-hover/ls:opacity-100 group-hover/ls:flex z-[100]
                  before:content-[''] before:absolute before:-left-2 before:top-4 before:border-r-8 before:border-r-[#1e3445] before:border-y-8 before:border-y-transparent">
                  <div className="mb-2 px-3 pt-1 text-[11px] uppercase tracking-wider font-bold text-gray-400">Leads & Sales</div>
                  {leadsSalesChildren.map((child) => {
                    const Icon = child.icon;
                    return (
                      <NavLink
                        key={child.name}
                        to={child.path}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-[#3e8ca7] text-white"
                              : "hover:bg-[#2a455a] hover:text-white"
                          }`
                        }
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        <span>{child.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            {bottomMenu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => linkCls(isActive)}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="text-[14px]">{item.name}</span>}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {!isCollapsed && (
        <div className="mt-auto px-4 py-4 text-center text-xs text-gray-500">
          © 2026 CRM System
        </div>
      )}
    </div>
  );
}
