import {
  Modal,
  Button,
  closeModal,
} from "../../../../../components/shared/Common_Components";

export function CommentModal({
  commentLead,
  commentText,
  setCommentText,
  onSave,
}) {
  return (
    <Modal id="comment-modal" title="Add Comment" size="md">
      {commentLead ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Add a comment for <strong>{commentLead.name}</strong>.
          </p>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full min-h-[140px] resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/30"
          />
          <div className="flex justify-end gap-2">
            <Button
              text="Cancel"
              variant="secondary"
              onClick={() => closeModal("comment-modal")}
            />
            <Button text="Save" onClick={onSave} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Select a lead to comment on.</p>
      )}
    </Modal>
  );
}
