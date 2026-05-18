import { Gauge } from "lucide-react";
import { projectProgressWidgets } from "../reportData";

const toneCls = {
  danger: "bg-rose-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  info: "bg-blue-500",
};

const chipCls = {
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function ProjectProgressWidgets() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#243b53]">Project Progress %</h3>
          <p className="text-xs font-medium text-slate-500">Execution progress across tracked projects</p>
        </div>
        <Gauge size={18} className="text-slate-400" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {projectProgressWidgets.map((item) => (
          <div key={item.project} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="min-h-10 text-sm font-black text-[#243b53]">{item.project}</p>
              <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-black ${chipCls[item.tone]}`}>
                {item.status}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-black text-[#243b53]">{item.progress}%</span>
              <span className="text-xs font-bold text-slate-400">progress</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full ${toneCls[item.tone]}`} style={{ width: `${item.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
