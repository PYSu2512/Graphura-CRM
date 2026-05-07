import { useState, useMemo } from "react";
import {
  DashGrid, DashCard, DataTable, Modal, ModalProfile, ModalGrid, ModalData,
  Button, openModal, closeModal,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Palmtree, CheckCircle, XCircle, Clock, Eye, BadgeCheck, Ban,
} from "lucide-react";
import { leaveRequests as INITIAL_REQUESTS, LEAVE_TYPES } from "./teamStore";

const PENDING_COLS = [
  { key: "name",      label: "Executive" },
  { key: "type",      label: "Leave Type" },
  { key: "reason",    label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "appliedOn", label: "Applied On" },
];

const HISTORY_COLS = [
  { key: "name",      label: "Executive" },
  { key: "type",      label: "Leave Type" },
  { key: "reason",    label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "actionOn",  label: "Actioned On" },
  { key: "status",    label: "Status" }, // auto-renders as colored badge
];

const today = () => new Date().toISOString().split("T")[0];

export default function LeaveApprovals() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const [viewRow,     setViewRow]     = useState(null);
  const [decisionRow, setDecisionRow] = useState(null);
  const [decision,    setDecision]    = useState(""); // "Approved" | "Rejected"

  const pending  = useMemo(() => requests.filter((r) => r.status === "Pending"),  [requests]);
  const history  = useMemo(() => requests.filter((r) => r.status !== "Pending"),  [requests]);
  const approved = useMemo(() => requests.filter((r) => r.status === "Approved").length, [requests]);
  const rejected = useMemo(() => requests.filter((r) => r.status === "Rejected").length, [requests]);

  const setStatus = (row, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => r.id === row.id ? { ...r, status: newStatus, actionOn: today() } : r)
    );
  };

  // ── Decision flow with confirmation modal ────────────────────────────────
  const askDecision = (row, choice) => {
    setDecisionRow(row);
    setDecision(choice);
    openModal("tl-leave-decision");
  };

  const confirmDecision = () => {
    setStatus(decisionRow, decision);
    closeModal("tl-leave-decision");
    // also close the view modal if it was open
    closeModal("tl-leave-view");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <DashCard title="Pending"  value={String(pending.length)}  icon={<Clock       size={22} />} accentColor="#f59e0b" size={3} />
        <DashCard title="Approved" value={String(approved)}        icon={<CheckCircle size={22} />} accentColor="#22c55e" size={3} />
        <DashCard title="Rejected" value={String(rejected)}        icon={<XCircle     size={22} />} accentColor="#f43f5e" size={3} />
        <DashCard title="Total"    value={String(requests.length)} icon={<Palmtree    size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      {/* ── Pending requests ─────────────────────────────────────────────── */}
      <DataTable
        title={`Pending Requests${pending.length ? ` (${pending.length})` : ""}`}
        columns={PENDING_COLS}
        rows={pending}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="leave_pending"
        filters={[
          { title: "Leave Type", type: "toggle", key: "type", options: LEAVE_TYPES },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setViewRow(requests.find((r) => r.id === row.id)); openModal("tl-leave-view"); },
          },
          {
            icon: <BadgeCheck size={15} />, tooltip: "Approve", variant: "primary",
            onClick: (row) => askDecision(row, "Approved"),
          },
          {
            icon: <Ban size={15} />, tooltip: "Reject", variant: "danger",
            onClick: (row) => askDecision(row, "Rejected"),
          },
        ]}
      />

      {/* ── History ──────────────────────────────────────────────────────── */}
      <DataTable
        title="Leave History"
        columns={HISTORY_COLS}
        rows={history}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="leave_history"
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Approved", "Rejected"] },
          { title: "Leave Type", type: "toggle", key: "type",   options: LEAVE_TYPES },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setViewRow(requests.find((r) => r.id === row.id)); openModal("tl-leave-view"); },
          },
        ]}
      />

      {/* ── View modal ───────────────────────────────────────────────────── */}
      <Modal id="tl-leave-view" title="Leave Request" size="md">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.name}
              subtitle={`${viewRow.type} · ${viewRow.status}`}
              meta={`Applied: ${viewRow.appliedOn}`}
            />
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="From"        value={viewRow.from} />
              <ModalData label="To"          value={viewRow.to} />
              <ModalData label="Total Days"  value={viewRow.days} />
              <ModalData label="Status"      value={viewRow.status} />
              {viewRow.actionOn && <ModalData label="Actioned On" value={viewRow.actionOn} />}
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={viewRow.reason} />
            </ModalGrid>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {viewRow.status === "Pending" && (
                <>
                  <Button text="Reject"  variant="danger"  size={3} onClick={() => askDecision(viewRow, "Rejected")} />
                  <Button text="Approve" variant="primary" size={3} onClick={() => askDecision(viewRow, "Approved")} />
                </>
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-leave-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Decision confirmation modal ──────────────────────────────────── */}
      <Modal id="tl-leave-decision" title={`Confirm ${decision || "Decision"}`} size="sm">
        {decisionRow && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              {decision === "Approved" ? "Approve" : "Reject"} the leave request from{" "}
              <span className="font-bold text-[#2a465a]">{decisionRow.name}</span> for{" "}
              <span className="font-bold">{decisionRow.days} day{decisionRow.days === "1" ? "" : "s"}</span> ({decisionRow.from} to {decisionRow.to})?
            </p>
            <ModalGrid title="Request" cols={2}>
              <ModalData label="Leave Type" value={decisionRow.type} />
              <ModalData label="Days"       value={decisionRow.days} />
            </ModalGrid>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button text="Cancel" variant="secondary" size={3} onClick={() => closeModal("tl-leave-decision")} />
              <Button
                text={`Confirm ${decision}`}
                variant={decision === "Approved" ? "primary" : "danger"}
                size={4}
                onClick={confirmDecision}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
