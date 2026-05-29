import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

// ── Packet 1 (DONE) ─────────────────────────────────────────────────────
import ManagementEmployeeDashboard   from "../../pages/management/managementEmployee/ManagementEmployeeDashboard";
import ManagementEmployeeMyProjects  from "../../pages/management/managementEmployee/ManagementEmployeeMyProjects";
import AllAssignedRoute              from "../../pages/management/managementEmployee/projects/AllAssignedRoute";
import ActiveProjects                from "../../pages/management/managementEmployee/projects/ActiveProjects";
import CompletedProjects             from "../../pages/management/managementEmployee/projects/CompletedProjects";

// ── Packet 2 (TODO — owned by teammate) ─────────────────────────────────
// Uncomment the import + route block below once Packet 2 ships
// (TEAM_GUIDE.md Section 8 → Packet 2 — Activity).
//
// import ManagementEmployeeActivity from "../../pages/management/managementEmployee/ManagementEmployeeActivity";
// import CommentsLog                from "../../pages/management/managementEmployee/activity/CommentsLog";
// import WorkNotesLog               from "../../pages/management/managementEmployee/activity/WorkNotesLog";

// ── Packet 3 (TODO — owned by teammate) ─────────────────────────────────
// Uncomment the imports + route block below once Packet 3 ships
// (TEAM_GUIDE.md Section 8 → Packet 3 — Deadlines + Reminders + Performance).

 import ManagementEmployeeDeadlines   from "../../pages/management/managementEmployee/ManagementEmployeeDeadlines";
 import ManagementEmployeeReminders   from "../../pages/management/managementEmployee/ManagementEmployeeReminders";
 import ManagementEmployeePerformance from "../../pages/management/managementEmployee/ManagementEmployeePerformance";

// ── Packet 4 (DONE) ─────────────────────────────────────────────────────
import HRMPage                       from "../../pages/management/managementEmployee/hrm/HRMPage";
import LoginLogs                     from "../../pages/management/managementEmployee/loginLogs/LoginLogs";
import ManagementEmployeeTickets     from "../../pages/management/managementEmployee/ManagementEmployeeTickets";

function ManagementEmployeeRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        {/* Packet 1 */}
        <Route index element={<ManagementEmployeeDashboard />} />
        <Route path="my-projects" element={<ManagementEmployeeMyProjects />}>
          <Route index             element={<AllAssignedRoute />} />
          <Route path="active"     element={<ActiveProjects />} />
          <Route path="completed"  element={<CompletedProjects />} />
        </Route>

        {/* Packet 2 — Activity (TODO). Uncomment when ManagementEmployeeActivity.jsx
            and its activity/* children land. The layout is Outlet+tabs with two
            children (Comments | Work Notes); see TEAM_GUIDE.md Section 8 → Packet 2.
        <Route path="activity" element={<ManagementEmployeeActivity />}>
          <Route index             element={<Navigate to="comments" replace />} />
          <Route path="comments"   element={<CommentsLog />} />
          <Route path="work-notes" element={<WorkNotesLog />} />
        </Route>
        */}

        {/*Packet 3 — Deadlines + Reminders + Performance (TODO). Uncomment when
            the three page files land. Each is a single page (no nested routes).*/}
        <Route path="deadlines"   element={<ManagementEmployeeDeadlines />} />
        <Route path="reminders"   element={<ManagementEmployeeReminders />} />
        <Route path="performance" element={<ManagementEmployeePerformance />} />
        

        {/* Packet 4 */}
        <Route path="hrm"         element={<HRMPage />} />
        <Route path="login-logs"  element={<LoginLogs />} />
        <Route path="tickets"     element={<ManagementEmployeeTickets />} />

        <Route path="*" element={<Navigate to="/management-employee" replace />} />
      </Route>
    </Routes>
  );
}

export default ManagementEmployeeRoutes;
