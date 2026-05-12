import { useState } from "react";
import { LayoutDashboard, CalendarDays, Calendar, User } from "lucide-react";
import Overview        from "./reports/Overview";
import DailyReport     from "./reports/DailyReport";
import WeeklyReport    from "./reports/WeeklyReport";
import ExecutiveReport from "./reports/ExecutiveReport";

const TABS = [
  { key: "Overview",  label: "Overview",         icon: LayoutDashboard },
  { key: "Daily",     label: "Daily Report",     icon: CalendarDays    },
  { key: "Weekly",    label: "Weekly Report",    icon: Calendar        },
  { key: "Executive", label: "Executive Report", icon: User            },
];

export default function SalesTeamLeaderReports() {
  const [active, setActive] = useState("Overview");

  return (
    <div className="flex flex-col gap-6">
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
      {active === "Overview"  && <Overview />}
      {active === "Daily"     && <DailyReport />}
      {active === "Weekly"    && <WeeklyReport />}
      {active === "Executive" && <ExecutiveReport />}
    </div>
  );
}
