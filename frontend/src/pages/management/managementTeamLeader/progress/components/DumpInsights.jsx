import { AlertTriangle, Trash2 } from "lucide-react";
import { GPieChart, Grid } from "../../../../../components/shared/Common_Components";
import { dumpReasons, dumpRiskLeads, executives } from "../data/progressData";

export default function DumpInsights() {
  const highestDumpers = [...executives].sort((a, b) => b.dumpCount - a.dumpCount).slice(0, 3);

  return (
    <Grid cols={12} gap={6}>
      <GPieChart
        title="Dump Reasons Distribution"
        subtitle="Why leads are leaving the active pipeline"
        data={dumpReasons}
        colors={["#64748b", "#dc2626", "#f59e0b", "#7c3aed"]}
        size={4}
        height={320}
      />
      <section className="col-span-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#243b53]">Highest Dump Count</h3>
            <p className="text-xs font-medium text-slate-500">Executives requiring dump-pattern review</p>
          </div>
          <Trash2 size={18} className="text-slate-400" />
        </div>
        <div className="space-y-3">
          {highestDumpers.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-[#243b53]">{item.name}</p>
                <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-black text-slate-700">{item.dumpCount}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">Conversion: {item.conversion} · Follow-ups: {item.followupsPending}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="col-span-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#243b53]">Dump Threshold Warnings</h3>
          <p className="text-xs font-medium text-slate-500">Attempts {"\u003e="} 3 with Not Talk status</p>
          </div>
          <AlertTriangle size={18} className="text-amber-500" />
        </div>
        <div className="space-y-3">
          {dumpRiskLeads.map((item) => (
            <div key={item.lead} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
              <p className="text-sm font-black">{item.lead}</p>
              <p className="mt-1 text-xs font-semibold">{item.executive} · Attempts: {item.attempts} · {item.status}</p>
              <p className="mt-2 text-xs font-black">{item.warning}</p>
            </div>
          ))}
        </div>
      </section>
    </Grid>
  );
}
