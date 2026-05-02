import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X, User, IndianRupee, CreditCard, Calendar,
  FileText, CheckCircle2, XCircle, Clock,
  RefreshCw, Download, Building,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  Success: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", Icon: CheckCircle2 },
  Failed:  { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    Icon: XCircle      },
  Pending: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   Icon: Clock        },
};
const MODE_ICON = { UPI: "🔵", Card: "💳", Cash: "💵", "Bank Transfer": "🏦" };

const fmt     = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtDate = (d) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

// ── Info row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ Icon, label, value, valueClass = "" }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={13} className="text-slate-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 text-[#1a2e3f] ${valueClass}`}>{value}</p>
    </div>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
export default function PaymentDetailsPanel({ payment, onClose, onRetry, addToast }) {
  const [retrying, setRetrying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!payment) return null;

  const cfg = STATUS_CFG[payment.status] || STATUS_CFG.Pending;
  const { Icon: StatusIcon } = cfg;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry(payment);
    } finally {
      setRetrying(false);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("INVOICE", 14, 22);
      doc.setFontSize(11);
      doc.text(`Transaction ID: ${payment.id}`, 14, 32);
      doc.text(`Client Name:    ${payment.clientName}`, 14, 38);
      doc.text(`Date:           ${new Date(payment.date).toLocaleDateString()}`, 14, 44);
      doc.text(`Status:         ${payment.status}`, 14, 50);
      doc.text(`Mode:           ${payment.mode}`, 14, 56);
      doc.text(`Invoice ID:     ${payment.invoiceId}`, 14, 62);
      autoTable(doc, {
        startY: 72,
        head: [["Description", "Amount"]],
        body: [["Payment for Services", `Rs. ${payment.amount}`]],
        theme: "striped",
        headStyles: { fillColor: [26, 46, 63] },
      });
      doc.save(`${payment.id}_Invoice.pdf`);
      addToast(`Invoice ${payment.invoiceId} downloaded.`, "success");
    } catch {
      addToast("Failed to generate invoice PDF.", "error");
    } finally {
      setTimeout(() => setDownloading(false), 600);
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-md bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-[#1a2e3f]">Transaction Details</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{payment.id}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Status + Amount banner */}
        <div className={`flex items-center gap-3 px-5 py-3.5 ${cfg.bg} border-b ${cfg.border} flex-shrink-0`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${cfg.bg} ${cfg.border}`}>
            <StatusIcon size={18} className={cfg.text} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</p>
            <p className={`text-base font-black ${cfg.text}`}>{payment.status}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount</p>
            <p className="text-xl font-black text-[#1a2e3f]">{fmt(payment.amount)}</p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Client Info */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Client Information</p>
            <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-1">
              <InfoRow Icon={User}     label="Client Name" value={payment.clientName} />
              <InfoRow Icon={Building} label="Assigned To" value={payment.assignedTo} />
            </div>
          </div>

          {/* Transaction Details */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Transaction Details</p>
            <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-1">
              <InfoRow Icon={IndianRupee} label="Amount"       value={fmt(payment.amount)}                          valueClass="text-emerald-700 font-black" />
              <InfoRow Icon={CreditCard}  label="Payment Mode" value={`${MODE_ICON[payment.mode] || ""} ${payment.mode}`} />
              <InfoRow Icon={Calendar}    label="Date & Time"  value={fmtDate(payment.date)} />
              <InfoRow Icon={FileText}    label="Invoice ID"   value={payment.invoiceId} />
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Notes</p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-sm text-amber-800 leading-relaxed">{payment.notes}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {/* Download Invoice */}
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1a2e3f] text-white text-sm font-bold hover:bg-[#2a465a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              <Download size={14} />
              {downloading ? "Opening…" : "Download Invoice"}
            </button>

            {/* Retry (only if Failed) or Close */}
            {payment.status === "Failed" ? (
              <button onClick={handleRetry} disabled={retrying}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                <RefreshCw size={14} className={retrying ? "animate-spin" : ""} />
                {retrying ? "Retrying…" : "Retry Payment"}
              </button>
            ) : (
              <button onClick={onClose}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                Close
              </button>
            )}
          </div>
        </div>

      </div>
    </>,
    document.body
  );
}
