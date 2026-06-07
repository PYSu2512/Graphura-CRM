import { Calendar, CheckCircle, Clock, Eye, Trash2, XCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
    Button,
    closeModal,
    DashGrid,
    DataField,
    DataTable,
    EnhancedDashCard,
    Grid,
    Heading,
    Modal,
    ModalData,
    ModalGrid,
    openModal,
    Option,
    SelectField,
} from "../../../../components/shared/Common_Components.jsx";
import { hrmService } from "../../../../services/hrmService";

const KPI_ICONS = [<Calendar size={22} />, <CheckCircle size={22} />, <Clock size={22} />, <XCircle size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];

const LEAVE_TYPES = [
  "SICK",
  "CASUAL",
  "EARNED",
  "MATERNITY",
  "PATERNITY",
  "BEREAVEMENT",
  "UNPAID",
  "HALF_DAY",
  "OTHER",
];

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

const COLS = [
  { key: "leaveTypeDisplay", label: "Leave Type" },
  { key: "reason", label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days", label: "Days" },
  { key: "appliedOn", label: "Applied On", sortValue: (row) => new Date(row.createdAt).getTime() },
  { key: "status", label: "Status" },
];

export default function Leaves() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const res = await hrmService.getMyLeaves();
      if (res.success) {
        setMyLeaves(res.data.map(l => ({
          ...l,
          leaveTypeDisplay: LEAVE_MAP[l.leaveType] || l.leaveType,
          dateRange: `${new Date(l.fromDate).toLocaleDateString()} to ${new Date(l.toDate).toLocaleDateString()}`,
          appliedOn: new Date(l.createdAt).toLocaleDateString(),
          status: l.status.charAt(0).toUpperCase() + l.status.slice(1).toLowerCase()
        })));
      }
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      toast.error("Failed to load leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const [selected, setSelected] = useState(null);
  const [applyForm, setApplyForm] = useState({ leaveType: "", reason: "", dateFrom: "", dateTo: "" });
  const [applyError, setApplyError] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const calcDays = (from, to) => {
    if (!from || !to) return 0;
    const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
    return diff < 0 ? 0 : diff + 1;
  };

  const applyDays = calcDays(applyForm.dateFrom, applyForm.dateTo);

  const { usedDays, approvedCount, pendingCount } = useMemo(() => {
    const approved = myLeaves.filter(l => l.status === 'Approved');
    return {
      usedDays: approved.reduce((sum, l) => sum + (l.days || 0), 0),
      approvedCount: approved.length,
      pendingCount: myLeaves.filter(l => l.status === 'Pending').length
    };
  }, [myLeaves]);

  const remainingDays = Math.max(0, 20 - usedDays);

  const kpis = [
    { title: "Used", value: `${usedDays}d` },
    { title: "Remaining", value: `${remainingDays}d` },
    { title: "Pending", value: String(pendingCount) },
    { title: "Approved", value: String(approvedCount) },
  ];

  const handleApplyChange = (field, value) => {
    setApplyForm((prev) => ({ ...prev, [field]: value }));
    if (applyError[field]) {
      setApplyError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleApplySubmit = async () => {
    const errs = {};
    if (!applyForm.leaveType) errs.leaveType = "Please select a leave type.";
    if (!applyForm.reason.trim()) errs.reason = "Reason is required.";
    if (!applyForm.dateFrom) errs.dateFrom = "Start date is required.";
    if (!applyForm.dateTo) errs.dateTo = "End date is required.";
    if (applyForm.dateFrom && applyForm.dateTo && applyForm.dateTo < applyForm.dateFrom) {
      errs.dateTo = "End date must be on or after start date.";
    }
    if (Object.keys(errs).length) {
      setApplyError(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await hrmService.applyLeave({
        leaveType: applyForm.leaveType,
        reason: applyForm.reason.trim(),
        fromDate: applyForm.dateFrom,
        toDate: applyForm.dateTo,
        days: Number(applyDays),
      });
      if (res.success) {
        toast.success("Leave Applied Successfully!", { icon: "📋" });
        setApplyForm({ leaveType: "", reason: "", dateFrom: "", dateTo: "" });
        setApplyError({});
        closeModal("me-apply-leave-modal");
        fetchMyLeaves();
      } else {
        toast.error(res.message || "Failed to apply leave.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (row) => {
    try {
      const res = await hrmService.deleteLeave(row._id || row.id);
      if (res.success) {
        toast.success("Leave application cancelled.");
        closeModal("me-leave-view-modal");
        fetchMyLeaves();
      } else {
        toast.error(res.message || "Failed to cancel leave.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Leaves" size={12} />
        {kpis.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={KPI_ACCENTS[i]}
            size={3}
          />
        ))}
      </DashGrid>

      <div className="flex justify-end">
        <Button text="+ Apply Leave" variant="primary" size={3} onClick={() => openModal("me-apply-leave-modal")} />
      </div>

      <DataTable
        title="My Leaves"
        columns={COLS}
        rows={myLeaves}
        defaultSortKey="appliedOn"
        defaultSortDir="desc"
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => {
              setSelected(row);
              openModal("me-leave-view-modal");
            },
          },
          {
            icon: <Trash2 size={15} />,
            tooltip: "Cancel",
            variant: "danger",
            disabled: (row) => row.status !== "Pending",
            onClick: (row) => handleCancel(row),
          },
        ]}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="my_leaves"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Pending", "Approved", "Rejected", "Cancelled"] },
          { title: "Leave Type", type: "toggle", key: "leaveType", options: LEAVE_TYPES },
        ]}
      />

      <Modal id="me-leave-view-modal" title="Leave Application" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type" value={selected.leaveType} />
              <ModalData label="Applied On" value={selected.appliedOn} />
              <ModalData label="From Date" value={selected.fromDate} />
              <ModalData label="To Date" value={selected.toDate} />
              <ModalData label="Total Days" value={`${selected.days} day${selected.days === 1 ? "" : "s"}`} />
              <ModalData label="Status" value={selected.status} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={selected.reason} />
            </ModalGrid>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              {selected.status === "Pending" && (
                <Button
                  text="Cancel Application"
                  variant="danger"
                  size={3}
                  onClick={() => handleCancel(selected)}
                />
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("me-leave-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="me-apply-leave-modal" title="Apply for Leave" size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={4}>
            <div className="col-span-12">
              <SelectField
                label="Leave Type"
                id="me-leave-type"
                value={applyForm.leaveType}
                onChange={(e) => handleApplyChange("leaveType", e.target.value)}
              >
                <Option value="" label="Select leave type" />
                {LEAVE_TYPES.map((type) => (
                  <Option key={type} value={type} label={type} />
                ))}
              </SelectField>
              {applyError.leaveType && <p className="text-xs text-rose-600 mt-1 px-1">{applyError.leaveType}</p>}
            </div>
            <div className="col-span-6">
              <DataField
                label="Date From"
                id="me-leave-from"
                type="date"
                value={applyForm.dateFrom}
                onChange={(e) => handleApplyChange("dateFrom", e.target.value)}
              />
              {applyError.dateFrom && <p className="text-xs text-rose-600 mt-1 px-1">{applyError.dateFrom}</p>}
            </div>
            <div className="col-span-6">
              <DataField
                label="Date To"
                id="me-leave-to"
                type="date"
                value={applyForm.dateTo}
                onChange={(e) => handleApplyChange("dateTo", e.target.value)}
              />
              {applyError.dateTo && <p className="text-xs text-rose-600 mt-1 px-1">{applyError.dateTo}</p>}
            </div>
            <div className="col-span-12">
              <DataField
                label="Reason"
                id="me-leave-reason"
                type="textarea"
                rows={4}
                value={applyForm.reason}
                onChange={(e) => handleApplyChange("reason", e.target.value)}
                placeholder="Briefly describe why you need leave..."
              />
              {applyError.reason && <p className="text-xs text-rose-600 mt-1 px-1">{applyError.reason}</p>}
            </div>
            <div className="col-span-12">
              <ModalGrid title="Summary" cols={3}>
                <ModalData label="Days" value={applyDays ? `${applyDays} day${applyDays === 1 ? "" : "s"}` : "—"} />
                <ModalData label="Status" value="Pending" />
                <ModalData label="Applied On" value={new Date().toISOString().slice(0, 10)} />
              </ModalGrid>
            </div>
          </Grid>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              text="Cancel"
              variant="secondary"
              size={3}
              onClick={() => {
                setApplyForm({ leaveType: "", reason: "", dateFrom: "", dateTo: "" });
                setApplyError({});
                closeModal("me-apply-leave-modal");
              }}
            />
            <Button text="Submit Application" variant="primary" size={3} onClick={handleApplySubmit} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
