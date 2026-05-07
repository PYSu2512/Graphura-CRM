import { useEffect, useState } from "react";
import {
  closeModal,
  openModal,
} from "../../../../../components/shared/Common_Components";
import { fetchClientLeads } from "../api/leadsApi";
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
  value: "",
  probability: "60",
  expectedClose: "",
  stage: "Interested",
  priority: "Medium",
  requirement: "",
};

const ACTION_OPTIONS = [
  "Interested",
  "Not Interested",
  "Follow Up",
  "Not Talk",
];

export function useClientLeads() {
  const [clientLeads, setClientLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [draftStatus, setDraftStatus] = useState(STATUS_OPTIONS[0]);

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

  useEffect(() => {
    fetchClientLeads().then((leads) => {
      // Auto-mark leads with no activity as "Untouched"
      const processed = leads.map((lead) => {
        const hasActivity =
          (lead.comments && lead.comments.length > 0) ||
          (lead.followUps && lead.followUps.length > 0) ||
          (lead.lastContact && lead.lastContact !== lead.assignedAt);
        if (!hasActivity && lead.status !== "Dumped" && lead.status !== "Interested") {
          return { ...lead, status: "Untouched" };
        }
        return lead;
      });
      setClientLeads(processed);
    });
  }, []);

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setDraftStatus(lead.status || STATUS_OPTIONS[0]);
    openModal("client-lead-details-modal");
  };

  const saveStatus = () => {
    if (!selectedLead) return;
    setClientLeads((prev) =>
      prev.map((row) =>
        row.id === selectedLead.id ? { ...row, status: draftStatus } : row,
      ),
    );
    setSelectedLead((prev) => (prev ? { ...prev, status: draftStatus } : prev));
  };

  const moveToDump = (lead) => {
    setClientLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id ? { ...row, status: "Dumped" } : row,
      ),
    );
  };

  // Existing comment modal handlers
  const openCommentModal = (lead) => {
    setCommentLead(lead);
    setCommentText("");
    openModal("comment-modal");
  };

  const saveComment = () => {
    if (!commentLead || !commentText.trim()) return;
    setClientLeads((prev) =>
      prev.map((row) =>
        row.id === commentLead.id
          ? {
              ...row,
              comments: [
                ...(row.comments || []),
                {
                  text: commentText.trim(),
                  date: new Date().toLocaleString(),
                },
              ],
            }
          : row,
      ),
    );
    closeModal("comment-modal");
  };

  // Existing reminder modal handlers
  const openReminderModal = (lead) => {
    setSelectedLead(lead);
    setReminderDate(lead.reminder || "");
    setFollowUpForm({ ...DEFAULT_FOLLOW_UP_FORM, date: lead.reminder || "" });
    openModal("reminder-modal");
  };

  const saveReminder = () => {
    if (!selectedLead || !followUpForm.date) return;
    setClientLeads((prev) =>
      prev.map((row) =>
        row.id === selectedLead.id
          ? {
              ...row,
              reminder: followUpForm.date,
              nextFollowUp: {
                ...followUpForm,
                createdAt: new Date().toLocaleString(),
              },
              followUps: [
                ...(row.followUps || []),
                { ...followUpForm, createdAt: new Date().toLocaleString() },
              ],
            }
          : row,
      ),
    );
    closeModal("reminder-modal");
  };

  // Existing prospect modal handlers
  const openProspectForm = (lead) => {
    setProspectLead(lead);
    setProspectForm({
      ...DEFAULT_PROSPECT_FORM,
      contactPerson: lead.name || "",
      company: lead.company || "",
      requirement: lead.notes || "",
    });
    openModal("prospect-form-modal");
  };

  const saveProspect = () => {
    if (!prospectLead) return;

    setClientLeads((prev) =>
      prev.map((row) =>
        row.id === prospectLead.id
          ? {
              ...row,
              status: "Interested",
              prospect: {
                ...prospectForm,
                createdAt: new Date().toLocaleString(),
              },
            }
          : row,
      ),
    );

    closeModal("prospect-form-modal");
  };

  const handleCallLead = (lead) => {
    window.open(`tel:${lead.phone}`);
  };

  const handleWhatsAppLead = (lead) => {
    const clean = lead.phone.replace(/\D/g, "");
    const phone = clean.startsWith("91") ? clean : `91${clean}`;
    const msg = `Hi ${lead.name}, following up regarding your query.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  };

  // ─────────────────────────────────────────────────────────────
  // New unified Action modal handlers
  // ─────────────────────────────────────────────────────────────
  const openActionModal = (lead) => {
    setActionLead(lead);
    setActionValue("Interested");
    setCommentText("");

    setFollowUpForm({ ...DEFAULT_FOLLOW_UP_FORM, date: "" });

    setProspectForm({
      ...DEFAULT_PROSPECT_FORM,
      contactPerson: lead.name || "",
      company: lead.company || "",
      requirement: lead.notes || "",
      stage: "Interested",
      priority: "Medium",
      probability: "60",
    });

    openModal("lead-action-modal");
  };

  const saveLeadAction = () => {
    if (!actionLead) return;

    const trimmedComment = commentText.trim();

    const requiredComment =
      actionValue === "Not Interested" || actionValue === "Not Talk";

    if (requiredComment && !trimmedComment) return;

    if (actionValue === "Follow Up" && !followUpForm.date) return;

    const prospectNeedsCompany = actionValue === "Interested";

    if (prospectNeedsCompany) {
      if (!prospectForm.contactPerson.trim() || !prospectForm.company.trim())
        return;
    }

    setClientLeads((prev) =>
      prev.map((row) => {
        if (row.id !== actionLead.id) return row;

        if (actionValue === "Interested") {
          return {
            ...row,
            status: "Interested",
            prospect: {
              ...prospectForm,
              createdAt: new Date().toLocaleString(),
            },
          };
        }

        if (actionValue === "Follow Up") {
          return {
            ...row,
            status: "Talk",
            reminder: followUpForm.date,
            nextFollowUp: {
              ...followUpForm,
              createdAt: new Date().toLocaleString(),
            },
            followUps: [
              ...(row.followUps || []),
              {
                ...followUpForm,
                createdAt: new Date().toLocaleString(),
              },
            ],
          };
        }

        if (actionValue === "Not Interested") {
          return {
            ...row,
            status: "Not Talk",
            comments: [
              ...(row.comments || []),
              {
                text: trimmedComment,
                date: new Date().toLocaleString(),
              },
            ],
          };
        }

        if (actionValue === "Not Talk") {
          return {
            ...row,
            status: "Not Talk",
            comments: [
              ...(row.comments || []),
              {
                text: trimmedComment,
                date: new Date().toLocaleString(),
              },
            ],
          };
        }

        return row;
      }),
    );

    closeModal("lead-action-modal");
  };

  return {
    clientLeads,

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

    handleCallLead,
    handleWhatsAppLead,

    // new action modal state/handlers
    actionLead,
    actionValue,
    setActionValue,
    openActionModal,
    saveLeadAction,
    setActionLead,
  };
}
