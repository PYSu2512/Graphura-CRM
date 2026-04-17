import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
// updated sidebar UI

function Sidebar() {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItem = (name, path) => (
    <Link
      to={path}
      className={`block text-center py-2.5 rounded-lg text-sm transition
      ${
        isActive(path)
          ? "bg-[#3b5c77] text-white font-medium"
          : "text-gray-300 hover:bg-[#3b5c77]/60"
      }`}
    >
      {name}
    </Link>
  );

  return (
    <div className="h-full w-full bg-[#2f4b63] text-white flex flex-col">

      {/* Header */}
      <div className="text-center py-6 border-b border-white/10">
        <h1 className="text-lg font-semibold">CRM Panel</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col items-center">

        {/* Modules */}
        <div className="mb-10 w-full text-center">
          <p className="text-[11px] text-gray-400 uppercase mb-6 tracking-widest">
            Modules
          </p>

          <div className="flex flex-col gap-6 text-gray-300">
            <div className="hover:text-white cursor-pointer">Admin</div>
            <div className="hover:text-white cursor-pointer">Auth</div>
            <div className="hover:text-white cursor-pointer">Client</div>
            <div className="hover:text-white cursor-pointer">Finance</div>
            <div className="hover:text-white cursor-pointer">Management</div>
            <div className="hover:text-white cursor-pointer">Sales</div>
          </div>
        </div>

        {/* Super Admin */}
        <div className="w-[85%]">
          <p className="text-[11px] text-gray-400 uppercase mb-4 text-center">
            Super Admin
          </p>

          <button
            onClick={() => setOpen(!open)}
            className="w-full bg-[#3f627d] py-2.5 rounded-lg text-sm hover:bg-[#4a6f8c] transition"
          >
            Controls
          </button>

          {open && (
            <div className="mt-4 flex flex-col gap-2">
              {menuItem("Dashboard", "/super-admin/dashboard")}
              {menuItem("Admins", "/super-admin/admins")}
              {menuItem("Departments", "/super-admin/departments")}
              {menuItem("Billing", "/super-admin/billing")}
              {menuItem("Communication", "/super-admin/communication")}
              {menuItem("Login Logs", "/super-admin/login-logs")}
              {menuItem("Support", "/super-admin/support")}
              {menuItem("API Config", "/super-admin/api-config")}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-white/10 text-xs text-gray-400">
        CRM v1.0
      </div>
    </div>
  );
}

export default Sidebar;