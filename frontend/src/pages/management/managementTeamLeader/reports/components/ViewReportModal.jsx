import {
  Modal,
  ModalData,
  ModalGrid,
} from "../../../../../components/shared/Common_Components";

export default function ViewReportModal({ report }) {
  return (
    <Modal id="mtl-report-employee-activity" title="Project Report" size="lg">
      {report && (
        <ModalGrid>
          <ModalData label="Project" value={report.projectName} />
          <ModalData label="Assigned Employee" value={report.employee} />
          <ModalData label="Status" value={report.status} />
          <ModalData label="Progress %" value={`${report.progress}%`} />
          <ModalData label="Deadline" value={report.deadline} />
          <ModalData label="Priority" value={report.priority} />
          <ModalData label="Submitted Date" value={report.submittedDate} />
          <ModalData label="Notes" value={report.notes} />
        </ModalGrid>
      )}
    </Modal>
  );
}
