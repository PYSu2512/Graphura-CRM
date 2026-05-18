import { CalendarDays, TrendingUp } from "lucide-react";
import { weeklySummary } from "../reportData";

const toneCls = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function WeeklySummary() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#243b53]">Weekly Updates</h3>
          <p className="text-xs font-medium text-slate-500">Progress, misses, escalations, and workload trend</p>
        </div>
        <CalendarDays size={18} className="text-slate-400" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {weeklySummary.map((item) => (
          <div key={item.label} className={`rounded-xl border p-4 ${toneCls[item.tone]}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wider">{item.label}</p>
              <TrendingUp size={15} />
            </div>
            <p className="mt-3 text-2xl font-black">{item.value}</p>
            <p className="mt-1 text-xs font-bold opacity-80">{item.delta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
