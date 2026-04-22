import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import GlobalCallModal from "../components/shared/GlobalCallModal";

function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsCollapsed(true);
    const handleClose = () => setIsCollapsed(false);
    window.addEventListener("open-modal", handleOpen);
    window.addEventListener("open-global-call", handleOpen);
    window.addEventListener("expand-table", handleOpen);
    window.addEventListener("close-modal", handleClose);
    window.addEventListener("collapse-table", handleClose);
    return () => {
      window.removeEventListener("open-modal", handleOpen);
      window.removeEventListener("open-global-call", handleOpen);
      window.removeEventListener("expand-table", handleOpen);
      window.removeEventListener("close-modal", handleClose);
      window.removeEventListener("collapse-table", handleClose);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#f7f8f0_40%,_#eef4f7_100%)]">
      {/* Overlay (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-40 h-full shadow-lg md:static flex-shrink-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-20" : "w-64"}
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0`}
      >
        <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navbar */}
        <div className="border-b border-white/60 bg-white/45 px-4 py-2 shadow-sm backdrop-blur md:px-6">
          <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />
        </div>

        {/* Page Content */}
        <div className="mx-auto flex-1 w-full max-w-7xl overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <div className="min-h-full rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.88)_0%,_rgba(250,252,253,0.96)_100%)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
      <GlobalCallModal />
    </div>
  );
}

export default MainLayout;
