import UserAvatar from "../../../../../../../components/shared/UserAvatar";
import { Clock3, AlertTriangle, CheckCircle2 } from "lucide-react";

const priorityStyles = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export default function FollowUpCard({ item, index = 0 }) {
  const statusStyles = {
    Upcoming: {
      icon: Clock3,
      className: "text-blue-600",
    },

    Missed: {
      icon: AlertTriangle,
      className: "text-rose-600",
    },

    Completed: {
      icon: CheckCircle2,
      className: "text-emerald-600",
    },
  };

  const StatusIcon = statusStyles[item.status].icon;

  return (
    <article
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
      className={`rounded-3xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-lg animate-in fade-in slide-in-from-bottom-3
      ${
        item.status === "Missed"
          ? "border-rose-200 bg-rose-50/30"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={item.leadName} size={46} />

          <div>
            <h3 className="font-black text-[#2a465a]">{item.leadName}</h3>

            <p className="text-sm text-slate-500">{item.mobile}</p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${priorityStyles[item.priority]}`}
        >
          {item.priority}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-bold text-slate-400 uppercase">Reminder</p>

        <h4 className="font-black text-[#2a465a] mt-1">{item.title}</h4>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Follow-up Time</p>

          <p className="font-bold text-[#2a465a]">
            {item.date} • {item.time}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 font-bold ${statusStyles[item.status].className}`}
        >
          <StatusIcon size={16} />

          <span>{item.status}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-600 leading-relaxed">{item.notes}</p>
      </div>
    </article>
  );
}
