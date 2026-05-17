/**
 * SALES TEAM LEADER — Announcements (API-connected)
 * TL can send to: Team (their own team) or Executive (individual in their team).
 */
import { useState, useEffect } from "react";
import {
  Heading, DashGrid, Grid, DataField, Button,
  SelectField, Option, DataTable,
  openModal, closeModal, Modal, ModalData, ModalGrid,
} from "../../../components/shared/Common_Components";
import DatePicker from "../../../components/shared/DatePicker";
import { Eye, Loader2 } from "lucide-react";
import {
  fetchAnnouncementMeta,
  fetchAnnouncementTargets,
  createAnnouncement,
  fetchAnnouncements,
} from "../../../services/announcementService";

const ANN_COLS = [
  { key: "title",          label: "Title"    },
  { key: "type",           label: "Type"     },
  { key: "audience",       label: "Audience" },
  { key: "audienceDetail", label: "Target"   },
  { key: "sentDate",       label: "Sent"     },
  { key: "expiryDate",     label: "Expires"  },
  { key: "status",         label: "Status"   },
];

const blank = {
  type: "", audience: "", targetId: "",
  title: "", body: "", expiryDate: "",
};

const TYPE_STYLE = {
  Warning:      "bg-amber-50 border-amber-200",
  Appreciation: "bg-emerald-50 border-emerald-200",
  Announcement: "bg-blue-50 border-blue-200",
};
const TYPE_TITLE_STYLE = {
  Warning:      "text-amber-800",
  Appreciation: "text-emerald-800",
  Announcement: "text-blue-900",
};
const TYPE_BADGE_STYLE = {
  Warning:      "bg-amber-100 text-amber-700",
  Appreciation: "bg-emerald-100 text-emerald-700",
  Announcement: "bg-blue-100 text-blue-700",
};
const TYPE_DIVIDER = {
  Warning:      "bg-amber-200",
  Appreciation: "bg-emerald-200",
  Announcement: "bg-blue-200",
};

// Get TL name from session
const getTLName = () => {
  try {
    const u = JSON.parse(sessionStorage.getItem("user") || "{}");
    return u?.name || "Team Leader";
  } catch { return "Team Leader"; }
};

export default function SalesTeamLeaderAnnouncements() {
  const [announcements,  setAnnouncements]  = useState([]);
  const [form,           setForm]           = useState(blank);
  const [formErr,        setFormErr]        = useState({});
  const [submitting,     setSubmitting]     = useState(false);
  const [submitErr,      setSubmitErr]      = useState("");

  const [audienceOptions, setAudienceOptions] = useState([]);
  const [messageTypes,    setMessageTypes]    = useState([]);
  const [metaLoading,     setMetaLoading]     = useState(true);

  const [targets,        setTargets]        = useState([]);
  const [targetsLoading, setTargetsLoading] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(true);
  const [viewRow,        setViewRow]        = useState(null);

  const tlName = getTLName();

  // ── Load meta ──
  useEffect(() => {
    fetchAnnouncementMeta()
      .then(({ messageTypes: mt, audienceOptions: ao }) => {
        setMessageTypes(mt.map((m) => m.label));
        setAudienceOptions(ao); // ["Team", "Executive"] for TL
      })
      .catch(() => {
        setMessageTypes(["Announcement", "Warning", "Appreciation"]);
        setAudienceOptions(["Team", "Executive"]);
      })
      .finally(() => setMetaLoading(false));
  }, []);

  // ── Load history ──
  useEffect(() => {
    fetchAnnouncements({ page: 1, limit: 50 })
      .then(({ announcements: list }) => setAnnouncements(list))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load targets when audience changes ──
  useEffect(() => {
    if (!form.audience) { setTargets([]); return; }
    setTargetsLoading(true);
    fetchAnnouncementTargets(form.audience)
      .then(({ targets: t }) => setTargets(t || []))
      .catch(() => setTargets([]))
      .finally(() => setTargetsLoading(false));
  }, [form.audience]);

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (formErr[k]) setFormErr((e) => ({ ...e, [k]: "" }));
    setSubmitErr("");
  };

  // For TL: Team audience doesn't need a target picker (auto = their own team)
  // Executive audience needs a target picker
  const needsTarget = form.audience === "Executive";

  // ── Submit ──
  const handleSubmit = async () => {
    const errs = {};
    if (!form.type.trim())     errs.type     = "Type is required.";
    if (!form.audience.trim()) errs.audience = "Audience is required.";
    if (!form.title.trim())    errs.title    = "Title is required.";
    if (!form.body.trim())     errs.body     = "Message body is required.";
    if (needsTarget && !form.targetId) errs.targetId = "Please select an executive.";
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    setSubmitting(true);
    setSubmitErr("");
    try {
      const payload = {
        title:      form.title.trim(),
        message:    form.body.trim(),
        type:       form.type,
        audience:   form.audience,
        targetId:   form.targetId || null,
        expiryDate: form.expiryDate || null,
      };
      const created = await createAnnouncement(payload);
      setAnnouncements((prev) => [created, ...prev]);
      setForm(blank);
      setFormErr({});
      setTargets([]);
    } catch (err) {
      setSubmitErr(err?.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const actions = [
    {
      icon: <Eye size={15} />, tooltip: "View",
      variant: "ghost",
      onClick: (row) => { setViewRow(row); openModal("tl-ann-view"); },
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
        <Heading primaryText="Team" secondaryText="Communication" size={12} />
      </DashGrid>

      {/* ── Compose form ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <p className="text-sm font-black text-[#2a465a] mb-5">Send Message to Team</p>
        <Grid cols={12} gap={4}>

          {/* Type */}
          <div className="col-span-12 sm:col-span-6">
            <SelectField
              label="Message Type *" id="tl-ann-type" size={12}
              placeholder="Select type..."
              value={form.type}
              onChange={(e) => setField("type", e.target.value)}
            >
              {messageTypes.map((t) => <Option key={t} value={t} label={t} />)}
            </SelectField>
            {formErr.type && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.type}</p>}
          </div>

          {/* Audience */}
          <div className="col-span-12 sm:col-span-6">
            <SelectField
              label="Send To *" id="tl-ann-audience" size={12}
              placeholder="Select audience..."
              value={form.audience}
              onChange={(e) => {
                setField("audience", e.target.value);
                setField("targetId", "");
                setTargets([]);
              }}
            >
              {audienceOptions.map((o) => <Option key={o} value={o} label={o} />)}
            </SelectField>
            {formErr.audience && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.audience}</p>}
          </div>

          {/* Executive picker */}
          {needsTarget && (
            <div className="col-span-12 sm:col-span-6">
              {targetsLoading ? (
                <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
                  <Loader2 size={14} className="animate-spin" /> Loading executives…
                </div>
              ) : (
                <>
                  <SelectField
                    label="Select Executive *" id="tl-ann-exec" size={12}
                    placeholder="Select executive..."
                    value={form.targetId}
                    onChange={(e) => setField("targetId", e.target.value)}
                  >
                    {targets.map((t) => <Option key={t.id} value={t.id} label={t.label} />)}
                  </SelectField>
                  {targets.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1 px-1">No executives found in your team.</p>
                  )}
                </>
              )}
              {formErr.targetId && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.targetId}</p>}
            </div>
          )}

          {/* Expiry */}
          <div className="col-span-12 sm:col-span-6">
            <DatePicker
              label="Expiry Date (optional)"
              id="tl-ann-expiry"
              value={form.expiryDate}
              onChange={(v) => setField("expiryDate", v)}
              placeholder="Select expiry date"
            />
          </div>

          {/* Title */}
          <div className="col-span-12">
            <DataField
              label="Title *" id="tl-ann-title" size={12}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Message title..."
            />
            {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
          </div>

          {/* Body */}
          <div className="col-span-12">
            <DataField
              label="Message *" id="tl-ann-body" type="textarea" rows={4} size={12}
              value={form.body}
              onChange={(e) => setField("body", e.target.value)}
              placeholder="Write your message here..."
            />
            {formErr.body && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.body}</p>}
          </div>

          {/* Live Preview */}
          {(form.title.trim() || form.body.trim()) && (
            <div className="col-span-12">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Preview</p>
              <div className={`rounded-2xl border p-5 space-y-3 transition-all ${TYPE_STYLE[form.type] || "bg-blue-50 border-blue-200"}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  {form.type && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${TYPE_BADGE_STYLE[form.type] || "bg-blue-100 text-blue-700"}`}>
                      {form.type}
                    </span>
                  )}
                  {form.audience && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      → {form.audience}
                      {form.targetId && targets.find((t) => t.id === form.targetId)
                        ? `: ${targets.find((t) => t.id === form.targetId).label}`
                        : ""}
                    </span>
                  )}
                  {form.expiryDate && (
                    <span className="text-[10px] font-semibold text-slate-400 ml-auto">Expires: {form.expiryDate}</span>
                  )}
                </div>
                {form.title.trim()
                  ? <h3 className={`text-base font-black leading-snug ${TYPE_TITLE_STYLE[form.type] || "text-blue-900"}`}>{form.title}</h3>
                  : <p className="text-sm italic text-slate-400">Title will appear here…</p>
                }
                <div className={`h-px ${TYPE_DIVIDER[form.type] || "bg-blue-200"}`} />
                {form.body.trim()
                  ? <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{form.body}</p>
                  : <p className="text-sm italic text-slate-400">Message body will appear here…</p>
                }
                <p className="text-[10px] text-slate-400 pt-1">
                  From: {tlName} (Team Leader) &nbsp;·&nbsp; {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          )}

          {/* API error */}
          {submitErr && (
            <div className="col-span-12">
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                {submitErr}
              </p>
          </div>
          )}

          {/* Actions */}
          <div className="col-span-6">
            <Button
              text="Reset" variant="secondary"
              onClick={() => { setForm(blank); setFormErr({}); setSubmitErr(""); setTargets([]); }}
            />
          </div>
          <div className="col-span-6">
            <Button
              text={submitting ? "Sending…" : "Send Message"}
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            />
          </div>
        </Grid>
      </div>

      {/* ── Message history ── */}
      <DataTable
        title="Message History"
        ellipse={3}
        columns={ANN_COLS}
        rows={historyLoading ? [] : announcements}
        actions={actions}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="tl_messages"
        filters={[
          { title: "Type",     type: "toggle", key: "type",     options: ["Warning", "Appreciation", "Announcement"] },
          { title: "Audience", type: "toggle", key: "audience", options: ["Team", "Executive"] },
          { title: "Status",   type: "toggle", key: "status",   options: ["Active", "Expired"] },
        ]}
      />

      {/* ── View modal ── */}
      <Modal id="tl-ann-view" title="Message Details" size="xl">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Details" cols={2}>
              <ModalData label="Type"        value={viewRow.type} />
              <ModalData label="Audience"    value={viewRow.audience} />
              <ModalData label="Target"      value={viewRow.audienceDetail || "—"} />
              <ModalData label="Sent Date"   value={viewRow.sentDate} />
              <ModalData label="Expiry Date" value={viewRow.expiryDate || "—"} />
              <ModalData label="Status"      value={viewRow.status} />
            </ModalGrid>
            <ModalGrid title="Message" cols={1}>
              <ModalData label="Title"   value={viewRow.title} />
              <ModalData label="Content" value={viewRow.body} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-ann-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
