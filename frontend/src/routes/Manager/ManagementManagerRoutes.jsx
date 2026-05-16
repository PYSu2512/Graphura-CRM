import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

// ── Packet 1 (DONE) ─────────────────────────────────────────────────────
import ManagementManagerDashboard from "../../pages/management/managementManager/ManagementManagerDashboard";
import ManagementManagerProjects  from "../../pages/management/managementManager/ManagementManagerProjects";

// ── Packet 2 (DONE) ─────────────────────────────────────────────────────
import ManagementManagerTeams from "../../pages/management/managementManager/ManagementManagerTeams";

// ── Packet 3 (DONE) ─────────────────────────────────────────────────────
import ManagementManagerClients from "../../pages/management/managementManager/ManagementManagerClients";
import ManagementManagerReports from "../../pages/management/managementManager/ManagementManagerReports";

// ── Packet 4 (TODO) ─────────────────────────────────────────────────────
// import HRMPage                    from "../../pages/management/managementManager/hrm/HRMPage";
// import LoginLogs                  from "../../pages/management/managementManager/loginLogs/LoginLogs";
// import ManagementManagerTickets   from "../../pages/management/managementManager/ManagementManagerTickets";

function ManagementManagerRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        {/* Packet 1 */}
        <Route index            element={<ManagementManagerDashboard />} />
        <Route path="projects"  element={<ManagementManagerProjects  />} />

        {/* Packet 2 */}
        <Route path="teams" element={<ManagementManagerTeams />} />

        {/* Packet 3 */}
        <Route path="clients" element={<ManagementManagerClients />} />
        <Route path="reports" element={<ManagementManagerReports />} />

        {/* Packet 4 */}
        {/* <Route path="hrm"         element={<HRMPage                  />} /> */}
        {/* <Route path="login-logs"  element={<LoginLogs                />} /> */}
        {/* <Route path="tickets"     element={<ManagementManagerTickets />} /> */}

        <Route path="*" element={<Navigate to="/management-manager" replace />} />
      </Route>
    </Routes>
  );
}

export default ManagementManagerRoutes;