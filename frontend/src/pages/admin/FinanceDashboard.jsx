/**
 * FinanceDashboard — fully dynamic
 * Overview: GET /api/admin/finance
 * Invoices: GET /api/admin/invoices
 * Expenses: GET /api/admin/expenses
 */

import { useState, useEffect, useCallback } from "react";
import { DollarSign, AlertCircle, Clock, RefreshCw } from "lucide-react";
import InvoiceManagement from "./InvoiceManagement";
import ExpenseManagement from "./ExpenseManagement";
import {
  DashGrid, EnhancedDashCard, Heading, P,
  GColumnChart, GDoughnutChart, DataTable,
  PanelModal as Modal, openModal,
} from "../../components/shared/Common_Components";
import apiClient from "../../services/apiClient";

const fmtINR = (n = 0) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const tableColumns = [
  { key: "idText",      label: "ID"      },
  { key: "client",      label: "Client"  },
  { key: "product",     label: "Product" },
  { key: "date",        label: "Date"    },
  { key: "amountLabel", label: "Amount"  },
  { key: "status",      label: "Status"  },
];

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [finance,   setFinance]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  const loadFinance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/finance");
      setFinance(res.data?.data || null);
    } catch (err) {
      console.error("Finance load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "overview") loadFinance();
  }, [activeTab, loadFinance]);

  const kpis          = finance?.kpis          || {};
  const weeklyRevenue = finance?.weeklyRevenue  || [];
  const revenueStreams= finance?.revenueStreams  || [];
  const pendingList   = finance?.pendingList     || [];
  const failedList    = finance?.failedList      || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <Heading primaryText="Finance" secondaryText="Dashboard" size={12} />
          <P text="Overview of your revenue and transactions." size="sm" />
        </div>

        <div className="flex space-x-8 border-b border-slate-200 overflow-x-auto no-scrollbar pt-2">
          {[
            { id: "overview",  label: "Overview"            },
            { id: "invoices",  label: "Invoice Management"  },
            { id: "expenses",  label: "Expense Management"  },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`pb-3 font-bold text-sm transition-colors relative whitespace-nowrap ${
                activeTab === id ? "text-[#355872]" : "text-slate-400 hover:text-[#355872]"
              }`}>
              {label}
              {activeTab === id && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#355872] rounded-t-full" />}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <DashGrid cols={12} gap={6}>
          <EnhancedDashCard title="Total Revenue"    value={loading ? "—" : fmtINR(kpis.totalRevenue)}  icon={<DollarSign size={22}/>} accentColor="#38bdf8" size={3} />
          <EnhancedDashCard title="Today's Revenue"  value={loading ? "—" : fmtINR(kpis.todayRevenue)}  icon={<DollarSign size={22}/>} accentColor="#22c55e" size={3} />
          <EnhancedDashCard title="Pending Payments" value={loading ? "—" : fmtINR(kpis.pendingTotal)}  icon={<Clock size={22}/>}      accentColor="#eab308" size={3}
            onClick={() => openModal("pending-modal")} />
          <EnhancedDashCard title="Failed Payments"  value={loading ? "—" : fmtINR(kpis.failedTotal)}   icon={<AlertCircle size={22}/>} accentColor="#f43f5e" size={3}
            onClick={() => openModal("failed-modal")} />

          <GColumnChart
            title="Weekly Revenue"
            subtitle="Revenue across the week"
            data={weeklyRevenue}
            bars={[{ key: "revenue", label: "Revenue", color: "#3b82f6" }]}
            size={7} height={320}
          />
          <GDoughnutChart
            title="Revenue Streams"
            subtitle="Distribution by type"
            data={revenueStreams.length > 0 ? revenueStreams : [{ name: "No data", value: 1 }]}
            colors={["#8b5cf6","#14b8a6","#22c55e"]}
            size={5} height={320} innerRadius={70}
          />

          <div className="col-span-12 flex justify-end">
            <button onClick={loadFinance}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </DashGrid>
      )}

      {activeTab === "invoices" && (
        <div className="mt-2"><InvoiceManagement isEmbedded /></div>
      )}

      {activeTab === "expenses" && (
        <div className="mt-2"><ExpenseManagement isEmbedded /></div>
      )}

      <Modal id="pending-modal" title="Pending Payments" size="xl">
        <div className="mt-4">
          <DataTable columns={tableColumns} rows={pendingList} size={12} pageSize={5} searchable={false} />
        </div>
      </Modal>

      <Modal id="failed-modal" title="Failed Payments" size="xl">
        <div className="mt-4">
          <DataTable columns={tableColumns} rows={failedList} size={12} pageSize={5} searchable={false} />
        </div>
      </Modal>
    </div>
  );
}
