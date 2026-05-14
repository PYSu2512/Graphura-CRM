import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

function ManagementEmployeeRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<ManagementEmployeeDashboard />} />
            </Route>
        </Routes>
    );
}

export default ManagementEmployeeRoutes;
