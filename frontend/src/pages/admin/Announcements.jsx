import { useEffect, useMemo, useState } from "react";
import {
  Heading,
  DashGrid,
  Grid,
  DataField,
  Button,
  SelectField,
  Option,
  DataTable,
  openModal,
  closeModal,
  Modal,
  ModalData,
  ModalGrid,
} from "../../components/shared/Common_Components";
import DatePicker from "../../components/shared/DatePicker";
import { Eye, Loader2 } from "lucide-react";
import {
  fetchAnnouncementMeta,
  fetchAnnouncementTargets,
  createAnnouncement,
  fetchAnnouncements,
} from "../../services/announcementService";

const ANN_COLS = [
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "audience", label: "Audience" },
  { key: "audienceDetail", label: "Target" },
  { key: "sentDate", label: "Sent Date" },
  { key: "expiryDate", label: "Expiry Date" },
  { key: "status", label: "Status" },
];

const blank = {
  type: "",
  audience: "",
  targetId: "",
  title: "",
  body: "",
  expiryDate: "",
};

const TARGETED_AUDIENCES = new Set(["Department", "Team", "Executive", "Employee"]);

const TYPE_STYLE = {
  Warning: "bg-amber-50 border-amber-200",
  Appreciation: "bg-emerald-50 border-emerald-200",
  Announcement: "bg-blue-50 border-blue-200",
};

const TYPE_TITLE_STYLE = {
  Warning: "text-amber-800",
  Appreciation: "text-emerald-800",
  Announcement: "text-blue-900",
};

const TYPE_BADGE_STYLE = {
  Warning: "bg-amber-100 text-amber-700",
  Appreciation: "bg-emerald-100 text-emerald-700",
  Announcement: "bg-blue-100 text-blue-700",
};

const TYPE_DIVIDER = {
  Warning: "bg-amber-200",
  Appreciation: "bg-emerald-200",
  Announcement: "bg-blue-200",
};

export default function AdminAnnouncements() {
  const [form, setForm] = useState(blank);
  const [formErr, setFormErr] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const [messageTypes, setMessageTypes] = useState([]);
  const [audienceOptions, setAudienceOptions] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);

  const [targets, setTargets] = useState([]);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [viewRow, setViewRow] = useState(null);

  const needsTarget = TARGETED_AUDIENCES.has(form.audience);
  const selectedTarget = useMemo(
    () => targets.find((target) => String(target.id) === String(form.targetId)),
    [targets, form.targetId],
  );

  useEffect(() => {
    fetchAnnouncementMeta()
      .then(({ messageTypes: types, audienceOptions: audiences }) => {
        setMessageTypes((types || []).map((type) => type.label));
        setAudienceOptions(audiences || []);
        setForm((current) => ({
          ...current,
          type: current.type || types?.[0]?.label || "Announcement",
          audience: current.audience || audiences?.[0] || "All",
        }));
      })
      .catch(() => {
        setMessageTypes(["Announcement", "Warning", "Appreciation"]);
        setAudienceOptions(["All", "Department", "Managers", "Team Leaders", "Employees"]);
        setForm((current) => ({ ...current, type: "Announcement", audience: "All" }));
      })
      .finally(() => setMetaLoading(false));
  }, []);

  useEffect(() => {
    fetchAnnouncements({ page: 1, limit: 50 })
      .then(({ announcements: list }) => setAnnouncements(list || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    if (!form.audience || !needsTarget) {
      setTargets([]);
      return;
    }

    setTargetsLoading(true);
    fetchAnnouncementTargets(form.audience)
      .then(({ targets: list }) => setTargets(list || []))
      .catch(() => setTargets([]))
      .finally(() => setTargetsLoading(false));
  }, [form.audience, needsTarget]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (formErr[key]) setFormErr((current) => ({ ...current, [key]: "" }));
    setSubmitErr("");
  };

  const handleSubmit = async () => {
    const errs = {};
    if (!form.type.trim()) errs.type = "Type is required.";
    if (!form.audience.trim()) errs.audience = "Audience is required.";
    if (needsTarget && !form.targetId) errs.targetId = `Please select a ${form.audience.toLowerCase()}.`;
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.body.trim()) errs.body = "Message is required.";
    if (Object.keys(errs).length) {
      setFormErr(errs);
      return;
    }

    setSubmitting(true);
    setSubmitErr("");
    try {
      const created = await createAnnouncement({
        title: form.title.trim(),
        message: form.body.trim(),
        type: form.type,
        audience: form.audience,
        targetId: form.targetId || null,
        expiryDate: form.expiryDate || null,
      });

      setAnnouncements((current) => [created, ...current]);
      setForm((current) => ({
        ...blank,
        type: current.type || "Announcement",
        audience: current.audience || "All",
      }));
      setTargets([]);
      setFormErr({});
    } catch (err) {
      setSubmitErr(err?.message || "Failed to send announcement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const actions = [
    {
      icon: <Eye size={15} />,
      tooltip: "View",
      variant: "ghost",
      onClick: (row) => {
        setViewRow(row);
        openModal("admin-ann-view");
      },
    },
  ];

  if (metaLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Announcements" secondaryText="Admin" size={12} />
      </DashGrid>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <p className="text-sm font-black text-[#2a465a] mb-5">Create New Announcement</p>

        <Grid cols={12} gap={4}>
          <div className="col-span-12 sm:col-span-6">
            <SelectField
              label="Message Type *"
              id="admin-ann-type"
              size={12}
              placeholder="Select type..."
              value={form.type}
              onChange={(event) => setField("type", event.target.value)}
            >
              {messageTypes.map((type) => (
                <Option key={type} value={type} label={type} />
              ))}
            </SelectField>
            {formErr.type && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.type}</p>}
          </div>

          <div className="col-span-12 sm:col-span-6">
            <SelectField
              label="Send To *"
              id="admin-ann-audience"
              size={12}
              placeholder="Select audience..."
              value={form.audience}
              onChange={(event) => {
                setField("audience", event.target.value);
                setField("targetId", "");
                setTargets([]);
              }}
            >
              {audienceOptions.map((audience) => (
                <Option key={audience} value={audience} label={audience} />
              ))}
            </SelectField>
            {formErr.audience && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.audience}</p>}
          </div>

          {needsTarget && (
            <div className="col-span-12 sm:col-span-6">
              {targetsLoading ? (
                <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
                  <Loader2 size={14} className="animate-spin" /> Loading targets...
                </div>
              ) : (
                <>
                  <SelectField
                    label={`Select ${form.audience} *`}
                    id="admin-ann-target"
                    size={12}
                    placeholder={`Select ${form.audience.toLowerCase()}...`}
                    value={form.targetId}
                    onChange={(event) => setField("targetId", event.target.value)}
                  >
                    {targets.map((target) => (
                      <Option key={target.id} value={target.id} label={target.label} />
                    ))}
                  </SelectField>
                  {targets.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1 px-1">
                      No {form.audience.toLowerCase()} found.
                    </p>
                  )}
                </>
              )}
              {formErr.targetId && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.targetId}</p>}
            </div>
          )}

          <div className="col-span-12 sm:col-span-6">
            <DatePicker
              label="Expiry Date (optional)"
              id="admin-ann-expiry"
              value={form.expiryDate}
              onChange={(value) => setField("expiryDate", value)}
              placeholder="Select expiry date"
            />
          </div>

          <div className="col-span-12">
            <DataField
              label="Title *"
              id="admin-ann-title"
              size={12}
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="Announcement title..."
            />
            {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
          </div>

          <div className="col-span-12">
            <DataField
              label="Message *"
              id="admin-ann-body"
              type="textarea"
              rows={4}
              size={12}
              value={form.body}
              onChange={(event) => setField("body", event.target.value)}
              placeholder="Write your announcement here..."
            />
            {formErr.body && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.body}</p>}
          </div>

          {(form.title.trim() || form.body.trim()) && (
            <div className="col-span-12">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Preview</p>
              <div className={`rounded-2xl border p-5 space-y-3 ${TYPE_STYLE[form.type] || TYPE_STYLE.Announcement}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  {form.type && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${TYPE_BADGE_STYLE[form.type] || TYPE_BADGE_STYLE.Announcement}`}>
                      {form.type}
                    </span>
                  )}
                  {form.audience && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      to {form.audience}
                      {selectedTarget ? `: ${selectedTarget.label}` : ""}
                    </span>
                  )}
                  {form.expiryDate && (
                    <span className="text-[10px] font-semibold text-slate-400 ml-auto">
                      Expires: {form.expiryDate}
                    </span>
                  )}
                </div>
                <h3 className={`text-base font-black leading-snug ${TYPE_TITLE_STYLE[form.type] || TYPE_TITLE_STYLE.Announcement}`}>
                  {form.title || "Title will appear here"}
                </h3>
                <div className={`h-px ${TYPE_DIVIDER[form.type] || TYPE_DIVIDER.Announcement}`} />
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {form.body || "Message body will appear here"}
                </p>
                <p className="text-[10px] text-slate-400 pt-1">
                  From: Admin
                </p>
              </div>
            </div>
          )}

          {submitErr && (
            <div className="col-span-12">
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                {submitErr}
              </p>
            </div>
          )}

          <div className="col-span-6">
            <Button
              text="Reset"
              variant="secondary"
              onClick={() => {
                setForm((current) => ({
                  ...blank,
                  type: current.type || "Announcement",
                  audience: current.audience || "All",
                }));
                setFormErr({});
                setSubmitErr("");
                setTargets([]);
              }}
            />
          </div>
          <div className="col-span-6">
            <Button
              text={submitting ? "Sending..." : "Send Announcement"}
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            />
          </div>
        </Grid>
      </div>

      <DataTable
        title="Announcement History"
        ellipse={3}
        columns={ANN_COLS}
        rows={historyLoading ? [] : announcements}
        actions={actions}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="admin_announcements"
        filters={[
          { title: "Type", type: "toggle", key: "type", options: ["Announcement", "Warning", "Appreciation"] },
          { title: "Audience", type: "toggle", key: "audience", options: audienceOptions },
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Expired"] },
        ]}
      />

      <Modal id="admin-ann-view" title="Announcement Details" size="xl">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Details" cols={2}>
              <ModalData label="Type" value={viewRow.type} />
              <ModalData label="Audience" value={viewRow.audience} />
              <ModalData label="Target" value={viewRow.audienceDetail || "All"} />
              <ModalData label="Sent Date" value={viewRow.sentDate} />
              <ModalData label="Expiry Date" value={viewRow.expiryDate || "-"} />
              <ModalData label="Status" value={viewRow.status} />
            </ModalGrid>
            <ModalGrid title="Message" cols={1}>
              <ModalData label="Title" value={viewRow.title} />
              <ModalData label="Content" value={viewRow.body} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("admin-ann-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
