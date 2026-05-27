import React, { useState } from "react";
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Calendar,
  ArrowRight,
  Download,
} from "lucide-react";

import {
  DashGrid,
  EnhancedDashCard,
  Heading,
  GAreaChart,
  GLineChart,
  GColumnChart,
  GBarChart,
  GDoughnutChart,
  DataTable,
  Button,
  Modal,
  openModal,
  closeModal,
  DataField,
  ModalData,
  P,
} from "../shared/Common_Components";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("This Year");
  const [selectedTx, setSelectedTx] = useState(null);

  const handleView = (row) => {
    setSelectedTx(row);
    openModal("view-modal");
  };

  const handleEdit = (row) => {
    setSelectedTx({ ...row, originalId: row.id });
    openModal("edit-modal");
  };
  // ─── Mock Data ─────────────────────────────────────────────────────────────

  const revenueData = [
    { name: "Jan", revenue: 15000, expenses: 10000, profit: 5000 },
    { name: "Feb", revenue: 18000, expenses: 11000, profit: 7000 },
    { name: "Mar", revenue: 16000, expenses: 10500, profit: 5500 },
    { name: "Apr", revenue: 22000, expenses: 13000, profit: 9000 },
    { name: "May", revenue: 25000, expenses: 14000, profit: 11000 },
    { name: "Jun", revenue: 28000, expenses: 15000, profit: 13000 },
    { name: "Jul", revenue: 26000, expenses: 14500, profit: 11500 },
    { name: "Aug", revenue: 30000, expenses: 16000, profit: 14000 },
    { name: "Sep", revenue: 32000, expenses: 17000, profit: 15000 },
    { name: "Oct", revenue: 35000, expenses: 18000, profit: 17000 },
    { name: "Nov", revenue: 38000, expenses: 19000, profit: 19000 },
    { name: "Dec", revenue: 42000, expenses: 20000, profit: 22000 },
  ];

  const deviceData = [
    { name: "Mobile", value: 65 },
    { name: "Desktop", value: 25 },
    { name: "Tablet", value: 10 },
  ];

  const deptPerformance = [
    { name: "Sales", target: 90, achieved: 95 },
    { name: "Marketing", target: 85, achieved: 80 },
    { name: "Engineering", target: 95, achieved: 98 },
    { name: "Support", target: 80, achieved: 85 },
  ];

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: "#TRX-8291",
      customer: "Alice Johnson",
      date: "Oct 12, 2023",
      amount: "$1,250.00",
      status: "Completed",
    },
    {
      id: "#TRX-8292",
      customer: "Acme Corp",
      date: "Oct 12, 2023",
      amount: "$8,400.00",
      status: "In Progress",
    },
    {
      id: "#TRX-8293",
      customer: "Global Tech",
      date: "Oct 11, 2023",
      amount: "$3,200.00",
      status: "Completed",
    },
    {
      id: "#TRX-8294",
      customer: "Sarah Williams",
      date: "Oct 10, 2023",
      amount: "$450.00",
      status: "Cancelled",
    },
    {
      id: "#TRX-8295",
      customer: "Nexus Industries",
      date: "Oct 09, 2023",
      amount: "$12,000.00",
      status: "Completed",
    },
    {
      id: "#TRX-8296",
      customer: "Alice Johnson",
      date: "Oct 13, 2023",
      amount: "$1,250.00",
      status: "Completed",
    },
    {
      id: "#TRX-8297",
      customer: "Acme Corp",
      date: "Oct 12, 2023",
      amount: "$8,400.00",
      status: "In Progress",
    },
    {
      id: "#TRX-8293",
      customer: "Global Tech",
      date: "Oct 11, 2023",
      amount: "$3,200.00",
      status: "Completed",
    },
    {
      id: "#TRX-8294",
      customer: "Sarah Williams",
      date: "Oct 10, 2023",
      amount: "$450.00",
      status: "Failed",
    },
    {
      id: "#TRX-8295",
      customer: "Nexus Industries",
      date: "Oct 09, 2023",
      amount: "$12,000.00",
      status: "Completed",
    },
    {
      id: "#TRX-8291",
      customer: "Alice Johnson",
      date: "Oct 12, 2023",
      amount: "$1,250.00",
      status: "Completed",
    },
    {
      id: "#TRX-8292",
      customer: "Acme Corp",
      date: "Oct 12, 2023",
      amount: "$8,400.00",
      status: "In Progress",
    },
    {
      id: "#TRX-8293",
      customer: "Global Tech",
      date: "Oct 11, 2023",
      amount: "$3,200.00",
      status: "Completed",
    },
    {
      id: "#TRX-8294",
      customer: "Sarah Williams",
      date: "Oct 10, 2023",
      amount: "$450.00",
      status: "Failed",
    },
    {
      id: "#TRX-8295",
      customer: "Nexus Industries",
      date: "Oct 09, 2023",
      amount: "$12,000.00",
      status: "Completed",
    },
    {
      id: "#TRX-8291",
      customer: "Alice Johnson",
      date: "Oct 12, 2023",
      amount: "$1,250.00",
      status: "Completed",
    },
    {
      id: "#TRX-8292",
      customer: "Acme Corp",
      date: "Oct 12, 2023",
      amount: "$8,400.00",
      status: "In Progress",
    },
    {
      id: "#TRX-8293",
      customer: "Global Tech",
      date: "Oct 11, 2023",
      amount: "$3,200.00",
      status: "Completed",
    },
    {
      id: "#TRX-8294",
      customer: "Sarah Williams",
      date: "Oct 10, 2023",
      amount: "$450.00",
      status: "Failed",
    },
    {
      id: "#TRX-8295",
      customer: "Nexus Industries",
      date: "Oct 09, 2023",
      amount: "$12,000.00",
      status: "Completed",
    },
    {
      id: "#TRX-8291",
      customer: "Alice Johnson",
      date: "Oct 12, 2023",
      amount: "$1,250.00",
      status: "Completed",
    },
    {
      id: "#TRX-8292",
      customer: "Acme Corp",
      date: "Oct 12, 2023",
      amount: "$8,400.00",
      status: "In Progress",
    },
    {
      id: "#TRX-8293",
      customer: "Global Tech",
      date: "Oct 11, 2023",
      amount: "$3,200.00",
      status: "Completed",
    },
    {
      id: "#TRX-8294",
      customer: "Sarah Williams",
      date: "Oct 10, 2023",
      amount: "$450.00",
      status: "Failed",
    },
    {
      id: "#TRX-8295",
      customer: "Nexus Industries",
      date: "Oct 09, 2023",
      amount: "$12,000.00",
      status: "Completed",
    },
  ]);

  const tableColumns = [
    { key: "id", label: "Transaction ID" },
    { key: "customer", label: "Customer" },
    { key: "date", label: "Date" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-8">
      {/* ─── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <Heading
            primaryText="Executive"
            secondaryText="Dashboard"
            size={12}
          />
          <P
            text="Welcome back! Here is what's happening with your business today."
            size="sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            text="Download Report"
            variant="secondary"
            size={12}
            onClick={() => alert("Downloading report...")}
          />
        </div>
      </div>

      {/* ─── Dashboard Grid ────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={6}>
        {/* Top Stat Cards */}
        <EnhancedDashCard
          title="Total Revenue"
          value="$324.5k"
          icon={<DollarSign size={24} />}
          accentColor="#22c55e"
          trend="+12%"
          size={3}
        />
        <EnhancedDashCard
          title="Active Users"
          value="12,450"
          icon={<Users size={24} />}
          accentColor="#3b82f6"
          trend="+5.2%"
          size={3}
        />
        <EnhancedDashCard
          title="Engagement Rate"
          value="58.3%"
          icon={<Activity size={24} />}
          accentColor="#8b5cf6"
          trend="-1.4%"
          size={3}
        />
        <EnhancedDashCard
          title="Avg. Order Value"
          value="$145.20"
          icon={<TrendingUp size={24} />}
          accentColor="#f59e0b"
          trend="+8%"
          size={3}
        />

        {/* Main Charts Row */}
        <GAreaChart
          title="Revenue & Profit Overview"
          subtitle="Monthly breakdown for the current year"
          data={revenueData}
          areas={[
            { key: "revenue", label: "Gross Revenue", color: "#3b82f6" },
            { key: "profit", label: "Net Profit", color: "#22c55e" },
          ]}
          size={8}
          height={320}
        />

        <GDoughnutChart
          title="Traffic by Device"
          subtitle="Distribution across platforms"
          data={deviceData}
          colors={["#3b82f6", "#f59e0b", "#14b8a6"]}
          size={4}
          height={320}
          innerRadius={70}
        />

        {/* Secondary Charts Row */}
        <GColumnChart
          title="Monthly Expenses"
          subtitle="Operational costs over time"
          data={revenueData}
          bars={[{ key: "expenses", label: "Expenses", color: "#f43f5e" }]}
          size={6}
          height={280}
        />

        <GBarChart
          title="Department Performance"
          subtitle="Target vs Achieved Metrics"
          data={deptPerformance}
          bars={[
            { key: "target", label: "Target", color: "#94a3b8" },
            { key: "achieved", label: "Achieved", color: "#2a465a" },
          ]}
          size={6}
          height={280}
        />

        <DataTable
          title="Recent Transactions"
          columns={tableColumns}
          rows={recentTransactions}
          size={12}
          pageSize={5}
          searchable={true}
          actions={[
            {
              label: "View",
              variant: "primary",
              onClick: handleView,
            },
            {
              label: "Edit",
              variant: "ghost",
              onClick: handleEdit,
            },
          ]}
        />
      </DashGrid>

      <Modal id="view-modal" title="View Transaction">
        {selectedTx && (
          <div className="space-y-4 text-slate-600">
            <ModalData label="Transaction ID" value={selectedTx.id} />
            <ModalData label="Customer" value={selectedTx.customer} />
            <ModalData label="Amount" value={selectedTx.amount} />
          </div>
        )}
      </Modal>

      <Modal id="edit-modal" title="Edit Transaction">
        {selectedTx && (
          <div className="space-y-4 text-slate-600">
            <DataField
              label="Transaction ID"
              id="transaction_id"
              value={selectedTx.id}
              onChange={(e) =>
                setSelectedTx({ ...selectedTx, id: e.target.value })
              }
            />
            <DataField
              label="Customer"
              id="customer"
              value={selectedTx.customer}
              onChange={(e) =>
                setSelectedTx({ ...selectedTx, customer: e.target.value })
              }
            />
            <DataField
              label="Amount"
              id="amount"
              value={selectedTx.amount}
              onChange={(e) =>
                setSelectedTx({ ...selectedTx, amount: e.target.value })
              }
            />
            <div className="pt-4 mt-2 flex justify-end gap-2 border-t border-slate-100">
              <div onClick={() => closeModal("edit-modal")}>
                <Button variant="ghost" text="Cancel" />
              </div>
              <div
                onClick={() => {
                  setRecentTransactions((prev) =>
                    prev.map((tx) => {
                      if (tx.id === selectedTx.originalId) {
                        const { originalId, ...updatedTx } = selectedTx;
                        return updatedTx;
                      }
                      return tx;
                    }),
                  );
                  closeModal("edit-modal");
                }}
              >
                <Button variant="primary" text="Save Changes" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
