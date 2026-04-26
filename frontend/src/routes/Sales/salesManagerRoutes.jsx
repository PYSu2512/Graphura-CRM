import { Routes, Route, Navigate } from "react-router-dom";
import SalesManagerDashboard from "../../pages/sales/salesManager/Dashboard";
import MainLayout from "../../layouts/MainLayout";
import SalesManagerLeads from "../../pages/sales/salesManager/Leads";
import SalesTeamLeaders from "../../pages/sales/salesManager/TeamLeader";

function SalesManagerRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<SalesManagerDashboard />} />
        <Route path="leads" element={<SalesManagerLeads />} />
        <Route path="team-leader" element={<SalesTeamLeaders />} />
      </Route>
    </Routes>
  );
}

export default SalesManagerRoutes;