import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import SalesManagerDashboard from "../../pages/sales/salesManager/Dashboard";
import SalesTeams from "../../pages/sales/salesManager/Teams";

// Leads section — layout + sub-pages
import LeadsLayout from "../../pages/sales/salesManager/leads/LeadsLayout";
import AllLeads from "../../pages/sales/salesManager/leads/AllLeads";
import Prospects from "../../pages/sales/salesManager/leads/Prospects";
import FollowUps from "../../pages/sales/salesManager/leads/FollowUps";
import BulkUpload from "../../pages/sales/salesManager/leads/BulkUpload";
import DumpData from "../../pages/sales/salesManager/leads/DumpData";
import PerformanceLayout from "../../pages/sales/salesManager/perfomance/PerfomanceLayout";
import SupportLayout from "../../pages/sales/salesManager/Support/SupportLayout";
import HRMLayout from "../../pages/sales/salesManager/HRM/HrmLayout";
import LoginLogs from "../../pages/sales/salesManager/LoginLogs/LoginLogs";
import ReportLayout from "../../pages/sales/salesManager/Reports/ReportLayout";
import AnnouncementLayout from "../../pages/sales/salesManager/Announcements/AnnouncementLayout";
import Employees from "../../pages/sales/salesManager/Employees/Employees";
import SalesManagerProfile from "../../pages/sales/salesManager/SalesManagerProfile";

function SalesManagerRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<SalesManagerDashboard />} />
        <Route path="teams" element={<SalesTeams/>} />

        {/* Leads section — nested under /sales-manager/leads */}
        <Route path="leads" element={<LeadsLayout />}>
          <Route index element={<AllLeads />} />
          <Route path="prospects" element={<Prospects />} />
          <Route path="follow-ups" element={<FollowUps />} />
          <Route path="bulk-upload" element={<BulkUpload />} />
          <Route path="dump" element={<DumpData />} />
        </Route>
        <Route path="performance" element={<PerformanceLayout />} />

        {/* Support — /sales-manager/support */}
        <Route path="support" element={<SupportLayout />} />

        {/* HRM — /sales-manager/hrm */}
        <Route path="hrm" element={<HRMLayout />} />

        {/* Communication — /sales-manager/communication */}
        <Route path="announcements" element={<AnnouncementLayout />} />

        {/* Login Logs — /sales-manager/logs */}
        <Route path="logs" element={<LoginLogs />} />

        {/* Employees — /sales-manager/employees */}
        <Route path="employees" element={<Employees />} />
        <Route path="profile" element={<SalesManagerProfile />} />

        {/* Reports — /sales-manager/reports */}
        <Route path="reports" element={<ReportLayout />} />
      </Route>
    </Routes>
  );
}

export default SalesManagerRoutes;
