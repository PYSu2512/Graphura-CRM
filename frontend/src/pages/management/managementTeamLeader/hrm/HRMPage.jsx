import { useState } from "react";
import { CalendarCheck, Umbrella, Users, Building2 } from "lucide-react";
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

      {/* ── Page header banner ───────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-[#1a2e3f] via-[#2a465a] to-[#355872] rounded-3xl px-6 py-5 overflow-hidden shadow-lg">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-0 right-24 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
              <Users size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-tight">HRM Module</h1>
              <p className="text-sm text-white/60 mt-0.5 flex items-center gap-1.5">
                <Building2 size={12} className="flex-shrink-0" />
                {currentTL.name} · {currentTL.team}
              </p>
            </div>
          </div>

          {/* Tab navigation — inside the banner */}
          <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-2xl p-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  active === key
                    ? "bg-white text-[#2a465a] shadow"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      {active === "Attendance" && <Attendance />}
      {active === "Leaves"     && <Leaves />}

    </div>
  );
}
