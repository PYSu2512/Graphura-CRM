import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

function ManagementEmployeeDashboard() {
    return <div className="p-4 text-slate-500">Management Employee Dashboard (Coming Soon)</div>;
}

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
