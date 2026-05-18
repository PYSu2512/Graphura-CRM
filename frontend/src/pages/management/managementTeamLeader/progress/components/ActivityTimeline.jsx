import { AlertTriangle, CheckCircle2, Info, MessageCircle, PhoneCall } from "lucide-react";
import { activityLogs } from "../data/progressData";

const toneMap = {
  danger: { icon: AlertTriangle, cls: "border-rose-200 bg-rose-50 text-rose-700" },
  warning: { icon: PhoneCall, cls: "border-amber-200 bg-amber-50 text-amber-700" },
  success: { icon: CheckCircle2, cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  info: { icon: Info, cls: "border-blue-200 bg-blue-50 text-blue-700" },
};

export default function ActivityTimeline() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#243b53]">Daily Activity Tracking</h3>
          <p className="text-xs font-medium text-slate-500">Calls, WhatsApp activity, status changes, follow-ups, prospects, and dumps</p>
        </div>
        <MessageCircle size={18} className="text-slate-400" />
      </div>
      <div className="space-y-3">
        {activityLogs.map((item) => {
          const tone = toneMap[item.tone] || toneMap.info;
          const Icon = tone.icon;
          return (
            <div key={item.id} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${tone.cls}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-[#243b53]">{item.executive}</p>
                  <span className="text-xs font-semibold text-slate-400">{item.time}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {item.action} · <span className="font-bold text-slate-700">{item.lead}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
