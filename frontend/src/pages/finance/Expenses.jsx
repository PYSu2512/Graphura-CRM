import { useState, useEffect } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Button,
  Modal, ModalProfile, ModalGrid, ModalData,
  DataField, SelectField, Option,
  openModal, closeModal,
} from "../../components/shared/Common_Components";
import { GPieChart } from "../../components/shared/Common_Components";
import { Receipt, CheckCircle, XCircle, RotateCcw, Calendar, Eye, Pencil, Trash2 } from "lucide-react";
import { getExpenses, getExpenseChart, createExpense, updateExpense, deleteExpense } from "../../services/financeService";
import toast from "react-hot-toast";
import { maskId } from "../../utils/idMask";

const categories = ["Operations", "Marketing", "Salaries", "Technology", "Miscellaneous", "Travel", "Utilities"];

const statusColor = (s) => {
  if (s === "Paid") return "bg-emerald-100 text-emerald-700";
  if (s === "Unpaid") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
};

const blankForm = { category: "Operations", title: "", amount: "", status: "Unpaid", expenseDate: "", notes: "" };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pieData, setPieData] = useState([]);

  const fetchExpensesData = async () => {
    try {
      const [expenseRes, chartRes] = await Promise.all([
        getExpenses(),
        getExpenseChart()
      ]);

      setExpenses(expenseRes.data.data.expenses);
      setStats(expenseRes.data.data.stats);
      setPieData(chartRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesData();
  }, []);

  const total = stats?.totalExpenses || 0;
  const paid = stats?.paid || 0;
  const unpaid = stats?.unpaid || 0;
  const returned = stats?.returned || 0;
  const monthly = stats?.monthlyExpense || 0;

  const openView = (row) => { setSelected(row); openModal("exp-view"); };
  const openAdd = () => { setMode("add"); setForm(blankForm); openModal("exp-form"); };
  const openEdit = (row) => { 
    setMode("edit"); 
    setSelected(row); 
    setForm({ 
      ...row,
      expenseDate: row.expenseDate ? row.expenseDate.split("T")[0] : "" 
    }); 
    openModal("exp-form"); 
  };
  const confirmDelete = (row) => { setDeleteTarget(row); openModal("exp-delete"); };

  const saveForm = async () => {
    try {
      if (mode === "add") {
        await createExpense(form);
        toast.success("Expense created successfully");
      } else {
        await updateExpense(selected._id, form);
        toast.success("Expense updated successfully");
      }
      fetchExpensesData();
      closeModal("exp-form");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to save expense");
    }
  };

  const doDelete = async () => {
    try {
      await deleteExpense(deleteTarget._id);
      toast.success("Expense deleted successfully");
      fetchExpensesData();
      closeModal("exp-delete");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to delete expense");
    }
  };

  const columns = [
    { key: "expenseId", label: "Expense ID" },
    { key: "category", label: "Category" },
    { key: "title", label: "Title" },
    { key: "amount", label: "Amount", render: v => `₹${parseFloat(v).toLocaleString()}` },
    { key: "status", label: "Status", render: v => <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(v)}`}>{v}</span> },
    { key: "expenseDate", label: "Expense Date", render: v => v ? v.split("T")[0] : "—" },
    { key: "addedBy", label: "Added By", render: v => v?.name || "—" },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 font-medium">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Expenses" secondaryText="Management" size={12} />
        <EnhancedDashCard title="Total Expenses" value={total} icon={<Receipt size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Paid" value={paid} icon={<CheckCircle size={22} />} accentColor="#22c55e" size={2} />
        <EnhancedDashCard title="Unpaid" value={unpaid} icon={<XCircle size={22} />} accentColor="#f43f5e" size={2} />
        <EnhancedDashCard title="Returned" value={returned} icon={<RotateCcw size={22} />} accentColor="#8b5cf6" size={2} />
        <EnhancedDashCard title="Monthly Expenses" value={`₹${monthly.toLocaleString()}`} icon={<Calendar size={22} />} accentColor="#f59e0b" size={3} />
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
            <ModalProfile name={selected.title} subtitle={selected.category} meta={`Ref: ${maskId(selected._id || selected.expenseId, 'EXP')}`} />
            <ModalGrid title="Expense Info" cols={2}>
              <ModalData label="Amount" value={`₹${parseFloat(selected.amount).toLocaleString()}`} />
              <ModalData label="Payment Status" value={selected.status} />
              <ModalData label="Expense Date" value={selected.expenseDate ? selected.expenseDate.split("T")[0] : "—"} />
              <ModalData label="Added By" value={selected.addedBy?.name || "—"} />
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
            <DataField label="Expense Date" id="exp-date" type="date" value={form.expenseDate} onChange={e => setForm(p => ({ ...p, expenseDate: e.target.value }))} size={12} />
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