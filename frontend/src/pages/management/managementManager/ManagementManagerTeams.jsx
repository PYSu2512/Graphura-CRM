import { TreeDeciduous, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { Heading } from "../../../components/shared/Common_Components.jsx";
import Employees from "./teams/Employees";
import TeamLeaders from "./teams/TeamLeaders";
import { employees as initialEmployees, teamLeaders as initialTeamLeaders } from "./teams/teamsStore";
import TeamStructure from "./teams/TeamStructure";

const TABS = [
  { key: "Team Leaders", icon: UserCheck },
  { key: "Employees", icon: Users },
  { key: "Team Structure", icon: TreeDeciduous },
];

export default function ManagementManagerTeams() {
  const [active, setActive] = useState("Team Leaders");
  const [employees, setEmployees] = useState(initialEmployees);
  const [teamLeaders, setTeamLeaders] = useState(initialTeamLeaders);

  const moveEmployeeToTL = (employeeId, newTLId) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId ? { ...emp, teamLeaderId: newTLId } : emp,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Team" secondaryText="Management" size={12} />

      {/* ── Pill Tab Navigation — matches ManagementManagerProjects style ── */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              active === key
                ? "bg-[#2a465a] text-white shadow"
                : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
            }`}
          >
            <Icon size={15} className="flex-shrink-0" />
            {key}
          </button>
        ))}
      </div>

      {/* ── Section content ──────────────────────────────────────────────── */}
      {active === "Team Leaders" && (
        <TeamLeaders
          employees={employees}
          moveEmployee={moveEmployeeToTL}
          teamLeaders={teamLeaders}
          setTeamLeaders={setTeamLeaders}
          setEmployees={setEmployees}
        />
      )}
      {active === "Employees" && (
        <Employees employees={employees} moveEmployee={moveEmployeeToTL} />
      )}
      {active === "Team Structure" && (
        <TeamStructure employees={employees} moveEmployeeToTL={moveEmployeeToTL} />
      )}
    </div>
  );
}
