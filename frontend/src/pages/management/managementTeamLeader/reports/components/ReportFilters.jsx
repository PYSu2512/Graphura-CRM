import { FileDown, Filter, Search, Send } from "lucide-react";
import {
  Button,
  DataField,
  Grid,
  Option,
  SelectField,
  openModal,
} from "../../../../../components/shared/Common_Components";

export default function ReportFilters({ filters, employeeOptions, onChange, onReset }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#243b53]">
            <Filter size={16} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-[#243b53]">Filters</h3>
        </div>
        <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
          <div className="w-24">
            <Button text="Reset" variant="ghost" onClick={onReset} />
          </div>
          <div className="w-32">
            <Button text="Export" variant="secondary" icon={<FileDown size={15} />} />
          </div>
          <div className="w-36">
            <Button text="Submit" variant="primary" icon={<Send size={15} />} onClick={() => openModal("mtl-submit-daily-report")} />
          </div>
        </div>
      </div>
      <Grid cols={12} gap={3}>
        <DataField label="Search" size={4} value={filters.search} onChange={onChange("search")} placeholder="Search employee or project..." icon={Search} />
        <DataField label="Date From" type="date" size={2} value={filters.dateFrom} onChange={onChange("dateFrom")} />
        <DataField label="Date To" type="date" size={2} value={filters.dateTo} onChange={onChange("dateTo")} />
        <SelectField label="Employee" id="mtl-report-filter-employee" size={2} placeholder="All employees" value={filters.employee} onChange={onChange("employee")} searchable={false}>
          <Option value="All" label="All" />
          {employeeOptions.map((employee) => <Option key={employee} value={employee} label={employee} />)}
        </SelectField>
        <SelectField label="Status" id="mtl-report-filter-status" size={2} placeholder="All status" value={filters.status} onChange={onChange("status")} searchable={false}>
          <Option value="All" label="All" />
          <Option value="Completed" label="Completed" />
          <Option value="Pending" label="Pending" />
          <Option value="Delayed" label="Delayed" />
        </SelectField>
      </Grid>
    </section>
  );
}
