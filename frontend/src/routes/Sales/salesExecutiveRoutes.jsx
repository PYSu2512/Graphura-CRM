import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import SalesExecutiveDashboard from "../../pages/sales/salesExecutive/SalesExecutiveDashboard";
import LeadsLayout from "../../pages/sales/salesExecutive/leads/LeadsLayout";
import LeadsPage from "../../pages/sales/salesExecutive/leads/LeadsPage";
import DumpDataPage from "../../pages/sales/salesExecutive/dumpData/DumpDataPage";

function SalesExecutiveRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<SalesExecutiveDashboard />} />
        <Route path="leads" element={<LeadsLayout />}>
          <Route index element={<LeadsPage />} />
          <Route path="dump" element={<DumpDataPage />} />
        </Route>
        <Route path="dump" element={<Navigate to="leads/dump" replace />} />
      </Route>
    </Routes>
  );
}

export default SalesExecutiveRoutes;
