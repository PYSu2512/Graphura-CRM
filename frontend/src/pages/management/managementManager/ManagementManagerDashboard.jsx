import { useState } from "react";
import {
  Grid,
  Heading,
  DashCard,
  GAreaChart,
  GColumnChart,
  GPieChart,
  DataTable,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  Button,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components.jsx";
import {
  FolderOpen,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Percent,
  Link2,
  Eye,
} from "lucide-react";
import {
  currentMM,
  dashboardKPIs,
  projectStatusFunnel,
  monthlyDelivery,
  tlLoad,
  recentProjects,
  projects,
  teamLeaders,
} from "./managementManagerStore";

// 6 KPI icons in the same order as dashboardKPIs in the store
const KPI_ICONS = [
  <FolderOpen size={20} />,
  <Activity size={20} />,
  <CheckCircle2 size={20} />,
  <AlertTriangle size={20} />,
  <Percent size={20} />,
  <Link2 size={20} />,
];

const RECENT_COLS = [
  { key: "id",             label: "ID" },
  { key: "name",           label: "Project" },
  { key: "clientName",     label: "Client" },
  { key: "assignedTLName", label: "Team Leader" },
  { key: "deadline",       label: "Deadline" },
  { key: "progress",       label: "Progress" },
  { key: "priority",       label: "Priority" },
  { key: "status",         label: "Status" },
];

export default function ManagementManagerDashboard() {
  const [selectedProject, setSelectedProject] = useState(null);

  const openProjectDetails = (row) => {
    const full = projects.find((p) => p.id === row.id);
    setSelectedProject(full ?? row);
    openModal("mm-project-view");
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Management Manager Dashboard"
          secondaryText={`${currentMM.department} Department · ${teamLeaders.length} team leaders · ${projects.length} projects`}
          fontSize="2xl"
          size={12}
        />
      </Grid>

      {/* ── 2. KPI Cards (6 metrics from spec) ────────────────────────────── */}
      <Grid cols={12} gap={4}>
        {dashboardKPIs.map((k, i) => (
          <DashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={k.accent}
            size={2}
          />
        ))}
      </Grid>

      {/* ── 3. Monthly Delivery Trend + Status Funnel ─────────────────────── */}
      <Grid cols={12} gap={4}>
        <GAreaChart
          title="Project Throughput"
          subtitle="Projects started vs delivered, last 12 months"
          data={monthlyDelivery}
          areas={[
            { key: "started",   label: "Started",   color: "#3b82f6" },
            { key: "delivered", label: "Delivered", color: "#22c55e" },
          ]}
          size={8}
          height={300}
        />
        <GPieChart
          title="Project Status Funnel"
          subtitle="Live status breakdown"
          data={projectStatusFunnel}
          colors={["#94a3b8", "#0ea5e9", "#f59e0b", "#8b5cf6", "#14b8a6", "#22c55e", "#f43f5e"]}
          size={4}
          height={300}
        />
      </Grid>

      {/* ── 4. Per-TL Load ────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <GColumnChart
          title="Team Leader Load"
          subtitle="Active vs delivered vs delayed projects per TL"
          data={tlLoad}
          bars={[
            { key: "active",    label: "Active",    color: "#3b82f6" },
            { key: "delivered", label: "Delivered", color: "#22c55e" },
            { key: "delayed",   label: "Delayed",   color: "#f43f5e" },
          ]}
          size={12}
          height={300}
        />
      </Grid>

      {/* ── 5. Recent Projects ────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Recent Projects"
          columns={RECENT_COLS}
          rows={recentProjects}
          actions={[
            {
              icon: <Eye size={15} />,
              tooltip: "View Details",
              variant: "ghost",
              onClick: openProjectDetails,
            },
          ]}
          size={12}
          pageSize={8}
          searchable
          exportable
          exportFileName="recent_projects"
          filters={[
            { title: "Status",   type: "toggle", key: "status",   options: ["Not Started","Work Started","In Progress","Review Stage","Finalization","Delivered","Delayed"] },
            { title: "Priority", type: "toggle", key: "priority", options: ["High","Medium","Low"] },
          ]}
        />
      </Grid>

      {/* ── Project Detail Modal ──────────────────────────────────────────── */}
      <Modal id="mm-project-view" title="Project Details" size="lg">
        {selectedProject && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selectedProject.name}
              subtitle={`${selectedProject.clientName} · ${selectedProject.assignedTLName}`}
              meta={`${selectedProject.id} · Deadline ${selectedProject.deadline}`}
            />
            <ModalGrid title="Overview" cols={3}>
              <ModalData label="Status"     value={selectedProject.status} />
              <ModalData label="Priority"   value={selectedProject.priority} />
              <ModalData label="Progress"   value={`${selectedProject.progress ?? "—"}${typeof selectedProject.progress === "number" ? "%" : ""}`} />
              <ModalData label="Start Date" value={selectedProject.startDate ?? "—"} />
              <ModalData label="Deadline"   value={selectedProject.deadline ?? "—"} />
              <ModalData label="Delivered"  value={selectedProject.deliveredDate ?? "—"} />
            </ModalGrid>
            <ModalGrid title="Client" cols={2}>
              <ModalData label="Name"   value={selectedProject.clientName ?? "—"} />
              <ModalData label="Mobile" value={selectedProject.clientMobile ?? "—"} />
            </ModalGrid>
            <ModalGrid title="Links" cols={1}>
              <ModalData label="Drive Link"    value={selectedProject.driveLink    ?? "—"} />
              <ModalData label="Handover Link" value={selectedProject.handoverLink ?? "— (mandatory before delivery)"} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mm-project-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
