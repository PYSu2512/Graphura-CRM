import { Activity, Briefcase, CheckCircle2, Users } from "lucide-react";
import { DashCard, DashGrid, DataTable, Heading } from "../../../../components/shared/Common_Components.jsx";
import { projects } from "../managementManagerStore";
import { employees, teamLeaders } from "./teamsStore";

const leaderById = new Map(teamLeaders.map((tl) => [tl.id, tl.name]));

const cols = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "teamLeader", label: "Team Leader" },
  { key: "status", label: "Status" },
  { key: "activeProjects", label: "Active Projects" },
  { key: "completedProjects", label: "Completed Projects" },
  { key: "delayedProjects", label: "Delayed Projects" },
];

export default function Employees() {
  const rows = employees.map((emp) => {
    const assignedProjects = projects.filter((proj) => proj.assignedEmployees.includes(emp.id));
    return {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      teamLeader: leaderById.get(emp.teamLeaderId) ?? "Unassigned",
      status: emp.status,
      activeProjects: assignedProjects.filter((p) => ["In Progress", "Work Started", "Review Stage", "Finalization"].includes(p.status)).length,
      completedProjects: assignedProjects.filter((p) => p.status === "Delivered").length,
      delayedProjects: assignedProjects.filter((p) => p.status === "Delayed").length,
    };
  });

  const totalActiveEmployees = employees.filter((e) => e.status === "Active").length;
  const totalOnLeave = employees.filter((e) => e.status === "On Leave").length;
  const totalAssigned = rows.filter((row) => row.activeProjects + row.completedProjects + row.delayedProjects > 0).length;

  return (
    <div className="space-y-6">
      <Heading primaryText="Employees" secondaryText="Employee assignments, current status, and project workload." size={12} />

      <DashGrid cols={12} gap={4}>
        <DashCard title="Total Employees" value={String(employees.length)} icon={<Users size={20} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Active" value={String(totalActiveEmployees)} icon={<CheckCircle2 size={20} />} accentColor="#22c55e" size={3} />
        <DashCard title="On Leave" value={String(totalOnLeave)} icon={<Briefcase size={20} />} accentColor="#f97316" size={3} />
        <DashCard title="Assigned Projects" value={String(totalAssigned)} icon={<Activity size={20} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      <DataTable
        title="Employees"
        columns={cols}
        rows={rows}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="management_employees"
        userProfile="name"
        filters={[
          { title: "Role", type: "toggle", key: "role", options: [...new Set(employees.map((emp) => emp.role))] },
          { title: "Status", type: "toggle", key: "status", options: ["Active", "On Leave"] },
        ]}
      />
    </div>
  );
}
