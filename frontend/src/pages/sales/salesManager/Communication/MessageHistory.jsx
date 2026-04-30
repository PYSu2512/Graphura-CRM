import React, { useState } from "react";
import {
  Heading, DashGrid, DataTable,
  openModal, Modal, ModalData,
} from "../../../../components/shared/Common_Components";

const msgCols = [
  { key: "title",    label: "Message Title" },
  { key: "type",     label: "Type" },
  { key: "sentTo",   label: "Sent To" },
  { key: "sentDate", label: "Sent Date" },
  { key: "status",   label: "Status" },
];

export default function MessageHistory({ messages, setMessages }) {
  const [selected, setSelected] = useState(null);

  const handleDelete = (row) => setMessages((prev) => prev.filter((m) => m.id !== row.id));

  const handleResend = (row) => {
    const resent = { ...row, id: `MSG-${Date.now().toString().slice(-4)}`, sentDate: new Date().toISOString().slice(0, 10) };
    setMessages((prev) => [resent, ...prev]);
    alert(`Message "${row.title}" resent!`);
  };

  const actions = [
    { label: "View",   variant: "ghost",   onClick: (row) => { setSelected(row); openModal("msg-view-modal"); } },
    { label: "Resend", variant: "primary", onClick: handleResend },
    { label: "Delete", variant: "danger",  onClick: handleDelete },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Message" secondaryText="History" size={12} />
      </DashGrid>

      <DataTable
        title="Sent Messages"
        columns={msgCols}
        rows={messages}
        actions={actions}
        size={12}
        pageSize={8}
        searchable
        filters={[
          { title: "Type",   type: "toggle", key: "type",   options: ["Announcement","Warning","Appreciation"] },
          { title: "Status", type: "toggle", key: "status", options: ["Delivered","Failed"] },
        ]}
      />

      <Modal id="msg-view-modal" title="Message Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Message ID" value={selected.id} />
              <ModalData label="Type"       value={selected.type} />
              <ModalData label="Sent To"    value={selected.sentTo} />
              <ModalData label="Sent Date"  value={selected.sentDate} />
              <ModalData label="Status"     value={selected.status} />
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Message Body</span>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-sm text-[#2a465a] font-medium leading-relaxed">
                {selected.body}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}