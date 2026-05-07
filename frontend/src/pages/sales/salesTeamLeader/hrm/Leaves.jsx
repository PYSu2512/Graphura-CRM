import { useState } from "react";
import toast from "react-hot-toast";
import {
  Heading, DashGrid, DashCard, DataTable,
  Modal, ModalGrid, ModalData, Button,
  DataField, SelectField, Option, Grid,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components";
import DatePicker from "../../../../components/shared/DatePicker";
import { Calendar, CheckCircle, Clock, XCircle, Eye, Trash2 } from "lucide-react";
import { hrmService, MOCK_LEAVES_INIT } from "../../../../services/hrmService";

const KPI_ICONS   = [<Calendar size={22} />, <CheckCircle size={22} />, <Clock size={22} />, <XCircle size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];

const LEAVE_TYPES = [
  "Sick Leave",
  "Casual Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Unpaid Leave",
  "Other",
];

const MY_LEAVES_COLS = [
  { key: "type",      label: "Leave Type" },
  { key: "reason",    label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "appliedOn", label: "Applied On" },
  { key: "status",    label: "Status" }, // auto-renders as colored badge
];

const calcDays = (from, to) => {
  if (!from || !to) return "";
  const diff = (new Date(to) - new Date(from)) / 86400000;
  return diff < 0 ? "" : String(diff + 1);
};

const today = () => new Date().toISOString().split("T")[0];

// Normalise raw leave records into table-ready rows.
const toRow = (l) => ({
  ...l,
  dateRange: `${l.from} to ${l.to}`,
  days:      typeof l.days === "string" ? l.days : String(l.days),
});

export default function Leaves() {
  const [leaves,    setLeaves]    = useState(() => MOCK_LEAVES_INIT.map(toRow));
  const [viewRow,   setViewRow]   = useState(null);

  // ── Apply form state ─────────────────────────────────────────────────────
  const EMPTY_FORM = { leaveType: "", reason: "", dateFrom: "", dateTo: "" };
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState({});
  const [submitting,setSubmitting]= useState(false);

  const applyDays = calcDays(form.dateFrom, form.dateTo);

  // ── KPI counts ───────────────────────────────────────────────────────────
  const total    = leaves.length;
  const approved = leaves.filter((l) => l.status === "Approved").length;
  const pending  = leaves.filter((l) => l.status === "Pending").length;
  const rejected = leaves.filter((l) => l.status === "Rejected").length;
  const kpis = [
    { title: "Total Leaves",   value: String(total)    },
    { title: "Approved",       value: String(approved) },
    { title: "Pending",        value: String(pending)  },
    { title: "Rejected",       value: String(rejected) },
  ];

  // ── Apply leave ──────────────────────────────────────────────────────────
  const onChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.leaveType)    e.leaveType = "Select a leave type.";
    if (!form.reason.trim())e.reason    = "Reason is required.";
    if (!form.dateFrom)     e.dateFrom  = "Start date is required.";
    if (!form.dateTo)       e.dateTo    = "End date is required.";
    if (form.dateFrom && form.dateTo && form.dateTo < form.dateFrom)
      e.dateTo = "End date must be on or after start date.";
    return e;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await hrmService.applyLeave({
        type:   form.leaveType,
        from:   form.dateFrom,
        to:     form.dateTo,
        days:   Number(applyDays),
        reason: form.reason.trim(),
      });
      const newLeave = toRow({
        id:        res?.data?.id || `ML-${Date.now()}`,
        type:      form.leaveType,
        reason:    form.reason.trim(),
        from:      form.dateFrom,
        to:        form.dateTo,
        days:      Number(applyDays),
        appliedOn: today(),
        status:    "Pending",
        ...(res?.data || {}),
      });
      setLeaves((prev) => [newLeave, ...prev]);
      setForm(EMPTY_FORM);
      closeModal("tl-hrm-leave-apply");
      toast.success("Leave Applied Successfully!", { icon: "📋", duration: 4000 });
    } catch {
      toast.error("Failed to submit leave. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel a pending leave ───────────────────────────────────────────────
  const cancelLeave = (row) => {
    setLeaves((prev) => prev.filter((l) => l.id !== row.id));
    toast("Leave application cancelled.", { icon: "🟡" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Leave" secondaryText="Management" size={12} />
        {kpis.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </DashGrid>

      {/* ── Apply Leave button ───────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button text="+  Apply Leave" variant="primary" onClick={() => openModal("tl-hrm-leave-apply")} />
      </div>

      {/* ── My Leaves table ──────────────────────────────────────────────── */}
      <DataTable
        title="My Leaves"
        columns={MY_LEAVES_COLS}
        rows={leaves}
        ellipse={4}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="my_leaves"
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Pending", "Approved", "Rejected"] },
          { title: "Leave Type", type: "toggle", key: "type",   options: LEAVE_TYPES },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setViewRow(leaves.find((l) => l.id === row.id)); openModal("tl-hrm-leave-view"); },
          },
          {
            icon: <Trash2 size={15} />, tooltip: "Cancel", variant: "danger",
            onClick: (row) => {
              if (row.status === "Pending") cancelLeave(row);
              else toast.error("Only pending leaves can be cancelled.");
            },
          },
        ]}
      />

      {/* ── Apply Leave modal ────────────────────────────────────────────── */}
      <Modal id="tl-hrm-leave-apply" title="Apply for Leave" size="lg">
        <div className="space-y-5">
          <Grid cols={12} gap={4}>
            <div className="col-span-12">
              <SelectField label="Leave Type"
                value={form.leaveType}
                onChange={(e) => onChange("leaveType", e.target.value)}>
                <Option value="" label="-- Select leave type --" />
                {LEAVE_TYPES.map((t) => <Option key={t} value={t} label={t} />)}
              </SelectField>
              {errors.leaveType && <p className="text-xs text-rose-600 mt-1 px-1">{errors.leaveType}</p>}
            </div>

            <div className="col-span-5">
              <DatePicker label="Date From" id="tl-hrm-from"
                value={form.dateFrom}
                onChange={(v) => onChange("dateFrom", v)} />
              {errors.dateFrom && <p className="text-xs text-rose-600 mt-1 px-1">{errors.dateFrom}</p>}
            </div>

            <div className="col-span-5">
              <DatePicker label="Date To" id="tl-hrm-to"
                value={form.dateTo}
                minDate={form.dateFrom || undefined}
                onChange={(v) => onChange("dateTo", v)} />
              {errors.dateTo && <p className="text-xs text-rose-600 mt-1 px-1">{errors.dateTo}</p>}
            </div>

            <div className="col-span-2">
              <DataField label="Days" id="tl-hrm-days" type="text" size={12}
                value={applyDays ? `${applyDays} day${applyDays === "1" ? "" : "s"}` : ""}
                placeholder="—" disabled />
            </div>

            <div className="col-span-12">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                placeholder="Briefly describe the reason for your leave..."
                value={form.reason}
                onChange={(e) => onChange("reason", e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 resize-none transition duration-200"
              />
              {errors.reason && <p className="text-xs text-rose-600 mt-1 px-1">{errors.reason}</p>}
            </div>
          </Grid>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button text="Cancel" variant="ghost"
              onClick={() => { setForm(EMPTY_FORM); setErrors({}); closeModal("tl-hrm-leave-apply"); }} />
            <Button text={submitting ? "Submitting..." : "Submit Application"}
              variant="primary"
              onClick={submit}
              disabled={submitting} />
          </div>
        </div>
      </Modal>

      {/* ── View Leave modal ─────────────────────────────────────────────── */}
      <Modal id="tl-hrm-leave-view" title="My Leave Details" size="md">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold
              ${viewRow.status === "Approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : viewRow.status === "Rejected" ? "bg-rose-50 border-rose-200 text-rose-700"
              : viewRow.status === "Pending"  ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-slate-50 border-slate-200 text-slate-600"}`}>
              <span className="text-xs font-black uppercase tracking-widest">Status:</span>
              {viewRow.status}
            </div>

            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type" value={viewRow.type} />
              <ModalData label="Applied On" value={viewRow.appliedOn} />
              <ModalData label="From Date"  value={viewRow.from} />
              <ModalData label="To Date"    value={viewRow.to} />
              <ModalData label="Total Days" value={`${viewRow.days} day${viewRow.days === "1" ? "" : "s"}`} />
              <ModalData label="Status"     value={viewRow.status} />
            </ModalGrid>

            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={viewRow.reason} />
            </ModalGrid>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              {viewRow.status === "Pending" && (
                <Button text="Cancel Application" variant="danger" size={4}
                  onClick={() => { cancelLeave(viewRow); closeModal("tl-hrm-leave-view"); }} />
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-hrm-leave-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
