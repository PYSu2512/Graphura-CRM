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
} from "../../../../../components/shared/Common_Components";
import { ticketTimeline } from "../supportData";

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
              <ModalData label="Priority" value={ticket.priority || ticket.urgency} />
              <ModalData label="Status" value={ticket.status || "Escalation Queue"} />
              <ModalData label="SLA" value={ticket.sla || ticket.countdown} />
              <ModalData label="Related Project" value={ticket.project || "-"} />
              <ModalData label="Assigned To" value={ticket.assignedTo || ticket.route || "-"} />
            </ModalGrid>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Full Issue Description</p>
              <p className="mt-2 text-sm font-medium text-slate-600">{ticket.description || "Escalation requires manager decision and blocker notes."}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Timeline</p>
                <div className="mt-3 space-y-2">
                  {ticketTimeline.map((item) => (
                    <p key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">{item}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Escalation History</p>
                <p className="mt-3 text-sm font-semibold text-slate-600">Routed to Management Manager for deadline and approval risk.</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">Attachment: blocker-log.pdf</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <Button text="Reply" variant="ghost" size={3} />
              <Button text="Change Status" variant="secondary" size={3} />
              <Button text="Escalate" variant="danger" size={3} />
              <Button text="Mark Resolved" variant="primary" size={3} onClick={() => closeModal("mtl-support-ticket-details")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="mtl-support-escalate-ticket" title="Escalate to Management Manager" size="md">
        <Grid cols={12} gap={3}>
          <DataField label="Ticket / Blocker" size={12} value={ticket?.title || ticket?.item || ""} readOnly />
          <SelectField label="Urgency" id="mtl-support-urgency" size={6} placeholder="Select urgency">
            <Option value="High" label="High" />
            <Option value="Critical" label="Critical" />
          </SelectField>
          <DataField label="SLA Remaining" size={6} value={ticket?.sla || ticket?.countdown || ""} readOnly />
          <DataField label="Manager Notes" type="textarea" size={12} rows={4} placeholder="Decision needed, impact, blockers, and expected timeline..." />
        </Grid>
        <div className="mt-5 flex justify-end gap-2">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-support-escalate-ticket")} />
          <Button text="Escalate" variant="danger" onClick={() => closeModal("mtl-support-escalate-ticket")} />
        </div>
      </Modal>

      <Modal id="mtl-support-assign-ticket" title="Assign Employee" size="md">
        <Grid cols={12} gap={3}>
          <DataField label="Ticket" size={12} value={ticket?.id || ""} readOnly />
          <DataField label="Assign To" size={6} placeholder="Employee name" />
          <SelectField label="Status" id="mtl-support-status" size={6} placeholder="Select status">
            <Option value="Open" label="Open" />
            <Option value="In Progress" label="In Progress" />
            <Option value="Waiting" label="Waiting" />
            <Option value="Escalated" label="Escalated" />
            <Option value="Resolved" label="Resolved" />
          </SelectField>
          <DataField label="Assignment Notes" type="textarea" size={12} rows={4} placeholder="Expected action and deadline..." />
        </Grid>
        <div className="mt-5 flex justify-end gap-2">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-support-assign-ticket")} />
          <Button text="Assign" variant="primary" onClick={() => closeModal("mtl-support-assign-ticket")} />
        </div>
      </Modal>
    </>
  );
}
