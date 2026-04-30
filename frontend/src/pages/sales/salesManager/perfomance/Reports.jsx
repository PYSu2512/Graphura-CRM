import React, { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable, openModal, Modal, ModalData, ModalProfile,
  Grid, DataField, Select, Option,
} from "../../../../components/shared/Common_Components";
import { kpiReports, reportRows } from "./PerfomanceStore";
import { Phone, TrendingUp, DollarSign, BarChart2 } from "lucide-react";

const kpiIcons = [
  <Phone size={22} />, <TrendingUp size={22} />, <BarChart2 size={22} />,
  <DollarSign size={22} />, <DollarSign size={22} />, <BarChart2 size={22} />,
  <BarChart2 size={22} />,
];
const kpiAccents = [
  "#3b82f6","#14b8a6","#8b5cf6","#22c55e","#f59e0b","#f43f5e","#64748b",
];

const reportCols = [
  { key: "name",       label: "Employee Name" },
  { key: "teamLeader", label: "Team Leader" },
  { key: "calls",      label: "Calls" },
  { key: "leads",      label: "Leads Handled" },
  { key: "prospects",  label: "Prospects" },
  { key: "sales",      label: "Sales" },
  { key: "revenue",    label: "Revenue" },
  { key: "dump",       label: "Dump Count" },
  { key: "untouched",  label: "Untouched Leads" },
  { key: "date",       label: "Date" },
];

export default function Reports() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [filters, setFilters] = useState({ from: "", to: "", type: "", tl: "", exec: "" });
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  const actions = [
    { label: "View",         variant: "ghost",   onClick: (row) => { setSelectedRow(row); openModal("report-view-modal"); } },
    { label: "Export PDF",   variant: "primary", onClick: () => alert("PDF export triggered (UI only)") },
    { label: "Export Excel", variant: "ghost",   onClick: () => alert("Excel export triggered (UI only)") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Sales" secondaryText="Reports" size={12} />
        {kpiReports.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={kpiIcons[i]} accentColor={kpiAccents[i]} size={3} />
        ))}
      </DashGrid>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Filter Reports</p>
        <Grid cols={12} gap={4}>
          <DataField label="From Date" id="from" type="date" size={3}
            value={filters.from} onChange={(e) => set("from", e.target.value)} />
          <DataField label="To Date" id="to" type="date" size={3}
            value={filters.to} onChange={(e) => set("to", e.target.value)} />
          <div className="col-span-12 sm:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Report Type</label>
            <Select value={filters.type} onChange={(e) => set("type", e.target.value)} placeholder="Daily / Weekly / Monthly" size={12}>
              <Option value="Daily"   label="Daily" />
              <Option value="Weekly"  label="Weekly" />
              <Option value="Monthly" label="Monthly" />
            </Select>
          </div>
          <div className="col-span-12 sm:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Team Leader</label>
            <Select value={filters.tl} onChange={(e) => set("tl", e.target.value)} placeholder="All Team Leaders" size={12}>
              <Option value="Ankit Verma"  label="Ankit Verma" />
              <Option value="Sonal Gupta"  label="Sonal Gupta" />
              <Option value="Nisha Patel"  label="Nisha Patel" />
            </Select>
          </div>
        </Grid>
      </div>

      <DataTable
        title="Report Table"
        columns={reportCols}
        rows={reportRows}
        actions={actions}
        size={12}
        pageSize={8}
        searchable
        date
        exportable
        exportFileName="sales-report"
      />

      <Modal id="report-view-modal" title="Report Details" size="md">
        {selectedRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selectedRow.name} subtitle={`Team Leader: ${selectedRow.teamLeader}`} meta={`Date: ${selectedRow.date}`} />
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Calls"           value={selectedRow.calls} />
              <ModalData label="Leads Handled"   value={selectedRow.leads} />
              <ModalData label="Prospects"       value={selectedRow.prospects} />
              <ModalData label="Sales"           value={selectedRow.sales} />
              <ModalData label="Revenue"         value={selectedRow.revenue} />
              <ModalData label="Dump Count"      value={selectedRow.dump} />
              <ModalData label="Untouched Leads" value={selectedRow.untouched} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}