import { useState } from "react";
import {
  Heading, DashGrid, Grid, DataField, Button,
  SelectField, Option, DataTable,
  openModal, closeModal, Modal, ModalData, ModalGrid,
} from "../../../components/shared/Common_Components";
import DatePicker from "../../../components/shared/DatePicker";
import { currentTL } from "./teamLeaderStore";
import {
  initialAnnouncements,
  TL_AUDIENCE_OPTIONS,
  EXECUTIVE_NAMES,
} from "./announcementsStore";
import { Eye, Pencil, Ban, Trash2 } from "lucide-react";

const ANN_COLS = [
  { key: "title",          label: "Title" },
  { key: "type",           label: "Type" },
  { key: "audience",       label: "Audience" },
  { key: "audienceDetail", label: "Target" },
  { key: "sentDate",       label: "Sent" },
  { key: "expiryDate",     label: "Expires" },
  { key: "status",         label: "Status" },
];

const blank = {
  type: "", audience: "", audienceDetail: "",
  title: "", body: "", expiryDate: "",
};

export default function SalesTeamLeaderAnnouncements() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [form,    setForm]    = useState(blank);
  const [formErr, setFormErr] = useState({});
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (formErr[k]) setFormErr((e) => ({ ...e, [k]: "" }));
  };

  const computeStatus = (expiry) => {
    const today = new Date().toISOString().slice(0, 10);
    return !expiry || expiry >= today ? "Active" : "Expired";
  };

  const handleSubmit = () => {
    const errs = {};
    if (!form.type.trim())     errs.type     = "Type is required.";
    if (!form.audience.trim()) errs.audience = "Audience is required.";
    if (!form.title.trim())    errs.title    = "Title is required.";
    if (!form.body.trim())     errs.body     = "Message body is required.";
    if (form.audience === "Executive" && !form.audienceDetail.trim()) {
      errs.audienceDetail = "Please pick an executive.";
    }
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    const today = new Date().toISOString().slice(0, 10);
    const ann = {
      id:             `ANN-${Date.now().toString().slice(-4)}`,
      title:          form.title,
      type:           form.type,
      audience:       form.audience,
      audienceDetail: form.audience === "Team" ? currentTL.team : form.audienceDetail,
      sentDate:       today,
      expiryDate:     form.expiryDate,
      body:           form.body,
      status:         computeStatus(form.expiryDate),
    };
    setAnnouncements((prev) => [ann, ...prev]);
    setForm(blank);
    setFormErr({});
  };

  const startEdit = (row) => { setEditRow(row); openModal("tl-ann-edit"); };

  const saveEdit = () => {
    const errs = {};
    if (!editRow.title.trim()) errs.title = "Title is required.";
    if (!editRow.body.trim())  errs.body  = "Body is required.";
    if (Object.keys(errs).length) { setFormErr(errs); return; }
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === editRow.id
          ? { ...editRow, status: computeStatus(editRow.expiryDate) }
          : a,
      ),
    );
    closeModal("tl-ann-edit");
  };

  const cancelAnn = (row) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === row.id ? { ...a, status: "Expired" } : a)),
    );
  };

  const deleteAnn = (row) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== row.id));
  };

  const actions = [
    {
      icon: <Eye size={15} />, tooltip: "View",
      variant: "ghost",
      onClick: (row) => { setViewRow(row); openModal("tl-ann-view"); },
    },
    {
      icon: <Pencil size={15} />, tooltip: "Edit",
      variant: "primary",
      show: (row) => row.status !== "Expired",
      onClick: startEdit,
    },
    {
      icon: <Ban size={15} />, tooltip: "Cancel",
      variant: "ghost",
      show: (row) => row.status !== "Expired",
      onClick: cancelAnn,
    },
    {
      icon: <Trash2 size={15} />, tooltip: "Delete",
      variant: "danger",
      onClick: deleteAnn,
    },
  ];

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
              <Option value="Warning"      label="Warning" />
              <Option value="Appreciation" label="Appreciation" />
              <Option value="Announcement" label="Announcement" />
            </SelectField>
            {formErr.type && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.type}</p>}
          </div>

          {/* Audience — Team or Executive only */}
          <div className="col-span-12 sm:col-span-6">
            <SelectField
              label="Send To *" id="tl-ann-audience" size={12}
              placeholder="Select audience..."
              value={form.audience}
              onChange={(e) => { setField("audience", e.target.value); setField("audienceDetail", ""); }}
            >
              {TL_AUDIENCE_OPTIONS.map((o) => <Option key={o} value={o} label={o} />)}
            </SelectField>
            {formErr.audience && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.audience}</p>}
          </div>

          {/* Conditional: Executive picker (team executives only) */}
          {form.audience === "Executive" && (
            <div className="col-span-12 sm:col-span-6">
              <SelectField
                label="Select Executive *" id="tl-ann-exec" size={12}
                placeholder="Select executive..."
                value={form.audienceDetail}
                onChange={(e) => setField("audienceDetail", e.target.value)}
              >
                {EXECUTIVE_NAMES.map((ex) => <Option key={ex} value={ex} label={ex} />)}
              </SelectField>
              {formErr.audienceDetail && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.audienceDetail}</p>}
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
              <div className={`rounded-2xl border p-5 space-y-3 transition-all ${
                form.type === "Warning"      ? "bg-amber-50 border-amber-200"
                : form.type === "Appreciation" ? "bg-emerald-50 border-emerald-200"
                                              : "bg-blue-50 border-blue-200"
              }`}>
                <div className="flex items-center gap-2 flex-wrap">
                  {form.type && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      form.type === "Warning"      ? "bg-amber-100 text-amber-700"
                      : form.type === "Appreciation" ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-blue-100 text-blue-700"
                    }`}>{form.type}</span>
                  )}
                  {form.audience && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      → {form.audience}{form.audienceDetail ? `: ${form.audienceDetail}` : ""}
                    </span>
                  )}
                  {form.expiryDate && (
                    <span className="text-[10px] font-semibold text-slate-400 ml-auto">Expires: {form.expiryDate}</span>
                  )}
                </div>
                {form.title.trim() ? (
                  <h3 className={`text-base font-black leading-snug ${
                    form.type === "Warning"      ? "text-amber-800"
                    : form.type === "Appreciation" ? "text-emerald-800"
                                                  : "text-blue-900"
                  }`}>{form.title}</h3>
                ) : (
                  <p className="text-sm italic text-slate-400">Title will appear here…</p>
                )}
                <div className={`h-px ${
                  form.type === "Warning"      ? "bg-amber-200"
                  : form.type === "Appreciation" ? "bg-emerald-200"
                                                : "bg-blue-200"
                }`} />
                {form.body.trim() ? (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{form.body}</p>
                ) : (
                  <p className="text-sm italic text-slate-400">Message body will appear here…</p>
                )}
                <p className="text-[10px] text-slate-400 pt-1">
                  From: {currentTL.name} (Team Leader) &nbsp;·&nbsp; {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="col-span-6">
            <Button text="Reset" variant="secondary" onClick={() => { setForm(blank); setFormErr({}); }} />
          </div>
          <div className="col-span-6">
            <Button text="Send Message" variant="primary" onClick={handleSubmit} />
          </div>
        </Grid>
      </div>

      {/* ── Message history ── */}
      <DataTable
        title="Message History"
        ellipse={3}
        columns={ANN_COLS}
        rows={announcements}
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
              <ModalData label="ID"          value={viewRow.id} />
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

      {/* ── Edit modal ── */}
      <Modal id="tl-ann-edit" title="Edit Message" size="xl">
        {editRow && (
          <div className="flex flex-col gap-4">
            <Grid cols={12} gap={4}>
              <div className="col-span-9">
                <DataField
                  label="Title *" id="tl-edit-ann-title" size={12}
                  value={editRow.title}
                  onChange={(e) => setEditRow((r) => ({ ...r, title: e.target.value }))}
                  placeholder="Title..."
                />
                {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
              </div>
              <div className="col-span-3">
                <DatePicker
                  label="Expiry Date"
                  id="tl-edit-ann-expiry"
                  value={editRow.expiryDate || ""}
                  onChange={(v) => setEditRow((r) => ({ ...r, expiryDate: v }))}
                  placeholder="Select expiry date"
                />
              </div>
              <div className="col-span-12">
                <DataField
                  label="Message *" id="tl-edit-ann-body" type="textarea" rows={4} size={12}
                  value={editRow.body}
                  onChange={(e) => setEditRow((r) => ({ ...r, body: e.target.value }))}
                  placeholder="Message..."
                />
                {formErr.body && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.body}</p>}
              </div>
            </Grid>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button text="Cancel"       variant="secondary" size={3} onClick={() => { closeModal("tl-ann-edit"); setFormErr({}); }} />
              <Button text="Save Changes" variant="primary"   size={3} onClick={saveEdit} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
