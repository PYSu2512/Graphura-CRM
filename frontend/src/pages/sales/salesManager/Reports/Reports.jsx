import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, Button,
  GLineChart, GDoughnutChart, GColumnChart, GBarChart,
} from "../../../../components/shared/Common_Components";
import {
  kpiReport, ReportRows,
  weeklyCallData, leadStatusData, leadStatusColors, teamPerfData, personCallData,
} from "./ReportsStore";
import { Phone, TrendingUp, BarChart2, CheckCircle, XCircle, Eye } from "lucide-react";

const kpiIcons = [
  <Phone size={22}/>, <Phone size={22}/>, <TrendingUp size={22}/>,
  <CheckCircle size={22}/>, <XCircle size={22}/>, <BarChart2 size={22}/>,
];
const kpiAccents = ["#3b82f6","#14b8a6","#8b5cf6","#22c55e","#f43f5e","#f59e0b"];

const reportCols = [
  { key: "name",       label: "Name"        },
  { key: "role",       label: "Role"        },
  { key: "teamLeader", label: "Team Leader" },
  { key: "leadName",   label: "Lead Name"   },
  { key: "mobile",     label: "Mobile"      },
  { key: "callCount",  label: "Calls"       },
  { key: "status",     label: "Status"      },
  { key: "prospect",   label: "Prospect"    },
  { key: "sale",       label: "Sale"        },
  { key: "dump",       label: "Dump"        },
  { key: "untouched",  label: "Untouched"   },
  { key: "date",       label: "Date"        },
];

export default function Report() {
  const [selected, setSelected] = useState(null);

  const actions = [
    {
      icon: <Eye size={15} />, tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => { setSelected(row); openModal("report-view"); },
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Heading + KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Team" secondaryText="Activity Report" size={12} />
        {kpiReport.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={kpiIcons[i]}
            accentColor={kpiAccents[i]}
            size={4}
          />
        ))}
      </DashGrid>

      {/* ── Charts Row 1: Weekly Call Trend + Lead Status Breakdown ── */}
      <DashGrid cols={12} gap={4}>
        <GLineChart
          title="Weekly Call Trend"
          subtitle="Team-wide calls, prospects & sales this week"
          data={weeklyCallData}
          lines={[
            { key: "calls",     color: "#3b82f6", label: "Calls"     },
            { key: "prospects", color: "#8b5cf6", label: "Prospects" },
            { key: "sales",     color: "#22c55e", label: "Sales"     },
          ]}
          size={8}
          height={280}
        />
        <GDoughnutChart
          title="Lead Status Breakdown"
          subtitle="Team-wide distribution"
          data={leadStatusData}
          colors={leadStatusColors}
          size={4}
          height={280}
        />
      </DashGrid>

      {/* ── Charts Row 2: Team Performance + Per-person Calls ── */}
      <DashGrid cols={12} gap={4}>
        <GColumnChart
          title="Team-wise Performance"
          subtitle="Calls, prospects & sales per team"
          data={teamPerfData}
          bars={[
            { key: "calls",     color: "#3b82f6", label: "Calls"     },
            { key: "prospects", color: "#8b5cf6", label: "Prospects" },
            { key: "sales",     color: "#22c55e", label: "Sales"     },
          ]}
          size={6}
          height={280}
        />
        <GBarChart
          title="Individual Call Summary"
          subtitle="Calls & conversions per person"
          data={personCallData}
          bars={[
            { key: "calls",     color: "#14b8a6", label: "Calls"     },
            { key: "converted", color: "#f59e0b", label: "Converted" },
          ]}
          size={6}
          height={280}
        />
      </DashGrid>

      {/* ── Team Activity Report Table ── */}
      <DataTable
        title="Team Activity Report"
        columns={reportCols}
        rows={ReportRows}
        actions={actions}
        size={12}
        pageSize={10}
        searchable
        date
        exportable
        exportFileName="team-activity-report"
        filters={[
          { title: "Role",        type: "toggle", key: "role",
            options: ["Sales Manager", "Team Leader", "Executive"] },
          { title: "Team Leader", type: "select", key: "teamLeader",
            options: ["Ankit Verma", "Sonal Gupta", "Nisha Patel", "Self"] },
          { title: "Status",      type: "toggle", key: "status",
            options: ["New","Follow-up","Prospect","Converted","Dump","In Progress"] },
        ]}
      />

      {/* ── View Modal ── */}
      <Modal id="report-view" title="Activity Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.name}
              subtitle={`${selected.role} · ${selected.teamLeader}`}
              meta={`Lead: ${selected.leadName} · ${selected.date}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Lead Name"   value={selected.leadName} />
              <ModalData label="Mobile"      value={selected.mobile} />
              <ModalData label="Call Count"  value={String(selected.callCount)} />
              <ModalData label="Status"      value={selected.status} />
              <ModalData label="Prospect"    value={selected.prospect} />
              <ModalData label="Sale"        value={selected.sale} />
              <ModalData label="Dump"        value={selected.dump} />
              <ModalData label="Untouched"   value={selected.untouched} />
              <ModalData label="Team Leader" value={selected.teamLeader} />
              <ModalData label="Date"        value={selected.date} />
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("report-view")} />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
