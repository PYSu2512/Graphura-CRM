import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/admin/Dashboard";
import Projects from "../pages/admin/Projects";
import FinanceDashboard from "../pages/admin/FinanceDashboard";
import HRMDashboard from "../pages/admin/HRMDashboard";
import Support from "../pages/admin/Support";
import Report from "../pages/admin/Report";

// ── User Management ──
import UserManagement from "../pages/admin/UserManagement";
import AllUsers from "../pages/admin/user-management/AllUsers";
import RolesPermissions from "../pages/admin/user-management/RolesPermissions";
import UserApprovals from "../pages/admin/user-management/UserApprovals";
import LoginLogs from "../pages/admin/user-management/LoginLogs";

// ── Leads ──
import Leads from "../pages/admin/Leads";
import AllLeads from "../pages/admin/leads/AllLeads";
import Prospects from "../pages/admin/leads/Prospects";
import FollowUps from "../pages/admin/leads/FollowUps";
import BulkUpload from "../pages/admin/leads/BulkUpload";
import LeadDistribution from "../pages/admin/leads/LeadDistribution";
import DumpData from "../pages/admin/leads/DumpData";

// ── Sales ──
import Sales from "../pages/admin/Sales";
import Analytics from "../pages/admin/sales/Analytics";
import Pipeline from "../pages/admin/sales/Pipeline";
import Targets from "../pages/admin/sales/Targets";
import CallPanel from "../pages/admin/sales/CallPanel";
import Tickets from "../pages/admin/sales/Tickets";

const pageContent = {
  "Leads & Sales": {
    eyebrow: "Revenue Pipeline",
    summary:
      "Monitor lead flow, deal movement, and follow-up coverage across the sales organization.",
    stats: [
      { label: "New Leads", value: "86" },
      { label: "Qualified", value: "31" },
      { label: "Won Deals", value: "14" },
    ],
  },
  Leads: {
    eyebrow: "Lead Management",
    summary:
      "Track incoming leads, qualify prospects, and manage your entire lead pipeline efficiently.",
    stats: [
      { label: "New Leads", value: "86" },
      { label: "Contacted", value: "54" },
      { label: "Qualified", value: "31" },
    ],
  },
  Sales: {
    eyebrow: "Sales Analytics",
    summary:
      "Analyze sales performance, track revenue targets, and monitor team achievements.",
    stats: [
      { label: "Won Deals", value: "14" },
      { label: "Revenue", value: "₹18.5L" },
      { label: "Avg Deal Size", value: "₹1.3L" },
    ],
  },
  System: {
    eyebrow: "Platform Health",
    summary:
      "Watch system usage, configuration updates, security events, and maintenance readiness.",
    stats: [
      { label: "Live Services", value: "12" },
      { label: "Alerts", value: "3" },
      { label: "Backups", value: "100%" },
    ],
  },
};

function Page({ name }) {
  const content = pageContent[name] ?? {
    eyebrow: "Admin Module",
    summary: "This section is ready for its detailed admin workflow and reporting surface.",
    stats: [
      { label: "Overview", value: "01" },
      { label: "Pending", value: "00" },
      { label: "Updated", value: "Today" },
    ],
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#d9e6ef] bg-[linear-gradient(135deg,_#355872_0%,_#436b88_58%,_#fff8ef_100%)] px-6 py-7 text-white shadow-[0_22px_50px_rgba(53,88,114,0.14)] lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ffd2a8]">
          {content.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight lg:text-4xl">{name}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/90">
          {content.summary}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {content.stats.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-[#dfe9ef] bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#355872]">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-[#dfe9ef] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c77727]">
            Overview
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#355872]">{name} workspace</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-[#f5f9fb] p-4">
              <p className="text-sm font-medium text-slate-800">Primary View</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Core reporting, filters, and day-to-day admin actions for the{" "}
                {name.toLowerCase()} section can be expanded here.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f5f9fb] p-4">
              <p className="text-sm font-medium text-slate-800">Recent Activity</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Live changes, assignments, approvals, or system events can be surfaced in this panel.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#dfe9ef] bg-[#355872] p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffd2a8]">
            Quick Notes
          </p>
          <h2 className="mt-1 text-xl font-semibold">Module ready for expansion</h2>
          <p className="mt-4 text-sm leading-6 text-slate-200">
            This screen now has a proper visible admin output instead of a nearly blank placeholder,
            so navigation feels consistent with the richer HRM, Finance, Support, and Reports modules.
          </p>
        </div>
      </section>
    </div>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />

        {/* ── User Management (5 tabs) ── */}
        <Route path="users" element={<UserManagement />}>
          <Route index element={<Navigate to="all" replace />} />
          <Route path="all" element={<AllUsers />} />
          <Route path="roles" element={<RolesPermissions />} />
          <Route path="approvals" element={<UserApprovals />} />
          <Route path="logs" element={<LoginLogs />} />
        </Route>

        {/* ── Leads (5 tabs) ── */}
        <Route path="leads" element={<Leads />}>
          <Route index element={<Navigate to="all" replace />} />
          <Route path="all" element={<AllLeads />} />
          <Route path="prospects" element={<Prospects />} />
          <Route path="followups" element={<FollowUps />} />
          <Route path="bulk" element={<BulkUpload />} />
          <Route path="distribution" element={<LeadDistribution />} />
          <Route path="dump" element={<DumpData />} />
        </Route>

        {/* ── Sales (5 tabs) ── */}
        <Route path="sales" element={<Sales />}>
          <Route index element={<Navigate to="analytics" replace />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="targets" element={<Targets />} />
          <Route path="calls" element={<CallPanel />} />
          <Route path="tickets" element={<Tickets />} />
        </Route>

        <Route path="projects" element={<Projects />} />
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="hrm" element={<HRMDashboard />} />
        <Route path="support" element={<Support />} />
        <Route path="reports" element={<Report />} />
        <Route path="system" element={<Page name="System" />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
