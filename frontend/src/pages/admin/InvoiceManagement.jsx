import React, { useState } from 'react';
import { Button, DashGrid, DataTable, PanelModal as Modal, openModal, closeModal, P, InputField, ModalGrid, ModalData } from '../../components/shared/Common_Components';
import { Eye, Download, Building2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InvoiceManagement({ isEmbedded }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [newInvoice, setNewInvoice] = useState({ client: '', amount: '' });

  const rawInvoices = [
    { idText: 'INV-2023-001', client: 'Acme Corp', date: 'Oct 24, 2023', amount: '1,200.00', status: 'Paid', items: [{desc: 'Consulting Services', qty: 10, rate: 100}, {desc: 'Server Setup', qty: 1, rate: 200}] },
    { idText: 'INV-2023-002', client: 'Global Tech', date: 'Oct 25, 2023', amount: '3,450.00', status: 'Pending', items: [{desc: 'Annual Software License', qty: 1, rate: 3000}, {desc: 'Premium Support', qty: 3, rate: 150}] },
    { idText: 'INV-2023-003', client: 'Stark Ind.', date: 'Oct 26, 2023', amount: '890.00', status: 'Overdue', items: [{desc: 'Security Audit', qty: 1, rate: 890}] },
    { idText: 'INV-2023-004', client: 'Wayne Ent.', date: 'Oct 27, 2023', amount: '4,500.00', status: 'Paid', items: [{desc: 'Custom Infrastructure', qty: 1, rate: 4500}] },
    { idText: 'INV-2023-005', client: 'Oscorp', date: 'Oct 28, 2023', amount: '2,100.00', status: 'Pending', items: [{desc: 'Cloud Migration', qty: 1, rate: 2100}] },
  ];

  const columns = [
    { key: "idText", label: "Invoice ID", width: "20%" },
    { key: "client", label: "Client", width: "25%" },
    { key: "date", label: "Date", width: "20%" },
    { key: "amount", label: "Amount", width: "20%" },
    { key: "status", label: "Status", width: "15%" }
  ];

  const invoices = rawInvoices.map(inv => ({
    ...inv,
    status: inv.status === 'Paid' ? 'Paid' : inv.status === 'Pending' ? 'Pending' : 'Unpaid'
  }));

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    openModal('view-invoice-modal');
  };

  const handleCreateInvoice = () => {
    closeModal('create-invoice-modal');
    setNewInvoice({ client: '', amount: '' });
  };

  const handleDownloadInvoice = (invoice) => {
    try {
      const doc = new jsPDF();
      doc.text(`Invoice Report - ${invoice.idText}`, 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [['Invoice ID', 'Client', 'Date', 'Amount', 'Status']],
        body: [
          [invoice.idText, invoice.client, invoice.date, invoice.amount, invoice.status]
        ],
      });
      doc.save(`${invoice.idText}_report.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <div className={`w-full ${isEmbedded ? '' : 'space-y-6'}`}>

      <div className="flex flex-col gap-4 mb-4 w-full">
        <div className="flex justify-end gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="primary" text="Create Invoice" onClick={() => openModal('create-invoice-modal')} />
          </div>
        </div>
      </div>

      <div className="w-full">
        <DataTable
          title="All Invoices"
          columns={columns}
          rows={invoices}
          actions={[
            { icon: <Eye size={16} />, tooltip: "View", variant: "ghost", onClick: (row) => handleViewInvoice(row) },
            { icon: <Download size={16} />, tooltip: "Download", variant: "primary", onClick: (row) => handleDownloadInvoice(row) }
          ]}
          size={12}
          pageSize={10}
          hideTopBar={false}
          hidePagination={true}
          searchable={true}
          filters={[
            { title: "Client", key: "client", type: "text" },
            { title: "Status", key: "status", type: "select", options: ["Paid", "Pending", "Unpaid"] }
          ]}
        />
      </div>

      <Modal id="view-invoice-modal" title="Invoice Preview" size="xl">
        {selectedInvoice && (
          <div className="space-y-6 pt-4">
            
            {/* Invoice Document Wrapper */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-10 font-sans">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
                <div>
                  <div className="flex items-center gap-2 text-[#2a465a] mb-2">
                    <Building2 size={28} />
                    <span className="text-2xl font-black tracking-tight">Graphura India</span>
                  </div>
                  <p className="text-sm text-slate-500">123 Tech Park, Sector 4<br />Mumbai, Maharashtra 400001<br />GSTIN: 27AADCB2230M1Z2</p>
                </div>
                <div className="sm:text-right">
                  <h1 className="text-3xl font-black text-slate-800 uppercase tracking-widest mb-2">INVOICE</h1>
                  <p className="text-sm font-bold text-slate-500">#{selectedInvoice.idText}</p>
                  <p className="text-sm text-slate-500 mt-1">Date: <span className="font-semibold text-slate-800">{selectedInvoice.date}</span></p>
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                      selectedInvoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      selectedInvoice.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="py-8 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</p>
                <h3 className="text-lg font-bold text-slate-800">{selectedInvoice.client}</h3>
                <p className="text-sm text-slate-500 mt-1">Attn: Accounts Payable<br />Client Address Line 1<br />City, State, Zip Code</p>
              </div>

              {/* Items Table */}
              <div className="py-8">
                <div className="overflow-x-auto">
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
                      {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-4 text-slate-700 font-medium">{item.desc}</td>
                          <td className="py-4 text-slate-600 text-center">{item.qty}</td>
                          <td className="py-4 text-slate-600 text-right">${item.rate.toFixed(2)}</td>
                          <td className="py-4 text-slate-800 font-semibold text-right">${(item.qty * item.rate).toFixed(2)}</td>
                        </tr>
                      ))}
                      {/* Fallback if no items array exists */}
                      {!selectedInvoice.items && (
                         <tr>
                          <td className="py-4 text-slate-700 font-medium">Standard Service Fee</td>
                          <td className="py-4 text-slate-600 text-center">1</td>
                          <td className="py-4 text-slate-600 text-right">${selectedInvoice.amount}</td>
                          <td className="py-4 text-slate-800 font-semibold text-right">${selectedInvoice.amount}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-4">
                <div className="w-full sm:w-64 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium">${selectedInvoice.amount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (0%)</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-800 pt-3 border-t-2 border-slate-800">
                    <span>Total</span>
                    <span>${selectedInvoice.amount}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-slate-100 text-center sm:text-left text-xs text-slate-400">
                <p>Thank you for your business. Please make payment within 30 days of receiving this invoice.</p>
              </div>

            </div>

            <div className="flex justify-end gap-3">
              <div onClick={() => closeModal('view-invoice-modal')}>
                <Button variant="ghost" text="Close Preview" />
              </div>
              <div onClick={() => handleDownloadInvoice(selectedInvoice)}>
                <Button variant="primary" text="Download PDF" />
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal id="create-invoice-modal" title="Create Invoice" size="md">
        <div className="space-y-6 pt-4">
          <P text="Submit a new invoice record." size="sm" className="text-slate-500 mb-2" />
          <InputField
            type="text"
            placeholder="Client Name e.g. Acme Corp"
            value={newInvoice.client}
            onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })}
          />
          <InputField
            type="number"
            placeholder="Amount ($)"
            value={newInvoice.amount}
            onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
          />
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
            <div onClick={() => closeModal('create-invoice-modal')}>
              <Button variant="ghost" text="Cancel" />
            </div>
            <div onClick={handleCreateInvoice}>
              <Button variant="primary" text="Create Invoice" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
