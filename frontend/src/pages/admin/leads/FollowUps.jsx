import { useState } from "react";
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
  Grid
} from "../../../components/shared/Common_Components";

// ── Mock follow-ups ──
const mockFollowups = [
  { id: 1, leadName: "Vikash Sharma", time: "10:00 AM", type: "Call", status: "pending", notes: "Discuss pricing for premium plan" },
  { id: 2, leadName: "Ritu Desai", time: "11:30 AM", type: "Email", status: "pending", notes: "Send revised proposal" },
  { id: 3, leadName: "Rohan Gupta", time: "2:00 PM", type: "Meeting", status: "pending", notes: "Product demo at their office" },
  { id: 4, leadName: "Sanya Patel", time: "3:30 PM", type: "Call", status: "pending", notes: "Follow up on sent quotation" },
  { id: 5, leadName: "Arjun Malhotra", time: "4:00 PM", type: "Email", status: "done", notes: "Contract terms discussion" },
];

const overdueFollowups = [
  { id: 6, leadName: "Deepak Rao", time: "Yesterday 2:00 PM", type: "Call", status: "overdue", notes: "Was supposed to call back" },
  { id: 7, leadName: "Ananya Nair", time: "Apr 19 11:00 AM", type: "Meeting", status: "overdue", notes: "Demo rescheduled but not confirmed" },
];

// ── Calendar helper ──
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const typeIcons = { Call: Phone, Email: Mail, Meeting: UsersIcon };
const typeColors = { Call: "#3b82f6", Email: "#8b5cf6", Meeting: "#f59e0b" };

export default function FollowUps() {
  const [followups, setFollowups] = useState([...overdueFollowups, ...mockFollowups]);
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [filterOwner, setFilterOwner] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const todayCount = mockFollowups.filter((f) => f.status === "pending").length;
  const overdueCount = overdueFollowups.length;
  const thisWeekCount = todayCount + 3;
  const completedCount = followups.filter((f) => f.status === "done").length;

  const monthName = new Date(calYear, calMonth).toLocaleString("default", { month: "long" });
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  // Calendar dots data (random for demo)
  const calendarDots = {};
  [3, 7, 8, 12, 15, 18, 21, 22, 25, 28].forEach((d) => {
    calendarDots[d] = Math.floor(Math.random() * 4) + 1;
  });
  calendarDots[now.getDate()] = todayCount;

  const handleMarkDone = (id) => {
    setFollowups((prev) => prev.map((f) => f.id === id ? { ...f, status: "done" } : f));
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const pendingFollowups = followups.filter((f) => f.status !== "done");
  const filteredFollowups = pendingFollowups.filter((f) => {
    const matchType = filterType === "All" || f.type === filterType;
    return matchType;
  });

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">Follow-ups</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage all scheduled follow-ups</p>
        </div>
        <button
          onClick={() => openModal("add-followup-modal")}
          className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-[#2a465a] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#2a465a]/20 transition hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 w-max"
        >
          <Plus size={14} /> Add Follow-up
        </button>
      </div>

      {/* Stat Cards */}
      <DashGrid cols={12} gap={4}>
        <DashCard title="Today" value={String(todayCount)} icon={<CalendarClock size={22} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Overdue" value={String(overdueCount)} icon={<AlertTriangle size={22} />} accentColor="#f43f5e" size={3} />
        <DashCard title="This Week" value={String(thisWeekCount)} icon={<Calendar size={22} />} accentColor="#14b8a6" size={3} />
        <DashCard title="Completed" value={String(completedCount)} icon={<CheckCircle2 size={22} />} accentColor="#22c55e" size={3} />
      </DashGrid>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type:</span>
        {["All", "Call", "Email", "Meeting"].map((t) => (
          <button key={t} onClick={() => setFilterType(t)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${filterType === t ? "bg-[#2a465a] text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{t}</button>
        ))}
      </div>

      {/* Calendar + Today's List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Calendar */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6 min-w-[300px]">
             <button onClick={prevMonth} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#2a465a] transition shadow-sm">&lt;</button>
            <h3 className="text-lg font-bold text-[#2a465a]">{monthName} {calYear}</h3>
            <button onClick={nextMonth} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#2a465a] transition shadow-sm">&gt;</button>
          </div>

          <div className="min-w-[300px]">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">{d}</div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
                const dots = calendarDots[day] || 0;
                return (
                  <div key={day} className={`aspect-square relative flex flex-col items-center justify-center rounded-2xl py-2.5 text-sm font-medium transition-all cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 hover:shadow-sm ${isToday ? "bg-gradient-to-br from-[#2a465a] to-[#1e3a52] text-white hover:opacity-90 shadow-md border-none" : "text-slate-600 bg-slate-50/50"}`}>
                    <span className="font-bold">{day}</span>
                    {dots > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: Math.min(dots, 3) }).map((_, di) => (
                          <div key={di} className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-white/90" : "bg-[#3b82f6]"}`} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Today's Follow-ups List */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6 shadow-sm overflow-hidden flex flex-col max-h-[600px] w-full">
          <h3 className="text-lg font-bold text-[#2a465a] mb-5 shrink-0 flex items-center justify-between">
            Today's Follow-ups
            <span className="text-xs bg-[#2a465a]/10 text-[#2a465a] px-3 py-1 rounded-full">{filteredFollowups.length} scheduled</span>
          </h3>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {filteredFollowups.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <CheckCircle2 size={48} className="text-emerald-300 mx-auto mb-4 drop-shadow-md" />
                <p className="text-base font-bold text-slate-500">All caught up!</p>
                <p className="text-sm text-slate-400 mt-1">No follow-ups remaining for today.</p>
              </div>
            ) : (
              filteredFollowups.map((f) => {
                const Icon = typeIcons[f.type] || Phone;
                const color = typeColors[f.type] || "#3b82f6";
                const isOverdue = f.status === "overdue";
                return (
                  <div key={f.id} className={`rounded-2xl border p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${isOverdue ? "border-rose-200 bg-rose-50 shadow-sm" : "border-slate-200 bg-white shadow-sm"}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100" style={{ backgroundColor: `${color}15`, color }}><Icon size={18} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-base font-bold text-[#2a465a] truncate pr-2">{f.leadName}</p>
                          {isOverdue && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600 uppercase tracking-widest shadow-sm">Overdue</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-1 mb-2 bg-slate-50 w-max px-2 py-1 rounded-lg border border-slate-100">
                          <Clock size={12} className="text-slate-400" /> {f.time} <span className="text-slate-300">&bull;</span> {f.type}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{f.notes}</p>
                      </div>
                    </div>
                    {f.status !== "done" && (
                      <div className="flex gap-2 mt-4 ml-14">
                        <button onClick={() => handleMarkDone(f.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2a465a] text-white hover:bg-[#1e3a52] transition active:scale-95 shadow-md shadow-[#2a465a]/20">
                          <CheckCircle2 size={14} /> Mark Done
                        </button>
                        <button onClick={() => openModal("reschedule-modal")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition active:scale-95 shadow-sm">
                          <RotateCcw size={14} /> Reschedule
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Follow-up Modal */}
      <Modal id="add-followup-modal" title="Add New Follow-up">
        <div className="space-y-5">
          <Grid cols={12} gap={4}>
            <SelectField label="Select Lead" id="new-flw-lead" size={12} placeholder="Search lead...">
              {mockFollowups.map((m) => <Option key={m.id} value={m.id} label={m.leadName} />)}
            </SelectField>
            <DataField label="Date" id="new-flw-date" type="date" size={6} />
            <DataField label="Time" id="new-flw-time" type="time" size={6} />
            <SelectField label="Type" id="new-flw-type" size={12} placeholder="Select type">
              <Option value="call" label="Call" />
              <Option value="email" label="Email" />
              <Option value="meeting" label="Meeting" />
            </SelectField>
            <div className="col-span-12">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Notes / Agenda</label>
              <textarea placeholder="Write brief notes here..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 resize-none h-28 focus:bg-white transition-colors" />
            </div>
          </Grid>
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
            <button onClick={() => closeModal("add-followup-modal")} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={() => { closeModal("add-followup-modal"); alert("Follow-up Added!"); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] hover:bg-[#1e3a52] transition active:scale-95 shadow-lg shadow-[#2a465a]/20">Save Follow-up</button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal id="reschedule-modal" title="Reschedule Follow-up">
        <div className="space-y-5">
          <p className="text-sm font-medium text-slate-500 mb-2">Select a new date and time for this follow-up via the inputs below.</p>
          <Grid cols={12} gap={4}>
            <DataField label="New Date" id="resch-date" type="date" size={6} />
            <DataField label="New Time" id="resch-time" type="time" size={6} />
            <div className="col-span-12">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Reason / Note (Optional)</label>
              <input type="text" placeholder="e.g. Lead was busy" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:bg-white transition-colors" />
            </div>
          </Grid>
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
            <button onClick={() => closeModal("reschedule-modal")} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={() => { closeModal("reschedule-modal"); alert("Successfully Rescheduled!"); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-500/20">Confirm Delay</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
