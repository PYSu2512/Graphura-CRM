import { useState, useEffect, useCallback } from "react";
import {
  Heading, DashGrid, DataTable,
  openModal, closeModal, Modal, ModalData, ModalGrid, ModalProfile, Button,
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
  { key: "tlName",         label: "Team Leader"  },
  { key: "teamName",       label: "Team"         },
  { key: "completedCalls", label: "Calls"        },
  { key: "sales",          label: "Sales"        },
  { key: "targetCalls",    label: "Target Calls" },
  { key: "achievedCalls",  label: "Achieved"     },
  { key: "achievedPct",    label: "Achieved %"   },
  { key: "conversion",     label: "Conversion %" },
  { key: "status",         label: "Status"       },
];

const DEFAULT_PAGINATION = { total: 0, page: 1, pageSize: 10, totalPages: 1 };

export default function TLReports() {
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [pagination,  setPagination]  = useState(DEFAULT_PAGINATION);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [selected,    setSelected]    = useState(null);

  const [query, setQuery] = useState({ page: 1, pageSize: 10, search: "", sortBy: "completedCalls", sortDir: "desc" });

  const fetchData = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesManagerReportsService.getTeamLeaders(params);
      setTeamLeaders(result.teamLeaders || []);
      setPagination(result.pagination || DEFAULT_PAGINATION);
    } catch (err) {
      setError(err?.message || "Failed to load team leader reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(query); }, [fetchData, query]);

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Team Leader" secondaryText="Reports" size={12} />
      </DashGrid>

      {error && (
        <DashGrid cols={12} gap={4}>
          <div className="col-span-12"><ErrorBanner message={error} onRetry={() => fetchData(query)} /></div>
        </DashGrid>
      )}

      <DataTable
        title="Team Leader Reports"
        columns={COLS}
        rows={teamLeaders}
        loading={loading}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setSelected(row); openModal("tl-report-view"); },
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
        exportFileName="tl-reports"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Inactive"] },
        ]}
      />

      <Modal id="tl-report-view" title="Team Leader Report Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.tlName}
              subtitle={selected.teamName}
              meta={`Status: ${selected.status}`}
            />
            <ModalGrid title="Performance" cols={2}>
              <ModalData label="Assigned Leads"    value={String(selected.assignedLeads   ?? 0)} />
              <ModalData label="Completed Calls"   value={String(selected.completedCalls  ?? 0)} />
              <ModalData label="Prospects"         value={String(selected.prospects       ?? 0)} />
              <ModalData label="Sales"             value={String(selected.sales           ?? 0)} />
              <ModalData label="Dump Leads"        value={String(selected.dumpLeads       ?? 0)} />
              <ModalData label="Missed Follow-ups" value={String(selected.missedFollowups ?? 0)} />
            </ModalGrid>
            <ModalGrid title="Target (Calls)" cols={2}>
              <ModalData label="Target Calls"   value={String(selected.targetCalls   ?? 0)} />
              <ModalData label="Achieved Calls" value={String(selected.achievedCalls ?? 0)} />
              <ModalData label="Achieved %"     value={selected.achievedPct ?? '0%'}        />
              <ModalData label="Conversion %"   value={selected.conversion  ?? '0%'}        />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-report-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
