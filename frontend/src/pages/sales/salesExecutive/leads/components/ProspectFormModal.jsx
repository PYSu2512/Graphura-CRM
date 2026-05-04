import {
  Button,
  DataField,
  Modal,
  ModalProfile,
  Option,
  SelectField,
  closeModal,
} from "../../../../../components/shared/Common_Components";

const PROSPECT_STAGES = ["Interested", "Proposal", "Negotiation", "Won"];
const PROSPECT_PRIORITIES = ["High", "Medium", "Low"];

export function ProspectFormModal({
  prospectLead,
  prospectForm,
  setProspectForm,
  onSave,
}) {
  const updateField = (key, value) => {
    setProspectForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal id="prospect-form-modal" title="Prospect Form" size="lg">
      {prospectLead && (
        <div className="space-y-5">
          <ModalProfile
            name={prospectLead.name}
            subtitle={prospectLead.company}
            meta={prospectLead.phone}
          />

          <div className="grid grid-cols-12 gap-4">
            <DataField
              label="Contact Person"
              id="prospect-contact"
              size={6}
              value={prospectForm.contactPerson}
              onChange={(e) => updateField("contactPerson", e.target.value)}
            />
            <DataField
              label="Company"
              id="prospect-company"
              size={6}
              value={prospectForm.company}
              onChange={(e) => updateField("company", e.target.value)}
            />
            <DataField
              label="Deal Value"
              id="prospect-value"
              size={4}
              placeholder="₹0"
              value={prospectForm.value}
              onChange={(e) => updateField("value", e.target.value)}
            />
            <DataField
              label="Probability"
              id="prospect-probability"
              type="number"
              size={4}
              placeholder="60"
              value={prospectForm.probability}
              onChange={(e) => updateField("probability", e.target.value)}
            />
            <DataField
              label="Expected Close"
              id="prospect-close-date"
              type="date"
              size={4}
              value={prospectForm.expectedClose}
              onChange={(e) => updateField("expectedClose", e.target.value)}
            />
            <SelectField
              label="Stage"
              id="prospect-stage"
              size={6}
              value={prospectForm.stage}
              onChange={(e) => updateField("stage", e.target.value)}
              searchable={false}
            >
              {PROSPECT_STAGES.map((stage) => (
                <Option key={stage} value={stage} label={stage} />
              ))}
            </SelectField>
            <SelectField
              label="Priority"
              id="prospect-priority"
              size={6}
              value={prospectForm.priority}
              onChange={(e) => updateField("priority", e.target.value)}
              searchable={false}
            >
              {PROSPECT_PRIORITIES.map((priority) => (
                <Option key={priority} value={priority} label={priority} />
              ))}
            </SelectField>
            <DataField
              label="Requirement"
              id="prospect-requirement"
              type="textarea"
              rows={3}
              size={12}
              value={prospectForm.requirement}
              onChange={(e) => updateField("requirement", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              text="Cancel"
              variant="secondary"
              size={3}
              onClick={() => closeModal("prospect-form-modal")}
            />
            <Button text="Save Prospect" size={3} onClick={onSave} />
          </div>
        </div>
      )}
    </Modal>
  );
}
