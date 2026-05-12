import { Navigate } from "react-router-dom";

// Leave approval was retired from My Team — it now lives in HRM → Leaves
// (Packet 5), with the same data source. Once Pranjal removes the
// /my-team/leave-approvals route entry, this file can be deleted.
export default function LeaveApprovals() {
  return <Navigate to="/sales-team-leader/hrm" replace />;
}
