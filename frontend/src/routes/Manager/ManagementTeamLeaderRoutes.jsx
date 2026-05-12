import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import HRMPage from "../../pages/management/managementTeamLeader/hrm/HRMPage";

function ManagementTeamLeaderRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<Navigate to="hrm" replace />} />
                <Route path="hrm" element={<HRMPage />} />
            </Route>
        </Routes>
    );
}

export default ManagementTeamLeaderRoutes;
