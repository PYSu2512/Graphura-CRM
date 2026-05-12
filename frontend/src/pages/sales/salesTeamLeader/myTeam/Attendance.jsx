import { Navigate } from "react-router-dom";

// My Team's attendance view was retired — the team-wide attendance table now
// lives in HRM (Packet 5). Anyone hitting /sales-team-leader/my-team/attendance
// gets redirected there. Once Pranjal removes this route from
// salesTeamLeaderRoutes.jsx, this file can be deleted.
export default function Attendance() {
  return <Navigate to="/sales-team-leader/hrm" replace />;
}
