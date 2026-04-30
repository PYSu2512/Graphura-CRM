import React, { useState } from "react";
import Overview from "./Overview";
import Targets  from "./Targets";
import Reports  from "./Reports";

const TABS = ["Overview", "Targets", "Reports"];

export default function PerformanceLayout() {
  const [active, setActive] = useState("Overview");

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              active === tab
                ? "bg-[#2a465a] text-white shadow"
                : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Section Content */}
      {active === "Overview" && <Overview />}
      {active === "Targets"  && <Targets />}
      {active === "Reports"  && <Reports />}
    </div>
  );
}