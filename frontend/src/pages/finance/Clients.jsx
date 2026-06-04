import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import {
  Heading,
  DashGrid,
  EnhancedDashCard,
  DataTable,
  Button,
  Modal,
  ModalProfile,
  ModalGrid,
  ModalData,
  DataField,
  SelectField,
  Option,
  openModal,
  closeModal,
} from "../../components/shared/Common_Components";
import {
  Users,
  Clock,
  CheckCircle,
  Tag,
  Eye,
  CheckCheck,
  Pencil,
  PenLine,
  Trash2,
  Plus,
  IndianRupee,
} from "lucide-react";

// ── Service catalogue ─────────────────────────────────────────────────────────
const SERVICE_OPTIONS = [
  "Logo Design",
  "Brand Identity",
  "SEO",
  "Social Media Marketing",
  "Google Ads",
  "Meta Ads",
  "Website Development",
  "Landing Page",
  "Mobile App Development",
  "ERP Integration",
  "CRM Setup",
  "Content Writing",
  "Email Marketing",
  "Video Editing",
  "Photography",
  "Consulting",
];

// Start with empty list; data will be fetched from backend
const initialClients = [];

const statusOptions = ["Interested", "Not Interested", "Talk", "Not Talk"];

const statusColor = (s) => {
  switch (s) {
    case "Interested":     return "bg-emerald-100 text-emerald-700";
    case "Talk":           return "bg-sky-100 text-sky-700";
    case "Not Interested": return "bg-rose-100 text-rose-700";
    case "Not Talk":       return "bg-amber-100 text-amber-700";
    default:               return "bg-slate-100 text-slate-700";
  }
};

const paymentStatusColor = (s) => {
  switch (s) {
    case "Paid":    return "bg-emerald-100 text-emerald-700";
    case "Unpaid":  return "bg-rose-100 text-rose-700";
    case "Advance": return "bg-sky-100 text-sky-700";
    default:        return "bg-slate-100 text-slate-600";
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const calcTotalCost = (reqs) =>
  reqs.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0);

const calcItemDiscount = (cost, mode, value) => {
  const c = parseFloat(cost) || 0;
  const v = parseFloat(value) || 0;
  if (mode === "Percentage") return Math.round((c * Math.min(v, 99.99)) / 100);
  if (mode === "Rupees")     return Math.min(v, c);
  return 0;
};

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const calcAdvAmount = (netPayable, mode, value) => {
  const v = parseFloat(value) || 0;
  if (mode === "Percentage") return Math.round((netPayable * Math.min(v, 100)) / 100);
  if (mode === "Rupees") return Math.min(v, netPayable);
  return 0;
};

const blankAdv = () => ({ id: Date.now(), mode: "Percentage", value: "", method: "UPI" });

// ── Blank requirement template ─────────────────────────────────────────────────
const blankReq = () => ({
  id: Date.now(),
  title: "",
  cost: "",
  description: "",
  discountMode: "None",
  discountValue: "",
  discountAmt: 0,
  netCost: 0,
  isPaid: false
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Clients() {
  const [clients, setClients]   = useState(initialClients);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Action-form state (lives outside the form so the modal can read it) ──
  const [actionForm, setActionForm] = useState({
    status: "Interested",
    // Interested fields
    selectedService: "",
    requirements: [],          // [{ id, title, cost, description, discountMode, discountValue, discountAmt, netCost, isPaid }]
    termsAndConditions: "",
    paymentStatus: "Unpaid",   // "Paid" | "Unpaid" | "Advance"
    advanceAmount: "",
    advancePayments: [],
    // Other status fields
    notInterestedReason: "",
    conversationNotes: "",
    notTalkReason: "",
    // Real-time payment info from backend
    totalPaid: 0,
    totalUnpaid: 0,
  });

  // ── New / editing requirement row ─────────────────────────────────────────
  const [reqDraft, setReqDraft]         = useState(blankReq());
  const [editingReqId, setEditingReqId] = useState(null); // null = adding new

  // States for advance payment drafting inside action modal
  const [advDraft, setAdvDraft]         = useState(blankAdv());
  const [editingAdvId, setEditingAdvId] = useState(null);

  // ── Derived financials (from actionForm) ──────────────────────────────────
  const totalCost      = actionForm.requirements.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0);
  const totalDiscount  = actionForm.requirements.reduce((sum, r) => sum + (parseFloat(r.discountAmt) || 0), 0);
  const netPayable     = actionForm.requirements.reduce((sum, r) => sum + (parseFloat(r.netCost) || 0), 0);
  
  const gstAmount      = Math.round(netPayable * 0.18);
  const totalProjectValue = netPayable + gstAmount;

  // Real-time totals from actionForm (initialized from backend)
  const totalPaid      = actionForm.totalPaid || 0;
  const totalUnpaid    = Math.max(0, totalProjectValue - totalPaid);

  const advancePayments = actionForm.advancePayments || [];
  const advancePaid   = Math.min(totalUnpaid, advancePayments.reduce((sum, p) => sum + calcAdvAmount(totalUnpaid, p.mode, p.value), 0));
  const remaining     = Math.max(0, totalUnpaid - advancePaid);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Fetch prospects filled by Sales Executives for this admin (finance view)
  useEffect(() => {
    let mounted = true;
    const fetchProspects = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await apiClient.get('/finance/prospects');
        const data = resp?.data?.data || {};
        const prospects = data.prospects || [];

        const mapped = prospects.map((p) => ({
          id: p.id,
          client: p.client,
          mobile: p.mobile,
          email: p.email,
          suggestedServices: p.suggestedServices,
          suggestedAmount: p.suggestedAmount || p.netPayable || p.totalCost || 0,
          status: p.status,
          salesExec: p.salesExec,
          notes: p.termsAndConditions || p.requirement || '',
          requirements: p.requirements || [],
          selectedService: p.selectedService || '',
          paymentStatus: p.paymentStatus || 'Unpaid',
          advanceAmount: p.advanceAmount || '',
          advancePayments: p.advancePayments || [],
          termsAndConditions: p.termsAndConditions || '',
          totalCost: p.totalCost || 0,
          totalDiscount: p.totalDiscount || 0,
          totalPaid: p.totalPaid || 0,
          totalUnpaid: p.totalUnpaid || 0,
          netPayable: p.netPayable || 0,
          clientEmailStatus: p.clientEmailStatus || 'PENDING',
          sentToClientAt: p.sentToClientAt || null,
          clientEmailMessageId: p.clientEmailMessageId || null,
        }));

        if (mounted) setClients(mapped);
      } catch (err) {
        console.warn('Failed to fetch finance prospects', err);
        if (mounted) setError(err?.message || 'Failed to load finance prospects');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProspects();
    return () => { mounted = false; };
  }, []);
  const af = (field, value) =>
    setActionForm((prev) => ({ ...prev, [field]: value }));

  // Open view modal
  const openView = (row) => {
    setSelected(row);
    openModal("client-view");
  };

  // Open action modal
  const openAction = (row) => {
    setSelected(row);
    let advancePaymentsList = row.advancePayments || [];
    if (advancePaymentsList.length === 0 && row.advanceAmount && parseFloat(row.advanceAmount) > 0) {
      advancePaymentsList = [
        {
          id: Date.now(),
          mode: "Rupees",
          value: String(row.advanceAmount),
          method: "UPI",
        }
      ];
    }
    setActionForm({
      status: row.status || "Interested",
      selectedService: row.selectedService || "",
      requirements: row.requirements || [],
      termsAndConditions: row.termsAndConditions || row.notes || "",
      paymentStatus: row.paymentStatus || "Unpaid",
      advanceAmount: row.advanceAmount || "",
      advancePayments: advancePaymentsList,
      notInterestedReason: row.notInterestedReason || "",
      conversationNotes: row.conversationNotes || "",
      notTalkReason: row.notTalkReason || "",
      totalPaid: row.totalPaid || 0,
      totalUnpaid: row.totalUnpaid || 0,
    });
    setReqDraft(blankReq());
    setEditingReqId(null);
    setAdvDraft(blankAdv());
    setEditingAdvId(null);
    openModal("client-action");
  };

  // ── Requirement CRUD ──────────────────────────────────────────────────────
  const handleAddReq = () => {
    if (actionForm.paymentStatus === "Paid") {
      toast.error("Service items cannot be modified once the final payment has been made.");
      return;
    }
    if (!reqDraft.title.trim() || !reqDraft.cost) return;

    const cost = parseFloat(reqDraft.cost) || 0;
    const da = calcItemDiscount(cost, reqDraft.discountMode, reqDraft.discountValue);
    const nc = Math.max(0, cost - da);
    
    const finalReq = { ...reqDraft, discountAmt: da, netCost: nc };

    if (editingReqId !== null) {
      // Save edit
      af("requirements",
        actionForm.requirements.map((r) =>
          r.id === editingReqId ? { ...finalReq, id: editingReqId } : r
        )
      );
      setEditingReqId(null);
    } else {
      // Add new
      af("requirements", [...actionForm.requirements, { ...finalReq, id: Date.now() }]);
    }
    setReqDraft(blankReq());
  };

  const handleEditReq = (req) => {
    if (actionForm.paymentStatus === "Paid") {
      toast.error("Service items cannot be modified once the final payment has been made.");
      return;
    }
    setReqDraft({ ...req });
    setEditingReqId(req.id);
  };

  const handleDeleteReq = (id) => {
    if (actionForm.paymentStatus === "Paid") {
      toast.error("Service items cannot be modified once the final payment has been made.");
      return;
    }
    af("requirements", actionForm.requirements.filter((r) => r.id !== id));
    if (editingReqId === id) {
      setEditingReqId(null);
      setReqDraft(blankReq());
    }
  };

  const handleCancelEditReq = () => {
    setEditingReqId(null);
    setReqDraft(blankReq());
  };

  // ── Advance Payment CRUD ─────────────────────────────────────────────────
  const handleAddAdv = () => {
    if (!advDraft.value || parseFloat(advDraft.value) <= 0) return;

    const currentPayments = actionForm.advancePayments || [];
    if (editingAdvId !== null) {
      af("advancePayments",
        currentPayments.map((p) =>
          p.id === editingAdvId ? { ...advDraft, id: editingAdvId } : p
        )
      );
      setEditingAdvId(null);
    } else {
      af("advancePayments", [...currentPayments, { ...advDraft, id: Date.now() }]);
    }
    setAdvDraft(blankAdv());
  };

  const handleEditAdv = (adv) => {
    setAdvDraft({ ...adv });
    setEditingAdvId(adv.id);
  };

  const handleDeleteAdv = (id) => {
    af("advancePayments", (actionForm.advancePayments || []).filter((p) => p.id !== id));
    if (editingAdvId === id) {
      setEditingAdvId(null);
      setAdvDraft(blankAdv());
    }
  };

  const handleCancelEditAdv = () => {
    setEditingAdvId(null);
    setAdvDraft(blankAdv());
  };

  // ── Save entire action form ───────────────────────────────────────────────
  const saveActionForm = async () => {
    if (!selected) return;

    const advancePaymentsVal = actionForm.advancePayments || [];
    const advancePaidVal = advancePaymentsVal.reduce((sum, p) => sum + calcAdvAmount(totalUnpaid, p.mode, p.value), 0);

    try {
      const response = await apiClient.post(`/finance/prospects/${selected.id}/send`, {
        status: actionForm.status,
        selectedService: actionForm.selectedService,
        requirements: actionForm.requirements,
        termsAndConditions: actionForm.termsAndConditions,
        paymentStatus: actionForm.paymentStatus,
        advanceAmount: String(advancePaidVal),
        advancePayments: advancePaymentsVal,
        notInterestedReason: actionForm.notInterestedReason,
        conversationNotes: actionForm.conversationNotes,
        notTalkReason: actionForm.notTalkReason,
      });

      const updatedProspect = response?.data?.data?.prospect;
      if (updatedProspect) {
        setClients((prev) =>
          prev.map((c) =>
            c.id !== selected.id
              ? c
              : {
                  ...c,
                  ...updatedProspect,
                  advanceAmount: String(advancePaidVal),
                  advancePayments: advancePaymentsVal,
                }
          )
        );
      }

      closeModal("client-action");
    } catch (saveError) {
      setError(saveError?.message || 'Failed to send quotation to client');
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    { key: "client",            label: "Client Name" },
    { key: "mobile",            label: "Mobile" },
    { key: "email",             label: "Email" },
    { key: "suggestedServices", label: "Suggested Services" },
    {
      key: "suggestedAmount",
      label: "Suggested Amount",
      render: (v) => fmt(v),
    },
    { key: "salesExec", label: "Sales Executive" },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(v)}`}>
          {v}
        </span>
      ),
    },
  ];

  // ── KPI counts ────────────────────────────────────────────────────────────
  const total        = clients.length;
  const interested   = clients.filter((c) => c.status === "Interested").length;
  const talks        = clients.filter((c) => c.status === "Talk").length;
  const notInterested= clients.filter((c) => c.status === "Not Interested").length;
  const notTalk      = clients.filter((c) => c.status === "Not Talk").length;

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <DashGrid cols={12} gap={4}>
        {error && (
          <div className="col-span-12 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* ── Heading ── */}
        <Heading
          primaryText="Clients"
          secondaryText="Pipeline & Qualification"
          size={12}
        />

        {/* ── KPI cards ── */}
        <EnhancedDashCard title="Total Clients"    value={total}         icon={<Users/>} accentColor="#2563eb" size={3} />
        <EnhancedDashCard title="Interested"       value={interested}    icon={<CheckCircle/>} accentColor="#16a34a" size={3} />
        <EnhancedDashCard title="Not Interested"   value={notInterested} icon={<Tag/>} accentColor="#ef4444" size={3} />
        <EnhancedDashCard title="Not Talk"         value={notTalk}       icon={<CheckCheck/>} accentColor="#f59e0b" size={3} />

        {/* ── Table ── */}
        <DataTable
          title="Clients"
          columns={columns}
          rows={clients}
          size={12}
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
          searchable
          exportable
          exportFileName="clients_pipeline"
          filters={[
            {
              title: "Status",
              key: "status",
              type: "toggle",
              options: statusOptions,
            },
            {
              title: "Sales Executive",
              key: "salesExec",
              type: "toggle",
              options: ["Rahul Singh", "Aarti Verma", "Suresh Patel"],
            },
            {
              title: "Payment Status",
              key: "paymentStatus",
              type: "toggle",
              options: ["Paid", "Unpaid", "Advance"],
            },
          ]}
          actions={[
            {
              icon:    <Eye size={15} />,
              tooltip: "View details",
              variant: "ghost",
              onClick: openView,
            },
            {
              icon:    <CheckCheck size={15} />,
              tooltip: "Update status",
              variant: "primary",
              onClick: openAction,
            },
          ]}
        />
        {loading && (
          <div className="col-span-12 py-2 text-center text-sm font-medium text-slate-400">
            Loading finance prospects...
          </div>
        )}
      </DashGrid>

      {/* ════════════════════════════════════════════════════════════════════
          VIEW MODAL
      ════════════════════════════════════════════════════════════════════ */}
      <Modal id="client-view" title="Client Details" size="lg">
        {selected && (
          <div className="flex flex-col gap-5">
            <ModalProfile
              name={selected.client}
              subtitle={`Sales Executive: ${selected.salesExec}`}
              meta={`Client ID: ${selected.id}`}
            />

            <ModalGrid title="Contact" cols={2}>
              <ModalData label="Mobile" value={selected.mobile} />
              <ModalData label="Email"  value={selected.email}  />
            </ModalGrid>

            <ModalGrid title="Deal Summary" cols={2}>
              <ModalData label="Suggested Services" value={selected.suggestedServices} />
              <ModalData label="Suggested Amount"   value={fmt(selected.suggestedAmount)} />
            </ModalGrid>

            <ModalGrid title="Internal Notes" cols={1}>
              <ModalData label="Sales Notes" value={selected.notes || "—"} />
            </ModalGrid>

            {selected.status === "Interested" && (
              <>
                <ModalGrid title="Qualification Details" cols={2}>
                  <ModalData label="Qualified Service" value={selected.selectedService || "—"} />
                  <ModalData label="Payment Status" value={selected.paymentStatus || "—"} />
                  {selected.paymentStatus === "Advance" && (
                    <>
                      <ModalData label="Advance Paid" value={fmt(selected.advanceAmount || 0)} />
                      <ModalData label="Remaining" value={fmt(Math.max(0, (selected.netPayable ?? selected.totalCost ?? 0) - (parseFloat(selected.advanceAmount) || 0)))} />
                    </>
                  )}
                </ModalGrid>

                {selected.paymentStatus === "Advance" && selected.advancePayments && selected.advancePayments.length > 0 && (
                  <ModalGrid title="Advance Transactions" cols={1}>
                    <div className="flex flex-col gap-1.5 text-xs">
                      {selected.advancePayments.map((p, pIdx) => (
                        <div key={p.id || pIdx} className="flex justify-between items-center text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className="font-semibold">{p.method}</span>
                          <span className="text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">
                            {p.mode === "Percentage" ? `${p.value}%` : "Flat"}
                          </span>
                          <span className="font-black text-emerald-600">
                            {fmt(calcAdvAmount(selected.netPayable ?? selected.totalCost ?? 0, p.mode, p.value))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ModalGrid>
                )}
              </>
            )}

            <div className="flex justify-end">
              <Button
                text="Close"
                variant="ghost"
                size={3}
                onClick={() => closeModal("client-view")}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          ACTION MODAL
      ════════════════════════════════════════════════════════════════════ */}
      <Modal id="client-action" title="Update Client Status" size="xl">
        {selected && (
          <div className="flex flex-col gap-6">

            {/* Profile strip */}
            <ModalProfile
              name={selected.client}
              subtitle={`Client ID: ${selected.id}`}
              meta={`Current status: ${selected.status}`}
            />

            {/* ── Status selector ── */}
            <SelectField
              label="Choose Status"
              id="action-status"
              value={actionForm.status}
              onChange={(e) => af("status", e.target.value)}
            >
              {statusOptions.map((o) => (
                <Option key={o} value={o} label={o} />
              ))}
            </SelectField>

            {/* ══════════════════════════════════════════════════════════
                INTERESTED FORM
            ══════════════════════════════════════════════════════════ */}
            {actionForm.status === "Interested" && (
              <div className="flex flex-col gap-6">

                {/* ── Service dropdown ── */}
                <SelectField
                  label="Service"
                  id="sel-service"
                  value={actionForm.selectedService}
                  onChange={(e) => af("selectedService", e.target.value)}
                  placeholder="Select a service…"
                >
                  {SERVICE_OPTIONS.map((s) => (
                    <Option key={s} value={s} label={s} />
                  ))}
                </SelectField>

                {/* ── Requirements section ── */}
                <div className="flex flex-col gap-3">
                  {/* Section header */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                      Requirements
                    </p>
                    {actionForm.requirements.length > 0 && (
                      <span className="text-xs font-bold text-slate-400">
                        {actionForm.requirements.length} item{actionForm.requirements.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* ── Add / Edit requirement row ── */}
                  {actionForm.paymentStatus === "Paid" ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
                      <CheckCircle size={18} className="text-emerald-600" />
                      <p className="text-sm font-medium text-emerald-700">
                        Service items are locked because the project is fully paid.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col gap-3">
                      <p className="text-xs font-bold text-slate-500">
                        {editingReqId !== null ? "✏️ Editing requirement" : "Add requirement"}
                      </p>

                      {/* Title + Cost */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <DataField
                          label="Title"
                          id="req-title"
                          placeholder="e.g. Homepage design"
                          value={reqDraft.title}
                          onChange={(e) =>
                            setReqDraft((p) => ({ ...p, title: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); handleAddReq(); }
                          }}
                          size={12}
                        />
                        <DataField
                          label="Cost (₹)"
                          id="req-cost"
                          type="number"
                          placeholder="e.g. 15000"
                          value={reqDraft.cost}
                          onChange={(e) =>
                            setReqDraft((p) => ({ ...p, cost: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); handleAddReq(); }
                          }}
                          size={12}
                        />
                      </div>

                      {/* Discount for this requirement */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SelectField
                          label="Item Discount Type"
                          id="req-disc-mode"
                          value={reqDraft.discountMode}
                          onChange={(e) => setReqDraft((p) => ({ ...p, discountMode: e.target.value, discountValue: "" }))}
                        >
                          <Option value="None" label="No Discount" />
                          <Option value="Percentage" label="Percentage (%)" />
                          <Option value="Rupees" label="Rupees (₹)" />
                        </SelectField>

                        {reqDraft.discountMode !== "None" && (
                          <DataField
                            label={reqDraft.discountMode === "Percentage" ? "Discount %" : "Discount ₹"}
                            id="req-disc-val"
                            type="number"
                            value={reqDraft.discountValue}
                            onChange={(e) => setReqDraft((p) => ({ ...p, discountValue: e.target.value }))}
                            size={12}
                          />
                        )}
                      </div>

                      {/* Description (optional) */}
                      <DataField
                        label="Description (optional)"
                        id="req-desc"
                        type="textarea"
                        rows={2}
                        placeholder="Brief details about this requirement…"
                        value={reqDraft.description}
                        onChange={(e) =>
                          setReqDraft((p) => ({ ...p, description: e.target.value }))
                        }
                        size={12}
                      />

                      {/* Add / Save button row */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddReq}
                          disabled={!reqDraft.title.trim() || !reqDraft.cost}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2a465a] text-white text-xs font-bold
                            disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e3a52] transition active:scale-95"
                        >
                          {editingReqId !== null ? (
                            <><Pencil size={13} /> Save Edit</>
                          ) : (
                            <><Plus size={13} /> Add</>
                          )}
                        </button>
                        {editingReqId !== null && (
                          <button
                            type="button"
                            onClick={handleCancelEditReq}
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600
                              hover:bg-slate-50 transition active:scale-95"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Requirements list ── */}
                  {actionForm.requirements.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                      {/* List header */}
                      <div className="grid grid-cols-[1fr_100px_100px_120px_auto] gap-2 px-4 py-2 bg-[#2a465a]/5 border-b border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requirement</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Base</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Disc</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Net Cost</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</span>
                      </div>

                      {actionForm.requirements.map((req, idx) => (
                        <div
                          key={req.id}
                          className={`grid grid-cols-[1fr_100px_100px_120px_auto] gap-2 px-4 py-3 items-center
                            ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                            ${editingReqId === req.id ? "ring-2 ring-inset ring-[#2a465a]/30" : ""}
                            border-b border-slate-100 last:border-0`}
                        >
                          {/* Title + description */}
                          <div className="min-w-0 flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[#2a465a] truncate">{req.title}</p>
                            </div>
                            {req.description && (
                              <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                                {req.description}
                              </p>
                            )}
                          </div>

                          {/* Base Cost */}
                          <p className="text-xs font-bold text-slate-400 text-right">
                            {fmt(req.cost)}
                          </p>

                          {/* Discount */}
                          <p className={`text-xs font-bold text-right ${req.discountAmt > 0 ? "text-rose-500" : "text-slate-300"}`}>
                            {req.discountAmt > 0 ? `- ${fmt(req.discountAmt)}` : "—"}
                          </p>

                          {/* Net Cost */}
                          <p className="text-sm font-black text-[#2a465a] text-right">
                            {fmt(req.netCost)}
                          </p>

                          {/* Edit / Delete */}
                          <div className="flex gap-1.5 justify-center">
                            {actionForm.paymentStatus !== "Paid" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditReq(req)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#2a465a] hover:text-white
                                    flex items-center justify-center transition active:scale-90 text-slate-500"
                                  title="Edit"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReq(req.id)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-500 hover:text-white
                                    flex items-center justify-center transition active:scale-90 text-slate-500"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Summary row */}
                      <div className="grid grid-cols-[1fr_100px_100px_120px_auto] gap-2 px-4 py-3 bg-[#2a465a] border-t border-[#1e3a52]">
                        <span className="text-xs font-black text-white/70 uppercase tracking-widest col-span-1">
                          Grand Total
                        </span>
                        <span className="text-xs font-bold text-white/50 text-right pt-0.5">{fmt(totalCost)}</span>
                        <span className="text-xs font-bold text-rose-300 text-right pt-0.5">{totalDiscount > 0 ? `- ${fmt(totalDiscount)}` : ""}</span>
                        <span className="text-sm font-black text-white text-right">
                          {fmt(netPayable)}
                        </span>
                        <span />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Terms and Conditions (optional) ── */}
                <DataField
                  label="Terms and Conditions (optional)"
                  id="terms-conditions"
                  type="textarea"
                  rows={4}
                  placeholder="Add any terms and conditions for this interested client…"
                  value={actionForm.termsAndConditions}
                  onChange={(e) => af("termsAndConditions", e.target.value)}
                  size={12}
                />

                {/* ── GST section ── */}
                {actionForm.requirements.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DataField
                      label="GST"
                      id="client-gst"
                      value="18% (Added on top)"
                      readOnly
                      disabled
                      size={12}
                    />
                  </div>
                )}

                {/* ── Payment status ── */}
                {actionForm.requirements.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                      Payment
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SelectField
                        label="Payment Status"
                        id="pay-status"
                        value={actionForm.paymentStatus}
                        onChange={(e) => {
                          af("paymentStatus", e.target.value);
                          if (e.target.value !== "Advance") {
                            af("advanceAmount", "");
                            af("advancePayments", []);
                          }
                        }}
                      >
                        <Option value="Paid"    label="Paid"    />
                        <Option value="Unpaid"  label="Unpaid"  />
                        <Option value="Advance" label="Advance" />
                      </SelectField>

                      {actionForm.paymentStatus === "Advance" && (
                        <div className="hidden sm:block" />
                      )}
                    </div>

                    {/* ── Advance Payment Transaction Builder ── */}
                    {actionForm.paymentStatus === "Advance" && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/30 p-4 flex flex-col gap-4">
                        <p className="text-xs font-bold text-slate-500">
                          {editingAdvId !== null ? "✏️ Editing Advance Payment" : "Add Advance Payment"}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <SelectField
                            label="Payment Method"
                            id="edit-adv-method"
                            value={advDraft.method}
                            onChange={(e) => setAdvDraft((p) => ({ ...p, method: e.target.value }))}
                          >
                            <Option value="UPI"          label="UPI"          />
                            <Option value="Cash"         label="Cash"         />
                            <Option value="Card"         label="Card"         />
                            <Option value="Net Banking"  label="Net Banking"  />
                          </SelectField>

                          <SelectField
                            label="Payment Type"
                            id="edit-adv-mode"
                            value={advDraft.mode}
                            onChange={(e) => setAdvDraft((p) => ({ ...p, mode: e.target.value, value: "" }))}
                          >
                            <Option value="Percentage" label="Percentage (%)" />
                            <Option value="Rupees"     label="Rupees (₹)"     />
                          </SelectField>

                          {(() => {
                            const paidOther = (actionForm.advancePayments || [])
                              .filter((p) => p.id !== editingAdvId)
                              .reduce((sum, p) => sum + calcAdvAmount(totalUnpaid, p.mode, p.value), 0);
                            const maxAllowedRupees = Math.max(0, totalUnpaid - paidOther);
                            const maxAllowedPercent = totalUnpaid > 0 
                              ? Math.max(0, Math.min(100, (maxAllowedRupees / totalUnpaid) * 100))
                              : 0;
                            const labelText = advDraft.mode === "Percentage"
                              ? `Value % (max ${maxAllowedPercent.toFixed(1)}%)`
                              : `Amount ₹ (max ${fmt(maxAllowedRupees)})`;
                            
                            return (
                              <DataField
                                label={labelText}
                                id="edit-adv-val"
                                type="number"
                                placeholder={advDraft.mode === "Percentage" ? "e.g. 25" : "e.g. 2500"}
                                value={advDraft.value}
                                onChange={(e) => {
                                  let v = parseFloat(e.target.value) || 0;
                                  if (advDraft.mode === "Percentage") {
                                    v = Math.min(v, maxAllowedPercent);
                                  } else {
                                    v = Math.min(v, maxAllowedRupees);
                                  }
                                  setAdvDraft((p) => ({ ...p, value: String(v || "") }));
                                }}
                                size={12}
                              />
                            );
                          })()}
                        </div>

                        {advDraft.value && (
                          <div className="text-xs font-bold text-[#2a465a] bg-white border border-slate-100 rounded-xl px-3 py-2 flex justify-between items-center">
                            <span>Calculated Transaction Amount:</span>
                            <span className="text-sm font-black text-emerald-600">
                              {fmt(calcAdvAmount(totalUnpaid, advDraft.mode, advDraft.value))}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddAdv}
                            disabled={!advDraft.value || parseFloat(advDraft.value) <= 0}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2a465a] text-white text-xs font-bold
                              disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e3a52] transition active:scale-95"
                          >
                            {editingAdvId !== null ? (
                              <><PenLine size={13} /> Save Edit</>
                            ) : (
                              <><Plus size={13} /> Add Payment</>
                            )}
                          </button>
                          {editingAdvId !== null && (
                            <button
                              type="button"
                              onClick={handleCancelEditAdv}
                              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600
                                hover:bg-slate-50 transition active:scale-95"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Advance Transactions List ── */}
                    {actionForm.paymentStatus === "Advance" && actionForm.advancePayments?.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-[1fr_140px_auto] gap-2 px-4 py-2 bg-[#2a465a]/5 border-b border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Method</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</span>
                        </div>

                        {actionForm.advancePayments.map((p, idx) => (
                          <div
                            key={p.id}
                            className={`grid grid-cols-[1fr_140px_auto] gap-2 px-4 py-3 items-center
                              ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                              ${editingAdvId === p.id ? "ring-2 ring-inset ring-[#2a465a]/30" : ""}
                              border-b border-slate-100 last:border-0`}
                          >
                            <span className="text-sm font-bold text-[#2a465a]">{p.method}</span>
                            <span className="text-sm font-black text-emerald-600 text-right">
                              {p.mode === "Percentage" ? `${p.value}% (${fmt(calcAdvAmount(totalUnpaid, p.mode, p.value))})` : fmt(p.value)}
                            </span>

                            <div className="flex gap-1.5 justify-center">
                              <button
                                type="button"
                                onClick={() => handleEditAdv(p)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#2a465a] hover:text-white
                                  flex items-center justify-center transition active:scale-95 text-slate-500"
                                title="Edit"
                              >
                                <PenLine size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAdv(p.id)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-500 hover:text-white
                                  flex items-center justify-center transition active:scale-95 text-slate-500"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Advance payment breakdown cards removed as per request (no due visible) */}
                  </div>
                )}

                {/* ── Financial Summary ── */}
                {actionForm.requirements.length > 0 && (
                  <div className="flex flex-col gap-3 mt-4">
                    <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                      Financial Summary
                    </p>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-2.5">
                      <div className="flex justify-between text-sm font-semibold text-slate-600">
                        <span>Total Service Value</span>
                        <span>{fmt(netPayable)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-slate-600 border-b border-slate-100 pb-2.5">
                        <span>GST (18%)</span>
                        <span>{fmt(gstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-[#2a465a] pt-1">
                        <span>Total Project Value</span>
                        <span>{fmt(totalProjectValue)}</span>
                      </div>

                      {advancePaid > 0 && (
                        <div className="flex justify-between text-sm font-semibold text-emerald-600 border-t border-slate-100 pt-2.5">
                          <span>Advance Payment Added</span>
                          <span>- {fmt(advancePaid)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ── Not Interested ── */}
            {actionForm.status === "Not Interested" && (
              <DataField
                label="Why not interested?"
                id="not-int-reason"
                type="textarea"
                rows={4}
                placeholder="Describe the reason the client is not interested…"
                value={actionForm.notInterestedReason}
                onChange={(e) => af("notInterestedReason", e.target.value)}
                size={12}
              />
            )}

            {/* ── Talk ── */}
            {actionForm.status === "Talk" && (
              <DataField
                label="Conversation Summary"
                id="conv-notes"
                type="textarea"
                rows={4}
                placeholder="Summarise what was discussed in the conversation…"
                value={actionForm.conversationNotes}
                onChange={(e) => af("conversationNotes", e.target.value)}
                size={12}
              />
            )}

            {/* ── Not Talk ── */}
            {actionForm.status === "Not Talk" && (
              <DataField
                label="Reason for not talking"
                id="not-talk-reason"
                type="textarea"
                rows={4}
                placeholder="Explain why the call / meeting did not happen…"
                value={actionForm.notTalkReason}
                onChange={(e) => af("notTalkReason", e.target.value)}
                size={12}
              />
            )}

            {/* ── Footer buttons ── */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                text="Cancel"
                variant="ghost"
                size={3}
                onClick={() => closeModal("client-action")}
              />
              <Button
                text="Send To Client"
                variant="primary"
                size={3}
                onClick={saveActionForm}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}