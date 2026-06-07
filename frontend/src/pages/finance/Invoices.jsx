import { useCallback, useEffect, useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Button,
  Modal, ModalProfile, ModalGrid, ModalData,
  DataField, SelectField, Option,
  openModal, closeModal,
} from "../../components/shared/Common_Components";
import {
  FileText, CheckCircle, XCircle, Clock, DollarSign,
  Eye, Pencil, Download, Send, Ban, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_LABEL = { PAID: "Paid", SENT: "Unpaid", DRAFT: "Draft", OVERDUE: "Overdue", CANCELLED: "Cancelled" };
const statusColor = (s) => {
  if (s === "PAID") return "bg-emerald-100 text-emerald-700";
  if (s === "SENT") return "bg-rose-100 text-rose-700";
  if (s === "OVERDUE") return "bg-orange-100 text-orange-700";
  if (s === "CANCELLED") return "bg-slate-100 text-slate-500";
  return "bg-amber-100 text-amber-700";
};

// ── PDF Generator — uses iframe print, no external deps ──────────────────────
function printInvoicePDF(inv, company = {}) {
  const gst = inv.gstAmount || Math.round((inv.amount * (inv.gstPct || 18)) / 118);
  const total = inv.amount;
  const subtotal = total - gst;
  const fmtAmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const itemRows = (inv.lineItems || []).map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#f8fafc" : "#fff"}">
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${item.name || "Service"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.qty || 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmtAmt(item.price)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmtAmt(item.amount)}</td>
    </tr>`).join("") || `<tr><td colspan="4" style="padding:12px;color:#64748b;">Professional Services</td></tr>`;

  const statusBg = inv.status === "PAID" ? "#d1fae5" : inv.status === "SENT" ? "#dbeafe" : "#fef3c7";
  const statusFg = inv.status === "PAID" ? "#065f46" : inv.status === "SENT" ? "#1e40af" : "#92400e";
  const statusLabel = STATUS_LABEL[inv.status] || inv.status;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>Invoice ${inv.invoiceNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;padding:40px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}
  .company h1{font-size:22px;font-weight:900;color:#1e293b}
  .company p{font-size:12px;color:#64748b;margin-top:3px}
  .meta{text-align:right}
  .meta h2{font-size:18px;font-weight:900;color:#1e293b}
  .meta p{font-size:12px;color:#64748b;margin-top:3px}
  .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;background:${statusBg};color:${statusFg};margin-top:6px}
  hr{border:none;border-top:2px solid #e2e8f0;margin:20px 0}
  .section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:6px}
  .bill-to{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:20px}
  .bill-to p{font-size:13px;color:#334155;margin:2px 0}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  thead{background:#1e293b}
  thead th{color:#fff;text-align:left;padding:10px 12px;font-size:12px;font-weight:700}
  .totals{width:260px;margin-left:auto}
  .totals td{padding:6px 12px;font-size:13px}
  .totals tr:last-child td{font-weight:900;font-size:15px;color:#1e293b;border-top:2px solid #1e293b;padding-top:10px}
  .footer{margin-top:28px;text-align:center;font-size:11px;color:#94a3b8}
  @media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div class="company">
    <h1>${company.name || "Graphura CRM"}</h1>
    ${company.address?.line1 ? `<p>${company.address.line1}${company.address.city ? ", " + company.address.city : ""}</p>` : ""}
    ${company.email ? `<p>${company.email}</p>` : ""}
    ${company.phone ? `<p>${company.phone}</p>` : ""}
  </div>
  <div class="meta">
    <h2>TAX INVOICE</h2>
    <p><strong>${inv.invoiceNumber}</strong></p>
    <p>Date: ${fmtD(inv.date)}</p>
    ${inv.dueDate ? `<p>Due: ${fmtD(inv.dueDate)}</p>` : ""}
    <span class="badge">${statusLabel}</span>
  </div>
</div>
<hr/>
<div class="section-label">Bill To</div>
<div class="bill-to">
  <p><strong>${inv.client || "Client"}</strong></p>
  ${inv.companyName ? `<p>${inv.companyName}</p>` : ""}
  ${inv.email ? `<p>${inv.email}</p>` : ""}
  ${inv.mobile ? `<p>${inv.mobile}</p>` : ""}
</div>
<div class="section-label">Services / Items</div>
<table>
  <thead><tr><th>#</th><th>Description</th><th>Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${itemRows}</tbody>
</table>
<table class="totals">
  <tr><td>Subtotal (Service Amount)</td><td style="text-align:right">${fmtAmt(subtotal)}</td></tr>
  <tr><td>GST (${inv.gstPct || 18}%)</td><td style="text-align:right">${fmtAmt(gst)}</td></tr>
  ${(inv.discount || 0) > 0 ? `<tr><td>Discount</td><td style="text-align:right;color:#ef4444">- ${fmtAmt(inv.discount)}</td></tr>` : ""}
  <tr><td><strong>Grand Total</strong></td><td style="text-align:right"><strong>${fmtAmt(total)}</strong></td></tr>
</table>
${inv.notes ? `<p style="font-size:12px;color:#64748b;margin-bottom:16px"><strong>Notes:</strong> ${inv.notes}</p>` : ""}
<hr/>
<p style="font-size:12px;color:#334155"><strong>Terms:</strong> Payment due within 15 days of invoice date.</p>
<div class="footer"><p>Thank you for your business! · ${company.name || "Graphura CRM"}</p></div>
</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:800px;height:600px";
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1500);
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, draft: 0, overdue: 0, totalAmount: 0 });
  const [selected, setSelected] = useState(null);
  const [company, setCompany] = useState({});
  const [sendEmail, setSendEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  // ── Load invoices ──────────────────────────────────────────────────────────
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/finance/invoices");
      const data = res?.data?.data || {};
      setInvoices(data.invoices || []);
      setStats(data.stats || {});
    } catch (err) {
      setError(err?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load company info for PDF header ──────────────────────────────────────
  const loadCompany = useCallback(async () => {
    try {
      const res = await apiClient.get("/api-config/razorpay"); // reuse admin endpoint
      // company info comes from admin profile — fetch via a different endpoint if available
      // For now we'll get it when we fetch pdf-data for a specific invoice
    } catch {
      // silent — company info is optional
    }
  }, []);

  useEffect(() => {
    loadInvoices();
    loadCompany();
  }, [loadInvoices, loadCompany]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const openView = (row) => { setSelected(row); openModal("inv-view"); };

  const handleDownload = async (row) => {
    setActionLoading(`dl-${row.id}`);
    try {
      const res = await apiClient.get(`/finance/invoices/${row.id}/pdf-data`);
      const { invoice, company: co } = res?.data?.data || {};
      printInvoicePDF(invoice || row, co || {});
    } catch {
      // fallback — use row data directly
      printInvoicePDF(row, company);
    } finally {
      setActionLoading("");
    }
  };

  const openSend = (row) => {
    setSelected(row);
    setSendEmail(row.email || "");
    openModal("inv-send");
  };

  const handleSend = async () => {
    if (!selected) return;
    if (!sendEmail) { toast.error("Email is required"); return; }
    setActionLoading("send");
    try {
      await apiClient.post(`/finance/invoices/${selected.id}/send`, { email: sendEmail });
      toast.success(`Invoice sent to ${sendEmail}`);
      closeModal("inv-send");
      await loadInvoices();
    } catch (err) {
      toast.error(err?.message || "Failed to send invoice");
    } finally {
      setActionLoading("");
    }
  };

  const handleCancel = async (row) => {
    if (!window.confirm(`Cancel invoice ${row.invoiceNumber}? This cannot be undone.`)) return;
    setActionLoading(`cancel-${row.id}`);
    try {
      await apiClient.delete(`/finance/invoices/${row.id}`);
      toast.success("Invoice cancelled");
      await loadInvoices();
    } catch (err) {
      toast.error(err?.message || "Failed to cancel invoice");
    } finally {
      setActionLoading("");
    }
  };

  // ── Computed totals ────────────────────────────────────────────────────────
  const totalAmt = stats.totalAmount || 0;
  const totalAmtLabel = totalAmt >= 100000
    ? `₹${(totalAmt / 100000).toFixed(1)}L`
    : fmt(totalAmt);

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    { key: "invoiceNumber", label: "Invoice #" },
    { key: "client", label: "Client Name" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "amount", label: "Amount", render: (v) => fmt(v) },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(v)}`}>
          {STATUS_LABEL[v] || v}
        </span>
      ),
    },
    { key: "date", label: "Invoice Date", render: (v) => fmtDate(v) },
  ];

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Invoices" secondaryText="Management" size={12} />
        <EnhancedDashCard title="Total Invoices" value={stats.total || 0} icon={<FileText size={22} />} accentColor="#3b82f6" size={2} />
        <EnhancedDashCard title="Paid" value={stats.paid || 0} icon={<CheckCircle size={22} />} accentColor="#22c55e" size={2} />
        <EnhancedDashCard title="Unpaid" value={stats.unpaid || 0} icon={<XCircle size={22} />} accentColor="#f43f5e" size={2} />
        <EnhancedDashCard title="Pending" value={stats.draft || 0} icon={<Clock size={22} />} accentColor="#f59e0b" size={2} />
        <EnhancedDashCard title="Total Invoice Amt" value={totalAmtLabel} icon={<DollarSign size={22} />} accentColor="#8b5cf6" size={4} />
      </DashGrid>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
          <Loader2 size={18} className="animate-spin" /> Loading invoices…
        </div>
      )}

      {!loading && (
        <DataTable
          title="All Invoices"
          columns={columns}
          rows={invoices}
          pageSize={10}
          actions={[
            {
              icon: <Eye size={15} />,
              tooltip: "View / Preview",
              variant: "ghost",
              onClick: openView,
            },
            {
              icon: <Download size={15} />,
              tooltip: "Download PDF",
              variant: "ghost",
              onClick: handleDownload,
            },
            {
              icon: <Send size={15} />,
              tooltip: "Send to Client",
              variant: "success",
              onClick: openSend,
            },
            {
              icon: <Ban size={15} />,
              tooltip: "Cancel Invoice",
              variant: "danger",
              onClick: handleCancel,
            },
          ]}
        />
      )}

      {/* ── View / Preview Modal ─────────────────────────────────────────── */}
      <Modal id="inv-view" title="Invoice Preview" size="xl">
        {selected && (() => {
          const gst = selected.gstAmount || Math.round((selected.amount * (selected.gstPct || 18)) / 118);
          const total = selected.amount;
          const subtotal = total - gst;
          return (
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div className="bg-[#1e293b] rounded-2xl p-5 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black">TAX INVOICE</h2>
                    <p className="text-xs text-white/60 mt-1">{selected.invoiceNumber}</p>
                    <p className="text-xs text-white/60">{fmtDate(selected.date)}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(selected.status)}`}>
                    {STATUS_LABEL[selected.status] || selected.status}
                  </span>
                </div>
              </div>

              <ModalProfile
                name={selected.client}
                subtitle={selected.email || "—"}
                meta={`Mobile: ${selected.mobile || "—"} · ${selected.companyName || ""}`}
              />

              {/* Line items */}
              {(selected.lineItems || []).length > 0 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="text-left px-3 py-2">Description</th>
                        <th className="text-center px-3 py-2">Qty</th>
                        <th className="text-right px-3 py-2">Rate</th>
                        <th className="text-right px-3 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.lineItems.map((item, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-3 py-2 text-center">{item.qty}</td>
                          <td className="px-3 py-2 text-right">{fmt(item.price)}</td>
                          <td className="px-3 py-2 text-right">{fmt(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <ModalGrid title="Amounts" cols={2}>
                <ModalData label="Subtotal (Service Amount)" value={fmt(subtotal)} />
                <ModalData label={`GST (${selected.gstPct || 18}%)`} value={fmt(gst)} />
                <ModalData label="Discount" value={fmt(selected.discount || 0)} />
                <ModalData label="Due Date" value={fmtDate(selected.dueDate)} />
              </ModalGrid>

              <div className="bg-[#1e293b]/5 border border-[#1e293b]/20 rounded-2xl px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-bold text-[#1e293b]">Grand Total</span>
                <span className="text-xl font-black text-[#1e293b]">{fmt(total)}</span>
              </div>

              {selected.notes && (
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg px-4 py-3 text-sm text-blue-800">
                  <strong>Notes:</strong> {selected.notes}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("inv-view")} />
                <Button text="Download PDF" variant="primary" size={3} onClick={() => handleDownload(selected)} />
                <Button text="Send Email" variant="success" size={3} onClick={() => { closeModal("inv-view"); openSend(selected); }} />
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Send Email Modal ─────────────────────────────────────────────── */}
      <Modal id="inv-send" title="Send Invoice to Client" size="sm">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.client} subtitle={`Invoice: ${selected.invoiceNumber} · ${fmt(selected.amount)}`} />
            <DataField
              label="Recipient Email"
              id="send-email"
              type="email"
              value={sendEmail}
              onChange={(e) => setSendEmail(e.target.value)}
              size={12}
            />
            <p className="text-xs text-slate-500">
              The invoice will be sent as a formatted HTML email. The client can view and print it directly from their inbox.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("inv-send")} />
              <Button
                text={actionLoading === "send" ? "Sending…" : "Send Invoice"}
                variant="success"
                size={3}
                onClick={handleSend}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
