import { useState } from "react";
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Clock,
  Mic,
  MicOff,
  Pause,
  Play,
  X,
  RotateCcw,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard,
  PanelModal as Modal,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components";

// ── Mock recent calls ──
const recentCalls = [
  { id: 1, name: "Arun Kapoor", mobile: "9812345678", duration: "4:32", status: "connected", time: "10 min ago", avatar: "AK" },
  { id: 2, name: "Priya Mehta", mobile: "9823456789", duration: "—", status: "missed", time: "25 min ago", avatar: "PM" },
  { id: 3, name: "Vikash Sharma", mobile: "9834567890", duration: "8:15", status: "connected", time: "1 hr ago", avatar: "VS" },
  { id: 4, name: "Ritu Desai", mobile: "9845678901", duration: "2:45", status: "connected", time: "1.5 hr ago", avatar: "RD" },
  { id: 5, name: "Rohan Gupta", mobile: "9890123456", duration: "—", status: "missed", time: "2 hr ago", avatar: "RG" },
  { id: 6, name: "Sanya Patel", mobile: "9801234567", duration: "6:10", status: "connected", time: "2.5 hr ago", avatar: "SP" },
  { id: 7, name: "Deepak Rao", mobile: "9878901234", duration: "1:20", status: "connected", time: "3 hr ago", avatar: "DR" },
  { id: 8, name: "Ananya Nair", mobile: "9889012345", duration: "—", status: "missed", time: "3.5 hr ago", avatar: "AN" },
];

// ── Dial pad keys ──
const dialPadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

// ── Filter options ──
const filterOptions = ["Today", "Week", "Month"];
const statusFilters = ["All", "Connected", "Missed"];

export default function CallPanel() {
  const [dialNumber, setDialNumber] = useState("");
  const [activeCall, setActiveCall] = useState(null);
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [periodFilter, setPeriodFilter] = useState("Today");
  const [statusFilter, setStatusFilter] = useState("All");

  // Stats
  const callsToday = recentCalls.length;
  const connected = recentCalls.filter((c) => c.status === "connected").length;
  const missed = recentCalls.filter((c) => c.status === "missed").length;

  const handleDialKey = (key) => {
    setDialNumber((prev) => prev + key);
  };

  const handleCall = () => {
    if (!dialNumber) return;
    const event = new CustomEvent("open-global-call", { detail: { name: "Unknown", mobile: dialNumber } });
    window.dispatchEvent(event);
  };

  const handleCallBack = (call) => {
    setDialNumber(call.mobile);
    const event = new CustomEvent("open-global-call", { detail: { name: call.name, mobile: call.mobile } });
    window.dispatchEvent(event);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const filteredCalls = recentCalls.filter((c) => {
    if (statusFilter === "All") return true;
    return statusFilter === "Connected" ? c.status === "connected" : c.status === "missed";
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#2a465a]">Call Panel</h2>
        <p className="text-sm text-slate-500 mt-0.5">Make calls and track call activity</p>
      </div>

      {/* Stat Cards */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Calls Today" value={String(callsToday)} icon={<Phone size={22} />} accentColor="#38bdf8" size={3} />
        <EnhancedDashCard title="Connected" value={String(connected)} icon={<PhoneCall size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Missed" value={String(missed)} icon={<PhoneMissed size={22} />} accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Total Talk Time" value="42:38" icon={<Clock size={22} />} accentColor="#f59e0b" size={3} />
      </DashGrid>

      {/* Main Content: Dialer + Recent Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dialer (Left) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#2a465a] mb-5">Dialer</h3>

          {/* Number display */}
          <div className="relative mb-6">
            <input
              type="tel"
              value={dialNumber}
              onChange={(e) => setDialNumber(e.target.value)}
              placeholder="Enter number"
              className="w-full text-center text-3xl font-black tracking-widest text-[#2a465a] py-6 px-4 rounded-2xl border border-slate-200 bg-slate-50/90 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition focus:bg-white"
            />
            {dialNumber && (
              <button onClick={() => setDialNumber((prev) => prev.slice(0, -1))} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Dial Pad */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {dialPadKeys.map((key) => (
              <button
                key={key}
                onClick={() => handleDialKey(key)}
                className="h-16 rounded-2xl bg-slate-50 border border-slate-200/60 text-xl font-bold text-[#2a465a] hover:bg-[#2a465a] hover:text-white hover:border-[#2a465a] transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
              >
                {key}
              </button>
            ))}
          </div>

          {/* Call button */}
          <button
            onClick={handleCall}
            className="w-full py-5 rounded-2xl bg-emerald-500 text-white text-base font-black flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-0.5 transition active:scale-95"
          >
            <Phone size={20} fill="currentColor" /> Place Call
          </button>

          {/* Recent dialed */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Dial</p>
            <div className="space-y-3">
              {recentCalls.slice(0, 3).map((c) => (
                <button key={c.id} onClick={() => setDialNumber(c.mobile)} className="w-full flex items-center gap-4 rounded-xl p-3 text-left hover:bg-slate-50 border border-transparent hover:border-slate-100 transition duration-200">
                  <div className="w-10 h-10 rounded-xl bg-[#2a465a] flex items-center justify-center text-white text-xs font-black shadow-md">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#2a465a]">{c.name}</p>
                    <p className="text-[11px] font-bold text-slate-500 tracking-wider">{c.mobile}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Calls (Right) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#2a465a]">Call History</h3>
              <p className="text-xs text-slate-500 font-medium">Review your recent dial activity</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                {filterOptions.map((f) => (
                  <button key={f} onClick={() => setPeriodFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 ${periodFilter === f ? "bg-[#2a465a] text-white shadow-sm" : "text-slate-500 hover:text-[#2a465a]"}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {filteredCalls.map((call) => (
              <div key={call.id} className="flex items-center gap-4 rounded-2xl p-4 border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-200/60 hover:shadow-md transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#2a465a] text-sm font-black shadow-sm flex-shrink-0">{call.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-[#2a465a]">{call.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-500 tracking-wider">{call.mobile}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-[11px] font-bold text-slate-400">{call.time}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <div className={`flex items-center gap-2 py-1 px-2.5 rounded-lg border ${call.status === "connected" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"}`}>
                    {call.status === "connected" ? <PhoneCall size={12} /> : <PhoneMissed size={12} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{call.duration === "—" ? "Missed" : call.duration}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleCallBack(call)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black bg-[#2a465a] text-white hover:bg-[#1e3a52] transition-all active:scale-95 flex-shrink-0 shadow-lg shadow-[#2a465a]/20"
                >
                  <RotateCcw size={12} /> Dial
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
