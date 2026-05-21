import { Activity, Briefcase, CheckCircle2, Eye, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import {
    Button,
    closeModal,
    DashCard,
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
import { projects } from "../managementManagerStore";
import { employeeKpiCards, teamLeaders } from "./teamsStore";

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

export default function Employees({ employees, moveEmployee }) {
  const rows = employees.map((emp) => {
    const assignedProjects = projects.filter((proj) => proj.assignedEmployees.includes(emp.id));
    return {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      teamLeader: leaderById.get(emp.teamLeaderId) ?? "Unassigned",
      status: emp.status,
      activeProjects: assignedProjects.filter((p) => ["In Progress", "Work Started", "Review Stage", "Finalization"].includes(p.status)).length,
      completedProjects: assignedProjects.filter((p) => p.status === "Completed").length,
      delayedProjects: assignedProjects.filter((p) => p.status === "Delayed").length,
    };
  });

  const [viewEmployee, setViewEmployee] = useState(null);
  const [reassignEmployee, setReassignEmployee] = useState(null);
  const [targetTL, setTargetTL] = useState("");

  const totalActiveEmployees = employees.filter((e) => e.status === "Active").length;
  const totalOnLeave = employees.filter((e) => e.status === "On Leave").length;
  const totalAssigned = rows.filter((row) => row.activeProjects + row.completedProjects + row.delayedProjects > 0).length;

  const kpis = employeeKpiCards.map((card) => {
    if (card.title === "Total Employees") return { ...card, value: String(employees.length) };
    if (card.title === "Active") return { ...card, value: String(totalActiveEmployees) };
    if (card.title === "On Leave") return { ...card, value: String(totalOnLeave) };
    if (card.title === "Assigned Projects") return { ...card, value: String(totalAssigned) };
    return { ...card, value: "0" };
  });

  return (
    <div className="space-y-6">
      <Heading primaryText="Team" secondaryText="Employees" size={12} />

      <DashGrid cols={12} gap={4}>
        <DashCard title={kpis[0].title} value={kpis[0].value} icon={<Users size={20} />} accentColor={kpis[0].accent} size={3} />
        <DashCard title={kpis[1].title} value={kpis[1].value} icon={<CheckCircle2 size={20} />} accentColor={kpis[1].accent} size={3} />
        <DashCard title={kpis[2].title} value={kpis[2].value} icon={<Briefcase size={20} />} accentColor={kpis[2].accent} size={3} />
        <DashCard title={kpis[3].title} value={kpis[3].value} icon={<Activity size={20} />} accentColor={kpis[3].accent} size={3} />
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
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View",
            variant: "ghost",
            onClick: (row) => {
              const employee = employees.find((emp) => emp.id === row.id);
              setViewEmployee(employee);
              openModal("mm-emp-view");
            },
          },
          {
            icon: <UserPlus size={15} />,
            tooltip: "Reassign Team Leader",
            variant: "primary",
            onClick: (row) => {
              const employee = employees.find((emp) => emp.id === row.id);
              setReassignEmployee(employee);
              setTargetTL(employee?.teamLeaderId ?? "");
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
              <ModalData label="Status" value={viewEmployee.status} />
              <ModalData label="Active Projects" value={String(rows.find((row) => row.id === viewEmployee.id)?.activeProjects ?? 0)} />
              <ModalData label="Completed Projects" value={String(rows.find((row) => row.id === viewEmployee.id)?.completedProjects ?? 0)} />
              <ModalData label="Delayed Projects" value={String(rows.find((row) => row.id === viewEmployee.id)?.delayedProjects ?? 0)} />
            </ModalGrid>
            <div className="flex justify-end gap-3">
              <Button text="Close" variant="primary" size={3} onClick={() => closeModal("mm-emp-view")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="mm-emp-reassign" title="Reassign Team Leader" size="md">
        <ModalGrid title="Employee" cols={1}>
          <ModalData label="Name" value={reassignEmployee?.name || "—"} />
          <ModalData label="Role" value={reassignEmployee?.role || "—"} />
          <ModalData label="Current Team Leader" value={leaderById.get(reassignEmployee?.teamLeaderId) ?? "Unassigned"} />
        </ModalGrid>
        <SelectField label="New Team Leader" id="reassign-employee-tl" value={targetTL} onChange={(e) => setTargetTL(e.target.value)}>
          <Option value="" label="Select team leader" />
          {teamLeaders.map((tl) => (
            <Option key={tl.id} value={tl.id} label={tl.name} />
          ))}
        </SelectField>
        <div className="mt-5 flex gap-3 justify-end">
          <Button text="Cancel" variant="secondary" size={3} onClick={() => closeModal("mm-emp-reassign")} />
          <Button
            text="Reassign"
            variant="primary"
            size={3}
            onClick={() => {
              if (reassignEmployee && targetTL && targetTL !== reassignEmployee.teamLeaderId) {
                moveEmployee(reassignEmployee.id, targetTL);
                closeModal("mm-emp-reassign");
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
