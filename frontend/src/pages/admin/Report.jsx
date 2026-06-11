/**
 * Report.jsx — Admin Reports & Management
 * All data from GET /api/admin/reports?period=weekly|monthly|yearly
 */

import { useState, useEffect, useCallback } from "react";
import {
  Building2, Users, UserCheck, DollarSign, Target, Activity,
  AlertCircle, Briefcase, Clock, CheckCircle, CreditCard,
  TrendingUp, Eye, Calendar, RefreshCw,
} from "lucide-react";
import {
  DashGrid, EnhancedDashCard, DataTable, Heading, P,
  PanelModal as Modal, openModal, closeModal,
  GAreaChart, GBarChart, GPieChart, Button,
} from "../../components/shared/Common_Components";
import apiClient from "../../services/apiClient";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtINR = (val = 0) => {
  const abs = Math.abs(val);
  let s = abs >= 10000000 ? `₹${(abs / 10000000).toFixed(2)}Cr`
        : abs >= 100000   ? `₹${(abs / 100000).toFixed(2)}L`
        : `₹${abs.toLocaleString("en-IN")}`;
  return val < 0 ? `-${s}` : s;
};

const SALES_LEAD_COLORS = ["#3b82f6","#f59e0b","#94a3b8","#f43f5e","#ec4899"];

const projectColumns = [
  { key:"project",    label:"Project Name" },
  { key:"client",     label:"Client"       },
  { key:"assignedTo", label:"Assigned To"  },
  { key:"startDate",  label:"Start Date"   },
  { key:"deadline",   label:"Deadline"     },
  { key:"status",     label:"Status"       },
  { key:"progress",   label:"Progress %"   },
  { key:"priority",   label:"Priority"     },
];

const financeColumns = [
  { key:"client",    label:"Client"       },
  { key:"project",   label:"Project"      },
  { key:"invoiceId", label:"Invoice #"    },
  { key:"total",     label:"Total Amount" },
  { key:"paid",      label:"Paid"         },
  { key:"remaining", label:"Remaining"    },
  { key:"type",      label:"Type"         },
  { key:"status",    label:"Status"       },
  { key:"date",      label:"Date"         },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Report() {
  const [period,  setPeriod]  = useState("monthly");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const [selProject, setSelProject] = useState(null);
  const [selFinance, setSelFinance] = useState(null);

  const fetchReports = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/reports?period=${p}`);
      setData(res.data?.data || null);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(period); }, [period, fetchReports]);

  const kpis        = data?.kpis              || {};
  const revenueTrend= data?.revenueTrend       || [];
  const payTrend    = data?.paymentTrend       || [];
  const deptRev     = data?.deptRevData        || [];
  const leadPie     = data?.leadPieData        || [];
  const leadConv    = data?.leadConversionTrend|| [];
  const projComp    = data?.projCompletionTrend|| [];
  const projStats   = data?.projStats          || {};
  const leadStats   = data?.leadStats          || {};
  const projectRows = data?.projectRows        || [];
  const financeRows = data?.financeRows        || [];

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="space-y-6">
      <Heading primaryText="Reports &amp;" secondaryText="Management" size={12} />

      {/* Global KPI cards */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Total Departments" value={loading ? "—" : String(kpis.totalDepts  ?? 0)} icon={<Building2 size={22}/>}  accentColor="#38bdf8" size={3} />
        <EnhancedDashCard title="Total Users"       value={loading ? "—" : String(kpis.totalUsers  ?? 0)} icon={<Users size={22}/>}      accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Active Users"      value={loading ? "—" : String(kpis.activeUsers ?? 0)} icon={<UserCheck size={22}/>}  accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Total Revenue"     value={loading ? "—" : fmtINR(kpis.totalRevenue)}     icon={<DollarSign size={22}/> } accentColor="#8b5cf6" size={3} />
      </DashGrid>

      {/* Period filter */}
      <div className="flex justify-end">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar size={18} className="text-slate-500" />
          <div className="flex gap-2">
            {["weekly","monthly","yearly"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                  period === p ? "bg-[#2a465a] text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>{cap(p)}</button>
            ))}
          </div>
          <button onClick={() => fetchReports(period)}
            className="ml-1 p-1.5 rounded-lg text-slate-500 hover:text-[#2a465a] hover:bg-slate-100 transition">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Charts row 1 */}
      <DashGrid cols={12} gap={4}>
        <GAreaChart title="Revenue & Expense Trend" subtitle={`${cap(period)} breakdown`}
          data={revenueTrend}
          areas={[
            { key:"revenue",  label:"Revenue",  color:"#3b82f6" },
            { key:"expenses", label:"Expenses", color:"#f43f5e" },
          ]}
          size={8} height={300} />
        <GBarChart title="Department Revenue Distribution" subtitle={`${cap(period)} breakdown`}
          data={deptRev}
          bars={[{ key:"value", label:"Revenue", color:"#3b82f6" }]}
          size={4} height={300} />
        <GBarChart title="Project Completion Status" subtitle={`${cap(period)} breakdown`}
          data={projComp}
          bars={[
            { key:"completed",  label:"Completed",   color:"#22c55e" },
            { key:"inProgress", label:"In Progress", color:"#3b82f6" },
            { key:"delayed",    label:"Delayed",     color:"#f43f5e" },
          ]}
          size={6} height={300} />
        <GAreaChart title="Payment Collection Analysis" subtitle={`${cap(period)} breakdown`}
          data={payTrend}
          areas={[
            { key:"collected", label:"Collected", color:"#22c55e" },
            { key:"pending",   label:"Pending",   color:"#f59e0b" },
          ]}
          size={6} height={300} />
      </DashGrid>

      {/* ── Sales Department ── */}
      <DashGrid cols={12} gap={4}>
        <div className="col-span-12"><Heading primaryText="Sales" secondaryText="Department" size={12} /></div>
        <EnhancedDashCard title="Total Leads"     value={loading ? "—" : String(leadStats.total       ?? 0)} icon={<Target size={22}/>}      accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Interested"      value={loading ? "—" : String(leadStats.interested  ?? 0)} icon={<Activity size={22}/>}     accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Not Interested"  value={loading ? "—" : String(leadStats.notInterested ?? 0)} icon={<AlertCircle size={22}/>} accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Dump Data"       value={loading ? "—" : String(leadStats.dump        ?? 0)} icon={<AlertCircle size={22}/>}  accentColor="#ec4899" size={3} />
      </DashGrid>
      <DashGrid cols={12} gap={4}>
        <GPieChart title="Sales Leads Segments" subtitle="Breakdown by lead status"
          data={leadPie} colors={SALES_LEAD_COLORS} size={4} height={300} />
        <GAreaChart title="Lead Generation & Conversion" subtitle={`${cap(period)} breakdown`}
          data={leadConv}
          areas={[
            { key:"leads",     label:"Leads Generated", color:"#22c55e" },
            { key:"converted", label:"Converted",       color:"#3b82f6" },
          ]}
          size={8} height={300} />
      </DashGrid>

      {/* ── Management Department ── */}
      <DashGrid cols={12} gap={4}>
        <div className="col-span-12"><Heading primaryText="Management" secondaryText="Department" size={12} /></div>
        <EnhancedDashCard title="Total Projects" value={loading ? "—" : String(projStats.total      ?? 0)} icon={<Briefcase size={22}/>}    accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="In Progress"    value={loading ? "—" : String(projStats.inProgress ?? 0)} icon={<Clock size={22}/>}         accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Completed"      value={loading ? "—" : String(projStats.completed  ?? 0)} icon={<CheckCircle size={22}/>}   accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Delayed"        value={loading ? "—" : String(projStats.delayed    ?? 0)} icon={<AlertCircle size={22}/>}   accentColor="#f43f5e" size={3} />
      </DashGrid>
      <DataTable
        exportable exportFileName="project_management"
        title="Project Management"
        columns={projectColumns}
        rows={projectRows}
        loading={loading}
        actions={[{
          icon: <Eye size={15}/>, tooltip:"View", variant:"ghost",
          onClick: (row) => { setSelProject(row); openModal("report-proj-modal"); },
        }]}
        size={12} pageSize={5} searchable date
        filters={[
          { title:"Status",   key:"status",   type:"toggle", options:["Not Started","Work Started","In Progress","Review Stage","Completed","Delayed"] },
          { title:"Priority", key:"priority", type:"toggle", options:["Low","Medium","High","Urgent"] },
        ]}
      />

      {/* ── Finance Department ── */}
      <DashGrid cols={12} gap={4}>
        <div className="col-span-12"><Heading primaryText="Finance" secondaryText="Department" size={12} /></div>
        <EnhancedDashCard title="Total Revenue"   value={loading ? "—" : fmtINR(kpis.totalRevenue)}   icon={<DollarSign size={22}/>} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Pending"         value={loading ? "—" : fmtINR(kpis.pendingRevenue)} icon={<Clock size={22}/>}      accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Expenses"        value={loading ? "—" : fmtINR(kpis.totalExpenses)}  icon={<CreditCard size={22}/>} accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Net Profit"      value={loading ? "—" : fmtINR(kpis.netProfit)}      icon={<TrendingUp size={22}/>} accentColor="#8b5cf6" size={3} />
      </DashGrid>
      <DataTable
        exportable exportFileName="finance_payments"
        title="Finance & Payments"
        columns={financeColumns}
        rows={financeRows}
        loading={loading}
        actions={[{
          icon: <Eye size={15}/>, tooltip:"View", variant:"ghost",
          onClick: (row) => { setSelFinance(row); openModal("report-fin-modal"); },
        }]}
        size={12} pageSize={5} searchable date
        filters={[
          { title:"Status", key:"status", type:"toggle", options:["Paid","Partial","Pending"] },
          { title:"Type",   key:"type",   type:"toggle", options:["Full Payment","Partial","Post-Delivery"] },
        ]}
      />

      {/* Project detail modal */}
      <Modal id="report-proj-modal" title="Project Details">
        {selProject && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white shadow-lg">
                <Briefcase size={22} />
              </div>
              <div>
                <p className="text-lg font-black text-[#2a465a]">{selProject.project}</p>
                <p className="text-sm text-slate-500">{selProject.client}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Assigned To", selProject.assignedTo],
                ["Start Date",  selProject.startDate],
                ["Deadline",    selProject.deadline],
                ["Status",      selProject.status],
                ["Progress",    selProject.progress],
                ["Priority",    selProject.priority],
              ].map(([label, val]) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-white px-3 py-2 rounded-xl block border border-slate-100 text-sm">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("report-proj-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Finance detail modal */}
      <Modal id="report-fin-modal" title="Payment Details">
        {selFinance && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Client",    selFinance.client],
                ["Project",   selFinance.project],
                ["Invoice #", selFinance.invoiceId],
                ["Total",     selFinance.total],
                ["Paid",      selFinance.paid],
                ["Remaining", selFinance.remaining],
                ["Type",      selFinance.type],
                ["Status",    selFinance.status],
                ["Date",      selFinance.date],
              ].map(([label, val]) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-white px-3 py-2 rounded-xl block border border-slate-100 text-sm">{val || "—"}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("report-fin-modal")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
