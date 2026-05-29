import { useState } from "react";
import {
  DataTable,
  DataField,
  SelectField,
  Option,
  Button,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  Grid,
  openModal,
  closeModal,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Eye,
  RefreshCw,
  MessageSquare,
  FileText,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { currentEmployee } from "../managementEmployeeStore";
import {
  PROJECT_COLS,
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  ME_ALLOWED_STATUSES,
  asTableRow,
  canUpdateStatus,
  statusBlockedReason,
} from "./projectsStore";

const today = () => new Date().toISOString().slice(0, 10);

const formatINR = (n) =>
  typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "—";

const paymentBadge = (p) => {
  if (!p.totalCost) return "Pending";
  if (p.paidAmount >= p.totalCost) return "Paid";
  if (p.paidAmount > 0) return "Partially Paid";
  return "Pending";
};

const BLANK_STATUS  = { status: "In Progress", progress: "0" };
const BLANK_COMMENT = { body: "" };
const BLANK_NOTE    = { body: "", isClientVisible: true };

export default function AllAssigned({ projects, updateProject, title = "My Projects" }) {
  const [viewRow,    setViewRow]    = useState(null);
  const [statusRow,  setStatusRow]  = useState(null);
  const [statusForm, setStatusForm] = useState(BLANK_STATUS);
  const [commentRow, setCommentRow] = useState(null);
  const [commentForm, setCommentForm] = useState(BLANK_COMMENT);
  const [noteRow,    setNoteRow]    = useState(null);
  const [noteForm,   setNoteForm]   = useState(BLANK_NOTE);
  const [blockedRow, setBlockedRow] = useState(null);

  const tableRows = projects.map(asTableRow);

  // ── Open handlers ──────────────────────────────────────────────────────
  const openView = (row) => {
    setViewRow(projects.find((p) => p.id === row.id));
    openModal("me-project-view");
  };

  const openStatusUpdate = (row) => {
    const full = projects.find((p) => p.id === row.id);
    if (!canUpdateStatus(full)) {
      setBlockedRow(full);
      openModal("me-status-blocked");
      return;
    }
    setStatusRow(full);
    setStatusForm({ status: full.status, progress: String(full.progress) });
    openModal("me-status-update");
  };

  const openAddComment = (row) => {
    setCommentRow(projects.find((p) => p.id === row.id));
    setCommentForm(BLANK_COMMENT);
    openModal("me-add-comment");
  };

  const openAddNote = (row) => {
    setNoteRow(projects.find((p) => p.id === row.id));
    setNoteForm(BLANK_NOTE);
    openModal("me-add-worknote");
  };

  // ── Save handlers ──────────────────────────────────────────────────────
  const saveStatus = () => {
    const stamp = today();
    const nextProgress = Math.max(0, Math.min(100, Number(statusForm.progress) || 0));
    const statusChanged = statusForm.status !== statusRow.status;
    const nextUpdates = statusChanged
      ? [
          ...(statusRow.updates ?? []),
          {
            date: stamp,
            status: statusForm.status,
            note: `Status changed to "${statusForm.status}" by ${currentEmployee.name}.`,
            isClientVisible: true,
          },
        ]
      : statusRow.updates;

    updateProject(statusRow.id, {
      status:      statusForm.status,
      progress:    nextProgress,
      lastUpdated: stamp,
      updates:     nextUpdates,
    });
    setStatusForm(BLANK_STATUS);
    closeModal("me-status-update");
  };

  const saveComment = () => {
    const body = commentForm.body.trim();
    if (!body) return;
    const stamp = today();
    updateProject(commentRow.id, {
      lastUpdated: stamp,
      comments: [
        ...(commentRow.comments ?? []),
        { date: stamp, author: currentEmployee.name, body },
      ],
    });
    setCommentForm(BLANK_COMMENT);
    closeModal("me-add-comment");
  };

  const saveNote = () => {
    const body = noteForm.body.trim();
    if (!body) return;
    const stamp = today();
    updateProject(noteRow.id, {
      lastUpdated: stamp,
      updates: [
        ...(noteRow.updates ?? []),
        {
          date: stamp,
          status: noteRow.status,
          note: body,
          isClientVisible: noteForm.isClientVisible,
        },
      ],
    });
    setNoteForm(BLANK_NOTE);
    closeModal("me-add-worknote");
  };

  return (
    <>
      <DataTable
        title={title}
        columns={PROJECT_COLS}
        rows={tableRows}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="my_projects"
        filters={[
          { title: "Status",   type: "select", key: "status",   options: PROJECT_STATUSES },
          { title: "Priority", type: "toggle", key: "priority", options: PROJECT_PRIORITIES },
        ]}
        actions={[
          { icon: <Eye size={15} />,           tooltip: "View",          variant: "ghost", onClick: openView },
          { icon: <RefreshCw size={15} />,     tooltip: "Update Status", variant: "ghost", onClick: openStatusUpdate },
          { icon: <MessageSquare size={15} />, tooltip: "Add Comment",   variant: "ghost", onClick: openAddComment },
          { icon: <FileText size={15} />,      tooltip: "Add Work Note", variant: "ghost", onClick: openAddNote },
        ]}
      />

      {/* ── View modal (read-only) ─────────────────────────────────────── */}
      <Modal id="me-project-view" title="Project Details" size="lg">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.name}
              subtitle={`${viewRow.clientName} · ${viewRow.assignedTLName}`}
              meta={`${viewRow.id} · Deadline ${viewRow.deadline}`}
            />
            <ModalGrid title="Overview" cols={3}>
              <ModalData label="Status"       value={viewRow.status} />
              <ModalData label="Priority"     value={viewRow.priority} />
              <ModalData label="Progress"     value={`${viewRow.progress}%`} />
              <ModalData label="Start Date"   value={viewRow.startDate} />
              <ModalData label="Deadline"     value={viewRow.deadline} />
              <ModalData label="Completed On" value={viewRow.deliveredDate ?? "—"} />
            </ModalGrid>
            <ModalGrid title="Client" cols={2}>
              <ModalData label="Name"   value={viewRow.clientName} />
              <ModalData label="Mobile" value={viewRow.clientMobile} />
            </ModalGrid>
            <ModalGrid title="Links (read-only — owned by Manager)" cols={1}>
              <ModalData label="Drive Link"    value={viewRow.driveLink    ?? "—"} />
              <ModalData label="Handover Link" value={viewRow.handoverLink ?? "— (set by Manager before completion)"} />
            </ModalGrid>
            <ModalGrid title="Payment (Finance-owned, read-only)" cols={3}>
              <ModalData label="Total Cost"  value={formatINR(viewRow.totalCost)} />
              <ModalData label="Amount Paid" value={formatINR(viewRow.paidAmount)} />
              <ModalData label="Type"        value={viewRow.paymentType ?? "—"} />
              <ModalData label="Status"      value={paymentBadge(viewRow)} />
              <ModalData label="WO Signed"   value={viewRow.woSigned ? "Yes" : "No"} />
              <ModalData label="WO Date"     value={viewRow.woSignedDate ?? "—"} />
            </ModalGrid>

            {/* ── Updates feed ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 mb-2">
                Project Updates · Work Notes ({(viewRow.updates ?? []).length})
              </p>
              {(viewRow.updates ?? []).length === 0 ? (
                <p className="text-sm text-slate-500 px-1">No updates posted yet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {[...(viewRow.updates ?? [])].reverse().map((u, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2a465a]">{u.date}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                            {u.status}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            u.isClientVisible === false
                              ? "bg-slate-100 text-slate-500 border border-slate-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {u.isClientVisible === false ? "Internal" : "Client-visible"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700">{u.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Comments feed ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 mb-2">
                Comments ({(viewRow.comments ?? []).length})
              </p>
              {(viewRow.comments ?? []).length === 0 ? (
                <p className="text-sm text-slate-500 px-1">No comments yet.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {[...(viewRow.comments ?? [])].reverse().map((c, i) => (
                    <div key={i} className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2a465a]">{c.author}</span>
                        <span className="text-xs text-slate-500">{c.date}</span>
                      </div>
                      <p className="text-sm text-slate-700">{c.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("me-project-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Status Update modal (HARD-CAPPED dropdown) ─────────────────── */}
      <Modal id="me-status-update" title="Update Project Status" size="md">
        {statusRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={statusRow.name}
              subtitle={`Current status: ${statusRow.status}`}
              meta={`${statusRow.id} · ${statusRow.clientName}`}
            />
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                You can only switch between <b>Not Started</b> and <b>In Progress</b>.
                Review Stage, Finalization, Completed and Delayed are set by your Team Leader or Manager.
              </p>
            </div>
            <Grid cols={12} gap={3}>
              <SelectField
                label="New Status *"
                id="me-status-new"
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                size={6}
              >
                {ME_ALLOWED_STATUSES.map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <DataField
                label="Progress %"
                id="me-status-progress"
                type="number"
                value={statusForm.progress}
                onChange={(e) => setStatusForm({ ...statusForm, progress: e.target.value })}
                size={6}
              />
            </Grid>
            <Grid cols={12} gap={2}>
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("me-status-update")} />
              <Button text="Save"   variant="primary"   size={6} onClick={saveStatus} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Status-blocked modal ───────────────────────────────────────── */}
      <Modal id="me-status-blocked" title="Cannot Update Status" size="sm">
        {blockedRow && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Lock size={20} className="text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{statusBlockedReason(blockedRow)}</p>
            </div>
            <ModalGrid title="Project" cols={1}>
              <ModalData label="Name"   value={blockedRow.name} />
              <ModalData label="ID"     value={blockedRow.id} />
              <ModalData label="My TL"  value={blockedRow.assignedTLName} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Got it" variant="primary" size={4} onClick={() => closeModal("me-status-blocked")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add Comment modal ──────────────────────────────────────────── */}
      <Modal id="me-add-comment" title="Add Comment" size="md">
        {commentRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={commentRow.name}
              subtitle={`${commentRow.clientName} · ${commentRow.id}`}
              meta="Short comment — visible to your TL and Manager"
            />
            <DataField
              label="Comment *"
              id="me-comment-body"
              type="textarea"
              rows={4}
              placeholder="Quick note for your TL or your own log…"
              value={commentForm.body}
              onChange={(e) => setCommentForm({ body: e.target.value })}
              size={12}
            />
            <Grid cols={12} gap={2}>
              <Button text="Cancel"     variant="secondary" size={6} onClick={() => closeModal("me-add-comment")} />
              <Button text="Add Comment" variant="primary"  size={6} onClick={saveComment} disabled={!commentForm.body.trim()} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Add Work Note modal ────────────────────────────────────────── */}
      <Modal id="me-add-worknote" title="Add Work Note" size="md">
        {noteRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={noteRow.name}
              subtitle={`Current status: ${noteRow.status}`}
              meta={`${noteRow.id} · Appended to the project timeline`}
            />
            <DataField
              label="Work Note *"
              id="me-note-body"
              type="textarea"
              rows={5}
              placeholder="What did you complete? What's blocked?"
              value={noteForm.body}
              onChange={(e) => setNoteForm({ ...noteForm, body: e.target.value })}
              size={12}
            />
            <label className="flex items-start gap-2 px-1 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                checked={noteForm.isClientVisible}
                onChange={(e) => setNoteForm({ ...noteForm, isClientVisible: e.target.checked })}
              />
              <span>
                Show this note on the public <b>Client Tracking Page</b>.
                <span className="block text-xs text-slate-500 mt-0.5">
                  Uncheck for internal-only notes (your TL and Manager will still see them).
                </span>
              </span>
            </label>
            <Grid cols={12} gap={2}>
              <Button text="Cancel"        variant="secondary" size={6} onClick={() => closeModal("me-add-worknote")} />
              <Button text="Add Work Note" variant="primary"   size={6} onClick={saveNote} disabled={!noteForm.body.trim()} />
            </Grid>
          </div>
        )}
      </Modal>
    </>
  );
}
