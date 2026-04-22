import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminRoutes from "./adminRoutes";
import SuperAdminRoutes from "./superAdminRoutes";
import AdminLogin from "../pages/auth/AdminLogin";
import AdminRegister from "../pages/auth/AdminRegister";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Pages */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<AdminRegister />} />
        {/* Admin Routes */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
        {/* Super_Admin Routes */}
        <Route path="/super-admin/*" element={<SuperAdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
