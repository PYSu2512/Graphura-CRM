import { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable, Button,
  Modal, ModalProfile, ModalGrid, ModalData,
  DataField, SelectField, Option,
  openModal, closeModal,
} from "../../components/shared/Common_Components";
import { FileText, CheckCircle, PenLine, Clock, ThumbsUp, Eye, Pencil, Mail, BadgeCheck } from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const initialWOs = [
  {
    id: "WO-2025-001", client: "Arjun Mehta", project: "Brand Website", amount: 80000,
    generatedDate: "2025-07-01", signedStatus: "Signed", signedDate: "2025-07-03",
    approvalStatus: "Approved",
    services: "UI Design, Development, SEO",
    deliveryDate: "2025-08-15",
    terms: "50% advance, 50% on delivery. Revisions capped at 3.",
    clientEmail: "arjun@example.com", clientMobile: "9876543210",
  },
  {
    id: "WO-2025-002", client: "Priya Sharma", project: "ERP Customization", amount: 250000,
    generatedDate: "2025-07-05", signedStatus: "Unsigned", signedDate: "—",
    approvalStatus: "Pending",
    services: "ERP Integration, Training",
    deliveryDate: "2025-09-30",
    terms: "30% advance, 40% mid, 30% on completion.",
    clientEmail: "priya@example.com", clientMobile: "9823456789",
  },
  {
    id: "WO-2025-003", client: "TechNova Pvt", project: "Cloud Migration", amount: 320000,
    generatedDate: "2025-07-08", signedStatus: "Signed", signedDate: "2025-07-10",
    approvalStatus: "Approved",
    services: "Cloud Setup, Data Migration",
    deliveryDate: "2025-10-01",
    terms: "Full payment upfront. SLA of 99.9% uptime.",
    clientEmail: "contact@technova.in", clientMobile: "9988776655",
  },
  {
    id: "WO-2025-004", client: "Rohan Gupta", project: "Mobile App", amount: 150000,
    generatedDate: "2025-07-09", signedStatus: "Unsigned", signedDate: "—",
    approvalStatus: "Pending",
    services: "Android App, iOS App",
    deliveryDate: "2025-11-15",
    terms: "Milestone-based payments.",
    clientEmail: "rohan@gupta.com", clientMobile: "9812398123",
  },
];

const statusBadge = (val, colorMap) => {
  const cls = colorMap[val] || "bg-slate-100 text-slate-600";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{val}</span>;
};

export default function WorkOrders() {
  const [wos, setWos] = useState(initialWOs);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [emailMsg, setEmailMsg] = useState("");

  const total = wos.length;
  const generated = wos.length;
  const signed = wos.filter(w => w.signedStatus === "Signed").length;
  const pendingApproval = wos.filter(w => w.approvalStatus === "Pending").length;
  const approved = wos.filter(w => w.approvalStatus === "Approved").length;

  const openView = (row) => { setSelected(row); openModal("wo-view"); };
  const openEdit = (row) => {
    setSelected(row);
    setEditForm({ project: row.project, services: row.services, amount: row.amount, deliveryDate: row.deliveryDate, terms: row.terms, approvalStatus: row.approvalStatus, signedStatus: row.signedStatus });
    openModal("wo-edit");
  };
  const sendEmail = (row) => {
    setEmailMsg(`✅ Work order ${row.id} email sent to ${row.clientEmail} successfully!`);
    setTimeout(() => setEmailMsg(""), 3000);
  };
  const markApproved = (row) => {
    setWos(prev => prev.map(w => w.id === row.id ? { ...w, approvalStatus: "Approved" } : w));
  };
  const saveEdit = () => {
    setWos(prev => prev.map(w => w.id === selected.id ? { ...w, ...editForm, amount: parseFloat(editForm.amount) || w.amount } : w));
    closeModal("wo-edit");
  };

  const columns = [
    { key: "id", label: "WO ID" },
    { key: "client", label: "Client Name" },
    { key: "project", label: "Project Name" },
    { key: "amount", label: "Amount", render: v => `₹${v.toLocaleString()}` },
    { key: "generatedDate", label: "Generated Date" },
    { key: "signedStatus", label: "Signed Status", render: v => statusBadge(v, { Signed: "bg-emerald-100 text-emerald-700", Unsigned: "bg-rose-100 text-rose-700" }) },
    { key: "approvalStatus", label: "Approval Status", render: v => statusBadge(v, { Approved: "bg-emerald-100 text-emerald-700", Pending: "bg-amber-100 text-amber-700" }) },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      {emailMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 text-sm font-semibold">{emailMsg}</div>
      )}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Work Orders" secondaryText="Management" size={12} />
        <DashCard title="Total Work Orders" value={total} icon={<FileText size={22} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Generated" value={generated} icon={<PenLine size={22} />} accentColor="#8b5cf6" size={2} />
        <DashCard title="Signed" value={signed} icon={<CheckCircle size={22} />} accentColor="#22c55e" size={2} />
        <DashCard title="Pending Approval" value={pendingApproval} icon={<Clock size={22} />} accentColor="#f59e0b" size={2} />
        <DashCard title="Approved" value={approved} icon={<ThumbsUp size={22} />} accentColor="#14b8a6" size={3} />
      </DashGrid>

      <DataTable
        title="All Work Orders"
        columns={columns}
        rows={wos}
        pageSize={10}
        actions={[
          { icon: <Eye size={15}/>,       tooltip: "View Details",  variant: "ghost",   onClick: openView    },
          { icon: <Pencil size={15}/>,    tooltip: "Edit",          variant: "primary", onClick: openEdit    },
          { icon: <Mail size={15}/>,      tooltip: "Send Email",    variant: "ghost",   onClick: sendEmail   },
          { icon: <BadgeCheck size={15}/>,tooltip: "Approve",       variant: "success", onClick: markApproved},
        ]}
      />

      {/* View Modal */}
      <Modal id="wo-view" title="Work Order Details" size="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.client} subtitle={selected.project} meta={`WO ID: ${selected.id}`} />
            <ModalGrid title="Client Details" cols={2}>
              <ModalData label="Email" value={selected.clientEmail} />
              <ModalData label="Mobile" value={selected.clientMobile} />
            </ModalGrid>
            <ModalGrid title="Project Details" cols={2}>
              <ModalData label="Services" value={selected.services} />
              <ModalData label="Total Amount" value={`₹${selected.amount?.toLocaleString()}`} />
              <ModalData label="Delivery Date" value={selected.deliveryDate} />
              <ModalData label="Generated Date" value={selected.generatedDate} />
            </ModalGrid>
            <ModalGrid title="Status" cols={2}>
              <ModalData label="Signed Status" value={selected.signedStatus} />
              <ModalData label="Signed Date" value={selected.signedDate} />
              <ModalData label="Approval Status" value={selected.approvalStatus} />
            </ModalGrid>
            <ModalGrid title="Terms & Conditions" cols={1}>
              <ModalData label="Terms" value={selected.terms} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("wo-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal id="wo-edit" title="Edit Work Order" size="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.client} subtitle={`WO ID: ${selected.id}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataField label="Project Name" id="wo-project" value={editForm.project} onChange={e => setEditForm(p => ({ ...p, project: e.target.value }))} size={12} />
              <DataField label="Selected Services" id="wo-services" value={editForm.services} onChange={e => setEditForm(p => ({ ...p, services: e.target.value }))} size={12} />
              <DataField label="Amount (₹)" id="wo-amount" type="number" value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} size={12} />
              <DataField label="Delivery Date" id="wo-delivery" type="date" value={editForm.deliveryDate} onChange={e => setEditForm(p => ({ ...p, deliveryDate: e.target.value }))} size={12} />
              <SelectField label="Approval Status" id="wo-approval" value={editForm.approvalStatus} onChange={e => setEditForm(p => ({ ...p, approvalStatus: e.target.value }))}>
                <Option value="Pending" label="Pending" />
                <Option value="Approved" label="Approved" />
              </SelectField>
              <SelectField label="Signed Status" id="wo-signed" value={editForm.signedStatus} onChange={e => setEditForm(p => ({ ...p, signedStatus: e.target.value }))}>
                <Option value="Unsigned" label="Unsigned" />
                <Option value="Signed" label="Signed" />
              </SelectField>
              <DataField label="Terms & Conditions" id="wo-terms" type="textarea" value={editForm.terms} onChange={e => setEditForm(p => ({ ...p, terms: e.target.value }))} size={12} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("wo-edit")} />
              <Button text="Save Changes" variant="primary" size={3} onClick={saveEdit} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}