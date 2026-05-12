import { useMemo } from "react";
import {
  DashGrid,
  EnhancedDashCard,
  Heading,
} from "../../../../components/shared/Common_Components";
import { Archive, Flame, PhoneCall, Users, Loader2, AlertTriangle } from "lucide-react";
import { ClientLeadsTable } from "./components/ClientLeadsTable";
import { ClientLeadDetailsModal } from "./components/ClientLeadDetailsModal";
import { CommentModal } from "./components/CommentModal";
import { ProspectFormModal } from "./components/ProspectFormModal";
import { ReminderModal } from "./components/ReminderModal";
import { ActionModal } from "./components/ActionModal";
import { useClientLeads } from "./hooks/useClientLeads";

export default function LeadsPage() {
  const {
    clientLeads,
    selectedLead,
    draftStatus,
    setDraftStatus,
    loading,
    error,
    stats,
    loadLeads,

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

    saveComment,
    saveReminder,
    saveProspect,

    // Action modal
    actionLead,
    actionValue,
    setActionValue,
    openActionModal,
    saveLeadAction,
  } = useClientLeads();

  const dashboardStats = useMemo(
    () => [
      {
        title: "Total Leads",
        value: String(stats.totalLeads || 0),
        icon: <Users size={22} />,
        accentColor: "#38bdf8",
      },
      {
        title: "Talk",
        value: String(stats.talk || 0),
        icon: <PhoneCall size={22} />,
        accentColor: "#22c55e",
      },
      {
        title: "Interested",
        value: String(stats.interested || 0),
        icon: <Flame size={22} />,
        accentColor: "#f59e0b",
      },
      {
        title: "Dumped",
        value: String(stats.dumped || 0),
        icon: <Archive size={22} />,
        accentColor: "#f43f5e",
      },
    ],
    [stats]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Heading primaryText="All Leads" />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
          <button
            onClick={loadLeads}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <DashGrid cols={12} gap={4}>
        {dashboardStats.map((item) => (
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

      {loading ? (
        <div className="p-8 bg-slate-50 rounded-lg flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your leads...</p>
        </div>
      ) : (
        <ClientLeadsTable
          leads={clientLeads}
          onOpenLead={openLeadDetails}
          onMoveToDump={moveToDump}
          onOpenActionModal={openActionModal}
        />
      )}

      <ClientLeadDetailsModal
        selectedLead={selectedLead}
        draftStatus={draftStatus}
        setDraftStatus={setDraftStatus}
        saveStatus={saveStatus}
      />

      <ActionModal
        selectedLead={actionLead}
        actionValue={actionValue}
        setActionValue={setActionValue}
        commentText={commentText}
        setCommentText={setCommentText}
        followUpForm={followUpForm}
        setFollowUpForm={setFollowUpForm}
        prospectForm={prospectForm}
        setProspectForm={setProspectForm}
        onSave={saveLeadAction}
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
