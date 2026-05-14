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

      <div className="flex flex-col gap-1.5">
        {/* ── Top Header Banner ───────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-[#1e3042] via-[#243b52] to-[#2b4763] rounded-3xl px-6 py-5 overflow-hidden shadow-md border border-slate-700/50">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-0 right-24 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                <Users size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight">HRM Module</h1>
                <p className="text-[13px] text-white/60 mt-0.5 flex items-center gap-1.5">
                  <Building2 size={12} className="flex-shrink-0" />
                  {currentTL.name}
                </p>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex items-center gap-1.5 bg-[#172533] border border-white/5 rounded-2xl p-1 shadow-inner">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    active === key
                      ? "bg-white text-[#1e3042] shadow-md shadow-black/10 scale-100"
                      : "text-white/60 hover:text-white hover:bg-white/5 scale-[0.98]"
                  }`}
                >
                  <Icon size={15} className={`flex-shrink-0 transition-colors ${active === key ? "text-[#1e3042]" : "text-white/40"}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Section Banner ───────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-[#1e3042] to-[#243b52] rounded-2xl px-6 py-4 overflow-hidden shadow-sm flex items-center justify-between border border-slate-700/50">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
               <rect x="3" y="3" width="18" height="18" rx="4" transform="rotate(45 12 12)" />
               <rect x="7" y="7" width="10" height="10" rx="2" transform="rotate(45 12 12)" />
             </svg>
          </div>
          
          {active === "Attendance" ? (
            <h2 className="text-white font-black text-xl tracking-tight relative z-10">
              Attendance <span className="font-medium text-[#38bdf8] ml-2 tracking-normal">{currentTL.team} · Today's Overview</span>
            </h2>
          ) : (
            <h2 className="text-white font-black text-xl tracking-tight relative z-10">
              Leave <span className="font-medium text-[#38bdf8] ml-2 tracking-normal">Management · {currentTL.team} Overview</span>
            </h2>
          )}
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      {active === "Attendance" && <Attendance />}
      {active === "Leaves"     && <Leaves />}

    </div>
  );
}
