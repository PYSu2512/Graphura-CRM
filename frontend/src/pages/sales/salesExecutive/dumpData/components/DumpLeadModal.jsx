import {
  Button,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  closeModal,
} from "../../../../../components/shared/Common_Components";

export function DumpLeadModal({
  id,
  title,
  lead,
  infoTitle,
  confirmText,
  confirmVariant,
  onConfirm,
}) {
  return (
    <Modal id={id} title={title} size="md">
      {lead && (
        <div className="space-y-5">
          <ModalProfile
            name={lead.name}
            subtitle={lead.phone}
            meta={lead.company}
          />

          <ModalGrid title={infoTitle} cols={2}>
            <ModalData label="Reason" value={lead.dump?.reason} />
            <ModalData label="Dump Date" value={lead.dump?.dumpedAt} />
            <ModalData label="Email" value={lead.email} />
            <ModalData label="Dumped By" value={lead.dump?.dumpedBy} />
          </ModalGrid>

          <div className="flex justify-end gap-3 pt-1">
            <Button
              text="Cancel"
              variant="secondary"
              size={3}
              onClick={() => closeModal(id)}
            />
            <Button
              text={confirmText}
              variant={confirmVariant}
              size={3}
              onClick={onConfirm}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
