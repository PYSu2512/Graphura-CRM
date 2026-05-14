import { TreeDeciduous } from "lucide-react";
import { useMemo, useState } from "react";
import {
    Button,
    Heading,
    Modal,
    ModalData,
    ModalGrid,
    Option,
    SelectField,
    closeModal,
    openModal,
} from "../../../../components/shared/Common_Components.jsx";
import { employees, teamLeaders } from "./teamsStore";

export default function TeamStructure() {
  const [localEmployees, setLocalEmployees] = useState(employees);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [targetTL, setTargetTL] = useState("");

  const groups = useMemo(
    () => teamLeaders.map((tl) => ({
      leader: tl,
      members: localEmployees.filter((emp) => emp.teamLeaderId === tl.id),
    })),
    [localEmployees]
  );

  const openMoveModal = (employee) => {
    setSelectedEmployee(employee);
    setTargetTL(employee.teamLeaderId);
    openModal("mm-move-employee");
  };

  const moveEmployeeToTL = () => {
    if (!selectedEmployee || !targetTL || targetTL === selectedEmployee.teamLeaderId) return;
    setLocalEmployees((prev) =>
      prev.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, teamLeaderId: targetTL } : emp
      )
    );
    closeModal("mm-move-employee");
  };

  return (
    <div className="space-y-6">
      <Heading primaryText="Team Structure" secondaryText="View the org tree and move employees between team leaders." size={12} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {groups.map(({ leader, members }) => (
          <div key={leader.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{leader.name}</h3>
                <p className="text-sm text-slate-500">{leader.region} · {leader.status}</p>
                <p className="text-sm text-slate-500">{members.length} employees</p>
              </div>
              <TreeDeciduous size={24} className="text-slate-500" />
            </div>

            <div className="space-y-3">
              {members.length ? (
                members.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.role} · {emp.status}</p>
                    </div>
                    <Button
                      text="Move"
                      variant="secondary"
                      size={3}
                      onClick={() => openMoveModal(emp)}
                    />
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  No employees assigned.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal id="mm-move-employee" title="Move Employee" size="sm">
        <ModalGrid title="Employee" cols={1}>
          <ModalData label="Name" value={selectedEmployee?.name || "—"} />
          <ModalData label="Current Team Leader" value={selectedEmployee ? teamLeaders.find((tl) => tl.id === selectedEmployee.teamLeaderId)?.name : "—"} />
        </ModalGrid>

        <SelectField label="Move to Team Leader" id="move-target" value={targetTL} onChange={(e) => setTargetTL(e.target.value)}>
          <Option value="" label="Select team leader" />
          {teamLeaders.map((tl) => (
            <Option key={tl.id} value={tl.id} label={tl.name} />
          ))}
        </SelectField>

        <div className="mt-5 flex gap-3 justify-end">
          <Button text="Cancel" variant="secondary" size={3} onClick={() => closeModal("mm-move-employee")} />
          <Button text="Move" variant="primary" size={3} onClick={moveEmployeeToTL} />
        </div>
      </Modal>
    </div>
  );
}
