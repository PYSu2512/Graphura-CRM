import React, { useState } from "react";
import {
  Grid,
  Heading,
  EnhancedDashCard,
  DataTable,
  GAreaChart,
  GColumnChart,
  GPieChart,
  Button,
  openModal,
  closeModal,
  Modal,
  ModalProfile,
  ModalGrid,
  ModalData,
  UserChat,
} from "../../../components/shared/Common_Components";
import {
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  UserCheck,
  LifeBuoy,
  TrendingUp,
  Eye,
  MessageSquare,
  CheckSquare,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────────────────────

const kpis = [
  { title: "Total Projects", value: "24", icon: <Briefcase size={20} />, accent: "#3b82f6" },
  { title: "Delayed Tasks", value: "2", icon: <AlertTriangle size={20} />, accent: "#ef4444" },
  { title: "Attendance Today", value: "11", icon: <UserCheck size={20} />, accent: "#10b981" },
  { title: "Productivity", value: "94%", icon: <TrendingUp size={20} />, accent: "#06b6d4" },
];

const initialProjects = [
  { id: "PRJ-001", name: "Alpha CRM Update", assignee: "John Doe", status: "In Progress", priority: "High", deadline: "2026-06-15" },
  { id: "PRJ-002", name: "Beta Web Portal", assignee: "Jane Smith", status: "Pending", priority: "Medium", deadline: "2026-06-20" },
  { id: "PRJ-003", name: "Gamma API Integration", assignee: "Alex Johnson", status: "Completed", priority: "Low", deadline: "2026-05-10" },
  { id: "PRJ-004", name: "Delta Migration", assignee: "Chris Lee", status: "Delayed", priority: "High", deadline: "2026-05-18" },
];

const teamActivity = [
  { id: 1, name: "John Doe", task: "Working on PRJ-001 frontend", status: "Active", time: "10:30 AM" },
  { id: 2, name: "Jane Smith", task: "Reviewing design for PRJ-002", status: "Active", time: "10:15 AM" },
  { id: 3, name: "Alex Johnson", task: "Testing Gamma API", status: "Inactive", time: "09:45 AM" },
  { id: 4, name: "Chris Lee", task: "Fixing PRJ-004 migration bugs", status: "Active", time: "11:00 AM" },
];

const initialTickets = [
  { id: "TCK-101", issue: "Login Failure", priority: "High", status: "Open", assignee: "John Doe" },
  { id: "TCK-102", issue: "Export Error", priority: "Medium", status: "Resolved", assignee: "Jane Smith" },
  { id: "TCK-103", issue: "Slow Dashboard", priority: "Low", status: "Escalated", assignee: "Chris Lee" },
];

const hrmData = [
  { id: "EMP-01", name: "John Doe", role: "Developer", checkIn: "09:00 AM", checkOut: "—", status: "Present" },
  { id: "EMP-02", name: "Jane Smith", role: "Designer", checkIn: "09:15 AM", checkOut: "—", status: "Present" },
  { id: "EMP-03", name: "Alex Johnson", role: "QA Engineer", checkIn: "—", checkOut: "—", status: "On Leave" },
  { id: "EMP-04", name: "Chris Lee", role: "DevOps", checkIn: "08:45 AM", checkOut: "—", status: "Present" },
];

const progressData = [
  { name: "Week 1", completed: 10, delayed: 2 },
  { name: "Week 2", completed: 15, delayed: 1 },
  { name: "Week 3", completed: 12, delayed: 4 },
  { name: "Week 4", completed: 18, delayed: 0 },
];

const statusDistribution = [
  { name: "Completed", value: 18 },
  { name: "In Progress", value: 8 },
  { name: "Pending", value: 4 },
  { name: "Delayed", value: 2 },
];

// ── Components ──────────────────────────────────────────────────────────────

export default function ManagementTeamLeaderDashboard() {
  const [projectList, setProjectList] = useState(initialProjects);
  const [ticketList, setTicketList] = useState(initialTickets);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleViewProject = (row) => {
    setSelectedProject(row);
    openModal("project-details-modal");
  };

  const handleCompleteProject = (row) => {
    setProjectList((prev) =>
      prev.map((p) => (p.id === row.id ? { ...p, status: "Completed" } : p))
    );
  };

  const handleOpenTicketReply = (row) => {
    setSelectedTicket(row);
    openModal("ticket-reply-modal");
  };

  const handleSendTicketReply = (msg) => {
    setTicketList((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicket.id) {
          const updatedConvo = [...(t.conversation || []), { id: Date.now(), sender: "Team Leader", time: new Date().toLocaleTimeString(), text: msg.text }];
          return { ...t, status: "Replied", conversation: updatedConvo };
        }
        return t;
      })
    );
    setSelectedTicket((prev) => ({
      ...prev,
      status: "Replied",
      conversation: [...(prev.conversation || []), { id: Date.now(), sender: "Team Leader", time: new Date().toLocaleTimeString(), text: msg.text }]
    }));
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-10">
      
      {/* 1. Header / Top Section */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Team Leader"
          secondaryText="Dashboard"
          size={12}
        />
      </Grid>

      {/* 2. KPI Cards Section */}
      <Grid cols={12} gap={4}>
        {kpis.map((k, i) => (
          <EnhancedDashCard
            key={i}
            title={k.title}
            value={k.value}
            icon={k.icon}
            accentColor={k.accent}
            size={3}
          />
        ))}
      </Grid>

      {/* 3. Progress Tracking & Reporting Section */}
      <Grid cols={12} gap={4}>
        <GColumnChart
          title="Weekly Task Completion"
          subtitle="Tasks completed vs delayed over the month"
          data={progressData}
          bars={[
            { key: "completed", label: "Completed", color: "#22c55e" },
            { key: "delayed", label: "Delayed", color: "#ef4444" },
          ]}
          size={8}
          height={320}
        />
        <GPieChart
          title="Project Status Distribution"
          subtitle="Current statuses of all assigned projects"
          data={statusDistribution}
          colors={["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"]}
          size={4}
          height={320}
        />
      </Grid>

      {/* 4. Project Management Section */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Project Management"
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Project Name" },
            { key: "assignee", label: "Assignee" },
            { key: "priority", label: "Priority" },
            { key: "deadline", label: "Deadline" },
            { key: "status", label: "Status" },
          ]}
          rows={projectList}
          size={12}
          pageSize={5}
          searchable
          actions={[
            {
              icon: <Eye size={16} />,
              tooltip: "View Details",
              variant: "ghost",
              onClick: handleViewProject,
            },
            {
              icon: <CheckSquare size={16} />,
              tooltip: "Mark Complete",
              variant: "ghost",
              onClick: handleCompleteProject,
            }
          ]}
          filters={[
            { title: "Status", type: "toggle", key: "status", options: ["Pending", "In Progress", "Completed", "Delayed"] }
          ]}
        />
      </Grid>

      {/* 5. Team Coordination & HRM Section */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Team Activity & Coordination"
          columns={[
            { key: "name", label: "Employee Name" },
            { key: "task", label: "Current Task" },
            { key: "time", label: "Last Update" },
            { key: "status", label: "Status" },
          ]}
          rows={teamActivity}
          size={12}
          pageSize={5}
        />
        <DataTable
          title="HRM & Attendance Tracking"
          columns={[
            { key: "name", label: "Employee" },
            { key: "role", label: "Role" },
            { key: "checkIn", label: "Check In" },
            { key: "status", label: "Attendance Status" },
          ]}
          rows={hrmData}
          size={12}
          pageSize={5}
        />
      </Grid>

      {/* 6. Issue Handling Section */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Support Tickets & Issues"
          columns={[
            { key: "id", label: "Ticket ID" },
            { key: "issue", label: "Issue Description" },
            { key: "assignee", label: "Assignee" },
            { key: "priority", label: "Priority" },
            { key: "status", label: "Status" },
          ]}
          rows={ticketList}
          size={12}
          pageSize={5}
          searchable
          actions={[
            {
              icon: <MessageSquare size={16} />,
              tooltip: "Reply",
              variant: "ghost",
              onClick: handleOpenTicketReply,
            }
          ]}
        />
      </Grid>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <Modal id="project-details-modal" title="Project Management" size="lg">
        {selectedProject && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selectedProject.name}
              subtitle={`Assigned to: ${selectedProject.assignee}`}
              meta={`Project ID: ${selectedProject.id} · Priority: ${selectedProject.priority}`}
            />
            <ModalGrid title="Details" cols={2}>
              <ModalData label="Status" value={selectedProject.status} />
              <ModalData label="Deadline" value={selectedProject.deadline} />
            </ModalGrid>
            <Grid cols={12} gap={2} className="pt-4">
              <div className="hidden sm:block sm:col-span-6"></div>
              <Button 
                text="Mark Complete" 
                variant="secondary" 
                size={3} 
                onClick={() => {
                  handleCompleteProject(selectedProject);
                  closeModal("project-details-modal");
                }} 
                disabled={selectedProject.status === "Completed"}
              />
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("project-details-modal")} />
            </Grid>
          </div>
        )}
      </Modal>

      <Modal id="ticket-reply-modal" title="Ticket Details" size="lg">
        {selectedTicket && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selectedTicket.issue}
              subtitle={`Assigned to: ${selectedTicket.assignee}`}
              meta={`Ticket ID: ${selectedTicket.id} · Priority: ${selectedTicket.priority}`}
            />
            <ModalGrid title="Details" cols={2}>
              <ModalData label="Status" value={selectedTicket.status} />
              <ModalData label="Priority" value={selectedTicket.priority} />
            </ModalGrid>
            <div className="flex flex-col gap-1 pt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conversation</p>
              <UserChat 
                messages={selectedTicket.conversation || []} 
                onSend={selectedTicket.status === "Resolved" ? null : handleSendTicketReply}
                currentUser="Team Leader" 
                maxHeight="max-h-72"
                placeholder="Type your reply… (Enter to send)" 
                readOnly={selectedTicket.status === "Resolved"} 
              />
            </div>
            <Grid cols={12} gap={2} className="pt-2">
              <div className="hidden sm:block sm:col-span-9"></div>
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("ticket-reply-modal")} />
            </Grid>
          </div>
        )}
      </Modal>

    </div>
  );
}
