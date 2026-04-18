import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminRoutes from "./adminRoutes";
// import SuperAdminRoutes from "./superAdminRoutes"; ❌ abhi use nahi kar rahe

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default → Admin */}
        <Route path="/" element={<Navigate to="/admin" />} />

        {/* Admin Panel */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Super Admin (future use) */}
        {/* <Route path="/super-admin/*" element={<SuperAdminRoutes />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;