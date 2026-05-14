import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Grid,
  GPieChart, GColumnChart,
  Modal, ModalGrid, ModalData, Button,
  openModal, closeModal
} from '../../../../components/shared/Common_Components';
import {
  BellRing, MailWarning, AlertCircle, ListTodo,
  Eye, Bell, CheckCircle2, Trash2,
  PlusCircle, BookCheck, Settings2,
} from "lucide-react";
import {
  kpiNotifications, notificationRows,
  NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES, NOTIFICATION_STATUS,
  alertItems, reminderRows, activityRows,
  notificationTypeData, employeeNotificationData,
} from "./notificationsStore";

const KPI_ICONS = [<BellRing size={20} />, <MailWarning size={20} />, <AlertCircle size={20} />, <ListTodo size={20} />];

// ── Frequency badge colors ────────────────────────────────────────────────────
const FREQ_BADGE = {
  Daily:   "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Weekly:  "bg-blue-100 text-blue-700 border border-blue-200",
  Monthly: "bg-purple-100 text-purple-700 border border-purple-200",
  None:    "bg-slate-100 text-slate-500 border border-slate-200",
};

// ── Type badge colors ─────────────────────────────────────────────────────────
const TYPE_BADGE = {
  Automatic: "bg-amber-100 text-amber-700 border border-amber-200",
  Scheduled: "bg-indigo-100 text-indigo-700 border border-indigo-200",
};

const COLS = [
  { key: "type",         label: "Type"          },
  { key: "priority",     label: "Priority"      },
  { key: "subject",      label: "Subject"       },
  { key: "employeeName", label: "Employee Name" },
  { key: "projectName",  label: "Project Name"  },
  { key: "date",         label: "Date & Time"   },
  { key: "status",       label: "Status"        },
];

const REMINDER_COLS = [
  { key: "reminder",  label: "Reminder"   },
  { key: "relatedTo", label: "Related To" },
  { key: "time",      label: "Time"       },
  { key: "repeat",    label: "Frequency"  },
  { key: "type",      label: "Type"       },
];

// ── Icon button with portal tooltip ──────────────────────────────────────────
function IconBtn({ icon, tooltip, onClick, colorCls = "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100" }) {
  const [tipPos, setTipPos] = useState(null);
  const ref = useRef(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTipPos({ top: r.top - 8, left: r.left + r.width / 2 });
  };
  return (
    <div className="relative">
      <button ref={ref} type="button" onClick={onClick}
        onMouseEnter={show} onMouseLeave={() => setTipPos(null)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${colorCls}`}>
        {icon}
      </button>
      {tipPos && createPortal(
        <div className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-full"
          style={{ top: tipPos.top, left: tipPos.left }}>
          <div className="bg-[#1e293b] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            {tooltip}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
        </div>,
        document.body
      )}
    </div>
  );
}

const CustomToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    <button type="button" onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#2a465a]' : 'bg-slate-200'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const FREQ_OPTIONS = ["Instant", "Hourly", "Daily"];

export default function NotificationsPage() {
  const [rows, setRows]         = useState(notificationRows);
  const [selected, setSelected] = useState(null);
  const [alertModal, setAlertModal] = useState({ type: "", title: "", body: "" });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications:  true,
    reminderFrequency:  "Instant",
  });

  const markAsRead = (id) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: "Read" } : r));

  const deleteNotification = (id) =>
    setRows(prev => prev.filter(r => r.id !== id));

  const toggleSetting = (key) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const handleAlertAction = (actionLabel, alert) => {
    const map = {
      "View Project":  { type: "project",  title: "Project Details",  body: `Alert: ${alert.message}\nType: ${alert.type}\nPriority: ${alert.priority}` },
      "View Ticket":   { type: "ticket",   title: "Support Ticket",   body: `Issue: ${alert.message}\nPriority: ${alert.priority}\nStatus: Open` },
      "View Profile":  { type: "profile",  title: "Employee Profile", body: `Alert: ${alert.message}\nAction Required: Follow up with the employee regarding their absence.` },
      "Reassign Task": { type: "reassign", title: "Reassign Task",    body: `Task from: ${alert.message}\nSelect a team member to reassign this task to.` },
      "Send Reminder": { type: "reminder", title: "Send Reminder",    body: `Reminder for: ${alert.message}\nA reminder will be sent to the relevant team member.` },
    };
    const cfg = map[actionLabel];
    if (cfg) { setAlertModal(cfg); openModal("mtl-alert-action-modal"); }
  };

  // Map reminder rows to inject badge-styled display values
  const styledReminderRows = reminderRows.map(r => ({
    ...r,
    // Override repeat & type with badge-wrapped text — DataTable renders raw string,
    // so we use a workaround: store the value as-is and rely on STATUS_MAP additions
    // (Daily/Weekly/Automatic/Scheduled added to STATUS_MAP in Common_Components)
  }));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* KPI cards */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Notification Hub" size={12} />
        {kpiNotifications.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={k.accent} size={3} />
        ))}
      </DashGrid>

      {/* ── Important Alerts ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {alertItems.map((alert) => {
          const isHigh = alert.priority === "High";
          const isMed  = alert.priority === "Medium";
          const strip   = isHigh ? "bg-rose-500"   : isMed ? "bg-amber-400"  : "bg-blue-500";
          const iconBg  = isHigh ? "bg-rose-100"   : isMed ? "bg-amber-100"  : "bg-blue-100";
          const iconClr = isHigh ? "text-rose-600" : isMed ? "text-amber-600": "text-blue-600";
          const label   = isHigh ? "text-rose-600" : isMed ? "text-amber-600": "text-blue-600";
          const badge   = isHigh ? "bg-rose-100 text-rose-700 border-rose-200"
                        : isMed  ? "bg-amber-100 text-amber-700 border-amber-200"
                        :          "bg-blue-100 text-blue-700 border-blue-200";
          const btn1Bg  = isHigh ? "bg-rose-600 hover:bg-rose-700"
                        : isMed  ? "bg-amber-500 hover:bg-amber-600"
                        :          "bg-blue-600 hover:bg-blue-700";
          // All secondary (action2) buttons use the same neutral outline style — white bg, slate border
          const btn2Cls = "border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400";
          return (
            <div key={alert.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              <div className={`h-1.5 w-full ${strip}`} />
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconClr}`}>
                    <AlertCircle size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${label}`}>{alert.type}</p>
                    <p className="text-sm font-bold text-[#1a2e3f] leading-snug">{alert.message}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${badge}`}>
                    {alert.priority}
                  </span>
                </div>
                <div className="border-t border-slate-100" />
                <div className="flex gap-2">
                  <button onClick={() => handleAlertAction(alert.action1, alert)}
                    className={`flex-1 h-14 px-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all active:scale-95 leading-tight text-center ${btn1Bg}`}>
                    {alert.action1.replace(" ", "\n")}
                  </button>
                  <button onClick={() => handleAlertAction(alert.action2, alert)}
                    className={`flex-1 h-14 px-2 rounded-xl border text-xs font-bold transition-all active:scale-95 bg-white leading-tight text-center whitespace-pre-line ${btn2Cls}`}>
                    {alert.action2.replace(" ", "\n")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Scheduled Reminders ──────────────────────────────────────────────── */}
      {/* repeat & type columns use STATUS_MAP badge rendering via key names added to Common_Components */}
      <DataTable
        title="Automated Reminders"
        columns={REMINDER_COLS}
        rows={reminderRows.map(r => ({
          ...r,
          // Rename keys so DataTable's status-badge logic fires on them
          repeat: r.repeat,
          type:   r.type,
        }))}
        size={12}
        pageSize={5}
        searchable
        filters={[
          { title: "Frequency", type: "toggle", key: "repeat", options: ["Daily", "Weekly", "None"] },
          { title: "Type",      type: "toggle", key: "type",   options: ["Automatic", "Scheduled"] },
        ]}
      />

      {/* ── Recent Activity ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-black text-[#2a465a] tracking-tight px-1">Recent Activity Updates</h3>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative pl-10">
          <div className="absolute top-8 bottom-8 left-6 w-[2px] bg-slate-100 rounded-full" />
          <div className="flex flex-col gap-8">
            {activityRows.map((act) => (
              <div key={act.id} className="relative group">
                <div className="absolute -left-[27px] top-1 w-[18px] h-[18px] rounded-full bg-white border-4 border-indigo-500 shadow-sm group-hover:scale-125 transition-transform duration-300" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{act.activity}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-slate-500">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                      act.type.toLowerCase() === "task"   ? "bg-blue-100 text-blue-700"
                    : act.type.toLowerCase() === "update" ? "bg-amber-100 text-amber-700"
                    : act.type.toLowerCase() === "hr"     ? "bg-emerald-100 text-emerald-700"
                    : act.type.toLowerCase() === "ticket" ? "bg-rose-100 text-rose-700"
                    : "bg-slate-100 text-slate-700"
                    }`}>{act.type}</span>
                    <span>•</span><span>{act.time}</span><span>•</span><span>by {act.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Analytics ────────────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <GPieChart
          title="Notification Types" subtitle="Distribution by category"
          data={notificationTypeData} colors={["#f43f5e", "#f59e0b", "#3b82f6"]}
          size={4} height={320}
        />
        <GColumnChart
          title="Employee Notification Analysis" subtitle="Alerts vs Reminders per employee"
          data={employeeNotificationData}
          bars={[
            { key: "alerts",    label: "Alerts",    color: "#f43f5e" },
            { key: "reminders", label: "Reminders", color: "#3b82f6" },
          ]}
          size={8} height={320}
        />
      </Grid>

      {/* ── Icon action bar (3 icon buttons with tooltips) ────────────────────── */}
      <div className="flex items-center justify-end gap-2">
        <IconBtn
          icon={<PlusCircle size={18} />}
          tooltip="Create Reminder"
          onClick={() => openModal("mtl-notifications-create-reminder")}
          colorCls="text-white bg-[#2a465a] hover:bg-[#1e3a52] border border-[#1e3a52] shadow-md"
        />
        <IconBtn
          icon={<BookCheck size={18} />}
          tooltip="Mark All as Read"
          onClick={() => setRows(prev => prev.map(r => ({...r, status: "Read"})))}
          colorCls="text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 shadow-md"
        />
        <IconBtn
          icon={<Settings2 size={18} />}
          tooltip="Notification Settings"
          onClick={() => openModal("mtl-notifications-settings")}
          colorCls="text-white bg-slate-500 hover:bg-slate-600 border border-slate-600 shadow-md"
        />
      </div>

      {/* ── All Notifications Table ───────────────────────────────────────────── */}
      <DataTable
        title="All Notifications"
        columns={COLS}
        rows={rows}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="notifications_log"
        filters={[
          { title: "Employee Name",     type: "text",   key: "employeeName" },
          { title: "Project Name",      type: "text",   key: "projectName"  },
          { title: "Notification Type", type: "select", key: "type",     options: NOTIFICATION_TYPES },
          { title: "Status",            type: "toggle", key: "status",   options: NOTIFICATION_STATUS },
          { title: "Priority",          type: "select", key: "priority", options: NOTIFICATION_PRIORITIES },
          {
            title: "Date Filter", type: "select", key: "dateFilter",
            options: ["Today", "This Week", "This Month"],
            fn: (row, value) => {
              if (!row.date) return false;
              const today = new Date(); today.setHours(0,0,0,0);
              const rDate = new Date(row.date); rDate.setHours(0,0,0,0);
              if (value === "Today")      return rDate.getTime() === today.getTime();
              if (value === "This Week")  { const w = new Date(today); w.setDate(today.getDate()-7); return rDate >= w && rDate <= today; }
              if (value === "This Month") return rDate.getMonth() === today.getMonth() && rDate.getFullYear() === today.getFullYear();
              return true;
            },
          },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View Details", variant: "ghost",
            onClick: (row) => {
              setSelected(rows.find((r) => r.id === row.id) ?? row);
              if (row.status === "Unread") markAsRead(row.id);
              openModal("mtl-notifications-view");
            },
          },
          {
            icon: <CheckCircle2 size={15} />, tooltip: "Mark as Read", variant: "primary",
            show: (row) => row.status !== "Read",
            onClick: (row) => markAsRead(row.id),
          },
          {
            icon: <Trash2 size={15} />, tooltip: "Delete", variant: "ghost",
            onClick: (row) => deleteNotification(row.id),
          },
        ]}
      />

      {/* ── Notification Detail Modal ─────────────────────────────────────────── */}
      <Modal id="mtl-notifications-view" title="Notification Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold ${
              selected.priority === "High"   ? "bg-rose-50 border-rose-200 text-rose-700"
            : selected.priority === "Medium" ? "bg-amber-50 border-amber-200 text-amber-700"
            :                                   "bg-blue-50 border-blue-200 text-blue-700"
            }`}>
              <Bell size={18} className="shrink-0" />
              <div>
                <span className="text-xs font-black uppercase tracking-widest block opacity-70">{selected.priority} Priority</span>
                <span>{selected.subject}</span>
              </div>
            </div>
            <ModalGrid title="Notification Info" cols={2}>
              <ModalData label="Subject"         value={selected.subject} />
              <ModalData label="Type"            value={selected.type} />
              <ModalData label="Priority"        value={selected.priority} />
              <ModalData label="Status"          value={selected.status} />
              <ModalData label="Date & Time"     value={selected.date} />
              <ModalData label="Notification ID" value={selected.id} />
            </ModalGrid>
            <ModalGrid title="Related Info" cols={2}>
              <ModalData label="Employee" value={selected.employeeName} />
              <ModalData label="Project"  value={selected.projectName} />
            </ModalGrid>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {selected.status !== "Read" && (
                <Button text="Mark as Read" variant="secondary" size={4}
                  onClick={() => { markAsRead(selected.id); setSelected(s => ({...s, status: "Read"})); }} />
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mtl-notifications-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Alert Action Modal ────────────────────────────────────────────────── */}
      <Modal id="mtl-alert-action-modal" title={alertModal.title} size="md">
        <div className="flex flex-col gap-4">
          <div className={`px-4 py-3 rounded-2xl border text-sm ${
            alertModal.type === "project"  ? "bg-rose-50 border-rose-200 text-rose-700"
          : alertModal.type === "ticket"   ? "bg-rose-50 border-rose-200 text-rose-700"
          : alertModal.type === "profile"  ? "bg-blue-50 border-blue-200 text-blue-700"
          : alertModal.type === "reassign" ? "bg-amber-50 border-amber-200 text-amber-700"
          :                                   "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}>
            {alertModal.body.split("\n").map((line, i) => (
              <p key={i} className="font-semibold">{line}</p>
            ))}
          </div>
          {alertModal.type === "reassign" && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assign To</label>
              <select className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20">
                <option>Karan Malhotra</option>
                <option>Divya Iyer</option>
                <option>Tushar Rao</option>
                <option>Yash Chauhan</option>
              </select>
            </div>
          )}
          {alertModal.type === "reminder" && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message (optional)</label>
              <textarea rows={3} placeholder="Add a note to the reminder..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 resize-none" />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("mtl-alert-action-modal")} />
            <Button
              text={alertModal.type === "reassign" ? "Confirm Reassign" : alertModal.type === "reminder" ? "Send Reminder" : "Close"}
              variant="primary" size={4}
              onClick={() => closeModal("mtl-alert-action-modal")}
            />
          </div>
        </div>
      </Modal>

      {/* ── Notification Settings Modal ───────────────────────────────────────── */}
      <Modal id="mtl-notifications-settings" title="Notification Preferences" size="md">
        <div className="flex flex-col gap-6">

          {/* Enable/Disable — only Email + Push (System Alerts removed) */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Enable / Disable</h4>
            <div className="flex flex-col gap-2">
              <CustomToggle label="Email Notifications" checked={settings.emailNotifications} onChange={() => toggleSetting('emailNotifications')} />
              <CustomToggle label="Push Notifications"  checked={settings.pushNotifications}  onChange={() => toggleSetting('pushNotifications')} />
            </div>
          </div>

          {/* Reminder Frequency — horizontal pill buttons, no scrollbar */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Reminder Frequency</h4>
            <div className="flex items-center gap-2">
              {FREQ_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, reminderFrequency: opt }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    settings.reminderFrequency === opt
                      ? "bg-[#2a465a] text-white border-[#2a465a] shadow"
                      : "bg-white text-slate-500 border-slate-200 hover:border-[#2a465a]/40 hover:text-[#2a465a]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button text="Cancel"       variant="ghost"   size={3} onClick={() => closeModal("mtl-notifications-settings")} />
            <Button text="Save Changes" variant="primary" size={3} onClick={() => closeModal("mtl-notifications-settings")} />
          </div>
        </div>
      </Modal>

      {/* ── Create Reminder Modal ─────────────────────────────────────────────── */}
      <Modal id="mtl-notifications-create-reminder" title="Create New Reminder" size="md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reminder Subject</label>
            <input type="text" placeholder="e.g. Follow up with client"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</label>
            <input type="time"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frequency</label>
            <div className="flex items-center gap-2">
              {["None", "Daily", "Weekly"].map((opt) => (
                <button key={opt} type="button"
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-500 hover:border-[#2a465a]/40 hover:text-[#2a465a] transition-all">
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button text="Cancel" variant="ghost"   size={3} onClick={() => closeModal("mtl-notifications-create-reminder")} />
            <Button text="Create" variant="primary" size={3} onClick={() => closeModal("mtl-notifications-create-reminder")} />
          </div>
        </div>
      </Modal>

    </div>
  );
}
