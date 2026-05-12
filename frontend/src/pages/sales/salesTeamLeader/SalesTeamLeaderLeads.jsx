import { useState } from "react";
import { List, TrendingUp, CalendarClock } from "lucide-react";
import { Heading } from "../../../components/shared/Common_Components.jsx";
import AllLeads  from "./leads/AllLeads";
import Prospects from "./leads/Prospects";
import FollowUps from "./leads/FollowUps";

const TABS = [
  { key: "All",       label: "All Leads",   icon: List          },
  { key: "Prospects", label: "Prospects",   icon: TrendingUp    },
  { key: "FollowUps", label: "Follow-ups",  icon: CalendarClock },
];

export default function SalesTeamLeaderLeads() {
  const [active, setActive] = useState("All");

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Team" secondaryText="Leads" size={12} />

      {/* ── Tab nav ── */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              active === key
                ? "bg-[#2a465a] text-white shadow"
                : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
            }`}
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Section content ── */}
      {active === "All"       && <AllLeads />}
      {active === "Prospects" && <Prospects />}
      {active === "FollowUps" && <FollowUps />}
    </div>
  );
}
