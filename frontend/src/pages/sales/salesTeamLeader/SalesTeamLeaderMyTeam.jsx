import { Outlet } from "react-router-dom";
import { Heading } from "../../../components/shared/Common_Components.jsx";

// My Team is Team Members only. Attendance + Leave Approvals live in HRM
// (Packet 5) — they were retired from here. This layout just renders the
// heading and the nested route (TeamMembers as the index route).
export default function SalesTeamLeaderMyTeam() {
  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="My" secondaryText="Team" size={12} />
      <Outlet />
    </div>
  );
}
