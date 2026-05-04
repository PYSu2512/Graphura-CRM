import { useState, useMemo } from "react";
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Users as UsersIcon,
  Clock,
  RotateCcw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard as DashCard,
  PanelModal as Modal,
  openModal,
  closeModal,
  DataField,
  SelectField,
  Option,
  Grid,
} from "../../../../components/shared/Common_Components";
import { DUMMY_FOLLOWUPS } from "./leadsStore";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getDaysInMonth   = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
const toDateKey        = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const typeIcons  = { Call: Phone, Email: Mail, Meeting: UsersIcon };
const typeColors = { Call: "#3b82f6", Email: "#8b5cf6", Meeting: "#f59e0b" };

const priorityBadge = {
  High:   "bg-rose-100 text-rose-600",
  Medium: "bg-amber-100 text-amber-600",
  Low:    "bg-slate-100 text-slate-500",
};

export default function FollowUps() {
  const now = new Date();
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const [followups,   setFollowups]   = useState(DUMMY_FOLLOWUPS);
  const [calYear,     setCalYear]     = useState(now.getFullYear());
  const [calMonth,    setCalMonth]    = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate()); // default = today
  const [filterType,  setFilterType]  = useState("All");
  const [viewLead,    setViewLead]    = useState(null);

  // ── Calendar navigation ──
  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  // ── Count follow-ups per day for the current calendar month (respects type filter) ──
  const countsByDay = useMemo(() => {
    const map = {};
    followups.forEach((f) => {
      const [fy, fm, fd] = f.date.split("-").map(Number);
      const matchMonth = fy === calYear && fm === calMonth + 1;
      const matchType  = filterType === "All" || f.type === filterType;
      if (matchMonth && matchType) {
        map[fd] = (map[fd] || 0) + 1;
      }
    });
    return map;
  }, [followups, calYear, calMonth, filterType]);

  // ── Follow-ups for the selected date ──
  const selectedKey = toDateKey(calYear, calMonth, selectedDay);

  const visibleFollowups = useMemo(() => {
    return followups.filter((f) => {
      const matchDate = f.date === selectedKey;
      const matchType = filterType === "All" || f.type === filterType;
      return matchDate && matchType;
    });
  }, [followups, selectedKey, filterType]);

  // ── Stat counts (global, not date-filtered) ──
  const todayFollowups  = followups.filter((f) => f.date === todayKey);
  const todayCount      = todayFollowups.filter((f) => f.status === "pending" || f.status === "overdue").length;
  const overdueCount    = followups.filter((f) => f.status === "overdue").length;
  const completedCount  = followups.filter((f) => f.status === "done").length;
  const thisWeekCount   = useMemo(() => {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return followups.filter((f) => {
      const d = new Date(f.date);
      return d >= startOfWeek && d <= endOfWeek;
    }).length;
  }, [followups]);

  const handleMarkDone = (id) => {
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: "done" } : f));
  };

  // ── Calendar layout ──
  const monthName   = new Date(calYear, calMonth).toLocaleString("default", { month: "long" });
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay    = getFirstDayOfMonth(calYear, calMonth);

  // ── Panel heading ──
  const isSelectedToday = selectedKey === todayKey;
  const selectedLabel   = isSelectedToday
    ? "Today's Follow-ups"
    : `${monthName} ${selectedDay} Follow-ups`;

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">Follow-ups</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage all scheduled follow-ups</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <DashGrid cols={12} gap={4}>
        <DashCard title="Today"     value={String(todayCount)}     icon={<CalendarClock size={22} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Overdue"   value={String(overdueCount)}   icon={<AlertTriangle size={22} />} accentColor="#f43f5e" size={3} />
        <DashCard title="This Week" value={String(thisWeekCount)}  icon={<Calendar      size={22} />} accentColor="#14b8a6" size={3} />
        <DashCard title="Completed" value={String(completedCount)} icon={<CheckCircle2  size={22} />} accentColor="#22c55e" size={3} />
      </DashGrid>

      {/* ── Type Filters ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type:</span>
        {["All", "Call", "Email", "Meeting"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
              filterType === t
                ? "bg-[#2a465a] text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Calendar + List ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

        {/* ── Calendar ── */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm overflow-x-auto custom-scrollbar">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6 min-w-[300px]">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#2a465a] transition shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="text-lg font-bold text-[#2a465a]">{monthName} {calYear}</h3>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#2a465a] transition shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="min-w-[300px]">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isToday    = toDateKey(calYear, calMonth, day) === todayKey;
                const isSelected = day === selectedDay && !(calMonth !== now.getMonth() || calYear !== now.getFullYear()) || (
                  day === selectedDay
                );
                const count = countsByDay[day] || 0;

                // Determine cell style
                let cellCls = "text-slate-600 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200";
                if (isToday)    cellCls = "bg-gradient-to-br from-[#2a465a] to-[#1e3a52] text-white shadow-md";
                if (!isToday && isSelected) cellCls = "bg-[#2a465a]/10 border-[#2a465a]/30 text-[#2a465a]";

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all cursor-pointer border ${cellCls}`}
                  >
                    <span className="font-bold leading-none">{day}</span>
                    {count > 0 && (
                      <span className={`text-[10px] font-black mt-0.5 leading-none ${
                        isToday ? "text-white/80 bg-gray-200/50 p-1 rounded-full" : "text-[#3b82f6]"
                      }`}>
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Follow-ups Panel ── */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6 shadow-sm flex flex-col max-h-[700px] w-full overflow-hidden">
          {/* Panel header */}
          <div className="shrink-0 flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-[#2a465a]">{selectedLabel}</h3>
            <span className="text-xs bg-[#2a465a]/10 text-[#2a465a] px-3 py-1 rounded-full font-semibold">
              {visibleFollowups.length} scheduled
            </span>
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            {visibleFollowups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <CheckCircle2 size={48} className="text-emerald-300 mb-4 drop-shadow-md" />
                <p className="text-base font-bold text-slate-500">No follow-ups</p>
                <p className="text-sm text-slate-400 mt-1">Nothing scheduled for this date.</p>
              </div>
            ) : (
              visibleFollowups.map((f) => {
                const Icon      = typeIcons[f.type]  || Phone;
                const color     = typeColors[f.type] || "#3b82f6";
                const isOverdue = f.status === "overdue";
                const isDone    = f.status === "done";

                return (
                  <div
                    key={f.id}
                    className={`rounded-2xl border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                      isDone    ? "border-emerald-200 bg-emerald-50/60 opacity-70" :
                      isOverdue ? "border-rose-200 bg-rose-50 shadow-sm" :
                                  "border-slate-200 bg-white shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + status badge */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-bold text-[#2a465a] truncate">{f.leadName}</p>
                          {isOverdue && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600 uppercase tracking-widest">
                              Overdue
                            </span>
                          )}
                          {isDone && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600 uppercase tracking-widest">
                              Done
                            </span>
                          )}
                        </div>

                        {/* Time · Type · Priority */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                            <Clock size={11} className="text-slate-400" /> {f.time}
                          </span>
                          <span className="text-slate-300 text-xs">·</span>
                          <span className="text-xs font-semibold text-slate-500">{f.type}</span>
                          <span className="text-slate-300 text-xs">·</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityBadge[f.priority]}`}>
                            {f.priority}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{f.notes}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pl-[52px]">
                      <button
                        onClick={() => { setViewLead(f); openModal("sm-view-modal"); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition active:scale-95 shadow-sm"
                      >
                        <Eye size={13} /> View
                      </button>
                      {!isDone && (
                        <>
                          <button
                            onClick={() => handleMarkDone(f.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2a465a] text-white hover:bg-[#1e3a52] transition active:scale-95 shadow-md shadow-[#2a465a]/20"
                          >
                            <CheckCircle2 size={13} /> Mark Done
                          </button>
                          <button
                            onClick={() => openModal("sm-reschedule-modal")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition active:scale-95 shadow-sm"
                          >
                            <RotateCcw size={13} /> Reschedule
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── View Follow-up Modal ── */}
      <Modal id="sm-view-modal" title="Follow-up Details" size="md">
        {viewLead && (() => {
          const Icon  = typeIcons[viewLead.type]  || Phone;
          const color = typeColors[viewLead.type] || "#3b82f6";
          const statusMap = {
            pending: { cls: "bg-blue-100 text-blue-700",    label: "Pending"  },
            overdue: { cls: "bg-rose-100 text-rose-700",    label: "Overdue"  },
            done:    { cls: "bg-emerald-100 text-emerald-700", label: "Done"  },
          };
          const { cls: statusCls, label: statusLabel } = statusMap[viewLead.status] ?? statusMap.pending;

          return (
            <div className="space-y-5">
              {/* Lead identity */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-base font-black text-[#2a465a]">{viewLead.leadName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Assigned to {viewLead.assignedExec}</p>
                </div>
                <span className={`ml-auto shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusCls}`}>
                  {statusLabel}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Date",      value: viewLead.date },
                  { label: "Time",      value: viewLead.time },
                  { label: "Type",      value: viewLead.type },
                  { label: "Priority",  value: viewLead.priority },
                  { label: "Executive", value: viewLead.assignedExec },
                  { label: "Status",    value: statusLabel },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-semibold text-[#2a465a]">{value}</p>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes / Agenda</p>
                <p className="text-sm text-slate-600 leading-relaxed">{viewLead.notes}</p>
              </div>

              {/* Footer actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                {viewLead.status !== "done" && (
                  <button
                    onClick={() => { handleMarkDone(viewLead.id); closeModal("sm-view-modal"); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#2a465a] text-white hover:bg-[#1e3a52] transition active:scale-95 shadow-md shadow-[#2a465a]/20"
                  >
                    <CheckCircle2 size={15} /> Mark Done
                  </button>
                )}
                <button
                  onClick={() => closeModal("sm-view-modal")}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Add Follow-up Modal ── */}
      <Modal id="sm-add-followup-modal" title="Add New Follow-up">
        <div className="space-y-5">
          <Grid cols={12} gap={4}>
            <SelectField label="Select Lead" id="sm-new-flw-lead" size={12} placeholder="Search lead...">
              {DUMMY_FOLLOWUPS.slice(0, 8).map((f) => (
                <Option key={f.id} value={f.id} label={f.leadName} />
              ))}
            </SelectField>
            <DataField label="Date" id="sm-new-flw-date" type="date" size={6} />
            <DataField label="Time" id="sm-new-flw-time" type="time" size={6} />
            <SelectField label="Type" id="sm-new-flw-type" size={6} placeholder="Select type">
              <Option value="call"    label="Call" />
              <Option value="email"   label="Email" />
              <Option value="meeting" label="Meeting" />
            </SelectField>
            <SelectField label="Priority" id="sm-new-flw-priority" size={6} placeholder="Select priority">
              <Option value="high"   label="High" />
              <Option value="medium" label="Medium" />
              <Option value="low"    label="Low" />
            </SelectField>
            <div className="col-span-12">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Notes / Agenda
              </label>
              <textarea
                placeholder="Write brief notes here..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 resize-none h-24 focus:bg-white transition-colors"
              />
            </div>
          </Grid>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => closeModal("sm-add-followup-modal")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => closeModal("sm-add-followup-modal")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] hover:bg-[#1e3a52] transition active:scale-95 shadow-lg shadow-[#2a465a]/20"
            >
              Save Follow-up
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Reschedule Modal ── */}
      <Modal id="sm-reschedule-modal" title="Reschedule Follow-up">
        <div className="space-y-5">
          <p className="text-sm text-slate-500">Select a new date and time for this follow-up.</p>
          <Grid cols={12} gap={4}>
            <DataField label="New Date" id="sm-resch-date" type="date" size={6} />
            <DataField label="New Time" id="sm-resch-time" type="time" size={6} />
            <div className="col-span-12">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Reason / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Lead was busy"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:bg-white transition-colors"
              />
            </div>
          </Grid>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => closeModal("sm-reschedule-modal")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => closeModal("sm-reschedule-modal")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
