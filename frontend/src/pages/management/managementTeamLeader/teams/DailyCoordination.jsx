import React, { useState } from "react";
import {
  Grid,
  Heading,
  DataField,
  SelectField,
  Option,
  Button,
  UserChat,
  DashCard,
} from "../../../../components/shared/Common_Components";
import { MessageSquare, Users, CheckCircle2, AlertTriangle } from "lucide-react";
import teamsStore from "./teamsStore";

const CURRENT_USER = "Management Team Leader";

export default function DailyCoordination() {
  const [messages, setMessages] = useState(teamsStore.coordinationComments);
  const [announcement, setAnnouncement] = useState("");
  const [targetMember, setTargetMember] = useState("");

  // Stats derived from activity log
  const today = new Date().toISOString().slice(0, 10);
  const todayActivity = teamsStore.activityLog.filter((a) =>
    a.timestamp.startsWith(today)
  );
  const activeCount = teamsStore.members.filter((m) => m.status === "Active").length;
  const delayCount = teamsStore.activityLog.filter((a) => a.type === "delay").length;
  const completedToday = teamsStore.activityLog.filter(
    (a) => a.type === "completed" && a.timestamp.startsWith(today.slice(0, 7))
  ).length;

  const handleSend = (msg) => {
    const updated = [...messages, msg];
    setMessages(updated);
    teamsStore.coordinationComments = updated;
  };

  const handleBroadcast = () => {
    if (!announcement.trim()) return;
    const msg = {
      sender: CURRENT_USER,
      time: new Date().toISOString().slice(0, 16).replace("T", " "),
      text: targetMember
        ? `📢 @${targetMember}: ${announcement}`
        : `📢 Team Announcement: ${announcement}`,
    };
    handleSend(msg);
    setAnnouncement("");
    setTargetMember("");
  };

  return (
    <Grid cols={12} gap={4}>
      <Heading
        primaryText="Daily Coordination"
        secondaryText="Team Hub"
        size={12}
        showAnimations={false}
      />

      {/* Stats Row */}
      <div className="col-span-12 flex flex-row gap-4">
        <div className="flex-1">
          <DashCard title="Active Members" value={String(activeCount)} icon={<Users size={22} />} accentColor="#2a465a" />
        </div>
        <div className="flex-1">
          <DashCard title="Today's Updates" value={String(todayActivity.length)} icon={<MessageSquare size={22} />} accentColor="#3b82f6" />
        </div>
        <div className="flex-1">
          <DashCard title="Completed (Month)" value={String(completedToday)} icon={<CheckCircle2 size={22} />} accentColor="#22c55e" />
        </div>
        <div className="flex-1">
          <DashCard title="Active Delays" value={String(delayCount)} icon={<AlertTriangle size={22} />} accentColor="#f43f5e" />
        </div>
      </div>

      {/* Broadcast Announcement */}
      <div className="col-span-12 bg-[#efefefb1] rounded-2xl p-5">
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
          Send Announcement / Instruction
        </p>
        <Grid cols={12} gap={4}>
          <SelectField
            label="Target Member (optional)"
            id="coord-target"
            size={4}
            value={targetMember}
            onChange={(e) => setTargetMember(e.target.value)}
            placeholder="Entire Team"
            searchable={false}
          >
            <Option value="" label="Entire Team" />
            {teamsStore.members.map((m) => (
              <Option key={m.id} value={m.name} label={m.name} />
            ))}
          </SelectField>
          <DataField
            label="Announcement / Instruction"
            id="coord-msg"
            placeholder="e.g. Please submit EOD reports by 6 PM..."
            size={6}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
          />
          <Button
            text="Broadcast →"
            size={2}
            variant="primary"
            onClick={handleBroadcast}
          />
        </Grid>
      </div>

      {/* Team Chat / Coordination Board */}
      <div className="col-span-12 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p className="text-sm font-black text-[#2a465a] mb-1">
          Team Coordination Board
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Daily standup, updates, and instructions
        </p>
        <UserChat
          messages={messages}
          onSend={handleSend}
          currentUser={CURRENT_USER}
          placeholder="Type a message or instruction… (Enter to send)"
          maxHeight="max-h-96"
          showAttach={true}
        />
      </div>

      {/* Today's Activity Summary */}
      <div className="col-span-12 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p className="text-sm font-black text-[#2a465a] mb-4">
          Today's Activity Summary
        </p>
        {teamsStore.activityLog.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No activity recorded today.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {teamsStore.activityLog.map((log) => {
              const typeConfig = {
                progress:  { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-100",   dot: "bg-blue-500"   },
                delay:     { bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-100",   dot: "bg-rose-500"   },
                completed: { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-100",dot: "bg-emerald-500"},
                update:    { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-100",  dot: "bg-amber-500"  },
              };
              const cfg = typeConfig[log.type] || typeConfig.update;
              // initials
              const initials = log.member.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const colors = ["#2a465a","#7c3aed","#0891b2","#d97706","#dc2626","#059669"];
              let h = 0; for (const c of log.member) h = (h * 31 + c.charCodeAt(0)) % colors.length;
              const avatarColor = colors[h];

              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
                >
                  {/* Avatar */}
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
