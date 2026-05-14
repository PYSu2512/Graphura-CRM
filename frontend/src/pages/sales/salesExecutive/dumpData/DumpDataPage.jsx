import { useMemo } from "react";
import { Archive, CalendarX2, Database, RotateCcw } from "lucide-react";
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
} from "../../../../components/shared/Common_Components";
import { DumpLeadModal } from "./components/DumpLeadModal";
import { DumpedLeadsTable } from "./components/DumpedLeadsTable";
import { useDumpData } from "./hooks/useDumpData";

export default function DumpDataPage() {
  const {
    tableRows,
    reasonOptions,
    viewTarget,
    restoreTarget,
    openViewModal,
    openRestoreModal,
    restoreLead,
  } = useDumpData();

  const stats = useMemo(() => {
    const noResponse = tableRows.filter((lead) => lead.reason === "No Response").length;
    const today = new Date().toISOString().slice(0, 10);
    const todayDumped = tableRows.filter((lead) => lead.dumpDate === today).length;

    return [
      {
        title: "Dump Leads",
        value: String(tableRows.length),
        icon: <Archive size={20} />,
        accentColor: "#f43f5e",
      },
      {
        title: "No Response",
        value: String(noResponse),
        icon: <CalendarX2 size={20} />,
        accentColor: "#f59e0b",
      },
      {
        title: "Today Dumped",
        value: String(todayDumped),
        icon: <Database size={20} />,
        accentColor: "#38bdf8",
      },
      {
        title: "Restore Access",
        value: "Manager",
        icon: <RotateCcw size={20} />,
        accentColor: "#64748b",
      },
    ];
  }, [tableRows]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Heading primaryText="Dump Data" />

      <DashGrid cols={12} gap={4}>
        {stats.map((item) => (
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

      <DumpedLeadsTable
        rows={tableRows}
        reasonOptions={reasonOptions}
        onView={openViewModal}
        onRestore={openRestoreModal}
      />

      <Modal id="dump-view-modal" title="Dump Lead Details" size="md">
        {viewTarget && (
          <div className="space-y-5">
            <ModalProfile
              name={viewTarget.name}
              subtitle={viewTarget.mobile || viewTarget.phone}
              meta={viewTarget.email}
            />

            <ModalGrid title="Dump Info" cols={2}>
              <ModalData label="Company" value={viewTarget.company} />
              <ModalData label="Dump Reason" value={viewTarget.dumpReason || viewTarget.dump?.reason} />
              <ModalData label="Dumped By" value={viewTarget.dumpedBy || viewTarget.dump?.dumpedBy} />
              <ModalData label="Dump Date" value={viewTarget.dumpDate || viewTarget.dump?.dumpedAt} />
              <ModalData label="Last Status" value={viewTarget.dump?.lastStatus} />
              <ModalData label="Notes" value={viewTarget.dump?.notes} />
            </ModalGrid>

            <div className="flex justify-end pt-1">
              <Button
                text="Close"
                variant="secondary"
                size={3}
                onClick={() => closeModal("dump-view-modal")}
              />
            </div>
          </div>
        )}
      </Modal>

      <DumpLeadModal
        id="dump-restore-modal"
        title="Restore Dump Lead"
        lead={restoreTarget}
        infoTitle="Restore Info"
        confirmText="Restore"
        confirmVariant="primary"
        onConfirm={restoreLead}
      />
    </div>
  );
}
