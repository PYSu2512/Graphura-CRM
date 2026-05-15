import { useState, useEffect, useCallback } from "react";
import {
  Heading, DashGrid, DataTable,
  openModal, closeModal, Modal, ModalData, ModalGrid, Button,
} from "../../../../../components/shared/Common_Components";
import { salesManagerReportsService } from "../../../../../services/salesManagerReportsService";
import { Eye, AlertCircle } from "lucide-react";

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && <button onClick={onRetry} className="text-xs font-medium underline">Retry</button>}
    </div>
  );
}

// NO revenue column
const COLS = [
  { key: "teamName",       label: "Team Name"    },
  { key: "teamLeader",     label: "Team Leader"  },
  { key: "totalExec",      label: "Executives"   },
  { key: "completedCalls", label: "Calls"        },
  { key: "sales",          label: "Sales"        },
  { key: "conversion",     label: "Conversion %" },
  { key: "status",         label: "Status"       },
];

const DEFAULT_PAGINATION = { total: 0, page: 1, pageSize: 10, totalPages: 1 };

export default function TeamReports() {
  const [teams,      setTeams]      = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [selected,   setSelected]   = useState(null);

  const [query, setQuery] = useState({ page: 1, pageSize: 10, search: "", sortBy: "completedCalls", sortDir: "desc" });

  const fetchData = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesManagerReportsService.getTeams(params);
      setTeams(result.teams || []);
      setPagination(result.pagination || DEFAULT_PAGINATION);
    } catch (err) {
      setError(err?.message || "Failed to load team reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(query); }, [fetchData, query]);

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Team" secondaryText="Reports" size={12} />
      </DashGrid>

      {error && (
        <DashGrid cols={12} gap={4}>
          <div className="col-span-12"><ErrorBanner message={error} onRetry={() => fetchData(query)} /></div>
        </DashGrid>
      )}

      <DataTable
        title="Team Reports"
        columns={COLS}
        rows={teams}
        loading={loading}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setSelected(row); openModal("team-report-view"); },
          },
        ]}
        size={12}
        pageSize={pagination.pageSize}
        totalRows={pagination.total}
        currentPage={pagination.page}
        onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
        onPageSizeChange={(pageSize) => setQuery((q) => ({ ...q, page: 1, pageSize }))}
        onSearch={(search) => setQuery((q) => ({ ...q, page: 1, search }))}
        onSort={(sortBy, sortDir) => setQuery((q) => ({ ...q, sortBy, sortDir }))}
        serverSide
        searchable
        exportable
        exportFileName="team-reports"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Inactive"] },
        ]}
      />

      <Modal id="team-report-view" title="Team Report Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Team Info" cols={2}>
              <ModalData label="Team Name"   value={selected.teamName}         />
              <ModalData label="Team Leader" value={selected.teamLeader}       />
              <ModalData label="Executives"  value={String(selected.totalExec)} />
              <ModalData label="Status"      value={selected.status}           />
            </ModalGrid>
            <ModalGrid title="Performance" cols={2}>
              <ModalData label="Assigned Leads"    value={String(selected.assignedLeads)}   />
              <ModalData label="Completed Calls"   value={String(selected.completedCalls)}  />
              <ModalData label="Prospects"         value={String(selected.prospects)}       />
              <ModalData label="Sales"             value={String(selected.sales)}           />
              <ModalData label="Dump Leads"        value={String(selected.dumpLeads)}       />
              <ModalData label="Missed Follow-ups" value={String(selected.missedFollowups)} />
              <ModalData label="Conversion %"      value={selected.conversion}              />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("team-report-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
