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

export function useClientLeads() {
  const [clientLeads, setClientLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [draftStatus, setDraftStatus] = useState(STATUS_OPTIONS[0]);
  const [commentLead, setCommentLead] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [followUpForm, setFollowUpForm] = useState(DEFAULT_FOLLOW_UP_FORM);
  const [prospectLead, setProspectLead] = useState(null);
  const [prospectForm, setProspectForm] = useState(DEFAULT_PROSPECT_FORM);

  useEffect(() => {
    fetchClientLeads().then((leads) => setClientLeads(leads));
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

  const openReminderModal = (lead) => {
    setSelectedLead(lead);
    setReminderDate(lead.reminder || "");
    setFollowUpForm({
      ...DEFAULT_FOLLOW_UP_FORM,
      date: lead.reminder || "",
    });
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
                {
                  ...followUpForm,
                  createdAt: new Date().toLocaleString(),
                },
              ],
            }
          : row,
      ),
    );
    closeModal("reminder-modal");
  };

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
  };
}
