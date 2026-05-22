import { useMemo, useState } from "react";
import {
  Button,
  DataField,
  Grid,
  Modal,
  Option,
  SelectField,
  closeModal,
} from "../../../../../components/shared/Common_Components";
import {
  assignedToByIssueType,
  issueTypesByTicketType,
  ticketTypeOptions,
} from "../supportData";

export default function RaiseTicketModal() {
  const [ticketType, setTicketType] = useState("");
  const [issueType, setIssueType] = useState("");

  const issueTypeOptions = useMemo(
    () => issueTypesByTicketType[ticketType] || [],
    [ticketType],
  );

  const assignedTo = assignedToByIssueType[issueType] || "";

  const handleTicketTypeChange = (event) => {
    setTicketType(event.target.value);
    setIssueType("");
  };

  return (
    <Modal id="mtl-support-raise-ticket" title="Raise Support Ticket" size="lg">
      <Grid cols={12} gap={3}>
        <DataField label="Issue Title" size={12} placeholder="Short issue title" />
        <DataField label="Project" size={6} placeholder="Project name or ID" />
        <SelectField
          label="Ticket Type"
          id="mtl-ticket-type"
          size={6}
          placeholder="Select ticket type"
          value={ticketType}
          onChange={handleTicketTypeChange}
        >
          {ticketTypeOptions.map((type) => (
            <Option key={type} value={type} label={type} />
          ))}
        </SelectField>
        <SelectField
          label="Issue Type"
          id="mtl-issue-type"
          size={6}
          placeholder={ticketType ? "Select issue type" : "Select ticket type first"}
          value={issueType}
          onChange={(event) => setIssueType(event.target.value)}
          disabled={!ticketType}
        >
          {issueTypeOptions.map((type) => (
            <Option key={type} value={type} label={type} />
          ))}
        </SelectField>
        <SelectField label="Priority" id="mtl-ticket-priority" size={6} placeholder="Select priority">
          <Option value="Low" label="Low" />
          <Option value="Medium" label="Medium" />
          <Option value="High" label="High" />
          <Option value="Critical" label="Critical" />
        </SelectField>
        <DataField label="Assigned To" size={6} value={assignedTo} placeholder="Auto assigned" readOnly />
        <DataField label="Raised By" size={6} placeholder="Employee name" />
        <DataField label="Description" type="textarea" size={12} rows={5} placeholder="Issue summary, blocker, expected support, and impact..." />
      </Grid>
      <div className="mt-5 flex justify-end gap-2">
        <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-support-raise-ticket")} />
        <Button text="Raise Ticket" variant="primary" onClick={() => closeModal("mtl-support-raise-ticket")} />
      </div>
    </Modal>
  );
}
