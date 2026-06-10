import { useCallback, useEffect, useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Button,
  Modal, ModalProfile, ModalGrid, ModalData,
  DataField, SelectField, Option,
  openModal, closeModal,
} from "../../components/shared/Common_Components";
import {
  FileText, CheckCircle, PenLine, Clock, ThumbsUp,
  Eye, MailCheck, ClipboardCheck, Plus, Loader2, IndianRupee, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const payBadge = (v) => {
  const map = { Paid: "bg-emerald-100 text-emerald-700", Unpaid: "bg-rose-100 text-rose-700", Advance: "bg-sky-100 text-sky-700" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[v] || "bg-slate-100 text-slate-600"}`}>{v || "—"}</span>;
};
const signBadge = (v) => {
  const cls = v === "Signed" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{v || "Unsigned"}</span>;
};
const approvalBadge = (v) => {
  const map = { Approved: "bg-emerald-100 text-emerald-700", Pending: "bg-amber-100 text-amber-700", Rejected: "bg-rose-100 text-rose-700" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[v] || "bg-slate-100 text-slate-600"}`}>{v || "—"}</span>;
};

export default function WorkOrders() {
  const [wos, setWos] = useState([]);
  const [stats, setStats] = useState({});
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [approveComment, setApproveComment] = useState("");
  const [sendEmail, setSendEmail] = useState("");
  const [termsPdf, setTermsPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/finance/work-orders");
      const d = res?.data?.data || {};
      setWos(d.workOrders || []);
      setStats(d.stats || {});
    } catch (err) {
      toast.error(err?.message || "Failed to load work orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Backfill: create work orders for all existing successful payments ──────
  const handleBackfill = async () => {
    if (!window.confirm("This will create work orders for all successful payments that don't have one yet. Continue?")) return;
    try {
      toast.loading("Running backfill…", { id: "backfill" });
      const res = await apiClient.post("/finance/work-orders/backfill");
      const d = res?.data?.data || {};
      toast.dismiss("backfill");
      toast.success(`Backfill done: ${d.created} created, ${d.skipped} already existed`);
      await load();
    } catch (err) {
      toast.dismiss("backfill");
      toast.error(err?.message || "Backfill failed");
    }
  };

  // ── Derived financials from editForm ──────────────────────────────────────
  const totalCost = parseFloat(editForm.totalCost) || 0;
  const netPayable = totalCost;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const ef = (field, val) => setEditForm((p) => ({ ...p, [field]: val }));

  const openView = (row) => { setSelected(row); openModal("wo-view"); };

  const openEdit = (row) => {
    setSelected(row);
    setEditForm({
      clientName: row.client || "",
      clientEmail: row.clientEmail || "",
      clientMobile: row.clientMobile || "",
      service: row.service || "",
      totalCost: row.totalCost || 0,
      terms: row.terms || "",
      deliveryDate: row.deliveryDate ? row.deliveryDate.substring(0, 10) : "",
      paymentStatus: row.paymentStatus || "Unpaid",
      signedStatus: row.signedStatus || "Unsigned",
      signedByName: row.signedByName || "",
      termsPdfUrl: row.termsPdfUrl || null,
    });
    setTermsPdf(null);
    openModal("wo-edit");
  };

  const saveEdit = async () => {
    if (!selected) return;
    setActionLoading("edit");
    try {
      const formData = new FormData();
      formData.append("clientName", editForm.clientName);
      formData.append("clientEmail", editForm.clientEmail);
      formData.append("clientMobile", editForm.clientMobile);
      formData.append("service", editForm.service);
      formData.append("totalCost", Number(editForm.totalCost) || 0);
      formData.append("requirements", JSON.stringify([]));
      formData.append("terms", editForm.terms);
      formData.append("deliveryDate", editForm.deliveryDate || "");
      formData.append("discountMode", "None");
      formData.append("discountValue", 0);
      formData.append("paymentStatus", editForm.paymentStatus);
      formData.append("signedStatus", editForm.signedStatus);
      formData.append("signedByName", editForm.signedByName);
      
      if (termsPdf) {
        formData.append("termsPdf", termsPdf);
      }

      await apiClient.put(`/finance/work-orders/${selected.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Work order updated");
      closeModal("wo-edit");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to update");
    } finally {
      setActionLoading("");
    }
  };

  const openApprove = (row) => { setSelected(row); setApproveComment(""); openModal("wo-approve"); };

  const handleApprove = async (action) => {
    if (!selected) return;
    if (action === "reject" && !approveComment.trim()) { toast.error("Rejection reason is required"); return; }
    setActionLoading(action);
    try {
      const endpoint = action === "approve"
        ? `/finance/work-orders/${selected.id}/approve`
        : `/finance/work-orders/${selected.id}/reject`;
      await apiClient.post(endpoint, { comment: approveComment });
      toast.success(action === "approve" ? "Work order approved & sent to management!" : "Work order rejected");
      closeModal("wo-approve");
      await load();
    } catch (err) {
      toast.error(err?.message || "Action failed");
    } finally {
      setActionLoading("");
    }
  };

  const openSendEmail = (row) => { setSelected(row); setSendEmail(row.clientEmail || ""); openModal("wo-email"); };

  const handleSendEmail = async () => {
    if (!selected || !sendEmail) { toast.error("Email is required"); return; }
    setActionLoading("email");
    try {
      await apiClient.post(`/finance/work-orders/${selected.id}/send-email`, { email: sendEmail });
      toast.success(`Work order sent to ${sendEmail}`);
      closeModal("wo-email");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to send email");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete work order ${row.woNumber}?`)) return;
    try {
      await apiClient.delete(`/finance/work-orders/${row.id}`);
      toast.success("Work order deleted");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to delete");
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    { key: "woNumber", label: "WO #" },
    { key: "client", label: "Client Name" },
    { key: "service", label: "Service", render: (v) => v || "—" },
    { key: "netPayable", label: "Net Payable", render: (v) => fmt(v) },
    { key: "paymentStatus", label: "Payment", render: (v) => payBadge(v) },
    { key: "generatedDate", label: "Generated", render: (v) => fmtDate(v) },
    { key: "signedStatus", label: "Signed", render: (v) => signBadge(v) },
    { key: "approvalStatus", label: "Approval", render: (v) => approvalBadge(v) },
    { key: "termsPdfUrl", label: "Terms PDF", render: (v) => v ? <a href={v} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"><FileText size={14} /> View</a> : "—" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Work Orders" secondaryText="Management" size={12} />
        <EnhancedDashCard title="Total Work Orders" value={stats.total || 0} icon={<FileText size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Signed" value={stats.signed || 0} icon={<CheckCircle size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Pending Approval" value={stats.pendingApproval || 0} icon={<Clock size={22} />} accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Approved" value={stats.approved || 0} icon={<ThumbsUp size={22} />} accentColor="#14b8a6" size={3} />
      </DashGrid>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
          <Loader2 size={18} className="animate-spin" /> Loading work orders…
        </div>
      )}

      {/* Backfill banner — shown when table is empty */}
      {!loading && wos.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-amber-800">No work orders found</p>
            <p className="text-xs text-amber-600 mt-0.5">
              If you have successful payments, click "Sync from Payments" to generate work orders automatically.
            </p>
          </div>
          <button
            onClick={handleBackfill}
            className="shrink-0 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw size={15} /> Sync from Payments
          </button>
        </div>
      )}

      {!loading && (
        <DataTable
          title="All Work Orders"
          columns={columns}
          rows={wos}
          pageSize={10}
          actions={[
            { icon: <Eye size={15} />, tooltip: "View", variant: "ghost", onClick: openView },
            { icon: <PenLine size={15} />, tooltip: "Edit", variant: "ghost", onClick: openEdit },
            { icon: <MailCheck size={15} />, tooltip: "Send Email", variant: "ghost", onClick: openSendEmail },
            { icon: <ClipboardCheck size={15} />, tooltip: "Approve / Reject", variant: "primary", onClick: openApprove },
          ]}
        />
      )}

      {/* ── View Modal ─────────────────────────────────────────────────────── */}
      <Modal id="wo-view" title="Work Order Details" size="xl">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#1e293b] rounded-2xl p-5 text-white flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black">{selected.woNumber}</h2>
                <p className="text-xs text-white/60 mt-1">{selected.service || "—"}</p>
                <p className="text-xs text-white/60">Generated: {fmtDate(selected.generatedDate)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {signBadge(selected.signedStatus)}
                {approvalBadge(selected.approvalStatus)}
              </div>
            </div>

            <ModalProfile
              name={selected.client}
              subtitle={selected.clientEmail || "—"}
              meta={`Mobile: ${selected.clientMobile || "—"} · Sales: ${selected.salesExec || "—"}`}
            />

            <ModalGrid title="Financials" cols={2}>
              <ModalData label="Total Cost" value={fmt(selected.totalCost)} />
              <ModalData label="Net Payable" value={fmt(selected.netPayable)} />
              <ModalData label="Payment Status" value={selected.paymentStatus} />
              <ModalData label="Advance Amount" value={fmt(selected.advanceAmount)} />
            </ModalGrid>

            <ModalGrid title="Status & Delivery" cols={2}>
              <ModalData label="Signed Status" value={selected.signedStatus} />
              <ModalData label="Signed By" value={selected.signedByName || "—"} />
              <ModalData label="Signed At" value={fmtDate(selected.signedAt)} />
              <ModalData label="Delivery Date" value={fmtDate(selected.deliveryDate)} />
            </ModalGrid>

            <ModalGrid title="Approval" cols={2}>
              <ModalData label="Approval Status" value={selected.approvalStatus} />
              <ModalData label="Approved At" value={fmtDate(selected.approvedAt)} />
              <ModalData label="Comment" value={selected.approvalComment || "—"} />
              <ModalData label="Sent to Management" value={selected.sentToManagement ? `Yes — ${fmtDate(selected.sentToManagementAt)}` : "No"} />
              <ModalData label="Terms PDF" value={selected.termsPdfUrl ? <a href={selected.termsPdfUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Attached Terms</a> : "No PDF attached"} />
            </ModalGrid>

            {selected.terms && (
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg px-4 py-3 text-sm text-blue-800">
                <strong>Terms:</strong> {selected.terms}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("wo-view")} />
              <Button text="Send Email" variant="success" size={3} onClick={() => { closeModal("wo-view"); openSendEmail(selected); }} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <Modal id="wo-edit" title="Edit Work Order" size="xl">
        {selected && (
          <div className="flex flex-col gap-5">
            <ModalProfile name={selected.client} subtitle={`WO: ${selected.woNumber}`} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataField label="Client Name" id="wo-cn" value={editForm.clientName || ""} onChange={(e) => ef("clientName", e.target.value)} size={12} />
              <DataField label="Client Email" id="wo-ce" value={editForm.clientEmail || ""} onChange={(e) => ef("clientEmail", e.target.value)} size={12} />
              <DataField label="Mobile" id="wo-cm" value={editForm.clientMobile || ""} onChange={(e) => ef("clientMobile", e.target.value)} size={12} />
              <DataField label="Service" id="wo-svc" value={editForm.service || ""} onChange={(e) => ef("service", e.target.value)} size={12} />
              <DataField label="Total Amount (₹)" id="wo-tc" type="number" value={editForm.totalCost || ""} onChange={(e) => ef("totalCost", e.target.value)} size={12} />
              <DataField label="Delivery Date" id="wo-dd" type="date" value={editForm.deliveryDate || ""} onChange={(e) => ef("deliveryDate", e.target.value)} size={12} />
              <SelectField label="Payment Status" id="wo-ps" value={editForm.paymentStatus || "Unpaid"} onChange={(e) => ef("paymentStatus", e.target.value)}>
                <Option value="Unpaid" label="Unpaid" />
                <Option value="Paid" label="Paid" />
                <Option value="Advance" label="Advance" />
              </SelectField>
              <SelectField label="Signed Status" id="wo-ss" value={editForm.signedStatus || "Unsigned"} onChange={(e) => ef("signedStatus", e.target.value)}>
                <Option value="Unsigned" label="Unsigned" />
                <Option value="Signed" label="Signed" />
              </SelectField>
              <DataField label="Signed By" id="wo-sb" value={editForm.signedByName || ""} onChange={(e) => ef("signedByName", e.target.value)} size={12} />
            </div>

            <DataField label="Terms & Conditions" id="wo-terms" type="textarea" value={editForm.terms || ""} onChange={(e) => ef("terms", e.target.value)} size={12} />

            <div className="flex flex-col gap-1 px-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upload Terms & Conditions (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setTermsPdf(e.target.files[0])}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {editForm.termsPdfUrl && <p className="text-[10px] text-emerald-600 font-bold mt-1">Current PDF: <a href={editForm.termsPdfUrl} target="_blank" rel="noreferrer" className="underline">View PDF</a></p>}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("wo-edit")} />
              <Button text={actionLoading === "edit" ? "Saving…" : "Save Changes"} variant="primary" size={3} onClick={saveEdit} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Approve / Reject Modal ─────────────────────────────────────────── */}
      <Modal id="wo-approve" title="Approve / Reject Work Order" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.client} subtitle={`WO: ${selected.woNumber} · ${fmt(selected.netPayable)}`} />
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <strong>Approving</strong> will immediately send this work order to the Management Manager for execution.
            </div>
            <DataField
              label="Comment (required for rejection)"
              id="approve-comment"
              type="textarea"
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              size={12}
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("wo-approve")} />
              <Button text={actionLoading === "reject" ? "Rejecting…" : "Reject"} variant="danger" size={3} onClick={() => handleApprove("reject")} />
              <Button text={actionLoading === "approve" ? "Approving…" : "Approve & Send to Management"} variant="success" size={4} onClick={() => handleApprove("approve")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Send Email Modal ───────────────────────────────────────────────── */}
      <Modal id="wo-email" title="Send Work Order Email" size="sm">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.client} subtitle={`WO: ${selected.woNumber}`} />
            <DataField label="Recipient Email" id="wo-send-email" type="email" value={sendEmail} onChange={(e) => setSendEmail(e.target.value)} size={12} />
            <p className="text-xs text-slate-500">The work order will be sent as a formatted HTML email with the full scope, financials, and terms.</p>
            <div className="flex gap-3 justify-end pt-2">
              <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("wo-email")} />
              <Button text={actionLoading === "email" ? "Sending…" : "Send Work Order"} variant="success" size={3} onClick={handleSendEmail} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
