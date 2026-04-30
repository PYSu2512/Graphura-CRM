import React, { useState } from "react";
import {
  Heading, DashGrid, DashCard, GBarChart, GColumnChart,
  GLineChart, DataTable, openModal, Modal, ModalProfile, ModalData,
} from "../../../../components/shared/Common_Components";
import {
  kpiOverview, teamPerformanceData, empSalesData,
  callsVsSalesData, leaderboardRows,
} from "./PerfomanceStore";
import { TrendingUp, Users, AlertTriangle } from "lucide-react";

const kpiIcons = [
  <TrendingUp size={22} />, <Users size={22} />, <TrendingUp size={22} />,
  <TrendingUp size={22} />, <AlertTriangle size={22} />, <AlertTriangle size={22} />,
];

const leaderboardCols = [
  { key: "rank",       label: "Rank" },
  { key: "name",       label: "Employee Name" },
  { key: "teamLeader", label: "Team Leader" },
  { key: "calls",      label: "Calls" },
  { key: "sales",      label: "Sales" },
  { key: "revenue",    label: "Revenue" },
  { key: "conversion", label: "Conversion %" },
  { key: "status",     label: "Status" },
];

export default function Overview() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [actionType, setActionType] = useState("");

  const openAction = (row, type) => {
    setSelectedRow(row);
    setActionType(type);
    openModal("perf-action-modal");
  };

  const actions = [
    { label: "View",             variant: "ghost",   onClick: (row) => openAction(row, "view") },
    { label: "Send Warning",     variant: "danger",  onClick: (row) => openAction(row, "warning") },
    { label: "Send Appreciation",variant: "primary", onClick: (row) => openAction(row, "appreciation") },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Performance" secondaryText="Overview" size={12} />
        {kpiOverview.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={kpiIcons[i]} accentColor={k.accent} size={2} />
        ))}
      </DashGrid>

      {/* Charts Row 1 */}
      <DashGrid cols={12} gap={4}>
        <GBarChart
          title="Team-wise Performance"
          subtitle="Calls & Sales by team"
          data={teamPerformanceData}
          bars={[
            { key: "calls",  label: "Calls",  color: "#3b82f6" },
            { key: "sales",  label: "Sales",  color: "#22c55e" },
          ]}
          size={6}
          height={280}
        />
        <GColumnChart
          title="Employee-wise Sales"
          subtitle="Top performers"
          data={empSalesData}
          bars={[
            { key: "sales", label: "Sales", color: "#8b5cf6" },
            { key: "calls", label: "Calls", color: "#f59e0b" },
          ]}
          size={6}
          height={280}
        />
      </DashGrid>

      {/* Charts Row 2 */}
      <DashGrid cols={12} gap={4}>
        <GLineChart
          title="Calls vs Sales Trend"
          subtitle="Monthly comparison"
          data={callsVsSalesData}
          lines={[
            { key: "calls", label: "Calls", color: "#3b82f6" },
            { key: "sales", label: "Sales", color: "#22c55e" },
          ]}
          size={12}
          height={260}
        />
      </DashGrid>

      {/* Leaderboard Table */}
      <DashGrid cols={12} gap={4}>
        <div className="col-span-12">
          <DataTable
            title="Leaderboard"
            columns={leaderboardCols}
            rows={leaderboardRows}
            actions={actions}
            size={12}
            pageSize={8}
            searchable
          />
        </div>
      </DashGrid>

      {/* Action Modal */}
      <Modal id="perf-action-modal" title={
        actionType === "view" ? "Employee Details"
        : actionType === "warning" ? "Send Warning"
        : "Send Appreciation"
      } size="md">
        {selectedRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selectedRow.name}
              subtitle={`Rank #${selectedRow.rank} · ${selectedRow.teamLeader}`}
              meta={`Conversion: ${selectedRow.conversion}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Calls"    value={selectedRow.calls} />
              <ModalData label="Sales"    value={selectedRow.sales} />
              <ModalData label="Revenue"  value={selectedRow.revenue} />
              <ModalData label="Status"   value={selectedRow.status} />
            </div>
            {actionType !== "view" && (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                  {actionType === "warning" ? "Warning Message" : "Appreciation Note"}
                </label>
                <textarea
                  rows={3}
                  placeholder={actionType === "warning"
                    ? "Enter warning details..."
                    : "Enter appreciation message..."}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 resize-none"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              {actionType !== "view" && (
                <button
                  onClick={() => openModal("perf-action-modal")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold text-white ${
                    actionType === "warning" ? "bg-rose-500" : "bg-[#2a465a]"
                  }`}
                >
                  {actionType === "warning" ? "Send Warning" : "Send Appreciation"}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}