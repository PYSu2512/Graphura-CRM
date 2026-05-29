import { useState, useEffect } from "react";
import {
  DashGrid, EnhancedDashCard, DataTable, Modal, ModalProfile, ModalGrid, ModalData, Button,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Users, UserCheck, UserMinus, Phone, MessageCircle, Eye, MapPin,
} from "lucide-react";
import apiClient from "../../../../services/apiClient";

const stripPhone = (m) => (m || "").replace(/\D/g, "");

const COLS = [
  { key: "name",     label: "Name" },
  { key: "email",    label: "Email" },
  { key: "phone",    label: "Phone" },
  { key: "role",     label: "Role" },
  { key: "status",   label: "Status" },
];

export default function TeamMembers() {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState("table"); // "table" | "grid"
  const [viewRow, setViewRow] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await apiClient.get("/sales-manager/leads/assignment-targets?role=SALES_EXECUTIVE");
        if (res.data.success) {
          setExecutives(res.data.data.targets || []);
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const total    = executives.length;
  const active   = executives.length; // Placeholder logic as backend doesn't provide status yet, but we can assume active if returned
  const onLeave  = 0;
  const regions  = new Set(executives.map((e) => e.region || "Default")).size;

  const callExec     = (row) => { window.location.href = `tel:${stripPhone(row.phone)}`; };
  const whatsappExec = (row) => { window.open(`https://wa.me/${stripPhone(row.phone)}`, "_blank", "noopener"); };

  if (loading) return <div className="p-10 text-center">Loading team...</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Team Size"    value={String(total)}   icon={<Users      size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Active"       value={String(active)}  icon={<UserCheck  size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="On Leave"     value={String(onLeave)} icon={<UserMinus  size={22} />} accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Regions"      value={String(regions)} icon={<MapPin     size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      <p className="text-xs text-slate-500 -mt-2">
        Showing {executives.length} executives in your team
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
          rows={executives}
          userProfile="name"
          size={12}
          pageSize={10}
          searchable
          exportable
          exportFileName="my_team_members"
          filters={[
            { title: "Status", type: "toggle", key: "status", options: ["Active", "On Leave"] },
            { title: "Region", type: "select", key: "region", options: [...new Set(executives.map((e) => e.region || "Default"))] },
          ]}
          actions={[
            { icon: <Eye size={15} />,           tooltip: "View",     variant: "ghost",   onClick: (row) => { setViewRow(executives.find((e) => e.id === row.id)); openModal("tl-mem-view"); } },
            { icon: <Phone size={15} />,         tooltip: "Call",     variant: "ghost",   onClick: callExec },
            { icon: <MessageCircle size={15} />, tooltip: "WhatsApp", variant: "ghost",   onClick: whatsappExec },
          ]}
        />
      )}

      {/* ── Grid view ────────────────────────────────────────────────────── */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {executives.map((exec) => {
            const perf = {}; // Placeholder
            const initials = exec.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
            const avatarColor = "bg-emerald-500";
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
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700`}>
                    ACTIVE
                  </span>
                </div>
                <p className="text-sm font-black text-[#2a465a] truncate">{exec.name}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{exec.region || "Default"}</p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{exec.email}</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Limit",  value: String(exec.effectiveLimit ?? "—") },
                    { label: "Assigned",  value: String(exec.currentAssigned ?? "—") },
                    { label: "Left", value: String(exec.remaining ?? "—") },
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
          const perf = {};
          return (
            <div className="flex flex-col gap-4">
              <ModalProfile
                name={viewRow.name}
                subtitle={`Sales Executive · ${viewRow.region || "Default"}`}
              />
              <ModalGrid title="Contact" cols={2}>
                <ModalData label="Email"  value={viewRow.email} />
                <ModalData label="Phone"  value={viewRow.phone} />
                <ModalData label="Role"   value={viewRow.role} />
                <ModalData label="Status" value="Active" />
              </ModalGrid>
              <ModalGrid title="Limits Summary" cols={2}>
                <ModalData label="Daily Limit"     value={String(viewRow.effectiveLimit ?? "—")} />
                <ModalData label="Current Leads"   value={String(viewRow.currentAssigned ?? "—")} />
                <ModalData label="Remaining"       value={String(viewRow.remaining ?? "—")} />
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
