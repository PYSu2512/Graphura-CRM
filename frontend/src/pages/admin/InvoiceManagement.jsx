/**
 * InvoiceManagement — read-only view of invoices from real backend
 * Create Invoice button removed per requirements
 */

import { useState, useEffect, useCallback } from "react";
import { Eye, Download, Building2, RefreshCw } from "lucide-react";
import {
  DataTable, PanelModal as Modal, openModal, closeModal, Button,
} from "../../components/shared/Common_Components";
import apiClient from "../../services/apiClient";

export default function InvoiceManagement({ isEmbedded }) {
  const [invoices,  setInvoices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selInvoice,setSelInvoice]= useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/invoices");
      setInvoices(res.data?.data?.invoices || []);
    } catch (err) {
      console.error("Invoice load error:", err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDownload = (inv) => {
    try {
      const csv = `Invoice ID,Client,Date,Amount,Status\n${inv.idText},${inv.client},${inv.date},${inv.amount},${inv.status}`;
      const a = document.createElement("a");
      a.href = encodeURI("data:text/csv;charset=utf-8," + csv);
      a.download = `${inv.idText}.csv`;
      a.click();
    } catch {}
  };

  const columns = [
    { key: "idText",  label: "Invoice ID", width: "20%" },
    { key: "client",  label: "Client",     width: "25%" },
    { key: "date",    label: "Date",        width: "20%" },
    { key: "amount",  label: "Amount",      width: "20%" },
    { key: "status",  label: "Status",      width: "15%" },
  ];

  return (
    <div className={`w-full ${isEmbedded ? "" : "space-y-6"}`}>
      <div className="flex justify-end mb-4">
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <DataTable
        title="All Invoices"
        columns={columns}
        rows={invoices}
        loading={loading}
        actions={[
          {
            icon: <Eye size={16} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setSelInvoice(invoices.find((i) => i.id === row.id) || row); openModal("view-invoice-modal"); },
          },
          {
            icon: <Download size={16} />, tooltip: "Download CSV", variant: "primary",
            onClick: (row) => handleDownload(row),
          },
        ]}
        size={12} pageSize={10} searchable
        filters={[
          { title: "Status", key: "status", type: "toggle", options: ["Paid","Pending","Unpaid","Draft","Cancelled"] },
        ]}
      />

      {/* View Invoice Modal */}
      <Modal id="view-invoice-modal" title="Invoice Preview" size="xl">
        {selInvoice && (
          <div className="space-y-6 pt-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 font-sans">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
                <div>
                  <div className="flex items-center gap-2 text-[#2a465a] mb-2">
                    <Building2 size={28} />
                    <span className="text-2xl font-black tracking-tight">Graphura India</span>
                  </div>
                  <p className="text-sm text-slate-500">123 Tech Park, Sector 4<br/>Mumbai, Maharashtra 400001</p>
                </div>
                <div className="sm:text-right">
                  <h1 className="text-3xl font-black text-slate-800 uppercase tracking-widest mb-2">INVOICE</h1>
                  <p className="text-sm font-bold text-slate-500">#{selInvoice.idText}</p>
                  <p className="text-sm text-slate-500 mt-1">Date: <span className="font-semibold text-slate-800">{selInvoice.date}</span></p>
                  {selInvoice.dueDate && (
                    <p className="text-sm text-slate-500">Due: <span className="font-semibold text-slate-800">{selInvoice.dueDate}</span></p>
                  )}
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                      selInvoice.status === "Paid"    ? "bg-emerald-100 text-emerald-700" :
                      selInvoice.status === "Pending" ? "bg-amber-100 text-amber-700"    :
                                                        "bg-rose-100 text-rose-700"
                    }`}>{selInvoice.status}</span>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="py-8 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</p>
                <h3 className="text-lg font-bold text-slate-800">{selInvoice.client}</h3>
                {selInvoice.email && <p className="text-sm text-slate-500 mt-1">{selInvoice.email}</p>}
              </div>

              {/* Items */}
              <div className="py-8">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-800">
                      <th className="py-3 font-bold text-slate-800 uppercase tracking-wider text-xs">Description</th>
                      <th className="py-3 font-bold text-slate-800 uppercase tracking-wider text-xs text-center w-24">Qty</th>
                      <th className="py-3 font-bold text-slate-800 uppercase tracking-wider text-xs text-right w-32">Rate</th>
                      <th className="py-3 font-bold text-slate-800 uppercase tracking-wider text-xs text-right w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selInvoice.items?.length > 0 ? selInvoice.items : [{ desc: "Professional Services", qty: 1, rate: parseFloat(selInvoice.amount) || 0 }]).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-4 text-slate-700 font-medium">{item.desc}</td>
                        <td className="py-4 text-slate-600 text-center">{item.qty}</td>
                        <td className="py-4 text-slate-600 text-right">₹{item.rate.toFixed(2)}</td>
                        <td className="py-4 text-slate-800 font-semibold text-right">₹{(item.qty * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-3 text-sm">
                  <div className="flex justify-between font-black text-lg text-slate-800 pt-3 border-t-2 border-slate-800">
                    <span>Total</span>
                    <span>₹{selInvoice.amount}</span>
                  </div>
                </div>
              </div>
              {selInvoice.notes && (
                <p className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">{selInvoice.notes}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <div onClick={() => closeModal("view-invoice-modal")}>
                <Button variant="ghost" text="Close Preview" />
              </div>
              <div onClick={() => handleDownload(selInvoice)}>
                <Button variant="primary" text="Download CSV" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
