import { ArrowRight, GitBranch } from "lucide-react";
import { leadPipeline } from "../data/progressData";

export default function LeadPipelineChart() {
  const max = Math.max(...leadPipeline.map((item) => item.count));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#243b53]">Lead Funnel / Pipeline</h3>
          <p className="text-xs font-medium text-slate-500">Untouched to converted movement with drop-off visibility</p>
        </div>
        <GitBranch size={18} className="text-slate-400" />
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
        {leadPipeline.map((stage, index) => (
          <div key={stage.stage} className="relative rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">{stage.stage}</p>
                <p className="mt-2 text-2xl font-black text-[#243b53]">{stage.count}</p>
              </div>
              {index < leadPipeline.length - 1 && <ArrowRight size={17} className="hidden text-slate-300 xl:block" />}
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${Math.max((stage.count / max) * 100, 16)}%` }} />
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">Drop-off: {stage.dropoff}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
