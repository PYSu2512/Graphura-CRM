import { useState, useEffect } from "react";
import {
  Heading,
  DashGrid,
  Grid,
  DataField,
  SelectField,
  Option,
  DataTable,
  Button,
  Modal,
  openModal,
  closeModal,
  ModalData,
  ModalGrid,
} from "../../../components/shared/Common_Components.jsx";
import DatePicker from "../../../components/shared/DatePicker.jsx";
import { Eye, Loader2, Megaphone, Pencil, Trash2, XCircle } from "lucide-react";
import { getAllAdmins } from "../../../services/superAdminService.js";
import { toast } from "react-hot-toast";

// ── Table columns ─────────────────────────────────────────────────────────────
const ANN_COLS = [
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "audience", label: "Audience" },
  { key: "audienceDetail", label: "Target Admin" },
  { key: "sentDate", label: "Sent Date" },
  { key: "expiryDate", label: "Expiry Date" },
  { key: "status", label: "Status" },
];

// ── Type badge colours ────────────────────────────────────────────────────────
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

// ── Today's date in YYYY-MM-DD format (local timezone) ────────────────────────
const getTodayYMD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const todayYMD = getTodayYMD();

const blank = {
  type: "Announcement",
  audience: "All",
  targetAdminId: "",
  title: "",
  body: "",
  expiryDate: "",
};

// ── Initial Mock Announcements History ─────────────────────────────────────────
const initialAnnouncements = [
  {
    id: "ann-1",
    title: "Platform Maintenance Tonight",
    type: "Announcement",
    audience: "All",
    audienceDetail: "All Admins",
    sentDate: "2026-06-10",
    expiryDate: "2026-06-15",
    body: "The CRM platform will undergo brief maintenance tonight from 11 PM to 1 AM. Please save your work.",
    status: "Active",
  },
  {
    id: "ann-2",
    title: "Storage Limit Approaching",
    type: "Warning",
    audience: "Admin",
    audienceDetail: "Rahul Sharma (Nexus Technologies)",
    sentDate: "2026-06-09",
    expiryDate: "—",
    body: "Your organization has consumed 92% of your storage limit. Please upgrade to avoid service disruption.",
    status: "Active",
  },
  {
    id: "ann-3",
    title: "Outstanding Performance",
    type: "Appreciation",
    audience: "All",
    audienceDetail: "All Admins",
    sentDate: "2026-06-08",
    expiryDate: "2026-06-12",
    body: "Congratulations to all client administrators for driving record-breaking sales numbers this quarter!",
    status: "Active",
  },
];

export default function Announcement() {
  const [form, setForm] = useState(blank);
  const [formErr, setFormErr] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [successDetail, setSuccessDetail] = useState("");

  const [adminsList, setAdminsList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [viewRow, setViewRow] = useState(null);

  // ── Edit Form State ──
  const [editForm, setEditForm] = useState(blank);
  const [editFormErr, setEditFormErr] = useState({});
  const [editingRowId, setEditingRowId] = useState(null);

  const setEditField = (k, v) => {
    setEditForm((f) => ({ ...f, [k]: v }));
    if (editFormErr[k]) setEditFormErr((e) => ({ ...e, [k]: "" }));
  };

  // ── Load admins list on mount ──
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setLoadingAdmins(true);
        const data = await getAllAdmins({ limit: 100 });
        setAdminsList(data.admins || []);
      } catch (err) {
        console.error("Failed to load admins", err);
      } finally {
        setLoadingAdmins(false);
      }
    };
    loadAdmins();
  }, []);

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (formErr[k]) setFormErr((e) => ({ ...e, [k]: "" }));
    setSubmitErr("");
  };

  // ── Handle Submit ──
  const handleSubmit = () => {
    const errs = {};
    if (!form.type.trim()) errs.type = "Type is required.";
    if (!form.audience.trim()) errs.audience = "Audience is required.";
    if (form.audience === "Admin" && !form.targetAdminId) {
      errs.targetAdminId = "Please select a target admin.";
    }
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.body.trim()) errs.body = "Message body is required.";
    if (Object.keys(errs).length) {
      setFormErr(errs);
      return;
    }

    setSubmitting(true);
    setSubmitErr("");

    // Simulate sending announcement (frontend only)
    setTimeout(() => {
      try {
        const selectedAdminObj = adminsList.find(
          (a) => (a.id || a._id) === form.targetAdminId,
        );
        const targetDetail =
          form.audience === "Admin" && selectedAdminObj
            ? `${selectedAdminObj.adminName || selectedAdminObj.name} (${selectedAdminObj.company})`
            : "All Admins";

        const newAnn = {
          id: `ann-${Date.now()}`,
          title: form.title.trim(),
          type: form.type,
          audience: form.audience,
          audienceDetail: targetDetail,
          sentDate: new Date().toISOString().split("T")[0],
          expiryDate: form.expiryDate || "—",
          body: form.body.trim(),
          status: "Active",
        };

        setAnnouncements((prev) => [newAnn, ...prev]);
        setForm(blank);
        setFormErr({});
        setSuccessDetail(targetDetail);
        setSuccess(true);
        toast.success("Announcement sent successfully!");
        setTimeout(() => {
          setSuccess(false);
          setSuccessDetail("");
        }, 3000);
      } catch (err) {
        setSubmitErr("Failed to deliver announcement. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }, 600);
  };

  const handleCancelAnn = (id) => {
    setAnnouncements((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, status: "Expired" } : ann)),
    );
    toast.success("Announcement status updated to Expired.");
  };

  const handleDeleteAnn = (id) => {
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
    toast.success("Announcement deleted successfully!");
  };

  const handleBulkCancel = (selectedRows) => {
    const idsToCancel = selectedRows.map((row) => row.id);
    setAnnouncements((prev) =>
      prev.map((ann) =>
        idsToCancel.includes(ann.id) && ann.status === "Active"
          ? { ...ann, status: "Expired" }
          : ann,
      ),
    );
    toast.success("Selected active announcements cancelled.");
  };

  const handleBulkDelete = (selectedRows) => {
    const idsToDelete = selectedRows.map((row) => row.id);
    setAnnouncements((prev) =>
      prev.filter((ann) => !idsToDelete.includes(ann.id)),
    );
    toast.success("Selected announcements deleted.");
  };

  const handleSaveEdit = () => {
    const errs = {};
    if (!editForm.type.trim()) errs.type = "Type is required.";
    if (!editForm.audience.trim()) errs.audience = "Audience is required.";
    if (editForm.audience === "Admin" && !editForm.targetAdminId) {
      errs.targetAdminId = "Please select a target admin.";
    }
    if (!editForm.title.trim()) errs.title = "Title is required.";
    if (!editForm.body.trim()) errs.body = "Message body is required.";
    if (Object.keys(errs).length) {
      setEditFormErr(errs);
      return;
    }

    const selectedAdminObj = adminsList.find(
      (a) => (a.id || a._id) === editForm.targetAdminId,
    );
    const targetDetail =
      editForm.audience === "Admin" && selectedAdminObj
        ? `${selectedAdminObj.adminName || selectedAdminObj.name} (${selectedAdminObj.company})`
        : "All Admins";

    setAnnouncements((prev) =>
      prev.map((ann) =>
        ann.id === editingRowId
          ? {
              ...ann,
              type: editForm.type,
              audience: editForm.audience,
              audienceDetail: targetDetail,
              targetAdminId: editForm.targetAdminId,
              title: editForm.title.trim(),
              body: editForm.body.trim(),
              expiryDate: editForm.expiryDate || "—",
            }
          : ann,
      ),
    );

    closeModal("ann-edit-modal");
    toast.success("Announcement updated successfully!");
  };

  // ── Table actions ──
  const actions = [
    {
      icon: <Eye size={15} />,
      tooltip: "View",
      variant: "ghost",
      onClick: (row) => {
        setViewRow(row);
        openModal("ann-view-modal");
      },
    },
    {
      icon: <Pencil size={15} />,
      tooltip: "Edit",
      variant: "ghost",
      onClick: (row) => {
        setEditingRowId(row.id);
        setEditForm({
          type: row.type,
          audience: row.audience,
          targetAdminId: row.targetAdminId || "",
          title: row.title,
          body: row.body,
          expiryDate: row.expiryDate === "—" ? "" : row.expiryDate,
        });
        setEditFormErr({});
        openModal("ann-edit-modal");
      },
    },
    {
      icon: <XCircle size={15} />,
      tooltip: "Cancel",
      variant: "danger",
      show: (row) => row.status === "Active",
      onClick: (row) => handleCancelAnn(row.id),
    },
    {
      icon: <Trash2 size={15} />,
      tooltip: "Delete",
      variant: "danger",
      onClick: (row) => handleDeleteAnn(row.id),
    },
  ];

  const bulkActions = [
    {
      title: "Expire All",
      icon: <XCircle size={13} />,
      onClick: (selectedRows) => handleBulkCancel(selectedRows),
    },
    {
      title: "Delete All",
      icon: <Trash2 size={13} />,
      onClick: (selectedRows) => handleBulkDelete(selectedRows),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      {/* ── Heading ── */}
      <DashGrid cols={12} gap={4}>
        <Heading
          primaryText="Announcement"
          secondaryText="Management"
          size={12}
          fontSize="3xl"
          showAnimation={true}
        />
      </DashGrid>

      {/* Success Alert Banner */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 shadow-sm animate-pulse">
          <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            ✓
          </span>
          <div>
            <p className="font-bold">Announcement sent successfully!</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">
              Audience: {successDetail}
            </p>
          </div>
        </div>
      )}

      {/* ── Create Form ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <p className="text-sm font-black text-[#2a465a] mb-5">
          Create New Announcement
        </p>
        <Grid cols={12} gap={4}>
          {/* Type */}
          <div className="col-span-12 sm:col-span-6">
            <SelectField
              label="Message Type *"
              id="ann-type"
              size={12}
              placeholder="Select type..."
              value={form.type}
              onChange={(e) => setField("type", e.target.value)}
            >
              <Option value="Announcement" label="Announcement" />
              <Option value="Warning" label="Warning" />
              <Option value="Appreciation" label="Appreciation" />
            </SelectField>
            {formErr.type && (
              <p className="text-xs text-rose-600 mt-1 px-1">{formErr.type}</p>
            )}
          </div>

          {/* Audience */}
          <div className="col-span-12 sm:col-span-6">
            <SelectField
              label="Send To *"
              id="ann-audience"
              size={12}
              placeholder="Select audience..."
              value={form.audience}
              onChange={(e) => {
                setField("audience", e.target.value);
                setField("targetAdminId", "");
              }}
            >
              <Option value="All" label="All" />
              <Option value="Admin" label="Admin" />
            </SelectField>
            {formErr.audience && (
              <p className="text-xs text-rose-600 mt-1 px-1">
                {formErr.audience}
              </p>
            )}
          </div>

          {/* Target Admin Select */}
          {form.audience === "Admin" && (
            <div className="col-span-12 sm:col-span-6">
              {loadingAdmins ? (
                <div className="flex items-center gap-2 py-3 text-xs text-slate-400 animate-pulse">
                  <Loader2 size={14} className="animate-spin" /> Loading admins…
                </div>
              ) : (
                <>
                  <SelectField
                    label="Select Admin *"
                    id="ann-target-admin"
                    size={12}
                    placeholder="Select company admin..."
                    value={form.targetAdminId}
                    onChange={(e) => setField("targetAdminId", e.target.value)}
                  >
                    {adminsList.map((admin) => (
                      <Option
                        key={admin.id || admin._id}
                        value={admin.id || admin._id}
                        label={`${admin.adminName || admin.name} (${admin.company})`}
                      />
                    ))}
                  </SelectField>
                  {adminsList.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1 px-1">
                      No admins found in the system.
                    </p>
                  )}
                </>
              )}
              {formErr.targetAdminId && (
                <p className="text-xs text-rose-600 mt-1 px-1">
                  {formErr.targetAdminId}
                </p>
              )}
            </div>
          )}

          {/* Expiry Date */}
          <div className="col-span-12 sm:col-span-6">
            <DatePicker
              label="Expiry Date (optional)"
              id="ann-expiry"
              minDate={todayYMD}
              value={form.expiryDate}
              onChange={(v) => setField("expiryDate", v)}
              placeholder="Select expiry date"
            />
          </div>

          {/* Title */}
          <div className="col-span-12">
            <DataField
              label="Title *"
              id="ann-title"
              size={12}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Announcement title..."
            />
            {formErr.title && (
              <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>
            )}
          </div>

          {/* Body */}
          <div className="col-span-12">
            <DataField
              label="Message *"
              id="ann-body"
              type="textarea"
              rows={4}
              size={12}
              value={form.body}
              onChange={(e) => setField("body", e.target.value)}
              placeholder="Write your announcement here..."
            />
            {formErr.body && (
              <p className="text-xs text-rose-600 mt-1 px-1">{formErr.body}</p>
            )}
          </div>

          {/* Live Preview */}
          {(form.title.trim() || form.body.trim()) && (
            <div className="col-span-12">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">
                Preview
              </p>
              <div
                className={`rounded-2xl border p-5 space-y-3 transition-all ${
                  TYPE_STYLE[form.type] || "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {form.type && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        TYPE_BADGE_STYLE[form.type] ||
                        "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {form.type}
                    </span>
                  )}
                  {form.audience && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      →{" "}
                      {form.audience === "All"
                        ? "All Admins"
                        : "Selected Admin"}
                      {form.audience === "Admin" &&
                      form.targetAdminId &&
                      adminsList.find(
                        (a) => (a.id || a._id) === form.targetAdminId,
                      )
                        ? `: ${adminsList.find((a) => (a.id || a._id) === form.targetAdminId).adminName || adminsList.find((a) => (a.id || a._id) === form.targetAdminId).name} (${adminsList.find((a) => (a.id || a._id) === form.targetAdminId).company})`
                        : ""}
                    </span>
                  )}
                  {form.expiryDate && (
                    <span className="text-[10px] font-semibold text-slate-400 ml-auto">
                      Expires: {form.expiryDate}
                    </span>
                  )}
                </div>
                {form.title.trim() ? (
                  <h3
                    className={`text-base font-black leading-snug ${
                      TYPE_TITLE_STYLE[form.type] || "text-blue-900"
                    }`}
                  >
                    {form.title}
                  </h3>
                ) : (
                  <p className="text-sm italic text-slate-400">
                    Title will appear here…
                  </p>
                )}
                <div
                  className={`h-px ${TYPE_DIVIDER[form.type] || "bg-blue-200"}`}
                />
                {form.body.trim() ? (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {form.body}
                  </p>
                ) : (
                  <p className="text-sm italic text-slate-400">
                    Message body will appear here…
                  </p>
                )}
                <p className="text-[10px] text-slate-400 pt-1">
                  From: Super Admin &nbsp;·&nbsp;{" "}
                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Submit error */}
          {submitErr && (
            <div className="col-span-12">
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                {submitErr}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="col-span-6">
            <Button
              text="Reset"
              variant="secondary"
              onClick={() => {
                setForm(blank);
                setFormErr({});
                setSubmitErr("");
              }}
            />
          </div>
          <div className="col-span-6">
            <Button
              text={submitting ? "Sending…" : "Send Announcement"}
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            />
          </div>
        </Grid>
      </div>

      {/* ── History Table ── */}
      <DataTable
        title="Announcement History"
        ellipse={3}
        columns={ANN_COLS}
        rows={historyLoading ? [] : announcements}
        actions={actions}
        bulkAction={true}
        bulkActions={bulkActions}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="announcements"
        filters={[
          {
            title: "Type",
            type: "toggle",
            key: "type",
            options: ["Announcement", "Warning", "Appreciation"],
          },
          {
            title: "Audience",
            type: "toggle",
            key: "audience",
            options: ["All", "Admin"],
          },
          {
            title: "Status",
            type: "toggle",
            key: "status",
            options: ["Active", "Expired"],
          },
        ]}
      />

      {/* ── View Modal ── */}
      <Modal id="ann-view-modal" title="Announcement Details" size="xl">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Details" cols={2}>
              <ModalData label="Type" value={viewRow.type} />
              <ModalData label="Audience" value={viewRow.audience} />
              <ModalData label="Target" value={viewRow.audienceDetail || "—"} />
              <ModalData label="Sent Date" value={viewRow.sentDate} />
              <ModalData
                label="Expiry Date"
                value={viewRow.expiryDate || "—"}
              />
              <ModalData label="Status" value={viewRow.status} />
            </ModalGrid>
            <ModalGrid title="Message" cols={1}>
              <ModalData label="Title" value={viewRow.title} />
              <ModalData label="Content" value={viewRow.body} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                text="Close"
                variant="ghost"
                size={3}
                onClick={() => closeModal("ann-view-modal")}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal id="ann-edit-modal" title="Edit Announcement" size="xl">
        <div className="flex flex-col gap-4">
          <Grid cols={12} gap={4}>
            {/* Type */}
            <div className="col-span-12 sm:col-span-6">
              <SelectField
                label="Message Type *"
                id="edit-ann-type"
                size={12}
                placeholder="Select type..."
                value={editForm.type}
                onChange={(e) => setEditField("type", e.target.value)}
              >
                <Option value="Announcement" label="Announcement" />
                <Option value="Warning" label="Warning" />
                <Option value="Appreciation" label="Appreciation" />
              </SelectField>
              {editFormErr.type && (
                <p className="text-xs text-rose-600 mt-1 px-1">
                  {editFormErr.type}
                </p>
              )}
            </div>

            {/* Audience */}
            <div className="col-span-12 sm:col-span-6">
              <SelectField
                label="Send To *"
                id="edit-ann-audience"
                size={12}
                placeholder="Select audience..."
                value={editForm.audience}
                onChange={(e) => {
                  setEditField("audience", e.target.value);
                  setEditField("targetAdminId", "");
                }}
              >
                <Option value="All" label="All" />
                <Option value="Admin" label="Admin" />
              </SelectField>
              {editFormErr.audience && (
                <p className="text-xs text-rose-600 mt-1 px-1">
                  {editFormErr.audience}
                </p>
              )}
            </div>

            {/* Target Admin Select */}
            {editForm.audience === "Admin" && (
              <div className="col-span-12 sm:col-span-6">
                {loadingAdmins ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-slate-400 animate-pulse">
                    <Loader2 size={14} className="animate-spin" /> Loading
                    admins…
                  </div>
                ) : (
                  <>
                    <SelectField
                      label="Select Admin *"
                      id="edit-ann-target-admin"
                      size={12}
                      placeholder="Select company admin..."
                      value={editForm.targetAdminId}
                      onChange={(e) =>
                        setEditField("targetAdminId", e.target.value)
                      }
                    >
                      {adminsList.map((admin) => (
                        <Option
                          key={admin.id || admin._id}
                          value={admin.id || admin._id}
                          label={`${admin.adminName || admin.name} (${admin.company})`}
                        />
                      ))}
                    </SelectField>
                    {adminsList.length === 0 && (
                      <p className="text-xs text-slate-400 mt-1 px-1">
                        No admins found in the system.
                      </p>
                    )}
                  </>
                )}
                {editFormErr.targetAdminId && (
                  <p className="text-xs text-rose-600 mt-1 px-1">
                    {editFormErr.targetAdminId}
                  </p>
                )}
              </div>
            )}

            {/* Expiry Date */}
            <div className="col-span-12 sm:col-span-6">
              <DatePicker
                label="Expiry Date (optional)"
                id="edit-ann-expiry"
                minDate={todayYMD}
                value={editForm.expiryDate}
                onChange={(v) => setEditField("expiryDate", v)}
                placeholder="Select expiry date"
              />
            </div>

            {/* Title */}
            <div className="col-span-12">
              <DataField
                label="Title *"
                id="edit-ann-title"
                size={12}
                value={editForm.title}
                onChange={(e) => setEditField("title", e.target.value)}
                placeholder="Announcement title..."
              />
              {editFormErr.title && (
                <p className="text-xs text-rose-600 mt-1 px-1">
                  {editFormErr.title}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="col-span-12">
              <DataField
                label="Message *"
                id="edit-ann-body"
                type="textarea"
                rows={4}
                size={12}
                value={editForm.body}
                onChange={(e) => setEditField("body", e.target.value)}
                placeholder="Write your announcement here..."
              />
              {editFormErr.body && (
                <p className="text-xs text-rose-600 mt-1 px-1">
                  {editFormErr.body}
                </p>
              )}
            </div>
          </Grid>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              text="Cancel"
              variant="secondary"
              size={3}
              onClick={() => closeModal("ann-edit-modal")}
            />
            <Button
              text="Save Changes"
              variant="primary"
              size={3}
              onClick={handleSaveEdit}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
