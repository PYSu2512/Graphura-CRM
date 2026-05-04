// View assigned leads
// Filter (Talk / Not Talk / Untouched / Interested)
// Call / WhatsApp
// Add comments
// Set reminders
// Update status
// Fill prospect form
// Move to dump

import { useMemo } from "react";
import {
  DashCard,
  DashGrid,
} from "../../../../components/shared/Common_Components";
import { Archive, Flame, PhoneCall, Users } from "lucide-react";
import { ClientLeadsTable } from "./components/ClientLeadsTable";
import { ClientLeadDetailsModal } from "./components/ClientLeadDetailsModal";
import { CommentModal } from "./components/CommentModal";
import { ProspectFormModal } from "./components/ProspectFormModal";
import { ReminderModal } from "./components/ReminderModal";
import { useClientLeads } from "./hooks/useClientLeads";

export default function LeadsPage() {
  const {
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
  } = useClientLeads();

  const stats = useMemo(() => {
    const countByStatus = (status) =>
      clientLeads.filter((lead) => lead.status === status).length;

    return [
      {
        title: "Total Leads",
        value: String(clientLeads.length),
        icon: <Users size={22} />,
        accentColor: "#38bdf8",
      },
      {
        title: "Talk",
        value: String(countByStatus("Talk")),
        icon: <PhoneCall size={22} />,
        accentColor: "#22c55e",
      },
      {
        title: "Interested",
        value: String(countByStatus("Interested")),
        icon: <Flame size={22} />,
        accentColor: "#f59e0b",
      },
      {
        title: "Dumped",
        value: String(countByStatus("Dumped")),
        icon: <Archive size={22} />,
        accentColor: "#f43f5e",
      },
    ];
  }, [clientLeads]);

  return (
    <div className="space-y-6">
      <DashGrid cols={12} gap={4}>
        {stats.map((item) => (
          <DashCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            accentColor={item.accentColor}
            size={3}
          />
        ))}
      </DashGrid>

      <ClientLeadsTable
        leads={clientLeads}
        onOpenLead={openLeadDetails}
        onCallLead={handleCallLead}
        onWhatsAppLead={handleWhatsAppLead}
        onOpenComment={openCommentModal}
        onOpenReminder={openReminderModal}
        onOpenProspectForm={openProspectForm}
        onMoveToDump={moveToDump}
      />

      <ClientLeadDetailsModal
        selectedLead={selectedLead}
        draftStatus={draftStatus}
        setDraftStatus={setDraftStatus}
        saveStatus={saveStatus}
      />

      <CommentModal
        commentLead={commentLead}
        commentText={commentText}
        setCommentText={setCommentText}
        onSave={saveComment}
      />

      <ReminderModal
        followUpForm={followUpForm}
        setFollowUpForm={setFollowUpForm}
        reminderDate={reminderDate}
        setReminderDate={setReminderDate}
        onSave={saveReminder}
      />

      <ProspectFormModal
        prospectLead={prospectLead}
        prospectForm={prospectForm}
        setProspectForm={setProspectForm}
        onSave={saveProspect}
      />
    </div>
  );
}
