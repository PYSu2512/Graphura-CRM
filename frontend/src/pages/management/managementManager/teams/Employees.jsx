/**
 * Employees.jsx — Management Manager › Teams › Employees tab
 *
 * NOTE: This component is the LEGACY version.
 * ManagementManagerTeams.jsx now imports EmployeesTab.jsx (API-driven).
 * This file is kept only as a fallback reference and is NOT rendered
 * in production. It no longer imports any mock data.
 */
import { Activity, Briefcase, CheckCircle2, Eye, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import {
  Button,
  closeModal,
  EnhancedDashCard,
  DashGrid,
  DataTable,
  Heading,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  openModal,
  Option,
  SelectField,
} from "../../../../components/shared/Common_Components.jsx";
import { employeeKpiCards, teamLeaders as fallbackLeaders } from "./teamsStore";

// All project stats are derived from the `projects` prop — NO static mock imports.

const ACTIVE_STATUSES = ["In Progress", "Work Started", "Review Stage", "Finalization"];

const cols = [
  { key: "name",              label: "Name"               },
  { key: "role",              label: "Role"               },
  { key: "teamLeader",        label: "Team Leader"        },
  { key: "status",            label: "Status"             },
  { key: "activeProjects",    label: "Active Projects"    },
  { key: "completedProjects", label: "Completed Projects" },
  { key: "delayedProjects",   label: "Delayed Projects"   },
];

export default function Employees({
  employees,
  moveEmployee,
  // live data from API (passed by parent)
  teamLeaders: propLeaders,
  projects = [],
}) {
  const leaders = propLeaders || fallbackLeaders;

  const leaderById = new Map(
    leaders.map((tl) => [tl.id || String(tl._id), tl.name]),
  );

  const rows = employees.map((emp) => {
    const empId      = emp.id || String(emp._id);
    // DB projects use assignedTL (ObjectId string); mock projects use assignedEmployees array
    const myProjects = projects.filter(
      (p) =>
        (Array.isArray(p.assignedEmployees) && p.assignedEmployees.includes(empId)) ||
        p.assignedEmployee === empId,
    );
    return {
      id:               empId,
      name:             emp.name,
      role:             emp.role,
      teamLeader:       leaderById.get(emp.teamLeaderId) ?? "Unassigned",
      status:           emp.status || "Active",
      activeProjects:   myProjects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length,
      completedProjects: myProjects.filter((p) => p.status === "Completed").length,
      delayedProjects:  myProjects.filter((p) => p.status === "Delayed").length,
    };
  });

  const [viewEmployee,    setViewEmployee]    = useState(null);
  const [reassignEmployee, setReassignEmployee] = useState(null);
  const [targetTL,        setTargetTL]        = useState("");

  const totalActiveEmployees = employees.filter((e) => e.status === "Active").length;
  const totalOnLeave         = employees.filter((e) => e.status === "On Leave").length;
  const totalAssigned        = rows.filter((r) => r.activeProjects + r.completedProjects + r.delayedProjects > 0).length;

  const kpis = employeeKpiCards.map((card) => {
    if (card.title === "Total Employees")  return { ...card, value: String(employees.length) };
    if (card.title === "Active")           return { ...card, value: String(totalActiveEmployees) };
    if (card.title === "On Leave")         return { ...card, value: String(totalOnLeave) };
    if (card.title === "Assigned Projects") return { ...card, value: String(totalAssigned) };
    return { ...card, value: "0" };
  });

  return (
    <div className="space-y-6">
      <Heading primaryText="Team" secondaryText="Employees" size={12} />

      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title={kpis[0].title} value={kpis[0].value} icon={<Users       size={20} />} accentColor={kpis[0].accent} size={3} />
        <EnhancedDashCard title={kpis[1].title} value={kpis[1].value} icon={<CheckCircle2 size={20} />} accentColor={kpis[1].accent} size={3} />
        <EnhancedDashCard title={kpis[2].title} value={kpis[2].value} icon={<Briefcase   size={20} />} accentColor={kpis[2].accent} size={3} />
        <EnhancedDashCard title={kpis[3].title} value={kpis[3].value} icon={<Activity    size={20} />} accentColor={kpis[3].accent} size={3} />
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
          { title: "Role",   type: "toggle", key: "role",   options: [...new Set(employees.map((e) => e.role).filter(Boolean))] },
          { title: "Status", type: "toggle", key: "status", options: ["Active", "On Leave"] },
        ]}
        actions={[
          {
            icon:    <Eye size={15} />,
            tooltip: "View",
            variant: "ghost",
            onClick: (row) => {
              setViewEmployee(employees.find((e) => (e.id || String(e._id)) === row.id));
              openModal("mm-emp-view");
            },
          },
          {
            icon:    <UserPlus size={15} />,
            tooltip: "Reassign Team Leader",
            variant: "primary",
            onClick: (row) => {
              const emp = employees.find((e) => (e.id || String(e._id)) === row.id);
              setReassignEmployee(emp);
              setTargetTL(emp?.teamLeaderId ?? "");
              openModal("mm-emp-reassign");
            },
          },
        ]}
      />

      <Modal id="mm-emp-view" title="Employee Profile" size="md">
        {viewEmployee && (
          <div className="space-y-5">
            <ModalProfile
              name={viewEmployee.name}
              subtitle={viewEmployee.role}
              meta={leaderById.get(viewEmployee.teamLeaderId) ?? "Unassigned"}
            />
            <ModalGrid title="Details" cols={2}>
              <ModalData label="Status"             value={viewEmployee.status} />
              <ModalData label="Active Projects"    value={String(rows.find((r) => r.id === (viewEmployee.id || String(viewEmployee._id)))?.activeProjects    ?? 0)} />
              <ModalData label="Completed Projects" value={String(rows.find((r) => r.id === (viewEmployee.id || String(viewEmployee._id)))?.completedProjects ?? 0)} />
              <ModalData label="Delayed Projects"   value={String(rows.find((r) => r.id === (viewEmployee.id || String(viewEmployee._id)))?.delayedProjects   ?? 0)} />
            </ModalGrid>
            <div className="flex justify-end gap-3">
              <Button text="Close" variant="primary" size={3} onClick={() => closeModal("mm-emp-view")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="mm-emp-reassign" title="Reassign Team Leader" size="md">
        <ModalGrid title="Employee" cols={1}>
          <ModalData label="Name"                value={reassignEmployee?.name                                            || "—"} />
          <ModalData label="Role"                value={reassignEmployee?.role                                            || "—"} />
          <ModalData label="Current Team Leader" value={leaderById.get(reassignEmployee?.teamLeaderId) ?? "Unassigned"} />
        </ModalGrid>
        <SelectField label="New Team Leader" id="reassign-employee-tl"
          value={targetTL} onChange={(e) => setTargetTL(e.target.value)}>
          <Option value="" label="Select team leader" />
          {leaders.map((tl) => (
            <Option key={tl.id || tl._id} value={tl.id || tl._id} label={tl.name} />
          ))}
        </SelectField>
        <div className="mt-5 flex gap-3 justify-end">
          <Button text="Cancel" variant="secondary" size={3} onClick={() => closeModal("mm-emp-reassign")} />
          <Button
            text="Reassign"
            variant="primary"
            size={3}
            onClick={() => {
              const empId = reassignEmployee?.id || String(reassignEmployee?._id);
              if (empId && targetTL && targetTL !== reassignEmployee?.teamLeaderId) {
                moveEmployee(empId, targetTL);
                closeModal("mm-emp-reassign");
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
