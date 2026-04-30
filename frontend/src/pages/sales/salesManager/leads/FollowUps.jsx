import { useState } from "react";
import {
  DataTable, Modal, Button, DataField, SelectField, Option,
  openModal, closeModal, ModalProfile, ModalData, ModalGrid, Grid,
} from "../../../../components/shared/Common_Components";
import { Eye, CalendarClock, BadgeCheck, CheckCircle } from "lucide-react";
import { DUMMY_FOLLOWUPS } from "./leadsStore";

export default function FollowUps() {
  const [followUps, setFollowUps] = useState(
    DUMMY_FOLLOWUPS.map((f, i) => ({ ...f, id: `FU${String(i + 1).padStart(3, "0")}` }))
  );

  // ── View modal ────────────────────────────────────────────────────────────
  const [viewRow, setViewRow] = useState(null);

  // ── Reschedule modal ──────────────────────────────────────────────────────
  const [rescheduleRow,  setRescheduleRow]  = useState(null);
  const [newDate,        setNewDate]        = useState("");

  // ── Mark Done bulk result ─────────────────────────────────────────────────
  const [doneResult, setDoneResult] = useState([]);

  const markDone = (rows) => {
    const ids = rows.map((r) => r.id);
    setFollowUps((prev) =>
      prev.map((f) => ids.includes(f.id) ? { ...f, status: "Done" } : f)
    );
    setDoneResult(rows);
    openModal("fu-done-modal");
  };

  const confirmReschedule = () => {
    if (!newDate) return;
    setFollowUps((prev) =>
      prev.map((f) => f.id === rescheduleRow.id ? { ...f, followUpDate: newDate } : f)
    );
    setRescheduleRow(null);
    setNewDate("");
    closeModal("fu-reschedule-modal");
  };

  return (
    <>
      <DataTable
        title="Follow-ups"
        columns={[
          { key: "name",         label: "Lead Name" },
          { key: "assignedTL",   label: "Assigned TL" },
          { key: "assignedExec", label: "Executive" },
          { key: "followUpDate", label: "Date" },
          { key: "priority",     label: "Priority" },
          { key: "status",       label: "Status" },
        ]}
        rows={followUps}
        searchable
        date={true}
        bulkAction
        bulkActions={[
          {
            title: "Mark Done",
            icon: <BadgeCheck size={14} />,
            onClick: (selected) => markDone(selected),
          },
        ]}
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["High", "Medium", "Low"] },
          { title: "Status",   type: "toggle", key: "status",   options: ["Pending", "Done"] },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setViewRow(followUps.find((f) => f.id === row.id)); openModal("fu-view-modal"); },
          },
          {
            icon: <CalendarClock size={15} />, tooltip: "Reschedule", variant: "ghost",
            onClick: (row) => {
              const f = followUps.find((x) => x.id === row.id);
              setRescheduleRow(f);
              setNewDate(f?.followUpDate ?? "");
              openModal("fu-reschedule-modal");
            },
          },
          {
            icon: <BadgeCheck size={15} />, tooltip: "Mark Done", variant: "primary",
            onClick: (row) => markDone([row]),
          },
        ]}
        size={12}
        pageSize={10}
      />

      {/* ── View Modal ──────────────────────────────────────────────────────── */}
      <Modal id="fu-view-modal" title="Follow-up Details" size="md">
        {viewRow && (
          <div className="space-y-4">
            <ModalProfile
              name={viewRow.name}
              subtitle={`${viewRow.assignedTL} · ${viewRow.priority} Priority`}
              meta={`Status: ${viewRow.status}`}
            />
            <ModalGrid title="Assignment" cols={2}>
              <ModalData label="Assigned TL"   value={viewRow.assignedTL} />
              <ModalData label="Executive"      value={viewRow.assignedExec} />
            </ModalGrid>
            <ModalGrid title="Schedule" cols={2}>
              <ModalData label="Follow-up Date" value={viewRow.followUpDate} />
              <ModalData label="Priority"        value={viewRow.priority} />
              <ModalData label="Status"          value={viewRow.status} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("fu-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reschedule Modal ─────────────────────────────────────────────────── */}
      <Modal id="fu-reschedule-modal" title="Reschedule Follow-up" size="sm">
        {rescheduleRow && (
          <div className="space-y-4">
            <ModalProfile
              name={rescheduleRow.name}
              subtitle={`Current date: ${rescheduleRow.followUpDate}`}
              meta={`Priority: ${rescheduleRow.priority}`}
            />
            <DataField
              label="New Follow-up Date"
              id="fu-new-date"
              type="date"
              value={newDate}
              size={12}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <div className="flex gap-3 pt-2">
              <Button text="Reschedule" variant="primary"   size={6} onClick={confirmReschedule} disabled={!newDate} />
              <Button text="Cancel"     variant="secondary" size={6} onClick={() => closeModal("fu-reschedule-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Mark Done Result Modal ───────────────────────────────────────────── */}
      <Modal id="fu-done-modal" title="Marked as Done" size="sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl">
            <CheckCircle size={18} className="flex-shrink-0" />
            <p className="text-sm font-semibold">
              {doneResult.length} follow-up{doneResult.length !== 1 ? "s" : ""} marked as Done.
            </p>
          </div>
          <ul className="space-y-1.5">
            {doneResult.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <BadgeCheck size={14} className="text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-[#2a465a]">{r.name}</span>
                <span className="text-slate-400">· {r.followUpDate}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <Button text="Close" variant="primary" size={3} onClick={() => closeModal("fu-done-modal")} />
          </div>
        </div>
      </Modal>
    </>
  );
}
