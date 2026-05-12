import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User, Phone, Mail, Building2, MapPin, IndianRupee,
  Calendar, Clock, FileText, UserCheck, Target,
  CheckCircle2, RefreshCw, Activity, Check, PhoneCall,
  Bell, ArrowLeft, TrendingUp, Sparkles, AlertCircle,
} from "lucide-react";
import { DataField, SelectField, Option, Button } from "../../../components/shared/Common_Components";
import DatePicker from "../../../components/shared/DatePicker";

// ─── Shared mock prospects (same source as ProspectList) ─────────────────────
const ALL_PROSPECTS = [
  {
    id: "1", name: "Ravi Sharma", phone: "9876543210", email: "ravi.sharma@example.com",
    company: "Tech Corp India", city: "Mumbai", source: "Website", status: "Interested",
    dealValue: "50000", priority: "High", assignedTo: "John Doe (You)",
    followUpDate: "2026-05-02", followUpTime: "14:30", reminder: true,
    notes: "Very interested in the premium package. Wants a demo next week.",
    lastContactDate: "2026-05-01T10:45:00",
    activities: [
      { id: 1, title: "Status → Interested",  desc: "Positive response to initial pitch.",    date: "Today, 10:45 AM",     icon: TrendingUp,   color: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-200" },
      { id: 2, title: "Outbound Call",         desc: "Spoke 5 mins. Clarified pricing.",       date: "Yesterday, 4:30 PM",  icon: PhoneCall,    color: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-200" },
      { id: 3, title: "Lead Created",          desc: "Acquired from Website form submission.", date: "2 days ago, 9:15 AM", icon: CheckCircle2, color: "text-slate-500",  bg: "bg-slate-50",   border: "border-slate-200" },
    ],
  },
  {
    id: "3", name: "Amit Patel", phone: "9812345670", email: "amit.p@example.com",
    company: "Retail Chain Pvt", city: "Ahmedabad", source: "Facebook", status: "Talk",
    dealValue: "30000", priority: "Low", assignedTo: "John Doe (You)",
    followUpDate: "2026-05-03", followUpTime: "11:30", reminder: false,
    notes: "Initial contact made. Prospect showed mild interest.",
    lastContactDate: "2026-05-07T09:00:00",
    activities: [
      { id: 1, title: "Outbound Call", desc: "Initial contact made. Prospect showed mild interest.", date: "Today, 09:00 AM",     icon: PhoneCall,    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
      { id: 2, title: "Lead Created",  desc: "Lead acquired from Facebook ad.",                      date: "Yesterday, 03:00 PM", icon: CheckCircle2, color: "text-slate-500",   bg: "bg-slate-50",   border: "border-slate-200" },
    ],
  },
  {
    id: "4", name: "Neha Gupta", phone: "9988776655", email: "neha.g@example.com",
    company: "Service Hub", city: "Bangalore", source: "Referral", status: "Not Interested",
    dealValue: "85000", priority: "Low", assignedTo: "John Doe (You)",
    followUpDate: "2026-05-10", followUpTime: "15:00", reminder: false,
    notes: "Prospect declined after pricing discussion.",
    lastContactDate: "2026-05-07T14:00:00",
    activities: [
      { id: 1, title: "Marked Not Interested", desc: "Prospect declined after pricing discussion.", date: "Today, 02:00 PM",      icon: AlertCircle,  color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200"    },
      { id: 2, title: "Outbound Call",         desc: "Discussed pricing. Prospect hesitant.",       date: "Yesterday, 01:00 PM",  icon: PhoneCall,    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
      { id: 3, title: "Lead Created",          desc: "Lead acquired via Referral.",                 date: "2 days ago, 10:00 AM", icon: CheckCircle2, color: "text-slate-500",   bg: "bg-slate-50",   border: "border-slate-200"   },
    ],
  },
  {
    id: "5", name: "Vikram Malhotra", phone: "9876501234", email: "vikram.m@example.com",
    company: "Malhotra Industries", city: "Pune", source: "Website", status: "Talk",
    dealValue: "250000", priority: "High", assignedTo: "John Doe (You)",
    followUpDate: "2026-05-12", followUpTime: "16:00", reminder: true,
    notes: "Long discussion about enterprise package.",
    lastContactDate: "2026-05-07T11:30:00",
    activities: [
      { id: 1, title: "Outbound Call", desc: "Long discussion about enterprise package.", date: "Today, 11:30 AM",     icon: PhoneCall,    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
      { id: 2, title: "Lead Created",  desc: "Lead acquired from Website form.",          date: "Yesterday, 08:00 AM", icon: CheckCircle2, color: "text-slate-500",   bg: "bg-slate-50",   border: "border-slate-200"   },
    ],
  },
  {
    id: "6", name: "Sunita Rao", phone: "9876511111", email: "sunita.r@example.com",
    company: "Rao Enterprises", city: "Chennai", source: "Referral", status: "Won",
    dealValue: "500000", priority: "High", assignedTo: "John Doe (You)",
    followUpDate: "2026-05-01", followUpTime: "10:00", reminder: false,
    notes: "Client signed the contract.",
    lastContactDate: "2026-05-07T10:00:00",
    activities: [
      { id: 1, title: "Deal Won!", desc: "Client signed the contract.", date: "Today, 10:00 AM", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    ],
  },
  {
    id: "7", name: "Rahul Verma", phone: "9876522222", email: "rahul.v@example.com",
    company: "Verma Logistics", city: "Kolkata", source: "Website", status: "Lost",
    dealValue: "75000", priority: "Medium", assignedTo: "John Doe (You)",
    followUpDate: "2026-04-28", followUpTime: "14:00", reminder: false,
    notes: "Went with competitor.",
    lastContactDate: "2026-05-05T14:00:00",
    activities: [
      { id: 1, title: "Deal Lost", desc: "Went with competitor.", date: "2 days ago", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    ],
  },
];

const STATUS_MAP = {
  Talk:             { dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-200"       },
  Interested:       { dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  "Not Interested": { dot: "bg-rose-500",   badge: "bg-rose-50 text-rose-700 border-rose-200"       },
  Won:              { dot: "bg-emerald-500",badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Lost:             { dot: "bg-red-500",    badge: "bg-red-50 text-red-700 border-red-200"          },
};
const PRIORITY_MAP = {
  High:   "bg-rose-50 text-rose-600 border-rose-200",
  Medium: "bg-amber-50 text-amber-600 border-amber-200",
  Low:    "bg-slate-50 text-slate-500 border-slate-200",
};

// ─── Divider with label ───────────────────────────────────────────────────────
const Divider = ({ icon: Icon, color, label }) => (
  <div className="flex items-center gap-3 py-1">
    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={12} className="text-white" />
    </div>
    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{label}</span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

// ─── Modified badge ───────────────────────────────────────────────────────────
const Modified = () => (
  <span className="text-[10px] font-bold text-sky-500 flex items-center gap-1 mt-1">
    <span className="w-1 h-1 rounded-full bg-sky-400 inline-block" /> Modified
  </span>
);

export default function EditProspect() {
  const navigate = useNavigate();
  const { id }   = useParams();

  // Look up the prospect by route param id
  const prospectData = useMemo(() => {
    const found = ALL_PROSPECTS.find(p => String(p.id) === String(id));
    if (!found) return null;
    // Normalise to the shape the form expects
    return {
      fullName:        found.name,
      phone:           found.phone,
      email:           found.email,
      company:         found.company,
      city:            found.city,
      source:          found.source,
      status:          found.status,
      dealValue:       found.dealValue,
      priority:        found.priority,
      assignedTo:      found.assignedTo,
      followUpDate:    found.followUpDate,
      followUpTime:    found.followUpTime,
      reminder:        found.reminder ?? false,
      notes:           found.notes ?? "",
      lastContactDate: found.lastContactDate,
    };
  }, [id]);

  const [orig, setOrig]             = useState(() => prospectData);
  const [form, setForm]             = useState(() => prospectData);
  const [activities, setActivities] = useState(
    () => ALL_PROSPECTS.find(p => String(p.id) === String(id))?.activities ?? []
  );
  const [toast, setToast]           = useState(false);

  // If id changes (unlikely but safe), re-initialise
  const prevId = React.useRef(id);
  if (prevId.current !== id) {
    prevId.current = id;
    const next = ALL_PROSPECTS.find(p => String(p.id) === String(id));
    if (next) {
      const fd = {
        fullName: next.name, phone: next.phone, email: next.email,
        company: next.company, city: next.city, source: next.source,
        status: next.status, dealValue: next.dealValue, priority: next.priority,
        assignedTo: next.assignedTo, followUpDate: next.followUpDate,
        followUpTime: next.followUpTime, reminder: next.reminder ?? false,
        notes: next.notes ?? "", lastContactDate: next.lastContactDate,
      };
      setOrig(fd); setForm(fd); setActivities(next.activities ?? []);
    }
  }

  // Not found guard
  if (!orig) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <p className="text-slate-400 font-semibold">Prospect not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[#2a465a] underline">Go back</button>
      </div>
    );
  }

  const ch     = (k) => form[k] !== orig[k];
  const ring   = (k) => ch(k) ? "ring-2 ring-sky-300/50 border-sky-400" : "";
  const nCh    = Object.keys(form).filter(ch).length;

  const onChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm(p => ({ ...p, [id]: type === "checkbox" ? checked : value }));
  };
  const onSel = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const onSave = () => {
    const next = [...activities];
    let dirty = false;
    if (ch("status")) {
      next.unshift({ id: Date.now(), title: `Status → ${form.status}`, desc: `Was "${orig.status}".`, date: "Just now", icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" });
      dirty = true;
    }
    if (ch("followUpDate") || ch("followUpTime")) {
      next.unshift({ id: Date.now() + 1, title: "Follow-up Rescheduled", desc: `${form.followUpDate} at ${form.followUpTime}.`, date: "Just now", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" });
      dirty = true;
    }
    setActivities(next);
    const saved = { ...form, lastContactDate: dirty ? new Date().toISOString() : form.lastContactDate };
    setOrig(saved); setForm(saved);
    setToast(true); setTimeout(() => setToast(false), 3000);
  };

  const sCfg = STATUS_MAP[form.status]    || STATUS_MAP.Talk;
  const pCfg = PRIORITY_MAP[form.priority] || PRIORITY_MAP.Medium;

  return (
    <div className="max-w-6xl mx-auto space-y-4">

      {/* ── Toast ── */}
      <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-white border border-emerald-200 shadow-2xl px-4 py-3 rounded-2xl transition-all duration-300 ${toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
          <Check size={15} strokeWidth={3} />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1a2e3f]">Saved successfully</p>
          <p className="text-xs text-slate-400">Activity log updated.</p>
        </div>
      </div>

      {/* ── Back link ── */}
      <button onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#1a2e3f] transition-colors group">
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Prospects
      </button>

      {/* ══════════════════════════════════════════════════════════════
          ONE MAIN CARD — everything lives inside this single box
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">

        {/* ── Card header / prospect identity bar ── */}
        <div className="relative bg-gradient-to-r from-[#1a2e3f] via-[#2a465a] to-[#355872] px-6 py-5 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-0 right-28 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white text-lg font-black flex-shrink-0">
                {form.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <h1 className="text-lg font-black text-white leading-tight">{form.fullName}</h1>
                <p className="text-xs text-white/60 mt-0.5">{form.company} · {form.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sCfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />{form.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${pCfg}`}>
                {form.priority} Priority
              </span>
              {nCh > 0 && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-400/20 text-sky-200 border border-sky-400/30">
                  <Sparkles size={10} /> {nCh} unsaved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Card body: two columns ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] divide-y xl:divide-y-0 xl:divide-x divide-slate-100">

          {/* ════ LEFT: form ════ */}
          <div className="p-6 space-y-6">

            {/* Basic Details */}
            <div>
              <Divider icon={User} color="bg-sky-500" label="Basic Details" />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

                <div>
                  <DataField label="Full Name *" id="fullName" icon={User}
                    value={form.fullName} onChange={onChange} size={12} className={ring("fullName")} />
                  {ch("fullName") && <Modified />}
                </div>

                <div className="relative">
                  <DataField label="Phone Number" id="phone" icon={Phone}
                    value={form.phone} readOnly disabled size={12}
                    className="bg-slate-50 cursor-not-allowed opacity-60" />
                  <span className="absolute top-1 right-2 text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full pointer-events-none">
                    Locked
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <DataField label="Email Address" id="email" type="email" icon={Mail}
                    value={form.email} onChange={onChange} size={12} className={ring("email")} />
                  {ch("email") && <Modified />}
                </div>

                <div>
                  <DataField label="Company Name" id="company" icon={Building2}
                    value={form.company} onChange={onChange} size={12} className={ring("company")} />
                  {ch("company") && <Modified />}
                </div>

                <div>
                  <DataField label="City" id="city" icon={MapPin}
                    value={form.city} onChange={onChange} size={12} className={ring("city")} />
                  {ch("city") && <Modified />}
                </div>

              </div>
            </div>

            {/* Lead Details */}
            <div>
              <Divider icon={FileText} color="bg-emerald-500" label="Lead Details" />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

                <div>
                  <SelectField label="Lead Source" id="source" value={form.source}
                    onChange={(e) => onSel("source", e.target.value)} size={12}>
                    <Option value="Website"  label="Website" />
                    <Option value="Facebook" label="Facebook" />
                    <Option value="Referral" label="Referral" />
                    <Option value="LinkedIn" label="LinkedIn" />
                    <Option value="Other"    label="Other" />
                  </SelectField>
                  {ch("source") && <Modified />}
                </div>

                <div>
                  <SelectField label="Status" id="status" value={form.status}
                    onChange={(e) => onSel("status", e.target.value)} size={12} searchable={false}>
                    <Option value="Talk"           label="Talk" />
                    <Option value="Interested"     label="Interested" />
                    <Option value="Won"            label="Won" />
                    <Option value="Lost"           label="Lost" />
                    <Option value="Not Interested" label="Not Interested" />
                  </SelectField>
                  {ch("status") && <Modified />}
                </div>

                <div className="relative">
                  <DataField label="Deal Value (₹)" id="dealValue" type="number" icon={IndianRupee}
                    value={form.status === "Interested" ? form.dealValue : ""} onChange={onChange} size={12} 
                    className={form.status !== "Interested" ? "bg-slate-50 cursor-not-allowed opacity-60" : ring("dealValue")}
                    readOnly={form.status !== "Interested"} disabled={form.status !== "Interested"} />
                  {form.status !== "Interested" && (
                    <span className="absolute top-1 right-2 text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full pointer-events-none">
                      Locked
                    </span>
                  )}
                  {form.status === "Interested" && ch("dealValue") && <Modified />}
                </div>

                <div>
                  <SelectField label="Priority" id="priority" value={form.priority}
                    onChange={(e) => onSel("priority", e.target.value)} size={12} searchable={false}>
                    <Option value="High"   label="High" />
                    <Option value="Medium" label="Medium" />
                    <Option value="Low"    label="Low" />
                  </SelectField>
                  {ch("priority") && <Modified />}
                </div>

                <div className="sm:col-span-2">
                  <DataField label="Assigned To" id="assignedTo" icon={UserCheck}
                    value={form.assignedTo} readOnly disabled size={12}
                    className="bg-slate-50 cursor-not-allowed opacity-60" />
                </div>

              </div>
            </div>

            {/* Follow-up & Notes */}
            <div>
              <Divider icon={Calendar} color="bg-amber-500" label="Follow-up & Notes" />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

                <div>
                  <DatePicker label="Follow-up Date" id="followUpDate"
                    value={form.followUpDate} onChange={val => onSel("followUpDate", val)} />
                  {ch("followUpDate") && <Modified />}
                </div>

                <div>
                  <DataField label="Follow-up Time" id="followUpTime" type="time" icon={Clock}
                    value={form.followUpTime} onChange={onChange} size={12} className={ring("followUpTime")} />
                  {ch("followUpTime") && <Modified />}
                </div>

                {/* Reminder */}
                <div className="sm:col-span-2">
                  <label className={`flex items-center gap-4 px-4 py-3 rounded-xl border-2 cursor-pointer select-none transition-all ${form.reminder ? "bg-[#1a2e3f]/5 border-[#1a2e3f]/20" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}>
                    <div className="relative flex-shrink-0">
                      <input type="checkbox" id="reminder" className="sr-only peer"
                        checked={form.reminder} onChange={onChange} />
                      <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-[#1a2e3f] transition-colors duration-200" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
                    </div>
                    <Bell size={15} className={`flex-shrink-0 ${form.reminder ? "text-[#1a2e3f]" : "text-slate-400"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1a2e3f]">Set Reminder</p>
                      <p className="text-xs text-slate-400">Get notified before the follow-up time</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${form.reminder ? "bg-[#1a2e3f] text-white" : "bg-slate-200 text-slate-500"}`}>
                      {form.reminder ? "ON" : "OFF"}
                    </span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <DataField label="Internal Notes" id="notes" type="textarea" rows={3}
                    value={form.notes} onChange={onChange} size={12} className={ring("notes")} />
                  {ch("notes") && <Modified />}
                </div>

              </div>
            </div>

          </div>

          {/* ════ RIGHT: activity panel ════ */}
          <div className="flex flex-col">

            {/* Activity header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity size={13} className="text-[#1a2e3f]" />
                <span className="text-xs font-bold text-[#1a2e3f] uppercase tracking-widest">Activity</span>
              </div>
              <button
                onClick={() => {
                  setActivities(p => [{
                    id: Date.now(), title: "Outbound Call Logged",
                    desc: "Connected with the prospect.", date: "Just now",
                    icon: PhoneCall, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
                  }, ...p]);
                  onSel("status", "Talk");
                  setToast(true); setTimeout(() => setToast(false), 3000);
                }}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg transition-colors"
              >
                <PhoneCall size={10} /> Log Call
              </button>
            </div>

            {/* Last contact */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-white">
              <Clock size={11} className="text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-500">Last: <span className="font-semibold text-[#1a2e3f]">Today, 10:45 AM</span></span>
            </div>

            {/* Timeline */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[480px] xl:max-h-none">
              {activities.map((act, idx) => {
                const Icon = act.icon;
                const isLast = idx === activities.length - 1;
                return (
                  <div key={act.id} className="flex gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0 ${act.bg} ${act.color} ${act.border}`}>
                        <Icon size={12} strokeWidth={2.5} />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-slate-200 my-1 min-h-[12px]" />}
                    </div>
                    <div className="pb-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-bold text-[#1a2e3f] leading-snug">{act.title}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 ml-1">{act.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* ── Card footer / action bar ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <p className="text-xs text-slate-400">
            {nCh > 0
              ? <span className="text-sky-500 font-semibold">{nCh} field{nCh > 1 ? "s" : ""} modified</span>
              : <span>No unsaved changes</span>}
          </p>
          <div className="flex items-center gap-3">
            <Button text="Cancel" variant="secondary" onClick={() => navigate(-1)} />
            <Button
              text={nCh > 0 ? `Save Changes (${nCh})` : "Save Changes"}
              variant="primary"
              onClick={onSave}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
