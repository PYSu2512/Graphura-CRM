import { useEffect, useMemo, useState } from "react";
import {
  closeModal,
  openModal,
} from "../../../../../components/shared/Common_Components";
import { fetchDumpDataLeads } from "../api/dumpDataApi";

export function useDumpData() {
  const [leads, setLeads] = useState([]);
  const [viewTarget, setViewTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchDumpDataLeads().then((items) => setLeads(items));
  }, []);

  const dumpedLeads = useMemo(
    () => leads.filter((lead) => lead.status === "Dumped"),
    [leads],
  );

  const tableRows = useMemo(
    () =>
      dumpedLeads.map((lead) => ({
        ...lead,
        mobile: lead.mobile || lead.phone,
        reason: lead.dump?.reason,
        dumpReason: lead.dump?.reason,
        dumpedBy: lead.dump?.dumpedBy,
        dumpDate: lead.dump?.dumpedAt,
        date: lead.dump?.dumpedAt,
      })),
    [dumpedLeads],
  );

  const reasonOptions = useMemo(
    () => [...new Set(dumpedLeads.map((lead) => lead.dump?.reason).filter(Boolean))],
    [dumpedLeads],
  );

  const openRestoreModal = (lead) => {
    setRestoreTarget(lead);
    openModal("dump-restore-modal");
  };

  const openViewModal = (lead) => {
    setViewTarget(lead);
    openModal("dump-view-modal");
  };

  const openDeleteModal = (lead) => {
    setDeleteTarget(lead);
    openModal("dump-delete-modal");
  };

  const restoreLead = () => {
    if (!restoreTarget) return;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === restoreTarget.id
          ? {
              ...lead,
              status: lead.dump?.lastStatus || "Untouched",
              dump: null,
            }
          : lead,
      ),
    );

    setRestoreTarget(null);
    closeModal("dump-restore-modal");
  };

  const deleteLead = () => {
    if (!deleteTarget) return;

    setLeads((prev) => prev.filter((lead) => lead.id !== deleteTarget.id));
    setDeleteTarget(null);
    closeModal("dump-delete-modal");
  };

  return {
    tableRows,
    reasonOptions,
    viewTarget,
    restoreTarget,
    deleteTarget,
    openViewModal,
    openRestoreModal,
    openDeleteModal,
    restoreLead,
    deleteLead,
  };
}
