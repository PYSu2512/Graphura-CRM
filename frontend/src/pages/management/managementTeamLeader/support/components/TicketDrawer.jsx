import {
  Button,
  DataField,
  Grid,
  Modal,
  ModalData,
  ModalGrid,
  Option,
  SelectField,
  closeModal,
  openModal,
} from "../../../../../components/shared/Common_Components";

export default function TicketDrawer({ ticket }) {
  return (
    <>
      <Modal id="mtl-support-ticket-details" title="Ticket Details" size="xl">
        {ticket && (
          <div className="space-y-5">
            <ModalGrid>
              <ModalData label="Ticket ID" value={ticket.id || ticket.source} />
              <ModalData label="Issue" value={ticket.title || ticket.item} />
              <ModalData label="Raised By" value={ticket.raisedBy || ticket.owner} />
              <ModalData label="Ticket Type" value={ticket.ticketType || "-"} />
              <ModalData label="Issue Type" value={ticket.issueType || "-"} />
              <ModalData label="Priority" value={ticket.priority || ticket.urgency} />
              <ModalData label="Status" value={ticket.status || "Escalation Queue"} />
              <ModalData label="Related Project" value={ticket.project || "-"} />
              <ModalData label="Assigned To" value={ticket.assignedTo || ticket.route || "-"} />
            </ModalGrid>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Full Issue Description</p>
              <p className="mt-2 text-sm font-medium text-slate-600">{ticket.description || "Escalation requires manager decision and blocker notes."}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                text="Resolve Issue"
                variant="primary"
                size={3}
                onClick={() => {
                  closeModal("mtl-support-ticket-details");
                  openModal("mtl-support-resolve-ticket");
                }}
              />
              <Button
                text="Escalate to Manager"
                variant="danger"
                size={3}
                onClick={() => {
                  closeModal("mtl-support-ticket-details");
                  openModal("mtl-support-escalate-ticket");
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="mtl-support-resolve-ticket" title="Resolve Team Issue" size="md">
        <Grid cols={12} gap={3}>
          <DataField label="Ticket" size={12} value={ticket?.id || ""} readOnly />
          <DataField label="Issue" size={12} value={ticket?.title || ""} readOnly />
          <DataField label="Resolution Notes" type="textarea" size={12} rows={4} placeholder="What was resolved and what action was taken?" />
        </Grid>
        <div className="mt-5 flex justify-end gap-2">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-support-resolve-ticket")} />
          <Button text="Mark Resolved" variant="primary" onClick={() => closeModal("mtl-support-resolve-ticket")} />
        </div>
      </Modal>

      <Modal id="mtl-support-escalate-ticket" title="Escalate to Management Manager" size="md">
        <Grid cols={12} gap={3}>
          <DataField label="Ticket / Blocker" size={12} value={ticket?.title || ticket?.item || ""} readOnly />
          <SelectField label="Urgency" id="mtl-support-urgency" size={6} placeholder="Select urgency">
            <Option value="High" label="High" />
            <Option value="Critical" label="Critical" />
          </SelectField>
          <DataField label="Project" size={6} value={ticket?.project || ""} readOnly />
          <DataField label="Escalation Reason" type="textarea" size={12} rows={4} placeholder="Reason, impact, blocker, and decision needed from manager..." />
        </Grid>
        <div className="mt-5 flex justify-end gap-2">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-support-escalate-ticket")} />
          <Button text="Escalate" variant="danger" onClick={() => closeModal("mtl-support-escalate-ticket")} />
        </div>
      </Modal>
    </>
  );
}
