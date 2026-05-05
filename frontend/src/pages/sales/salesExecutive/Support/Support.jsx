import React from "react";
import { Ticket, Clock, AlertTriangle, CheckCircle2, Eye, Reply, CheckCircle } from "lucide-react";
import {
  Heading,
  EnhancedDashCard,
  DashGrid,
  DataTable,
  GBarChart,
  GDoughnutChart,
  HeadingForDataTable,
} from "../../../../components/shared/Common_Components";

export default function Support() {
  const supportStats = [
    { title: "TOTAL TICKETS", value: "15", icon: <Ticket size={20} />, color: "#3b82f6" },
    { title: "OPEN TICKETS", value: "9", icon: <Clock size={20} />, color: "#f59e0b" },
    { title: "HIGH PRIORITY", value: "6", icon: <AlertTriangle size={20} />, color: "#ef4444" },
    { title: "CLOSED", value: "6", icon: <CheckCircle2 size={20} />, color: "#10b981" },
  ];

  const ticketVolumeData = [
    { name: "Mon", opened: 25, resolved: 20 },
    { name: "Tue", opened: 30, resolved: 28 },
    { name: "Wed", opened: 28, resolved: 25 },
    { name: "Thu", opened: 22, resolved: 18 },
    { name: "Fri", opened: 35, resolved: 30 },
    { name: "Sat", opened: 15, resolved: 10 },
    { name: "Sun", opened: 10, resolved: 8 },
  ];

  const categoryDistributionData = [
    { name: "Access", value: 35 },
    { name: "Billing", value: 25 },
    { name: "Bug", value: 15 },
    { name: "Feature", value: 10 },
    { name: "Integration", value: 15 },
  ];

  const columns = [
    { key: "ticketId", label: "TICKET ID" },
    { key: "name", label: "NAME" },
    { key: "company", label: "COMPANY NAME" },
    {
      key: "priority",
      label: "PRIORITY",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-md text-[10px] font-bold ${
            row.priority === "High"
              ? "bg-rose-100 text-rose-600"
              : row.priority === "Medium"
              ? "bg-amber-100 text-amber-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {row.priority}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
            row.status === "Closed"
              ? "bg-slate-100 text-slate-600"
              : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { key: "created", label: "CREATED" },
  ];

  const supportData = [
    {
      id: 1,
      ticketId: "SUP-1001",
      name: "Aarav Mehta",
      company: "Nexus Corp",
      priority: "High",
      status: "Opened",
      created: "29 Apr 2026",
    },
    {
      id: 2,
      ticketId: "SUP-1002",
      name: "Neha Singh",
      company: "Globex Inc",
      priority: "Medium",
      status: "Opened",
      created: "28 Apr 2026",
    },
    {
      id: 3,
      ticketId: "SUP-1003",
      name: "Rohan Iyer",
      company: "BlueWave Tech",
      priority: "Low",
      status: "Closed",
      created: "27 Apr 2026",
    },
    {
      id: 4,
      ticketId: "SUP-1004",
      name: "Priya Nair",
      company: "Stark Industries",
      priority: "High",
      status: "Opened",
      created: "26 Apr 2026",
    },
    {
      id: 5,
      ticketId: "SUP-1005",
      name: "Rahul Sharma",
      company: "TechNova Solutions",
      priority: "High",
      status: "Opened",
      created: "25 Apr 2026",
    },
  ];

  const actions = [
    {
      icon: <Eye size={16} />,
      tooltip: "View Ticket",
      variant: "primary",
      onClick: (row) => console.log("View", row),
    },
    {
      icon: <Reply size={16} />,
      tooltip: "Reply",
      variant: "primary",
      onClick: (row) => console.log("Reply", row),
    },
    {
      icon: <CheckCircle2 size={16} />,
      tooltip: "Mark Resolved",
      variant: "danger",
      onClick: (row) => console.log("Resolve", row),
    },
  ];

  return (
    <div className="p-1 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
      <Heading primaryText="Support Ticket" secondaryText="Management" showAnimations />

      <DashGrid cols={12} gap={4}>
        {supportStats.map((stat, idx) => (
          <EnhancedDashCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            accentColor={stat.color}
            size={3}
          />
        ))}
      </DashGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <GBarChart
            title="Ticket Volume"
            subtitle="Tickets opened vs resolved this week"
            data={ticketVolumeData}
            bars={[
              { key: "opened", label: "Opened", color: "#f59e0b" },
              { key: "resolved", label: "Resolved", color: "#10b981" },
            ]}
            height={320}
          />
        </div>
        <div className="lg:col-span-4">
          <GDoughnutChart
            title="Tickets by Category"
            subtitle="Current distribution"
            data={categoryDistributionData}
            colors={["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]}
            height={320}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-2">
        <DataTable
          title={<HeadingForDataTable primaryText="Support Tickets" secondaryText="Data table" />}
          columns={columns}
          rows={supportData}
          actions={actions}
          pageSize={5}
          searchable={true}
        />
      </div>
    </div>
  );
}
