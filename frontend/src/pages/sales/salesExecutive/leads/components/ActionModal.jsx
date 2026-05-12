import {
  Modal,
  Button,
  SelectField,
  Option,
  DataField,
  closeModal,
} from "../../../../../components/shared/Common_Components";

const ACTION_OPTIONS = [
  "Interested",
  "Not Interested",
  "Follow Up",
  "Not Talk",
];

const FOLLOW_UP_TYPES = ["Call", "WhatsApp", "Email", "Meeting"];
const PRIORITIES = ["High", "Medium", "Low"];

export function ActionModal({
  selectedLead,
  actionValue,
  setActionValue,
  commentText,
  setCommentText,
  followUpForm,
  setFollowUpForm,
  prospectForm,
  setProspectForm,
  onSave,
}) {
  const updateFollowUp = (key, value) => {
    setFollowUpForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateProspect = (key, value) => {
    setProspectForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal id="lead-action-modal" title="Lead Action" size="lg">
      {!selectedLead ? (
        <p className="text-sm text-slate-500">Select a lead first.</p>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Selected Lead
            </p>
            <p className="mt-2 text-sm font-bold text-[#2a465a]">
              {selectedLead.name}{" "}
              <span className="text-slate-500 font-semibold">
                • {selectedLead.company}
              </span>
            </p>
          </div>

          <SelectField
            label="Action"
            id="lead-action-type"
            value={actionValue}
            onChange={(e) => setActionValue(e.target.value)}
            searchable={false}
            size={12}
          >
            {ACTION_OPTIONS.map((opt) => (
              <Option key={opt} value={opt} label={opt} />
            ))}
          </SelectField>

          {/* Interested */}
          {actionValue === "Interested" && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Prospect Form
              </p>

              <div className="grid grid-cols-12 gap-4">
                <DataField
                  label="Contact Person *"
                  id="p-contact-person"
                  size={6}
                  value={prospectForm.contactPerson}
                  onChange={(e) =>
                    updateProspect("contactPerson", e.target.value)
                  }
                />
                <DataField
                  label="Company *"
                  id="p-company"
                  size={6}
                  value={prospectForm.company}
                  onChange={(e) => updateProspect("company", e.target.value)}
                />
                <DataField
                  label="Deal Value"
                  id="p-value"
                  size={4}
                  placeholder="₹0"
                  value={prospectForm.value}
                  onChange={(e) => updateProspect("value", e.target.value)}
                />
                <DataField
                  label="Probability"
                  id="p-probability"
                  type="number"
                  size={4}
                  placeholder="60"
                  value={prospectForm.probability}
                  onChange={(e) =>
                    updateProspect("probability", e.target.value)
                  }
                />
                <DataField
                  label="Expected Close Date"
                  id="p-expected-close"
                  type="date"
                  size={4}
                  value={prospectForm.expectedClose}
                  onChange={(e) =>
                    updateProspect("expectedClose", e.target.value)
                  }
                />

                <SelectField
                  label="Stage"
                  id="p-stage"
                  size={6}
                  value={prospectForm.stage}
                  onChange={(e) => updateProspect("stage", e.target.value)}
                  searchable={false}
                >
                  {["Interested", "Proposal", "Negotiation", "Won"].map((s) => (
                    <Option key={s} value={s} label={s} />
                  ))}
                </SelectField>

                <SelectField
                  label="Priority"
                  id="p-priority"
                  size={6}
                  value={prospectForm.priority}
                  onChange={(e) => updateProspect("priority", e.target.value)}
                  searchable={false}
                >
                  {PRIORITIES.map((p) => (
                    <Option key={p} value={p} label={p} />
                  ))}
                </SelectField>

                <DataField
                  label="Requirement"
                  id="p-requirement"
                  type="textarea"
                  rows={3}
                  size={12}
                  value={prospectForm.requirement}
                  onChange={(e) =>
                    updateProspect("requirement", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Not Interested */}
          {actionValue === "Not Interested" && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Comment (required)
              </p>
              <textarea
                className="w-full min-h-[140px] resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/30"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Reason / note why not interested..."
              />
            </div>
          )}

          {/* Follow Up */}
          {actionValue === "Follow Up" && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Follow-up Details
              </p>

              <div className="grid grid-cols-12 gap-4">
                <DataField
                  label="Follow-up Date *"
                  id="fu-date"
                  type="datetime-local"
                  size={12}
                  value={followUpForm.date}
                  onChange={(e) => updateFollowUp("date", e.target.value)}
                />
                <SelectField
                  label="Follow-up Type"
                  id="fu-type"
                  size={6}
                  value={followUpForm.type}
                  onChange={(e) => updateFollowUp("type", e.target.value)}
                  searchable={false}
                >
                  {FOLLOW_UP_TYPES.map((t) => (
                    <Option key={t} value={t} label={t} />
                  ))}
                </SelectField>
                <SelectField
                  label="Priority"
                  id="fu-priority"
                  size={6}
                  value={followUpForm.priority}
                  onChange={(e) => updateFollowUp("priority", e.target.value)}
                  searchable={false}
                >
                  {PRIORITIES.map((p) => (
                    <Option key={p} value={p} label={p} />
                  ))}
                </SelectField>
                <DataField
                  label="Notes"
                  id="fu-notes"
                  type="textarea"
                  rows={3}
                  size={12}
                  value={followUpForm.notes}
                  onChange={(e) => updateFollowUp("notes", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Not Talk */}
          {actionValue === "Not Talk" && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Comment (required)
              </p>
              <textarea
                className="w-full min-h-[140px] resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/30"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Comment for Not Talk..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              text="Cancel"
              variant="secondary"
              onClick={() => closeModal("lead-action-modal")}
            />
            <Button text="Save" onClick={onSave} />
          </div>
        </div>
      )}
    </Modal>
  );
}
