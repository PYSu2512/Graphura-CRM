import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import SalesExecutiveDashboard from "../../pages/sales/salesExecutive/SalesExecutiveDashboard";
import ProspectList from "../../pages/sales/salesExecutive/ProspectList";
import EditProspect from "../../pages/sales/salesExecutive/EditProspect";
import LeadsLayout from "../../pages/sales/salesExecutive/leads/LeadsLayout";
import LeadsPage from "../../pages/sales/salesExecutive/leads/LeadsPage";
import FollowUpsPage from "../../pages/sales/salesExecutive/leads/FollowUpsPage";
import ProspectLeadsPage from "../../pages/sales/salesExecutive/leads/ProspectLeadsPage";
import DumpDataPage from "../../pages/sales/salesExecutive/dumpData/DumpDataPage";
import PaymentsPage from "../../pages/sales/salesExecutive/payments/PaymentsPage";
import HRMLayout from "../../pages/sales/salesExecutive/hrm/HrmLayout";
import LoginLogs from "../../pages/sales/salesExecutive/LoginLogs/LoginLogs";
import Support from "../../pages/sales/salesExecutive/Support/Support";

function SalesExecutiveRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<SalesExecutiveDashboard />} />
                <Route path="prospects" element={<ProspectList />} />
                <Route path="edit-prospect/:id" element={<EditProspect />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="hrm" element={<HRMLayout />} />
                <Route path="login-logs" element={<LoginLogs />} />
                <Route path="support" element={<Support />} />
                <Route path="leads" element={<LeadsLayout />}>
                    <Route index element={<Navigate to="all" replace />} />
                    <Route path="all" element={<LeadsPage />} />
                    <Route path="follow-ups" element={<FollowUpsPage />} />
                    <Route path="prospects" element={<ProspectLeadsPage />} />
                    <Route path="dump" element={<DumpDataPage />} />
                </Route>
                <Route path="dump" element={<Navigate to="leads/dump" replace />} />
            </Route>
        </Routes>
    );
}

export default SalesExecutiveRoutes;
