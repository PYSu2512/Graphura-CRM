import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

import ManagementManagerDashboard from "../../pages/management/managementManager/ManagementManagerDashboard";
import ManagementManagerProjects  from "../../pages/management/managementManager/ManagementManagerProjects";
import ManagementManagerTeams from "../../pages/management/managementManager/ManagementManagerTeams";
import ManagementManagerClients from "../../pages/management/managementManager/ManagementManagerClients";
import ManagementManagerReports from "../../pages/management/managementManager/ManagementManagerReports";
import HRMPage                    from "../../pages/management/managementManager/hrm/HRMPage";
import LoginLogs                  from "../../pages/management/managementManager/loginLogs/LoginLogs";
import ManagementManagerTickets   from "../../pages/management/managementManager/ManagementManagerTickets";

function ManagementManagerRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route index            element={<ManagementManagerDashboard />} />
        <Route path="projects"  element={<ManagementManagerProjects  />} />
        <Route path="teams" element={<ManagementManagerTeams />} />
        <Route path="clients" element={<ManagementManagerClients />} />
        <Route path="reports" element={<ManagementManagerReports />} />
        <Route path="hrm"         element={<HRMPage                  />} />
        <Route path="login-logs"  element={<LoginLogs                />} />
        <Route path="tickets"     element={<ManagementManagerTickets />} />

        <Route path="*" element={<Navigate to="/management-manager" replace />} />
      </Route>
    </Routes>
  );
}

export default ManagementManagerRoutes;