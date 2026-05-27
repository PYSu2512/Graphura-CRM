import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Button,
  Modal, ModalProfile, ModalGrid, ModalData,
  openModal, closeModal,
} from "../../components/shared/Common_Components";
import { Bell, CreditCard, FileText, Briefcase, CheckCircle, Eye, BookCheck, Trash2 } from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const initialNotifs = [
  { id: "NOTIF-001", title: "Payment Received", type: "Payment", client: "Arjun Mehta", date: "2025-07-13 10:30", status: "Unread", message: "Payment of ₹45,000 received from Arjun Mehta via UPI for Brand Website project." },
  { id: "NOTIF-002", title: "Invoice Overdue", type: "Invoice", client: "Priya Sharma", date: "2025-07-12 14:00", status: "Unread", message: "Invoice INV-2025-002 of ₹97,350 is overdue by 3 days. Please follow up with Priya Sharma." },
  { id: "NOTIF-003", title: "Work Order Signed", type: "Work Order", client: "TechNova Pvt", date: "2025-07-11 09:15", status: "Read", message: "Work order WO-2025-003 has been signed by TechNova Pvt. Project value: ₹3,20,000." },
  { id: "NOTIF-004", title: "Payment Failed", type: "Payment", client: "Sneha Patil", date: "2025-07-12 16:45", status: "Unread", message: "Payment of ₹60,000 from Sneha Patil has failed. Razorpay transaction declined." },
  { id: "NOTIF-005", title: "Work Order Pending Approval", type: "Work Order", client: "Rohan Gupta", date: "2025-07-09 11:00", status: "Read", message: "Work order WO-2025-004 for Mobile App (₹1,50,000) is pending your approval." },
  { id: "NOTIF-006", title: "Invoice Sent", type: "Invoice", client: "Kavya Nair", date: "2025-07-12 13:30", status: "Unread", message: "Invoice INV-2025-005 of ₹1,41,600 has been sent to Kavya Nair successfully." },
  { id: "NOTIF-007", title: "Partial Payment Received", type: "Payment", client: "Kavya Nair", date: "2025-07-13 11:20", status: "Unread", message: "Partial payment of ₹25,000 received from Kavya Nair via Wallet." },
];

const typeColor = (t) => {
  if (t === "Payment") return "bg-blue-100 text-blue-700";
  if (t === "Invoice") return "bg-purple-100 text-purple-700";
  return "bg-amber-100 text-amber-700";
};

const typeIcon = (t) => {
  if (t === "Payment") return <CreditCard size={18} />;
  if (t === "Invoice") return <FileText size={18} />;
  return <Briefcase size={18} />;
};

export default function FinanceNotifications() {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [selected, setSelected] = useState(null);

  const total = notifs.length;
  const paymentAlerts = notifs.filter(n => n.type === "Payment").length;
  const woAlerts = notifs.filter(n => n.type === "Work Order").length;
  const invoiceAlerts = notifs.filter(n => n.type === "Invoice").length;
  const unread = notifs.filter(n => n.status === "Unread").length;

  const openView = (row) => {
    setSelected(row);
    setNotifs(prev => prev.map(n => n.id === row.id ? { ...n, status: "Read" } : n));
    openModal("notif-view");
  };
  const markRead = (row) => setNotifs(prev => prev.map(n => n.id === row.id ? { ...n, status: "Read" } : n));
  const deleteNotif = (row) => setNotifs(prev => prev.filter(n => n.id !== row.id));

  const columns = [
    { key: "id", label: "Notification ID" },
    { key: "title", label: "Title" },
    { key: "type", label: "Type", render: v => <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${typeColor(v)}`}>{v}</span> },
    { key: "client", label: "Client Name" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: v => <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${v === "Unread" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"}`}>{v}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Finance" secondaryText="Notifications" size={12} />
        <EnhancedDashCard title="Total Notifications" value={total} icon={<Bell size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Payment Alerts" value={paymentAlerts} icon={<CreditCard size={22} />} accentColor="#22c55e" size={2} />
        <EnhancedDashCard title="Work Order Alerts" value={woAlerts} icon={<Briefcase size={22} />} accentColor="#f59e0b" size={2} />
        <EnhancedDashCard title="Invoice Alerts" value={invoiceAlerts} icon={<FileText size={22} />} accentColor="#8b5cf6" size={2} />
        <EnhancedDashCard title="Unread" value={unread} icon={<CheckCircle size={22} />} accentColor="#f43f5e" size={3} />
      </DashGrid>

      <DataTable
        title="All Notifications"
        columns={columns}
        rows={notifs}
        pageSize={10}
        actions={[
          { icon: <Eye size={15}/>,       tooltip: "View Details", variant: "ghost",   onClick: openView    },
          { icon: <BookCheck size={15}/>, tooltip: "Mark as Read", variant: "success", onClick: markRead    },
          { icon: <Trash2 size={15}/>,    tooltip: "Delete",       variant: "danger",  onClick: deleteNotif },
        ]}
      />

      <Modal id="notif-view" title="Notification Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${typeColor(selected.type).replace("text-", "border-").replace("bg-", "bg-")}`}>
              <span className={typeColor(selected.type)}>{typeIcon(selected.type)}</span>
              <span className={`text-sm font-bold ${typeColor(selected.type).split(" ")[1]}`}>{selected.type} Alert</span>
            </div>
            <ModalProfile name={selected.client} subtitle={selected.title} meta={`${selected.date}`} />
            <ModalGrid title="Notification Info" cols={2}>
              <ModalData label="Notification ID" value={selected.id} />
              <ModalData label="Type" value={selected.type} />
              <ModalData label="Status" value={selected.status} />
              <ModalData label="Date & Time" value={selected.date} />
            </ModalGrid>
            <ModalGrid title="Message" cols={1}>
              <ModalData label="Message" value={selected.message} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("notif-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}