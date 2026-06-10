/**
 * TeamLeaders.jsx — Management Manager › Teams › Team Leaders tab
 *
 * NOTE: This component is the LEGACY version.
 * ManagementManagerTeams.jsx now imports TeamLeadersTab.jsx (API-driven).
 * This file is kept only as a fallback reference and is NOT rendered
 * in production. It no longer imports any mock data.
 */
import { Activity, Eye, UserCheck, UserPlus, Users, Zap } from "lucide-react";
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
import { teamLeaderKpiCards, teamLeaders } from "./teamsStore";

// All project stats are derived from the `projects` prop passed by the parent
// — NO static mock imports.

const ACTIVE_STATUSES = ["In Progress", "Work Started", "Review Stage", "Finalization"];

const cols = [
  { key: "name",              label: "Team Leader"       },
  { key: "region",            label: "Region"            },
  { key: "phone",             label: "Phone"             },
  { key: "status",            label: "Status"            },
  { key: "employees",         label: "Employees"         },
  { key: "activeProjects",    label: "Active Projects"   },
  { key: "deliveredProjects", label: "Completed Projects"},
  { key: "delayedProjects",   label: "Delayed Projects"  },
];

export default function TeamLeaders({
  employees,
  moveEmployee,
  teamLeaders: propTeamLeaders,
  setTeamLeaders,
  setEmployees,
  // live projects from API (passed by ManagementManagerTeams or parent)
  projects = [],
}) {
  const [selectedLeader,    setSelectedLeader]    = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [targetTL,          setTargetTL]          = useState("");
  const [newName,    setNewName]    = useState("");
  const [newRegion,  setNewRegion]  = useState("");
  const [newPhone,   setNewPhone]   = useState("");
  const [newMemberIds, setNewMemberIds] = useState([]);

  const leaders = propTeamLeaders || teamLeaders;

  const assignedEmployees = selectedLeader
    ? employees.filter((emp) => emp.teamLeaderId === selectedLeader.id)
    : [];

  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId);

  const leaderRows = leaders.map((tl) => {
    const myEmployees = employees.filter((emp) => emp.teamLeaderId === tl.id);
    const myProjects  = projects.filter((p)   => p.assignedTL === tl.id || p.assignedTL === tl._id);
    return {
      id:               tl.id || tl._id,
      name:             tl.name,
      region:           tl.region || "—",
      phone:            tl.phone  || "—",
      status:           tl.status || "Active",
      employees:        myEmployees.length,
      activeProjects:   myProjects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length,
      deliveredProjects: myProjects.filter((p) => p.status === "Completed").length,
      delayedProjects:  myProjects.filter((p) => p.status === "Delayed").length,
    };
  });

  const kpis = teamLeaderKpiCards.map((card) => {
    if (card.title === "Team Leaders")    return { ...card, value: String(leaders.length) };
    if (card.title === "Employees")       return { ...card, value: String(employees.length) };
    if (card.title === "Active Projects")
      return { ...card, value: String(projects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length) };
    if (card.title === "Delayed Projects")
      return { ...card, value: String(projects.filter((p) => p.status === "Delayed").length) };
    return { ...card, value: "0" };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading primaryText="Team Leaders" secondaryText="Overview" size={12} />
        <Button text="Create Team" variant="primary" size={3} onClick={() => openModal("mm-create-team")} />
      </div>

      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Team Leaders"    value={kpis[0].value} icon={<UserCheck size={20} />} accentColor={kpis[0].accent} size={3} />
        <EnhancedDashCard title="Employees"       value={kpis[1].value} icon={<Users    size={20} />} accentColor={kpis[1].accent} size={3} />
        <EnhancedDashCard title="Active Projects" value={kpis[2].value} icon={<Activity size={20} />} accentColor={kpis[2].accent} size={3} />
        <EnhancedDashCard title="Delayed Projects" value={kpis[3].value} icon={<Zap     size={20} />} accentColor={kpis[3].accent} size={3} />
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
          { title: "Region", type: "toggle", key: "region", options: [...new Set(leaders.map((tl) => tl.region).filter(Boolean))] },
          { title: "Status", type: "toggle", key: "status", options: ["Active", "On Leave"] },
        ]}
        actions={[
          {
            icon:    <Eye size={15} />,
            tooltip: "View",
            variant: "ghost",
            onClick: (row) => {
              const leader = leaders.find((tl) => (tl.id || tl._id) === row.id);
              setSelectedLeader(leader);
              openModal("mm-tl-view");
            },
          },
          {
            icon:    <UserPlus size={15} />,
            tooltip: "Reassign Employee",
            variant: "primary",
            onClick: (row) => {
              const leader = leaders.find((tl) => (tl.id || tl._id) === row.id);
              setSelectedLeader(leader);
              setSelectedEmployeeId(
                employees.find((emp) => emp.teamLeaderId === (leader?.id || leader?._id))?.id || "",
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
            <input value={newName} onChange={(e) => setNewName(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Region</label>
            <input value={newRegion} onChange={(e) => setNewRegion(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Phone</label>
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Assign Employees (optional)</label>
            <div className="mt-2 max-h-40 overflow-auto border rounded-md p-2">
              {employees.map((emp) => (
                <label key={emp.id || emp._id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={newMemberIds.includes(emp.id || emp._id)}
                    onChange={(e) => {
                      const id = emp.id || emp._id;
                      if (e.target.checked) setNewMemberIds((p) => [...p, id]);
                      else setNewMemberIds((p) => p.filter((x) => x !== id));
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
                const newLeader = {
                  id: newId, name: newName.trim(),
                  region: newRegion || "—", phone: newPhone || "—", status: "Active",
                };
                if (setTeamLeaders) setTeamLeaders((p) => [...p, newLeader]);
                if (newMemberIds.length && setEmployees) {
                  setEmployees((prev) =>
                    prev.map((emp) =>
                      newMemberIds.includes(emp.id || emp._id)
                        ? { ...emp, teamLeaderId: newId }
                        : emp,
                    ),
                  );
                }
                setNewName(""); setNewRegion(""); setNewPhone(""); setNewMemberIds([]);
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
              subtitle={`${selectedLeader.region || "—"} · ${selectedLeader.status || "Active"}`}
              meta={`Team Leader · ${selectedLeader.phone || "—"}`}
            />
            <ModalGrid title="Summary" cols={2}>
              <ModalData label="Employees" value={String(assignedEmployees.length)} />
              <ModalData
                label="Active Projects"
                value={String(
                  projects.filter(
                    (p) =>
                      (p.assignedTL === selectedLeader.id || p.assignedTL === selectedLeader._id) &&
                      ACTIVE_STATUSES.includes(p.status),
                  ).length,
                )}
              />
              <ModalData
                label="Completed"
                value={String(
                  projects.filter(
                    (p) =>
                      (p.assignedTL === selectedLeader.id || p.assignedTL === selectedLeader._id) &&
                      p.status === "Completed",
                  ).length,
                )}
              />
              <ModalData
                label="Delayed"
                value={String(
                  projects.filter(
                    (p) =>
                      (p.assignedTL === selectedLeader.id || p.assignedTL === selectedLeader._id) &&
                      p.status === "Delayed",
                  ).length,
                )}
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
          <ModalData label="Leader" value={selectedLeader?.name  || "—"} />
          <ModalData label="Region" value={selectedLeader?.region || "—"} />
        </ModalGrid>
        <SelectField label="Employee" id="reassign-employee" value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}>
          <Option value="" label="Select employee" />
          {assignedEmployees.map((emp) => (
            <Option key={emp.id || emp._id} value={emp.id || emp._id} label={emp.name} />
          ))}
        </SelectField>
        <SelectField label="Move to Team Leader" id="reassign-tl" value={targetTL}
          onChange={(e) => setTargetTL(e.target.value)}>
          <Option value="" label="Select team leader" />
          {leaders
            .filter((tl) => (tl.id || tl._id) !== (selectedLeader?.id || selectedLeader?._id))
            .map((tl) => (
              <Option key={tl.id || tl._id} value={tl.id || tl._id} label={tl.name} />
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
                moveEmployee(selectedEmployee.id || selectedEmployee._id, targetTL);
                closeModal("mm-tl-reassign");
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
