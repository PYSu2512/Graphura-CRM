import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ManagementTeamLeaderDashboard from "../../pages/management/managementTeamLeader/ManagementTeamLeaderDashboard";
import HRMPage from "../../pages/management/managementTeamLeader/hrm/HRMPage";
import NotificationsPage from "../../pages/management/managementTeamLeader/notifications/NotificationsPage";
import ReportsPage from "../../pages/management/managementTeamLeader/reports/ReportsPage";
import SupportPage from "../../pages/management/managementTeamLeader/support/SupportPage";
import ProgressPage from "../../pages/management/managementTeamLeader/progress/ProgressPage";
import ProjectsPage from "../../pages/management/managementTeamLeader/projects/ProjectsPage";

function ManagementTeamLeaderRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<ManagementTeamLeaderDashboard />} />
        <Route path="hrm" element={<HRMPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="*" element={<Navigate to="/management-team-leader" replace />} />
      </Route>
    </Routes>
  );
}

export default ManagementTeamLeaderRoutes;