import { useState } from "react";
import { CalendarCheck, Umbrella, Users, Building2 } from "lucide-react";
import { Heading } from "../../../../components/shared/Common_Components";
import Attendance from "./Attendance";
import Leaves     from "./Leaves";
import { currentTL } from "./hrmStore";

const TABS = [
  { key: "Attendance", label: "Attendance", icon: CalendarCheck },
  { key: "Leaves",     label: "Leaves",     icon: Umbrella      },
];

export default function HRMPage() {
  const [active, setActive] = useState("Attendance");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col gap-4">
        {/* ── Tab Navigation ────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center gap-1.5 w-full md:w-fit shadow-sm">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[14px] text-[15px] font-bold transition-all duration-300 ${
                active === key
                  ? "bg-[#2a465a] text-white shadow-md shadow-[#2a465a]/20"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} strokeWidth={active === key ? 2 : 1.5} className={`flex-shrink-0 ${active === key ? "text-white" : "text-slate-400"}`} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Section Banner ────────────────────────────────────────────────── */}
        {active === "Attendance" ? (
          <Heading primaryText="Attendance" secondaryText="Management" />
        ) : (
          <Heading primaryText="Leave" secondaryText="Management" />
        )}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      {active === "Attendance" && <Attendance />}
      {active === "Leaves"     && <Leaves />}

    </div>
  );
}