/**
 * ExpenseManagement — fully dynamic
 * GET /api/admin/expenses
 * POST /api/admin/expenses
 * PATCH /api/admin/expenses/:id/status
 */

import { useState, useEffect, useCallback } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import {
  P, Button, DataTable, openModal, PanelModal as Modal,
  closeModal, DataField, SelectField, Option, Grid,
} from "../../components/shared/Common_Components";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";

const CATEGORIES = ["Operations","Marketing","Salaries","Technology","Miscellaneous","Travel","Utilities"];

export default function ExpenseManagement({ isEmbedded }) {
  const [expenses,   setExpenses]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: "", category: "", amount: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/expenses");
      setExpenses(res.data?.data?.expenses || []);
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (row) => {
    try {
      await apiClient.patch(`/admin/expenses/${row.id}/status`, { status: "APPROVED" });
      toast.success("Expense approved");
      load();
    } catch (err) { toast.error(err?.message || "Failed to approve"); }
  };

  const handleReject = async (row) => {
    if (!window.confirm(`Reject expense "${row.title}"?`)) return;
    try {
      await apiClient.patch(`/admin/expenses/${row.id}/status`, { status: "REJECTED" });
      toast.success("Expense rejected");
      load();
    } catch (err) { toast.error(err?.message || "Failed to reject"); }
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) {
      toast.error("Title and amount are required");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/admin/expenses", {
        title:    newExpense.title,
        category: newExpense.category || "Other",
        amount:   Number(newExpense.amount),
      });
      toast.success("Expense added");
      setNewExpense({ title: "", category: "", amount: "" });
      closeModal("add-expense-modal");
      load();
    } catch (err) {
      toast.error(err?.message || "Failed to add expense");
    } finally { setSubmitting(false); }
  };

  const handleExport = () => {
    const csv = "Expense Title,Category,Date,Amount,Status\n" +
      expenses.map((e) => `"${e.title}","${e.category}","${e.date}","${e.amount}","${e.status}"`).join("\n");
    const a = document.createElement("a");
    a.href = encodeURI("data:text/csv;charset=utf-8," + csv);
    a.download = "expense_report.csv"; a.click();
  };

  const columns = [
    { key: "title",       label: "Expense Title", width: "25%" },
    { key: "category",    label: "Category",      width: "18%" },
    { key: "date",        label: "Date",           width: "15%" },
    { key: "amount",      label: "Amount",         width: "15%" },
    { key: "submittedBy", label: "Submitted By",   width: "15%" },
    { key: "status",      label: "Status",         width: "12%" },
  ];

  return (
    <div className={`w-full ${isEmbedded ? "" : "space-y-6"}`}>
      <div className="flex justify-end gap-3 mb-4 flex-wrap">
        <button onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition">
          <RefreshCw size={13} /> Refresh
        </button>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition">
          Export Report
        </button>
        <button onClick={() => openModal("add-expense-modal")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a465a] text-white text-sm font-bold shadow-lg hover:bg-[#1e3a52] transition active:scale-95">
          Add Expense
        </button>
      </div>

      <DataTable
        title="Recent Expenses"
        columns={columns}
        rows={expenses}
        loading={loading}
        actions={[
          { icon: <Check size={16} />, tooltip: "Approve", variant: "primary", onClick: handleApprove },
          { icon: <X size={16} />,     tooltip: "Reject",  variant: "danger",  onClick: handleReject  },
        ]}
        size={12} pageSize={10} searchable
        filters={[
          { title: "Category", key: "category", type: "toggle", options: CATEGORIES },
          { title: "Status",   key: "status",   type: "toggle", options: ["Completed","Pending","Failed"] },
        ]}
      />

      {/* Add Expense Modal */}
      <Modal id="add-expense-modal" title="Add Expense" size="md">
        <div className="space-y-5 pt-4">
          <P text="Submit a new expense record." size="sm" />
          <Grid cols={12} gap={4}>
            <DataField label="Expense Title" id="exp-title" size={12}
              placeholder="e.g. Office Supplies"
              value={newExpense.title}
              onChange={(e) => setNewExpense((f) => ({ ...f, title: e.target.value }))} />
            <SelectField label="Category" id="exp-cat" size={6} searchable={false}
              value={newExpense.category}
              onChange={(e) => setNewExpense((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => <Option key={c} value={c} label={c} />)}
            </SelectField>
            <DataField label="Amount (₹)" id="exp-amount" type="number" size={6}
              placeholder="e.g. 1500"
              value={newExpense.amount}
              onChange={(e) => setNewExpense((f) => ({ ...f, amount: e.target.value }))} />
          </Grid>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button onClick={() => closeModal("add-expense-modal")}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">
              Cancel
            </button>
            <button onClick={handleAddExpense} disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] shadow-lg hover:bg-[#1e3a52] transition active:scale-95 disabled:opacity-60">
              {submitting ? "Adding…" : "Submit Expense"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
