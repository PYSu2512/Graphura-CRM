import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ManagementTeamLeaderDashboard from "../../pages/management/managementTeamLeader/ManagementTeamLeaderDashboard";
import HRMPage from "../../pages/management/managementTeamLeader/hrm/HRMPage";
import NotificationsPage from "../../pages/management/managementTeamLeader/notifications/NotificationsPage";
import ReportsPage from "../../pages/management/managementTeamLeader/reports/ReportsPage";
import SupportPage from "../../pages/management/managementTeamLeader/support/SupportPage";
import ProjectsPage from "../../pages/management/managementTeamLeader/projects/ProjectsPage";
import TeamsPage from "../../pages/management/managementTeamLeader/teams/TeamsPage";
import ManagementTeamLeaderProfile from "../../pages/management/managementTeamLeader/ManagementTeamLeaderProfile";
import LoginLogs from "../../pages/management/managementTeamLeader/loginLogs/LoginLogs";
import ManagementTLAnnouncements from "../../pages/management/managementTeamLeader/notifications/ManagementTLAnnouncements";

function ManagementTeamLeaderRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<ManagementTeamLeaderDashboard />} />
        <Route path="hrm" element={<HRMPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="announcements" element={<ManagementTLAnnouncements />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="login-logs" element={<LoginLogs />} />
        <Route path="profile" element={<ManagementTeamLeaderProfile />} />
        <Route path="*" element={<Navigate to="/management-team-leader" replace />} />
      </Route>
    </Routes>
  );
}

export default ManagementTeamLeaderRoutes;