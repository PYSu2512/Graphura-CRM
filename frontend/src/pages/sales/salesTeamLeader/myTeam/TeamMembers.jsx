import { useState } from "react";
import {
  DashGrid, DashCard, DataTable, Modal, ModalProfile, ModalGrid, ModalData, Button,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Users, UserCheck, UserMinus, Phone, MessageCircle, Eye, MapPin,
} from "lucide-react";
import { teamExecutives, currentTL, memberPerformance } from "./teamStore";

const stripPhone = (m) => (m || "").replace(/\D/g, "");

const COLS = [
  { key: "name",     label: "Name" },
  { key: "id",       label: "Employee ID" },
  { key: "email",    label: "Email" },
  { key: "phone",    label: "Phone" },
  { key: "region",   label: "Region" },
  { key: "joinDate", label: "Joined" },
  { key: "status", label: "Status" },
];

export default function TeamMembers() {
  const [view,    setView]    = useState("table"); // "table" | "grid"
  const [viewRow, setViewRow] = useState(null);

  const total    = teamExecutives.length;
  const active   = teamExecutives.filter((e) => e.status === "Active").length;
  const onLeave  = teamExecutives.filter((e) => e.status === "On Leave").length;
  const regions  = new Set(teamExecutives.map((e) => e.region)).size;

  const callExec     = (row) => { window.location.href = `tel:${stripPhone(row.phone)}`; };
  const whatsappExec = (row) => { window.open(`https://wa.me/${stripPhone(row.phone)}`, "_blank", "noopener"); };

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <DashCard title="Team Size"    value={String(total)}   icon={<Users      size={22} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Active"       value={String(active)}  icon={<UserCheck  size={22} />} accentColor="#22c55e" size={3} />
        <DashCard title="On Leave"     value={String(onLeave)} icon={<UserMinus  size={22} />} accentColor="#f59e0b" size={3} />
        <DashCard title="Regions"      value={String(regions)} icon={<MapPin     size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      <p className="text-xs text-slate-500 -mt-2">
        Showing {teamExecutives.length} executives reporting to <span className="font-semibold text-[#2a465a]">{currentTL.name}</span> · Team {currentTL.team}
      </p>

      {/* ── View toggle ──────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {[
            { key: "table", label: "Table" },
            { key: "grid",  label: "Cards" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                view === key
                  ? "bg-[#2a465a] text-white shadow"
                  : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table view ───────────────────────────────────────────────────── */}
      {view === "table" && (
        <DataTable
          title="My Team"
          columns={COLS}
          rows={teamExecutives}
          size={12}
          pageSize={10}
          searchable
          exportable
          exportFileName="my_team_members"
          filters={[
            { title: "Status", type: "toggle", key: "status", options: ["Active", "On Leave"] },
            { title: "Region", type: "select", key: "region", options: [...new Set(teamExecutives.map((e) => e.region))] },
          ]}
          actions={[
            { icon: <Eye size={15} />,           tooltip: "View",     variant: "ghost",   onClick: (row) => { setViewRow(teamExecutives.find((e) => e.id === row.id)); openModal("tl-mem-view"); } },
            { icon: <Phone size={15} />,         tooltip: "Call",     variant: "ghost",   onClick: callExec },
            { icon: <MessageCircle size={15} />, tooltip: "WhatsApp", variant: "ghost",   onClick: whatsappExec },
          ]}
        />
      )}

      {/* ── Grid view ────────────────────────────────────────────────────── */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamExecutives.map((exec) => {
            const perf = memberPerformance[exec.id] || {};
            const initials = exec.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
            const avatarColor = exec.status === "Active" ? "bg-emerald-500" : "bg-amber-500";
            return (
              <div
                key={exec.id}
                onClick={() => { setViewRow(exec); openModal("tl-mem-view"); }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-md ${avatarColor}`}>
                    {initials}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    exec.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {exec.status}
                  </span>
                </div>
                <p className="text-sm font-black text-[#2a465a] truncate">{exec.name}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{exec.region}</p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{exec.email}</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Calls",  value: String(perf.calls ?? "—") },
                    { label: "Sales",  value: String(perf.sales ?? "—") },
                    { label: "Conv %", value: perf.conversion ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl px-2 py-1.5 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-black text-[#2a465a] mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View modal ───────────────────────────────────────────────────── */}
      <Modal id="tl-mem-view" title="Executive Profile" size="md">
        {viewRow && (() => {
          const perf = memberPerformance[viewRow.id] || {};
          return (
            <div className="flex flex-col gap-4">
              <ModalProfile
                name={viewRow.name}
                subtitle={`Sales Executive · ${viewRow.region}`}
                meta={`ID: ${viewRow.id} · Joined ${viewRow.joinDate}`}
              />
              <ModalGrid title="Contact" cols={2}>
                <ModalData label="Email"  value={viewRow.email} />
                <ModalData label="Phone"  value={viewRow.phone} />
                <ModalData label="Region" value={viewRow.region} />
                <ModalData label="Status" value={viewRow.status} />
              </ModalGrid>
              <ModalGrid title="Performance Summary" cols={2}>
                <ModalData label="Total Calls"     value={String(perf.calls ?? "—")} />
                <ModalData label="Total Prospects" value={String(perf.prospects ?? "—")} />
                <ModalData label="Total Sales"     value={String(perf.sales ?? "—")} />
                <ModalData label="Conversion %"    value={perf.conversion ?? "—"} />
              </ModalGrid>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button text="Call"     variant="ghost"   size={2} onClick={() => callExec(viewRow)} />
                <Button text="WhatsApp" variant="ghost"   size={3} onClick={() => whatsappExec(viewRow)} />
                <Button text="Close"    variant="primary" size={3} onClick={() => closeModal("tl-mem-view")} />
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
