import { useState, useEffect, useMemo } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalGrid, Button,
  DataField, SelectField, Option, Grid,
} from "../../../../components/shared/Common_Components";
import DatePicker from "../../../../components/shared/DatePicker";
import { hrmService } from "../../../../services/hrmService";
import { toast } from "react-hot-toast";
import { Calendar, CheckCircle, Clock, XCircle, Eye, Trash2 } from "lucide-react";

const KPI_ICONS   = [<Calendar size={22} />, <CheckCircle size={22} />, <Clock size={22} />, <XCircle size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];

const MY_LEAVES_COLS = [
  { key: "leaveType", label: "Leave Type" },
  { key: "reason",    label: "Reason"     },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days"       },
  { key: "appliedOn", label: "Applied On", sortValue: (row) => new Date(row.raw?.createdAt || row.createdAt).getTime() },
  { key: "status",    label: "Status"     },
];

export default function Leaves() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await hrmService.getMyLeaves();
      if (res.success) {
        const LEAVE_MAP = {
          'SICK': 'Sick Leave',
          'CASUAL': 'Casual Leave',
          'EARNED': 'Earned Leave',
          'MATERNITY': 'Maternity Leave',
          'PATERNITY': 'Paternity Leave',
          'BEREAVEMENT': 'Bereavement Leave',
          'UNPAID': 'Unpaid Leave',
          'HALF_DAY': 'Half Day',
          'OTHER': 'Other',
        };

        const mapped = res.data.map(l => ({
          ...l,
          id: l._id,
          leaveType: LEAVE_MAP[l.leaveType] || l.leaveType,
          dateRange: `${new Date(l.fromDate).toLocaleDateString()} to ${new Date(l.toDate).toLocaleDateString()}`,
          appliedOn: new Date(l.createdAt).toLocaleDateString(),
          status: l.status.charAt(0).toUpperCase() + l.status.slice(1).toLowerCase(),
          raw: l
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyLeaves(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      toast.error("Failed to load leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const LEAVE_TYPES = [
    "Sick Leave", "Casual Leave", "Earned Leave",
    "Maternity Leave", "Paternity Leave", "Bereavement Leave",
    "Unpaid Leave", "Half Day", "Other",
  ];
  const [applyForm,  setApplyForm]  = useState({ leaveType: "", reason: "", dateFrom: "", dateTo: "" });
  const [applyError, setApplyError] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const calcDays = (from, to) => {
    if (!from || !to) return 0;
    const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
    return diff < 0 ? 0 : diff + 1;
  };
  const applyDays = calcDays(applyForm.dateFrom, applyForm.dateTo);

  const handleApplyChange = (field, value) => {
    setApplyForm((prev) => ({ ...prev, [field]: value }));
    if (applyError[field]) setApplyError((e) => ({ ...e, [field]: "" }));
  };

  const handleApplySubmit = async () => {
    const errs = {};
    if (!applyForm.leaveType)     errs.leaveType = "Please select a leave type.";
    if (!applyForm.reason.trim()) errs.reason    = "Reason is required.";
    if (!applyForm.dateFrom)      errs.dateFrom  = "Start date is required.";
    if (!applyForm.dateTo)        errs.dateTo    = "End date is required.";
    if (applyForm.dateFrom && applyForm.dateTo && applyForm.dateTo < applyForm.dateFrom)
      errs.dateTo = "End date must be on or after start date.";
    if (Object.keys(errs).length) { setApplyError(errs); return; }

    setSubmitting(true);
    try {
      const res = await hrmService.applyLeave({
        leaveType: applyForm.leaveType,
        fromDate: applyForm.dateFrom,
        toDate: applyForm.dateTo,
        reason: applyForm.reason,
        days: applyDays
      });

      if (res.success) {
        toast.success("Leave applied successfully.");
        fetchLeaves();
        setApplyForm({ leaveType: "", reason: "", dateFrom: "", dateTo: "" });
        setApplyError({});
        closeModal("apply-leave-modal");
      }
    } catch (err) {
      toast.error(err.message || "Failed to apply leave.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave application?")) return;
    try {
      const res = await hrmService.deleteLeave(id);
      if (res.success) {
        toast.success("Leave canceled.");
        fetchLeaves();
        closeModal("view-leave-modal");
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel leave.");
    }
  };

  const approvedCount = myLeaves.filter(l => l.raw.status === 'APPROVED').length;
  const pendingCount  = myLeaves.filter(l => l.raw.status === 'PENDING').length;
  const rejectedCount = myLeaves.filter(l => l.raw.status === 'REJECTED').length;

  const kpis = [
    { title: "Total Applied", value: String(myLeaves.length) },
    { title: "Approved",      value: String(approvedCount) },
    { title: "Pending",       value: String(pendingCount) },
    { title: "Rejected",      value: String(rejectedCount) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Leaves" size={12} />
        {kpis.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </DashGrid>

      <div className="flex justify-end">
        <Button text="+ &nbsp; Apply Leave" onClick={() => openModal("apply-leave-modal")} />
      </div>

      <DataTable
        title="My Leaves History"
        columns={MY_LEAVES_COLS}
        rows={myLeaves}
        loading={loading}
        ellipse={4}
        defaultSortKey="appliedOn"
        defaultSortDir="desc"
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => { setSelected(row); openModal("view-leave-modal"); },
          },
          {
            icon: <Trash2 size={15} />,
            tooltip: "Cancel",
            variant: "danger",
            disabled: (row) => row.raw.status !== 'PENDING',
            onClick: (row) => handleCancel(row.id),
          },
        ]}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="my-leaves"
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Pending", "Approved", "Rejected"] },
          { title: "Leave Type", type: "toggle", key: "leaveType",   options: LEAVE_TYPES },
        ]}
      />

      <Modal id="view-leave-modal" title="Leave Application Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold ${
              selected.raw.status === "APPROVED" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
              selected.raw.status === "REJECTED" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              <span className="text-xs font-black uppercase tracking-widest">Status:</span>
              {selected.status}
            </div>
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type" value={selected.leaveType} />
              <ModalData label="Applied On" value={selected.appliedOn} />
              <ModalData label="From Date"  value={new Date(selected.raw.fromDate).toLocaleDateString()} />
              <ModalData label="To Date"    value={new Date(selected.raw.toDate).toLocaleDateString()} />
              <ModalData label="Total Days" value={`${selected.days} day${selected.days === 1 ? "" : "s"}`} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={selected.reason} />
            </ModalGrid>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              {selected.raw.status === "PENDING" && (
                <button onClick={() => handleCancel(selected.id)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 transition active:scale-95">Cancel Application</button>
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("view-leave-modal")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="apply-leave-modal" title="Apply for Leave" size="lg">
        <div className="space-y-5">
          <Grid cols={12} gap={4}>
            <div className="col-span-12">
              <SelectField label="Leave Type" id="apply-leave-type" size={12} placeholder="Select leave type..." value={applyForm.leaveType} onChange={(e) => handleApplyChange("leaveType", e.target.value)}>
                {LEAVE_TYPES.map((t) => <Option key={t} value={t} label={t} />)}
              </SelectField>
              {applyError.leaveType && <p className="text-xs text-rose-600 mt-1 px-1">{applyError.leaveType}</p>}
            </div>
            <div className="col-span-5">
              <DatePicker label="Date From" id="apply-date-from" value={applyForm.dateFrom} onChange={(v) => handleApplyChange("dateFrom", v)} />
              {applyError.dateFrom && <p className="text-xs text-rose-600 mt-1 px-1">{applyError.dateFrom}</p>}
            </div>
            <div className="col-span-5">
              <DatePicker label="Date To" id="apply-date-to" value={applyForm.dateTo} minDate={applyForm.dateFrom || undefined} onChange={(v) => handleApplyChange("dateTo", v)} />
              {applyError.dateTo && <p className="text-xs text-rose-600 mt-1 px-1">{applyError.dateTo}</p>}
            </div>
            <div className="col-span-2">
              <DataField label="Days" id="apply-days" type="text" size={12} value={applyDays ? `${applyDays} day${applyDays === 1 ? "" : "s"}` : ""} placeholder="# Days" disabled />
            </div>
            <div className="col-span-12">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Reason <span className="text-rose-400">*</span></label>
              <textarea placeholder="Briefly describe the reason for your leave..." value={applyForm.reason} onChange={(e) => handleApplyChange("reason", e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 resize-none transition duration-200" />
              {applyError.reason && <p className="text-xs text-rose-600 mt-1 px-1">{applyError.reason}</p>}
            </div>
          </Grid>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button text="Cancel" variant="ghost" onClick={() => { setApplyForm({ leaveType: "", reason: "", dateFrom: "", dateTo: "" }); setApplyError({}); closeModal("apply-leave-modal"); }} />
            <Button text="Submit Application" onClick={handleApplySubmit} loading={submitting} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
