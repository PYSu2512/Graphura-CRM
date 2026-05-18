import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/super-admin/dashboard/Dashboard";
import Admins from "../pages/super-admin/admins/Admins";
import Billing from "../pages/super-admin/billing/Billing";
import Communication from "../pages/super-admin/communication/Communication";
import Support from "../pages/super-admin/support/Support";
import ApiConfig from "../pages/super-admin/api-config/ApiConfig";
import LoginLogs from "../pages/super-admin/login-logs/LoginLogs";
import SuperAdminProfile from "../pages/super-admin/SuperAdminProfile";

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="admins" element={<Admins />} />
        <Route path="billing" element={<Billing />} />
        <Route path="communication" element={<Communication />} />
        <Route path="login-logs" element={<LoginLogs />} />
        <Route path="support" element={<Support />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        <Route path="api-config" element={<ApiConfig />} />
        <Route path="*" element={<Navigate to="/super-admin" replace />} />
      </Route>
    </Routes>
  );
}

export default SuperAdminRoutes;
