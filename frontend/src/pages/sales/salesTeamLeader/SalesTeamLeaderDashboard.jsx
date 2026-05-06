import { useState } from "react";
import {
  Grid,
  Heading,
  DashCard,
  GAreaChart,
  GColumnChart,
  GPieChart,
  GLineChart,
  DataTable,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  Button,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components.jsx";
import {
  PhoneCall,
  Phone,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  EyeOff,
  Trash2,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  currentTL,
  dashboardKPIs,
  callsTrend,
  leadFunnel,
  executivePerformance,
  leaderboard,
  teamExecutives,
} from "./teamLeaderStore";

// 8 KPI icons in the same order as dashboardKPIs in the store
const KPI_ICONS = [
  <PhoneCall size={20} />,
  <Phone size={20} />,
  <ClipboardList size={20} />,
  <TrendingUp size={20} />,
  <MessageSquare size={20} />,
  <EyeOff size={20} />,
  <Trash2 size={20} />,
  <AlertCircle size={20} />,
];

const LEADERBOARD_COLS = [
  { key: "rank",       label: "Rank" },
  { key: "executive",  label: "Executive" },
  { key: "calls",      label: "Calls" },
  { key: "prospects",  label: "Prospects" },
  { key: "sales",      label: "Sales" },
  { key: "talkRatio",  label: "Talk Ratio" },
  { key: "dump",       label: "Dump" },
  { key: "missed",     label: "Missed" },
  { key: "status",     label: "Status" },
];

export default function SalesTeamLeaderDashboard() {
  const [selectedExec, setSelectedExec] = useState(null);

  const openExecDetails = (row) => {
    const profile = teamExecutives.find((e) => e.name === row.executive);
    setSelectedExec({ ...row, ...profile });
    openModal("tl-exec-view");
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Team Leader Dashboard"
          secondaryText={`${currentTL.team} · ${teamExecutives.length} executives`}
          fontSize="2xl"
          size={12}
        />
      </Grid>

      {/* ── 2. KPI Cards (8 metrics from spec) ────────────────────────────── */}
      <Grid cols={12} gap={4}>
        {dashboardKPIs.map((k, i) => (
          <DashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={k.accent}
            size={3}
          />
        ))}
      </Grid>

      {/* ── 3. Calls Trend + Lead Funnel ──────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <GAreaChart
          title="Calls & Sales Trend"
          subtitle="Monthly team activity across the year"
          data={callsTrend}
          areas={[
            { key: "calls", label: "Calls", color: "#3b82f6" },
            { key: "sales", label: "Sales", color: "#22c55e" },
          ]}
          size={8}
          height={300}
        />
        <GPieChart
          title="Lead Funnel"
          subtitle="Pipeline status breakdown"
          data={leadFunnel}
          colors={["#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#f43f5e"]}
          size={4}
          height={300}
        />
      </Grid>

      {/* ── 4. Executive Performance + Sales Trend ────────────────────────── */}
      <Grid cols={12} gap={4}>
        <GColumnChart
          title="Executive Performance"
          subtitle="Leads, calls and sales per executive"
          data={executivePerformance}
          bars={[
            { key: "leads", label: "Leads", color: "#3b82f6" },
            { key: "calls", label: "Calls", color: "#14b8a6" },
            { key: "sales", label: "Sales", color: "#22c55e" },
          ]}
          size={7}
          height={300}
        />
        <GLineChart
          title="Sales Trend"
          subtitle="Monthly sales count this year"
          data={callsTrend}
          lines={[{ key: "sales", label: "Sales", color: "#22c55e" }]}
          size={5}
          height={300}
        />
      </Grid>

      {/* ── 5. Executive Leaderboard ──────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Executive Leaderboard"
          columns={LEADERBOARD_COLS}
          rows={leaderboard}
          actions={[
            {
              icon: <Eye size={15} />,
              tooltip: "View Details",
              variant: "ghost",
              onClick: openExecDetails,
            },
          ]}
          size={12}
          pageSize={10}
          searchable
          exportable
          exportFileName="team_leaderboard"
          filters={[
            { title: "Status", type: "toggle", key: "status", options: ["Active", "On Leave"] },
          ]}
        />
      </Grid>

      {/* ── Executive Detail Modal ────────────────────────────────────────── */}
      <Modal id="tl-exec-view" title="Executive Details" size="md">
        {selectedExec && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selectedExec.executive}
              subtitle={`${selectedExec.region ?? ""} · Rank #${selectedExec.rank}`}
              meta={`Joined ${selectedExec.joinDate ?? "—"}`}
            />
            <ModalGrid title="Contact" cols={2}>
              <ModalData label="Email" value={selectedExec.email ?? "—"} />
              <ModalData label="Phone" value={selectedExec.phone ?? "—"} />
            </ModalGrid>
            <ModalGrid title="Performance" cols={3}>
              <ModalData label="Calls"      value={selectedExec.calls} />
              <ModalData label="Prospects"  value={selectedExec.prospects} />
              <ModalData label="Sales"      value={selectedExec.sales} />
              <ModalData label="Talk Ratio" value={selectedExec.talkRatio} />
              <ModalData label="Dump"       value={selectedExec.dump} />
              <ModalData label="Missed"     value={selectedExec.missed} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-exec-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
