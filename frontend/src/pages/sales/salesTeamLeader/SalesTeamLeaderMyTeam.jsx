import { Outlet } from "react-router-dom";
import { Heading } from "../../../components/shared/Common_Components.jsx";

// Attendance + Leave Approvals moved to HRM (Packet 5). The /attendance and
// /leave-approvals nested routes still exist (we don't edit the routes file
// directly) but their components now redirect to /sales-team-leader/hrm. With
// only Team Members remaining the tab nav is gone — Outlet renders directly.
export default function SalesTeamLeaderMyTeam() {
  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="My" secondaryText="Team" size={12} />
      <Outlet />
    </div>
  );
}
