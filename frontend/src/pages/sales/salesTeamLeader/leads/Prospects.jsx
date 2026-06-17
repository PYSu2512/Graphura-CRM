import { useState, useMemo, useEffect } from "react";
import {
  DataTable, Modal, Button, DataField, SelectField, Option,
  openModal, closeModal, ModalProfile, ModalData, ModalGrid, Grid,
  DashGrid, EnhancedDashCard,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Eye, Pencil, Phone, MessageCircle, Flame, Snowflake, Activity, Target,
} from "lucide-react";
import apiClient from "../../../../services/apiClient";
import toast from "react-hot-toast";
import { maskId } from "../../../../utils/idMask";

const COLS = [
  { key: "name",          label: "Name" },
  { key: "companyName",   label: "Company" },
  { key: "mobile",        label: "Mobile" },
  { key: "email",         label: "Email" },
  { key: "assignedTo",    label: "Executive" },
  { key: "status",        label: "Status" },
  { key: "createdAt",     label: "Created" },
];

const STATUS_OPTIONS = ["OPEN", "IN_NEGOTIATION", "SENT_TO_FINANCE", "WON", "LOST"];

const stripPhone = (m) => (m || "").replace(/\D/g, "");

export default function Prospects() {
  const [prospects, setProspects] = useState([]);
  const [stats, setStats] = useState({});
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRow,   setViewRow]   = useState(null);
  const [editRow,   setEditRow]   = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prospectsRes, workspaceRes] = await Promise.all([
        apiClient.get("/sales-team-leader/prospects"),
        apiClient.get("/sales-team-leader/leads/workspace")
      ]);
      
      if (prospectsRes.data.success) {
        setProspects(prospectsRes.data.data.prospects || []);
        setStats(prospectsRes.data.data.stats || {});
      }
      if (workspaceRes.data.success) {
        setExecutives(workspaceRes.data.data.targets || []);
      }
    } catch (error) {
      console.error("Failed to fetch prospects data:", error);
      toast.error("Failed to load prospects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const executiveNames = useMemo(() => executives.map(e => e.name), [executives]);

  const callLead     = (row) => { window.location.href = `tel:${stripPhone(row.mobile)}`; };
  const whatsappLead = (row) => { window.open(`https://wa.me/${stripPhone(row.mobile)}`, "_blank", "noopener"); };

  const saveEdit = async () => {
    try {
      const res = await apiClient.put(`/sales-team-leader/prospects/${editRow.id}`, editRow);
      if (res.data.success) {
        toast.success("Prospect updated successfully");
        setProspects((prev) => prev.map((p) => p.id === editRow.id ? { ...p, ...editRow } : p));
        closeModal("tl-prosp-edit");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update prospect");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading prospects...</div>;

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Total Prospects" value={String(stats.total || 0)} icon={<Target     size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Open"            value={String(stats.open || 0)}   icon={<Flame      size={22} />} accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Negotiation"     value={String(stats.negotiation || 0)}  icon={<Activity   size={22} />} accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Won"             value={String(stats.won || 0)}  icon={<Snowflake  size={22} />} accentColor="#38bdf8" size={3} />
      </DashGrid>

      <DataTable
        title="Team Prospects"
        columns={COLS}
        rows={prospects}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="team_prospects"
        filters={[
          { title: "Status",      type: "toggle", key: "status",       options: STATUS_OPTIONS },
          { title: "Executive",   type: "select", key: "assignedTo",   options: executiveNames },
        ]}
        actions={[
          { icon: <Eye size={15} />,           tooltip: "View",     variant: "ghost",   onClick: (row) => { setViewRow(prospects.find((p) => p.id === row.id)); openModal("tl-prosp-view"); } },
          { icon: <Phone size={15} />,         tooltip: "Call",     variant: "ghost",   onClick: callLead },
          { icon: <MessageCircle size={15} />, tooltip: "WhatsApp", variant: "ghost",   onClick: whatsappLead },
          { icon: <Pencil size={15} />,        tooltip: "Edit",     variant: "primary", onClick: (row) => { setEditRow({ ...prospects.find((p) => p.id === row.id) }); openModal("tl-prosp-edit"); } },
        ]}
      />

      {/* ── View modal ───────────────────────────────────────────────────── */}
      <Modal id="tl-prosp-view" title="Prospect Details" size="md">
        {viewRow && (
          <div className="space-y-4">
            <ModalProfile
              name={viewRow.name}
              subtitle={`${viewRow.companyName} · ${viewRow.status}`}
              meta={`Ref: ${maskId(viewRow.id, 'PRO')} · Executive: ${viewRow.assignedTo}`}
            />
            <ModalGrid title="Contact" cols={2}>
              <ModalData label="Mobile" value={viewRow.mobile} />
              <ModalData label="Email"  value={viewRow.email} />
            </ModalGrid>
            <ModalGrid title="Deal" cols={2}>
              <ModalData label="Executive"      value={viewRow.assignedTo} />
              <ModalData label="Status"         value={viewRow.status} />
              <ModalData label="Created At"     value={viewRow.createdAt} />
            </ModalGrid>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button text="Call"     variant="ghost"   size={2} onClick={() => callLead(viewRow)} />
              <Button text="WhatsApp" variant="ghost"   size={3} onClick={() => whatsappLead(viewRow)} />
              <Button text="Close"    variant="primary" size={3} onClick={() => closeModal("tl-prosp-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      <Modal id="tl-prosp-edit" title="Update Prospect" size="md">
        {editRow && (
          <div className="space-y-4">
            <Grid cols={12} gap={4}>
              <DataField label="Name"           id="tl-prosp-name"    value={editRow.name}          size={6} onChange={(e) => setEditRow((p) => ({ ...p, contactPerson: e.target.value, name: e.target.value }))} />
              <DataField label="Company"        id="tl-prosp-company" value={editRow.companyName}   size={6} onChange={(e) => setEditRow((p) => ({ ...p, company: e.target.value, companyName: e.target.value }))} />
              <DataField label="Requirement"    id="tl-prosp-service" value={editRow.service}       size={6} onChange={(e) => setEditRow((p) => ({ ...p, requirement: e.target.value, service: e.target.value }))} />
              <DataField label="Budget"         id="tl-prosp-budget"  value={editRow.budget}        size={6} onChange={(e) => setEditRow((p) => ({ ...p, budget: e.target.value }))} />
              <DataField label="Expected Close" id="tl-prosp-close"   value={editRow.expectedClose} size={6} type="date" onChange={(e) => setEditRow((p) => ({ ...p, expectedClose: e.target.value }))} />
              <SelectField label="Status" value={editRow.status} size={6} onChange={(e) => setEditRow((p) => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTIONS.map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <Button text="Save Changes" variant="primary"   size={6} onClick={saveEdit} />
              <Button text="Cancel"       variant="secondary" size={6} onClick={() => closeModal("tl-prosp-edit")} />
            </Grid>
          </div>
        )}
      </Modal>
    </div>
  );
}
