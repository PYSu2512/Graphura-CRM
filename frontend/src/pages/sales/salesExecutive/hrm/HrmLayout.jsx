import { useState } from "react";
import Attendance from "./Attendance";
import Leaves     from "./Leaves";
import { CalendarCheck, Umbrella } from "lucide-react";

const TABS = [
  { key: "Attendance", label: "Attendance", icon: CalendarCheck },
  { key: "Leaves",     label: "Leaves",     icon: Umbrella      },
];

export default function HRMLayout() {
  const [active, setActive] = useState("Attendance");

  return (
    <div className="flex flex-col gap-6">
      {/* Tab nav */}
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

      {/* Page content */}
      {active === "Attendance" && <Attendance />}
      {active === "Leaves"     && <Leaves />}
    </div>
  );
}