import { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable, Button,
  Modal, ModalProfile, ModalGrid, ModalData,
  DataField, SelectField, Option,
  openModal, closeModal,
} from "../../components/shared/Common_Components";
import { FileText, CheckCircle, XCircle, Clock, DollarSign, Eye, Pencil, Download, Send } from "lucide-react";

/*
  PDF Generation uses the browser's print API (window.print) via a hidden iframe.
  No external package required. For advanced PDF (jsPDF), install:
    npm install jspdf
  and import { jsPDF } from "jspdf";
*/

// ── Dummy Data ────────────────────────────────────────────────────────────────
const initialInvoices = [
  { id: "INV-2025-001", client: "Arjun Mehta", mobile: "9876543210", email: "arjun@example.com", item: "Brand Website", amount: 45000, gstPct: 18, discount: 0, status: "Paid", date: "2025-07-08", notes: "Website redesign project." },
  { id: "INV-2025-002", client: "Priya Sharma", mobile: "9823456789", email: "priya@example.com", item: "ERP Customization", amount: 82500, gstPct: 18, discount: 5000, status: "Unpaid", date: "2025-07-09", notes: "Phase 1 delivery." },
  { id: "INV-2025-003", client: "Rohan Gupta", mobile: "9812398123", email: "rohan@gupta.com", item: "Google Ads", amount: 30000, gstPct: 18, discount: 0, status: "Paid", date: "2025-07-10", notes: "" },
  { id: "INV-2025-004", client: "TechNova Pvt", mobile: "9988776655", email: "contact@technova.in", item: "Cloud Migration", amount: 250000, gstPct: 18, discount: 10000, status: "Pending", date: "2025-07-11", notes: "Corporate invoice." },
  { id: "INV-2025-005", client: "Kavya Nair", mobile: "9012345678", email: "kavya@nair.com", item: "Brand Design", amount: 45000, gstPct: 18, discount: 2000, status: "Paid", date: "2025-07-12", notes: "Logo + brand kit." },
];

const calcGst = (amount, gstPct) => Math.round(amount * gstPct / 100);
const calcTotal = (amount, gstPct, discount) => amount + calcGst(amount, gstPct) - discount;

const statusColor = (s) => {
  if (s === "Paid") return "bg-emerald-100 text-emerald-700";
  if (s === "Unpaid") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
};

// ── PDF Generator (iframe print method) ──────────────────────────────────────
function downloadInvoicePDF(inv) {
  const gst = calcGst(inv.amount, inv.gstPct);
  const total = calcTotal(inv.amount, inv.gstPct, inv.discount);
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Invoice ${inv.id}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; background:#fff; padding:40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
  .company h1 { font-size:24px; font-weight:900; color:#2a465a; }
  .company p { font-size:12px; color:#64748b; margin-top:4px; }
  .invoice-meta { text-align:right; }
  .invoice-meta h2 { font-size:20px; font-weight:800; color:#2a465a; }
  .invoice-meta p { font-size:12px; color:#64748b; }
  .divider { border:none; border-top:2px solid #e2e8f0; margin:24px 0; }
  .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#94a3b8; margin-bottom:8px; }
  .client-info { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin-bottom:24px; }
  .client-info p { font-size:13px; color:#334155; margin:2px 0; }
  .client-info strong { color:#2a465a; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  thead { background:#2a465a; }
  thead th { color:#fff; text-align:left; padding:10px 12px; font-size:12px; font-weight:700; }
  tbody tr:nth-child(even) { background:#f8fafc; }
  tbody td { padding:10px 12px; font-size:13px; color:#334155; border-bottom:1px solid #e2e8f0; }
  .totals { width:260px; margin-left:auto; }
  .totals tr td { padding:6px 12px; font-size:13px; }
  .totals tr:last-child td { font-weight:900; font-size:15px; color:#2a465a; border-top:2px solid #2a465a; }
  .status-badge { display:inline-block; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:700;
    background:${inv.status === 'Paid' ? '#d1fae5' : inv.status === 'Unpaid' ? '#fee2e2' : '#fef3c7'};
    color:${inv.status === 'Paid' ? '#065f46' : inv.status === 'Unpaid' ? '#991b1b' : '#92400e'};
  }
  .footer { margin-top:32px; text-align:center; font-size:11px; color:#94a3b8; }
  @media print { body { padding:20px; } }
</style>
</head>
<body>
<div class="header">
  <div class="company">
    <h1>YourCRM Solutions</h1>
    <p>123 Business Park, Mumbai, India 400001</p>
    <p>billing@yourcrm.in | +91 98000 00000</p>
    <p>GSTIN: 27AAAAA0000A1Z5</p>
  </div>
  <div class="invoice-meta">
    <h2>TAX INVOICE</h2>
    <p><strong>Invoice #:</strong> ${inv.id}</p>
    <p><strong>Date:</strong> ${inv.date}</p>
    <p><strong>Status:</strong> <span class="status-badge">${inv.status}</span></p>
  </div>
</div>
<hr class="divider"/>
<div class="section-title">Bill To</div>
<div class="client-info">
  <p><strong>${inv.client}</strong></p>
  <p>Email: ${inv.email}</p>
  <p>Mobile: ${inv.mobile}</p>
</div>
<div class="section-title">Items / Services</div>
<table>
  <thead>
    <tr><th>#</th><th>Description</th><th>Amount (₹)</th><th>GST (${inv.gstPct}%)</th><th>Total (₹)</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>${inv.item}</td>
      <td>₹${inv.amount.toLocaleString()}</td>
      <td>₹${gst.toLocaleString()}</td>
      <td>₹${(inv.amount + gst).toLocaleString()}</td>
    </tr>
  </tbody>
</table>
<table class="totals">
  <tr><td>Subtotal</td><td>₹${inv.amount.toLocaleString()}</td></tr>
  <tr><td>GST (${inv.gstPct}%)</td><td>₹${gst.toLocaleString()}</td></tr>
  <tr><td>Discount</td><td>- ₹${inv.discount.toLocaleString()}</td></tr>
  <tr><td><strong>Grand Total</strong></td><td><strong>₹${total.toLocaleString()}</strong></td></tr>
</table>
<hr class="divider"/>
${inv.notes ? `<p style="font-size:12px;color:#64748b;margin-bottom:16px;"><strong>Notes:</strong> ${inv.notes}</p>` : ""}
<p style="font-size:12px;color:#334155;"><strong>Terms:</strong> Payment due within 15 days of invoice date. Late payments incur 1.5% monthly interest.</p>
<div class="footer">
  <p>Thank you for your business! · YourCRM Solutions · www.yourcrm.in</p>
</div>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "800px";
  iframe.style.height = "600px";
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
}

export default function Invoices() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const total = invoices.length;
  const paid = invoices.filter(i => i.status === "Paid").length;
  const unpaid = invoices.filter(i => i.status === "Unpaid").length;
  const pending = invoices.filter(i => i.status === "Pending").length;
  const totalAmt = invoices.reduce((acc, i) => acc + calcTotal(i.amount, i.gstPct, i.discount), 0);

  const openView = (row) => { setSelected(row); openModal("inv-view"); };
  const openEdit = (row) => {
    setSelected(row);
    setEditForm({ client: row.client, item: row.item, amount: row.amount, gstPct: row.gstPct, discount: row.discount, status: row.status, notes: row.notes });
    openModal("inv-edit");
  };
  const saveEdit = () => {
    const amt = parseFloat(editForm.amount) || 0;
    const gst = parseFloat(editForm.gstPct) || 0;
    const disc = parseFloat(editForm.discount) || 0;
    setInvoices(prev => prev.map(i => i.id === selected.id ? { ...i, ...editForm, amount: amt, gstPct: gst, discount: disc } : i));
    closeModal("inv-edit");
  };

  const columns = [
    { key: "id", label: "Invoice ID" },
    { key: "client", label: "Client Name" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "amount", label: "Amount", render: v => `₹${v.toLocaleString()}` },
    { key: "gstPct", label: "GST", render: v => `${v}%` },
    { key: "id", label: "Total", render: (_, row) => `₹${calcTotal(row.amount, row.gstPct, row.discount).toLocaleString()}` },
    { key: "status", label: "status", render: v => <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(v)}`}>{v}</span> },
    { key: "date", label: "Invoice Date" },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      {toast && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 text-sm font-semibold">{toast}</div>}

      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Invoices" secondaryText="Management" size={12} />
        <DashCard title="Total Invoices" value={total} icon={<FileText size={22} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Paid" value={paid} icon={<CheckCircle size={22} />} accentColor="#22c55e" size={2} />
        <DashCard title="Unpaid" value={unpaid} icon={<XCircle size={22} />} accentColor="#f43f5e" size={2} />
        <DashCard title="Pending" value={pending} icon={<Clock size={22} />} accentColor="#f59e0b" size={2} />
        <DashCard title="Total Invoice Amt" value={`₹${(totalAmt / 100000).toFixed(1)}L`} icon={<DollarSign size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      <DataTable
        title="All Invoices"
        columns={columns}
        rows={invoices}
        pageSize={10}
        actions={[
          { icon: <Eye size={15}/>,      tooltip: "View / Preview",  variant: "ghost",   onClick: openView },
          { icon: <Pencil size={15}/>,   tooltip: "Edit Invoice",    variant: "primary", onClick: openEdit },
          { icon: <Download size={15}/>, tooltip: "Download PDF",    variant: "ghost",   onClick: (row) => downloadInvoicePDF(row) },
          { icon: <Send size={15}/>,     tooltip: "Send Invoice",    variant: "success", onClick: (row) => showToast(`✅ Invoice ${row.id} sent to ${row.email}`) },
        ]}
      />

      {/* View Modal — Invoice Preview */}
      <Modal id="inv-view" title="Invoice Preview" size="xl">
        {selected && (() => {
          const gst = calcGst(selected.amount, selected.gstPct);
          const total = calcTotal(selected.amount, selected.gstPct, selected.discount);
          return (
            <div className="flex flex-col gap-4">
              {/* Company Header */}
              <div className="bg-[#2a465a] rounded-2xl p-5 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black">YourCRM Solutions</h2>
                    <p className="text-xs text-white/70 mt-1">123 Business Park, Mumbai · billing@yourcrm.in</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">TAX INVOICE</p>
                    <p className="text-xs text-white/70">{selected.id} · {selected.date}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor(selected.status)}`}>{selected.status}</span>
                  </div>
                </div>
              </div>
              <ModalProfile name={selected.client} subtitle={selected.email} meta={`Mobile: ${selected.mobile}`} />
              <ModalGrid title="Services / Items" cols={2}>
                <ModalData label="Item / Service" value={selected.item} />
                <ModalData label="Subtotal" value={`₹${selected.amount.toLocaleString()}`} />
                <ModalData label={`GST (${selected.gstPct}%)`} value={`₹${gst.toLocaleString()}`} />
                <ModalData label="Discount" value={`₹${selected.discount.toLocaleString()}`} />
              </ModalGrid>
              <div className="bg-[#2a465a]/5 border border-[#2a465a]/20 rounded-2xl px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-bold text-[#2a465a]">Grand Total</span>
                <span className="text-xl font-black text-[#2a465a]">₹{total.toLocaleString()}</span>
              </div>
              {selected.notes && <ModalGrid title="Notes" cols={1}><ModalData label="Notes" value={selected.notes} /></ModalGrid>}
              <ModalGrid title="Terms" cols={1}><ModalData label="Terms" value="Payment due within 15 days. Late payments incur 1.5% monthly interest." /></ModalGrid>
              <div className="flex gap-3 justify-end pt-2">
                <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("inv-view")} />
                <Button text="Download PDF" variant="primary" size={3} onClick={() => downloadInvoicePDF(selected)} />
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Edit Modal */}
      <Modal id="inv-edit" title="Edit Invoice" size="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.client} subtitle={`Invoice: ${selected.id}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataField label="Client Name" id="inv-client" value={editForm.client} onChange={e => setEditForm(p => ({ ...p, client: e.target.value }))} size={12} />
              <DataField label="Service / Item" id="inv-item" value={editForm.item} onChange={e => setEditForm(p => ({ ...p, item: e.target.value }))} size={12} />
              <DataField label="Amount (₹)" id="inv-amount" type="number" value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} size={12} />
              <DataField label="GST (%)" id="inv-gst" type="number" value={editForm.gstPct} onChange={e => setEditForm(p => ({ ...p, gstPct: e.target.value }))} size={12} />
              <DataField label="Discount (₹)" id="inv-disc" type="number" value={editForm.discount} onChange={e => setEditForm(p => ({ ...p, discount: e.target.value }))} size={12} />
              <SelectField label="Payment Status" id="inv-status" value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                <Option value="Paid" label="Paid" />
                <Option value="Unpaid" label="Unpaid" />
                <Option value="Pending" label="Pending" />
              </SelectField>
              <DataField label="Notes" id="inv-notes" type="textarea" value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} size={12} />
            </div>
            {/* Live Total Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-500">Calculated Total</span>
              <span className="text-lg font-black text-[#2a465a]">
                ₹{calcTotal(parseFloat(editForm.amount) || 0, parseFloat(editForm.gstPct) || 0, parseFloat(editForm.discount) || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("inv-edit")} />
              <Button text="Save Changes" variant="primary" size={3} onClick={saveEdit} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}