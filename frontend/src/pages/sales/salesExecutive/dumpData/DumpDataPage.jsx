/**
 * DumpDataPage — Sales Executive
 *
 * Shows dump leads that belong to the logged-in Sales Executive only.
 * Tenant-scoped: admin._id + assignedTo = current user.
 *
 * Rules:
 *  - Executive can VIEW their own dump leads (view modal only)
 *  - Restore is Manager/Admin only — not shown to Sales Executive
 *  - Red notification banner shown when dump leads exist
 */
import { Archive, CalendarX2, Database, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  Button,
  DashGrid,
  EnhancedDashCard,
  Heading,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  closeModal,
} from '../../../../components/shared/Common_Components';
import { DumpedLeadsTable } from './components/DumpedLeadsTable';
import { useDumpData } from './hooks/useDumpData';

export default function DumpDataPage() {
  const {
    tableRows,
    stats,
    reasonOptions,
    loading,
    error,
    viewTarget,
    openViewModal,
    reload,
  } = useDumpData();

  const statCards = [
    {
      title: 'Dump Leads',
      value: String(stats.totalDump ?? 0),
      icon: <Archive size={20} />,
      accentColor: '#f43f5e',
    },
    {
      title: 'No Response',
      value: String(stats.noResponse ?? 0),
      icon: <CalendarX2 size={20} />,
      accentColor: '#f59e0b',
    },
    {
      title: 'Today Dumped',
      value: String(stats.todayDumped ?? 0),
      icon: <Database size={20} />,
      accentColor: '#38bdf8',
    },
    {
      title: 'Restore Access',
      value: stats.restoreAccess ?? 'Manager',
      icon: <RotateCcw size={20} />,
      accentColor: '#64748b',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Heading primaryText="Dump Data" />

      {/* ── Red event notification banner — shown when dump leads exist ── */}
      {!loading && (stats.totalDump ?? 0) > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 shadow-sm">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">
              🗑️ {stats.totalDump} Lead{stats.totalDump > 1 ? 's' : ''} in Dump
            </p>
            <p className="mt-0.5 text-xs text-red-600">
              {stats.noResponse > 0
                ? `${stats.noResponse} lead${stats.noResponse > 1 ? 's' : ''} auto-dumped after 3× No Response. `
                : ''}
              {stats.todayDumped > 0
                ? `${stats.todayDumped} dumped today.`
                : ''}
              {' '}Only your manager or admin can restore these leads.
            </p>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <DashGrid cols={12} gap={4}>
        {statCards.map((item) => (
          <EnhancedDashCard
            key={item.title}
            title={item.title.toUpperCase()}
            value={item.value}
            icon={item.icon}
            accentColor={item.accentColor}
            size={3}
          />
        ))}
      </DashGrid>

      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => reload()}
            className="ml-4 underline text-red-300 hover:text-red-200 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table (view only — no restore action) ── */}
      <DumpedLeadsTable
        rows={tableRows}
        reasonOptions={reasonOptions}
        loading={loading}
        onView={openViewModal}
      />

      {/* ── View Modal ── */}
      <Modal id="dump-view-modal" title="Dump Lead Details" size="md">
        {viewTarget && (
          <div className="space-y-5">
            {/* Red event badge in modal */}
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
              <AlertTriangle size={15} className="text-red-500 shrink-0" />
              <span className="text-xs font-semibold text-red-700">
                This lead is in Dump — contact your manager to restore it.
              </span>
            </div>

            <ModalProfile
              name={viewTarget.name}
              subtitle={viewTarget.mobile}
              meta={viewTarget.email}
            />

            <ModalGrid title="Dump Info" cols={2}>
              <ModalData label="Company"        value={viewTarget.companyName} />
              <ModalData label="Dump Reason"    value={viewTarget.dumpReason} />
              <ModalData label="Dumped By"      value={viewTarget.dumpedBy} />
              <ModalData label="Dump Date"      value={viewTarget.dumpDate} />
              <ModalData label="Not Talk Count" value={String(viewTarget.notTalkCount ?? 0)} />
              <ModalData label="Last Contacted" value={viewTarget.lastContactedAt ?? '—'} />
            </ModalGrid>

            <div className="flex justify-end pt-1">
              <Button
                text="Close"
                variant="secondary"
                size={3}
                onClick={() => closeModal('dump-view-modal')}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
