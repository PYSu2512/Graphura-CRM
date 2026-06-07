import { useState, useEffect, useMemo } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  Modal, ModalGrid, ModalData, ModalProfile, Button,
  openModal, closeModal, Grid, DataField, SelectField, Option,
} from "../../../../components/shared/Common_Components";
import DatePicker from "../../../../components/shared/DatePicker";
import { Calendar, CheckCircle, Clock, XCircle, Eye, Plus, Trash2 } from "lucide-react";
import { hrmService } from "../../../../services/hrmService";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { toast } from "react-hot-toast";

const KPI_ICONS   = [<Calendar size={20} />, <CheckCircle size={20} />, <Clock size={20} />, <XCircle size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];

const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Earned Leave", "Maternity Leave", "Paternity Leave", "Bereavement Leave", "Unpaid Leave", "Half Day", "Other"];

const MY_COLS = [
  { key: "leaveType", label: "Type" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "appliedOn", label: "Applied On", sortValue: (row) => new Date(row.raw?.createdAt || row.createdAt).getTime() },
  { key: "status",    label: "Status" },
];

const TEAM_COLS = [
  { key: "name",      label: "Employee" },
  { key: "leaveType", label: "Type" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "appliedOn", label: "Applied On", sortValue: (row) => new Date(row.raw?.createdAt || row.createdAt).getTime() },
  { key: "status",    label: "Status" },
];

export default function Leaves() {
  const currentUser = useCurrentUser();
  const [myLeaves, setMyLeaves] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [myView,      setMyView]      = useState(null);
  const [pendingView, setPendingView] = useState(null);
  const [historyView, setHistoryView] = useState(null);

  const [form, setForm] = useState({ leaveType: "", reason: "", dateFrom: "", dateTo: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const [myRes, teamRes] = await Promise.all([
        hrmService.getMyLeaves(),
        hrmService.getTeamLeaves()
      ]);

      const formatRole = (str) => {
        if (!str) return "";
        const clean = str.replace(/^(SALES|FINANCE|MANAGEMENT)_/, '');
        if (clean === 'TL') return "Team Leader";
        return clean.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      };

      const mapLeave = (l) => {
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

        return {
          ...l,
          id: l._id,
          name: l.user?.name || "Unknown",
          leaveType: LEAVE_MAP[l.leaveType] || l.leaveType,
          dateRange: `${new Date(l.fromDate).toLocaleDateString()} to ${new Date(l.toDate).toLocaleDateString()}`,
          appliedOn: new Date(l.createdAt).toLocaleDateString(),
          actionOn: l.approvedAt ? new Date(l.approvedAt).toLocaleDateString() : "—",
          status: l.status.charAt(0).toUpperCase() + l.status.slice(1).toLowerCase(),
          raw: l
        };
      };

      if (myRes.success) {
        setMyLeaves(myRes.data.map(mapLeave).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
      if (teamRes.success) {
        setTeamLeaves(teamRes.data
          .filter(l => String(l.user?._id) !== String(currentUser?._id))
          .map(mapLeave)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      toast.error("Failed to load leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const kpis = useMemo(() => {
    const total    = myLeaves.length;
    const approved = myLeaves.filter(l => l.raw.status === 'APPROVED').length;
    const pending  = myLeaves.filter(l => l.raw.status === 'PENDING').length;
    const rejected = myLeaves.filter(l => l.raw.status === 'REJECTED').length;
    return [
      { title: "Total Leaves", value: String(total) },
      { title: "Approved",    value: String(approved) },
      { title: "Pending",     value: String(pending) },
      { title: "Rejected",    value: String(rejected) },
    ];
  }, [myLeaves]);

  const pendingRows = teamLeaves.filter(l => l.raw.status === 'PENDING');
  const historyRows = teamLeaves.filter(l => l.raw.status !== 'PENDING');

  const onChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: "" }));
  };

  const applyDays = useMemo(() => {
    if (!form.dateFrom || !form.dateTo) return 0;
    const diff = (new Date(form.dateTo) - new Date(form.dateFrom)) / 86400000;
    return diff < 0 ? 0 : diff + 1;
  }, [form.dateFrom, form.dateTo]);

  const submitApply = async () => {
    const e = {};
    if (!form.leaveType) e.leaveType = "Select type.";
    if (!form.reason.trim()) e.reason = "Reason is required.";
    if (!form.dateFrom) e.dateFrom = "Start date required.";
    if (!form.dateTo) e.dateTo = "End date required.";
    if (form.dateFrom && form.dateTo && form.dateTo < form.dateFrom) e.dateTo = "End date must be after start.";
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    try {
      const res = await hrmService.applyLeave({
        leaveType: form.leaveType,
        fromDate: form.dateFrom,
        toDate: form.dateTo,
        reason: form.reason.trim(),
        days: applyDays
      });
      if (res.success) {
        toast.success("Leave applied!");
        fetchLeaves();
        setForm({ leaveType: "", reason: "", dateFrom: "", dateTo: "" });
        closeModal("tl-hrm-leave-apply");
      }
    } catch {
      toast.error("Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (row) => {
    if (!window.confirm("Cancel this request?")) return;
    try {
      const res = await hrmService.deleteLeave(row.id);
      if (res.success) {
        toast.success("Canceled!");
        fetchLeaves();
        closeModal("tl-hrm-my-view");
      }
    } catch {
      toast.error("Failed.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Leaves" secondaryText="Management" size={12} />
        {kpis.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value} icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </DashGrid>

      <div className="flex justify-end -mb-4">
        <Button text="Apply Leave" size={3} onClick={() => openModal("tl-hrm-leave-apply")} />
      </div>

      <DataTable
        title="My Leaves"
        columns={MY_COLS}
        rows={myLeaves}
        loading={loading}
        defaultSortKey="appliedOn"
        defaultSortDir="desc"
        size={12} pageSize={5} searchable
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Pending", "Approved", "Rejected"] },
          { title: "Leave Type", type: "toggle", key: "leaveType",   options: LEAVE_TYPES },
        ]}
        actions={[{ icon: <Eye size={15} />, tooltip: "View", variant: "ghost", onClick: (row) => { setMyView(row); openModal("tl-hrm-my-view"); } }]}
      />

      <DataTable
        title="Team Pending Requests"
        columns={TEAM_COLS}
        rows={pendingRows}
        loading={loading}
        userProfile="name"
        defaultSortKey="appliedOn"
        defaultSortDir="desc"
        size={12} pageSize={10} searchable
        filters={[
          { title: "Leave Type", type: "toggle", key: "leaveType",   options: LEAVE_TYPES },
        ]}
        actions={[
          { icon: <Eye size={15} />, tooltip: "View", variant: "ghost", onClick: (row) => { setPendingView(row); openModal("tl-hrm-pending-view"); } },
        ]}
      />

      <DataTable
        title="Team Leave History"
        columns={TEAM_COLS}
        rows={historyRows}
        loading={loading}
        userProfile="name"
        defaultSortKey="appliedOn"
        defaultSortDir="desc"
        size={12} pageSize={10}
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Approved", "Rejected"] },
          { title: "Leave Type", type: "toggle", key: "leaveType",   options: LEAVE_TYPES },
        ]}
        actions={[{ icon: <Eye size={15} />, tooltip: "View", variant: "ghost", onClick: (row) => { setHistoryView(row); openModal("tl-hrm-history-view"); } }]}
      />

      {/* ── View Modals ── */}
      <Modal id="tl-hrm-my-view" title="My Leave Details" size="md">
        {myView && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Details" cols={2}>
              <ModalData label="Type" value={myView.leaveType} />
              <ModalData label="Dates" value={myView.dateRange} />
              <ModalData label="Days" value={myView.days} />
              <ModalData label="Status" value={myView.status} />
            </ModalGrid>
            <ModalData label="Reason" value={myView.reason} />
            <div className="flex justify-end gap-3 pt-2">
              {myView.raw.status === 'PENDING' && <Button text="Cancel Request" variant="danger" size={4} onClick={() => handleCancel(myView)} />}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-hrm-my-view")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="tl-hrm-pending-view" title="Request Details" size="md">
        {pendingView && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={pendingView.name} subtitle={pendingView.raw.user?.role} />
            <ModalGrid title="Details" cols={2}>
              <ModalData label="Type" value={pendingView.leaveType} />
              <ModalData label="Dates" value={pendingView.dateRange} />
              <ModalData label="Days" value={pendingView.days} />
            </ModalGrid>
            <ModalData label="Reason" value={pendingView.reason} />
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-hrm-pending-view")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="tl-hrm-history-view" title="History Details" size="md">
        {historyView && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={historyView.name} subtitle={historyView.raw.user?.role} />
            <ModalGrid title="Details" cols={2}>
              <ModalData label="Type" value={historyView.leaveType} />
              <ModalData label="Dates" value={historyView.dateRange} />
              <ModalData label="Actioned On" value={historyView.actionOn} />
              <ModalData label="Status" value={historyView.status} />
            </ModalGrid>
            <ModalData label="Reason" value={historyView.reason} />
            <div className="flex justify-end"><Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-hrm-history-view")} /></div>
          </div>
        )}
      </Modal>

      {/* ── Apply Modal ── */}
      <Modal id="tl-hrm-leave-apply" title="Apply for Leave" size="lg">
        <div className="space-y-5">
          <SelectField label="Leave Type" value={form.leaveType} onChange={(e) => onChange("leaveType", e.target.value)}>
            <Option value="" label="Select type..." />
            {LEAVE_TYPES.map(t => <Option key={t} value={t} label={t} />)}
          </SelectField>
          <div className="grid grid-cols-2 gap-4">
            <DatePicker label="Start Date" value={form.dateFrom} onChange={v => onChange("dateFrom", v)} />
            <DatePicker label="End Date" value={form.dateTo} onChange={v => onChange("dateTo", v)} />
          </div>
          <textarea className="w-full rounded-2xl border p-4 text-sm" placeholder="Reason..." rows={4} value={form.reason} onChange={e => onChange("reason", e.target.value)} />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("tl-hrm-leave-apply")} />
            <Button text="Submit" loading={submitting} size={4} onClick={submitApply} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
