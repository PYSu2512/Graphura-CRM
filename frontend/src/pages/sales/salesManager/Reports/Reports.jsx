import React, { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable, Grid, DataField, Select, Option,
  openModal, Modal, ModalData,
} from "../../../../components/shared/Common_Components";
import { kpiReport, ReportRows } from "./ReportsStore";
import { Phone, TrendingUp, BarChart2, CheckCircle, XCircle, Eye } from "lucide-react";

const kpiIcons  = [<Phone size={22}/>,<Phone size={22}/>,<TrendingUp size={22}/>,<CheckCircle size={22}/>,<XCircle size={22}/>,<BarChart2 size={22}/>];
const kpiAccents = ["#3b82f6","#14b8a6","#8b5cf6","#22c55e","#f43f5e","#f59e0b"];

const reportCols = [
  { key: "leadName",  label: "Lead Name" },
  { key: "mobile",    label: "Mobile" },
  { key: "callCount", label: "Call Count" },
  { key: "status",    label: "Status" },
  { key: "prospect",  label: "Prospect" },
  { key: "sale",      label: "Sale" },
  { key: "dump",      label: "Dump" },
  { key: "untouched", label: "Untouched" },
  { key: "date",      label: "Date" },
];

export default function Report() {
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ date: "", status: "" });
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  const actions = [
    { label: "View", variant: "ghost", onClick: (row) => { setSelected(row); openModal("report-view"); } },
  ];

  return (
    <div>
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="My" secondaryText="Report" size={12} />
        {kpiReport.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={kpiIcons[i]} accentColor={kpiAccents[i]} size={2} />
        ))}
      </DashGrid>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Filters</p>
        <Grid cols={12} gap={4}>
          <DataField label="Date" id="srDate" type="date" size={4}
            value={filters.date} onChange={(e) => set("date", e.target.value)} />
          <div className="col-span-12 sm:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Status</label>
            <Select value={filters.status} onChange={(e) => set("status", e.target.value)} placeholder="All Statuses" size={12}>
              <Option value="New"        label="New" />
              <Option value="Follow-up"  label="Follow-up" />
              <Option value="Prospect"   label="Prospect" />
              <Option value="Converted"  label="Converted" />
              <Option value="Dump"       label="Dump" />
              <Option value="In Progress"label="In Progress" />
            </Select>
          </div>
        </Grid>
      </div>

      <DataTable
        title="Daily Activity Report"
        columns={reportCols}
        rows={ReportRows}
        actions={actions}
        size={12}
        pageSize={8}
        searchable
        date
        exportable
        exportFileName="reports"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["New","Follow-up","Prospect","Converted","Dump","In Progress"] },
        ]}
      />

      <Modal id="report-view" title="Lead Activity Details" size="md">
        {selected && (
          <div className="grid grid-cols-2 gap-3">
            <ModalData label="Lead Name"  value={selected.leadName} />
            <ModalData label="Mobile"     value={selected.mobile} />
            <ModalData label="Call Count" value={selected.callCount} />
            <ModalData label="Status"     value={selected.status} />
            <ModalData label="Prospect"   value={selected.prospect} />
            <ModalData label="Sale"       value={selected.sale} />
            <ModalData label="Dump"       value={selected.dump} />
            <ModalData label="Untouched"  value={selected.untouched} />
            <ModalData label="Date"       value={selected.date} />
          </div>
        )}
      </Modal>
    </div>
  );
}