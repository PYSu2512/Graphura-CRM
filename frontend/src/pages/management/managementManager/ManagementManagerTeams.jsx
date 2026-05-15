import { TreeDeciduous, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { Heading } from "../../../components/shared/Common_Components.jsx";
import Employees from "./teams/Employees";
import TeamLeaders from "./teams/TeamLeaders";
import { employees as initialEmployees } from "./teams/teamsStore";
import TeamStructure from "./teams/TeamStructure";

const TABS = [
  { key: "Team Leaders", icon: UserCheck },
  { key: "Employees", icon: Users },
  { key: "Team Structure", icon: TreeDeciduous },
];

export default function ManagementManagerTeams() {
  const [active, setActive] = useState("Team Leaders");
  const [employees, setEmployees] = useState(initialEmployees);

  const moveEmployeeToTL = (employeeId, newTLId) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId ? { ...emp, teamLeaderId: newTLId } : emp,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
        <Heading
          primaryText="Teams"
          secondaryText="Manage the Management department’s team leaders and employees, and update the structure."
          size={12}
        />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                active === key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon size={16} />
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
        {active === "Team Leaders" && (
          <TeamLeaders employees={employees} moveEmployee={moveEmployeeToTL} />
        )}
        {active === "Employees" && (
          <Employees employees={employees} moveEmployee={moveEmployeeToTL} />
        )}
        {active === "Team Structure" && (
          <TeamStructure employees={employees} moveEmployeeToTL={moveEmployeeToTL} />
        )}
      </div>
    </div>
  );
}
