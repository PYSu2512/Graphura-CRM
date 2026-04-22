import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/super-admin/dashboard/Dashboard";
import Admins from "../pages/super-admin/admins/Admins";
import Departments from "../pages/super-admin/departments/Departments";
import Billing from "../pages/super-admin/billing/Billing";
import Communication from "../pages/super-admin/communication/Communication";
import Support from "../pages/super-admin/support/Support";
import ApiConfig from "../pages/super-admin/api-config/ApiConfig";
import LoginLogs from "../pages/super-admin/login-logs/LoginLogs";
import DataManagement from "../pages/super-admin/data-management/DataManagement";

const pageContent = {
  Dashboard: {
    eyebrow: "System Overview",
    summary:
      "Monitor platform-wide activity, admin performance, system health, and key operational insights in one place.",
    stats: [
      { label: "Total Admins", value: "24" },
      { label: "Active Sessions", value: "132" },
      { label: "System Alerts", value: "3" },
    ],
  },

  Admins: {
    eyebrow: "Admin Control",
    summary:
      "Manage admin accounts, assign roles, monitor activity logs, and control access across the platform.",
    stats: [
      { label: "Total Admins", value: "24" },
      { label: "Active", value: "18" },
      { label: "Pending Requests", value: "5" },
    ],
  },

  Departments: {
    eyebrow: "Organization Structure",
    summary:
      "Create and manage departments, assign admins, and maintain organizational hierarchy efficiently.",
    stats: [
      { label: "Departments", value: "12" },
      { label: "Assigned Heads", value: "10" },
      { label: "Open Roles", value: "4" },
    ],
  },

  Billing: {
    eyebrow: "Financial Control",
    summary:
      "Track subscriptions, monitor payments, manage invoices, and oversee financial operations.",
    stats: [
      { label: "Revenue", value: "₹1.2L" },
      { label: "Pending Payments", value: "8" },
      { label: "Invoices", value: "56" },
    ],
  },

  Settings: {
    eyebrow: "System Configuration",
    summary:
      "Configure platform settings, manage integrations, security policies, and system preferences.",
    stats: [
      { label: "Configurations", value: "15" },
      { label: "Active Policies", value: "6" },
      { label: "Updates", value: "2" },
    ],
  },
};

function Page({ name }) {
  const content = pageContent[name] ?? {
    eyebrow: "Super Admin Module",
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

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="admins" element={<Admins />} />
        <Route path="departments" element={<Departments />} />
        <Route path="billing" element={<Billing />} />
        <Route path="communication" element={<Communication />} />
        <Route path="login-logs" element={<LoginLogs />} />
        <Route path="support" element={<Support />} />
        <Route path="api-config" element={<ApiConfig />} />
        <Route path="data-management" element={<DataManagement />} />
      </Route>
    </Routes>
  );
}

export default SuperAdminRoutes;
