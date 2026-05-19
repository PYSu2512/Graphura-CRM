import { useState } from "react";
import { CalendarDays, Send } from "lucide-react";
import {
  Button,
  DataField,
  Grid,
  Heading,
  Modal,
  ModalData,
  ModalGrid,
  closeModal,
  openModal,
} from "../../../../components/shared/Common_Components";
import ReportStatsCards from "./components/ReportStatsCards";
import TeamPerformanceTable from "./components/TeamPerformanceTable";
import {
  dailyReportMetrics,
  weeklyReportMetrics,
} from "./reportData";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("daily");
  const [selected, setSelected] = useState(null);
  const metrics = reportType === "daily" ? dailyReportMetrics : weeklyReportMetrics;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <Heading
        primaryText="Management Team"
        secondaryText="Reports"
        showAnimations
      />

      <div className="flex flex-wrap justify-end gap-2">
        <Button text="Submit to Manager" variant="primary" icon={<Send size={15} />} onClick={() => openModal("mtl-submit-daily-report")} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#243b53] text-white shadow-sm">
              <CalendarDays size={17} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#243b53]">Report Type</h3>
          </div>
          <div className="grid w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1 sm:w-80">
            <button
              type="button"
              onClick={() => setReportType("daily")}
              className={`rounded-lg px-3 py-2 text-sm font-black transition ${
                reportType === "daily"
                  ? "bg-[#243b53] text-white shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-[#243b53]"
              }`}
            >
              Daily Report
            </button>
            <button
              type="button"
              onClick={() => setReportType("weekly")}
              className={`rounded-lg px-3 py-2 text-sm font-black transition ${
                reportType === "weekly"
                  ? "bg-[#243b53] text-white shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-[#243b53]"
              }`}
            >
              Weekly Update
            </button>
          </div>
        </div>
      </section>

      <ReportStatsCards metrics={metrics} />
      <TeamPerformanceTable onSelect={setSelected} />

      <Modal id="mtl-report-employee-activity" title="Project Report" size="lg">
        {selected && (
          <ModalGrid>
            <ModalData label="Project" value={selected.project} />
            <ModalData label="Assigned Employee" value={selected.employee} />
            <ModalData label="Status" value={selected.status} />
            <ModalData label="Report Type" value={selected.reportType} />
            <ModalData label="Updated On" value={selected.updatedOn} />
          </ModalGrid>
        )}
      </Modal>

      <Modal id="mtl-report-reassign-work" title="Reassign Project" size="md">
        <Grid cols={12} gap={3}>
          <DataField label="Project" size={12} value={selected?.project || ""} readOnly />
          <DataField label="Current Owner" size={6} value={selected?.employee || ""} readOnly />
          <DataField label="New Owner" size={6} placeholder="Employee name" />
          <DataField label="Reason" type="textarea" size={12} rows={4} placeholder="Reason for project reassignment..." />
        </Grid>
        <div className="mt-5 flex justify-end gap-2">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-report-reassign-work")} />
          <Button text="Reassign" variant="primary" onClick={() => closeModal("mtl-report-reassign-work")} />
        </div>
      </Modal>

      <Modal id="mtl-submit-daily-report" title="Submit Report to Management Manager" size="lg">
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Selected Report</p>
                <p className="mt-1 text-lg font-black text-[#243b53]">
                  {reportType === "daily" ? "Daily Progress Report" : "Weekly Update"}
                </p>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-[#243b53] shadow-sm">
                Management Manager
              </div>
            </div>
          </div>

          <Grid cols={12} gap={3}>
            <DataField label="Report Date" type="date" size={6} />
            <DataField label="Total Projects" type="number" size={6} placeholder="0" />
            <DataField label="Completed Projects" type="number" size={6} placeholder="0" />
            <DataField label="Pending Projects" type="number" size={6} placeholder="0" />
            <DataField
              label="Report Notes"
              type="textarea"
              size={12}
              rows={5}
              placeholder="Add the daily progress or weekly update for the Management Manager..."
            />
          </Grid>
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-submit-daily-report")} />
          <Button text="Submit" variant="primary" onClick={() => closeModal("mtl-submit-daily-report")} />
        </div>
      </Modal>
    </div>
  );
}
