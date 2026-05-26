import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ClientPanel from "../pages/client/ClientPanel";
import ClientProfile from "../pages/client/ClientProfile";
import ClientSupport from "../pages/client/ClientSupport";
import ClientInvoices from "../pages/client/ClientInvoices";

function ClientRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index          element={<ClientPanel />} />
        <Route path="projects" element={<ClientPanel />} />
        <Route path="support"  element={<ClientSupport />} />
        <Route path="invoices" element={<ClientInvoices />} />
        <Route path="profile"  element={<ClientProfile />} />
        <Route path="*"        element={<Navigate to="/client" replace />} />
      </Route>

    </Routes>
  );
}

export default ClientRoutes;
