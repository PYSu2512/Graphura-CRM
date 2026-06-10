import React from "react";
import {
  Grid,
  EnhancedDashCard,
} from "../../../../components/shared/Common_Components";
import { MessageSquare, Users, CheckCircle2, AlertTriangle } from "lucide-react";
import { useProjectsStore, getAvatarColor } from "../projects/projectsStore";

export default function DailyCoordination() {
  const { members, activityLog } = useProjectsStore();

  // Stats derived from activity log
  const today = new Date().toISOString().slice(0, 10);
  const todayActivity = activityLog.filter((a) =>
    a.timestamp.startsWith(today)
  );
  const activeCount = members.filter((m) => m.status === "Active").length;
  const delayCount = activityLog.filter((a) => a.type === "delay").length;
  const completedToday = activityLog.filter(
    (a) => a.type === "completed" && a.timestamp.startsWith(today.slice(0, 7))
  ).length;

  return (
    <Grid cols={12} gap={4}>
      {/* Stats Row — EnhancedDashCard */}
      <EnhancedDashCard title="Active Members" value={String(activeCount)} icon={<Users size={20} />} accentColor="#3b82f6" size={3} />
      <EnhancedDashCard title="Today's Updates" value={String(todayActivity.length)} icon={<MessageSquare size={20} />} accentColor="#6366f1" size={3} />
      <EnhancedDashCard title="Completed (Month)" value={String(completedToday)} icon={<CheckCircle2 size={20} />} accentColor="#22c55e" size={3} />
      <EnhancedDashCard title="Active Delays" value={String(delayCount)} icon={<AlertTriangle size={20} />} accentColor="#ef4444" size={3} />

      {/* Today's Activity Summary */}
      <div className="col-span-12 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p className="text-sm font-black text-[#2a465a] mb-4">
          Today's Activity Summary
        </p>
        {activityLog.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No activity recorded today.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activityLog.map((log) => {
              const typeConfig = {
                progress:  { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-100",   dot: "bg-blue-500"   },
                delay:     { bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-100",   dot: "bg-rose-500"   },
                completed: { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-100",dot: "bg-emerald-500"},
                update:    { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-100",  dot: "bg-amber-500"  },
              };
              const cfg = typeConfig[log.type] || typeConfig.update;
              const initials = log.member.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const avatarColor = getAvatarColor(log.member);

              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                    style={{ background: avatarColor }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-[#2a465a]">{log.member}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{log.detail}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">📁 {log.project}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Grid>
  );
}
