import { useState } from "react";
import {
  DataTable, Modal, Button, DataField, SelectField, Option,
  openModal, closeModal, ModalProfile, ModalData, ModalGrid, Grid,
} from "../../../../components/shared/Common_Components";
import { Eye, Pencil, BadgeCheck, IndianRupee, AlertTriangle, CheckCircle } from "lucide-react";
import { DUMMY_PROSPECTS, TEAM_LEADERS } from "./leadsStore";

export default function Prospects() {
  const [prospects, setProspects] = useState(DUMMY_PROSPECTS);

  // ── View modal ────────────────────────────────────────────────────────────
  const [viewRow, setViewRow] = useState(null);

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [editRow, setEditRow] = useState(null);

  // ── Send to Finance bulk result ───────────────────────────────────────────
  const [financeResult, setFinanceResult] = useState([]);

  const sendToFinance = (rows) => {
    setFinanceResult(rows);
    openModal("pr-finance-modal");
  };

  const saveEdit = () => {
    setProspects((prev) => prev.map((p) => (p.id === editRow.id ? editRow : p)));
    closeModal("pr-edit-modal");
  };

  return (
    <>
      <DataTable
        title="Prospects"
        columns={[
          { key: "name",       label: "Name" },
          { key: "service",    label: "Service" },
          { key: "budget",     label: "Budget" },
          { key: "assignedTL", label: "Assigned TL" },
          { key: "status",     label: "Status" },
        ]}
        rows={prospects}
        searchable
        bulkAction
        bulkActions={[
          {
            title: "Send to Finance",
            icon: <IndianRupee size={14} />,
            onClick: (selected) => sendToFinance(selected),
          },
        ]}
        filters={[
          { title: "Status",      type: "toggle", key: "status",     options: ["Hot", "Warm", "Cold"] },
          { title: "Assigned TL", type: "select", key: "assignedTL", options: TEAM_LEADERS.map((t) => t.name) },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setViewRow(prospects.find((p) => p.id === row.id)); openModal("pr-view-modal"); },
          },
          {
            icon: <Pencil size={15} />, tooltip: "Edit", variant: "ghost",
            onClick: (row) => { setEditRow({ ...prospects.find((p) => p.id === row.id) }); openModal("pr-edit-modal"); },
          },
          {
            icon: <BadgeCheck size={15} />, tooltip: "Send to Finance", variant: "primary",
            onClick: (row) => sendToFinance([row]),
          },
        ]}
        size={12}
        pageSize={10}
      />

      {/* ── View Modal ──────────────────────────────────────────────────────── */}
      <Modal id="pr-view-modal" title="Prospect Details" size="md">
        {viewRow && (
          <div className="space-y-4">
            <ModalProfile
              name={viewRow.name}
              subtitle={`${viewRow.assignedTL} · ${viewRow.status}`}
              meta={`ID: ${viewRow.id}`}
            />
            <ModalGrid title="Contact Info" cols={2}>
              <ModalData label="Mobile" value={viewRow.mobile} />
              <ModalData label="Email"  value={viewRow.email} />
            </ModalGrid>
            <ModalGrid title="Deal Info" cols={2}>
              <ModalData label="Service"     value={viewRow.service} />
              <ModalData label="Budget"      value={viewRow.budget} />
              <ModalData label="Assigned TL" value={viewRow.assignedTL} />
              <ModalData label="Status"      value={viewRow.status} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("pr-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Modal id="pr-edit-modal" title="Edit Prospect" size="md">
        {editRow && (
          <div className="space-y-4">
            <Grid cols={12} gap={4}>
              <DataField label="Name"    id="pr-name"    value={editRow.name}    size={6} onChange={(e) => setEditRow((p) => ({ ...p, name: e.target.value }))} />
              <DataField label="Mobile"  id="pr-mobile"  value={editRow.mobile}  size={6} onChange={(e) => setEditRow((p) => ({ ...p, mobile: e.target.value }))} />
              <DataField label="Email"   id="pr-email"   value={editRow.email}   size={12} type="email" onChange={(e) => setEditRow((p) => ({ ...p, email: e.target.value }))} />
              <DataField label="Service" id="pr-service" value={editRow.service} size={6} onChange={(e) => setEditRow((p) => ({ ...p, service: e.target.value }))} />
              <DataField label="Budget"  id="pr-budget"  value={editRow.budget}  size={6} onChange={(e) => setEditRow((p) => ({ ...p, budget: e.target.value }))} />
              <SelectField label="Assigned TL" value={editRow.assignedTL} size={6} onChange={(e) => setEditRow((p) => ({ ...p, assignedTL: e.target.value }))}>
                {TEAM_LEADERS.map((tl) => <Option key={tl.id} value={tl.name} label={tl.name} />)}
              </SelectField>
              <SelectField label="Status" value={editRow.status} size={6} onChange={(e) => setEditRow((p) => ({ ...p, status: e.target.value }))}>
                {["Hot", "Warm", "Cold"].map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <Button text="Save Changes" variant="primary"   size={6} onClick={saveEdit} />
              <Button text="Cancel"       variant="secondary" size={6} onClick={() => closeModal("pr-edit-modal")} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Send to Finance Result Modal ─────────────────────────────────────── */}
      <Modal id="pr-finance-modal" title="Sent to Finance" size="md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl">
            <CheckCircle size={18} className="flex-shrink-0" />
            <p className="text-sm font-semibold">
              {financeResult.length} prospect{financeResult.length !== 1 ? "s" : ""} sent to Finance successfully.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#2a465a] to-[#3a5a7a]">
                  <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Service</th>
                  <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Budget</th>
                </tr>
              </thead>
              <tbody>
                {financeResult.map((row, i) => (
                  <tr key={row.id ?? i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="py-3 px-4 font-semibold text-[#2a465a]">{row.name}</td>
                    <td className="py-3 px-4 text-slate-600">{row.service}</td>
                    <td className="py-3 px-4 text-slate-600">{row.budget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button text="Close" variant="primary" size={3} onClick={() => closeModal("pr-finance-modal")} />
          </div>
        </div>
      </Modal>
    </>
  );
}
