import { AlertOctagon, TimerReset } from "lucide-react";
import { attendanceSnapshot, risks, targets } from "../data/progressData";

const riskCls = {
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

const formatValue = (item, value) => {
  if (item.currency) return `₹${Math.round(value / 1000)}K`;
  return `${value}${item.label.includes("%") ? "%" : ""}`;
};

export default function TargetTracker() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#243b53]">Target & Achievement Tracking</h3>
            <p className="text-xs font-medium text-slate-500">Daily target, monthly target, individual progress, and revenue achievement</p>
          </div>
          <TimerReset size={18} className="text-slate-400" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {targets.map((item) => {
            const pct = Math.min(Math.round((item.achieved / item.target) * 100), 100);
            return (
              <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-[#243b53]">{item.label}</p>
                  <span className="text-sm font-black text-emerald-700">{pct}%</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {formatValue(item, item.achieved)} achieved of {formatValue(item, item.target)}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-black text-[#243b53]">Executive Attendance Snapshot</h3>
        <p className="text-xs font-medium text-slate-500">Light HR visibility for active team tracking</p>
        <div className="mt-4 grid grid-cols-1 gap-3">
          {attendanceSnapshot.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">{item.label}</span>
              <span className="text-sm font-black text-[#243b53]">{item.value}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#243b53]">SLA / Risk Monitoring</h3>
            <p className="text-xs font-medium text-slate-500">Operational warnings that need team leader action</p>
          </div>
          <AlertOctagon size={18} className="text-rose-500" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {risks.map((risk) => (
            <div key={risk.title} className={`rounded-xl border p-4 ${riskCls[risk.tone]}`}>
              <p className="text-2xl font-black">{risk.count}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-wider">{risk.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
