import {
  Modal,
  Button,
  DataField,
  SelectField,
  Option,
  closeModal,
} from "../../../../../components/shared/Common_Components";

const FOLLOW_UP_TYPES = ["Call", "WhatsApp", "Email", "Meeting"];
const PRIORITIES = ["High", "Medium", "Low"];

export function ReminderModal({
  followUpForm,
  setFollowUpForm,
  reminderDate,
  setReminderDate,
  onSave,
}) {
  const form = followUpForm ?? {
    date: reminderDate,
    type: FOLLOW_UP_TYPES[0],
    priority: PRIORITIES[1],
    notes: "",
  };

  const updateField = (key, value) => {
    if (setFollowUpForm) {
      setFollowUpForm((prev) => ({ ...prev, [key]: value }));
    }

    if (key === "date" && setReminderDate) {
      setReminderDate(value);
    }
  };

  return (
    <Modal id="reminder-modal" title="Add Follow-up" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <DataField
            label="Follow-up Date"
            id="follow-up-date"
            type="datetime-local"
            size={12}
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
          <SelectField
            label="Type"
            id="follow-up-type"
            size={6}
            value={form.type}
            onChange={(e) => updateField("type", e.target.value)}
            searchable={false}
          >
            {FOLLOW_UP_TYPES.map((type) => (
              <Option key={type} value={type} label={type} />
            ))}
          </SelectField>
          <SelectField
            label="Priority"
            id="follow-up-priority"
            size={6}
            value={form.priority}
            onChange={(e) => updateField("priority", e.target.value)}
            searchable={false}
          >
            {PRIORITIES.map((priority) => (
              <Option key={priority} value={priority} label={priority} />
            ))}
          </SelectField>
          <DataField
            label="Notes"
            id="follow-up-notes"
            type="textarea"
            rows={3}
            size={12}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            text="Cancel"
            variant="secondary"
            onClick={() => closeModal("reminder-modal")}
          />
          <Button text="Save" onClick={onSave} />
        </div>
      </div>
    </Modal>
  );
}
