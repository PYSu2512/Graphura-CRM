import {
  Modal,
  ModalProfile,
  ModalGrid,
  ModalData,
  SelectField,
  Option,
  Button,
  closeModal,
} from "../../../../../components/shared/Common_Components";
import { STATUS_OPTIONS } from "../utils/leadConstants";

export function ClientLeadDetailsModal({
  selectedLead,
  draftStatus,
  setDraftStatus,
  saveStatus,
}) {
  return (
    <Modal id="client-lead-details-modal" title="Client Details" size="lg">
      {selectedLead && (
        <div className="space-y-6">
          <ModalProfile
            name={selectedLead.name}
            subtitle={selectedLead.company}
            meta={`Assigned to ${selectedLead.assignedTo}`}
          />

          <ModalGrid title="Contact" cols={2}>
            <ModalData label="Phone" value={selectedLead.phone} />
            <ModalData label="Email" value={selectedLead.email} />
            <ModalData label="Company" value={selectedLead.company} />
            <ModalData label="Assigned Date" value={selectedLead.assignedAt} />
          </ModalGrid>

          <ModalGrid title="Lead Status" cols={2}>
            <ModalData label="Current Status" value={selectedLead.status} />
            <ModalData label="Reminder" value={selectedLead.reminder || "—"} />
            <ModalData
              label="Follow-up Type"
              value={selectedLead.nextFollowUp?.type || "—"}
            />
            <ModalData
              label="Priority"
              value={selectedLead.nextFollowUp?.priority || "—"}
            />
            <ModalData
              label="Last Contact"
              value={selectedLead.lastContact || "—"}
            />
            <ModalData label="Next Step" value={selectedLead.nextStep || "—"} />
          </ModalGrid>

          <div className="flex gap-3 flex-col sm:flex-row sm:items-end">
            <SelectField
              label="Update status"
              id="client-lead-status"
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
              searchable={false}
            >
              {STATUS_OPTIONS.map((status) => (
                <Option key={status} value={status} label={status} />
              ))}
            </SelectField>

            <div className="flex flex-wrap gap-3">
              <Button text="Save" onClick={saveStatus} />
              <Button
                text="Close"
                variant="secondary"
                onClick={() => closeModal("client-lead-details-modal")}
              />
            </div>
          </div>

          {selectedLead.comments?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Comments
              </p>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                {selectedLead.comments.map((comment, index) => (
                  <div key={index}>
                    <p>{comment.text}</p>
                    <p className="text-xs text-slate-400">{comment.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedLead.prospect && (
            <ModalGrid title="Prospect" cols={2}>
              <ModalData label="Stage" value={selectedLead.prospect.stage} />
              <ModalData label="Deal Value" value={selectedLead.prospect.value || "—"} />
              <ModalData
                label="Probability"
                value={
                  selectedLead.prospect.probability
                    ? `${selectedLead.prospect.probability}%`
                    : "—"
                }
              />
              <ModalData
                label="Expected Close"
                value={selectedLead.prospect.expectedClose || "—"}
              />
            </ModalGrid>
          )}
        </div>
      )}
    </Modal>
  );
}
