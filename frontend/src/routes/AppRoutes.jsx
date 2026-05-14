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
import ManagementEmployeeRoutes from "./Manager/ManagementEmployeeRouter";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Authentication Pages */}
        <Route path="/super-admin-login" element={<SuperAdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/login" element={<DepartmentLogin />} />
        <Route path="/department/*" element={<DepartmentWorkspace />} />
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        {/* Super_Admin Routes */}
        <Route path="/super-admin/*" element={<SuperAdminRoutes />} />
        {/* Sales Routes */}
        <Route path="/sales-manager/*" element={<SalesManagerRoutes />} />
        <Route path="/sales-team-leader/*" element={<SalesTeamLeaderRoutes />} />
        <Route path="/sales-executive/*" element={<SalesExecutiveRoutes />} />
        {/* Sales Routes */}
        <Route path="/management-manager/*" element={<ManagementManagerRoutes />} />
        <Route path="/management-team-leader/*" element={<ManagementTeamLeaderRoutes />} />
        <Route path="/management-employee/*" element={<ManagementEmployeeRoutes />} />
        {/* Finance Routes */}
        <Route path="/finance/*" element={<FinanceRoutes />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
