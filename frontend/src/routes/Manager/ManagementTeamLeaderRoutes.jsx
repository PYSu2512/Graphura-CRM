import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import HRMPage from "../../pages/management/managementTeamLeader/hrm/HRMPage";
import NotificationsPage from "../../pages/management/managementTeamLeader/notifications/NotificationsPage";
import ReportsPage from "../../pages/management/managementTeamLeader/reports/ReportsPage";
import SupportPage from "../../pages/management/managementTeamLeader/support/SupportPage";
import ProgressPage from "../../pages/management/managementTeamLeader/progress/ProgressPage";

function ManagementTeamLeaderRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/management-team-leader/hrm" replace />} />
        <Route path="hrm" element={<HRMPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="*" element={<Navigate to="/management-team-leader/hrm" replace />} />
      </Route>
    </Routes>
  );
}

export default ManagementTeamLeaderRoutes;