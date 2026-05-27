import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Button,
  Modal, ModalProfile, ModalGrid, ModalData,
  DataField, SelectField, Option,
  openModal, closeModal,
} from "../../components/shared/Common_Components";
import { CreditCard, CheckCircle, Clock, XCircle, Split, DollarSign, Eye, ShieldCheck, Ban } from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const initialPayments = [
  { id: "PAY-001", client: "Arjun Mehta", mobile: "9876543210", email: "arjun@example.com", amount: 45000, type: "Full", method: "UPI", status: "Successful", date: "2025-07-10 10:30", razorOrderId: "order_abc123", razorPayId: "pay_xyz789", notes: "First payment received." },
  { id: "PAY-002", client: "Priya Sharma", mobile: "9823456789", email: "priya@example.com", amount: 50000, type: "Partial", method: "Net Banking", status: "Pending", date: "2025-07-11 14:15", razorOrderId: "order_def456", razorPayId: "—", notes: "Awaiting verification." },
  { id: "PAY-003", client: "Rohan Gupta", mobile: "9812398123", email: "rohan@gupta.com", amount: 30000, type: "Full", method: "Card", status: "Successful", date: "2025-07-12 09:00", razorOrderId: "order_ghi789", razorPayId: "pay_abc456", notes: "" },
  { id: "PAY-004", client: "Sneha Patil", mobile: "9900112233", email: "sneha@patil.com", amount: 60000, type: "Full", method: "UPI", status: "Failed", date: "2025-07-12 16:45", razorOrderId: "order_jkl012", razorPayId: "—", notes: "Transaction declined." },
  { id: "PAY-005", client: "Kavya Nair", mobile: "9012345678", email: "kavya@nair.com", amount: 25000, type: "Partial", method: "Wallet", status: "Pending", date: "2025-07-13 11:20", razorOrderId: "order_mno345", razorPayId: "—", notes: "" },
  { id: "PAY-006", client: "TechNova Pvt", mobile: "9988776655", email: "contact@technova.in", amount: 120000, type: "Full", method: "Net Banking", status: "Successful", date: "2025-07-13 15:00", razorOrderId: "order_pqr678", razorPayId: "pay_def123", notes: "Corporate account." },
];

const statusColor = (s) => {
  if (s === "Successful") return "bg-emerald-100 text-emerald-700";
  if (s === "Pending") return "bg-amber-100 text-amber-700";
  if (s === "Failed") return "bg-rose-100 text-rose-700";
  return "bg-blue-100 text-blue-700";
};

export default function Payments() {
  const [payments, setPayments] = useState(initialPayments);
  const [selected, setSelected] = useState(null);
  const [verifyForm, setVerifyForm] = useState({});

  const total = payments.length;
  const successful = payments.filter(p => p.status === "Successful").length;
  const pending = payments.filter(p => p.status === "Pending").length;
  const failed = payments.filter(p => p.status === "Failed").length;
  const partial = payments.filter(p => p.type === "Partial").length;
  const full = payments.filter(p => p.type === "Full").length;

  const openView = (row) => { setSelected(row); openModal("pay-view"); };
  const openVerify = (row) => {
    setSelected(row);
    setVerifyForm({ status: "Successful", note: "", type: row.type, amount: row.amount });
    openModal("pay-verify");
  };
  const markFailed = (row) => {
    setPayments(prev => prev.map(p => p.id === row.id ? { ...p, status: "Failed" } : p));
  };
  const saveVerify = () => {
    setPayments(prev => prev.map(p => p.id === selected.id ? { ...p, status: verifyForm.status, type: verifyForm.type, amount: parseFloat(verifyForm.amount) || p.amount } : p));
    closeModal("pay-verify");
  };

  const columns = [
    { key: "id", label: "Payment ID" },
    { key: "client", label: "Client Name" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "amount", label: "Amount", render: v => `₹${v.toLocaleString()}` },
    { key: "type", label: "Type" },
    { key: "method", label: "Method" },
    { key: "status", label: "Status", render: v => <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(v)}`}>{v}</span> },
    { key: "date", label: "Payment Date" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Payments" secondaryText="Management" size={12} />
        <EnhancedDashCard title="Total Payments" value={total} icon={<CreditCard size={22} />} accentColor="#3b82f6" size={2} />
        <EnhancedDashCard title="Successful" value={successful} icon={<CheckCircle size={22} />} accentColor="#22c55e" size={2} />
        <EnhancedDashCard title="Pending" value={pending} icon={<Clock size={22} />} accentColor="#f59e0b" size={2} />
        <EnhancedDashCard title="Failed" value={failed} icon={<XCircle size={22} />} accentColor="#f43f5e" size={2} />
        <EnhancedDashCard title="Partial" value={partial} icon={<Split size={22} />} accentColor="#8b5cf6" size={2} />
        <EnhancedDashCard title="Full" value={full} icon={<DollarSign size={22} />} accentColor="#14b8a6" size={2} />
      </DashGrid>

      <DataTable
        title="All Payments"
        columns={columns}
        rows={payments}
        pageSize={10}
        actions={[
          { icon: <Eye size={15}/>,        tooltip: "View Details",  variant: "ghost",   onClick: openView   },
          { icon: <ShieldCheck size={15}/>, tooltip: "Verify / Update", variant: "success", onClick: openVerify },
          { icon: <Ban size={15}/>,         tooltip: "Mark Failed",   variant: "danger",  onClick: markFailed },
        ]}
      />

      {/* View Modal */}
      <Modal id="pay-view" title="Payment Details" size="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.client}
              subtitle={`${selected.method} · ${selected.type} Payment`}
              meta={`Payment ID: ${selected.id}`}
            />
            <ModalGrid title="Razorpay Info" cols={2}>
              <ModalData label="Razorpay Order ID" value={selected.razorOrderId} />
              <ModalData label="Razorpay Payment ID" value={selected.razorPayId} />
            </ModalGrid>
            <ModalGrid title="Client Info" cols={2}>
              <ModalData label="Mobile" value={selected.mobile} />
              <ModalData label="Email" value={selected.email} />
            </ModalGrid>
            <ModalGrid title="Payment Info" cols={2}>
              <ModalData label="Amount" value={`₹${selected.amount?.toLocaleString()}`} />
              <ModalData label="Payment Type" value={selected.type} />
              <ModalData label="Method" value={selected.method} />
              <ModalData label="Status" value={selected.status} />
              <ModalData label="Date & Time" value={selected.date} />
              <ModalData label="Notes" value={selected.notes || "—"} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("pay-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <Modal id="pay-verify" title="Verify / Update Payment" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.client} subtitle={`Payment ID: ${selected.id}`} meta={`Amount: ₹${selected.amount?.toLocaleString()}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Status" id="v-status" value={verifyForm.status} onChange={e => setVerifyForm(p => ({ ...p, status: e.target.value }))}>
                <Option value="Successful" label="Successful" />
                <Option value="Pending" label="Pending" />
                <Option value="Failed" label="Failed" />
              </SelectField>
              <SelectField label="Payment Type" id="v-type" value={verifyForm.type} onChange={e => setVerifyForm(p => ({ ...p, type: e.target.value }))}>
                <Option value="Full" label="Full" />
                <Option value="Partial" label="Partial" />
              </SelectField>
              <DataField label="Amount (₹)" id="v-amount" type="number" value={verifyForm.amount} onChange={e => setVerifyForm(p => ({ ...p, amount: e.target.value }))} size={12} />
              <DataField label="Verification Note" id="v-note" type="textarea" value={verifyForm.note} onChange={e => setVerifyForm(p => ({ ...p, note: e.target.value }))} size={12} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("pay-verify")} />
              <Button text="Save" variant="primary" size={3} onClick={saveVerify} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}