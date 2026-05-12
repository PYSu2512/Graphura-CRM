import { useState, useMemo, useEffect } from "react";
import {
  DataTable, Modal, Button, DataField, SelectField, Option,
  openModal, closeModal, ModalProfile, ModalData, ModalGrid, Grid,
  DashGrid, DashCard,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Eye, Pencil, Phone, MessageCircle, Flame, Snowflake, Activity, Target,
} from "lucide-react";
import { LEAD_STATUS_OPTIONS } from "./leadsStore";
import apiClient from "../../../../services/apiClient";

const COLS = [
  { key: "name",          label: "Name" },
  { key: "companyName",   label: "Company" },
  { key: "mobile",        label: "Mobile" },
  { key: "email",         label: "Email" },
  { key: "assignedTo",    label: "Assigned To" },
  { key: "status",        label: "Status" },
  { key: "createdAt",     label: "Created" },
];

const STATUS_OPTIONS = ["Hot", "Warm", "Cold"];

const stripPhone = (m) => (m || "").replace(/\D/g, "");

export default function Prospects() {
  const [prospects, setProspects] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRow,   setViewRow]   = useState(null);
  const [editRow,   setEditRow]   = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, targetsRes] = await Promise.all([
        apiClient.get("/sales-team-leader/leads/assigned"),
        apiClient.get("/sales-manager/leads/assignment-targets?role=SALES_EXECUTIVE")
      ]);
      
      if (leadsRes.data.success) {
        // For now, we'll treat assigned leads with specific statuses as prospects
        // In a real scenario, there might be a separate flag
        setProspects(leadsRes.data.data);
      }
      if (targetsRes.data.success) setExecutives(targetsRes.data.data.targets || []);
    } catch (error) {
      console.error("Failed to fetch prospects data:", error);
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

  const saveEdit = () => {
    setProspects((prev) => prev.map((p) => p.id === editRow.id ? editRow : p));
    closeModal("tl-prosp-edit");
  };

  const total = prospects.length;
  const hot   = prospects.filter((p) => p.status === "Hot").length;
  const warm  = prospects.filter((p) => p.status === "Warm").length;
  const cold  = prospects.filter((p) => p.status === "Cold").length;

  if (loading) return <div className="p-10 text-center">Loading prospects...</div>;

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <DashCard title="Total Prospects" value={String(total)} icon={<Target     size={22} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Hot"             value={String(hot)}   icon={<Flame      size={22} />} accentColor="#f43f5e" size={3} />
        <DashCard title="Warm"            value={String(warm)}  icon={<Activity   size={22} />} accentColor="#f59e0b" size={3} />
        <DashCard title="Cold"            value={String(cold)}  icon={<Snowflake  size={22} />} accentColor="#38bdf8" size={3} />
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
          { title: "Assigned To", type: "select", key: "assignedTo",   options: executiveNames },
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
              meta={`ID: ${viewRow.id} · Assigned to ${viewRow.assignedTo}`}
            />
            <ModalGrid title="Contact" cols={2}>
              <ModalData label="Mobile" value={viewRow.mobile} />
              <ModalData label="Email"  value={viewRow.email} />
            </ModalGrid>
            <ModalGrid title="Deal" cols={2}>
              <ModalData label="Assigned To"    value={viewRow.assignedTo} />
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
              <DataField label="Name"           id="tl-prosp-name"    value={editRow.name}          size={6} onChange={(e) => setEditRow((p) => ({ ...p, name: e.target.value }))} />
              <DataField label="Company"        id="tl-prosp-company" value={editRow.companyName}   size={6} onChange={(e) => setEditRow((p) => ({ ...p, companyName: e.target.value }))} />
              <DataField label="Mobile"         id="tl-prosp-mobile"  value={editRow.mobile}        size={6} onChange={(e) => setEditRow((p) => ({ ...p, mobile: e.target.value }))} />
              <DataField label="Email"          id="tl-prosp-email"   value={editRow.email}         size={6} type="email" onChange={(e) => setEditRow((p) => ({ ...p, email: e.target.value }))} />
              <DataField label="Service"        id="tl-prosp-service" value={editRow.service}       size={6} onChange={(e) => setEditRow((p) => ({ ...p, service: e.target.value }))} />
              <DataField label="Budget"         id="tl-prosp-budget"  value={editRow.budget}        size={6} onChange={(e) => setEditRow((p) => ({ ...p, budget: e.target.value }))} />
              <DataField label="Expected Close" id="tl-prosp-close"   value={editRow.expectedClose} size={6} type="date" onChange={(e) => setEditRow((p) => ({ ...p, expectedClose: e.target.value }))} />
              <SelectField label="Assigned To" value={editRow.assignedTo} size={6} onChange={(e) => setEditRow((p) => ({ ...p, assignedTo: e.target.value }))}>
                {executives.map((ex) => <Option key={ex.id} value={ex.name} label={ex.name} />)}
              </SelectField>
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
