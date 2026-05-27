import { useState } from "react";
import {
  Heading,
  Grid,
  DashGrid,
  EnhancedDashCard,
  DataTable,
  DataField,
  Button,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components.jsx";
import { Target, CheckCircle, Clock, AlertTriangle, Eye, TrendingUp } from "lucide-react";
import { kpiTargets, initialTargets } from "./targetsStore";

const KPI_ICONS = [<Target size={22} />, <CheckCircle size={22} />, <Clock size={22} />, <AlertTriangle size={22} />];

const TARGET_COLS = [
  { key: "id",         label: "ID" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "role",       label: "Role" },
  { key: "type",       label: "Type" },
  { key: "target",     label: "Target" },
  { key: "achieved",   label: "Achieved" },
  { key: "remaining",  label: "Remaining" },
  { key: "deadline",   label: "Deadline" },
  { key: "status",     label: "Status" },
];

export default function SalesTeamLeaderTargets() {
  const [targets,     setTargets]     = useState(initialTargets);
  const [viewRow,     setViewRow]     = useState(null);
  const [progressRow, setProgressRow] = useState(null);
  const [progressVal, setProgressVal] = useState("");

  const openProgress = (row) => {
    setProgressRow(row);
    setProgressVal(String(row.achieved));
    openModal("tl-tgt-progress");
  };

  const saveProgress = () => {
    const val = Number(progressVal);
    setTargets((prev) =>
      prev.map((t) =>
        t.id === progressRow.id
          ? {
              ...t,
              achieved: val,
              remaining: Math.max(0, t.target - val),
              status: val >= t.target ? "Completed" : val > 0 ? "In Progress" : "Pending",
            }
          : t,
      ),
    );
    closeModal("tl-tgt-progress");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header + KPI cards ──────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Team" secondaryText="Targets" size={12} />
        {kpiTargets.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={k.accent}
            size={3}
          />
        ))}
      </DashGrid>

      <p className="text-xs text-slate-500 -mt-2">
        Targets are assigned by the Sales Manager. As Team Leader you can monitor and update progress for your team only.
      </p>

      {/* ── Targets table ──────────────────────────────────────────────── */}
      <DataTable
        title="My Team Targets"
        columns={TARGET_COLS}
        rows={targets}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => { setViewRow(row); openModal("tl-tgt-view"); },
          },
          {
            icon: <TrendingUp size={15} />,
            tooltip: "Update Progress",
            variant: "primary",
            onClick: openProgress,
          },
        ]}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="team_targets"
        filters={[
          { title: "Type",   type: "toggle", key: "type",   options: ["Daily", "Weekly", "Monthly"] },
          { title: "Status", type: "toggle", key: "status", options: ["Pending", "In Progress", "Completed"] },
          { title: "Role",   type: "toggle", key: "role",   options: ["Executive", "Team Leader"] },
        ]}
      />

      {/* ── View modal ─────────────────────────────────────────────────── */}
      <Modal id="tl-tgt-view" title="Target Details" size="md">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.assignedTo}
              subtitle={`${viewRow.role} · ${viewRow.type}`}
              meta={`ID: ${viewRow.id} · Deadline: ${viewRow.deadline}`}
            />
            <ModalGrid title="Target Info" cols={2}>
              <ModalData label="Assigned Leads" value={viewRow.leads} />
              <ModalData label="Target"         value={viewRow.target} />
              <ModalData label="Achieved"       value={viewRow.achieved} />
              <ModalData label="Remaining"      value={viewRow.remaining} />
              <ModalData label="Status"         value={viewRow.status} />
              <ModalData label="Deadline"       value={viewRow.deadline} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-tgt-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Progress modal ─────────────────────────────────────────────── */}
      <Modal id="tl-tgt-progress" title="Update Progress" size="sm">
        {progressRow && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Target Info" cols={2}>
              <ModalData label="Assigned To"  value={progressRow.assignedTo} />
              <ModalData label="Target Value" value={progressRow.target} />
              <ModalData label="Current"      value={progressRow.achieved} />
            </ModalGrid>
            <DataField
              label="Achieved So Far"
              id="progress"
              type="number"
              value={progressVal}
              onChange={(e) => setProgressVal(e.target.value)}
            />
            <Grid cols={12} gap={2}>
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("tl-tgt-progress")} />
              <Button text="Save"   variant="primary"   size={6} onClick={saveProgress} />
            </Grid>
          </div>
        )}
      </Modal>
    </div>
  );
}
