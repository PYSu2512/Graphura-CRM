import { Activity, UserCheck, Users, Zap } from "lucide-react";
import { DashCard, DashGrid, DataTable, Heading } from "../../../../components/shared/Common_Components.jsx";
import { projects } from "../managementManagerStore";
import { employees, teamLeaders } from "./teamsStore";

const cols = [
  { key: "name", label: "Team Leader" },
  { key: "region", label: "Region" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
  { key: "employees", label: "Employees" },
  { key: "activeProjects", label: "Active Projects" },
  { key: "deliveredProjects", label: "Delivered Projects" },
  { key: "delayedProjects", label: "Delayed Projects" },
];

export default function TeamLeaders() {
  const leaderRows = teamLeaders.map((tl) => {
    const myEmployees = employees.filter((emp) => emp.teamLeaderId === tl.id);
    const myProjects = projects.filter((project) => project.assignedTL === tl.id);

    return {
      id: tl.id,
      name: tl.name,
      region: tl.region,
      phone: tl.phone,
      status: tl.status,
      employees: myEmployees.length,
      activeProjects: myProjects.filter((p) => ["In Progress", "Work Started", "Review Stage", "Finalization"].includes(p.status)).length,
      deliveredProjects: myProjects.filter((p) => p.status === "Delivered").length,
      delayedProjects: myProjects.filter((p) => p.status === "Delayed").length,
    };
  });

  const kpis = [
    { title: "Team Leaders", value: String(teamLeaders.length), accent: "#3b82f6" },
    { title: "Employees", value: String(employees.length), accent: "#8b5cf6" },
    { title: "Active Projects", value: String(projects.filter((p) => ["In Progress", "Work Started", "Review Stage", "Finalization"].includes(p.status)).length), accent: "#14b8a6" },
    { title: "Delayed Projects", value: String(projects.filter((p) => p.status === "Delayed").length), accent: "#f97316" },
  ];

  return (
    <div className="space-y-6">
      <Heading primaryText="Team Leaders" secondaryText="Team leader performance and current project load." size={12} />

      <DashGrid cols={12} gap={4}>
        <DashCard title="Team Leaders" value={kpis[0].value} icon={<UserCheck size={20} />} accentColor={kpis[0].accent} size={3} />
        <DashCard title="Employees" value={kpis[1].value} icon={<Users size={20} />} accentColor={kpis[1].accent} size={3} />
        <DashCard title="Active Projects" value={kpis[2].value} icon={<Activity size={20} />} accentColor={kpis[2].accent} size={3} />
        <DashCard title="Delayed Projects" value={kpis[3].value} icon={<Zap size={20} />} accentColor={kpis[3].accent} size={3} />
      </DashGrid>

      <DataTable
        title="Team Leaders"
        columns={cols}
        rows={leaderRows}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="management_team_leaders"
        userProfile="name"
        filters={[
          { title: "Region", type: "toggle", key: "region", options: [...new Set(teamLeaders.map((tl) => tl.region))] },
          { title: "Status", type: "toggle", key: "status", options: ["Active", "On Leave"] },
        ]}
      />
    </div>
  );
}
