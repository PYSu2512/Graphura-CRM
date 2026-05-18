import { AlertCircle, CalendarClock } from "lucide-react";
import { followups } from "../data/progressData";

const typeCls = {
  Today: "border-blue-200 bg-blue-50 text-blue-700",
  Missed: "border-rose-200 bg-rose-50 text-rose-700",
  Upcoming: "border-slate-200 bg-slate-50 text-slate-700",
  "High Priority": "border-amber-200 bg-amber-50 text-amber-700",
};

export default function FollowupMonitor() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#243b53]">Follow-Up Monitoring</h3>
          <p className="text-xs font-medium text-slate-500">Today, missed, upcoming, and high-priority follow-ups</p>
        </div>
        <CalendarClock size={18} className="text-slate-400" />
      </div>
      <div className="space-y-3">
        {followups.map((item) => (
          <div key={item.id} className={`rounded-xl border p-3 ${typeCls[item.type]}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black">{item.lead}</p>
                <p className="mt-1 text-xs font-semibold opacity-80">{item.executive} · {item.due}</p>
              </div>
              <span className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-black">{item.type}</span>
            </div>
            {item.type === "Missed" && (
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-black">
                <AlertCircle size={14} /> Missed follow-up needs immediate action
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
