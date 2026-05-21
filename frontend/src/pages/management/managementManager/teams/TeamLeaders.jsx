import { Activity, Eye, UserCheck, UserPlus, Users, Zap } from "lucide-react";
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
import { teamLeaderKpiCards, teamLeaders } from "./teamsStore";

const cols = [
  { key: "name", label: "Team Leader" },
  { key: "region", label: "Region" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
  { key: "employees", label: "Employees" },
  { key: "activeProjects", label: "Active Projects" },
  { key: "deliveredProjects", label: "Completed Projects" },
  { key: "delayedProjects", label: "Delayed Projects" },
];

export default function TeamLeaders({ employees, moveEmployee, teamLeaders: propTeamLeaders, setTeamLeaders, setEmployees }) {
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [targetTL, setTargetTL] = useState("");
  // Create Team form state
  const [newName, setNewName] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newMemberIds, setNewMemberIds] = useState([]);

  // Use prop-provided leaders when available (in-memory local override), otherwise fall back to canonical import
  const leaders = propTeamLeaders || teamLeaders;

  const assignedEmployees = selectedLeader
    ? employees.filter((emp) => emp.teamLeaderId === selectedLeader.id)
    : [];

  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId);

  const leaderRows = leaders.map((tl) => {
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
      deliveredProjects: myProjects.filter((p) => p.status === "Completed").length,
      delayedProjects: myProjects.filter((p) => p.status === "Delayed").length,
    };
  });

  const kpis = teamLeaderKpiCards.map((card) => {
    if (card.title === "Team Leaders") return { ...card, value: String(leaders.length) };
    if (card.title === "Employees") return { ...card, value: String(employees.length) };
    if (card.title === "Active Projects")
      return {
        ...card,
        value: String(projects.filter((p) => ["In Progress", "Work Started", "Review Stage", "Finalization"].includes(p.status)).length),
      };
    if (card.title === "Delayed Projects")
      return { ...card, value: String(projects.filter((p) => p.status === "Delayed").length) };
    return { ...card, value: "0" };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading primaryText="Team Leaders" secondaryText="Overview" size={12} />
        <div>
          <Button text="Create Team" variant="primary" size={3} onClick={() => openModal("mm-create-team")} />
        </div>
      </div>

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
          { title: "Region", type: "toggle", key: "region", options: [...new Set(leaders.map((tl) => tl.region))] },
          { title: "Status", type: "toggle", key: "status", options: ["Active", "On Leave"] },
        ]}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View",
            variant: "ghost",
              onClick: (row) => {
              const leader = leaders.find((tl) => tl.id === row.id);
              setSelectedLeader(leader);
              openModal("mm-tl-view");
            },
          },
          {
            icon: <UserPlus size={15} />,
            tooltip: "Reassign Employee",
            variant: "primary",
            onClick: (row) => {
              const leader = leaders.find((tl) => tl.id === row.id);
              setSelectedLeader(leader);
              setSelectedEmployeeId(
                employees.find((emp) => emp.teamLeaderId === leader.id)?.id || "",
              );
              setTargetTL("");
              openModal("mm-tl-reassign");
            },
          },
        ]}
      />

      {/* Create Team modal */}
      <Modal id="mm-create-team" title="Create Team" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Team Leader Name *</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Region</label>
            <input value={newRegion} onChange={(e) => setNewRegion(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Phone</label>
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600">Assign Employees (optional)</label>
            <div className="mt-2 max-h-40 overflow-auto border rounded-md p-2">
              {employees.map((emp) => (
                <label key={emp.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={newMemberIds.includes(emp.id)}
                    onChange={(e) => {
                      if (e.target.checked) setNewMemberIds((p) => [...p, emp.id]);
                      else setNewMemberIds((p) => p.filter((id) => id !== emp.id));
                    }}
                  />
                  <span className="text-sm">{emp.name} — {emp.phone || emp.mobile || "—"}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button text="Cancel" variant="secondary" size={3} onClick={() => closeModal("mm-create-team")} />
            <Button
              text="Create"
              variant="primary"
              size={3}
              onClick={() => {
                if (!newName.trim()) return;
                const newId = `TL-${Date.now()}`;
                const newLeader = { id: newId, name: newName.trim(), region: newRegion || "-", phone: newPhone || "-", status: "Active" };
                if (setTeamLeaders) setTeamLeaders((p) => [...p, newLeader]);
                if (newMemberIds.length && setEmployees) {
                  setEmployees((prev) => prev.map((emp) => (newMemberIds.includes(emp.id) ? { ...emp, teamLeaderId: newId } : emp)));
                }
                // reset form
                setNewName("");
                setNewRegion("");
                setNewPhone("");
                setNewMemberIds([]);
                closeModal("mm-create-team");
              }}
            />
          </div>
        </div>
      </Modal>

      <Modal id="mm-tl-view" title="Team Leader Profile" size="md">
        {selectedLeader && (
          <div className="space-y-5">
            <ModalProfile
              name={selectedLeader.name}
              subtitle={`${selectedLeader.region} · ${selectedLeader.status}`}
              meta={`Team Leader · ${selectedLeader.phone}`}
            />
            <ModalGrid title="Summary" cols={2}>
              <ModalData label="Employees" value={String(assignedEmployees.length)} />
              <ModalData
                label="Active Projects"
                value={String(
                  projects.filter(
                    (p) => p.assignedTL === selectedLeader.id && [
                      "In Progress",
                      "Work Started",
                      "Review Stage",
                      "Finalization",
                    ].includes(p.status),
                  ).length,
                )}
              />
              <ModalData
                label="Completed"
                value={String(projects.filter((p) => p.assignedTL === selectedLeader.id && p.status === "Completed").length)}
              />
              <ModalData
                label="Delayed"
                value={String(projects.filter((p) => p.assignedTL === selectedLeader.id && p.status === "Delayed").length)}
              />
            </ModalGrid>
            <div className="flex justify-end gap-3">
              <Button text="Close" variant="primary" size={3} onClick={() => closeModal("mm-tl-view")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="mm-tl-reassign" title="Reassign Employee" size="md">
        <ModalGrid title="Team Leader" cols={1}>
          <ModalData label="Leader" value={selectedLeader?.name || "—"} />
          <ModalData label="Region" value={selectedLeader?.region || "—"} />
        </ModalGrid>
        <SelectField
          label="Employee"
          id="reassign-employee"
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
        >
          <Option value="" label="Select employee" />
          {assignedEmployees.map((emp) => (
            <Option key={emp.id} value={emp.id} label={emp.name} />
          ))}
        </SelectField>
        <SelectField label="Move to Team Leader" id="reassign-tl" value={targetTL} onChange={(e) => setTargetTL(e.target.value)}>
          <Option value="" label="Select team leader" />
          {teamLeaders
            .filter((tl) => tl.id !== selectedLeader?.id)
            .map((tl) => (
              <Option key={tl.id} value={tl.id} label={tl.name} />
            ))}
        </SelectField>
        <div className="mt-5 flex gap-3 justify-end">
          <Button text="Cancel" variant="secondary" size={3} onClick={() => closeModal("mm-tl-reassign")} />
          <Button
            text="Reassign"
            variant="primary"
            size={3}
            onClick={() => {
              if (selectedEmployee && targetTL) {
                moveEmployee(selectedEmployee.id, targetTL);
                closeModal("mm-tl-reassign");
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
