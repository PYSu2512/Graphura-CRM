import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, GBarChart, GColumnChart, GLineChart,
  DataTable, openModal, closeModal, Modal, ModalProfile, ModalData, ModalGrid, Button, DataField,
} from "../../../../components/shared/Common_Components";
import {
  kpiOverview, teamPerformanceData, empSalesData,
  callsVsSalesData, leaderboardRows,
} from "./PerfomanceStore";
import { TrendingUp, Users, AlertTriangle, Eye, AlertOctagon, Star, Send } from "lucide-react";

const KPI_ICONS = [
  <TrendingUp size={22} />, <Users size={22} />, <TrendingUp size={22} />,
  <TrendingUp size={22} />, <AlertTriangle size={22} />, <AlertTriangle size={22} />,
];

const LEADERBOARD_COLS = [
  { key: "rank",       label: "Rank" },
  { key: "name",       label: "Employee" },
  { key: "calls",      label: "Calls" },
  { key: "sales",      label: "Sales" },
  { key: "revenue",    label: "Revenue" },
  { key: "conversion", label: "Conversion %" },
  { key: "status",     label: "Status" },
];

export default function Overview() {
  // Separate state for each modal
  const [viewRow,    setViewRow]    = useState(null);
  const [warnRow,    setWarnRow]    = useState(null);
  const [apprRow,    setApprRow]    = useState(null);
  const [warnMsg,    setWarnMsg]    = useState("");
  const [apprMsg,    setApprMsg]    = useState("");

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Performance" secondaryText="Overview" size={12} />
        {kpiOverview.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={k.accent} size={4} />
        ))}
      </DashGrid>

      {/* Charts Row 1 */}
      <DashGrid cols={12} gap={4}>
        <GBarChart
          title="Team-wise Performance" subtitle="Calls & Sales by team"
          data={teamPerformanceData}
          bars={[
            { key: "calls", label: "Calls", color: "#3b82f6" },
            { key: "sales", label: "Sales", color: "#22c55e" },
          ]}
          size={6} height={280}
        />
        <GColumnChart
          title="Employee-wise Sales" subtitle="Top performers"
          data={empSalesData}
          bars={[
            { key: "sales", label: "Sales", color: "#8b5cf6" },
            { key: "calls", label: "Calls", color: "#f59e0b" },
          ]}
          size={6} height={280}
        />
      </DashGrid>

      {/* Charts Row 2 */}
      <DashGrid cols={12} gap={4}>
        <GLineChart
          title="Calls vs Sales Trend" subtitle="Monthly comparison"
          data={callsVsSalesData}
          lines={[
            { key: "calls", label: "Calls", color: "#3b82f6" },
            { key: "sales", label: "Sales", color: "#22c55e" },
          ]}
          size={12} height={260}
        />
      </DashGrid>

      {/* Leaderboard */}
      <DataTable
        title="Leaderboard"
        columns={LEADERBOARD_COLS}
        rows={leaderboardRows}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => { setViewRow(row); openModal("perf-view-modal"); },
          },
          {
            icon: <AlertOctagon size={15} />,
            tooltip: "Send Warning",
            variant: "danger",
            onClick: (row) => { setWarnRow(row); setWarnMsg(""); openModal("perf-warn-modal"); },
          },
          {
            icon: <Star size={15} />,
            tooltip: "Send Appreciation",
            variant: "primary",
            onClick: (row) => { setApprRow(row); setApprMsg(""); openModal("perf-appr-modal"); },
          },
        ]}
        size={12}
        pageSize={5}
        searchable
        exportable
        exportFileName="leaderboard"
        filters={[
          { title: "Status",      type: "toggle", key: "status",     options: ["Active", "Pending"] },
          { title: "Team Leader", type: "select", key: "teamLeader", options: [...new Set(leaderboardRows.map((r) => r.teamLeader))] },
        ]}
      />

      {/* ── View Modal ──────────────────────────────────────────────────────── */}
      <Modal id="perf-view-modal" title="Employee Details" size="md">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.name}
              subtitle={`Rank #${viewRow.rank} · ${viewRow.teamLeader}`}
              meta={`Status: ${viewRow.status}`}
            />
            <ModalGrid title="Performance Stats" cols={2}>
              <ModalData label="Calls"           value={viewRow.calls} />
              <ModalData label="Sales"           value={viewRow.sales} />
              <ModalData label="Revenue"         value={viewRow.revenue} />
              <ModalData label="Conversion Rate" value={viewRow.conversion} />
              <ModalData label="Team Leader"     value={viewRow.teamLeader} />
              <ModalData label="Status"          value={viewRow.status} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("perf-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Warning Modal ───────────────────────────────────────────────────── */}
      <Modal id="perf-warn-modal" title="Send Warning" size="md">
        {warnRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={warnRow.name}
              subtitle={`Rank #${warnRow.rank} · ${warnRow.teamLeader}`}
              meta={`Conversion: ${warnRow.conversion}`}
            />
            <ModalGrid title="Performance Stats" cols={2}>
              <ModalData label="Calls"   value={warnRow.calls} />
              <ModalData label="Sales"   value={warnRow.sales} />
              <ModalData label="Revenue" value={warnRow.revenue} />
              <ModalData label="Status"  value={warnRow.status} />
            </ModalGrid>
            <DataField
              label="Warning Message"
              id="warn-msg"
              type="textarea"
              rows={4}
              placeholder="Describe the performance issue and expected improvement..."
              value={warnMsg}
              onChange={(e) => setWarnMsg(e.target.value)}
              size={12}
            />
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button text="Cancel"      variant="ghost"  size={3} onClick={() => closeModal("perf-warn-modal")} />
              <Button
                text="Send Warning"
                variant="danger"
                size={4}
                disabled={!warnMsg.trim()}
                onClick={() => closeModal("perf-warn-modal")}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Appreciation Modal ──────────────────────────────────────────────── */}
      <Modal id="perf-appr-modal" title="Send Appreciation" size="md">
        {apprRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={apprRow.name}
              subtitle={`Rank #${apprRow.rank} · ${apprRow.teamLeader}`}
              meta={`Conversion: ${apprRow.conversion}`}
            />
            <ModalGrid title="Performance Stats" cols={2}>
              <ModalData label="Calls"   value={apprRow.calls} />
              <ModalData label="Sales"   value={apprRow.sales} />
              <ModalData label="Revenue" value={apprRow.revenue} />
              <ModalData label="Status"  value={apprRow.status} />
            </ModalGrid>
            <DataField
              label="Appreciation Note"
              id="appr-msg"
              type="textarea"
              rows={4}
              placeholder="Write a personalised appreciation message..."
              value={apprMsg}
              onChange={(e) => setApprMsg(e.target.value)}
              size={12}
            />
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button text="Cancel"           variant="ghost"   size={3} onClick={() => closeModal("perf-appr-modal")} />
              <Button
                text="Send Appreciation"
                variant="primary"
                size={4}
                disabled={!apprMsg.trim()}
                onClick={() => closeModal("perf-appr-modal")}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
