import {
  Button,
  DataField,
  Grid,
  Modal,
  Option,
  SelectField,
  closeModal,
} from "../../../../../components/shared/Common_Components";

export default function ReassignModal({ report, employeeOptions }) {
  return (
    <Modal id="mtl-report-reassign-work" title="Reassign Project" size="md">
      <Grid cols={12} gap={3}>
        <DataField label="Current Owner" size={6} value={report?.employee || ""} readOnly />
        <SelectField label="New Owner" id="mtl-report-new-owner" size={6} placeholder="Select employee" searchable={false}>
          {employeeOptions.map((employee) => <Option key={employee} value={employee} label={employee} />)}
        </SelectField>
        <DataField label="Reason" type="textarea" size={12} rows={4} placeholder="Reason for project reassignment..." />
      </Grid>
      <div className="mt-5 flex justify-end gap-2">
        <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-report-reassign-work")} />
        <Button text="Reassign" variant="primary" onClick={() => closeModal("mtl-report-reassign-work")} />
      </div>
    </Modal>
  );
}
