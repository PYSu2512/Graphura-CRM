import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Grid, Heading } from "../../../../components/shared/Common_Components";
import { LeadsProvider, useLeads } from "./LeadsContext";
import {
  List, TrendingUp, CalendarClock, Upload, Database,
} from "lucide-react";

const TABS = [
  { label: "All Leads",   path: "",            icon: List,         end: true },
  { label: "Prospects",   path: "prospects",   icon: TrendingUp },
  { label: "Follow-ups",  path: "follow-ups",  icon: CalendarClock },
  { label: "Bulk Upload", path: "bulk-upload", icon: Upload },
  { label: "Dump Data",   path: "dump",        icon: Database },
];

// Inner component so it can access context for badge counts
function LeadsLayoutInner() {
  const { leads, dumpData } = useLeads();
  const { pathname } = useLocation();

  return (
    <div>
      <Grid cols={12} gap={6}>
        {/* Heading */}
        <Heading primaryText="Leads" secondaryText="Management" size={12} fontSize="2xl" />

        {/* Tab nav */}
        <div className="col-span-12">
          <div className="flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            {TABS.map(({ label, path, icon: Icon, end }) => {
              // Build the full path relative to the current base
              const base = pathname.replace(/\/[^/]*$/, "").replace(/\/(prospects|follow-ups|bulk-upload|distribution|dump)$/, "");
              const to   = path === "" ? "." : path;

              return (
                <NavLink
                  key={label}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#2a465a] text-white shadow"
                        : "text-slate-500 hover:bg-slate-100 hover:text-[#2a465a]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={15} className="flex-shrink-0" />
                      {label}
                      {label === "All Leads" && (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                          {leads.length}
                        </span>
                      )}
                      {label === "Dump Data" && (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>
                          {dumpData.length}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Sub-page content */}
        <div className="col-span-12">
          <Outlet />
        </div>
      </Grid>
    </div>
  );
}

export default function LeadsLayout() {
  return (
    <LeadsProvider>
      <LeadsLayoutInner />
    </LeadsProvider>
  );
}
