import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  IndianRupee,
  Download,
  CreditCard,
} from "lucide-react";

import {
  Heading,
  EnhancedDashCard,
  DashGrid,
  DataTable,
  Button,
  Modal,
  openModal,
  closeModal,
  ModalData,
  ModalGrid,
  DataField,
  SelectField,
  Option,
} from "../../components/shared/Common_Components";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatINR = (n) => typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "—";

// ── Demo invoices ─────────────────────────────────────────────────────────────
const DEMO_INVOICES = [
  {
    id: "INV-001",
    projectId: "PRJ-001",
    project: "Acme Corp Website Redesign",
    date: "2026-04-05",
    dueDate: "2026-04-20",
    amount: 30000,
    tax: 5400,
    total: 35400,
    status: "Paid",
    paidDate: "2026-04-05",
    method: "UPI",
    ref: "RZPY001234",
    items: [
      { description: "Website Design — Phase 1 (Advance)", qty: 1, rate: 30000, amount: 30000 },
    ],
  },
  {
    id: "INV-002",
    projectId: "PRJ-001",
    project: "Acme Corp Website Redesign",
    date: "2026-04-22",
    dueDate: "2026-05-07",
    amount: 20000,
    tax: 3600,
    total: 23600,
    status: "Paid",
    paidDate: "2026-04-22",
    method: "Net Banking",
    ref: "RZPY005678",
    items: [
      { description: "Website Design — Phase 2 (Milestone)", qty: 1, rate: 20000, amount: 20000 },
    ],
  },
  {
    id: "INV-003",
    projectId: "PRJ-001",
    project: "Acme Corp Website Redesign",
    date: "2026-05-25",
    dueDate: "2026-06-10",
    amount: 35000,
    tax: 6300,
    total: 41300,
    status: "Pending",
    paidDate: null,
    method: null,
    ref: null,
    items: [
      { description: "Website Design — Final Delivery Balance", qty: 1, rate: 35000, amount: 35000 },
    ],
  },
  {
    id: "INV-004",
    projectId: "PRJ-002",
    project: "Brand Identity & Logo Package",
    date: "2026-01-11",
    dueDate: "2026-01-25",
    amount: 45000,
    tax: 8100,
    total: 53100,
    status: "Paid",
    paidDate: "2026-01-11",
    method: "UPI",
    ref: "RZPY009900",
    items: [
      { description: "Logo Design + Brand Identity Kit", qty: 1, rate: 35000, amount: 35000 },
      { description: "Brand Guidelines Document", qty: 1, rate: 10000, amount: 10000 },
    ],
  },
  {
    id: "INV-005",
    projectId: "PRJ-003",
    project: "Social Media Campaign — Q1",
    date: "2026-03-02",
    dueDate: "2026-03-17",
    amount: 16000,
    tax: 2880,
    total: 18880,
    status: "Paid",
    paidDate: "2026-03-02",
    method: "UPI",
    ref: "RZPY007700",
    items: [
      { description: "Social Media Campaign — Advance (50%)", qty: 1, rate: 16000, amount: 16000 },
    ],
  },
  {
    id: "INV-006",
    projectId: "PRJ-003",
    project: "Social Media Campaign — Q1",
    date: "2026-04-01",
    dueDate: "2026-04-15",
    amount: 16000,
    tax: 2880,
    total: 18880,
    status: "Overdue",
    paidDate: null,
    method: null,
    ref: null,
    items: [
      { description: "Social Media Campaign — Final Balance", qty: 1, rate: 16000, amount: 16000 },
    ],
  },
  {
    id: "INV-007",
    projectId: "PRJ-004",
    project: "E-Commerce Store Setup",
    date: "2025-10-02",
    dueDate: "2025-10-17",
    amount: 60000,
    tax: 10800,
    total: 70800,
    status: "Paid",
    paidDate: "2025-10-02",
    method: "Net Banking",
    ref: "RZPY000111",
    items: [
      { description: "E-Commerce Platform Setup (50% Advance)", qty: 1, rate: 60000, amount: 60000 },
    ],
  },
  {
    id: "INV-008",
    projectId: "PRJ-004",
    project: "E-Commerce Store Setup",
    date: "2025-11-15",
    dueDate: "2025-11-30",
    amount: 60000,
    tax: 10800,
    total: 70800,
    status: "Paid",
    paidDate: "2025-11-15",
    method: "UPI",
    ref: "RZPY000222",
    items: [
      { description: "E-Commerce Platform — Final Delivery", qty: 1, rate: 60000, amount: 60000 },
    ],
  },
];

const INVOICE_STATUS_CFG = {
  "Paid":    { color: "#22c55e", bg: "#f0fdf4" },
  "Pending": { color: "#f59e0b", bg: "#fffbeb" },
  "Overdue": { color: "#f43f5e", bg: "#fff1f2" },
  "Draft":   { color: "##94a3b8", bg: "#f1f5f9" },
};

// ── StatusPill ────────────────────────────────────────────────────────────────
function StatusPill({ status, cfgMap = INVOICE_STATUS_CFG }) {
  const cfg = cfgMap[status] ?? { color: "#94a3b8", bg: "#f1f5f9" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {status}
    </span>
  );
}

// ── INVOICES PAGE ─────────────────────────────────────────────────────────────
export default function ClientInvoices() {
  const [selected, setSelected] = useState(null);
  const [invoices, setInvoices] = useState(DEMO_INVOICES);

  // Payment modal state
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Stats
  const totalAmount = invoices.reduce((s, i) => s + i.total, 0);
  const paidAmount = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.total, 0);
  const pendingAmount = invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + i.total, 0);
  const overdueAmount = invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.total, 0);

  const tableRows = invoices.map((inv) => ({
    ...inv,
    displayAmount: formatINR(inv.amount),
    displayTax: formatINR(inv.tax),
    displayTotal: formatINR(inv.total),
  }));

  const handleConfirmPayment = () => {
    if (!paymentMethod || !paymentRef.trim()) {
      setPaymentError("Please fill in all required fields.");
      return;
    }
    setPaymentError("");
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === selected.id
          ? {
              ...inv,
              status: "Paid",
              paidDate: new Date().toISOString().split("T")[0],
              method: paymentMethod,
              ref: paymentRef.trim(),
            }
          : inv
      )
    );
    closeModal("pay-invoice-modal");
    setPaymentMethod("UPI");
    setPaymentRef("");
  };

  const handleDownloadPDF = (invoice) => {
    const content = `=========================================
INVOICE: ${invoice.id}
Graphura India Private Limited
=========================================
Project: ${invoice.project}
Invoice Date: ${invoice.date}
Due Date: ${invoice.dueDate}
Status: ${invoice.status}
${invoice.paidDate ? `Paid On: ${invoice.paidDate}\nPayment Method: ${invoice.method}\nReference: ${invoice.ref}` : ""}

LINE ITEMS:
-----------------------------------------
${invoice.items.map(item => `- ${item.description}\n  Qty: ${item.qty} | Rate: ₹${item.rate} | Amount: ₹${item.amount}`).join("\n\n")}

-----------------------------------------
Subtotal: ₹${invoice.amount}
GST (18%): ₹${invoice.tax}
Total Amount: ₹${invoice.total}
=========================================
Thank you for your business!
support@graphura.in`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Heading */}
      <Heading primaryText="My" secondaryText="Invoices" size={12} fontSize="2xl" />

      {/* Summary Cards */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Total Invoiced"  value={formatINR(totalAmount)}   icon={<IndianRupee size={22} />}  accentColor="#2a465a" size={3} />
        <EnhancedDashCard title="Paid"            value={formatINR(paidAmount)}    icon={<CheckCircle2 size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Pending"         value={formatINR(pendingAmount)} icon={<Clock size={22} />}        accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Overdue"         value={formatINR(overdueAmount)} icon={<AlertTriangle size={22} />} accentColor="#f43f5e" size={3} />
      </DashGrid>

      {/* Invoices Table */}
      <DataTable
        title="All Invoices"
        columns={[
          { key: "id",           label: "Invoice #" },
          { key: "project",      label: "Project" },
          { key: "date",         label: "Date" },
          { key: "dueDate",      label: "Due Date" },
          { key: "displayTotal", label: "Total (incl. GST)" },
          { key: "status",       label: "Status" },
        ]}
        rows={tableRows}
        size={12}
        pageSize={6}
        searchable
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Paid", "Pending", "Overdue"] },
        ]}
        actions={[
          {
            icon: <CreditCard size={14} />,
            tooltip: "Pay Invoice",
            variant: "success",
            show: (row) => row.status === "Pending" || row.status === "Overdue",
            onClick: (row) => {
              setSelected(row);
              openModal("pay-invoice-modal");
            },
          },
          {
            icon: <Eye size={14} />,
            tooltip: "View Invoice",
            variant: "ghost",
            onClick: (row) => {
              setSelected(row);
              openModal("view-invoice-modal");
            },
          },
          {
            icon: <Download size={14} />,
            tooltip: "Download",
            variant: "ghost",
            onClick: (row) => handleDownloadPDF(row),
          },
        ]}
      />

      {/* ── Modal: Invoice Detail ── */}
      <Modal id="view-invoice-modal" title="Invoice Details" size="lg">
        {selected && (() => {
          return (
            <div className="flex flex-col gap-5">

              {/* Header bar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2a465a]/10 flex items-center justify-center">
                    <FileText size={18} className="text-[#2a465a]" />
                  </div>
                  <div>
                    <p className="text-base font-black text-[#1e293b]">{selected.id}</p>
                    <p className="text-[11px] text-slate-400">{selected.project}</p>
                  </div>
                </div>
                <StatusPill status={selected.status} cfgMap={INVOICE_STATUS_CFG} />
              </div>

              {/* Invoice info */}
              <ModalGrid title="Invoice Info" cols={3}>
                <ModalData label="Invoice Date" value={selected.date} />
                <ModalData label="Due Date"     value={selected.dueDate} />
                <ModalData label="Status"       value={selected.status} />
                <ModalData label="Project"      value={selected.project} />
                <ModalData label="Project ID"   value={selected.projectId} />
                {selected.paidDate && <ModalData label="Paid On" value={selected.paidDate} />}
              </ModalGrid>

              {/* Line items */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <p className="text-xs font-bold text-[#1e293b]">Line Items</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {selected.items.map((item, idx) => (
                    <div key={idx} className="px-5 py-3 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1e293b] font-medium truncate">{item.description}</p>
                        <p className="text-[11px] text-slate-400">Qty: {item.qty} × {formatINR(item.rate)}</p>
                      </div>
                      <p className="text-sm font-bold text-[#1e293b] flex-shrink-0">{formatINR(item.amount)}</p>
                    </div>
                  ))}
                </div>
                {/* Totals */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatINR(selected.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>GST (18%)</span>
                    <span className="font-bold">{formatINR(selected.tax)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-[#1e293b] pt-1 border-t border-slate-200">
                    <span>Total</span>
                    <span>{formatINR(selected.total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment info */}
              {selected.status === "Paid" && (
                <ModalGrid title="Payment Details" cols={3}>
                  <ModalData label="Method"    value={selected.method} />
                  <ModalData label="Reference" value={selected.ref} />
                  <ModalData label="Paid On"   value={selected.paidDate} />
                </ModalGrid>
              )}

              {selected.status === "Pending" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm font-bold text-amber-700">Payment Due by {selected.dueDate}</p>
                  <p className="text-xs text-amber-600 mt-1">Please complete the payment before the due date to avoid delays.</p>
                </div>
              )}

              {selected.status === "Overdue" && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                  <p className="text-sm font-bold text-rose-700">⚠ This invoice is overdue</p>
                  <p className="text-xs text-rose-600 mt-1">Due date was {selected.dueDate}. Please make the payment at your earliest convenience or contact support.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <Button
                  text="Close"
                  variant="ghost"
                  size={3}
                  onClick={() => closeModal("view-invoice-modal")}
                />
                <Button
                  text="Download"
                  variant="primary"
                  size={4}
                  onClick={() => handleDownloadPDF(selected)}
                />
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Modal: Pay Invoice ── */}
      <Modal id="pay-invoice-modal" title="Pay Invoice" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-400">INVOICE TO PAY</p>
              <p className="text-base font-black text-[#1e293b] mt-1">{selected.id}</p>
              <p className="text-sm font-black text-[#2a465a] mt-1">Amount Due: {formatINR(selected.total)}</p>
            </div>
            
            <SelectField
              label="Payment Method *"
              id="pay-method"
              size={12}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              searchable={false}
            >
              <Option value="UPI" label="UPI" />
              <Option value="Net Banking" label="Net Banking" />
              <Option value="Credit/Debit Card" label="Credit/Debit Card" />
            </SelectField>

            <DataField
              label="Transaction / Reference ID *"
              id="pay-ref"
              placeholder="e.g. RZPY123456789"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              size={12}
            />

            {paymentError && (
              <p className="text-xs text-rose-600 font-bold px-1">{paymentError}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                text="Cancel"
                variant="secondary"
                size={3}
                onClick={() => { closeModal("pay-invoice-modal"); setPaymentError(""); }}
              />
              <Button
                text="Confirm Payment"
                variant="primary"
                size={4}
                onClick={handleConfirmPayment}
              />
            </div>
          </div>
        )}
      </Modal>


    </main>
  );
}
