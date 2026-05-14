import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  Ticket,
} from "lucide-react";

import {
  Button,
  EnhancedDashCard,
  DataTable,
  Grid,
  Heading,
  Modal,
  ModalData,
  closeModal,
  openModal,
} from "../../../components/shared/Common_Components";

const initialTickets = [
  {
    ticketId: "SUP-1001",
    requester: "Aarav Mehta",
    company: "Nexus Corp",
    subject: "Unable to access sales pipeline",
    priority: "High",
    assignedTo: "Admin Team",
    status: "Opened",
    createdAt: "29 Apr 2026",
    category: "Access",
    lastUpdate: "10 min ago",
    description: "Requester can sign in but cannot open the sales pipeline module from the CRM sidebar.",
  },
  {
    ticketId: "SUP-1002",
    requester: "Neha Singh",
    company: "Globex Inc",
    subject: "Invoice export is missing GST column",
    priority: "Medium",
    assignedTo: "Finance Admin",
    status: "Opened",
    createdAt: "28 Apr 2026",
    category: "Billing",
    lastUpdate: "1 hr ago",
    description: "The exported invoice report does not include GST details required by the finance team.",
  },
  {
    ticketId: "SUP-1003",
    requester: "Rohan Iyer",
    company: "BlueWave Tech",
    subject: "Lead assignment rule needs approval",
    priority: "Low",
    assignedTo: "CRM Admin",
    status: "Closed",
    createdAt: "27 Apr 2026",
    category: "Workflow",
    lastUpdate: "Yesterday",
    description: "New territory-based lead assignment rule was reviewed and enabled for the west region.",
  },
  {
    ticketId: "SUP-1004",
    requester: "Priya Nair",
    company: "Stark Industries",
    subject: "Customer profile duplicate merge request",
    priority: "High",
    assignedTo: "Admin Team",
    status: "Opened",
    createdAt: "26 Apr 2026",
    category: "Customer Data",
    lastUpdate: "2 days ago",
    description: "Two customer profiles need to be reviewed and merged after admin verification.",
  },
  {
    ticketId: "SUP-1005",
    requester: "Rahul Sharma",
    company: "TechNova Solutions",
    subject: "API Rate Limit Exceeded",
    priority: "High",
    assignedTo: "Developer Team",
    status: "Opened",
    createdAt: "25 Apr 2026",
    category: "API",
    lastUpdate: "3 hrs ago",
    description: "The customer is hitting the rate limit continuously despite having a premium plan. Needs backend investigation.",
  },
  {
    ticketId: "SUP-1006",
    requester: "Kavya Patel",
    company: "Zenith Retail",
    subject: "Dashboard data not syncing",
    priority: "Medium",
    assignedTo: "Support Team",
    status: "Closed",
    createdAt: "24 Apr 2026",
    category: "Analytics",
    lastUpdate: "1 day ago",
    description: "Analytics dashboard is showing data from 48 hours ago. Real-time sync seems to have stalled.",
  },
  {
    ticketId: "SUP-1007",
    requester: "Amit Verma",
    company: "Verma Logistics",
    subject: "Unable to add new user",
    priority: "Medium",
    assignedTo: "Admin Team",
    status: "Opened",
    createdAt: "24 Apr 2026",
    category: "User Management",
    lastUpdate: "5 hrs ago",
    description: "Getting a 500 Internal Error when trying to invite a new team member to the workspace.",
  },
  {
    ticketId: "SUP-1008",
    requester: "Sneha Reddy",
    company: "Reddy Designs",
    subject: "Subscription renewal failed",
    priority: "High",
    assignedTo: "Finance Admin",
    status: "Closed",
    createdAt: "23 Apr 2026",
    category: "Billing",
    lastUpdate: "2 days ago",
    description: "Credit card was charged but the system still shows the account as suspended. Payment gateway issue resolved.",
  },
  {
    ticketId: "SUP-1009",
    requester: "Vikas Kumar",
    company: "CloudCore",
    subject: "Custom domain SSL certificate error",
    priority: "High",
    assignedTo: "DevOps",
    status: "Opened",
    createdAt: "22 Apr 2026",
    category: "Security",
    lastUpdate: "30 min ago",
    description: "Customer's custom domain is showing an invalid SSL certificate warning for their CRM portal.",
  },
  {
    ticketId: "SUP-1010",
    requester: "Anjali Gupta",
    company: "Gupta Associates",
    subject: "Report download returns blank PDF",
    priority: "Low",
    assignedTo: "Support Team",
    status: "Opened",
    createdAt: "21 Apr 2026",
    category: "Reporting",
    lastUpdate: "12 hrs ago",
    description: "When downloading the monthly performance report as PDF, the file is completely blank.",
  },
  {
    ticketId: "SUP-1011",
    requester: "David Smith",
    company: "Global Ventures",
    subject: "Webhook delivery failing",
    priority: "Medium",
    assignedTo: "Developer Team",
    status: "Closed",
    createdAt: "20 Apr 2026",
    category: "Integrations",
    lastUpdate: "4 days ago",
    description: "Webhooks for 'lead.created' event are failing with timeout errors on the customer's endpoint.",
  },
  {
    ticketId: "SUP-1012",
    requester: "Pooja Desai",
    company: "Desai Info",
    subject: "Mobile app crashing on login",
    priority: "High",
    assignedTo: "Mobile Team",
    status: "Opened",
    createdAt: "19 Apr 2026",
    category: "Mobile",
    lastUpdate: "1 hr ago",
    description: "The iOS application crashes immediately upon entering credentials for users with 2FA enabled.",
  },
  {
    ticketId: "SUP-1013",
    requester: "Suresh Pillai",
    company: "Pillai Traders",
    subject: "Bulk import stuck at 99%",
    priority: "Low",
    assignedTo: "Support Team",
    status: "Closed",
    createdAt: "18 Apr 2026",
    category: "Data Management",
    lastUpdate: "5 days ago",
    description: "A CSV import of 10,000 leads was stuck. Cleared the cache and restarted the background job successfully.",
  },
  {
    ticketId: "SUP-1014",
    requester: "Meera Joshi",
    company: "Joshi Enterprises",
    subject: "Email templates formatting broken",
    priority: "Medium",
    assignedTo: "Support Team",
    status: "Opened",
    createdAt: "17 Apr 2026",
    category: "Email",
    lastUpdate: "2 hrs ago",
    description: "HTML email templates are rendering incorrectly in Outlook clients after the recent editor update.",
  },
  {
    ticketId: "SUP-1015",
    requester: "Karan Malhotra",
    company: "Malhotra Group",
    subject: "Cannot delete custom fields",
    priority: "Low",
    assignedTo: "Admin Team",
    status: "Closed",
    createdAt: "16 Apr 2026",
    category: "Configuration",
    lastUpdate: "1 week ago",
    description: "User was trying to delete a custom field that was still mapped in an active workflow. Resolved.",
  },
];

const ticketColumns = [
  { key: "ticketId",  label: "Ticket ID" },
  { key: "requester", label: "Requester" },
  { key: "company",   label: "Company"   },
  { key: "subject",   label: "Subject"   },
  { key: "priority",  label: "Priority"  },
  { key: "status",    label: "Status"    },
  { key: "createdAt", label: "Created"   },
];


export default function Support() {
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState(initialTickets[0]);

  const stats = useMemo(() => {
    const openedTickets = tickets.filter((ticket) => ticket.status === "Opened");
    const highPriority = tickets.filter((ticket) => ticket.priority === "High");
    const closedTickets = tickets.filter((ticket) => ticket.status === "Closed");

    return {
      total: tickets.length,
      opened: openedTickets.length,
      high: highPriority.length,
      closed: closedTickets.length,
    };
  }, [tickets]);

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    openModal("support-ticket-details");
  };

  const handleCloseTicket = (ticket) => {
    setTickets((current) =>
      current.map((item) =>
        item.ticketId === ticket.ticketId
          ? { ...item, status: "Closed", lastUpdate: "Just now" }
          : item,
      ),
    );
  };

  const actions = [
    {
      icon: <Eye size={15} />,
      tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => handleViewTicket(row),
    },
    {
      icon: <CheckCircle2 size={15} />,
      tooltip: "Close Ticket",
      variant: "primary",
      show: (row) => row.status !== "Closed",
      onClick: (row) => handleCloseTicket(row),
    },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      <Grid cols={12} gap={5}>
        <Heading
          primaryText="Support Ticket"
          secondaryText="Management"
          size={12}
        />

        <EnhancedDashCard
          title="Total Tickets"
          value={stats.total}
          icon={<Ticket size={22} />}
          accentColor="#2563eb"
          size={3}
        />
        <EnhancedDashCard
          title="Open Tickets"
          value={stats.opened}
          icon={<Clock3 size={22} />}
          accentColor="#f59e0b"
          size={3}
        />
        <EnhancedDashCard
          title="High Priority"
          value={stats.high}
          icon={<AlertTriangle size={22} />}
          accentColor="#e11d48"
          size={3}
        />
        <EnhancedDashCard
          title="Closed"
          value={stats.closed}
          icon={<CheckCircle2 size={22} />}
          accentColor="#16a34a"
          size={3}
        />

        <DataTable
          title="Admin Support Tickets"
          columns={ticketColumns}
          rows={tickets}
          actions={actions}
          size={12}
          pageSize={5}
          searchable
          exportable
          exportFileName="support-tickets"
          filters={[
            { title: "Status",   type: "toggle", key: "status",   options: ["Opened", "Closed"] },
            { title: "Priority", type: "toggle", key: "priority", options: ["High", "Medium", "Low"] },
            { title: "Category", type: "toggle", key: "category", options: ["Access", "Billing", "Workflow", "API", "Security", "Mobile", "Email"] },
          ]}
        />
      </Grid>

      <Modal id="support-ticket-details" title="Support Ticket Details">
        {selectedTicket && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ModalData label="Ticket ID" value={selectedTicket.ticketId} />
              <ModalData label="Status" value={selectedTicket.status} />
              <ModalData label="Name" value={selectedTicket.requester} />
              <ModalData label="Company Name" value={selectedTicket.company} />
              <ModalData label="Priority" value={selectedTicket.priority} />
              <ModalData label="Category" value={selectedTicket.category} />
              <ModalData label="Assigned To" value={selectedTicket.assignedTo} />
              <ModalData label="Last Update" value={selectedTicket.lastUpdate} />
            </div>
            <ModalData label="Subject" value={selectedTicket.subject} />
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Description
              </span>
              <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium leading-6 text-[#2a465a]">
                {selectedTicket.description}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              {selectedTicket.status !== "Closed" && (
                <Button
                  text="Close Ticket"
                  variant="primary"
                  onClick={() => {
                    handleCloseTicket(selectedTicket);
                    setSelectedTicket((prev) => ({ ...prev, status: "Closed", lastUpdate: "Just now" }));
                  }}
                />
              )}
              <Button
                text="Close"
                variant="ghost"
                onClick={() => closeModal("support-ticket-details")}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
