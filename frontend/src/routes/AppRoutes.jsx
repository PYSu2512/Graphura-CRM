import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminRoutes from "./adminRoutes";
import SuperAdminRoutes from "./superAdminRoutes";
import AdminLogin from "../pages/auth/AdminLogin";
import AdminRegister from "../pages/auth/AdminRegister";
import SalesManagerRoutes from "./Sales/salesManagerRoutes";
import DepartmentLogin from "../pages/auth/DepartmentLogin";
import SuperAdminLogin from "../pages/auth/SuperAdminLogin";
import DepartmentWorkspace from "../pages/department/DepartmentWorkspace";
import SalesTeamLeaderRoutes from "./Sales/salesTeamLeaderRoutes";
import SalesExecutiveRoutes from "./Sales/salesExecutiveRoutes";
import FinanceRoutes from "./financeRoutes";
import ManagementManagerRoutes from "./Manager/ManagementManagerRoutes";
import ManagementTeamLeaderRoutes from "./Manager/ManagementTeamLeaderRoutes";
import ManagementEmployeeRoutes from "./Manager/ManagementEmployeeRoutes";
import ClientRoutes from "./clientRoutes";
import ClientLogin from "../pages/auth/ClientLogin";
import ForgotPassword from "../pages/auth/ForgotPassword";
import PaymentResult from "../pages/public/PaymentResult";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── Public pages (no auth) ── */}
        {/* Razorpay redirects the client here after payment */}
        <Route path="/payment-success" element={<PaymentResult />} />

        {/* Authentication Pages */}
        <Route path="/super-admin-login" element={<SuperAdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/login" element={<DepartmentLogin />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/department/*" element={<DepartmentWorkspace />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        {/* Super_Admin Routes */}
        <Route path="/super-admin" element={<SuperAdminRoutes />} />
        <Route path="/super-admin/*" element={<SuperAdminRoutes />} />
        {/* Sales Routes */}
        <Route path="/sales-manager" element={<SalesManagerRoutes />} />
        <Route path="/sales-manager/*" element={<SalesManagerRoutes />} />
        <Route path="/sales-team-leader" element={<SalesTeamLeaderRoutes />} />
        <Route path="/sales-team-leader/*" element={<SalesTeamLeaderRoutes />} />
        <Route path="/sales-executive/*" element={<SalesExecutiveRoutes />} />
        {/* Management Routes */}
        <Route path="/management-manager" element={<ManagementManagerRoutes />} />
        <Route path="/management-manager/*" element={<ManagementManagerRoutes />} />
        <Route path="/management-team-leader" element={<ManagementTeamLeaderRoutes />} />
        <Route path="/management-team-leader/*" element={<ManagementTeamLeaderRoutes />} />
        <Route path="/management-employee" element={<ManagementEmployeeRoutes />} />
        <Route path="/management-employee/*" element={<ManagementEmployeeRoutes />} />
        {/* Finance Routes */}
        <Route path="/finance" element={<FinanceRoutes />} />
        <Route path="/finance/*" element={<FinanceRoutes />} />
        {/* Client Portal */}
        <Route path="/client" element={<ClientRoutes />} />
        <Route path="/client/*" element={<ClientRoutes />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
