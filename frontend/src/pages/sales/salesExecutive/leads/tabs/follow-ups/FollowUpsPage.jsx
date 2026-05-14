import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Mail,
  MessageCircle,
  MonitorPlay,
  Phone,
  Users,
  Zap,
} from "lucide-react";
import {
  Button,
  DataTable,
  EnhancedDashCard as DashCard,
  DashGrid,
  PanelModal as Modal,
  closeModal,
  openModal,
} from "../../../../../../components/shared/Common_Components";
import dummyFollowUps from "./data/DummyFollowUps";

const TYPE_OPTIONS = ["Call", "Email", "Meeting", "Whatsapp", "Demo"];

const statusMap = {
  Upcoming: "pending",
  Missed: "expired",
  Completed: "done",
};

const typeIcons = {
  Call: Phone,
  Email: Mail,
  Meeting: Users,
  Whatsapp: MessageCircle,
  Demo: MonitorPlay,
};

const typeColors = {
  Call: "#2563eb",
  Email: "#7c3aed",
  Meeting: "#d97706",
  Whatsapp: "#16a34a",
  Demo: "#0891b2",
};

const priorityBadge = {
  High: "bg-rose-100 text-rose-600",
  Medium: "bg-amber-100 text-amber-600",
  Low: "bg-slate-100 text-slate-500",
};

const toDateKey = (year, month, day) => (
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
);

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const executiveFollowUps = dummyFollowUps.map((item) => ({
  id: item.id,
  leadName: item.leadName,
  mobile: item.mobile,
  email: item.email,
  title: item.title,
  date: item.date,
  time: item.time,
  type: item.type || "Call",
  status: statusMap[item.status] || "pending",
  notes: item.title ? `${item.title} - ${item.notes}` : item.notes,
  assignedExec: "You",
  priority: item.priority,
}));

export default function FollowUpsPage() {
  const now = new Date();
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const [followups, setFollowups] = useState(executiveFollowUps);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [filterType, setFilterType] = useState("All");
  const [viewLead, setViewLead] = useState(null);
  const [actionLead, setActionLead] = useState(null);

  const selectedKey = toDateKey(calYear, calMonth, selectedDay);
  const monthName = new Date(calYear, calMonth).toLocaleString("default", { month: "long" });
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const countsByDay = useMemo(() => {
    return followups.reduce((acc, item) => {
      const [year, month, day] = item.date.split("-").map(Number);
      if (year === calYear && month === calMonth + 1 && (filterType === "All" || item.type === filterType)) {
        acc[day] = (acc[day] || 0) + 1;
      }
      return acc;
    }, {});
  }, [followups, calYear, calMonth, filterType]);

  const visibleFollowups = useMemo(() => {
    return followups.filter((item) => (
      item.date === selectedKey && (filterType === "All" || item.type === filterType)
    ));
  }, [followups, selectedKey, filterType]);

  const todayCount = followups.filter((item) => item.date === todayKey && item.status !== "done").length;
  const expiredCount = followups.filter((item) => item.status === "expired").length;
  const completedCount = followups.filter((item) => item.status === "done").length;
  const thisWeekCount = useMemo(() => {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return followups.filter((item) => {
      const date = new Date(item.date);
      return date >= start && date <= end;
    }).length;
  }, [followups]);

  const openViewModal = (lead) => {
    setViewLead(lead);
    openModal("se-followup-view-modal");
  };

  const openActionModal = (lead) => {
    setActionLead(lead);
    openModal("se-followup-action-modal");
  };

  const markDone = () => {
    setFollowups((prev) => prev.map((item) => (
      item.id === actionLead.id ? { ...item, status: "done" } : item
    )));
    closeModal("se-followup-action-modal");
  };

  const historyRows = followups.map((item) => ({
    ...item,
    _id: item.id,
    _status: item.status,
    status: item.status === "done" ? "Done" : item.status === "expired" ? "Expired" : "Pending",
  }));

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden">
      <div>
        <h2 className="text-xl font-bold text-[#2a465a]">Follow-ups</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track and manage your scheduled follow-ups</p>
      </div>

      <DashGrid cols={12} gap={4}>
        <DashCard title="Today" value={String(todayCount)} icon={<CalendarClock size={22} />} accentColor="#2563eb" size={3} />
        <DashCard title="Expired" value={String(expiredCount)} icon={<AlertTriangle size={22} />} accentColor="#f43f5e" size={3} />
        <DashCard title="This Week" value={String(thisWeekCount)} icon={<Calendar size={22} />} accentColor="#14b8a6" size={3} />
        <DashCard title="Completed" value={String(completedCount)} icon={<CheckCircle2 size={22} />} accentColor="#22c55e" size={3} />
      </DashGrid>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type:</span>
        {["All", ...TYPE_OPTIONS].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              filterType === type
                ? "bg-[#2a465a] text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6 min-w-[300px]">
            <button
              type="button"
              onClick={() => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear((year) => year - 1);
                } else {
                  setCalMonth((month) => month - 1);
                }
              }}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#2a465a] transition shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="text-lg font-bold text-[#2a465a]">{monthName} {calYear}</h3>
            <button
              type="button"
              onClick={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear((year) => year + 1);
                } else {
                  setCalMonth((month) => month + 1);
                }
              }}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#2a465a] transition shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="min-w-[300px]">
            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, index) => <div key={`blank-${index}`} />)}
              {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
                const isToday = toDateKey(calYear, calMonth, day) === todayKey;
                const isSelected = day === selectedDay;
                const count = countsByDay[day] || 0;
                let cellClass = "text-slate-600 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200";
                if (isToday) cellClass = "bg-gradient-to-br from-[#2a465a] to-[#1e3a52] text-white shadow-md";
                if (!isToday && isSelected) cellClass = "bg-[#2a465a]/10 border-[#2a465a]/30 text-[#2a465a]";

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition border ${cellClass}`}
                  >
                    <span className="font-bold leading-none">{day}</span>
                    {count > 0 && (
                      <span className={`text-[10px] font-black mt-0.5 leading-none ${isToday ? "text-white/80" : "text-[#2563eb]"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6 shadow-sm flex flex-col max-h-[700px] w-full overflow-hidden">
          <div className="shrink-0 flex items-center justify-between gap-3 mb-5">
            <h3 className="text-lg font-bold text-[#2a465a]">
              {selectedKey === todayKey ? "Today's Follow-ups" : `${monthName} ${selectedDay} Follow-ups`}
            </h3>
            <span className="text-xs bg-[#2a465a]/10 text-[#2a465a] px-3 py-1 rounded-full font-semibold">
              {visibleFollowups.length} scheduled
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            {visibleFollowups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <CheckCircle2 size={48} className="text-emerald-300 mb-4 drop-shadow-md" />
                <p className="text-base font-bold text-slate-500">No follow-ups</p>
                <p className="text-sm text-slate-400 mt-1">Nothing scheduled for this date.</p>
              </div>
            ) : visibleFollowups.map((item) => {
              const Icon = typeIcons[item.type] || Phone;
              const color = typeColors[item.type] || "#2563eb";
              const isDone = item.status === "done";
              const isExpired = item.status === "expired";

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition hover:shadow-md ${
                    isDone ? "border-emerald-200 bg-emerald-50/60 opacity-70" : isExpired ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100" style={{ backgroundColor: `${color}15`, color }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-[#2a465a] truncate">{item.leadName}</p>
                        {(isDone || isExpired) && (
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isDone ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                            {isDone ? "Done" : "Expired"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <a href={`tel:${item.mobile}`} className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline">
                          <Phone size={10} /> {item.mobile}
                        </a>
                        <span className="text-slate-300 text-xs">|</span>
                        <a href={`mailto:${item.email}`} className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold hover:underline break-all">
                          <Mail size={10} /> {item.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                          <Clock size={11} className="text-slate-400" /> {item.time}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{item.type}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityBadge[item.priority]}`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.notes}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pl-[52px]">
                    <button
                      type="button"
                      onClick={() => openViewModal(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition active:scale-95 shadow-sm"
                    >
                      <Eye size={13} /> View
                    </button>
                    {!isDone && (
                      <button
                        type="button"
                        onClick={() => openActionModal(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2a465a] text-white hover:bg-[#1e3a52] transition active:scale-95 shadow-md shadow-[#2a465a]/20"
                      >
                        <Zap size={13} /> Action
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DataTable
        title="Follow-up History"
        size={12}
        searchable
        exportable
        onDateFilter
        date
        ellipse={3}
        exportFileName="executive-followup-history"
        pageSize={10}
        columns={[
          { key: "leadName", label: "Lead" },
          { key: "mobile", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "date", label: "Date" },
          { key: "time", label: "Time" },
          { key: "type", label: "Type" },
          { key: "priority", label: "Priority" },
          { key: "status", label: "Status" },
          { key: "notes", label: "Notes" },
        ]}
        rows={historyRows}
        filters={[
          {
            title: "Type",
            type: "toggle",
            key: "type",
            options: TYPE_OPTIONS,
          },
          {
            title: "Status",
            type: "toggle",
            key: "status",
            options: ["Pending", "Expired", "Done"],
          },
        ]}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View",
            variant: "ghost",
            onClick: (row) => {
              const lead = followups.find((item) => item.id === row._id);
              if (lead) openViewModal(lead);
            },
          },
          {
            icon: <Zap size={15} />,
            tooltip: "Action",
            variant: "primary",
            show: (row) => row._status !== "done",
            onClick: (row) => {
              const lead = followups.find((item) => item.id === row._id);
              if (lead) openActionModal(lead);
            },
          },
        ]}
      />

      <Modal id="se-followup-view-modal" title="Follow-up Details" size="xl">
        {viewLead && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0" style={{ backgroundColor: `${typeColors[viewLead.type]}15`, color: typeColors[viewLead.type] }}>
                {(() => {
                  const Icon = typeIcons[viewLead.type] || Phone;
                  return <Icon size={22} />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-[#2a465a]">{viewLead.leadName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{viewLead.title}</p>
              </div>
              <span className={`ml-auto shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                viewLead.status === "done" ? "bg-emerald-100 text-emerald-700" : viewLead.status === "expired" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
              }`}>
                {viewLead.status === "done" ? "Done" : viewLead.status === "expired" ? "Expired" : "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a href={`tel:${viewLead.mobile}`} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <Phone size={16} className="text-blue-600" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                  <p className="text-xs font-bold text-[#2a465a]">{viewLead.mobile}</p>
                </div>
              </a>
              <a href={`mailto:${viewLead.email}`} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-purple-50 hover:border-purple-200 transition-colors">
                <Mail size={16} className="text-purple-600" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email</p>
                  <p className="text-xs font-bold text-[#2a465a] break-all">{viewLead.email}</p>
                </div>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Date", viewLead.date],
                ["Time", viewLead.time],
                ["Type", viewLead.type],
                ["Priority", viewLead.priority],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-semibold text-[#2a465a]">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</p>
              <p className="text-sm text-slate-600 leading-relaxed">{viewLead.notes}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button text="Close" variant="secondary" size={3} onClick={() => closeModal("se-followup-view-modal")} />
              {viewLead.status !== "done" && (
                <Button text="Action" variant="primary" size={3} onClick={() => {
                  closeModal("se-followup-view-modal");
                  openActionModal(viewLead);
                }} />
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal id="se-followup-action-modal" title="Lead Action" size="md">
        {actionLead && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selected Lead</p>
              <p className="text-sm font-black text-[#2a465a]">{actionLead.leadName}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                <a href={`tel:${actionLead.mobile}`} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline">
                  <Phone size={14} /> {actionLead.mobile}
                </a>
                <a href={`mailto:${actionLead.email}`} className="flex items-center gap-1.5 text-sm text-purple-600 font-semibold hover:underline break-all">
                  <Mail size={14} /> {actionLead.email}
                </a>
              </div>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Follow-up</p>
              <p className="text-sm text-slate-600">{actionLead.notes}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button text="Cancel" variant="secondary" size={3} onClick={() => closeModal("se-followup-action-modal")} />
              <Button text="Mark Done" variant="primary" size={4} onClick={markDone} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
