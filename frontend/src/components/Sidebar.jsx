import { useState, memo, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart2,
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Database,
  DollarSign,
  FileText,
  FolderOpen,
  GitBranch,
  Globe,
  History,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageSquare,
  PhoneCall,
  PieChart,
  Receipt,
  Settings,
  ShieldAlert,
  Target,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  Webhook,
  Activity,
  User2,
} from "lucide-react";
import logo from "../assets/Logo/Graphura_Logo.webp";

// ─────────────────────────────────────────────────────────────────────────────
// MENU REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
const MENUS = {
  "super-admin": {
    title: "Super Admin",
    initials: "SA",
    sections: [
      {
        label: "Overview",
        items: [
          {
            name: "Dashboard",
            path: "/super-admin/",
            icon: LayoutDashboard,
            end: true,
          },
        ],
      },
      {
        label: "Management",
        items: [
          { name: "Admins", path: "/super-admin/admins", icon: ShieldAlert },
          { name: "Billing", path: "/super-admin/billing", icon: Receipt },
          {
            name: "Communication",
            path: "/super-admin/communication",
            icon: MessageSquare,
          },
        ],
      },
      {
        label: "System",
        items: [
          {
            name: "Login Logs",
            path: "/super-admin/login-logs",
            icon: History,
          },
          { name: "Support", path: "/super-admin/support", icon: LifeBuoy },
          {
            name: "API Config",
            path: "/super-admin/api-config",
            icon: Webhook,
          },
        ],
      },
    ],
  },
  admin: {
    title: "Admin",
    initials: "AD",
    sections: [
      {
        label: "Overview",
        items: [
          {
            name: "Dashboard",
            path: "/admin/",
            icon: LayoutDashboard,
            end: true,
          },
        ],
      },
      {
        label: "Operations",
        items: [
          { name: "User Management", path: "/admin/users", icon: Users },
          { name: "Departments", path: "/admin/departments", icon: Building2 },
          {
            name: "Leads & Sales",
            icon: TrendingUp,
            children: [
              { name: "Leads", path: "/admin/leads", icon: Target },
              { name: "Sales", path: "/admin/sales", icon: PieChart },
            ],
          },
          { name: "Projects", path: "/admin/projects", icon: FolderOpen },
          { name: "HRM", path: "/admin/hrm", icon: UserCheck },
        ],
      },
      {
        label: "Finance & Reports",
        items: [
          { name: "Finance", path: "/admin/finance", icon: Briefcase },
          { name: "Reports", path: "/admin/reports", icon: BarChart2 },
        ],
      },
      {
        label: "Settings",
        items: [
          { name: "Support", path: "/admin/support", icon: LifeBuoy },
          { name: "API Config", path: "/admin/api-config", icon: Webhook },
          { name: "Profile", path: "/admin/profile", icon: Settings },
        ],
      },
    ],
  },
  "sales-manager": {
    title: "Sales Manager",
    initials: "SM",
    sections: [
      {
        label: "Overview",
        items: [
          {
            name: "Dashboard",
            path: "/sales-manager",
            icon: LayoutDashboard,
            end: true,
          },
        ],
      },
      {
        label: "Sales",
        items: [
          { name: "Leads", path: "/sales-manager/leads", icon: Target },
          { name: "Teams", path: "/sales-manager/teams", icon: Users },
          {
            name: "Employees",
            path: "/sales-manager/employees",
            icon: UserCheck,
          },
        ],
      },
      {
        label: "Management",
        items: [
          { name: "HRM", path: "/sales-manager/hrm", icon: ClipboardList },
          { name: "Support", path: "/sales-manager/support", icon: LifeBuoy },
          {
            name: "Announcements",
            path: "/sales-manager/announcements",
            icon: MessageSquare,
          },
          { name: "Logs", path: "/sales-manager/logs", icon: History },
        ],
      },
      {
        label: "Performance",
        items: [
          {
            name: "Performance",
            path: "/sales-manager/performance",
            icon: TrendingUp,
          },
          { name: "Reports", path: "/sales-manager/reports", icon: BarChart2 },
        ],
      },
    ],
  },
  "sales-team-leader": {
    title: "Team Leader",
    initials: "TL",
    sections: [
      {
        label: "Overview",
        items: [
          {
            name: "Dashboard",
            path: "/sales-team-leader",
            icon: LayoutDashboard,
            end: true,
          },
        ],
      },
      {
        label: "Sales",
        items: [
          { name: "Leads", path: "/sales-team-leader/leads", icon: Target },
          { name: "My Team", path: "/sales-team-leader/my-team", icon: Users },
          { name: "Tickets", path: "/sales-team-leader/tickets", icon: Ticket },
        ],
      },
      {
        label: "Performance",
        items: [
          {
            name: "Targets",
            path: "/sales-team-leader/targets",
            icon: TrendingUp,
          },
          {
            name: "Reports",
            path: "/sales-team-leader/reports",
            icon: BarChart2,
          },
        ],
      },
      {
        label: "Personal",
        items: [
          { name: "HRM", path: "/sales-team-leader/hrm", icon: UserCheck },
          {
            name: "Login Logs",
            path: "/sales-team-leader/login-logs",
            icon: History,
          },
          {
            name: "Payment Alerts",
            path: "/sales-team-leader/payment-alerts",
            icon: CreditCard,
          },
        ],
      },
      {
        label: "Communication",
        items: [
          {
            name: "Announcements",
            path: "/sales-team-leader/communication",
            icon: MessageSquare,
          },
        ],
      },
    ],
  },
  "sales-executive": {
    title: "Sales Executive",
    initials: "SE",
    sections: [
      {
        label: "Overview",
        items: [
          {
            name: "Dashboard",
            path: "/sales-executive",
            icon: LayoutDashboard,
            end: true,
          },
        ],
      },
      {
        label: "Leads",
        items: [
          {
            name: "Leads",
            path: "/sales-executive/leads",
            icon: Target,
            children: [
              {
                name: "All Leads",
                path: "/sales-executive/leads/all",
                icon: Target,
              },
              {
                name: "My Prospects",
                path: "/sales-executive/leads/prospects",
                icon: ClipboardList,
              },
              {
                name: "Follow Ups",
                path: "/sales-executive/leads/follow-ups",
                icon: PieChart,
              },
              {
                name: "Dump Data",
                path: "/sales-executive/leads/dump",
                icon: Database,
              },
            ],
          },
        ],
      },
      {
        label: "Personal",
        items: [
          {
            name: "My Login Logs",
            path: "/sales-executive/login-logs",
            icon: History,
          },
          {
            name: "Payments",
            path: "/sales-executive/payments",
            icon: CreditCard,
          },
        ],
      },
      {
        label: "Management",
        items: [
          { name: "HRM", path: "/sales-executive/hrm", icon: UserCheck },
          { name: "Support", path: "/sales-executive/support", icon: LifeBuoy },
        ],
      },
    ],
  },
  finance: {
    title: "Finance",
    initials: "FN",
    sections: [
      {
        label: "Overview",
        items: [
          {
            name: "Dashboard",
            path: "/finance",
            icon: LayoutDashboard,
            end: true,
          },
        ],
      },
      {
        label: "Finance",
        items: [
          { name: "Clients", path: "/finance/clients", icon: User2 },
          { name: "Payments", path: "/finance/payments", icon: CreditCard },
          {
            name: "Work Orders",
            path: "/finance/work-orders",
            icon: ClipboardList,
          },
          { name: "Invoices", path: "/finance/invoices", icon: FileText },
          { name: "Expenses", path: "/finance/expenses", icon: Receipt },
          {
            name: "Global Payment",
            path: "/finance/global-payment",
            icon: Globe,
          },
        ],
      },
      {
        label: "Management",
        items: [
          {
            name: "Notifications",
            path: "/finance/notifications",
            icon: MessageSquare,
          },
          { name: "Login Logs", path: "/finance/logs", icon: History },
          { name: "HRM", path: "/finance/hrm", icon: UserCheck },
        ],
      },
    ],
  },
  "management-manager": {
    title: "Management Manager",
    initials: "MM",
    sections: [
      {
        label: "Overview",
        items: [
          {
            name: "Dashboard",
            path: "/management-manager",
            icon: LayoutDashboard,
            end: true,
          },
        ],
      },
      {
        label: "Operations",
        items: [
          {
            name: "Projects",
            path: "/management-manager/projects",
            icon: FolderOpen,
          },
          { name: "Teams", path: "/management-manager/teams", icon: Users },
          {
            name: "Clients",
            path: "/management-manager/clients",
            icon: Briefcase,
          },
        ],
      },
      {
        label: "Performance",
        items: [
          {
            name: "Reports",
            path: "/management-manager/reports",
            icon: BarChart2,
          },
        ],
      },
      {
        label: "Support",
        items: [
          {
            name: "Tickets",
            path: "/management-manager/tickets",
            icon: Ticket,
          },
        ],
      },
      {
        label: "Personal",
        items: [
          { name: "HRM", path: "/management-manager/hrm", icon: UserCheck },
          {
            name: "Login Logs",
            path: "/management-manager/login-logs",
            icon: History,
          },
        ],
      },
    ],
  },
  "management-team-leader": {
    title: "Management Team Leader",
    initials: "ML",
    sections: [
      {
        label: "Overview",
        items: [
          {
            name: "Dashboard",
            path: "/management-team-leader",
            icon: LayoutDashboard,
            end: true,
          },
        ],
      },
      {
        label: "Work",
        items: [
          {
            name: "Projects",
            path: "/management-team-leader/projects",
            icon: FolderOpen,
          },
          { name: "Teams", path: "/management-team-leader/teams", icon: Users },
          {
            name: "Progress",
            path: "/management-team-leader/progress",
            icon: Activity,
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            name: "Reports",
            path: "/management-team-leader/reports",
            icon: BarChart2,
          },
        ],
      },
      {
        label: "Management",
        items: [
          {
            name: "Support",
            path: "/management-team-leader/support",
            icon: LifeBuoy,
          },
          { name: "HRM", path: "/management-team-leader/hrm", icon: UserCheck },
          {
            name: "Notifications",
            path: "/management-team-leader/notifications",
            icon: Bell,
          },
        ],
      },
    ],
  },
  client: {
    title: "Client",
    initials: "CL",
    sections: [
      {
        label: "Overview",
        items: [
          {
            name: "Dashboard",
            path: "/client",
            icon: LayoutDashboard,
            end: true,
          },
        ],
      },
      {
        label: "My Account",
        items: [
          { name: "My Projects", path: "/client/projects", icon: FolderOpen },
          { name: "Invoices", path: "/client/invoices", icon: FileText },
          { name: "Support", path: "/client/support", icon: LifeBuoy },
          { name: "Profile", path: "/client/profile", icon: User2 },
        ],
      },
    ],
  },
};

function useRole() {
  const { pathname } = useLocation();
  // Order matters — more specific prefixes must come before shorter ones
  const roles = [
    "super-admin",
    "admin",
    "sales-manager",
    "sales-team-leader",
    "sales-executive",
    "finance",
    "management-team-leader",
    "management-manager",
    "management-employee",
    "client",
  ];
  return roles.find((r) => pathname.startsWith(`/${r}`)) ?? "admin";
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP — CSS-only, zero JS state
// ─────────────────────────────────────────────────────────────────────────────
function Tooltip({ label, children }) {
  return (
    <div className="relative group/tip w-full flex justify-center">
      {children}
      <div
        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[200]
                      opacity-0 translate-x-1
                      group-hover/tip:opacity-100 group-hover/tip:translate-x-0
                      transition-[opacity,transform] duration-150 whitespace-nowrap"
      >
        <div className="bg-[#0f172a] text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl ring-1 ring-white/10">
          {label}
        </div>
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0f172a]" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEM
// ─────────────────────────────────────────────────────────────────────────────
const NavItem = memo(function NavItem({
  item,
  expanded,
  onExpand,
  onNavClick,
}) {
  const Icon = item.icon;

  const handleClick = useCallback(() => {
    if (!expanded && onExpand) onExpand();
    if (onNavClick) onNavClick();
  }, [expanded, onExpand, onNavClick]);

  if (expanded) {
    return (
      <NavLink
        to={item.path}
        end={item.end ?? false}
        onClick={handleClick}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 ${
            isActive
              ? "bg-white/10 text-white shadow-sm"
              : "text-slate-400 hover:bg-white/6 hover:text-slate-200"
          }`
        }
      >
        {({ isActive }) => (
          <>
            {/* Left accent bar */}
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200 ${
                isActive ? "h-5 bg-[#38bdf8]" : "h-0 bg-transparent"
              }`}
            />
            <span
              className={`flex-shrink-0 transition-colors duration-150 ${isActive ? "text-[#38bdf8]" : "text-slate-500 group-hover:text-slate-300"}`}
            >
              <Icon size={17} />
            </span>
            <span>{item.name}</span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <Tooltip label={item.name}>
      <NavLink
        to={item.path}
        end={item.end ?? false}
        onClick={handleClick}
        className={({ isActive }) =>
          `relative flex items-center justify-center w-10 h-10 rounded-xl mx-auto transition-all duration-150 ${
            isActive
              ? "bg-white/10 text-[#38bdf8]"
              : "text-slate-500 hover:bg-white/6 hover:text-slate-300"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200 ${isActive ? "h-5 bg-[#38bdf8]" : "h-0"}`}
            />
            <Icon size={17} />
          </>
        )}
      </NavLink>
    </Tooltip>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// NAV GROUP (collapsible)
// ─────────────────────────────────────────────────────────────────────────────
const NavGroup = memo(function NavGroup({
  group,
  expanded,
  onExpand,
  onNavClick,
}) {
  const { pathname } = useLocation();
  const isGroupActive = group.children.some((c) => pathname.startsWith(c.path));
  const [open, setOpen] = useState(isGroupActive);
  const Icon = group.icon;

  const handleTrigger = useCallback(() => {
    if (!expanded && onExpand) {
      onExpand();
      setOpen(true);
    } else {
      setOpen((v) => !v);
    }
  }, [expanded, onExpand]);

  const trigger = (
    <button
      onClick={handleTrigger}
      className={`group relative flex w-full items-center gap-3 rounded-xl py-2.5 text-[13.5px] font-medium transition-all duration-150
        ${expanded ? "px-3" : "justify-center w-10 h-10 mx-auto px-0"}
        ${isGroupActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/6 hover:text-slate-200"}`}
    >
      {isGroupActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#38bdf8] rounded-r-full" />
      )}
      <span
        className={`flex-shrink-0 transition-colors duration-150 ${isGroupActive ? "text-[#38bdf8]" : "text-slate-500 group-hover:text-slate-300"}`}
      >
        <Icon size={17} />
      </span>
      {expanded && (
        <>
          <span className="flex-1 text-left">{group.name}</span>
          <ChevronDown
            size={15}
            className="text-slate-500"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 250ms cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </>
      )}
    </button>
  );

  return (
    <div>
      {expanded ? trigger : <Tooltip label={group.name}>{trigger}</Tooltip>}

      {expanded && (
        <div
          style={{
            display: "grid",
            gridTemplateRows: open ? "1fr" : "0fr",
            transition: "grid-template-rows 260ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div style={{ minHeight: 0, overflow: "hidden" }}>
            <div className="ml-4 mt-1 space-y-0.5 border-l border-white/8 pl-3 pb-1">
              {group.children.map((child) => {
                const ChildIcon = child.icon;
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={onNavClick ?? undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-500 hover:bg-white/6 hover:text-slate-300"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <ChildIcon
                          size={14}
                          className={`flex-shrink-0 ${isActive ? "text-[#38bdf8]" : ""}`}
                        />
                        <span>{child.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION LABEL
// ─────────────────────────────────────────────────────────────────────────────
function SectionLabel({ label, expanded }) {
  if (!expanded) {
    return <div className="my-2 mx-auto w-6 border-t border-white/10" />;
  }
  return (
    <p className="mt-4 mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600 select-none">
      {label}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ expanded, onExpand, onNavClick }) {
  const role = useRole();
  const menu = MENUS[role] ?? MENUS.admin;

  const stableOnExpand = useCallback(() => onExpand?.(), [onExpand]);
  const stableOnNavClick = useCallback(() => onNavClick?.(), [onNavClick]);

  return (
    <div className="flex h-full w-full flex-col bg-[#1a2e3f] pb-3 font-sans rounded-r-lg">
      {/* ── Logo ── */}
      <div
        className={`flex items-center border-b border-white/8 ${expanded ? "px-2 py-1.5 gap-3" : "justify-center py-3.5"}`}
      >
        {expanded ? (
          <div className="bg-white rounded-lg w-full h-14">
            <img
              src={logo}
              alt="Graphura"
              className="flex-shrink-0 h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-md select-none flex-shrink-0">
            <span className="text-2xl font-extrabold bg-gradient-to-br from-sky-400 via-blue-500 to-violet-600 bg-clip-text text-transparent leading-none">
              G
            </span>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll"
        style={{
          paddingLeft: expanded ? "0.625rem" : "0.375rem",
          paddingRight: expanded ? "0.625rem" : "0.375rem",
          paddingTop: "0.5rem",
        }}
      >
        {menu.sections.map((section, si) => (
          <div key={si}>
            <SectionLabel label={section.label} expanded={expanded} />
            <div className="space-y-0.5">
              {section.items.map((item) =>
                item.children ? (
                  <NavGroup
                    key={item.name}
                    group={item}
                    expanded={expanded}
                    onExpand={stableOnExpand}
                    onNavClick={stableOnNavClick}
                  />
                ) : (
                  <NavItem
                    key={item.path}
                    item={item}
                    expanded={expanded}
                    onExpand={stableOnExpand}
                    onNavClick={stableOnNavClick}
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer / User card ── */}
      <div
        className={`mt-auto border-t border-white/6 ${expanded ? "px-3 pt-3" : "px-2 pt-3 flex justify-center"}`}
      >
        {expanded ? (
          <div
            style={{ opacity: 1, transition: "opacity 150ms ease" }}
            className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 hover:bg-white/8 transition-colors duration-150 cursor-pointer group"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-bold text-white shadow-sm">
              {menu.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-200 truncate">
                {menu.title}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                Active session
              </p>
            </div>
            <LogOut
              size={14}
              className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0"
            />
          </div>
        ) : (
          <Tooltip label={menu.title}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-bold text-white shadow-sm cursor-pointer">
              {menu.initials}
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default memo(Sidebar);
