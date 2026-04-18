import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/admin/Dashboard";

function Page({ name }) {
  return <h1 className="text-xl p-5">{name}</h1>;
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Pages */}
        <Route path="users" element={<Page name="User Management" />} />
        <Route path="leads" element={<Page name="Leads & Sales" />} />
        <Route path="projects" element={<Page name="Projects" />} />
        <Route path="finance" element={<Page name="Finance" />} />
        <Route path="hrm" element={<Page name="HRM" />} />
        <Route path="support" element={<Page name="Support" />} />
        <Route path="reports" element={<Page name="Reports" />} />
        <Route path="system" element={<Page name="System" />} />

      </Route>
    </Routes>
  );
}

export default AdminRoutes;