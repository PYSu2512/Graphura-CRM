import { AlertCircle, TimerReset } from "lucide-react";
import { Button, openModal } from "../../../../../components/shared/Common_Components";
import { escalationQueue } from "../supportData";

const urgencyCls = {
  Critical: "bg-rose-100 text-rose-700",
  High: "bg-amber-100 text-amber-700",
  Medium: "bg-blue-100 text-blue-700",
};

export default function EscalationPanel({ onSelect }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#243b53]">Escalation Queue</h3>
          <p className="text-xs font-medium text-slate-500">Unresolved tickets, delayed projects, and blockers</p>
        </div>
        <AlertCircle size={18} className="text-rose-500" />
      </div>
      <div className="space-y-3">
        {escalationQueue.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#243b53]">{item.item}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{item.source} · {item.owner}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-black ${urgencyCls[item.urgency]}`}>
                {item.urgency}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                <TimerReset size={14} /> {item.countdown}
              </span>
              <div className="w-32">
                <Button
                  text="Escalate"
                  size={12}
                  variant="danger"
                  onClick={() => {
                    onSelect(item);
                    openModal("mtl-support-escalate-ticket");
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
