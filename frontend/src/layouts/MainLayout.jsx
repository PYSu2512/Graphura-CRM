import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F8F0] overflow-hidden">

      {/* Overlay (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static z-40 h-full w-64 shadow-lg transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 transition-transform duration-300`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-3">
          <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 min-h-full">

            {/* 🔥 Page content */}
            <Outlet />

          </div>
        </div>

      </div>
    </div>
  );
}

export default MainLayout;