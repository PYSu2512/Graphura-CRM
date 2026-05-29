import { useState } from "react";
import {
  Modal, Button, DataField, closeModal,
} from "../../../../../components/shared/Common_Components.jsx";
import { currentEmployee, myProjects } from "../../managementEmployeeStore";
import { addComment, addWorkNote } from "../activityStore";

const MODAL_ID = "me-activity-drawer";

export { MODAL_ID as DRAWER_MODAL_ID };

export default function ProjectActivityDrawer({ project, activityState, setActivityState }) {
  const [commentBody, setCommentBody]           = useState("");
  const [noteBody, setNoteBody]                 = useState("");
  const [isClientVisible, setIsClientVisible]   = useState(true);
  const [activeForm, setActiveForm]             = useState(null);

  if (!project) return null;

  const projectComments  = activityState.commentsByProject[project.id]  ?? [];
  const projectWorkNotes = activityState.workNotesByProject[project.id] ?? [];

  const isMyProject = myProjects.some((p) => p.id === project.id);

  const thread = [
    ...projectComments.map((c)  => ({ ...c, type: "comment"  })),
    ...projectWorkNotes.map((n) => ({ ...n, type: "worknote" })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const handleAddComment = () => {
    if (!commentBody.trim() || !isMyProject) return;
    setActivityState((prev) => addComment(prev, project.id, commentBody.trim()));
    setCommentBody("");
    setActiveForm(null);
  };

  const handleAddWorkNote = () => {
    if (!noteBody.trim() || !isMyProject) return;
    setActivityState((prev) => addWorkNote(prev, project.id, noteBody.trim(), isClientVisible));
    setNoteBody("");
    setIsClientVisible(true);
    setActiveForm(null);
  };

  return (
    <Modal id={MODAL_ID} title={`Activity — ${project.name}`} size="lg">
      <div className="flex flex-col gap-6">

        {/* ── Thread ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Activity Thread ({thread.length})
          </p>

          {thread.length === 0 && (
            <p className="text-sm text-slate-400 italic text-center py-6">
              No comments or work notes yet.
            </p>
          )}

          {thread.map((item, i) => {
            const isComment  = item.type === "comment";
            const isVisible  = item.isClientVisible;
            const pill = isComment
              ? { label: "Comment",                      bg: "bg-blue-100",    text: "text-blue-700" }
              : isVisible
              ? { label: "Work Note · Client-visible",   bg: "bg-emerald-100", text: "text-emerald-700" }
              : { label: "Work Note · Internal",         bg: "bg-slate-100",   text: "text-slate-600" };

            return (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${pill.bg} ${pill.text}`}>
                    {pill.label}
                  </span>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
                <p className="text-sm text-[#2a465a] font-medium leading-relaxed">{item.body}</p>
                <p className="text-xs text-slate-400">— {item.author}</p>
              </div>
            );
          })}
        </div>

        {/* ── Action buttons ───────────────────────────────────────────────── */}
        {isMyProject && (
          <div className="flex gap-3 flex-wrap border-t border-slate-100 pt-4">
            <Button
              text="+ Add Comment"
              variant={activeForm === "comment" ? "primary" : "secondary"}
              size={4}
              onClick={() => setActiveForm(activeForm === "comment" ? null : "comment")}
            />
            <Button
              text="+ Add Work Note"
              variant={activeForm === "note" ? "primary" : "secondary"}
              size={4}
              onClick={() => setActiveForm(activeForm === "note" ? null : "note")}
            />
          </div>
        )}

        {/* ── Add Comment form ─────────────────────────────────────────────── */}
        {activeForm === "comment" && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-sm font-bold text-blue-700">Add Comment</p>
            <DataField
              label="Comment"
              id="me-comment-body"
              placeholder="Write a short comment..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button text="Cancel" variant="ghost"   size={3} onClick={() => { setCommentBody(""); setActiveForm(null); }} />
              <Button text="Add"    variant="primary" size={3} onClick={handleAddComment} disabled={!commentBody.trim()} />
            </div>
          </div>
        )}

        {/* ── Add Work Note form ───────────────────────────────────────────── */}
        {activeForm === "note" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-sm font-bold text-emerald-700">Add Work Note</p>
            <DataField
              label="Work Note *"
              id="me-note-body"
              placeholder="Describe what was done..."
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isClientVisible}
                onChange={(e) => setIsClientVisible(e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
              Show this note on the public Client Tracking Page
            </label>
            <p className="text-xs text-slate-400 -mt-1 ml-6">
              Client-visible notes appear on the external project tracking page.
            </p>
            <div className="flex gap-2 justify-end">
              <Button text="Cancel"        variant="ghost"   size={3} onClick={() => { setNoteBody(""); setActiveForm(null); }} />
              <Button text="Add Work Note" variant="primary" size={4} onClick={handleAddWorkNote} disabled={!noteBody.trim()} />
            </div>
          </div>
        )}

        {/* ── Close ────────────────────────────────────────────────────────── */}
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button text="Close" variant="ghost" size={3} onClick={() => closeModal(MODAL_ID)} />
        </div>

      </div>
    </Modal>
  );
}