import { NavLink, Outlet } from "react-router-dom";
import { Grid, Heading } from "../../../../components/shared/Common_Components";
import { Archive, List } from "lucide-react";
import { INITIAL_LEADS } from "../dumpData/utils/dumpDataConstants";
import { INITIAL_CLIENT_LEADS } from "./utils/leadConstants";

const TABS = [
  {
    label: "Leads",
    path: "",
    icon: List,
    end: true,
    count: INITIAL_CLIENT_LEADS.length,
  },
  {
    label: "Dump Data",
    path: "dump",
    icon: Archive,
    count: INITIAL_LEADS.filter((lead) => lead.status === "Dumped").length,
  },
];

export default function LeadsLayout() {
  return (
    <Grid cols={12} gap={6}>
      <Heading
        primaryText="Leads"
        secondaryText="Management"
        size={12}
        fontSize="2xl"
      />

      <div className="col-span-12">
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {TABS.map(({ label, path, icon: Icon, end, count }) => (
            <NavLink
              key={label}
              to={path || "."}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
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
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : label === "Dump Data"
                          ? "bg-red-100 text-red-600"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="col-span-12">
        <Outlet />
      </div>
    </Grid>
  );
}
