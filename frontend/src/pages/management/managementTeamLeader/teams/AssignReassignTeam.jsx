import React, { useState } from "react";
import {
  Grid,
  Heading,
  DataField,
  SelectField,
  Option,
  Button,
  DataTable,
  Modal,
  openModal,
  closeModal,
  ModalProfile,
  ModalGrid,
  ModalData,
} from "../../../../components/shared/Common_Components";
import { RefreshCw, UserCheck } from "lucide-react";
import teamsStore from "./teamsStore";

export default function AssignReassignTeam() {
  const [projects, setProjects] = useState(teamsStore.projects);
  const [members] = useState(teamsStore.members);
  const [history, setHistory] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Assign form
  const [assignForm, setAssignForm] = useState({ projectId: "", memberId: "" });
  const setA = (f) => (e) => setAssignForm((p) => ({ ...p, [f]: e.target.value }));

  // Reassign form
  const [reassignForm, setReassignForm] = useState({
    projectId: "", newMemberId: "", reason: "",
  });
  const setR = (f) => (e) => setReassignForm((p) => ({ ...p, [f]: e.target.value }));

  // Derived: current assignee display for reassign
  const reassignCurrentProject = projects.find(
    (p) => String(p.id) === String(reassignForm.projectId)
  );

  const handleAssign = () => {
    const { projectId, memberId } = assignForm;
    if (!projectId || !memberId) return;
    const member = members.find((m) => String(m.id) === String(memberId));
    if (!member) return;
    setProjects((prev) => {
      const updated = prev.map((p) =>
        String(p.id) === String(projectId) ? { ...p, employee: member.name } : p
      );
      teamsStore.projects = updated;
      return updated;
    });
    setAssignForm({ projectId: "", memberId: "" });
  };

  const handleReassign = () => {
    const { projectId, newMemberId, reason } = reassignForm;
    if (!projectId || !newMemberId || !reason) return;
    const project = projects.find((p) => String(p.id) === String(projectId));
    const newMember = members.find((m) => String(m.id) === String(newMemberId));
    if (!project || !newMember) return;
    if (project.employee === newMember.name) return;

    const oldEmployee = project.employee;
    const entry = {
      id: Date.now(),
      project: project.name,
      from: oldEmployee,
      to: newMember.name,
      reason,
      date: new Date().toISOString().slice(0, 10),
    };

    setHistory((prev) => [entry, ...prev]);
    setProjects((prev) => {
      const updated = prev.map((p) =>
        String(p.id) === String(projectId) ? { ...p, employee: newMember.name } : p
      );
      teamsStore.projects = updated;
      return updated;
    });
    setReassignForm({ projectId: "", newMemberId: "", reason: "" });
  };

  const handleViewProject = (row) => {
    setSelectedProject(row);
    openModal("art-view-modal");
  };

  const assignColumns = [
    { key: "name",     label: "Project Name" },
    { key: "employee", label: "Assigned To" },
    { key: "status",   label: "Status" },
    { key: "priority", label: "Priority" },
    { key: "deadline", label: "Deadline" },
    {
      key: "progress",
      label: "Progress",
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${val}%`,
                background: "linear-gradient(90deg,#2a465a,#38bdf8)",
              }}
            />
          </div>
          <span className="text-xs font-bold text-[#2a465a]">{val}%</span>
        </div>
      ),
    },
  ];

  const historyColumns = [
    { key: "project", label: "Project" },
    { key: "from",    label: "From" },
    { key: "to",      label: "To" },
    { key: "reason",  label: "Reason" },
    { key: "date",    label: "Date" },
  ];

  const tableActions = [
    {
      icon: <UserCheck size={14} />,
      tooltip: "View Assignment",
      variant: "ghost",
      onClick: handleViewProject,
    },
  ];

  return (
    <>
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Assign / Reassign"
          secondaryText="Team Projects"
          size={12}
          showAnimations={false}
        />

        {/* Assign Section */}
        <div className="col-span-12">
          <p className="text-sm font-black text-[#2a465a] mb-1">Assign Member to Project</p>
          <p className="text-xs text-slate-400 mb-4">
            Directly assign a team member to an existing project
          </p>
          <div className="bg-[#efefefb1] rounded-2xl p-5">
            <Grid cols={12} gap={4}>
              <SelectField
                label="Select Project"
                id="art-assign-proj"
                size={5}
                value={assignForm.projectId}
                onChange={setA("projectId")}
                placeholder="Choose a project..."
              >
                {projects.map((p) => (
                  <Option key={p.id} value={String(p.id)} label={p.name} />
                ))}
              </SelectField>
              <SelectField
                label="Assign To (Team Member)"
                id="art-assign-member"
                size={5}
                value={assignForm.memberId}
                onChange={setA("memberId")}
                placeholder="Choose a member..."
              >
                {members.map((m) => (
                  <Option key={m.id} value={String(m.id)} label={m.name} />
                ))}
              </SelectField>
              <Button
                text="Assign →"
                size={2}
                variant="primary"
                onClick={handleAssign}
              />
            </Grid>
          </div>
        </div>

        {/* Reassign Section */}
        <div className="col-span-12">
          <p className="text-sm font-black text-[#2a465a] mb-1">Reassign Project</p>
          <p className="text-xs text-slate-400 mb-4">
            Transfer a project from one member to another
          </p>
          <div className="bg-[#efefefb1] rounded-2xl p-5">
            <Grid cols={12} gap={4}>
              <SelectField
                label="Select Project to Reassign"
                id="art-reassign-proj"
                size={4}
                value={reassignForm.projectId}
                onChange={setR("projectId")}
                placeholder="Choose a project..."
              >
                {projects.map((p) => (
                  <Option key={p.id} value={String(p.id)} label={p.name} />
                ))}
              </SelectField>
              <DataField
                label="Currently Assigned To"
                id="art-reassign-current"
                size={4}
                value={reassignCurrentProject?.employee || ""}
                readOnly
                placeholder="Auto-filled after selection..."
              />
              <SelectField
                label="Reassign To"
                id="art-reassign-new"
                size={4}
                value={reassignForm.newMemberId}
                onChange={setR("newMemberId")}
                placeholder="New member..."
              >
                {members.map((m) => (
                  <Option key={m.id} value={String(m.id)} label={m.name} />
                ))}
              </SelectField>
              <SelectField
                label="Reason for Reassignment"
                id="art-reassign-reason"
                size={6}
                value={reassignForm.reason}
                onChange={setR("reason")}
                placeholder="Select reason..."
                searchable={false}
              >
                <Option value="Employee unavailable"  label="Employee unavailable" />
                <Option value="Workload balancing"    label="Workload balancing" />
                <Option value="Skill mismatch"        label="Skill mismatch" />
                <Option value="Employee resigned"     label="Employee resigned" />
                <Option value="Manager decision"      label="Manager decision" />
                <Option value="Other"                 label="Other" />
              </SelectField>
              <Button
                text="Confirm Reassignment →"
                size={4}
                variant="primary"
                onClick={handleReassign}
              />
              <Button
                text="Clear"
                size={2}
                variant="secondary"
                onClick={() => setReassignForm({ projectId: "", newMemberId: "", reason: "" })}
              />
            </Grid>
          </div>
        </div>

        {/* Current Assignment Table */}
        <DataTable
          columns={assignColumns}
          rows={projects}
          actions={tableActions}
          title="Current Project Assignments"
          size={12}
          pageSize={5}
          searchable
          userProfile="employee"
          filters={[
            { title: "Status",   type: "toggle", key: "status",   options: ["Pending", "Completed", "Delayed", "In Progress"] },
            { title: "Priority", type: "toggle", key: "priority", options: ["Critical", "High", "Medium", "Low"] },
          ]}
        />

        {/* Reassignment History */}
        {history.length > 0 && (
          <DataTable
            columns={historyColumns}
            rows={history}
            title="Reassignment History"
            size={12}
            pageSize={5}
            searchable
          />
        )}
      </Grid>

      {/* View Project Modal */}
      <Modal id="art-view-modal" title="Project Assignment Details" size="md">
        {selectedProject && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Project Info" cols={2}>
              <ModalData label="Project Name" value={selectedProject.name} />
              <ModalData label="Assigned To"  value={selectedProject.employee} />
              <ModalData label="Status"       value={selectedProject.status} />
              <ModalData label="Priority"     value={selectedProject.priority} />
              <ModalData label="Deadline"     value={selectedProject.deadline} />
              <ModalData label="Progress"     value={`${selectedProject.progress}%`} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button
                text="Close"
                variant="ghost"
                size={3}
                onClick={() => closeModal("art-view-modal")}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
