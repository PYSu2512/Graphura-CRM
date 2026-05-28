import React, { useState } from "react";
import {
  Grid,
  Heading,
  DataField,
  SelectField,
  Option,
  Button,
  DataTable,
  DashCard,
  Modal,
  openModal,
  closeModal,
  ModalGrid,
  ModalData,
  ModalProfile,
} from "../../../../components/shared/Common_Components";
import { Activity, CheckCircle2, AlertTriangle, Clock, Eye, Trash2 } from "lucide-react";
import teamsStore from "./teamsStore";

export default function TrackTeamActivity() {
  const [activityLog, setActivityLog] = useState(teamsStore.activityLog);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    member: "", action: "", project: "", detail: "", type: "update",
  });
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  // Stats
  const completed = activityLog.filter((a) => a.type === "completed").length;
  const delays    = activityLog.filter((a) => a.type === "delay").length;
  const updates   = activityLog.filter((a) => a.type === "update").length;
  const progress  = activityLog.filter((a) => a.type === "progress").length;

  const handleAdd = () => {
    if (!form.member || !form.action || !form.project) return;
    const entry = {
      id: Date.now(),
      ...form,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    const updated = [entry, ...activityLog];
    setActivityLog(updated);
    teamsStore.activityLog = updated;
    setForm({ member: "", action: "", project: "", detail: "", type: "update" });
  };

  const handleView = (row) => {
    setSelected(row);
    openModal("activity-view-modal");
  };

  const handleDelete = (row) => {
    const updated = activityLog.filter((a) => a.id !== row.id);
    setActivityLog(updated);
    teamsStore.activityLog = updated;
  };

  const TYPE_BADGE = {
    progress:  { bg: "bg-blue-100",    text: "text-blue-700"    },
    delay:     { bg: "bg-rose-100",    text: "text-rose-700"    },
    completed: { bg: "bg-emerald-100", text: "text-emerald-700" },
    update:    { bg: "bg-amber-100",   text: "text-amber-700"   },
  };

  const columns = [
    { key: "member",    label: "Member" },
    { key: "action",    label: "Action" },
    { key: "project",   label: "Project" },
    { key: "detail",    label: "Detail", sortValue: (r) => r.detail },
    {
      key: "type",
      label: "Type",
      render: (val) => {
        const cfg = TYPE_BADGE[val] || TYPE_BADGE.update;
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
            {val}
          </span>
        );
      },
    },
    { key: "timestamp", label: "Timestamp" },
  ];

  const actions = [
    {
      icon: <Eye size={14} />,
      tooltip: "View Details",
      variant: "ghost",
      onClick: handleView,
    },
    {
      icon: <Trash2 size={14} />,
      tooltip: "Delete",
      variant: "danger",
      onClick: handleDelete,
    },
  ];

  return (
    <>
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Track Team Activity"
          secondaryText="Activity Log"
          size={12}
          showAnimations={false}
        />

        {/* Stats */}
        <div className="col-span-12 flex flex-row gap-4">
          <div className="flex-1">
            <DashCard title="Total Activities" value={String(activityLog.length)} icon={<Activity size={22} />} accentColor="#2a465a" />
          </div>
          <div className="flex-1">
            <DashCard title="Completed" value={String(completed)} icon={<CheckCircle2 size={22} />} accentColor="#22c55e" />
          </div>
          <div className="flex-1">
            <DashCard title="Delays Flagged" value={String(delays)} icon={<AlertTriangle size={22} />} accentColor="#f43f5e" />
          </div>
          <div className="flex-1">
            <DashCard title="Updates Submitted" value={String(updates + progress)} icon={<Clock size={22} />} accentColor="#3b82f6" />
          </div>
        </div>

        {/* Log New Activity */}
        <div className="col-span-12 bg-[#efefefb1] rounded-2xl p-5">
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
            Log New Activity
          </p>
          <Grid cols={12} gap={4}>
            <SelectField
              label="Team Member"
              id="ta-member"
              size={4}
              value={form.member}
              onChange={set("member")}
              placeholder="Select member..."
            >
              {teamsStore.members.map((m) => (
                <Option key={m.id} value={m.name} label={m.name} />
              ))}
            </SelectField>
            <SelectField
              label="Related Project"
              id="ta-project"
              size={4}
              value={form.project}
              onChange={set("project")}
              placeholder="Select project..."
            >
              {teamsStore.projects.map((p) => (
                <Option key={p.id} value={p.name} label={p.name} />
              ))}
            </SelectField>
            <SelectField
              label="Activity Type"
              id="ta-type"
              size={4}
              value={form.type}
              onChange={set("type")}
              searchable={false}
            >
              <Option value="update"    label="Daily Update" />
              <Option value="progress"  label="Progress Update" />
              <Option value="completed" label="Task Completed" />
              <Option value="delay"     label="Delay Flagged" />
            </SelectField>
            <DataField
              label="Action / Title"
              id="ta-action"
              placeholder="e.g. Submitted daily update"
              size={6}
              value={form.action}
              onChange={set("action")}
            />
            <DataField
              label="Detail / Notes"
              id="ta-detail"
              type="textarea"
              placeholder="Describe the activity in detail..."
              size={6}
              rows={2}
              value={form.detail}
              onChange={set("detail")}
            />
            <Button
              text="Log Activity →"
              size={4}
              variant="primary"
              onClick={handleAdd}
            />
            <Button
              text="Clear"
              size={2}
              variant="secondary"
              onClick={() =>
                setForm({ member: "", action: "", project: "", detail: "", type: "update" })
              }
            />
          </Grid>
        </div>

        {/* Activity Log Table */}
        <DataTable
          columns={columns}
          rows={activityLog}
          actions={actions}
          title="Activity Log"
          size={12}
          pageSize={8}
          searchable
          ellipse={4}
          userProfile="member"
          filters={[
            {
              title: "Type",
              type: "toggle",
              key: "type",
              options: ["progress", "delay", "completed", "update"],
            },
            {
              title: "Member",
              type: "text",
              key: "member",
            },
          ]}
          exportable
          exportFileName="team-activity-log"
        />
      </Grid>

      {/* View Activity Modal */}
      <Modal id="activity-view-modal" title="Activity Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.member}
              subtitle={selected.action}
              meta={selected.timestamp}
            />
            <ModalGrid title="Activity Info" cols={2}>
              <ModalData label="Project"   value={selected.project || "—"} />
              <ModalData label="Type"      value={selected.type || "—"} />
              <ModalData label="Timestamp" value={selected.timestamp || "—"} />
              <ModalData label="Detail"    value={selected.detail || "—"} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button
                text="Close"
                variant="ghost"
                size={3}
                onClick={() => closeModal("activity-view-modal")}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
