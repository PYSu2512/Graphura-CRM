import {
  Button,
  DataField,
  Grid,
  Modal,
  Option,
  SelectField,
  closeModal,
} from "../../../../../components/shared/Common_Components";

export default function RaiseTicketModal() {
  return (
    <Modal id="mtl-support-raise-ticket" title="Raise Support Ticket" size="lg">
      <Grid cols={12} gap={3}>
        <DataField label="Issue Title" size={12} placeholder="Short issue title" />
        <DataField label="Project" size={6} placeholder="Project name or ID" />
        <SelectField label="Issue Type" id="mtl-ticket-type" size={6} placeholder="Select issue type">
          <Option value="Project Delay" label="Project Delay" />
          <Option value="Technical Issue" label="Technical Issue" />
          <Option value="Employee Issue" label="Employee Issue" />
          <Option value="Client Issue" label="Client Issue" />
          <Option value="Resource Blocker" label="Resource Blocker" />
          <Option value="Deadline Risk" label="Deadline Risk" />
        </SelectField>
        <SelectField label="Priority" id="mtl-ticket-priority" size={6} placeholder="Select priority">
          <Option value="Low" label="Low" />
          <Option value="Medium" label="Medium" />
          <Option value="High" label="High" />
          <Option value="Critical" label="Critical" />
        </SelectField>
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
