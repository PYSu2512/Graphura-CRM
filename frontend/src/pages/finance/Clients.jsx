import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { maskId } from "../../utils/idMask";
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
  Paperclip,
  X,
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

const statusOptions = ["Interested", "Not Interested", "Talk", "Not Talk", "Won"];
// Statuses that Finance can manually set — "Won" is system-only (set on payment)
const manualStatusOptions = ["Interested", "Not Interested", "Talk", "Not Talk"];

const statusColor = (s) => {
  switch (s) {
    case "Interested":     return "bg-emerald-100 text-emerald-700";
    case "Talk":           return "bg-sky-100 text-sky-700";
    case "Not Interested": return "bg-rose-100 text-rose-700";
    case "Not Talk":       return "bg-amber-100 text-amber-700";
    case "Won":            return "bg-violet-100 text-violet-700";
    case "Paid":           return "bg-violet-100 text-violet-700";
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

  const [activeClients, setActiveClients] = useState([]);
  const [fetchingClients, setFetchingClients] = useState(false);

  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState("");

  const fetchActiveClients = async () => {
    setFetchingClients(true);
    try {
      const resp = await apiClient.get('/finance/prospects/active-clients');
      setActiveClients(resp?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch active clients:", err);
    } finally {
      setFetchingClients(false);
    }
  };

  const handleOpenAddClient = () => {
    setActiveModal("add");
    setAddForm({
      clientId: "",
      status: "Interested",
      selectedService: "",
      requirements: [],
      termsAndConditions: "",
      paymentStatus: "Unpaid",
      advanceAmount: "",
      advancePayments: [],
      notInterestedReason: "",
      conversationNotes: "",
      notTalkReason: "",
      totalPaid: 0,
      totalUnpaid: 0,
    });
    setReqDraft(blankReq());
    setEditingReqId(null);
    setAdvDraft(blankAdv());
    setEditingAdvId(null);
    setTcFile(null);
    setAddError("");
    fetchActiveClients();
    openModal("add-client-modal");
  };

  const handleAddClientSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.clientId) {
      setAddError("Please select a client.");
      return;
    }

    setSubmittingAdd(true);
    setAddError("");

    const advancePaymentsVal = addForm.advancePayments || [];
    const advancePaidVal = advancePaymentsVal.reduce((sum, p) => sum + calcAdvAmount(totalUnpaid, p.mode, p.value), 0);

    try {
      const formData = new FormData();
      formData.append("clientId", addForm.clientId);
      formData.append("status", addForm.status);
      formData.append("selectedService", addForm.selectedService);
      formData.append("requirements", JSON.stringify(addForm.requirements || []));
      formData.append("termsAndConditions", addForm.termsAndConditions);
      formData.append("paymentStatus", addForm.paymentStatus);
      formData.append("advanceAmount", String(advancePaidVal));
      formData.append("advancePayments", JSON.stringify(advancePaymentsVal));
      formData.append("notInterestedReason", addForm.notInterestedReason);
      formData.append("conversationNotes", addForm.conversationNotes);
      formData.append("notTalkReason", addForm.notTalkReason);
      formData.append("gstPercent", String(gstPercent));
      if (tcFile) {
        formData.append("tcFile", tcFile);
      }

      const resp = await apiClient.post('/finance/prospects/add', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newProspect = resp?.data?.data;
      if (newProspect) {
        setClients(prev => [newProspect, ...prev]);
        setActiveModal(null);
        closeModal("add-client-modal");
        toast.success("Client added successfully!");
      }
    } catch (err) {
      setAddError(err?.response?.data?.message || err?.message || 'Failed to add client');
    } finally {
      setSubmittingAdd(false);
    }
  };

  useEffect(() => {
    fetchActiveClients();
  }, []);

  const [activeModal, setActiveModal] = useState(null); // "add" | "action" | null

  // State for Add Client form (now Prospect Form)
  const [addForm, setAddForm] = useState({
    clientId: "",
    status: "Interested",
    selectedService: "",
    requirements: [],          // [{ id, title, cost, description, discountMode, discountValue, discountAmt, netCost, isPaid }]
    termsAndConditions: "",
    paymentStatus: "Unpaid",   // "Paid" | "Unpaid" | "Advance"
    advanceAmount: "",
    advancePayments: [],
    notInterestedReason: "",
    conversationNotes: "",
    notTalkReason: "",
    gstPercent: 0,
    totalPaid: 0,
    totalUnpaid: 0,
  });

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
    gstPercent: 0,
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
  const [tcFile, setTcFile]             = useState(null);

  // ── Derived financials (from whichever form is active) ────────────────────
  const currentForm = activeModal === "add" ? addForm : actionForm;

  const totalCost      = currentForm ? (currentForm.requirements || []).reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0) : 0;
  const totalDiscount  = currentForm ? (currentForm.requirements || []).reduce((sum, r) => sum + (parseFloat(r.discountAmt) || 0), 0) : 0;
  const netPayable     = currentForm ? (currentForm.requirements || []).reduce((sum, r) => sum + (parseFloat(r.netCost) || 0), 0) : 0;
  
  const gstPercent     = currentForm ? (Number(currentForm.gstPercent) || 0) : 0;
  const gstAmount      = Math.round(netPayable * gstPercent / 100);
  const totalProjectValue = netPayable + gstAmount;

  // Real-time totals from active form
  const totalPaid      = currentForm ? (currentForm.totalPaid || 0) : 0;
  const totalUnpaid    = Math.max(0, totalProjectValue - totalPaid);

  const advancePayments = currentForm ? (currentForm.advancePayments || []) : [];
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
          // Show "Won" when payment is confirmed — this is the CLOSED_WON state
          status: (p.paymentStatus === 'SUCCESS' || p.paymentStatus === 'Paid')
            ? 'Won'
            : (p.status || 'Interested'),
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
          gstPercent: p.gstPercent !== undefined && p.gstPercent !== null ? p.gstPercent : 0,
          termsAndConditionsPdf: p.termsAndConditionsPdf || null,
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
  const af = (field, value) => {
    if (activeModal === "add") {
      setAddForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setActionForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Open view modal
  const openView = (row) => {
    setSelected(row);
    openModal("client-view");
  };

  // Open action modal
  const openAction = (row) => {
    setActiveModal("action");
    setSelected(row);
    setTcFile(null);
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
      gstPercent: row.gstPercent !== undefined && row.gstPercent !== null ? Number(row.gstPercent) : 0,
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
    if (currentForm.paymentStatus === "Paid") {
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
        (currentForm.requirements || []).map((r) =>
          r.id === editingReqId ? { ...finalReq, id: editingReqId } : r
        )
      );
      setEditingReqId(null);
    } else {
      // Add new
      af("requirements", [...(currentForm.requirements || []), { ...finalReq, id: Date.now() }]);
    }
    setReqDraft(blankReq());
  };

  const handleEditReq = (req) => {
    if (currentForm.paymentStatus === "Paid") {
      toast.error("Service items cannot be modified once the final payment has been made.");
      return;
    }
    setReqDraft({ ...req });
    setEditingReqId(req.id);
  };

  const handleDeleteReq = (id) => {
    if (currentForm.paymentStatus === "Paid") {
      toast.error("Service items cannot be modified once the final payment has been made.");
      return;
    }
    af("requirements", (currentForm.requirements || []).filter((r) => r.id !== id));
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

    const currentPayments = currentForm.advancePayments || [];
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
    af("advancePayments", (currentForm.advancePayments || []).filter((p) => p.id !== id));
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
      const formData = new FormData();
      formData.append("status", actionForm.status);
      formData.append("selectedService", actionForm.selectedService);
      formData.append("requirements", JSON.stringify(actionForm.requirements));
      formData.append("termsAndConditions", actionForm.termsAndConditions);
      formData.append("paymentStatus", actionForm.paymentStatus);
      formData.append("advanceAmount", String(advancePaidVal));
      formData.append("advancePayments", JSON.stringify(advancePaymentsVal));
      formData.append("notInterestedReason", actionForm.notInterestedReason);
      formData.append("conversationNotes", actionForm.conversationNotes);
      formData.append("notTalkReason", actionForm.notTalkReason);
      formData.append("gstPercent", String(gstPercent));
      if (tcFile) {
        formData.append("tcFile", tcFile);
      }

      const response = await apiClient.post(`/finance/prospects/${selected.id}/send`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
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
      if (actionForm.status === "Interested") {
        toast.success("Quotation sent to client successfully!");
      } else {
        toast.success("Client status saved successfully!");
      }
    } catch (saveError) {
      setError(saveError?.message || (actionForm.status === "Interested" ? 'Failed to send quotation to client' : 'Failed to save client status'));
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
      key: "termsAndConditionsPdf",
      label: "Attached PDF",
      render: (v) => {
        if (!v) return <span className="text-slate-300">—</span>;
        
        let url = v;
        if (!v.startsWith('http')) {
          const filename = v.split(/[\\/]/).pop();
          url = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${filename}`;
        }

        return (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            <Paperclip size={12} />
            PDF
          </a>
        );
      }
    },
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

  const renderWorkflowFields = () => {
    if (!currentForm) return null;
    return (
      <>
        {/* ══════════════════════════════════════════════════════════
            INTERESTED FORM
        ══════════════════════════════════════════════════════════ */}
        {currentForm.status === "Interested" && (
          <div className="flex flex-col gap-6 col-span-12">

            {/* ── Service dropdown ── */}
            <SelectField
              label="Service"
              id="sel-service"
              value={currentForm.selectedService || ""}
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
                {(currentForm.requirements || []).length > 0 && (
                  <span className="text-xs font-bold text-slate-400">
                    {currentForm.requirements.length} item{currentForm.requirements.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* ── Add / Edit requirement row ── */}
              {currentForm.paymentStatus === "Paid" ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3 col-span-12">
                  <CheckCircle size={18} className="text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">
                    Service items are locked because the project is fully paid.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col gap-3 col-span-12">
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
              {(currentForm.requirements || []).length > 0 && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden col-span-12">
                  {/* List header */}
                  <div className="grid grid-cols-[1fr_100px_100px_120px_auto] gap-2 px-4 py-2 bg-[#2a465a]/5 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requirement</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Base</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Disc</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Net Cost</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</span>
                  </div>

                  {currentForm.requirements.map((req, idx) => (
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
                        {currentForm.paymentStatus !== "Paid" && (
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
              value={currentForm.termsAndConditions || ""}
              onChange={(e) => af("termsAndConditions", e.target.value)}
              size={12}
            />

            {/* ── PDF Attachment ── */}
            <div className="flex flex-col gap-2 -mt-2 col-span-12">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                Attach PDF Document (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 
                  text-slate-600 text-xs font-bold cursor-pointer transition active:scale-95 border border-slate-200">
                  <Paperclip size={14} />
                  {tcFile ? "Change PDF" : "Choose PDF"}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setTcFile(e.target.files[0])}
                  />
                </label>

                {tcFile && (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-left-2">
                    <span className="text-xs font-bold truncate max-w-[200px]">
                      {tcFile.name || (typeof tcFile === 'string' ? tcFile.split(/[\\/]/).pop() : 'Attached PDF')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTcFile(null)}
                      className="hover:text-rose-500 transition p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {!tcFile && selected?.termsAndConditionsPdf && (
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-xl border border-blue-100">
                    <span className="text-xs font-bold truncate max-w-[200px]">
                      Existing: {selected.termsAndConditionsPdf.split(/[\\/]/).pop()}
                    </span>
                    <a
                      href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${selected.termsAndConditionsPdf.split(/[\\/]/).pop()}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-900 transition p-0.5"
                      title="View existing PDF"
                    >
                      <Eye size={14} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* ── GST section ── */}
            {(currentForm.requirements || []).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 col-span-12">
                <DataField
                  label="GST Percentage (%)"
                  id="client-gst"
                  type="number"
                  placeholder="Default: 0%"
                  value={currentForm.gstPercent !== undefined && currentForm.gstPercent !== null ? currentForm.gstPercent : ""}
                  onChange={(e) => af("gstPercent", e.target.value)}
                  size={12}
                />
              </div>
            )}

            {/* ── Payment status ── */}
            {(currentForm.requirements || []).length > 0 && (
              <div className="flex flex-col gap-3 col-span-12">
                <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                  Payment
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectField
                    label="Payment Status"
                    id="pay-status"
                    value={currentForm.paymentStatus || "Unpaid"}
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

                  {currentForm.paymentStatus === "Advance" && (
                    <div className="hidden sm:block" />
                  )}
                </div>

                {/* ── Advance Payment Transaction Builder ── */}
                {currentForm.paymentStatus === "Advance" && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/30 p-4 flex flex-col gap-4 col-span-12">
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
                        const paidOther = (currentForm.advancePayments || [])
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
                {currentForm.paymentStatus === "Advance" && (currentForm.advancePayments || []).length > 0 && (
                  <div className="rounded-2xl border border-slate-200 overflow-hidden col-span-12">
                    <div className="grid grid-cols-[1fr_140px_auto] gap-2 px-4 py-2 bg-[#2a465a]/5 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Method</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</span>
                    </div>

                    {currentForm.advancePayments.map((p, idx) => (
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
              </div>
            )}

            {/* ── Financial Summary ── */}
            {(currentForm.requirements || []).length > 0 && (
              <div className="flex flex-col gap-3 mt-4 col-span-12">
                <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                  Financial Summary
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-2.5">
                  <div className="flex justify-between text-sm font-semibold text-slate-600">
                    <span>Total Service Value</span>
                    <span>{fmt(netPayable)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-slate-600 border-b border-slate-100 pb-2.5">
                    <span>GST ({gstPercent}%)</span>
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
        {currentForm.status === "Not Interested" && (
          <div className="col-span-12">
            <DataField
              label="Why not interested?"
              id="not-int-reason"
              type="textarea"
              rows={4}
              placeholder="Describe the reason the client is not interested…"
              value={currentForm.notInterestedReason || ""}
              onChange={(e) => af("notInterestedReason", e.target.value)}
              size={12}
            />
          </div>
        )}

        {/* ── Talk ── */}
        {currentForm.status === "Talk" && (
          <div className="col-span-12">
            <DataField
              label="Conversation Summary"
              id="conv-notes"
              type="textarea"
              rows={4}
              placeholder="Summarise what was discussed in the conversation…"
              value={currentForm.conversationNotes || ""}
              onChange={(e) => af("conversationNotes", e.target.value)}
              size={12}
            />
          </div>
        )}

        {/* ── Not Talk ── */}
        {currentForm.status === "Not Talk" && (
          <div className="col-span-12">
            <DataField
              label="Reason for not talking"
              id="not-talk-reason"
              type="textarea"
              rows={4}
              placeholder="Explain why the call / meeting did not happen…"
              value={currentForm.notTalkReason || ""}
              onChange={(e) => af("notTalkReason", e.target.value)}
              size={12}
            />
          </div>
        )}
      </>
    );
  };

  // ── KPI counts ────────────────────────────────────────────────────────────
  const total        = clients.length;
  const interested   = clients.filter((c) => c.status === "Interested").length;
  const notInterested= clients.filter((c) => c.status === "Not Interested").length;
  const notTalk      = clients.filter((c) => c.status === "Not Talk").length;
  // Won = clients whose payment is confirmed (status updated to "Won")
  const wonCount     = clients.filter((c) => c.status === "Won" || c.paymentStatus === "SUCCESS" || c.paymentStatus === "Paid").length;

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
          action={
            <div className="w-48">
              <Button
                text="Add Prospect"
                icon={<Plus size={16} />}
                variant="secondary"
                onClick={handleOpenAddClient}
              />
            </div>
          }
        />

        {/* ── KPI cards ── */}
        <EnhancedDashCard title="Total Clients"  value={total}         icon={<Users/>}       accentColor="#2563eb" size={3} />
        <EnhancedDashCard title="Interested"     value={interested}    icon={<CheckCircle/>} accentColor="#16a34a" size={3} />
        <EnhancedDashCard title="Not Interested" value={notInterested} icon={<Tag/>}         accentColor="#ef4444" size={3} />
        <EnhancedDashCard title="Won / Paid"     value={wonCount}      icon={<CheckCheck/>}  accentColor="#7c3aed" size={3} />

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
              show: (row) => row.paymentStatus !== "Paid",
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
          ADD CLIENT MODAL (NOW PROSPECT FORM)
      ════════════════════════════════════════════════════════════════════ */}
      <Modal id="add-client-modal" title="Add Prospect" size="md">
        <form onSubmit={handleAddClientSubmit} className="flex flex-col gap-5">
          {addError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 font-sans">
              {addError}
            </div>
          )}

          <div className="grid grid-cols-12 gap-4">
            <SelectField
              label="Select Client"
              id="add-client-select"
              size={12}
              value={addForm.clientId}
              onChange={(e) => setAddForm(prev => ({ ...prev, clientId: e.target.value }))}
              placeholder={fetchingClients ? "Loading clients..." : "Choose existing client"}
            >
              {activeClients.map(c => (
                <Option key={c._id} value={c._id} label={`${c.name} (${c.mobile})`} />
              ))}
            </SelectField>

            <SelectField
              label="Choose Status"
              id="add-status"
              size={12}
              value={addForm.status}
              onChange={(e) => af("status", e.target.value)}
              disabled={true}
            >
              <Option value="Interested" label="Interested" />
            </SelectField>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <div className="w-1/2">
              <Button
                text="Cancel"
                variant="secondary"
                size={12}
                onClick={() => closeModal("add-client-modal")}
              />
            </div>
            <div className="w-1/2">
              <Button
                text={submittingAdd ? "Adding..." : "Add Prospect"}
                type="submit"
                variant="primary"
                size={12}
                disabled={submittingAdd}
                loading={submittingAdd}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          VIEW MODAL
      ════════════════════════════════════════════════════════════════════ */}
      <Modal id="client-view" title="Client Details" size="lg">
        {selected && (
          <div className="flex flex-col gap-5">
            <ModalProfile
              name={selected.client}
              subtitle={`Sales Executive: ${selected.salesExec}`}
              meta={`Ref: ${maskId(selected.id, 'CLT')} · ${selected.status}`}
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

            {selected.termsAndConditionsPdf && (
              <ModalGrid title="Attachments" cols={1}>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Paperclip size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#2a465a] truncate">
                      {selected.termsAndConditionsPdf.split(/[\\/]/).pop()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Terms and Conditions PDF
                    </p>
                  </div>
                  <a
                    href={selected.termsAndConditionsPdf.startsWith('http') 
                      ? selected.termsAndConditionsPdf 
                      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${selected.termsAndConditionsPdf.split(/[\\/]/).pop()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#2a465a] text-white text-xs font-bold hover:bg-[#1e3a52] transition"
                  >
                    View / Download
                  </a>
                </div>
              </ModalGrid>
            )}

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
              subtitle={`Status: ${selected.status} · Ref: ${maskId(selected.id, 'CLT')}`}
              meta={`Current status: ${selected.status}`}
            />

            {/* ── Status selector ── */}
            <SelectField
              label="Choose Status"
              id="action-status"
              value={actionForm.status}
              onChange={(e) => af("status", e.target.value)}
            >
              {manualStatusOptions.map((o) => (
                <Option key={o} value={o} label={o} />
              ))}
            </SelectField>

            <div className="grid grid-cols-12 gap-4">
              {renderWorkflowFields()}
            </div>

            {/* ── Footer buttons ── */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                text="Cancel"
                variant="ghost"
                size={3}
                onClick={() => closeModal("client-action")}
              />
              <Button
                text={actionForm.status === "Interested" ? "Send To Client" : "Save"}
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