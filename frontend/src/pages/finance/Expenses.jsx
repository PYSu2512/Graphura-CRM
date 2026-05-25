import { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable, Button,
  Modal, ModalProfile, ModalGrid, ModalData,
  DataField, SelectField, Option,
  openModal, closeModal,
} from "../../components/shared/Common_Components";
import { GPieChart } from "../../components/shared/Common_Components";
import { Receipt, CheckCircle, XCircle, RotateCcw, Calendar, Eye, Pencil, Trash2 } from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const categories = ["Operations", "Marketing", "Salaries", "Technology", "Miscellaneous", "Travel", "Utilities"];

const initialExpenses = [
  { id: "EXP-001", category: "Operations", title: "Office Rent", amount: 35000, status: "Paid", date: "2025-07-01", addedBy: "Finance Manager", notes: "Monthly office rent." },
  { id: "EXP-002", category: "Marketing", title: "Google Ads Budget", amount: 15000, status: "Paid", date: "2025-07-02", addedBy: "Finance Manager", notes: "" },
  { id: "EXP-003", category: "Technology", title: "Software Licenses", amount: 8500, status: "Unpaid", date: "2025-07-03", addedBy: "Finance Manager", notes: "Annual subscription." },
  { id: "EXP-004", category: "Travel", title: "Client Visit Ahmedabad", amount: 4200, status: "Paid", date: "2025-07-05", addedBy: "Finance Manager", notes: "Flight + hotel." },
  { id: "EXP-005", category: "Utilities", title: "Electricity Bill", amount: 6800, status: "Paid", date: "2025-07-07", addedBy: "Finance Manager", notes: "" },
  { id: "EXP-006", category: "Miscellaneous", title: "Stationery", amount: 1200, status: "Returned", date: "2025-07-08", addedBy: "Finance Manager", notes: "Returned damaged items." },
  { id: "EXP-007", category: "Marketing", title: "Brochure Printing", amount: 3500, status: "Paid", date: "2025-07-10", addedBy: "Finance Manager", notes: "" },
];

const statusColor = (s) => {
  if (s === "Paid") return "bg-emerald-100 text-emerald-700";
  if (s === "Unpaid") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
};

const blankForm = { category: "Operations", title: "", amount: "", status: "Unpaid", date: "", notes: "" };

export default function Expenses() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [deleteTarget, setDeleteTarget] = useState(null);

  const total = expenses.length;
  const paid = expenses.filter(e => e.status === "Paid").length;
  const unpaid = expenses.filter(e => e.status === "Unpaid").length;
  const returned = expenses.filter(e => e.status === "Returned").length;
  const monthly = expenses.filter(e => e.date.startsWith("2025-07")).reduce((a, e) => a + parseFloat(e.amount || 0), 0);

  // Category pie data
  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + parseFloat(e.amount || 0); });
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  const openView = (row) => { setSelected(row); openModal("exp-view"); };
  const openAdd = () => { setMode("add"); setForm(blankForm); openModal("exp-form"); };
  const openEdit = (row) => { setMode("edit"); setSelected(row); setForm({ ...row }); openModal("exp-form"); };
  const confirmDelete = (row) => { setDeleteTarget(row); openModal("exp-delete"); };

  const saveForm = () => {
    if (mode === "add") {
      const newId = `EXP-${String(expenses.length + 1).padStart(3, "0")}`;
      setExpenses(prev => [...prev, { ...form, id: newId, addedBy: "Finance Manager", amount: parseFloat(form.amount) || 0 }]);
    } else {
      setExpenses(prev => prev.map(e => e.id === selected.id ? { ...e, ...form, amount: parseFloat(form.amount) || 0 } : e));
    }
    closeModal("exp-form");
  };

  const doDelete = () => {
    setExpenses(prev => prev.filter(e => e.id !== deleteTarget.id));
    closeModal("exp-delete");
  };

  const columns = [
    { key: "id", label: "Expense ID" },
    { key: "category", label: "Category" },
    { key: "title", label: "Title" },
    { key: "amount", label: "Amount", render: v => `₹${parseFloat(v).toLocaleString()}` },
    { key: "status", label: "Status", render: v => <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(v)}`}>{v}</span> },
    { key: "date", label: "Expense Date" },
    { key: "addedBy", label: "Added By" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Expenses" secondaryText="Management" size={12} />
        <DashCard title="Total Expenses" value={total} icon={<Receipt size={22} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Paid" value={paid} icon={<CheckCircle size={22} />} accentColor="#22c55e" size={2} />
        <DashCard title="Unpaid" value={unpaid} icon={<XCircle size={22} />} accentColor="#f43f5e" size={2} />
        <DashCard title="Returned" value={returned} icon={<RotateCcw size={22} />} accentColor="#8b5cf6" size={2} />
        <DashCard title="Monthly Expenses" value={`₹${monthly.toLocaleString()}`} icon={<Calendar size={22} />} accentColor="#f59e0b" size={3} />
      </DashGrid>
      <DashGrid cols={12} gap={4}>

      <GPieChart title="Expense by Category" data={pieData} size={4} />
      </DashGrid>
      <DashGrid cols={12} gap={4}>
          <div className="col-span-12 flex justify-end w-full">
            <Button
              text="+ Add Expense"
              onClick={openAdd}
            />
          </div>
          <DataTable
            title="All Expenses"
            columns={columns}
            rows={expenses}
            pageSize={12}
            actions={[
              { icon: <Eye size={15}/>,    tooltip: "View Details", variant: "ghost",   onClick: openView     },
              { icon: <Pencil size={15}/>, tooltip: "Edit",         variant: "primary", onClick: openEdit     },
              { icon: <Trash2 size={15}/>, tooltip: "Delete",       variant: "danger",  onClick: confirmDelete},
            ]}
          />
      </DashGrid>

      {/* View Modal */}
      <Modal id="exp-view" title="Expense Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.title} subtitle={selected.category} meta={`Expense ID: ${selected.id}`} />
            <ModalGrid title="Expense Info" cols={2}>
              <ModalData label="Amount" value={`₹${parseFloat(selected.amount).toLocaleString()}`} />
              <ModalData label="Payment Status" value={selected.status} />
              <ModalData label="Expense Date" value={selected.date} />
              <ModalData label="Added By" value={selected.addedBy} />
              <ModalData label="Notes" value={selected.notes || "—"} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("exp-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      <Modal id="exp-form" title={mode === "add" ? "Add Expense" : "Edit Expense"} size="md">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Category" id="exp-cat" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {categories.map(c => <Option key={c} value={c} label={c} />)}
            </SelectField>
            <DataField label="Expense Title" id="exp-title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} size={12} />
            <DataField label="Amount (₹)" id="exp-amount" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} size={12} />
            <SelectField label="Payment Status" id="exp-status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <Option value="Paid" label="Paid" />
              <Option value="Unpaid" label="Unpaid" />
              <Option value="Returned" label="Returned" />
            </SelectField>
            <DataField label="Expense Date" id="exp-date" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} size={12} />
            <DataField label="Notes" id="exp-notes" type="textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} size={12} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("exp-form")} />
            <Button text={mode === "add" ? "Add Expense" : "Save Changes"} variant="primary" size={4} onClick={saveForm} />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal id="exp-delete" title="Confirm Delete" size="sm">
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button text="Cancel" variant="ghost" size={4} onClick={() => closeModal("exp-delete")} />
              <Button text="Delete" variant="danger" size={4} onClick={doDelete} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}