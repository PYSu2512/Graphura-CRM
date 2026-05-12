import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

import SalesTeamLeaderDashboard from "../../pages/sales/salesTeamLeader/SalesTeamLeaderDashboard";
import SalesTeamLeaderLeads from "../../pages/sales/salesTeamLeader/SalesTeamLeaderLeads";
import SalesTeamLeaderTargets from "../../pages/sales/salesTeamLeader/SalesTeamLeaderTargets";
import SalesTeamLeaderReports from "../../pages/sales/salesTeamLeader/SalesTeamLeaderReports";
import SalesTeamLeaderTickets from "../../pages/sales/salesTeamLeader/SalesTeamLeaderTickets";
import SalesTeamLeaderAnnouncements from "../../pages/sales/salesTeamLeader/SalesTeamLeaderAnnouncements";

// Packet 3
import SalesTeamLeaderMyTeam from "../../pages/sales/salesTeamLeader/SalesTeamLeaderMyTeam";
import TeamMembers from "../../pages/sales/salesTeamLeader/myTeam/TeamMembers";


// Packet 5
import HRMPage from "../../pages/sales/salesTeamLeader/hrm/HRMPage";
import LoginLogs from "../../pages/sales/salesTeamLeader/loginLogs/LoginLogs";
import PaymentAlerts from "../../pages/sales/salesTeamLeader/payments/PaymentAlerts";

function SalesTeamLeaderRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>

                <Route index element={<SalesTeamLeaderDashboard />} />
                <Route path="leads" element={<SalesTeamLeaderLeads />} />

                {/* Packet 3 */}
                <Route path="my-team" element={<SalesTeamLeaderMyTeam />}>
                    <Route index element={<TeamMembers />} />
                    
                </Route>

                <Route path="targets" element={<SalesTeamLeaderTargets />} />
                <Route path="reports" element={<SalesTeamLeaderReports />} />
                <Route path="tickets" element={<SalesTeamLeaderTickets />} />
                <Route path="communication" element={<SalesTeamLeaderAnnouncements />} />

                {/* Packet 5 */}
                <Route path="hrm" element={<HRMPage />} />
                <Route path="login-logs" element={<LoginLogs />} />
                <Route path="payment-alerts" element={<PaymentAlerts />} />

                <Route path="*" element={<Navigate to="/sales-team-leader" replace />} />

            </Route>
        </Routes>
    );
}

export default SalesTeamLeaderRoutes;