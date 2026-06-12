import { useEffect, useState } from "react";
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

const toDisplayStatus = (status, isDumped = false) => {
  if (isDumped) return "Dumped";
  if (!status) return "Untouched";

  const normalized = String(status).toUpperCase();
  if (normalized === "NOT_TALK") return "Not Talk";
  if (normalized === "INTERESTED") return "Interested";
  if (normalized === "TALK") return "Talk";
  if (normalized === "CONVERTED") return "Won";
  if (normalized === "DUMP" || normalized === "DUMPED") return "Dumped";
  if (normalized === "UNTOUCHED") return "Untouched";

  return String(status)
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
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
  const responseData = error?.response?.data;
  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }
  if (typeof responseData?.data?.message === "string" && responseData.data.message.trim()) {
    return responseData.data.message;
  }
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

export function useClientLeads() {
  const [clientLeads, setClientLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [draftStatus, setDraftStatus] = useState(STATUS_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    talk: 0,
    interested: 0,
    dumped: 0,
    untouched: 0,
    notTalk: 0,
    converted: 0,
  });

  // Existing comment flow (Add Comment)
  const [commentLead, setCommentLead] = useState(null);
  const [commentText, setCommentText] = useState("");

  // Existing follow-up modal flow
  const [reminderDate, setReminderDate] = useState("");
  const [followUpForm, setFollowUpForm] = useState(DEFAULT_FOLLOW_UP_FORM);

  // Existing prospect form modal flow
  const [prospectLead, setProspectLead] = useState(null);
  const [prospectForm, setProspectForm] = useState(DEFAULT_PROSPECT_FORM);

  // New unified action flow
  const [actionLead, setActionLead] = useState(null);
  const [actionValue, setActionValue] = useState(ACTION_OPTIONS[0]);

  // Loading states for async operations
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syncLeadState = (leadId, updater) => {
    const applyToCurrent = (setter) => {
      setter((prev) => (prev && getLeadId(prev) === leadId ? updater(prev) : prev));
    };

    setClientLeads((prev) => prev.map((row) => (getLeadId(row) === leadId ? updater(row) : row)));
    applyToCurrent(setSelectedLead);
    applyToCurrent(setCommentLead);
    applyToCurrent(setProspectLead);
    applyToCurrent(setActionLead);
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const leads = await fetchClientLeads(true);
      if (!Array.isArray(leads)) {
        throw new Error("Invalid response format from server");
      }

      const normalized = leads.map((lead) => ({
        ...lead,
        companyName: lead.companyName || lead.company || "",
        company: lead.companyName || lead.company || "",
        status: lead.isDumped ? "Dumped" : toDisplayStatus(lead.status, false),
        isDumped: Boolean(lead.isDumped),
      }));

      setClientLeads(normalized);
      setStats({
        totalLeads: normalized.length,
        talk: normalized.filter((l) => l.status === "Talk").length,
        interested: normalized.filter((l) => l.status === "Interested").length,
        dumped: normalized.filter((l) => l.status === "Dumped" || l.isDumped).length,
        untouched: normalized.filter((l) => l.status === "Untouched").length,
        notTalk: normalized.filter((l) => l.status === "Not Talk").length,
        converted: normalized.filter((l) => l.status === "Won").length,
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to load leads";
      setError(errorMsg);
      console.error("Error loading leads:", errorMsg);
      setClientLeads([]);
      setStats({ totalLeads: 0, talk: 0, interested: 0, dumped: 0, untouched: 0, notTalk: 0, converted: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setDraftStatus(lead.status || STATUS_OPTIONS[0]);
    openModal("client-lead-details-modal");
  };

  const saveStatus = async () => {
    if (!selectedLead) return;

    const backendStatus = toBackendStatus(draftStatus);
    if (!backendStatus) return;

    try {
      setIsSubmitting(true);
      const updated = await updateLeadStatus(selectedLead.id, backendStatus);
      const displayStatus = toDisplayStatus(updated.status, updated.isDumped);

      syncLeadState(selectedLead.id, (row) => ({
        ...row,
        status: displayStatus,
        isDumped: Boolean(updated.isDumped),
        talkCount: updated.talkCount ?? row.talkCount,
        notTalkCount: updated.notTalkCount ?? row.notTalkCount,
        convertedAt: updated.convertedAt ?? row.convertedAt,
        dumpReason: updated.isDumped ? updated.dumpReason || row.dumpReason : row.dumpReason,
      }));

      setDraftStatus(displayStatus);
      closeModal("client-lead-details-modal");
    } catch (err) {
      console.error("Error updating lead status:", err);
      alert(err.response?.data?.message || "Failed to update lead status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveToDump = async (lead) => {
    try {
      setIsSubmitting(true);
      const updated = await updateLeadStatus(lead.id, "DUMPED");

      syncLeadState(lead.id, (row) => ({
        ...row,
        status: toDisplayStatus(updated.status, true),
        isDumped: true,
        dumpReason: updated.dumpReason || row.dumpReason,
      }));
    } catch (err) {
      console.error("Error moving lead to dump:", err);
      alert(err.response?.data?.message || "Failed to move lead to dump");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        comments: [
          ...(row.comments || []),
          {
            text: commentText.trim(),
            date: new Date().toLocaleString(),
          },
        ],
      }));

      closeModal("comment-modal");
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
      alert(err.response?.data?.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReminderModal = (lead) => {
    setSelectedLead(lead);
    const reminderValue = lead.followUpAt || lead.reminder || "";
    setReminderDate(reminderValue);
    setFollowUpForm({ ...DEFAULT_FOLLOW_UP_FORM, date: reminderValue });
    openModal("reminder-modal");
  };

  const saveReminder = async () => {
    if (!selectedLead || !followUpForm.date) return;

    try {
      setIsSubmitting(true);
      const reminderDateTime = new Date(followUpForm.date).toISOString();
      if (Number.isNaN(new Date(reminderDateTime).getTime())) {
        throw new Error("Invalid reminder date");
      }

      await setLeadReminder(selectedLead.id, reminderDateTime, followUpForm.notes.trim() || null);

      syncLeadState(selectedLead.id, (row) => ({
        ...row,
        reminder: followUpForm.date,
        followUpAt: reminderDateTime,
        nextFollowUp: {
          ...followUpForm,
          createdAt: new Date().toLocaleString(),
        },
        followUps: [
          ...(row.followUps || []),
          { ...followUpForm, createdAt: new Date().toLocaleString() },
        ],
      }));

      closeModal("reminder-modal");
    } catch (err) {
      console.error("Error setting reminder:", err);
      alert(err.response?.data?.message || "Failed to set reminder");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openProspectForm = (lead) => {
    setProspectLead(lead);
    setProspectForm({
      ...DEFAULT_PROSPECT_FORM,
      contactPerson: lead.name || "",
      company: lead.companyName || lead.company || "",
      requirement: lead.notes || "",
    });
    openModal("prospect-form-modal");
  };

  const saveProspect = async () => {
    if (!prospectLead) return;
    if (!prospectForm.contactPerson.trim() || !prospectForm.company.trim()) {
      alert("Contact person and company are required before saving a prospect.");
      return;
    }

    try {
      setIsSubmitting(true);
      const leadId = getLeadId(prospectLead);
      if (!leadId) {
        alert("Lead id is missing. Please reopen the lead and try again.");
        return;
      }
      const payload = {
        contactPerson: prospectForm.contactPerson,
        company: prospectForm.company,
        priority: prospectForm.priority,
        requirement: prospectForm.requirement,
      };
      const response = await createLeadProspect(leadId, payload);

      syncLeadState(leadId, (row) => ({
        ...row,
        status: toDisplayStatus(response.status, response.isDumped),
        isDumped: Boolean(response.isDumped),
        prospect: {
          ...(response.prospect || payload),
          createdAt: new Date().toLocaleString(),
        },
      }));

      closeModal("prospect-form-modal");
    } catch (err) {
      console.error("Error saving prospect:", err);
      alert(getApiErrorMessage(err, "Failed to save prospect"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallLead = (lead) => {
    window.open(`tel:${lead.mobile}`);
  };

  const handleWhatsAppLead = (lead) => {
    const clean = lead.mobile.replace(/\D/g, "");
    const phone = clean.startsWith("91") ? clean : `91${clean}`;
    const msg = `Hi ${lead.name}, following up regarding your query.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  };

  const openActionModal = (lead) => {
    setActionLead(lead);
    setActionValue("Interested");
    setCommentText("");
    setFollowUpForm({ ...DEFAULT_FOLLOW_UP_FORM, date: "" });
    setProspectForm({
      ...DEFAULT_PROSPECT_FORM,
      contactPerson: lead.name || "",
      company: lead.companyName || lead.company || "",
      requirement: lead.notes || "",
      priority: "Medium",
    });
    openModal("lead-action-modal");
  };

  const saveLeadAction = async () => {
    if (!actionLead) return;
    const leadId = getLeadId(actionLead);
    if (!leadId) {
      alert("Lead id is missing. Please reopen the lead and try again.");
      return;
    }

    const trimmedComment = commentText.trim();
    const requiresComment = ["Talk", "Not Interested", "Not Talk"].includes(actionValue);

    if (requiresComment && !trimmedComment) {
      alert("A comment is required for this action.");
      return;
    }
    if (actionValue === "Follow Up" && !followUpForm.date) {
      alert("Choose a follow-up date before saving.");
      return;
    }
    if (actionValue === "Interested" && (!prospectForm.contactPerson.trim() || !prospectForm.company.trim())) {
      alert("Contact person and company are required for a prospect.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (actionValue === "Interested") {
        const payload = {
          contactPerson: prospectForm.contactPerson,
          company: prospectForm.company,
          priority: prospectForm.priority,
          requirement: prospectForm.requirement,
        };
        const response = await createLeadProspect(leadId, payload);
        syncLeadState(leadId, (row) => ({
          ...row,
          status: toDisplayStatus(response.status, response.isDumped),
          isDumped: Boolean(response.isDumped),
          prospect: {
            ...(response.prospect || payload),
            createdAt: new Date().toLocaleString(),
          },
        }));
      }

      if (actionValue === "Talk") {
        const updated = await updateLeadStatus(leadId, "TALK", trimmedComment || null);
        syncLeadState(leadId, (row) => ({
          ...row,
          status: toDisplayStatus(updated.status, updated.isDumped),
          isDumped: Boolean(updated.isDumped),
          talkCount: updated.talkCount ?? row.talkCount,
          notTalkCount: updated.notTalkCount ?? row.notTalkCount,
        }));
      }

      if (actionValue === "Not Interested" || actionValue === "Not Talk") {
        const updated = await updateLeadStatus(leadId, "NOT_TALK", trimmedComment);
        syncLeadState(leadId, (row) => ({
          ...row,
          status: toDisplayStatus(updated.status, updated.isDumped),
          isDumped: Boolean(updated.isDumped),
          notTalkCount: updated.notTalkCount ?? row.notTalkCount,
          dumpReason: updated.isDumped ? updated.dumpReason || row.dumpReason : row.dumpReason,
        }));
      }

      if (actionValue === "Follow Up") {
        const parsedFollowUp = new Date(followUpForm.date);
        if (Number.isNaN(parsedFollowUp.getTime())) {
          alert("Choose a valid follow-up date before saving.");
          return;
        }
        if (parsedFollowUp.getTime() <= Date.now()) {
          alert("Follow-up date and time must be in the future.");
          return;
        }
        const reminderDateTime = parsedFollowUp.toISOString();
        const followUpDescription = [
          followUpForm.type ? `Type: ${followUpForm.type}` : null,
          followUpForm.notes.trim() || trimmedComment || null,
        ]
          .filter(Boolean)
          .join(" — ");
        const commentForFollowUp = followUpDescription || null;
        const updated = await updateLeadStatus(leadId, "TALK", commentForFollowUp);
        await setLeadReminder(leadId, reminderDateTime, followUpDescription || null);

        syncLeadState(leadId, (row) => ({
          ...row,
          status: toDisplayStatus(updated.status, updated.isDumped),
          isDumped: Boolean(updated.isDumped),
          followUpAt: reminderDateTime,
          reminder: followUpForm.date,
          nextFollowUp: {
            ...followUpForm,
            createdAt: new Date().toLocaleString(),
          },
          followUps: [
            ...(row.followUps || []),
            { ...followUpForm, createdAt: new Date().toLocaleString() },
          ],
        }));
      }

      closeModal("lead-action-modal");
      setActionLead(null);
    } catch (err) {
      console.error("Error saving lead action:", err);
      alert(getApiErrorMessage(err, "Failed to save lead action"));
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

    // existing openings/saves
    openLeadDetails,
    saveStatus,
    moveToDump,

    openCommentModal,
    saveComment,
    openReminderModal,
    saveReminder,
    openProspectForm,
    saveProspect,

    // New action modal
    actionLead,
    actionValue,
    setActionValue,
    openActionModal,
    saveLeadAction,

    // Submission state
    isSubmitting,
  };

}

export default useClientLeads;
