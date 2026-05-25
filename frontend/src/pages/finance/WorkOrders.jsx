import React, { useState, useEffect } from "react";
import {
  Heading, DashGrid, DashCard, DataTable, Button,
  Modal, ModalProfile, ModalGrid, ModalData,
  DataField, SelectField, Option,
  openModal, closeModal,
} from "../../components/shared/Common_Components";
import { FileText, CheckCircle, PenLine, Clock, ThumbsUp, IndianRupee, Eye, Trash2, Plus, MailCheck, ClipboardCheck } from "lucide-react";
import { workOrderStore, seedWOs } from "./Workorderstore";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─────────────────────────────────────────────────────────────────────────────
// Service catalogue (copied from Clients.jsx)
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_OPTIONS = [
  "Logo Design",
  "Brand Identity",
  "SEO",
  "Social Media Marketing",
  "Google Ads",
  "Meta Ads",
  "Website Development",
  "Landing Page",
  "Mobile App Development",
  "ERP Integration",
  "CRM Setup",
  "Content Writing",
  "Email Marketing",
  "Video Editing",
  "Photography",
  "Consulting",
];



// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const statusBadge = (val, colorMap) => {
  const cls = colorMap[val] || "bg-slate-100 text-slate-600";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{val}</span>;
};

const payBadge = (val) => {
  const map = {
    Paid:    "bg-emerald-100 text-emerald-700",
    Unpaid:  "bg-rose-100 text-rose-700",
    Advance: "bg-sky-100 text-sky-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[val] || "bg-slate-100 text-slate-600"}`}>{val || "—"}</span>;
};

const calcTotalCost = (reqs) =>
  (reqs || []).reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0);

const calcDiscountAmount = (total, mode, value) => {
  const v = parseFloat(value) || 0;
  if (mode === "Percentage") return Math.round((total * Math.min(v, 99.99)) / 100);
  if (mode === "Rupees" || mode === "Flat") return Math.min(v, total);
  return 0;
};

const calcAdvAmount = (netPayable, mode, value) => {
  const v = parseFloat(value) || 0;
  if (mode === "Percentage") return Math.round((netPayable * Math.min(v, 100)) / 100);
  if (mode === "Rupees") return Math.min(v, netPayable);
  return 0;
};

const blankAdv = () => ({ id: Date.now(), mode: "Percentage", value: "", method: "UPI" });

const blankReq = () => ({ id: Date.now(), title: "", cost: "", description: "" });

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function WorkOrders() {
  const [wos, setWos]           = useState(seedWOs);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast]       = useState("");
  
  // States for approval comment modal
  const [approveComment, setApproveComment] = useState("");

  // States for requirement drafting inside Edit Modal
  const [reqDraft, setReqDraft]         = useState(blankReq());
  const [editingReqId, setEditingReqId] = useState(null);

  // States for advance payment drafting inside Edit Modal
  const [advDraft, setAdvDraft]         = useState(blankAdv());
  const [editingAdvId, setEditingAdvId] = useState(null);

  // States for email/PDF modal
  const [editEmail, setEditEmail] = useState("");
  const [editTerms, setEditTerms] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // ── Subscribe to new work orders pushed from Clients.jsx ─────────────────
  useEffect(() => {
    // Hydrate any entries pushed before this component mounted
    const existing = workOrderStore.getAll();
    if (existing.length) setWos((prev) => mergeWOs(prev, existing));

    // Live updates
    const unsub = workOrderStore.subscribe((all) => {
      setWos((prev) => mergeWOs(prev, all));
    });
    return unsub;
  }, []);

  // Merge incoming store entries with local state (no duplicates)
  const mergeWOs = (local, incoming) => {
    const ids = new Set(local.map((w) => w.id));
    const fresh = incoming.filter((w) => !ids.has(w.id));
    return fresh.length ? [...fresh, ...local] : local; // newest first
  };

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const total          = wos.length;
  const signed         = wos.filter((w) => w.signedStatus  === "Signed").length;
  const pendingApproval= wos.filter((w) => w.approvalStatus === "Pending").length;
  const approved       = wos.filter((w) => w.approvalStatus === "Approved").length;
  const fromClients    = wos.filter((w) => !w.id.startsWith("WO-2025")).length;

  // ── Derived financials (from editForm) ──────────────────────────────────
  const totalCost     = calcTotalCost(editForm.requirements || []);
  const discountAmt   = calcDiscountAmount(totalCost, editForm.discountMode || "None", editForm.discountValue || "");
  const netPayable    = Math.max(0, totalCost - discountAmt);
  const advancePayments = editForm.advancePayments || [];
  const advancePaid   = Math.min(netPayable, advancePayments.reduce((sum, p) => sum + calcAdvAmount(netPayable, p.mode, p.value), 0));
  const remaining     = Math.max(0, netPayable - advancePaid);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openView = (row) => { setSelected(row); openModal("wo-view"); };
  
  const openEdit = (row) => {
    setSelected(row);
    let advancePaymentsList = row.advancePayments || [];
    if (advancePaymentsList.length === 0 && row.advanceAmount && parseFloat(row.advanceAmount) > 0) {
      advancePaymentsList = [
        {
          id: Date.now(),
          mode: "Rupees",
          value: String(row.advanceAmount),
          method: "UPI",
        }
      ];
    }
    setEditForm({
      deliveryDate:  row.deliveryDate  || "",
      terms:         row.terms         || "",
      approvalStatus:row.approvalStatus|| "Pending",
      signedStatus:  row.signedStatus  || "Unsigned",
      service:       row.service       || "",
      requirements:  row.requirements  || [],
      discountMode:  row.discountMode  || "None",
      discountValue: row.discountValue || "",
      paymentStatus: row.paymentStatus || "Unpaid",
      advanceAmount: row.advanceAmount || "",
      advancePayments: advancePaymentsList,
    });
    setReqDraft(blankReq());
    setEditingReqId(null);
    setAdvDraft(blankAdv());
    setEditingAdvId(null);
    openModal("wo-edit");
  };

  const ef = (field, value) =>
    setEditForm((prev) => ({ ...prev, [field]: value }));

  // ── Requirement CRUD inside editForm ──────────────────────────────────────
  const handleAddReq = () => {
    if (!reqDraft.title.trim() || !reqDraft.cost) return;

    if (editingReqId !== null) {
      ef("requirements",
        (editForm.requirements || []).map((r) =>
          r.id === editingReqId ? { ...reqDraft, id: editingReqId } : r
        )
      );
      setEditingReqId(null);
    } else {
      ef("requirements", [...(editForm.requirements || []), { ...reqDraft, id: Date.now() }]);
    }
    setReqDraft(blankReq());
  };

  const handleEditReq = (req) => {
    setReqDraft({ ...req });
    setEditingReqId(req.id);
  };

  const handleDeleteReq = (id) => {
    ef("requirements", (editForm.requirements || []).filter((r) => r.id !== id));
    if (editingReqId === id) {
      setEditingReqId(null);
      setReqDraft(blankReq());
    }
  };

  const handleCancelEditReq = () => {
    setEditingReqId(null);
    setReqDraft(blankReq());
  };

  // ── Advance Payment CRUD inside editForm ─────────────────────────────────
  const handleAddAdv = () => {
    if (!advDraft.value || parseFloat(advDraft.value) <= 0) return;

    const currentPayments = editForm.advancePayments || [];
    if (editingAdvId !== null) {
      ef("advancePayments",
        currentPayments.map((p) =>
          p.id === editingAdvId ? { ...advDraft, id: editingAdvId } : p
        )
      );
      setEditingAdvId(null);
    } else {
      ef("advancePayments", [...currentPayments, { ...advDraft, id: Date.now() }]);
    }
    setAdvDraft(blankAdv());
  };

  const handleEditAdv = (adv) => {
    setAdvDraft({ ...adv });
    setEditingAdvId(adv.id);
  };

  const handleDeleteAdv = (id) => {
    ef("advancePayments", (editForm.advancePayments || []).filter((p) => p.id !== id));
    if (editingAdvId === id) {
      setEditingAdvId(null);
      setAdvDraft(blankAdv());
    }
  };

  const handleCancelEditAdv = () => {
    setEditingAdvId(null);
    setAdvDraft(blankAdv());
  };

  // ── Save edit changes ─────────────────────────────────────────────────────
  const saveEdit = () => {
    const totalCostVal   = calcTotalCost(editForm.requirements || []);
    const discountAmtVal = calcDiscountAmount(totalCostVal, editForm.discountMode || "None", editForm.discountValue || "");
    const netPayableVal  = Math.max(0, totalCostVal - discountAmtVal);
    const advancePaymentsVal = editForm.advancePayments || [];
    const advancePaidVal = advancePaymentsVal.reduce((sum, p) => sum + calcAdvAmount(netPayableVal, p.mode, p.value), 0);

    setWos((prev) =>
      prev.map((w) =>
        w.id === selected.id
          ? {
              ...w,
              ...editForm,
              totalCost: totalCostVal,
              discountAmt: discountAmtVal,
              netPayable: netPayableVal,
              advanceAmount: String(advancePaidVal),
              advancePayments: advancePaymentsVal,
            }
          : w
      )
    );
    closeModal("wo-edit");
    showToast(`✅ Work order ${selected.id} updated successfully`);
  };

  // ── Approval Handlers ────────────────────────────────────────────────────
  const openApproveModal = (row) => {
    setSelected(row);
    setApproveComment("");
    openModal("wo-approve");
  };

  const handleApprovalAction = (status) => {
    if (!selected) return;
    if (status === "Rejected" && !approveComment.trim()) {
      return;
    }
    setWos((prev) =>
      prev.map((w) =>
        w.id === selected.id
          ? { ...w, approvalStatus: status, approvalComment: approveComment }
          : w
      )
    );
    closeModal("wo-approve");
    const emoji = status === "Approved" ? "✅" : "❌";
    showToast(`${emoji} Work order ${selected.id} has been ${status.toLowerCase()} successfully`);
  };

  const openEmailModal = (row) => {
    setSelected(row);
    setEditEmail(row.clientEmail || "");
    setEditTerms(row.terms || "");
    openModal("wo-email-pdf");
  };

  const saveEmailChanges = () => {
    if (!selected) return;
    setWos((prev) =>
      prev.map((w) =>
        w.id === selected.id
          ? { ...w, clientEmail: editEmail, terms: editTerms }
          : w
      )
    );
    closeModal("wo-email-pdf");
    showToast(`✅ Work order ${selected.id} details updated`);
  };

  const handleDownloadPDF = () => {
    if (!selected) return;
    try {
      const doc = new jsPDF();
      
      // 1. Sleek top branding accent line
      doc.setFillColor(42, 70, 90); 
      doc.rect(0, 0, 210, 8, "F");
      
      // Company Info Header
      doc.setTextColor(42, 70, 90);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("GRAPHURA INDIA PVT LTD", 14, 22);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 120, 130);
      doc.text("CRM & ERP Development Suite | Work Order Document", 14, 29);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(42, 70, 90);
      doc.text("WORK ORDER", 196, 23, { align: "right" });
      
      // Decorative line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 34, 196, 34);
      
      // 2. Metadata Panels (Client info + Document info)
      // Left Card: Client info
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 40, 88, 38, 3, 3, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 40, 88, 38, 3, 3, "S");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("CLIENT INFORMATION", 19, 46);
      doc.line(19, 48, 97, 48);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(selected.client, 19, 54);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Email: ${editEmail}`, 19, 60);
      doc.text(`Mobile: ${selected.clientMobile || "—"}`, 19, 66);
      doc.text(`Sales Executive: ${selected.salesExec || "—"}`, 19, 72);
      
      // Right Card: Document details
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(108, 40, 88, 38, 3, 3, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(108, 40, 88, 38, 3, 3, "S");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("DOCUMENT DETAILS", 113, 46);
      doc.line(113, 48, 191, 48);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`WO ID: ${selected.id}`, 113, 54);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Generated Date: ${selected.generatedDate}`, 113, 60);
      doc.text(`Service Type: ${selected.service || "—"}`, 113, 66);
      doc.text(`Approval Status: ${selected.approvalStatus || "Pending"}`, 113, 72);
      
      // 3. Requirements table
      const tableHead = [["Requirement", "Description", "Cost"]];
      const tableBody = (selected.requirements || []).map((r) => [
        r.title,
        r.description || "—",
        `Rs. ${Number(r.cost).toLocaleString("en-IN")}`
      ]);
      
      if (tableBody.length === 0) {
        tableBody.push(["No requirements specified", "—", "Rs. 0"]);
      }
      
      autoTable(doc, {
        startY: 84,
        head: tableHead,
        body: tableBody,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: [30, 41, 59],
          lineColor: [241, 245, 249],
          lineWidth: 0.5,
          font: "helvetica"
        },
        headStyles: {
          fillColor: [42, 70, 90],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: "bold" },
          1: { cellWidth: 90 },
          2: { cellWidth: 42, halign: "right", fontStyle: "bold" }
        }
      });
      
      // 4. Financial & Payment Summary blocks below the table
      let finalY = doc.lastAutoTable.finalY + 10;
      
      // Page break check
      if (finalY + 80 > 280) {
        doc.addPage();
        finalY = 20;
      }
      
      // Left Card: Payment summary
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, finalY, 88, 36, 2, 2, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, finalY, 88, 36, 2, 2, "S");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("PAYMENT SUMMARY", 19, finalY + 6);
      doc.line(19, finalY + 8, 97, finalY + 8);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Payment Status: ${selected.paymentStatus}`, 19, finalY + 14);
      if (selected.paymentStatus === "Advance") {
        doc.text(`Advance Paid: Rs. ${Number(selected.advanceAmount || 0).toLocaleString("en-IN")}`, 19, finalY + 20);
        const remainingAmt = Math.max(0, selected.netPayable - (parseFloat(selected.advanceAmount) || 0));
        doc.text(`Remaining Balance: Rs. ${remainingAmt.toLocaleString("en-IN")}`, 19, finalY + 26);
      }
      
      // Right Card: Financial summary
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(108, finalY, 88, 36, 2, 2, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(108, finalY, 88, 36, 2, 2, "S");
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Total Cost:", 113, finalY + 7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`Rs. ${Number(selected.totalCost || 0).toLocaleString("en-IN")}`, 191, finalY + 7, { align: "right" });
      
      let discountOffset = 0;
      if (selected.discountAmt > 0) {
        const discLabel = selected.discountMode === "Percentage" 
          ? `Discount (${selected.discountValue}%):` 
          : "Discount:";
        doc.setFont("helvetica", "normal");
        doc.text(discLabel, 113, finalY + 13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(239, 68, 68);
        doc.text(`- Rs. ${Number(selected.discountAmt || 0).toLocaleString("en-IN")}`, 191, finalY + 13, { align: "right" });
        discountOffset = 6;
      }
      
      // Highlight Block for Net Payable
      doc.setFillColor(240, 253, 250);
      doc.rect(108.5, finalY + 22.5, 87, 12.5, "F");
      doc.setDrawColor(204, 251, 241);
      doc.rect(108.5, finalY + 22.5, 87, 12.5, "S");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(13, 148, 136);
      doc.text("Net Payable Amount:", 113, finalY + 31);
      doc.setFontSize(10.5);
      doc.text(`Rs. ${Number(selected.netPayable || 0).toLocaleString("en-IN")}`, 191, finalY + 31, { align: "right" });
      
      // 5. Terms & Conditions
      finalY += 42;
      if (editTerms) {
        if (finalY + 40 > 280) {
          doc.addPage();
          finalY = 20;
        }
        
        doc.setDrawColor(226, 232, 240);
        doc.line(14, finalY, 196, finalY);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(42, 70, 90);
        doc.text("TERMS & CONDITIONS", 14, finalY + 7);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 110, 120);
        
        const splitTerms = doc.splitTextToSize(editTerms, 182);
        doc.text(splitTerms, 14, finalY + 13);
      }
      
      // 6. Signatures (will render at bottom of current page)
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 256, 74, 256);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 110, 120);
      doc.text("Client's Authorized Signature", 14, 262);
      
      doc.line(136, 256, 196, 256);
      doc.text("Authorized Representative", 136, 262);
      doc.setFont("helvetica", "bold");
      doc.text("For Graphura India Pvt Ltd", 136, 267);
      
      // 7. Footer Stamp (runs on all pages)
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for doing business with us!", 105, 280, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${i} of ${totalPages}`, 105, 285, { align: "center" });
      }
      
      doc.save(`WorkOrder_${selected.id}.pdf`);
      showToast("✅ PDF downloaded successfully");
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to download PDF");
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [

    { key: "client", label: "Client Name" },
    {
      key: "service", label: "Service",
      render: (v) => v || "—",
    },
    {
      key: "netPayable", label: "Net Payable",
      render: (v, row) => fmt(v ?? row.totalCost),
    },
    {
      key: "paymentStatus", label: "Payment",
      render: (v) => payBadge(v),
    },
    { key: "generatedDate", label: "Generated" },
    {
      key: "signedStatus", label: "Signed",
      render: (v) => statusBadge(v, {
        Signed:   "bg-emerald-100 text-emerald-700",
        Unsigned: "bg-rose-100 text-rose-700",
      }),
    },
    {
      key: "approvalStatus", label: "Approval",
      render: (v) => statusBadge(v, {
        Approved: "bg-emerald-100 text-emerald-700",
        Pending:  "bg-amber-100 text-amber-700",
        Rejected: "bg-rose-100 text-rose-700",
      }),
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* Toast */}
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 text-sm font-semibold">
          {toast}
        </div>
      )}

      {/* KPIs */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Work Orders" secondaryText="Management" size={12} />
        <DashCard title="Total Work Orders" value={total}          icon={<FileText   size={22}/>} accentColor="#3b82f6" size={3} />
        <DashCard title="Signed"            value={signed}         icon={<CheckCircle size={22}/>} accentColor="#22c55e" size={3} />
        <DashCard title="Pending Approval"  value={pendingApproval}icon={<Clock      size={22}/>} accentColor="#f59e0b" size={3} />
        <DashCard title="Approved"          value={approved}       icon={<ThumbsUp   size={22}/>} accentColor="#14b8a6" size={3} />
      </DashGrid>

      {/* Table */}
      <DataTable
        title="All Work Orders"
        columns={columns}
        rows={wos}
        pageSize={10}
        searchable
        exportable
        exportFileName="work_orders"
        filters={[
          { title: "Signed",   key: "signedStatus",   type: "toggle", options: ["Signed", "Unsigned"] },
          { title: "Approval", key: "approvalStatus",  type: "toggle", options: ["Approved", "Pending", "Rejected"] },
          { title: "Payment",  key: "paymentStatus",   type: "toggle", options: ["Paid", "Unpaid", "Advance"] },
        ]}
        actions={[
          { icon: <Eye size={15} />,        tooltip: "View work order",    variant: "ghost",   onClick: openView     },
          { icon: <PenLine size={15} />,    tooltip: "Edit work order",    variant: "ghost", onClick: openEdit     },
          { icon: <MailCheck size={15} />,   tooltip: "Send work order email", variant: "ghost",   onClick: openEmailModal  },
          { icon: <ClipboardCheck size={15} />, tooltip: "Approve / Reject", variant: "primary", onClick: openApproveModal },
        ]}
      />

      {/* ════════════════════════════════════════════════════════
          VIEW MODAL
      ════════════════════════════════════════════════════════ */}
      <Modal id="wo-view" title="Work Order Details" size="xl">
        {selected && (() => {
          const advPaid  = parseFloat(selected.advanceAmount) || 0;
          const remainingVal = Math.max(0, (selected.netPayable ?? selected.totalCost) - advPaid);
          return (
            <div className="flex flex-col gap-4">

              <ModalProfile
                name={selected.client}
                subtitle={`${selected.service || "—"}  ·  Sales: ${selected.salesExec || "—"}`}
                meta={`WO ID: ${selected.id}  ·  Generated: ${selected.generatedDate}`}
              />

              {/* Client contact */}
              <ModalGrid title="Client Contact" cols={2}>
                <ModalData label="Email"  value={selected.clientEmail}  />
                <ModalData label="Mobile" value={selected.clientMobile} />
              </ModalGrid>

              {/* Requirements breakdown */}
              {selected.requirements?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  {/* header */}
                  <div className="grid grid-cols-[1fr_140px] px-4 py-2 bg-[#2a465a]/5 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requirement</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Cost</span>
                  </div>
                  {selected.requirements.map((r, idx) => (
                    <div
                      key={r.id}
                      className={`grid grid-cols-[1fr_140px] px-4 py-3 border-b border-slate-100 last:border-0
                        ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
                    >
                      <div>
                        <p className="text-sm font-bold text-[#2a465a]">{r.title}</p>
                        {r.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{r.description}</p>
                        )}
                      </div>
                      <p className="text-sm font-black text-[#2a465a] text-right self-center">{fmt(r.cost)}</p>
                    </div>
                  ))}
                  {/* totals */}
                  <div className="grid grid-cols-[1fr_140px] px-4 py-2 bg-slate-50 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400">Total Cost</span>
                    <span className="text-sm font-black text-[#2a465a] text-right">{fmt(selected.totalCost)}</span>
                  </div>
                  {selected.discountAmt > 0 && (
                    <div className="grid grid-cols-[1fr_140px] px-4 py-2 bg-slate-50 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-400">
                        Discount ({selected.discountMode === "Percentage" ? `${selected.discountValue}%` : fmt(selected.discountValue)})
                      </span>
                      <span className="text-sm font-black text-rose-500 text-right">- {fmt(selected.discountAmt)}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-[1fr_140px] px-4 py-2.5 bg-[#2a465a]">
                    <span className="text-xs font-black text-white/70 uppercase tracking-widest">Net Payable</span>
                    <span className="text-sm font-black text-white text-right flex items-center justify-end gap-0.5">
                      <IndianRupee size={12} />
                      {Number(selected.netPayable ?? selected.totalCost).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment & Status side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment details */}
                <ModalGrid title="Payment" cols={selected.paymentStatus === "Advance" ? 2 : 1}>
                  <ModalData label="Payment Status" value={selected.paymentStatus || "—"} />
                  {selected.paymentStatus === "Advance" && (
                    <>
                      <ModalData label="Advance Paid"  value={fmt(selected.advanceAmount)} />
                      <ModalData label="Remaining"     value={fmt(remainingVal)}           />
                      {selected.advancePayments && selected.advancePayments.length > 0 && (
                        <div className="col-span-2 mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction History</p>
                          <div className="flex flex-col gap-1 text-xs">
                            {selected.advancePayments.map((p, pIdx) => (
                              <div key={p.id || pIdx} className="flex justify-between items-center text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <span className="font-semibold">{p.method}</span>
                                <span className="text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">
                                  {p.mode === "Percentage" ? `${p.value}%` : "Flat"}
                                </span>
                                <span className="font-black text-emerald-600">
                                  {fmt(calcAdvAmount(selected.netPayable ?? selected.totalCost, p.mode, p.value))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </ModalGrid>

                {/* Status */}
                <ModalGrid title="Work Order Status" cols={1}>
                  <ModalData label="Signed Status"   value={selected.signedStatus}   />
                  <ModalData label="Approval Status" value={selected.approvalStatus} />
                </ModalGrid>
              </div>

              {/* Approval Notes */}
              {selected.approvalComment && (
                <ModalGrid title="Approval Notes" cols={1}>
                  <ModalData label="Comment" value={selected.approvalComment} />
                </ModalGrid>
              )}

              {/* Terms */}
              {selected.terms && (
                <ModalGrid title="Terms & Conditions" cols={1}>
                  <ModalData label="Terms" value={selected.terms} />
                </ModalGrid>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("wo-view")} />
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ════════════════════════════════════════════════════════
          EDIT MODAL
      ════════════════════════════════════════════════════════ */}
      <Modal id="wo-edit" title="Edit Work Order" size="xl">
        {selected && (
          <div className="flex flex-col gap-6">
            <ModalProfile
              name={selected.client}
              subtitle={editForm.service || "—"}
              meta={`WO ID: ${selected.id}`}
            />
            
            {/* ── Service dropdown ── */}
            <SelectField
              label="Service"
              id="edit-sel-service"
              value={editForm.service}
              onChange={(e) => ef("service", e.target.value)}
              placeholder="Select a service…"
            >
              {SERVICE_OPTIONS.map((s) => (
                <Option key={s} value={s} label={s} />
              ))}
            </SelectField>

            {/* ── Requirements section ── */}
            <div className="flex flex-col gap-3">
              {/* Section header */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                  Requirements
                </p>
                {editForm.requirements?.length > 0 && (
                  <span className="text-xs font-bold text-slate-400">
                    {editForm.requirements.length} item{editForm.requirements.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* ── Add / Edit requirement row ── */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col gap-3">
                <p className="text-xs font-bold text-slate-500">
                  {editingReqId !== null ? "✏️ Editing requirement" : "Add requirement"}
                </p>

                {/* Title + Cost */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DataField
                    label="Title"
                    id="edit-req-title"
                    placeholder="e.g. Homepage design"
                    value={reqDraft.title}
                    onChange={(e) =>
                      setReqDraft((p) => ({ ...p, title: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddReq(); }
                    }}
                    size={12}
                  />
                  <DataField
                    label="Cost (₹)"
                    id="edit-req-cost"
                    type="number"
                    placeholder="e.g. 15000"
                    value={reqDraft.cost}
                    onChange={(e) =>
                      setReqDraft((p) => ({ ...p, cost: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddReq(); }
                    }}
                    size={12}
                  />
                </div>

                {/* Description (optional) */}
                <DataField
                  label="Description (optional)"
                  id="edit-req-desc"
                  type="textarea"
                  rows={2}
                  placeholder="Brief details about this requirement…"
                  value={reqDraft.description}
                  onChange={(e) =>
                    setReqDraft((p) => ({ ...p, description: e.target.value }))
                  }
                  size={12}
                />

                {/* Add / Save button row */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddReq}
                    disabled={!reqDraft.title.trim() || !reqDraft.cost}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2a465a] text-white text-xs font-bold
                      disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e3a52] transition active:scale-95"
                  >
                    {editingReqId !== null ? (
                      <><PenLine size={13} /> Save Edit</>
                    ) : (
                      <><Plus size={13} /> Add</>
                    )}
                  </button>
                  {editingReqId !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEditReq}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600
                        hover:bg-slate-50 transition active:scale-95"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* ── Requirements list ── */}
              {editForm.requirements?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  {/* List header */}
                  <div className="grid grid-cols-[1fr_120px_auto] gap-2 px-4 py-2 bg-[#2a465a]/5 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requirement</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Cost</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</span>
                  </div>

                  {editForm.requirements.map((req, idx) => (
                    <div
                      key={req.id}
                      className={`grid grid-cols-[1fr_120px_auto] gap-2 px-4 py-3 items-start
                        ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                        ${editingReqId === req.id ? "ring-2 ring-inset ring-[#2a465a]/30" : ""}
                        border-b border-slate-100 last:border-0`}
                    >
                      {/* Title + description */}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#2a465a] truncate">{req.title}</p>
                        {req.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {req.description}
                          </p>
                        )}
                      </div>

                      {/* Cost */}
                      <p className="text-sm font-black text-[#2a465a] text-right pt-0.5">
                        {fmt(req.cost)}
                      </p>

                      {/* Edit / Delete */}
                      <div className="flex gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleEditReq(req)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#2a465a] hover:text-white
                            flex items-center justify-center transition active:scale-90 text-slate-500"
                          title="Edit"
                        >
                          <PenLine size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReq(req.id)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-500 hover:text-white
                            flex items-center justify-center transition active:scale-90 text-slate-500"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Total cost row */}
                  <div className="grid grid-cols-[1fr_120px_auto] gap-2 px-4 py-3 bg-[#2a465a] border-t border-[#1e3a52]">
                    <span className="text-xs font-black text-white/70 uppercase tracking-widest col-span-1">
                      Total Cost
                    </span>
                    <span className="text-sm font-black text-white text-right">
                      {fmt(totalCost)}
                    </span>
                    <span />
                  </div>
                </div>
              )}
            </div>

            {/* ── Discount section ── */}
            {editForm.requirements?.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                  Discount
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectField
                    label="Discount Type"
                    id="edit-disc-mode"
                    value={editForm.discountMode}
                    onChange={(e) => {
                      ef("discountMode", e.target.value);
                      ef("discountValue", "");
                    }}
                  >
                    <Option value="None"       label="No Discount"   />
                    <Option value="Percentage" label="Percentage (%)" />
                    <Option value="Flat"       label="Flat (Rupees ₹)"     />
                  </SelectField>

                  {editForm.discountMode !== "None" ? (
                    <DataField
                      label={
                        editForm.discountMode === "Percentage"
                          ? "Discount % (max 99)"
                          : `Discount ₹ (max ${fmt(totalCost)})`
                      }
                      id="edit-disc-val"
                      type="number"
                      placeholder={
                        editForm.discountMode === "Percentage" ? "e.g. 10" : "e.g. 5000"
                      }
                      value={editForm.discountValue}
                      onChange={(e) => {
                        let v = parseFloat(e.target.value) || 0;
                        if (editForm.discountMode === "Percentage") v = Math.min(v, 99);
                        else v = Math.min(v, totalCost);
                        ef("discountValue", String(v || ""));
                      }}
                      size={12}
                    />
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </div>

                {/* Discount summary */}
                {editForm.discountMode !== "None" && discountAmt > 0 && (
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-3 divide-x divide-slate-100">
                      {[
                        { label: "Total Cost",   value: fmt(totalCost)   },
                        { label: "Discount",     value: `- ${fmt(discountAmt)}` },
                        { label: "Net Payable",  value: fmt(netPayable),  highlight: true },
                      ].map(({ label, value, highlight }) => (
                        <div
                          key={label}
                          className={`flex flex-col items-center justify-center py-3 px-2 gap-0.5
                            ${highlight ? "bg-[#2a465a]" : "bg-white"}`}
                        >
                          <span className={`text-[10px] font-bold uppercase tracking-widest
                            ${highlight ? "text-white/60" : "text-slate-400"}`}>
                            {label}
                          </span>
                          <span className={`text-sm font-black
                            ${highlight ? "text-white" : "text-[#2a465a]"}`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── GST section ── */}
            {editForm.requirements?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DataField
                  label="GST"
                  id="edit-gst"
                  value="18% Included"
                  readOnly
                  disabled
                  size={12}
                />
              </div>
            )}

            {/* ── Payment section ── */}
            {editForm.requirements?.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                  Payment
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectField
                    label="Payment Status"
                    id="edit-pay-status"
                    value={editForm.paymentStatus}
                    onChange={(e) => {
                      ef("paymentStatus", e.target.value);
                      if (e.target.value !== "Advance") {
                        ef("advanceAmount", "");
                        ef("advancePayments", []);
                      }
                    }}
                  >
                    <Option value="Paid"    label="Paid"    />
                    <Option value="Unpaid"  label="Unpaid"  />
                    <Option value="Advance" label="Advance" />
                  </SelectField>

                  {editForm.paymentStatus === "Advance" && (
                    <div className="hidden sm:block" />
                  )}
                </div>

                {/* ── Advance Payment Transaction Builder ── */}
                {editForm.paymentStatus === "Advance" && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/30 p-4 flex flex-col gap-4">
                    <p className="text-xs font-bold text-slate-500">
                      {editingAdvId !== null ? "✏️ Editing Advance Payment" : "Add Advance Payment"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <SelectField
                        label="Payment Method"
                        id="edit-adv-method"
                        value={advDraft.method}
                        onChange={(e) => setAdvDraft((p) => ({ ...p, method: e.target.value }))}
                      >
                        <Option value="UPI"          label="UPI"          />
                        <Option value="Cash"         label="Cash"         />
                        <Option value="Card"         label="Card"         />
                        <Option value="Net Banking"  label="Net Banking"  />
                      </SelectField>

                      <SelectField
                        label="Payment Type"
                        id="edit-adv-mode"
                        value={advDraft.mode}
                        onChange={(e) => setAdvDraft((p) => ({ ...p, mode: e.target.value, value: "" }))}
                      >
                        <Option value="Percentage" label="Percentage (%)" />
                        <Option value="Rupees"     label="Rupees (₹)"     />
                      </SelectField>

                      {(() => {
                        const paidOther = (editForm.advancePayments || [])
                          .filter((p) => p.id !== editingAdvId)
                          .reduce((sum, p) => sum + calcAdvAmount(netPayable, p.mode, p.value), 0);
                        const maxAllowedRupees = Math.max(0, netPayable - paidOther);
                        const maxAllowedPercent = netPayable > 0 
                          ? Math.max(0, Math.min(100, (maxAllowedRupees / netPayable) * 100))
                          : 0;
                        const labelText = advDraft.mode === "Percentage"
                          ? `Value % (max ${maxAllowedPercent.toFixed(1)}%)`
                          : `Amount ₹ (max ${fmt(maxAllowedRupees)})`;
                        
                        return (
                          <DataField
                            label={labelText}
                            id="edit-adv-val"
                            type="number"
                            placeholder={advDraft.mode === "Percentage" ? "e.g. 25" : "e.g. 2500"}
                            value={advDraft.value}
                            onChange={(e) => {
                              let v = parseFloat(e.target.value) || 0;
                              if (advDraft.mode === "Percentage") {
                                v = Math.min(v, maxAllowedPercent);
                              } else {
                                v = Math.min(v, maxAllowedRupees);
                              }
                              setAdvDraft((p) => ({ ...p, value: String(v || "") }));
                            }}
                            size={12}
                          />
                        );
                      })()}
                    </div>

                    {advDraft.value && (
                      <div className="text-xs font-bold text-[#2a465a] bg-white border border-slate-100 rounded-xl px-3 py-2 flex justify-between items-center">
                        <span>Calculated Transaction Amount:</span>
                        <span className="text-sm font-black text-emerald-600">
                          {fmt(calcAdvAmount(netPayable, advDraft.mode, advDraft.value))}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddAdv}
                        disabled={!advDraft.value || parseFloat(advDraft.value) <= 0}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2a465a] text-white text-xs font-bold
                          disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e3a52] transition active:scale-95"
                      >
                        {editingAdvId !== null ? (
                          <><PenLine size={13} /> Save Edit</>
                        ) : (
                          <><Plus size={13} /> Add Payment</>
                        )}
                      </button>
                      {editingAdvId !== null && (
                        <button
                          type="button"
                          onClick={handleCancelEditAdv}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600
                            hover:bg-slate-50 transition active:scale-95"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Advance Transactions List ── */}
                {editForm.paymentStatus === "Advance" && editForm.advancePayments?.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-[1fr_140px_auto] gap-2 px-4 py-2 bg-[#2a465a]/5 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Method</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</span>
                    </div>

                    {editForm.advancePayments.map((p, idx) => (
                      <div
                        key={p.id}
                        className={`grid grid-cols-[1fr_140px_auto] gap-2 px-4 py-3 items-center
                          ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                          ${editingAdvId === p.id ? "ring-2 ring-inset ring-[#2a465a]/30" : ""}
                          border-b border-slate-100 last:border-0`}
                      >
                        <span className="text-sm font-bold text-[#2a465a]">{p.method}</span>
                        <span className="text-sm font-black text-emerald-600 text-right">
                          {p.mode === "Percentage" ? `${p.value}% (${fmt(calcAdvAmount(netPayable, p.mode, p.value))})` : fmt(p.value)}
                        </span>

                        <div className="flex gap-1.5 justify-center">
                          <button
                            type="button"
                            onClick={() => handleEditAdv(p)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#2a465a] hover:text-white
                              flex items-center justify-center transition active:scale-95 text-slate-500"
                            title="Edit"
                          >
                            <PenLine size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAdv(p.id)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-500 hover:text-white
                              flex items-center justify-center transition active:scale-95 text-slate-500"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Advance payment breakdown cards */}
                {editForm.paymentStatus === "Advance" && advancePaid > 0 && (
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-3 divide-x divide-slate-100">
                      {[
                        { label: "Net Payable", value: fmt(netPayable) },
                        {
                          label: "Advance Paid",
                          value: fmt(advancePaid),
                          color: "text-emerald-600",
                        },
                        {
                          label: "Remaining",
                          value: fmt(remaining),
                          highlight: true,
                        },
                      ].map(({ label, value, highlight, color }) => (
                        <div
                          key={label}
                          className={`flex flex-col items-center justify-center py-3 px-2 gap-0.5
                            ${highlight ? "bg-[#2a465a]" : "bg-white"}`}
                        >
                          <span className={`text-[10px] font-bold uppercase tracking-widest
                            ${highlight ? "text-white/60" : "text-slate-400"}`}>
                            {label}
                          </span>
                          <span className={`text-sm font-black flex items-center gap-0.5
                            ${highlight ? "text-white" : color || "text-[#2a465a]"}`}>
                            <IndianRupee size={11} />
                            {Number(value.replace(/[₹,]/g, "")).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Status and Dates ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DataField
                label="Delivery Date"
                id="edit-wo-delivery"
                type="date"
                value={editForm.deliveryDate}
                onChange={(e) => ef("deliveryDate", e.target.value)}
                size={12}
              />
              <SelectField
                label="Approval Status"
                id="edit-wo-approval"
                value={editForm.approvalStatus}
                onChange={(e) => ef("approvalStatus", e.target.value)}
              >
                <Option value="Pending"  label="Pending"  />
                <Option value="Approved" label="Approved" />
                <Option value="Rejected" label="Rejected" />
              </SelectField>
              <SelectField
                label="Signed Status"
                id="edit-wo-signed"
                value={editForm.signedStatus}
                onChange={(e) => ef("signedStatus", e.target.value)}
              >
                <Option value="Unsigned" label="Unsigned" />
                <Option value="Signed"   label="Signed"   />
              </SelectField>
            </div>

            {/* ── Terms and Conditions ── */}
            <DataField
              label="Terms & Conditions"
              id="edit-wo-terms"
              type="textarea"
              rows={4}
              value={editForm.terms}
              onChange={(e) => ef("terms", e.target.value)}
            />

            {/* ── Cost Breakdown Summary ── */}
            {editForm.requirements?.length > 0 && (
              <div className="flex flex-col gap-3 mt-4">
                <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                  Cost Breakdown
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-2.5">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Requirements (Base Cost)</span>
                    <span className="font-semibold text-[#2a465a]">{fmt(totalCost - Math.round(totalCost * 18 / 118))}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 border-b border-slate-100 pb-2.5">
                    <span>GST (18% Included)</span>
                    <span className="font-semibold text-[#2a465a]">{fmt(Math.round(totalCost * 18 / 118))}</span>
                  </div>
                   <div className="flex justify-between text-sm font-bold text-[#2a465a] pt-1">
                    <span>Total Cost (Inclusive of GST)</span>
                    <span>{fmt(totalCost)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-sm font-semibold text-rose-600 border-b border-slate-100 pb-2.5">
                      <span>Discount (Applied)</span>
                      <span>- {fmt(discountAmt)}</span>
                    </div>
                  )}

                  {advancePaid > 0 ? (
                    <>
                      <div className="flex justify-between text-sm font-bold text-[#2a465a] pt-2 pb-1">
                        <span>Final Net Payable</span>
                        <span>{fmt(netPayable)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-emerald-600 border-b border-slate-100 pb-2.5">
                        <span>Advance Paid</span>
                        <span>- {fmt(advancePaid)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#2a465a]/5 rounded-xl px-3.5 py-3 border border-[#2a465a]/10 mt-1">
                        <span className="text-sm font-bold text-[#2a465a]">Remaining Payment</span>
                        <span className="text-lg font-black text-[#2a465a]">{fmt(remaining)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center bg-[#2a465a]/5 rounded-xl px-3.5 py-3 border border-[#2a465a]/10 mt-1">
                      <span className="text-sm font-bold text-[#2a465a]">Final Net Payable</span>
                      <span className="text-lg font-black text-[#2a465a]">{fmt(netPayable)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <Button text="Cancel"       variant="ghost"    size={3} onClick={() => closeModal("wo-edit")} />
              <Button text="Save Changes" variant="primary"  size={3} onClick={saveEdit}                   />
            </div>
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════════════
          APPROVE / REJECT MODAL
      ════════════════════════════════════════════════════════ */}
      <Modal id="wo-approve" title="Approve / Reject Work Order" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.client}
              subtitle={selected.service || "—"}
              meta={`WO ID: ${selected.id}`}
            />
            
            <p className="text-sm font-semibold text-slate-600">
              Please review this work order. To approve it, comments are optional. To reject it, a comment explaining the reason is required.
            </p>

            <DataField
              label={
                <span>
                  Comment <span className="text-xs text-slate-400 f, optional for approvalont-normal">(Required for rejection)</span>
                </span>
              }
              id="wo-approve-comment"
              type="textarea"
              rows={3}
              placeholder="Enter review comments or remarks..."
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              size={12}
            />

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("wo-approve")} />
              <Button 
                text="Reject" 
                variant="danger" 
                size={3} 
                onClick={() => handleApprovalAction("Rejected")} 
                disabled={!approveComment.trim()}
              />
              <Button 
                text="Approve" 
                variant="success" 
                size={3} 
                onClick={() => handleApprovalAction("Approved")} 
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════════════
          EMAIL & PDF MODAL
      ════════════════════════════════════════════════════════ */}
      <Modal id="wo-email-pdf" title="Work Order PDF & Email Preview" size="xl">
        {selected && (
          <div className="flex flex-col gap-6">
            <ModalProfile
              name={selected.client}
              subtitle={selected.service || "—"}
              meta={`WO ID: ${selected.id}`}
            />

            {/* Editing inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataField
                label="Client Email"
                id="pdf-email-input"
                type="email"
                placeholder="client@example.com"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                size={12}
                readOnly
                disabled
              />
              <DataField
                label="Terms & Conditions"
                id="pdf-terms-input"
                type="textarea"
                rows={3}
                placeholder="Terms & Conditions..."
                value={editTerms}
                onChange={(e) => setEditTerms(e.target.value)}
                size={12}
              />
            </div>

            {/* Document Preview (HTML Representation of the PDF) */}
            <div className="border border-slate-200 rounded-2xl bg-white shadow-sm p-6 overflow-y-auto max-h-96 font-sans text-[#2a465a] relative">
              {/* Header block */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#2a465a]">Graphura India Pvt Ltd</h3>
                  <p className="text-[10px] text-slate-400">CRM & ERP Development Suite | Work Order Document</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {selected.approvalStatus || "Pending"}
                  </span>
                </div>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Details</p>
                  <p className="font-bold text-slate-800 mt-1">{selected.client}</p>
                  <p className="text-slate-500">{editEmail}</p>
                  <p className="text-slate-500">{selected.clientMobile || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Details</p>
                  <p className="font-bold text-slate-800 mt-1">{selected.id}</p>
                  <p className="text-slate-500">Generated: {selected.generatedDate}</p>
                  <p className="text-slate-500">Sales Exec: {selected.salesExec || "—"}</p>
                  <p className="text-slate-500">Service: {selected.service || "—"}</p>
                </div>
              </div>

              {/* Requirements Table */}
              {selected.requirements?.length > 0 ? (
                <div className="border border-slate-100 rounded-xl overflow-hidden mb-6 text-xs">
                  <div className="grid grid-cols-[1fr_120px] bg-slate-50 px-3 py-2 font-bold text-slate-500 border-b border-slate-100">
                    <span>Requirement</span>
                    <span className="text-right">Cost</span>
                  </div>
                  {selected.requirements.map((r, idx) => (
                    <div key={r.id} className={`grid grid-cols-[1fr_120px] px-3 py-2.5 border-b border-slate-100 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                      <div>
                        <p className="font-semibold text-slate-800">{r.title}</p>
                        {r.description && <p className="text-[10px] text-slate-400 mt-0.5">{r.description}</p>}
                      </div>
                      <span className="text-right font-bold self-center">{fmt(r.cost)}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-[1fr_120px] bg-slate-50 px-3 py-2 border-t border-slate-100 text-slate-600">
                    <span className="font-semibold">Total Cost</span>
                    <span className="text-right font-black">{fmt(selected.totalCost)}</span>
                  </div>
                  {selected.discountAmt > 0 && (
                    <div className="grid grid-cols-[1fr_120px] bg-slate-50 px-3 py-2 border-t border-slate-100 text-slate-600">
                      <span className="font-semibold">Discount ({selected.discountMode === "Percentage" ? `${selected.discountValue}%` : fmt(selected.discountValue)})</span>
                      <span className="text-right font-bold text-rose-500">- {fmt(selected.discountAmt)}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-[1fr_120px] bg-[#2a465a] text-white px-3 py-2.5 font-bold">
                    <span>Net Payable</span>
                    <span className="text-right font-black">{fmt(selected.netPayable)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl mb-6 text-xs text-slate-400">
                  No requirements specified.
                </div>
              )}

              {/* Payment Details */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs mb-6">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Terms</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Status</span>
                    <span className="font-bold text-slate-700">{selected.paymentStatus}</span>
                  </div>
                  {selected.paymentStatus === "Advance" && (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Advance Paid</span>
                        <span className="font-bold text-emerald-600">{fmt(selected.advanceAmount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Remaining</span>
                        <span className="font-bold text-slate-700">{fmt((selected.netPayable ?? selected.totalCost) - (parseFloat(selected.advanceAmount) || 0))}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              {editTerms && (
                <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-4 leading-relaxed">
                  <p className="font-bold text-slate-700 mb-1 uppercase tracking-wider text-[9px]">Terms & Conditions</p>
                  <p className="whitespace-pre-line">{editTerms}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("wo-email-pdf")} />
              <Button text="Download PDF" variant="secondary" size={3} onClick={handleDownloadPDF} />
              <Button text="Save Changes" variant="primary" size={3} onClick={saveEmailChanges} />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
