import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/super-admin/dashboard/Dashboard";
import Admins from "../pages/super-admin/admins/Admins";
import Announcement from "../pages/super-admin/Announcement/Announcement";
import Support from "../pages/super-admin/support/Support";
import LoginLogs from "../pages/super-admin/login-logs/LoginLogs";
import SuperAdminProfile from "../pages/super-admin/SuperAdminProfile";
import Departments from "../pages/super-admin/departments/Departments";

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="departments" element={<Departments />} />
        <Route path="admins" element={<Admins />} />
        <Route path="announcements" element={<Announcement />} />
        <Route path="login-logs" element={<LoginLogs />} />
        <Route path="support" element={<Support />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        <Route path="*" element={<Navigate to="/super-admin" replace />} />
      </Route>
    </Routes>
  );
}

export default SuperAdminRoutes;
