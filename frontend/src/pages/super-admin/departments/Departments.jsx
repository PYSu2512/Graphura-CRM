import React, { useState } from "react";
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Eye,
} from "lucide-react";

import {
  DashGrid,
  DashCard,
  Heading,
  GAreaChart,
  GBarChart,
  DataTable,
  Button,
  Modal,
  openModal,
  DataField,
  P,
  Grid,
} from "../../../components/shared/Common_Components.jsx";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const company = {
  name: "Nexus Technologies Pvt. Ltd.",
  logo: "https://ui-avatars.com/api/?name=Nexus+Technologies&background=2a465a&color=fff&size=80&bold=true",
  email: "contact@nexustech.io",
  phone: "+91 98765 43210",
  address: "14th Floor, Cyber Hub, Gurugram, Haryana - 122002",
  website: "https://nexustech.io",
  createdDate: "12 Jan 2022",
  plan: "Enterprise Pro",
  status: "Active",
};

const admin = {
  name: "Rahul Sharma",
  email: "rahul.sharma@nexustech.io",
  phone: "+91 99887 76655",
  lastLogin: "22 Apr 2026, 09:41 AM",
  status: "Active",
};

const salesEmployees = [
  { name: "Priya Mehta", role: "Manager", totalLeads: 210, activeLeads: 85, dumpLeads: 30, calls: 340, conversion: "40%", revenue: "₹18,50,000", missedFollowups: 4, status: "Active", date: "2026-04-10" },
  { name: "Arjun Kapoor", role: "TL", totalLeads: 160, activeLeads: 70, dumpLeads: 20, calls: 280, conversion: "43%", revenue: "₹14,20,000", missedFollowups: 2, status: "Active", date: "2026-04-11" },
  { name: "Sneha Joshi", role: "Executive", totalLeads: 95, activeLeads: 40, dumpLeads: 15, calls: 180, conversion: "42%", revenue: "₹8,80,000", missedFollowups: 6, status: "Active", date: "2026-04-12" },
  { name: "Vikram Nair", role: "Executive", totalLeads: 88, activeLeads: 32, dumpLeads: 22, calls: 150, conversion: "36%", revenue: "₹7,40,000", missedFollowups: 8, status: "Inactive", date: "2026-04-08" },
  { name: "Neha Gupta", role: "TL", totalLeads: 145, activeLeads: 60, dumpLeads: 18, calls: 260, conversion: "41%", revenue: "₹12,60,000", missedFollowups: 3, status: "Active", date: "2026-04-14" },
  { name: "Rohit Verma", role: "Executive", totalLeads: 102, activeLeads: 45, dumpLeads: 12, calls: 195, conversion: "44%", revenue: "₹9,20,000", missedFollowups: 1, status: "Active", date: "2026-04-13" },
  { name: "Ananya Singh", role: "Executive", totalLeads: 78, activeLeads: 28, dumpLeads: 20, calls: 140, conversion: "35%", revenue: "₹6,10,000", missedFollowups: 9, status: "Inactive", date: "2026-04-07" },
  { name: "Karan Bhatia", role: "Manager", totalLeads: 195, activeLeads: 80, dumpLeads: 25, calls: 310, conversion: "41%", revenue: "₹16,90,000", missedFollowups: 3, status: "Active", date: "2026-04-15" },
  { name: "Pooja Tiwari", role: "Executive", totalLeads: 91, activeLeads: 38, dumpLeads: 17, calls: 170, conversion: "41%", revenue: "₹8,30,000", missedFollowups: 5, status: "Active", date: "2026-04-09" },
  { name: "Manish Rao", role: "TL", totalLeads: 138, activeLeads: 55, dumpLeads: 21, calls: 245, conversion: "39%", revenue: "₹11,80,000", missedFollowups: 4, status: "Active", date: "2026-04-16" },
];

const projects = [
  { project: "CRM Portal Revamp", client: "Acme Corp", assignedTo: "Arjun Kapoor", startDate: "01 Feb 2026", deadline: "30 Apr 2026", status: "In Progress", progress: "72%", priority: "High", date: "2026-02-01" },
  { project: "ERP Integration", client: "Global Tech", assignedTo: "Neha Gupta", startDate: "15 Jan 2026", deadline: "15 May 2026", status: "In Progress", progress: "55%", priority: "Critical", date: "2026-01-15" },
  { project: "Mobile App v2", client: "Nexus Labs", assignedTo: "Rohit Verma", startDate: "10 Mar 2026", deadline: "10 Jun 2026", status: "In Progress", progress: "38%", priority: "Medium", date: "2026-03-10" },
  { project: "Data Migration", client: "Sunrise Retail", assignedTo: "Karan Bhatia", startDate: "05 Dec 2025", deadline: "05 Mar 2026", status: "Delayed", progress: "80%", priority: "High", date: "2025-12-05" },
  { project: "Analytics Dashboard", client: "FinTech Ltd.", assignedTo: "Priya Mehta", startDate: "20 Jan 2026", deadline: "20 Apr 2026", status: "Completed", progress: "100%", priority: "Low", date: "2026-01-20" },
  { project: "API Gateway Setup", client: "CloudBase Inc.", assignedTo: "Vikram Nair", startDate: "01 Mar 2026", deadline: "01 May 2026", status: "In Progress", progress: "45%", priority: "Medium", date: "2026-03-01" },
  { project: "Security Audit", client: "SecureNet", assignedTo: "Manish Rao", startDate: "12 Feb 2026", deadline: "12 Apr 2026", status: "Completed", progress: "100%", priority: "Critical", date: "2026-02-12" },
  { project: "Customer Portal", client: "Acme Corp", assignedTo: "Sneha Joshi", startDate: "18 Mar 2026", deadline: "18 Jul 2026", status: "In Progress", progress: "20%", priority: "High", date: "2026-03-18" },
  { project: "Payment Gateway", client: "FinTech Ltd.", assignedTo: "Pooja Tiwari", startDate: "25 Feb 2026", deadline: "25 May 2026", status: "In Progress", progress: "60%", priority: "Critical", date: "2026-02-25" },
  { project: "HR Module", client: "Global Tech", assignedTo: "Ananya Singh", startDate: "01 Apr 2026", deadline: "01 Aug 2026", status: "In Progress", progress: "15%", priority: "Low", date: "2026-04-01" },
  { project: "Inventory System", client: "Sunrise Retail", assignedTo: "Arjun Kapoor", startDate: "10 Nov 2025", deadline: "10 Feb 2026", status: "Delayed", progress: "88%", priority: "Medium", date: "2025-11-10" },
];

const financeRecords = [
  { client: "Acme Corp", project: "CRM Portal Revamp", total: "₹12,00,000", paid: "₹8,40,000", remaining: "₹3,60,000", type: "Milestone", status: "Partial", date: "2026-04-01" },
  { client: "Global Tech", project: "ERP Integration", total: "₹22,50,000", paid: "₹22,50,000", remaining: "₹0", type: "Full Payment", status: "Paid", date: "2026-03-20" },
  { client: "Nexus Labs", project: "Mobile App v2", total: "₹9,80,000", paid: "₹4,90,000", remaining: "₹4,90,000", type: "Milestone", status: "Partial", date: "2026-04-10" },
  { client: "Sunrise Retail", project: "Data Migration", total: "₹6,40,000", paid: "₹0", remaining: "₹6,40,000", type: "Post-Delivery", status: "Pending", date: "2026-03-05" },
  { client: "FinTech Ltd.", project: "Analytics Dashboard", total: "₹15,00,000", paid: "₹15,00,000", remaining: "₹0", type: "Full Payment", status: "Paid", date: "2026-04-18" },
  { client: "CloudBase Inc.", project: "API Gateway Setup", total: "₹7,20,000", paid: "₹3,60,000", remaining: "₹3,60,000", type: "Milestone", status: "Partial", date: "2026-04-05" },
  { client: "SecureNet", project: "Security Audit", total: "₹4,50,000", paid: "₹4,50,000", remaining: "₹0", type: "Full Payment", status: "Paid", date: "2026-04-12" },
  { client: "Acme Corp", project: "Customer Portal", total: "₹18,00,000", paid: "₹6,00,000", remaining: "₹12,00,000", type: "Milestone", status: "Partial", date: "2026-04-15" },
  { client: "FinTech Ltd.", project: "Payment Gateway", total: "₹11,50,000", paid: "₹5,75,000", remaining: "₹5,75,000", type: "Milestone", status: "Partial", date: "2026-04-08" },
  { client: "Global Tech", project: "HR Module", total: "₹8,00,000", paid: "₹0", remaining: "₹8,00,000", type: "Post-Delivery", status: "Pending", date: "2026-04-01" },
  { client: "Sunrise Retail", project: "Inventory System", total: "₹5,60,000", paid: "₹2,80,000", remaining: "₹2,80,000", type: "Milestone", status: "Partial", date: "2026-03-15" },
  { client: "Nexus Labs", project: "API v3", total: "₹3,20,000", paid: "₹3,20,000", remaining: "₹0", type: "Full Payment", status: "Paid", date: "2026-04-20" },
];

const revenueChartData = [
  { name: "Jan", revenue: 820000, expenses: 420000 },
  { name: "Feb", revenue: 940000, expenses: 460000 },
  { name: "Mar", revenue: 1100000, expenses: 510000 },
  { name: "Apr", revenue: 1350000, expenses: 590000 },
  { name: "May", revenue: 1200000, expenses: 550000 },
  { name: "Jun", revenue: 1480000, expenses: 620000 },
  { name: "Jul", revenue: 1600000, expenses: 680000 },
  { name: "Aug", revenue: 1720000, expenses: 700000 },
  { name: "Sep", revenue: 1850000, expenses: 740000 },
  { name: "Oct", revenue: 1990000, expenses: 790000 },
  { name: "Nov", revenue: 2100000, expenses: 820000 },
  { name: "Dec", revenue: 2380000, expenses: 870000 },
];

const deptPerformanceData = [
  { name: "Sales", target: 90, achieved: 87 },
  { name: "Management", target: 85, achieved: 80 },
  { name: "Finance", target: 95, achieved: 92 },
];

// ─── Full columns (used inside modal) ────────────────────────────────────

const salesColumnsFull = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "totalLeads", label: "Total Leads" },
  { key: "activeLeads", label: "Active Leads" },
  { key: "dumpLeads", label: "Dump Leads" },
  { key: "calls", label: "Calls" },
  { key: "conversion", label: "Conversion %" },
  { key: "revenue", label: "Revenue" },
  { key: "missedFollowups", label: "Missed Follow-ups" },
  { key: "status", label: "Status" },
];

const projectColumnsFull = [
  { key: "project", label: "Project Name" },
  { key: "client", label: "Client" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "startDate", label: "Start Date" },
  { key: "deadline", label: "Deadline" },
  { key: "status", label: "Status" },
  { key: "progress", label: "Progress %" },
  { key: "priority", label: "Priority" },
];

const financeColumnsFull = [
  { key: "client", label: "Client" },
  { key: "project", label: "Project" },
  { key: "total", label: "Total Amount" },
  { key: "paid", label: "Paid" },
  { key: "remaining", label: "Remaining" },
  { key: "type", label: "Payment Type" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
];

// ─── Simplified columns (shown on main page) ──────────────────────────────

const salesColumns = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "activeLeads", label: "Active Leads" },
  { key: "conversion", label: "Conversion %" },
  { key: "status", label: "Status" },
];

const projectColumns = [
  { key: "project", label: "Project Name" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "status", label: "Status" },
  { key: "progress", label: "Progress %" },
];

const financeColumns = [
  { key: "client", label: "Client" },
  { key: "total", label: "Total Amount" },
  { key: "remaining", label: "Remaining" },
  { key: "status", label: "Status" },
];

export default function Departments() {
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleView = (row) => {
    // Safely handling row object
    if (!row) return;
    console.log("View row:", row);
  };

  const handleDepartmentView = (type) => {
    if (!type) return;
    setSelectedDepartment(type);
    openModal("department-view-modal");
  };

  if (!company || !admin) {
    return <div className="p-8 text-center text-slate-500">Loading Departments...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-8">

      {/* ─── Page Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <Heading primaryText="Company Admin" secondaryText="Detail View" size={12} />
          <P text="Full overview of company profile, departments, and performance metrics." size="sm" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button text="Edit Company" variant="secondary" size={12} onClick={() => alert("Edit company")} />
          <Button text="Deactivate" variant="danger" size={12} onClick={() => alert("Deactivate company")} />
          <Button text="Export Data" variant="primary" size={12} onClick={() => alert("Exporting...")} />
        </div>
      </div>

      <DashGrid cols={12} gap={6}>

        {/* ─── Company Overview ──────────────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={company.logo}
                alt="Company Logo"
                className="w-16 h-16 rounded-2xl shadow-md"
              />
              <div>
                <h2 className="text-xl font-bold text-[#2a465a]">{company.name}</h2>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold ${company.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                  }`}>
                  {company.status}
                </span>
              </div>
            </div>
            <Grid cols={12} gap={4}>
              <DataField label="Company Name" id="co_name" size={6} value={company.name} disabled />
              <DataField label="Email" id="co_email" size={6} value={company.email} disabled />
              <DataField label="Phone" id="co_phone" size={4} value={company.phone} disabled />
              <DataField label="Website" id="co_website" size={4} value={company.website} disabled />
              <DataField label="Subscription Plan" id="co_plan" size={4} value={company.plan} disabled />
              <DataField label="Address" id="co_address" size={8} value={company.address} disabled />
              <DataField label="Created Date" id="co_created" size={4} value={company.createdDate} disabled />
            </Grid>
          </div>
        </div>

        {/* ─── Admin Details ────────────────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="mb-5">
              <Heading primaryText="Admin" secondaryText="Details" size={12} />
            </div>
            <Grid cols={12} gap={4}>
              <DataField label="Admin Name" id="ad_name" size={4} value={admin.name} disabled />
              <DataField label="Admin Email" id="ad_email" size={4} value={admin.email} disabled />
              <DataField label="Admin Phone" id="ad_phone" size={4} value={admin.phone} disabled />
              <DataField label="Last Login" id="ad_login" size={6} value={admin.lastLogin} disabled />
              <DataField label="Account Status" id="ad_status" size={6} value={admin.status} disabled />
            </Grid>
          </div>
        </div>

        {/* ─── Global KPI Cards ─────────────────────────────────────────────── */}
        <DashCard title="Total Leads" value="1,247" icon={<Target size={24} />} accentColor="#3b82f6" trend="+14%" size={4} />
        <DashCard title="Total Revenue" value="₹1.84Cr" icon={<DollarSign size={24} />} accentColor="#22c55e" trend="+21%" size={4} />
        <DashCard title="Total Expense" value="₹72.4L" icon={<TrendingDown size={24} />} accentColor="#f43f5e" trend="+6%" size={4} />
        <DashCard title="Net Profit" value="₹1.12Cr" icon={<TrendingUp size={24} />} accentColor="#8b5cf6" trend="+18%" size={4} />
        <DashCard title="Active Projects" value="8" icon={<Briefcase size={24} />} accentColor="#f59e0b" trend="+2" size={4} />
        <DashCard title="Total Users" value="47" icon={<Users size={24} />} accentColor="#14b8a6" trend="+5%" size={4} />

        {/* ─── Revenue Trend Chart ──────────────────────────────────────────── */}
        <GAreaChart
          title="Annual Revenue & Expense Trend"
          subtitle="Monthly breakdown for the current year"
          data={revenueChartData}
          areas={[
            { key: "revenue", label: "Revenue", color: "#3b82f6" },
            { key: "expenses", label: "Expenses", color: "#f43f5e" },
          ]}
          size={8}
          height={300}
        />

        <GBarChart
          title="Department Performance"
          subtitle="Target vs Achieved"
          data={deptPerformanceData}
          bars={[
            { key: "target", label: "Target", color: "#94a3b8" },
            { key: "achieved", label: "Achieved", color: "#2a465a" },
          ]}
          size={4}
          height={300}
        />

        {/* ─── Sales Summary Cards ──────────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="mb-4">
            <Heading primaryText="Sales" secondaryText="Summary" size={12} />
          </div>
        </div>
        <DashCard title="Total Leads" value="1,247" icon={<Target size={22} />} accentColor="#22c55e" size={3} />
        <DashCard title="Active Leads" value="533" icon={<Activity size={22} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Dump Leads" value="200" icon={<AlertCircle size={22} />} accentColor="#f43f5e" size={3} />
        <DashCard title="Conversion Rate" value="42.7%" icon={<TrendingUp size={22} />} accentColor="#8b5cf6" size={3} />

        {/* ─── Management Summary Cards ─────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="mb-4">
            <Heading primaryText="Management" secondaryText="Summary" size={12} />
          </div>
        </div>
        <DashCard title="Total Projects" value="11" icon={<Briefcase size={22} />} accentColor="#f59e0b" size={3} />
        <DashCard title="In Progress" value="7" icon={<Clock size={22} />} accentColor="#3b82f6" size={3} />
        <DashCard title="Completed" value="2" icon={<CheckCircle size={22} />} accentColor="#22c55e" size={3} />
        <DashCard title="Delayed" value="2" icon={<AlertCircle size={22} />} accentColor="#f43f5e" size={3} />

        {/* ─── Finance Summary Cards ────────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="mb-4">
            <Heading primaryText="Finance" secondaryText="Summary" size={12} />
          </div>
        </div>
        <DashCard title="Total Revenue" value="₹1.24Cr" icon={<DollarSign size={22} />} accentColor="#22c55e" size={3} />
        <DashCard title="Pending Payments" value="₹38.5L" icon={<Clock size={22} />} accentColor="#f59e0b" size={3} />
        <DashCard title="Expenses" value="₹72.4L" icon={<CreditCard size={22} />} accentColor="#f43f5e" size={3} />
        <DashCard title="Net Profit" value="₹1.12Cr" icon={<TrendingUp size={22} />} accentColor="#8b5cf6" size={3} />

        {/* ─── Sales Department Table ───────────────────────────────────────── */}
        <div className="col-span-12 flex justify-end">
          <Button
            text="View Sales"
            variant="primary"
            size={12}
            onClick={() => handleDepartmentView("sales")}
          />
        </div>
        <DataTable
          title="Sales Department"
          columns={salesColumns}
          rows={salesEmployees}
          size={12}
          pageSize={5}
          searchable={true}
          date={false}
          actions={[
            {
              icon: <Eye size={14} />,
              tooltip: "View",
              variant: "ghost",
              onClick: (row) => handleView(row),
            },
          ]}
          filters={[
            {
              title: "Role",
              key: "role",
              type: "toggle",
              options: ["Manager", "TL", "Executive"],
            },
            {
              title: "Status",
              key: "status",
              type: "toggle",
              options: ["Active", "Inactive"],
            },
          ]}
        />

        {/* ─── Project Management Table ─────────────────────────────────────── */}
        <div className="col-span-12 flex justify-end">
          <Button
            text="View Management"
            variant="primary"
            size={12}
            onClick={() => handleDepartmentView("management")}
          />
        </div>
        <DataTable
          title="Project Management"
          columns={projectColumns}
          rows={projects}
          size={12}
          pageSize={5}
          searchable={true}
          date={true}
          actions={[
            {
              icon: <Eye size={14} />,
              tooltip: "View",
              variant: "ghost",
              onClick: (row) => handleView(row),
            },
          ]}
          filters={[
            {
              title: "Status",
              key: "status",
              type: "toggle",
              options: ["In Progress", "Completed", "Delayed"],
            },
            {
              title: "Priority",
              key: "priority",
              type: "toggle",
              options: ["Low", "Medium", "High", "Critical"],
            },
          ]}
        />

        {/* ─── Finance Table ────────────────────────────────────────────────── */}
        <div className="col-span-12 flex justify-end">
          <Button
            text="View Finance"
            variant="primary"
            size={12}
            onClick={() => handleDepartmentView("finance")}
          />
        </div>
        <DataTable
          title="Finance & Payments"
          columns={financeColumns}
          rows={financeRecords}
          size={12}
          pageSize={5}
          searchable={true}
          date={true}
          actions={[
            {
              icon: <Eye size={14} />,
              tooltip: "View",
              variant: "ghost",
              onClick: (row) => handleView(row),
            },
          ]}
          filters={[
            {
              title: "Status",
              key: "status",
              type: "toggle",
              options: ["Paid", "Partial", "Pending"],
            },
            {
              title: "Payment Type",
              key: "type",
              type: "toggle",
              options: ["Milestone", "Full Payment", "Post-Delivery"],
            },
          ]}
        />
      </DashGrid>

      {/* ─── Department View Modal ───────────────────────────────────────────── */}
      <Modal
        id="department-view-modal"
        title={
          selectedDepartment === "sales"
            ? "Sales Department — Full View"
            : selectedDepartment === "management"
              ? "Management Department — Full View"
              : selectedDepartment === "finance"
                ? "Finance Department — Full View"
                : "Department View"
        }
        size="xl"
      >
        {selectedDepartment === "sales" && (
          <DataTable
            title="Sales Department"
            columns={salesColumnsFull}
            rows={salesEmployees}
            size={12}
            pageSize={10}
            searchable={true}
            date={false}
            filters={[
              { title: "Role", key: "role", type: "toggle", options: ["Manager", "TL", "Executive"] },
              { title: "Status", key: "status", type: "toggle", options: ["Active", "Inactive"] },
            ]}
          />
        )}
        {selectedDepartment === "management" && (
          <DataTable
            title="Project Management"
            columns={projectColumnsFull}
            rows={projects}
            size={12}
            pageSize={10}
            searchable={true}
            date={true}
            filters={[
              { title: "Status", key: "status", type: "toggle", options: ["In Progress", "Completed", "Delayed"] },
              { title: "Priority", key: "priority", type: "toggle", options: ["Low", "Medium", "High", "Critical"] },
            ]}
          />
        )}
        {selectedDepartment === "finance" && (
          <DataTable
            title="Finance & Payments"
            columns={financeColumnsFull}
            rows={financeRecords}
            size={12}
            pageSize={10}
            searchable={true}
            date={true}
            filters={[
              { title: "Status", key: "status", type: "toggle", options: ["Paid", "Partial", "Pending"] },
              { title: "Payment Type", key: "type", type: "toggle", options: ["Milestone", "Full Payment", "Post-Delivery"] },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}