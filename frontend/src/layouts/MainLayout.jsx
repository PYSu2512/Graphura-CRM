import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { useState, memo, useCallback } from "react";
import GlobalCallModal from "../components/shared/GlobalCallModal";
import { AttendanceProvider } from "../context/AttendanceContext";

const MemoNavbar = memo(Navbar);

function MainLayout() {
  // Desktop: expand (w-64) vs collapse (w-14 icon rail)
  const [expanded, setExpanded] = useState(true);

  // Mobile/Tablet: drawer open vs closed
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDesktop  = useCallback(() => setExpanded((v) => !v), []);
  const expandDesktop  = useCallback(() => setExpanded(true), []);
  const openMobile     = useCallback(() => setMobileOpen(true), []);
  const closeMobile    = useCallback(() => setMobileOpen(false), []);

  // Called by Navbar toggle button — opens drawer on mobile, toggles rail on desktop
  const handleToggle = useCallback(() => {
    // We can't read window.innerWidth in a callback reliably across SSR,
    // so we pass both handlers and let each breakpoint's element call the right one.
    // Instead, MainLayout passes separate handlers to Navbar.
    toggleDesktop();
    openMobile();
  }, [toggleDesktop, openMobile]);

  return (
    <AttendanceProvider>
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#f7f8f0_40%,_#eef4f7_100%)]">

      {/* ── Mobile/Tablet backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────
          DESKTOP (lg+): always in flow, width animates between 256px / 56px
          MOBILE/TABLET (<lg): fixed drawer, slides in from left
          ──────────────────────────────────────────────────────────────────── */}

      {/* Desktop rail — hidden on mobile */}
      <div
        className="hidden lg:block flex-shrink-0 h-full overflow-hidden"
        style={{
          width: expanded ? "240px" : "58px",
          transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "width",
        }}
      >
        <Sidebar expanded={expanded} onExpand={expandDesktop} onNavClick={null} />
      </div>

      {/* Mobile/Tablet drawer — hidden on desktop */}
      <div
        className={`lg:hidden fixed left-0 top-0 z-40 h-full w-72 shadow-2xl
          transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar expanded={true} onExpand={null} onNavClick={closeMobile} />
      </div>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        <div className="border-b border-white/60 bg-white/45 px-4 py-2 shadow-sm backdrop-blur md:px-6">
          <MemoNavbar
            onToggleDesktop={toggleDesktop}
            onToggleMobile={openMobile}
          />
        </div>

        <div className="flex-1 w-full overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <div className="min-h-full rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.88)_0%,_rgba(250,252,253,0.96)_100%)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
            <Outlet />
          </div>
        </div>
      </div>

      <GlobalCallModal />
    </div>
    </AttendanceProvider>
  );
}

export default MainLayout;
