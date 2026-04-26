import { useState, memo, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart2,
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
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// MENU REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
const MENUS = {
  "super-admin": {
    title: "Super Admin",
    items: [
      { name: "Dashboard", path: "/super-admin/", icon: LayoutDashboard, end: true },
      { name: "Admins", path: "/super-admin/admins", icon: ShieldAlert },
      { name: "Departments", path: "/super-admin/departments", icon: Building2 },
      { name: "Billing", path: "/super-admin/billing", icon: Receipt },
      { name: "Communication", path: "/super-admin/communication", icon: MessageSquare },
      { name: "Login Logs", path: "/super-admin/login-logs", icon: History },
      { name: "Support", path: "/super-admin/support", icon: LifeBuoy },
      { name: "API Config", path: "/super-admin/api-config", icon: Webhook },
      { name: "Data Management", path: "/super-admin/data-management", icon: Database },
    ],
  },
  admin: {
    title: "Admin",
    items: [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
      { name: "User Management", path: "/admin/users", icon: Users },
      {
        name: "Leads & Sales", icon: TrendingUp,
        children: [
          { name: "Leads", path: "/admin/leads", icon: Target },
          { name: "Sales", path: "/admin/sales", icon: PieChart },
        ],
      },
      { name: "Projects", path: "/admin/projects", icon: FolderOpen },
      { name: "Finance", path: "/admin/finance", icon: Briefcase },
      { name: "HRM", path: "/admin/hrm", icon: UserCheck },
      { name: "Support", path: "/admin/support", icon: LifeBuoy },
      { name: "Reports", path: "/admin/reports", icon: BarChart2 },
      { name: "System", path: "/admin/system", icon: Settings },
    ],
  },
  sales: {
    title: "Sales",
    items: [
      { name: "Dashboard", path: "/sales", icon: LayoutDashboard, end: true },
      { name: "My Leads", path: "/sales/leads", icon: Target },
      { name: "Pipeline", path: "/sales/pipeline", icon: GitBranch },
      { name: "Call Panel", path: "/sales/calls", icon: PhoneCall },
      { name: "Tickets", path: "/sales/tickets", icon: Ticket },
      { name: "Targets", path: "/sales/targets", icon: TrendingUp },
      { name: "Reports", path: "/sales/reports", icon: BarChart2 },
    ],
  },
  finance: {
    title: "Finance",
    items: [
      { name: "Dashboard", path: "/finance", icon: LayoutDashboard, end: true },
      { name: "Invoices", path: "/finance/invoices", icon: FileText },
      { name: "Payments", path: "/finance/payments", icon: CreditCard },
      { name: "Expenses", path: "/finance/expenses", icon: Receipt },
      { name: "Billing", path: "/finance/billing", icon: DollarSign },
      { name: "Reports", path: "/finance/reports", icon: BarChart2 },
    ],
  },
  management: {
    title: "Management",
    items: [
      { name: "Dashboard", path: "/management", icon: LayoutDashboard, end: true },
      { name: "Teams", path: "/management/teams", icon: Users },
      { name: "Projects", path: "/management/projects", icon: FolderOpen },
      { name: "Performance", path: "/management/performance", icon: TrendingUp },
      { name: "Approvals", path: "/management/approvals", icon: ClipboardList },
      { name: "Reports", path: "/management/reports", icon: BarChart2 },
    ],
  },
  client: {
    title: "Client Portal",
    items: [
      { name: "Dashboard", path: "/client", icon: LayoutDashboard, end: true },
      { name: "My Projects", path: "/client/projects", icon: FolderOpen },
      { name: "Invoices", path: "/client/invoices", icon: FileText },
      { name: "Support", path: "/client/support", icon: LifeBuoy },
      { name: "Documents", path: "/client/documents", icon: Globe },
    ],
  },
};

function useRole() {
  const { pathname } = useLocation();
  const roles = ["super-admin", "admin", "sales", "finance", "management", "client"];
  return roles.find((r) => pathname.startsWith(`/${r}`)) ?? "admin";
}

// Active / inactive link classes — defined outside the component so the
// reference is stable and won't cause child re-renders.
const activeCls = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium bg-[#3e8ca7] text-white";
const inactiveCls = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium text-gray-300 hover:bg-[#2a455a] hover:text-white transition-colors duration-150";
const getLinkCls = ({ isActive }) => (isActive ? activeCls : inactiveCls);

const activeIconCls = "flex items-center justify-center w-10 h-10 rounded-lg mx-auto bg-[#3e8ca7] text-white";
const inactiveIconCls = "flex items-center justify-center w-10 h-10 rounded-lg mx-auto text-gray-300 hover:bg-[#2a455a] hover:text-white transition-colors duration-150";
const getIconCls = ({ isActive }) => (isActive ? activeIconCls : inactiveIconCls);

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip — CSS-only, no JS state, zero re-renders
// ─────────────────────────────────────────────────────────────────────────────
function Tooltip({ label, children }) {
  return (
    <div className="relative group/tip w-full flex justify-center">
      {children}
      {/* opacity + translateX transition is GPU-composited (no layout/paint) */}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[200]
                      opacity-0 translate-x-1
                      group-hover/tip:opacity-100 group-hover/tip:translate-x-0
                      transition-[opacity,transform] duration-150 whitespace-nowrap">
        <div className="bg-[#1e293b] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-lg">
          {label}
        </div>
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1e293b]" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEM — memoized so it only re-renders when its own props change,
// not when sibling items or the sidebar expand state changes.
// ─────────────────────────────────────────────────────────────────────────────
const NavItem = memo(function NavItem({ item, expanded, onExpand, onNavClick }) {
  const Icon = item.icon;

  const handleClick = useCallback(() => {
    if (!expanded && onExpand) onExpand();
    if (onNavClick) onNavClick();
  }, [expanded, onExpand, onNavClick]);

  if (expanded) {
    return (
      <NavLink to={item.path} end={item.end ?? false} onClick={handleClick} className={getLinkCls}>
        <Icon size={18} className="flex-shrink-0" />
        <span>{item.name}</span>
      </NavLink>
    );
  }

  return (
    <Tooltip label={item.name}>
      <NavLink to={item.path} end={item.end ?? false} onClick={handleClick} className={getIconCls}>
        <Icon size={18} />
      </NavLink>
    </Tooltip>
  );
});
// KEY FIX: Uses `grid-template-rows: 0fr / 1fr` instead of `max-height`
// transition. max-height animates through potentially hundreds of intermediate
// pixel values; grid-template-rows collapses to exactly 0 in one step and is
// fully GPU-composited — buttery smooth.
// ─────────────────────────────────────────────────────────────────────────────
const NavGroup = memo(function NavGroup({ group, expanded, onExpand, onNavClick }) {
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

  const triggerBase = `flex w-full items-center gap-3 rounded-lg py-2.5 font-medium
    transition-colors duration-150
    ${isGroupActive ? "bg-[#3e8ca7]/40 text-white" : "text-gray-300 hover:bg-[#2a455a] hover:text-white"}`;

  const trigger = (
    <button
      onClick={handleTrigger}
      className={`${triggerBase} ${expanded ? "px-3" : "justify-center w-10 h-10 mx-auto px-0"}`}
    >
      <Icon size={18} className="flex-shrink-0" />
      {expanded && (
        <>
          <span className="flex-1 text-left text-[14px]">{group.name}</span>
          {/* rotate uses transform — GPU-composited, zero layout cost */}
          <ChevronDown
            size={16}
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

      {/* grid-template-rows trick: animates from `0fr` to `1fr`.
          The inner div needs min-height:0 so `0fr` can actually collapse it.
          This is fully GPU-composited — no layout reflow per frame. */}
      {expanded && (
        <div
          style={{
            display: "grid",
            gridTemplateRows: open ? "1fr" : "0fr",
            transition: "grid-template-rows 260ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div style={{ minHeight: 0, overflow: "hidden" }}>
            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
              {group.children.map((child) => {
                const ChildIcon = child.icon;
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={onNavClick ?? undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150 ${isActive
                        ? "bg-[#3e8ca7] text-white"
                        : "text-gray-300 hover:bg-[#2a455a] hover:text-white"
                      }`
                    }
                  >
                    <ChildIcon size={15} className="flex-shrink-0" />
                    <span>{child.name}</span>
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
// SIDEBAR
// The sidebar content itself does NOT animate — only its wrapper in MainLayout
// changes width. This means no Sidebar re-render is triggered by the animation.
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ expanded, onExpand, onNavClick }) {
  const role = useRole();
  const menu = MENUS[role] ?? MENUS.admin;

  const stableOnExpand = useCallback(() => onExpand?.(), [onExpand]);
  const stableOnNavClick = useCallback(() => onNavClick?.(), [onNavClick]);

  return (
    <div className="flex h-full w-full flex-col border-r border-[#152532] bg-[#1e3445] pb-4 font-sans text-gray-300">

      {/* Title / logo — no transition-all here; opacity on the text only */}
      <div className={`flex items-center p-4 text-white font-bold ${expanded ? "text-lg gap-2 px-5" : "justify-center text-xs py-5"}`}>
        {expanded ? (
          // Fade the label in so it doesn't flash during the width animation
          <span style={{ opacity: 1, transition: "opacity 120ms ease 100ms" }}>
            CRM {menu.title}
          </span>
        ) : (
          <span>CRM</span>
        )}
      </div>

      {/* Nav — overflow-y:auto on a fixed-height flex child is fine;
          overflow-x:hidden prevents tooltip overflow from causing scrollbars. */}
      <nav
        className="mt-1 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-0.5"
        style={{ paddingLeft: expanded ? "0.75rem" : "0.5rem", paddingRight: expanded ? "0.75rem" : "0.5rem" }}
      >
        {menu.items.map((item) =>
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
          )
        )}
      </nav>

      {/* Footer — opacity transition only, no layout change */}
      <div
        style={{
          opacity: expanded ? 1 : 0,
          transition: "opacity 150ms ease",
          pointerEvents: expanded ? "auto" : "none",
        }}
        className="mt-auto px-4 py-3 text-center text-xs text-gray-500"
      >
        © 2026 CRM System
      </div>
    </div>
  );
}

export default memo(Sidebar);