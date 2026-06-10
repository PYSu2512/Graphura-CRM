/**
 * NotificationsPage.jsx — Management Team Leader
 * Fully dynamic — data from /api/management-tl/notifications-data
 * Smart alerts generated from real task/project data.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Grid,
  GPieChart, GColumnChart,
  Modal, ModalGrid, ModalData, Button,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components";
import {
  BellRing, MailWarning, AlertCircle, ListTodo,
  Eye, Bell, CheckCircle2, Trash2, PlusCircle, BookCheck, Settings2, RefreshCw,
} from "lucide-react";
import apiClient from "../../../../services/apiClient";
import toast from "react-hot-toast";

const KPI_ICONS = [<BellRing size={20}/>, <MailWarning size={20}/>, <AlertCircle size={20}/>, <ListTodo size={20}/>];

// ── Portal tooltip button ─────────────────────────────────────────────────────
function IconBtn({ icon, tooltip, onClick, colorCls = "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100" }) {
  const [tipPos, setTipPos] = useState(null);
  const ref = useRef(null);
  return (
    <div className="relative">
      <button ref={ref} type="button" onClick={onClick}
        onMouseEnter={() => { const r = ref.current?.getBoundingClientRect(); if (r) setTipPos({ top: r.top - 8, left: r.left + r.width / 2 }); }}
        onMouseLeave={() => setTipPos(null)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${colorCls}`}>
        {icon}
      </button>
      {tipPos && createPortal(
        <div className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-full" style={{ top: tipPos.top, left: tipPos.left }}>
          <div className="bg-[#1e293b] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">{tooltip}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
        </div>,
        document.body,
      )}
    </div>
  );
}

const CustomToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    <button type="button" onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#2a465a]" : "bg-slate-200"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  </div>
);

const NOTIF_COLS = [
  { key: "type",         label: "Type",     width: "14%" },
  { key: "priority",     label: "Priority", width: "10%" },
  { key: "subject",      label: "Subject",  width: "32%" },
  { key: "date",         label: "Date",     width: "16%" },
  { key: "status",       label: "Status",   width: "10%" },
];

export default function NotificationsPage() {
  const [pageData, setPageData]  = useState(null);
  const [rows,     setRows]      = useState([]);
  const [selected, setSelected]  = useState(null);
  const [loading,  setLoading]   = useState(true);
  const [settings, setSettings]  = useState({ emailNotifications: true, pushNotifications: true, reminderFrequency: "Instant" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/management-tl/notifications-data");
      const d   = res.data?.data || {};
      setPageData(d);
      setRows(d.notifications || []);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = pageData ? [
    { title: "Total Notifications", value: String(pageData.kpis?.total         || 0), accent: "#3b82f6" },
    { title: "Unread",              value: String(pageData.kpis?.unread         || 0), accent: "#f43f5e" },
    { title: "Deadline Alerts",     value: String(pageData.kpis?.deadlineAlerts || 0), accent: "#f59e0b" },
    { title: "Pending Tasks",       value: String(pageData.kpis?.taskReminders  || 0), accent: "#22c55e" },
  ] : Array(4).fill({ title: "—", value: "—", accent: "#94a3b8" });

  const markRead    = (id) => setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: "Read" } : r));
  const deleteNotif = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  const smartAlerts = pageData?.smartAlerts || [];
  const recentActivity = pageData?.recentActivity || [];

  return (
    <div className="flex flex-col gap-4">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Notification Hub" size={12} />
        {kpis.map((k, i) => (
          <EnhancedDashCard key={i} title={k.title} value={loading ? "—" : k.value}
            icon={KPI_ICONS[i]} accentColor={k.accent} size={3} />
        ))}
      </DashGrid>

      {/* Smart Alerts */}
      {smartAlerts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {smartAlerts.map((alert) => {
            const isHigh = alert.priority === "High";
            const isMed  = alert.priority === "Medium";
            const strip  = isHigh ? "bg-rose-500" : isMed ? "bg-amber-400" : "bg-blue-500";
            const badge  = isHigh ? "bg-rose-100 text-rose-700 border-rose-200"
                         : isMed  ? "bg-amber-100 text-amber-700 border-amber-200"
                         :          "bg-blue-100 text-blue-700 border-blue-200";
            const btn1Bg = isHigh ? "bg-rose-600 hover:bg-rose-700"
                         : isMed  ? "bg-amber-500 hover:bg-amber-600"
                         :          "bg-blue-600 hover:bg-blue-700";
            return (
              <div key={alert.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
                <div className={`h-1.5 w-full ${strip}`} />
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isHigh?"bg-rose-100 text-rose-600":isMed?"bg-amber-100 text-amber-600":"bg-blue-100 text-blue-600"}`}>
                      <AlertCircle size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isHigh?"text-rose-600":isMed?"text-amber-600":"text-blue-600"}`}>{alert.type}</p>
                      <p className="text-sm font-bold text-[#1a2e3f] leading-snug">{alert.message}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${badge}`}>{alert.priority}</span>
                  </div>
                  <div className="border-t border-slate-100" />
                  <div className="flex gap-2">
                    <button className={`flex-1 h-10 px-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all active:scale-95 ${btn1Bg}`}>{alert.action1}</button>
                    <button className="flex-1 h-10 px-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 transition-all active:scale-95">{alert.action2}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-black text-[#2a465a] tracking-tight px-1">Recent Activity Updates</h3>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative pl-10">
            <div className="absolute top-8 bottom-8 left-6 w-[2px] bg-slate-100 rounded-full" />
            <div className="flex flex-col gap-6">
              {recentActivity.map((act) => (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-[27px] top-1 w-[18px] h-[18px] rounded-full bg-white border-4 border-indigo-500 shadow-sm group-hover:scale-125 transition-transform duration-300" />
                  <p className="text-sm font-bold text-slate-800">{act.activity}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-slate-500">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                      act.type === "Task"   ? "bg-blue-100 text-blue-700"
                    : act.type === "Update" ? "bg-amber-100 text-amber-700"
                    : act.type === "Delay"  ? "bg-rose-100 text-rose-700"
                    : "bg-slate-100 text-slate-700"
                    }`}>{act.type}</span>
                    <span>•</span><span>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {pageData?.notificationTypeData?.length > 0 && (
        <Grid cols={12} gap={4}>
          <GPieChart
            title="Notification Types" subtitle="Distribution by category"
            data={pageData.notificationTypeData}
            colors={["#f43f5e","#f59e0b","#3b82f6","#22c55e","#a855f7"]}
            size={4} height={280}
          />
          <GColumnChart
            title="Task Status Overview" subtitle="Current task breakdown across your projects"
            data={[
              { name: "Completed",   value: pageData.kpis?.total || 0 },
              { name: "Unread",      value: pageData.kpis?.unread || 0 },
              { name: "Alerts",      value: pageData.kpis?.deadlineAlerts || 0 },
              { name: "Pending",     value: pageData.kpis?.taskReminders || 0 },
            ]}
            bars={[{ key: "value", label: "Count", color: "#3b82f6" }]}
            size={8} height={280}
          />
        </Grid>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-end gap-2">
        <IconBtn icon={<RefreshCw size={18}/>} tooltip="Refresh" onClick={load}
          colorCls="text-white bg-[#2a465a] hover:bg-[#1e3a52] border border-[#1e3a52] shadow-md" />
        <IconBtn icon={<BookCheck size={18}/>} tooltip="Mark All as Read"
          onClick={() => setRows((prev) => prev.map((r) => ({ ...r, status: "Read" })))}
          colorCls="text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 shadow-md" />
        <IconBtn icon={<Settings2 size={18}/>} tooltip="Notification Settings"
          onClick={() => openModal("mtl-notif-settings")}
          colorCls="text-white bg-slate-500 hover:bg-slate-600 border border-slate-600 shadow-md" />
      </div>

      {/* All Notifications */}
      <DataTable
        title="All Notifications"
        columns={NOTIF_COLS}
        rows={rows}
        pageSize={10}
        searchable
        exportable
        exportFileName="notifications"
        loading={loading}
        filters={[
          { title: "Status",   type: "toggle", key: "status",   options: ["Unread","Read"] },
          { title: "Priority", type: "toggle", key: "priority", options: ["High","Medium","Low"] },
        ]}
        actions={[
          {
            icon: <Eye size={15}/>, tooltip: "View", variant: "ghost",
            onClick: (row) => {
              setSelected(rows.find((r) => r.id === row.id) ?? row);
              if (row.status === "Unread") markRead(row.id);
              openModal("mtl-notif-view");
            },
          },
          {
            icon: <CheckCircle2 size={15}/>, tooltip: "Mark Read", variant: "primary",
            show: (row) => row.status !== "Read",
            onClick: (row) => markRead(row.id),
          },
          { icon: <Trash2 size={15}/>, tooltip: "Delete", variant: "danger", onClick: (row) => deleteNotif(row.id) },
        ]}
      />

      {/* View modal */}
      <Modal id="mtl-notif-view" title="Notification Details" size="md">
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
            <ModalGrid title="Details" cols={2}>
              <ModalData label="Subject"  value={selected.subject} />
              <ModalData label="Type"     value={selected.type} />
              <ModalData label="Priority" value={selected.priority} />
              <ModalData label="Status"   value={selected.status} />
              <ModalData label="Date"     value={selected.date} />
              <ModalData label="ID"       value={selected.id} />
            </ModalGrid>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {selected.status !== "Read" && (
                <Button text="Mark as Read" variant="secondary" size={4}
                  onClick={() => { markRead(selected.id); setSelected((s) => ({ ...s, status: "Read" })); }} />
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mtl-notif-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Settings modal */}
      <Modal id="mtl-notif-settings" title="Notification Preferences" size="md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Enable / Disable</h4>
            <CustomToggle label="Email Notifications" checked={settings.emailNotifications} onChange={() => setSettings((s) => ({ ...s, emailNotifications: !s.emailNotifications }))} />
            <CustomToggle label="Push Notifications"  checked={settings.pushNotifications}  onChange={() => setSettings((s) => ({ ...s, pushNotifications:  !s.pushNotifications }))} />
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Reminder Frequency</h4>
            <div className="flex items-center gap-2">
              {["Instant","Hourly","Daily"].map((opt) => (
                <button key={opt} type="button" onClick={() => setSettings((s) => ({ ...s, reminderFrequency: opt }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    settings.reminderFrequency === opt ? "bg-[#2a465a] text-white border-[#2a465a] shadow" : "bg-white text-slate-500 border-slate-200 hover:border-[#2a465a]/40 hover:text-[#2a465a]"
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button text="Cancel"       variant="ghost"   size={3} onClick={() => closeModal("mtl-notif-settings")} />
            <Button text="Save Changes" variant="primary" size={3} onClick={() => { closeModal("mtl-notif-settings"); toast.success("Preferences saved"); }} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
