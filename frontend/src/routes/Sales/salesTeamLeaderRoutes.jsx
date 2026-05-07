import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import SalesTeamLeaderDashboard     from "../../pages/sales/salesTeamLeader/SalesTeamLeaderDashboard";
import SalesTeamLeaderLeads         from "../../pages/sales/salesTeamLeader/SalesTeamLeaderLeads";
import SalesTeamLeaderTargets       from "../../pages/sales/salesTeamLeader/SalesTeamLeaderTargets";
import SalesTeamLeaderReports       from "../../pages/sales/salesTeamLeader/SalesTeamLeaderReports";
import SalesTeamLeaderTickets       from "../../pages/sales/salesTeamLeader/SalesTeamLeaderTickets";
import SalesTeamLeaderAnnouncements from "../../pages/sales/salesTeamLeader/SalesTeamLeaderAnnouncements";

// Packet 3 — My Team workspace (layout + sub-pages)
import MyTeamLayout   from "../../pages/sales/salesTeamLeader/myTeam/MyTeamLayout";
import TeamMembers    from "../../pages/sales/salesTeamLeader/myTeam/TeamMembers";
import Attendance     from "../../pages/sales/salesTeamLeader/myTeam/Attendance";
import LeaveApprovals from "../../pages/sales/salesTeamLeader/myTeam/LeaveApprovals";

// Packet 5 — new pages
import HRMPage      from "../../pages/sales/salesTeamLeader/hrm/HRMPage";
import LoginLogs    from "../../pages/sales/salesTeamLeader/loginLogs/LoginLogs";
import PaymentAlerts from "../../pages/sales/salesTeamLeader/payments/PaymentAlerts";

function SalesTeamLeaderRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<SalesTeamLeaderDashboard />} />
                <Route path="leads"          element={<SalesTeamLeaderLeads />} />

                 {/* ── Packet 3 — My Team workspace ──*/}
                 <Route path="my-team" element={<MyTeamLayout />}> 
                     <Route index                     element={<TeamMembers />} />
                     <Route path="attendance"         element={<Attendance />} />
                     <Route path="leave-approvals"    element={<LeaveApprovals />} />
                 </Route>

                 <Route path="targets"        element={<SalesTeamLeaderTargets />} />
                 <Route path="reports"        element={<SalesTeamLeaderReports />} />
                 <Route path="tickets"        element={<SalesTeamLeaderTickets />} />
                 <Route path="communication"  element={<SalesTeamLeaderAnnouncements />} />

                {/* ── Packet 5 ── */}
                <Route path="hrm"            element={<HRMPage />} />
                <Route path="login-logs"     element={<LoginLogs />} />
                <Route path="payment-alerts" element={<PaymentAlerts />} />

                <Route path="*" element={<Navigate to="/sales-team-leader" replace />} />
            </Route>
        </Routes>
    );
}

export default SalesTeamLeaderRoutes;
