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
  ChevronLeft,
  ChevronRight,
  Eye,
  Zap,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  PhoneOff,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard as DashCard,
  PanelModal as Modal,
  openModal,
  closeModal,
  Grid,
  DataField,
  SelectField,
  Option,
  Button,
  DataTable,
} from "../../../../components/shared/Common_Components";
import DatePicker from "../../../../components/shared/DatePicker";
import { TimePicker } from "../../../../components/shared/DatePicker";
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

// ── Action options ────────────────────────────────────────────────────────────
const ACTION_OPTIONS = [
  { value: "Interested",    label: "Interested",    icon: ThumbsUp,  color: "text-emerald-600" },
  { value: "Not Interested",label: "Not Interested",icon: ThumbsDown,color: "text-rose-600"    },
  { value: "Reschedule",    label: "Reschedule",    icon: RotateCcw, color: "text-blue-600"    },
  { value: "Not Talk",      label: "Not Talk",      icon: PhoneOff,  color: "text-amber-600"   },
];

const EMPTY_ACTION_FORM = {
  action: "",
  // Prospect fields
  prospectService: "", prospectBudget: "", prospectCity: "", prospectSource: "",
  // Comment (Not Interested / Not Talk)
  comment: "",
  // Reschedule fields
  reschedTitle: "", reschedDate: "", reschedTime: "", reschedType: "", reschedNote: "",
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
  const [actionLead,  setActionLead]  = useState(null);
  const [actionForm,  setActionForm]  = useState(EMPTY_ACTION_FORM);

  const openActionModal = (f) => {
    setActionLead(f);
    setActionForm(EMPTY_ACTION_FORM);
    openModal("sm-lead-action-modal");
  };

  const handleActionSave = () => {
    if (!actionForm.action) return;
    if (actionForm.action === "Reschedule") {
      // update date/time in the list
      setFollowups(prev => prev.map(f =>
        f.id === actionLead.id
          ? { ...f, date: actionForm.reschedDate || f.date, time: actionForm.reschedTime || f.time, status: "pending" }
          : f
      ));
    } else if (actionForm.action === "Interested" || actionForm.action === "Not Interested" || actionForm.action === "Not Talk") {
      setFollowups(prev => prev.map(f => f.id === actionLead.id ? { ...f, status: "done" } : f));
    }
    closeModal("sm-lead-action-modal");
  };

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
  const todayCount      = todayFollowups.filter((f) => f.status === "pending" || f.status === "expired").length;
  const expiredCount    = followups.filter((f) => f.status === "expired").length;
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
        <DashCard title="Expired"   value={String(expiredCount)}   icon={<AlertTriangle size={22} />} accentColor="#f43f5e" size={3} />
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
                const isOverdue = f.status === "expired";
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
                              Expired
                            </span>
                          )}
                          {isDone && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600 uppercase tracking-widest">
                              Done
                            </span>
                          )}
                        </div>

                        {/* Phone + Email */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <a
                            href={`tel:${f.mobile}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline"
                          >
                            <Phone size={10} /> {f.mobile}
                          </a>
                          <span className="text-slate-300 text-xs">·</span>
                          <a
                            href={`mailto:${f.email}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold hover:underline truncate"
                          >
                            <Mail size={10} /> {f.email}
                          </a>
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
                        <button
                          onClick={() => openActionModal(f)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2a465a] text-white hover:bg-[#1e3a52] transition active:scale-95 shadow-md shadow-[#2a465a]/20"
                        >
                          <Zap size={13} /> Action
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Follow-up History Table ── */}
      <DataTable
        title="Follow-up History"
        size={12}
        searchable
        exportable
        onDateFilter
        exportFileName="followup-history"
        pageSize={10}
        date
        ellipse={3}
        columns={[
          { key: "leadName",    label: "Lead"       },
          { key: "mobile",      label: "Phone"      },
          { key: "date",        label: "Date"       },
          { key: "time",        label: "Time"       },
          { key: "type",        label: "Type"       },
          { key: "assignedExec",label: "Executive"  },
          { key: "priority",    label: "Priority"   },
          { key: "status",      label: "Status"     },
          { key: "notes",       label: "Notes"      },
        ]}
        rows={followups.map(f => ({
          ...f,
          _id:      f.id,
          _status:  f.status,
          status: f.status === "done"
            ? "Done"
            : f.status === "expired"
              ? "Expired"
              : "Pending",
        }))}
        filters={[
          {
            title:   "Type",
            type:    "toggle",
            key:     "type",
            options: ["Call", "Email", "Meeting"],
          },
          {
            title:   "Priority",
            type:    "toggle",
            key:     "priority",
            options: ["High", "Medium", "Low"],
          },
          {
            title:   "Status",
            type:    "toggle",
            key:     "status",
            options: ["Pending", "Expired", "Done"],
          },
          {
            title:   "Executive",
            type:    "select",
            key:     "assignedExec",
            options: [...new Set(followups.map(f => f.assignedExec))],
          },
        ]}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => {
              const lead = followups.find(f => f.id === row._id);
              if (lead) { setViewLead(lead); openModal("sm-view-modal"); }
            },
          },
          {
            icon: <Zap size={15} />,
            tooltip: "Action",
            variant: "primary",
            show: (row) => row._status !== "done",
            onClick: (row) => {
              const lead = followups.find(f => f.id === row._id);
              if (lead) openActionModal(lead);
            },
          },
        ]}
      />

      {/* ── View Follow-up Modal ── */}
      <Modal id="sm-view-modal" title="Follow-up Details" size="xl">
        {viewLead && (() => {
          const Icon  = typeIcons[viewLead.type]  || Phone;
          const color = typeColors[viewLead.type] || "#3b82f6";
          const statusMap = {
            pending: { cls: "bg-blue-100 text-blue-700",       label: "Pending"  },
            expired: { cls: "bg-rose-100 text-rose-700",       label: "Expired"  },
            done:    { cls: "bg-emerald-100 text-emerald-700", label: "Done"     },
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
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-[#2a465a]">{viewLead.leadName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Assigned to {viewLead.assignedExec}</p>
                </div>
                <span className={`ml-auto shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusCls}`}>
                  {statusLabel}
                </span>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${viewLead.mobile}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Phone size={14} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                    <p className="text-xs font-bold text-[#2a465a] truncate">{viewLead.mobile}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${viewLead.email}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-purple-50 hover:border-purple-200 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                    <Mail size={14} className="text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email</p>
                    <p className="text-xs font-bold text-[#2a465a] truncate">{viewLead.email}</p>
                  </div>
                </a>
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
                    onClick={() => {
                      closeModal("sm-view-modal");
                      openActionModal(viewLead);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#2a465a] text-white hover:bg-[#1e3a52] transition active:scale-95 shadow-md shadow-[#2a465a]/20"
                  >
                    <Zap size={15} /> Action
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

      {/* ── Lead Action Modal ── */}
      <Modal id="sm-lead-action-modal" title="Lead Action" size="xl">
        {actionLead && (
          <div className="space-y-5">
            {/* Selected lead info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selected Lead</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2a465a]/10 flex items-center justify-center text-sm font-black text-[#2a465a] flex-shrink-0">
                  {actionLead.leadName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#2a465a]">{actionLead.leadName}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <a href={`tel:${actionLead.mobile}`} className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline">
                      <Phone size={10} /> {actionLead.mobile}
                    </a>
                    <span className="text-slate-300 text-xs">·</span>
                    <a href={`mailto:${actionLead.email}`} className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold hover:underline truncate max-w-[160px]">
                      <Mail size={10} /> {actionLead.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Action selector */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Action</p>
              <div className="grid grid-cols-2 gap-2">
                {ACTION_OPTIONS.map(({ value, label, icon: ActionIcon, color }) => (
                  <button
                    key={value}
                    onClick={() => setActionForm(f => ({ ...EMPTY_ACTION_FORM, action: value }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      actionForm.action === value
                        ? "border-[#2a465a] bg-[#2a465a] text-white shadow-md"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ActionIcon size={15} className={actionForm.action === value ? "text-white" : color} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Conditional sub-form ── */}

            {/* Interested → Prospect Form */}
            {actionForm.action === "Interested" && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Prospect Details</p><hr/>
                <Grid cols={12} gap={3}>
                  <DataField
                    label="Service / Product"
                    id="prospect-service"
                    size={6}
                    placeholder="e.g. CRM Software"
                    value={actionForm.prospectService}
                    onChange={e => setActionForm(f => ({ ...f, prospectService: e.target.value }))}
                  />
                  <DataField
                    label="Budget"
                    id="prospect-budget"
                    size={6}
                    placeholder="e.g. ₹50,000"
                    value={actionForm.prospectBudget}
                    onChange={e => setActionForm(f => ({ ...f, prospectBudget: e.target.value }))}
                  />
                  <DataField
                    label="City"
                    id="prospect-city"
                    size={6}
                    placeholder="e.g. Mumbai"
                    value={actionForm.prospectCity}
                    onChange={e => setActionForm(f => ({ ...f, prospectCity: e.target.value }))}
                  />
                  <SelectField
                    label="Source"
                    id="prospect-source"
                    size={6}
                    placeholder="Select source"
                    searchable={false}
                    value={actionForm.prospectSource}
                    onChange={e => setActionForm(f => ({ ...f, prospectSource: e.target.value }))}
                  >
                    {["Website", "Referral", "Facebook", "LinkedIn", "Cold Call", "Other"].map(s => (
                      <Option key={s} value={s} label={s} />
                    ))}
                  </SelectField>
                </Grid>
              </div>
            )}

            {/* Not Interested → Comment */}
            {actionForm.action === "Not Interested" && (
              <Grid cols={12} gap={3}>
                <DataField
                  label="Comment (Required)"
                  id="not-interested-comment"
                  type="textarea"
                  size={12}
                  rows={4}
                  placeholder="Reason / note why not interested..."
                  value={actionForm.comment}
                  onChange={e => setActionForm(f => ({ ...f, comment: e.target.value }))}
                />
              </Grid>
            )}

            {/* Reschedule → Follow-up Form */}
            {actionForm.action === "Reschedule" && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                <p className="text-xs font-black text-blue-700 uppercase tracking-widest">New Follow-up</p>
                <Grid cols={12} gap={3}>
                  <DataField
                    label="Title"
                    id="resched-title"
                    size={12}
                    placeholder="e.g. Second follow-up call"
                    value={actionForm.reschedTitle}
                    onChange={e => setActionForm(f => ({ ...f, reschedTitle: e.target.value }))}
                  />
                  <div className="col-span-12 sm:col-span-6">
                    <DatePicker
                      label="Date"
                      id="resched-date"
                      value={actionForm.reschedDate}
                      onChange={val => setActionForm(f => ({ ...f, reschedDate: val }))}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <TimePicker
                      label="Time"
                      id="resched-time"
                      value={actionForm.reschedTime}
                      onChange={val => setActionForm(f => ({ ...f, reschedTime: val }))}
                    />
                  </div>
                  <SelectField
                    label="Type"
                    id="resched-type"
                    size={12}
                    placeholder="Select type"
                    searchable={false}
                    value={actionForm.reschedType}
                    onChange={e => setActionForm(f => ({ ...f, reschedType: e.target.value }))}
                  >
                    <Option value="Call"    label="Call" />
                    <Option value="Meeting" label="Meeting" />
                    <Option value="Email"   label="Email" />
                  </SelectField>
                  <DataField
                    label="Note"
                    id="resched-note"
                    size={12}
                    placeholder="e.g. Lead requested callback next week"
                    value={actionForm.reschedNote}
                    onChange={e => setActionForm(f => ({ ...f, reschedNote: e.target.value }))}
                  />
                </Grid>
              </div>
            )}

            {/* Not Talk → Comment */}
            {actionForm.action === "Not Talk" && (
              <Grid cols={12} gap={3}>
                <DataField
                  label="Reason (Required)"
                  id="not-talk-reason"
                  type="textarea"
                  size={12}
                  rows={4}
                  placeholder="Reason why the lead could not be reached..."
                  value={actionForm.comment}
                  onChange={e => setActionForm(f => ({ ...f, comment: e.target.value }))}
                />
              </Grid>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                text="Cancel"
                variant="secondary"
                size={3}
                onClick={() => closeModal("sm-lead-action-modal")}
              />
              <Button
                text="Save"
                variant="primary"
                size={3}
                disabled={!actionForm.action}
                onClick={handleActionSave}
              />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
