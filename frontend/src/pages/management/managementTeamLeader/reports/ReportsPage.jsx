import { useState } from "react";
import { AlertTriangle, FileDown, Send, UserRoundCog } from "lucide-react";
import {
  Button,
  DataField,
  DataTable,
  Grid,
  Heading,
  Modal,
  ModalData,
  ModalGrid,
  closeModal,
  openModal,
} from "../../../../components/shared/Common_Components";
import ReportStatsCards from "./components/ReportStatsCards";
import ProductivityChart from "./components/ProductivityChart";
import TeamPerformanceTable from "./components/TeamPerformanceTable";
import DelayedProjectsTable from "./components/DelayedProjectsTable";
import ActivityTimeline from "./components/ActivityTimeline";
import WeeklySummary from "./components/WeeklySummary";
import ProjectProgressWidgets from "./components/ProjectProgressWidgets";
import { coordinationNotes, dailyReports } from "./reportData";

const dailyColumns = [
  { key: "date", label: "Date" },
  { key: "worked", label: "Total Projects Worked" },
  { key: "completed", label: "Completed Tasks" },
  { key: "pending", label: "Pending Tasks" },
  { key: "delayed", label: "Delayed Tasks" },
  { key: "issues", label: "Team Issues" },
  { key: "managerNotes", label: "Manager Notes" },
];

export default function ReportsPage() {
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState(coordinationNotes);
  const [noteText, setNoteText] = useState("");

  const addNote = () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    setNotes((prev) => [
      { id: Date.now(), author: "Management TL", text: trimmed, time: "Just now" },
      ...prev,
    ]);
    setNoteText("");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <Heading
        primaryText="Management Team"
        secondaryText="Reports"
        showAnimations
      />

      <div className="flex flex-wrap justify-end gap-2">
        <Button text="Export Report" variant="ghost" icon={<FileDown size={15} />} />
        <Button text="Submit Daily Report" variant="primary" icon={<Send size={15} />} onClick={() => openModal("mtl-submit-daily-report")} />
      </div>

      <ReportStatsCards />
      <ProductivityChart />
      <ProjectProgressWidgets />

      <Grid cols={12} gap={6}>
        <div className="col-span-12 xl:col-span-8">
          <TeamPerformanceTable onSelect={setSelected} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <WeeklySummary />
        </div>
      </Grid>

      <DelayedProjectsTable onSelect={setSelected} />

      <Grid cols={12} gap={6}>
        <div className="col-span-12 xl:col-span-7">
          <ActivityTimeline />
        </div>
        <section className="col-span-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#243b53]">Team Coordination Notes</h3>
              <p className="text-xs font-medium text-slate-500">Standup notes, mentions, and manager coordination</p>
            </div>
            <UserRoundCog size={18} className="text-slate-400" />
          </div>
          <div className="mb-4 flex gap-2">
            <input
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Add note or mention an employee..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-[#243b53] focus:bg-white"
            />
            <Button text="Add" variant="primary" size={2} onClick={addNote} />
          </div>
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black text-[#243b53]">{note.author}</p>
                  <p className="text-[11px] font-semibold text-slate-400">{note.time}</p>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-600">{note.text}</p>
              </div>
            ))}
          </div>
        </section>
      </Grid>

      <DataTable
        title="Daily Progress Reports"
        columns={dailyColumns}
        rows={dailyReports}
        size={12}
        pageSize={6}
        searchable
        date
        exportable
        exportFileName="management-tl-daily-progress"
      />

      <Modal id="mtl-report-employee-activity" title="Employee Activity" size="lg">
        {selected && (
          <ModalGrid>
            <ModalData label="Employee" value={selected.name || selected.employee} />
            <ModalData label="Assigned Projects" value={selected.assigned || selected.project} />
            <ModalData label="Completed" value={selected.completed || "-"} />
            <ModalData label="Delayed" value={selected.delayed || selected.delayDays || "-"} />
            <ModalData label="Productivity" value={selected.productivity || "-"} />
            <ModalData label="Quality Score" value={selected.quality || "-"} />
          </ModalGrid>
        )}
      </Modal>

      <Modal id="mtl-report-reassign-work" title="Reassign Work" size="md">
        <Grid cols={12} gap={3}>
          <DataField label="Project / Task" size={12} value={selected?.project || ""} readOnly />
          <DataField label="Current Owner" size={6} value={selected?.employee || selected?.name || ""} readOnly />
          <DataField label="New Owner" size={6} placeholder="Employee name" />
          <DataField label="Reason" type="textarea" size={12} rows={4} placeholder="Workload, delay, quality issue..." />
        </Grid>
        <div className="mt-5 flex justify-end gap-2">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-report-reassign-work")} />
          <Button text="Reassign" variant="primary" onClick={() => closeModal("mtl-report-reassign-work")} />
        </div>
      </Modal>

      <Modal id="mtl-report-escalate-project" title="Escalate Project Risk" size="md">
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
          <AlertTriangle size={16} className="mr-2 inline" />
          Escalation will be routed to the Management Manager.
        </div>
        <Grid cols={12} gap={3}>
          <DataField label="Project" size={12} value={selected?.project || ""} readOnly />
          <DataField label="Urgency" size={6} placeholder="Critical / High" />
          <DataField label="Delay Days" size={6} value={selected?.delayDays || ""} readOnly />
          <DataField label="Escalation Notes" type="textarea" size={12} rows={4} placeholder="Add blocker details, dependency, and expected decision..." />
        </Grid>
        <div className="mt-5 flex justify-end gap-2">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-report-escalate-project")} />
          <Button text="Escalate" variant="primary" onClick={() => closeModal("mtl-report-escalate-project")} />
        </div>
      </Modal>

      <Modal id="mtl-report-project-comment" title="Add Project Comment" size="md">
        <DataField label="Comment" type="textarea" size={12} rows={5} placeholder="Add coordination note, dependency update, or manager instruction..." />
        <div className="mt-5 flex justify-end gap-2">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-report-project-comment")} />
          <Button text="Add Comment" variant="primary" onClick={() => closeModal("mtl-report-project-comment")} />
        </div>
      </Modal>

      <Modal id="mtl-submit-daily-report" title="Submit Daily Report" size="lg">
        <Grid cols={12} gap={3}>
          <DataField label="Date" type="date" size={4} />
          <DataField label="Total Projects Worked" type="number" size={4} />
          <DataField label="Completed Tasks" type="number" size={4} />
          <DataField label="Pending Tasks" type="number" size={4} />
          <DataField label="Delayed Tasks" type="number" size={4} />
          <DataField label="Team Issues" size={4} placeholder="Blockers / dependencies" />
          <DataField label="Manager Notes" type="textarea" size={12} rows={4} placeholder="Summary for Management Manager..." />
        </Grid>
        <div className="mt-5 flex justify-end gap-2">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-submit-daily-report")} />
          <Button text="Submit" variant="primary" onClick={() => closeModal("mtl-submit-daily-report")} />
        </div>
      </Modal>
    </div>
  );
}
