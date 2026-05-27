import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalGrid, ModalProfile, Button,
} from "../../../../components/shared/Common_Components";
import { kpiPayments, paymentAlerts } from "./paymentsStore";
import { CheckCircle2, XCircle, IndianRupee, Clock, Eye } from "lucide-react";

const KPI_ICONS = [<CheckCircle2 size={22}/>, <XCircle size={22}/>, <IndianRupee size={22}/>, <Clock size={22}/>];

const COLS = [
  { key: "id",          label: "ID" },
  { key: "client",      label: "Client" },
  { key: "amount",      label: "Amount" },
  { key: "mode",        label: "Mode" },
  { key: "handler",     label: "Handler" },
  { key: "handlerRole", label: "Role" },
  { key: "date",        label: "Date" },
  { key: "time",        label: "Time" },
  { key: "status",      label: "Status" },
];

export default function PaymentAlerts() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Payment" secondaryText="Alerts" size={12} />
        {kpiPayments.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={k.accent}
            size={3}
          />
        ))}
      </DashGrid>

      <p className="text-xs text-slate-500 -mt-2">
        Real-time feed of payment events for me and my team's executives. Failed payments are surfaced first so they can be retried.
      </p>

      <DataTable
        title="Recent Payment Alerts"
        columns={COLS}
        rows={paymentAlerts}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => { setSelected(row); openModal("tl-pay-view"); },
          },
        ]}
        size={12}
        pageSize={10}
        searchable
        date
        exportable
        exportFileName="payment_alerts"
        filters={[
          { title: "Status", type: "toggle", key: "status",      options: ["Success", "Failed", "Pending"] },
          { title: "Mode",   type: "toggle", key: "mode",        options: ["UPI", "Card", "Bank Transfer", "Cash"] },
          { title: "Role",   type: "toggle", key: "handlerRole", options: ["Team Leader", "Executive"] },
        ]}
      />

      <Modal id="tl-pay-view" title="Payment Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.client}
              subtitle={`${selected.id} · ${selected.mode}`}
              meta={`Handled by ${selected.handler} (${selected.handlerRole})`}
            />
            <ModalGrid title="Transaction" cols={2}>
              <ModalData label="Amount"      value={selected.amount} />
              <ModalData label="Mode"        value={selected.mode} />
              <ModalData label="Status"      value={selected.status} />
              <ModalData label="Date"        value={selected.date} />
              <ModalData label="Time"        value={selected.time} />
              <ModalData label="Txn ID"      value={selected.txn} />
            </ModalGrid>
            <ModalGrid title="Note" cols={1}>
              <ModalData label="Description" value={selected.note} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-pay-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
