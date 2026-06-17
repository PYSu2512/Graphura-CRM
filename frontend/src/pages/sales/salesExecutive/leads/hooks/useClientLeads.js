import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { closeModal, openModal } from "../../../../../components/shared/Common_Components";
import {
  addLeadComment,
  createLeadProspect,
  fetchClientLeads,
  setLeadReminder,
  updateLeadStatus,
} from "../api/leadsApi";
import { STATUS_OPTIONS } from "../utils/leadConstants";

const DEFAULT_FOLLOW_UP_FORM = {
  date: "",
  type: "Call",
  priority: "Medium",
  notes: "",
};

const DEFAULT_PROSPECT_FORM = {
  contactPerson: "",
  company: "",
  priority: "Medium",
  requirement: "",
};

const ACTION_OPTIONS = ["Talk", "Interested", "Not Interested", "Follow Up", "Not Talk"];

// ─── Status helpers ───────────────────────────────────────────────────────────

const toDisplayStatus = (status, isDumped = false) => {
  if (isDumped) return "Dumped";
  if (!status) return "Untouched";
  const n = String(status).toUpperCase();
  if (n === "NOT_TALK")  return "Not Talk";
  if (n === "INTERESTED") return "Interested";
  if (n === "TALK")      return "Talk";
  if (n === "CONVERTED") return "Won";
  if (n === "DUMP" || n === "DUMPED") return "Dumped";
  if (n === "UNTOUCHED") return "Untouched";
  return String(status).toLowerCase().replace(/^./, (c) => c.toUpperCase());
};

const toBackendStatus = (status) => {
  const map = {
    Talk: "TALK",
    Interested: "INTERESTED",
    "Not Interested": "NOT_TALK",
    "Not Talk": "NOT_TALK",
    "Follow Up": "TALK",
    Dumped: "DUMPED",
    Untouched: "UNTOUCHED",
    Won: "CONVERTED",
    Converted: "CONVERTED",
  };
  return map[status] || status;
};

const getLeadId = (lead) => lead?.id || lead?._id || null;

const getApiErrorMessage = (error, fallback) => {
  const d = error?.response?.data;
  if (typeof d?.message === "string" && d.message.trim()) return d.message;
  if (typeof d?.data?.message === "string" && d.data.message.trim()) return d.data.message;
  if (typeof error?.message === "string" && error.message.trim()) return error.message;
  return fallback;
};

// ─── Toast helpers ────────────────────────────────────────────────────────────

const showAutoDumpToast = (leadName) =>
  toast.error(
    `🗑️ Lead Auto-Dumped: ${leadName} moved to Dump Leads after 3× Not Talk responses.`,
    {
      duration: 5000,
      style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", fontWeight: "600" },
    }
  );

const showInterestedToast = (leadName) =>
  toast.success(`🔥 Lead marked as Interested! Prospect form saved for ${leadName}.`, {
    duration: 4000,
    style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontWeight: "600" },
  });

const showTalkToast = (leadName) =>
  toast.success(`📞 Call logged for ${leadName}.`, {
    duration: 3000,
    style: { background: "#f0f9ff", color: "#0c4a6e", border: "1px solid #bae6fd", fontWeight: "600" },
  });

const showNotTalkToast = (leadName, notTalkCount) =>
  toast(`⚠️ Not Talk recorded for ${leadName}. Count: ${notTalkCount ?? "—"}`, {
    duration: 3000,
    style: { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", fontWeight: "600" },
  });

const showFollowUpToast = (leadName, dateStr) =>
  toast.success(`⏰ Follow-up scheduled for ${leadName} on ${new Date(dateStr).toLocaleString()}.`, {
    duration: 4000,
    style: { background: "#faf5ff", color: "#4c1d95", border: "1px solid #ddd6fe", fontWeight: "600" },
  });

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useClientLeads() {
  const [clientLeads,  setClientLeads]  = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [draftStatus,  setDraftStatus]  = useState(STATUS_OPTIONS[0]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [stats, setStats] = useState({
    totalLeads: 0, talk: 0, interested: 0, dumped: 0,
    untouched: 0, notTalk: 0, converted: 0,
  });

  const [commentLead,  setCommentLead]  = useState(null);
  const [commentText,  setCommentText]  = useState("");

  const [reminderDate, setReminderDate] = useState("");
  const [followUpForm, setFollowUpForm] = useState(DEFAULT_FOLLOW_UP_FORM);

  const [prospectLead, setProspectLead] = useState(null);
  const [prospectForm, setProspectForm] = useState(DEFAULT_PROSPECT_FORM);

  const [actionLead,   setActionLead]   = useState(null);
  const [actionValue,  setActionValue]  = useState(ACTION_OPTIONS[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Recompute stats from the current leads array ──
  const recomputeStats = (leads) =>
    setStats({
      totalLeads: leads.length,
      talk:       leads.filter((l) => l.status === "Talk").length,
      interested: leads.filter((l) => l.status === "Interested").length,
      dumped:     leads.filter((l) => l.status === "Dumped" || l.isDumped).length,
      untouched:  leads.filter((l) => l.status === "Untouched").length,
      notTalk:    leads.filter((l) => l.status === "Not Talk").length,
      converted:  leads.filter((l) => l.status === "Won").length,
    });

  // ── Sync a single lead across all state slices ──
  const syncLeadState = (leadId, updater) => {
    const applyToCurrent = (setter) =>
      setter((prev) => (prev && getLeadId(prev) === leadId ? updater(prev) : prev));

    setClientLeads((prev) => prev.map((row) => getLeadId(row) === leadId ? updater(row) : row));
    applyToCurrent(setSelectedLead);
    applyToCurrent(setCommentLead);
    applyToCurrent(setProspectLead);
    applyToCurrent(setActionLead);
  };

  // ── Remove a single lead from the active list (e.g. after auto-dump) ──
  const removeLead = (leadId) =>
    setClientLeads((prev) => prev.filter((l) => getLeadId(l) !== leadId));

  // ── Auto-recompute stats whenever leads array changes ──
  useEffect(() => {
    recomputeStats(clientLeads);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientLeads]);

  // ── Load all leads ──
  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const leads = await fetchClientLeads(true);
      if (!Array.isArray(leads)) throw new Error("Invalid response format from server");

      const normalized = leads.map((lead) => ({
        ...lead,
        companyName: lead.companyName || lead.company || "",
        company:     lead.companyName || lead.company || "",
        status:      lead.isDumped ? "Dumped" : toDisplayStatus(lead.status, false),
        isDumped:    Boolean(lead.isDumped),
      }));

      setClientLeads(normalized);
      recomputeStats(normalized);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load leads";
      setError(msg);
      setClientLeads([]);
      setStats({ totalLeads: 0, talk: 0, interested: 0, dumped: 0, untouched: 0, notTalk: 0, converted: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLeads(); }, []);

  // ── Open lead details modal ──
  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setDraftStatus(lead.status || STATUS_OPTIONS[0]);
    openModal("client-lead-details-modal");
  };

  // ── Save status from details modal ──
  const saveStatus = async () => {
    if (!selectedLead) return;
    const backendStatus = toBackendStatus(draftStatus);
    if (!backendStatus) return;

    try {
      setIsSubmitting(true);
      const updated      = await updateLeadStatus(selectedLead.id, backendStatus);
      const displayStatus = toDisplayStatus(updated.status, updated.isDumped);

      syncLeadState(selectedLead.id, (row) => ({
        ...row,
        status:    displayStatus,
        isDumped:  Boolean(updated.isDumped),
        talkCount:    updated.talkCount    ?? row.talkCount,
        notTalkCount: updated.notTalkCount ?? row.notTalkCount,
        convertedAt:  updated.convertedAt  ?? row.convertedAt,
        dumpReason:   updated.isDumped ? updated.dumpReason || row.dumpReason : row.dumpReason,
      }));

      setDraftStatus(displayStatus);
      closeModal("client-lead-details-modal");

      toast.success(`Status updated to ${displayStatus}.`, {
        duration: 3000,
        style: { background: "#f0f9ff", color: "#0c4a6e", border: "1px solid #bae6fd", fontWeight: "600" },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update lead status");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Move to dump (manual, kept for backward compat) ──
  const moveToDump = async (lead) => {
    try {
      setIsSubmitting(true);
      const updated = await updateLeadStatus(lead.id, "DUMPED");
      syncLeadState(lead.id, (row) => ({
        ...row,
        status:    toDisplayStatus(updated.status, true),
        isDumped:  true,
        dumpReason: updated.dumpReason || row.dumpReason,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to move lead to dump");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Comment modal ──
  const openCommentModal = (lead) => {
    setCommentLead(lead);
    setCommentText("");
    openModal("comment-modal");
  };

  const saveComment = async () => {
    if (!commentLead || !commentText.trim()) return;
    try {
      setIsSubmitting(true);
      await addLeadComment(commentLead.id, commentText.trim());

      syncLeadState(commentLead.id, (row) => ({
        ...row,
        comments: [...(row.comments || []), { text: commentText.trim(), date: new Date().toLocaleString() }],
      }));

      closeModal("comment-modal");
      setCommentText("");
      toast.success("Comment saved.", { duration: 2500 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reminder modal ──
  const openReminderModal = (lead) => {
    setSelectedLead(lead);
    const rv = lead.followUpAt || lead.reminder || "";
    setReminderDate(rv);
    setFollowUpForm({ ...DEFAULT_FOLLOW_UP_FORM, date: rv });
    openModal("reminder-modal");
  };

  const saveReminder = async () => {
    if (!selectedLead || !followUpForm.date) return;
    try {
      setIsSubmitting(true);
      const reminderDateTime = new Date(followUpForm.date).toISOString();
      if (Number.isNaN(new Date(reminderDateTime).getTime())) throw new Error("Invalid reminder date");

      await setLeadReminder(selectedLead.id, reminderDateTime, followUpForm.notes.trim() || null);

      syncLeadState(selectedLead.id, (row) => ({
        ...row,
        reminder:    followUpForm.date,
        followUpAt:  reminderDateTime,
        nextFollowUp: { ...followUpForm, createdAt: new Date().toLocaleString() },
        followUps:   [...(row.followUps || []), { ...followUpForm, createdAt: new Date().toLocaleString() }],
      }));

      closeModal("reminder-modal");
      toast.success("⏰ Follow-up reminder set successfully.", { duration: 3000 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set reminder");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Prospect form modal ──
  const openProspectForm = (lead) => {
    setProspectLead(lead);
    setProspectForm({
      ...DEFAULT_PROSPECT_FORM,
      contactPerson: lead.name || "",
      company:       lead.companyName || lead.company || "",
      requirement:   lead.notes || "",
    });
    openModal("prospect-form-modal");
  };

  const saveProspect = async () => {
    if (!prospectLead) return;
    if (!prospectForm.contactPerson.trim() || !prospectForm.company.trim()) {
      toast.error("Contact person and company are required before saving a prospect.");
      return;
    }
    try {
      setIsSubmitting(true);
      const leadId = getLeadId(prospectLead);
      if (!leadId) { toast.error("Lead id is missing."); return; }

      const payload = {
        contactPerson: prospectForm.contactPerson,
        company:       prospectForm.company,
        priority:      prospectForm.priority,
        requirement:   prospectForm.requirement,
      };
      const response = await createLeadProspect(leadId, payload);

      syncLeadState(leadId, (row) => ({
        ...row,
        status:   toDisplayStatus(response.status, response.isDumped),
        isDumped: Boolean(response.isDumped),
        prospect: { ...(response.prospect || payload), createdAt: new Date().toLocaleString() },
      }));

      closeModal("prospect-form-modal");
      showInterestedToast(prospectLead.name);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save prospect"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Open unified action modal ──
  const openActionModal = (lead) => {
    setActionLead(lead);
    // If lead is already Talked, default to the next logical step (Interested)
    setActionValue(lead.status === "Talk" ? "Interested" : "Talk");
    setCommentText("");
    setFollowUpForm({ ...DEFAULT_FOLLOW_UP_FORM, date: "" });
    setProspectForm({
      ...DEFAULT_PROSPECT_FORM,
      contactPerson: lead.name || "",
      company:       lead.companyName || lead.company || "",
      requirement:   lead.notes || "",
      priority:      "Medium",
    });
    openModal("lead-action-modal");
  };

  // ── Save unified action ──
  const saveLeadAction = async () => {
    if (!actionLead) return;
    const leadId = getLeadId(actionLead);
    if (!leadId) { toast.error("Lead id is missing. Please reopen and try again."); return; }

    const trimmedComment   = commentText.trim();
    const requiresComment  = ["Talk", "Not Interested", "Not Talk"].includes(actionValue);

    // Validation
    if (requiresComment && !trimmedComment) {
      toast.error("A comment is required for this action.");
      return;
    }
    if (actionValue === "Follow Up" && !followUpForm.date) {
      toast.error("Choose a follow-up date before saving.");
      return;
    }
    if (actionValue === "Interested" && (!prospectForm.contactPerson.trim() || !prospectForm.company.trim())) {
      toast.error("Contact person and company are required for a prospect.");
      return;
    }

    try {
      setIsSubmitting(true);

      // ── INTERESTED ──────────────────────────────────────────────────────────
      if (actionValue === "Interested") {
        const payload = {
          contactPerson: prospectForm.contactPerson,
          company:       prospectForm.company,
          priority:      prospectForm.priority,
          requirement:   prospectForm.requirement,
        };
        const response = await createLeadProspect(leadId, payload);

        syncLeadState(leadId, (row) => ({
          ...row,
          status:   toDisplayStatus(response.status, response.isDumped),
          isDumped: Boolean(response.isDumped),
          prospect: { ...(response.prospect || payload), createdAt: new Date().toLocaleString() },
        }));

        showInterestedToast(actionLead.name);
      }

      // ── TALK ─────────────────────────────────────────────────────────────────
      if (actionValue === "Talk") {
        const updated = await updateLeadStatus(leadId, "TALK", trimmedComment || null);

        syncLeadState(leadId, (row) => ({
          ...row,
          status:       toDisplayStatus(updated.status, updated.isDumped),
          isDumped:     Boolean(updated.isDumped),
          talkCount:    updated.talkCount    ?? row.talkCount,
          notTalkCount: updated.notTalkCount ?? row.notTalkCount,
        }));

        showTalkToast(actionLead.name);
      }

      // ── NOT TALK / NOT INTERESTED ─────────────────────────────────────────────
      if (actionValue === "Not Interested" || actionValue === "Not Talk") {
        const updated        = await updateLeadStatus(leadId, "NOT_TALK", trimmedComment);
        const wasAutoDumped  = Boolean(updated.isDumped);

        if (wasAutoDumped) {
          // Lead auto-dumped — remove from active list immediately
          removeLead(leadId);
          showAutoDumpToast(actionLead.name);
        } else {
          syncLeadState(leadId, (row) => ({
            ...row,
            status:       toDisplayStatus(updated.status, updated.isDumped),
            isDumped:     false,
            notTalkCount: updated.notTalkCount ?? row.notTalkCount,
          }));
          showNotTalkToast(actionLead.name, updated.notTalkCount);
        }
      }

      // ── FOLLOW UP ─────────────────────────────────────────────────────────────
      if (actionValue === "Follow Up") {
        const parsedFollowUp = new Date(followUpForm.date);
        if (Number.isNaN(parsedFollowUp.getTime())) {
          toast.error("Choose a valid follow-up date.");
          return;
        }
        if (parsedFollowUp.getTime() <= Date.now()) {
          toast.error("Follow-up date and time must be in the future.");
          return;
        }

        const reminderDateTime  = parsedFollowUp.toISOString();
        const followUpDesc      = [
          followUpForm.type ? `Type: ${followUpForm.type}` : null,
          followUpForm.notes.trim() || trimmedComment || null,
        ].filter(Boolean).join(" — ");

        const updated = await updateLeadStatus(leadId, "TALK", followUpDesc || null);
        await setLeadReminder(leadId, reminderDateTime, followUpDesc || null);

        syncLeadState(leadId, (row) => ({
          ...row,
          status:      toDisplayStatus(updated.status, updated.isDumped),
          isDumped:    Boolean(updated.isDumped),
          followUpAt:  reminderDateTime,
          reminder:    followUpForm.date,
          nextFollowUp: { ...followUpForm, createdAt: new Date().toLocaleString() },
          followUps:   [...(row.followUps || []), { ...followUpForm, createdAt: new Date().toLocaleString() }],
        }));

        showFollowUpToast(actionLead.name, followUpForm.date);
      }

      closeModal("lead-action-modal");
      setActionLead(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save lead action"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    clientLeads,
    loading,
    error,
    stats,
    loadLeads,

    selectedLead,
    draftStatus,
    setDraftStatus,

    commentLead,
    commentText,
    setCommentText,

    reminderDate,
    setReminderDate,
    followUpForm,
    setFollowUpForm,

    prospectLead,
    prospectForm,
    setProspectForm,

    openLeadDetails,
    saveStatus,
    moveToDump,

    openCommentModal,
    saveComment,
    openReminderModal,
    saveReminder,
    openProspectForm,
    saveProspect,

    actionLead,
    actionValue,
    setActionValue,
    openActionModal,
    saveLeadAction,

    isSubmitting,
  };
}

export default useClientLeads;
