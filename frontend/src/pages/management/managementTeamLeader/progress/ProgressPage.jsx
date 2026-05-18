import { useState } from "react";
import { Filter, ShieldAlert } from "lucide-react";
import {
  Button,
  DataField,
  Grid,
  Heading,
  Modal,
  ModalData,
  ModalGrid,
  Option,
  SelectField,
  closeModal,
} from "../../../../components/shared/Common_Components";
import ProgressStats from "./components/ProgressStats";
import ExecutivePerformanceTable from "./components/ExecutivePerformanceTable";
import LeadPipelineChart from "./components/LeadPipelineChart";
import ActivityTimeline from "./components/ActivityTimeline";
import FollowupMonitor from "./components/FollowupMonitor";
import ConversionAnalytics from "./components/ConversionAnalytics";
import DumpInsights from "./components/DumpInsights";
import TargetTracker from "./components/TargetTracker";
import { filterOptions } from "./data/progressData";

export default function ProgressPage() {
  const [selectedExecutive, setSelectedExecutive] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    executive: "All",
    team: "All",
    status: "All",
    priority: "All",
    source: "All",
  });

  const updateFilter = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      executive: "All",
      team: "All",
      status: "All",
      priority: "All",
      source: "All",
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <Heading
        primaryText="Team Progress"
        secondaryText="Command Center"
        showAnimations
      />

      <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#243b53] text-white shadow-sm">
              <Filter size={17} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#243b53]">Global Filters</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">This Week</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">All Teams</span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">High Priority Included</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
          <Grid cols={12} gap={3}>
            <DataField label="Date From" type="date" size={2} value={filters.dateFrom} onChange={updateFilter("dateFrom")} />
            <DataField label="Date To" type="date" size={2} value={filters.dateTo} onChange={updateFilter("dateTo")} />
            <SelectField
              label="Executive"
              id="mtl-progress-executive"
              size={2}
              searchable={false}
              placeholder="All executives"
              value={filters.executive}
              onChange={updateFilter("executive")}
            >
              {filterOptions.executives.map((item) => <Option key={item} value={item} label={item} />)}
            </SelectField>
            <SelectField
              label="Team"
              id="mtl-progress-team"
              size={2}
              searchable={false}
              placeholder="All teams"
              value={filters.team}
              onChange={updateFilter("team")}
            >
              {filterOptions.teams.map((item) => <Option key={item} value={item} label={item} />)}
            </SelectField>
            <SelectField
              label="Lead Status"
              id="mtl-progress-status"
              size={2}
              searchable={false}
              placeholder="All statuses"
              value={filters.status}
              onChange={updateFilter("status")}
            >
              {filterOptions.statuses.map((item) => <Option key={item} value={item} label={item} />)}
            </SelectField>
            <SelectField
              label="Priority"
              id="mtl-progress-priority"
              size={1}
              searchable={false}
              placeholder="Any"
              value={filters.priority}
              onChange={updateFilter("priority")}
            >
              {filterOptions.priorities.map((item) => <Option key={item} value={item} label={item} />)}
            </SelectField>
            <SelectField
              label="Source"
              id="mtl-progress-source"
              size={1}
              searchable={false}
              placeholder="Any"
              value={filters.source}
              onChange={updateFilter("source")}
            >
              {filterOptions.sources.map((item) => <Option key={item} value={item} label={item} />)}
            </SelectField>
          </Grid>
          <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3">
            <div className="w-full sm:w-32">
              <Button text="Reset" variant="ghost" onClick={resetFilters} />
            </div>
            <div className="w-full sm:w-40">
              <Button text="Apply Filters" variant="primary" />
            </div>
          </div>
        </div>
      </section>

      <ProgressStats />
      <ExecutivePerformanceTable onSelect={setSelectedExecutive} />
      <LeadPipelineChart />

      <Grid cols={12} gap={6}>
        <div className="col-span-12 xl:col-span-7">
          <ActivityTimeline />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <FollowupMonitor />
        </div>
      </Grid>

      <ConversionAnalytics />
      <DumpInsights />
      <TargetTracker />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-base font-black text-[#243b53]">Export & Reporting</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Download CSV, PDF, daily progress summary, or executive-level performance report.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-4 xl:w-[720px]">
            <Button text="Export CSV" variant="ghost" />
            <Button text="Export PDF" variant="secondary" />
            <Button text="Daily Report" variant="secondary" />
            <Button text="Executive Report" variant="primary" />
          </div>
        </div>
      </section>

      <Modal id="mtl-progress-executive-details" title="Executive Activity" size="lg">
        {selectedExecutive && (
          <ModalGrid>
            <ModalData label="Executive" value={selectedExecutive.name} />
            <ModalData label="Total Leads" value={selectedExecutive.totalLeads} />
            <ModalData label="Calls Made" value={selectedExecutive.callsMade} />
            <ModalData label="Interested Leads" value={selectedExecutive.interested} />
            <ModalData label="Prospects Created" value={selectedExecutive.prospects} />
            <ModalData label="Converted Leads" value={selectedExecutive.converted} />
            <ModalData label="Dump Count" value={selectedExecutive.dumpCount} />
            <ModalData label="Productivity Score" value={`${selectedExecutive.productivity}%`} />
            <ModalData label="Status" value={selectedExecutive.status} />
            <ModalData label="Last Activity" value={selectedExecutive.lastActivity} />
          </ModalGrid>
        )}
      </Modal>

      <Modal id="mtl-progress-escalate-executive" title="Escalate Executive Risk" size="md">
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
          <ShieldAlert size={16} className="mr-2 inline" />
          Escalation will be visible to the Management Manager.
        </div>
        <Grid cols={12} gap={3}>
          <DataField label="Executive" size={12} value={selectedExecutive?.name || ""} readOnly />
          <DataField label="Reason" size={6} placeholder="Low activity / SLA violation" />
          <DataField label="Urgency" size={6} placeholder="High / Critical" />
          <DataField label="Notes" type="textarea" size={12} rows={4} placeholder="Mention follow-up issues, inactive leads, dump pattern, or conversion risk..." />
        </Grid>
        <div className="mt-5 flex justify-end gap-2">
          <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-progress-escalate-executive")} />
          <Button text="Escalate" variant="danger" onClick={() => closeModal("mtl-progress-escalate-executive")} />
        </div>
      </Modal>
    </div>
  );
}
