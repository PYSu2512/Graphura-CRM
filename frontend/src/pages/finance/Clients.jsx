import { useState } from "react";
import {
  Heading,
  DashGrid,
  DashCard,
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
import { workOrderStore } from "./Workorderstore";

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

// ── Initial dummy data ─────────────────────────────────────────────────────────
const initialClients = [
  {
    id: "CLT-001",
    client: "Arjun Mehta",
    mobile: "9876543210",
    email: "arjun@example.com",
    suggestedServices: "SEO, Social Media",
    suggestedAmount: 85000,
    discountType: "Flat",
    discount: 5000,
    finalAmount: 80000,
    status: "Interested",
    salesExec: "Rahul Singh",
    finalServices: "SEO, Social Media",
    notes: "Client wants monthly reports.",
    requirements: [],
    selectedService: "",
    discountMode: "None",
    discountValue: "",
    paymentStatus: "Unpaid",
    advanceAmount: "",
    notInterestedReason: "",
    conversationNotes: "",
    notTalkReason: "",
  },
  {
    id: "CLT-002",
    client: "Priya Sharma",
    mobile: "9823456789",
    email: "priya@example.com",
    suggestedServices: "Website Development",
    suggestedAmount: 150000,
    discountType: "Percentage",
    discount: 10,
    finalAmount: 135000,
    status: "Talk",
    salesExec: "Aarti Verma",
    finalServices: "Website Development, Maintenance",
    notes: "Includes 1 year support.",
    requirements: [],
    selectedService: "",
    discountMode: "None",
    discountValue: "",
    paymentStatus: "Unpaid",
    advanceAmount: "",
    notInterestedReason: "",
    conversationNotes: "",
    notTalkReason: "",
  },
  {
    id: "CLT-003",
    client: "TechNova Pvt Ltd",
    mobile: "9988776655",
    email: "contact@technova.in",
    suggestedServices: "ERP Integration",
    suggestedAmount: 320000,
    discountType: "Flat",
    discount: 20000,
    finalAmount: 300000,
    status: "Not Interested",
    salesExec: "Suresh Patel",
    finalServices: "ERP Integration",
    notes: "Q3 delivery required.",
    requirements: [],
    selectedService: "",
    discountMode: "None",
    discountValue: "",
    paymentStatus: "Unpaid",
    advanceAmount: "",
    notInterestedReason: "Client chose an in-house team for implementation.",
    conversationNotes: "",
    notTalkReason: "",
  },
  {
    id: "CLT-004",
    client: "Kavya Nair",
    mobile: "9012345678",
    email: "kavya@nair.com",
    suggestedServices: "Brand Design",
    suggestedAmount: 45000,
    discountType: "None",
    discount: 0,
    finalAmount: 45000,
    status: "Not Talk",
    salesExec: "Rahul Singh",
    finalServices: "Brand Design, Logo",
    notes: "Rush delivery.",
    requirements: [],
    selectedService: "",
    discountMode: "None",
    discountValue: "",
    paymentStatus: "Unpaid",
    advanceAmount: "",
    notInterestedReason: "",
    conversationNotes: "",
    notTalkReason: "Prospect was not available at the scheduled time.",
  },
  {
    id: "CLT-005",
    client: "Rohan Gupta",
    mobile: "9812398123",
    email: "rohan@gupta.com",
    suggestedServices: "Google Ads, Meta Ads",
    suggestedAmount: 60000,
    discountType: "Percentage",
    discount: 5,
    finalAmount: 57000,
    status: "Interested",
    salesExec: "Aarti Verma",
    finalServices: "Google Ads, Meta Ads",
    notes: "Budget capped at ₹57k.",
    requirements: [],
    selectedService: "",
    discountMode: "None",
    discountValue: "",
    paymentStatus: "Unpaid",
    advanceAmount: "",
    notInterestedReason: "",
    conversationNotes: "",
    notTalkReason: "",
  },
];

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

const calcDiscountAmount = (total, mode, value) => {
  const v = parseFloat(value) || 0;
  if (mode === "Percentage") return Math.round((total * Math.min(v, 99.99)) / 100);
  if (mode === "Rupees")     return Math.min(v, total);
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
const blankReq = () => ({ id: Date.now(), title: "", cost: "", description: "" });

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Clients() {
  const [clients, setClients]   = useState(initialClients);
  const [selected, setSelected] = useState(null);

  // ── Action-form state (lives outside the form so the modal can read it) ──
  const [actionForm, setActionForm] = useState({
    status: "Interested",
    // Interested fields
    selectedService: "",
    requirements: [],          // [{ id, title, cost, description }]
    termsAndConditions: "",
    discountMode: "None",      // "None" | "Percentage" | "Rupees"
    discountValue: "",
    paymentStatus: "Unpaid",   // "Paid" | "Unpaid" | "Advance"
    advanceAmount: "",
    advancePayments: [],
    // Other status fields
    notInterestedReason: "",
    conversationNotes: "",
    notTalkReason: "",
  });

  // ── New / editing requirement row ─────────────────────────────────────────
  const [reqDraft, setReqDraft]         = useState(blankReq());
  const [editingReqId, setEditingReqId] = useState(null); // null = adding new

  // States for advance payment drafting inside action modal
  const [advDraft, setAdvDraft]         = useState(blankAdv());
  const [editingAdvId, setEditingAdvId] = useState(null);

  // ── Derived financials (from actionForm) ──────────────────────────────────
  const totalCost     = calcTotalCost(actionForm.requirements);
  const discountAmt   = calcDiscountAmount(totalCost, actionForm.discountMode, actionForm.discountValue);
  const netPayable    = Math.max(0, totalCost - discountAmt);
  const advancePayments = actionForm.advancePayments || [];
  const advancePaid   = Math.min(netPayable, advancePayments.reduce((sum, p) => sum + calcAdvAmount(netPayable, p.mode, p.value), 0));
  const remaining     = Math.max(0, netPayable - advancePaid);

  // ── Handlers ──────────────────────────────────────────────────────────────
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
      status:             row.status          || "Interested",
      selectedService:    row.selectedService || "",
      requirements:       row.requirements    || [],
      termsAndConditions: row.termsAndConditions || "",
      discountMode:       row.discountMode    || "None",
      discountValue:      row.discountValue   || "",
      paymentStatus:      row.paymentStatus   || "Unpaid",
      advanceAmount:      row.advanceAmount   || "",
      advancePayments:    advancePaymentsList,
      notInterestedReason:row.notInterestedReason || "",
      conversationNotes:  row.conversationNotes   || "",
      notTalkReason:      row.notTalkReason        || "",
    });
    setReqDraft(blankReq());
    setEditingReqId(null);
    setAdvDraft(blankAdv());
    setEditingAdvId(null);
    openModal("client-action");
  };

  // ── Requirement CRUD ──────────────────────────────────────────────────────
  const handleAddReq = () => {
    if (!reqDraft.title.trim() || !reqDraft.cost) return;

    if (editingReqId !== null) {
      // Save edit
      af("requirements",
        actionForm.requirements.map((r) =>
          r.id === editingReqId ? { ...reqDraft, id: editingReqId } : r
        )
      );
      setEditingReqId(null);
    } else {
      // Add new
      af("requirements", [...actionForm.requirements, { ...reqDraft, id: Date.now() }]);
    }
    setReqDraft(blankReq());
  };

  const handleEditReq = (req) => {
    setReqDraft({ ...req });
    setEditingReqId(req.id);
  };

  const handleDeleteReq = (id) => {
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
  const saveActionForm = () => {
    if (!selected) return;

    const totalCostVal   = calcTotalCost(actionForm.requirements || []);
    const discountAmtVal = calcDiscountAmount(totalCostVal, actionForm.discountMode, actionForm.discountValue);
    const netPayableVal  = Math.max(0, totalCostVal - discountAmtVal);
    const advancePaymentsVal = actionForm.advancePayments || [];
    const advancePaidVal = advancePaymentsVal.reduce((sum, p) => sum + calcAdvAmount(netPayableVal, p.mode, p.value), 0);

    const updatedClient = {
      ...actionForm,
      advanceAmount: String(advancePaidVal),
      advancePayments: advancePaymentsVal,
    };

    setClients((prev) =>
      prev.map((c) =>
        c.id !== selected.id
          ? c
          : { ...c, ...updatedClient }
      )
    );

    if (actionForm.status === "Interested") {
      const newWO = {
        id: `WO-${Date.now()}`,
        clientId: selected.id,
        client: selected.client,
        clientEmail: selected.email,
        clientMobile: selected.mobile,
        salesExec: selected.salesExec,
        service: actionForm.selectedService,
        requirements: actionForm.requirements,
        totalCost: totalCostVal,
        discountMode: actionForm.discountMode,
        discountValue: actionForm.discountValue,
        discountAmt: discountAmtVal,
        netPayable: netPayableVal,
        paymentStatus: actionForm.paymentStatus,
        advanceAmount: String(advancePaidVal),
        advancePayments: advancePaymentsVal,
        terms: actionForm.termsAndConditions,
        generatedDate: new Date().toISOString().split("T")[0],
        signedStatus: "Unsigned",
        approvalStatus: "Pending",
        approvalComment: "",
      };
      workOrderStore.push(newWO);
    }

    closeModal("client-action");
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
        {/* ── Heading ── */}
        <Heading
          primaryText="Clients"
          secondaryText="Pipeline & Qualification"
          size={12}
        />

        {/* ── KPI cards ── */}
        <DashCard title="Total Clients"    value={total}         icon={<Users/>} accentColor="#2563eb" size={3} />
        <DashCard title="Interested"       value={interested}    icon={<CheckCircle/>} accentColor="#16a34a" size={3} />
        <DashCard title="Not Interested"   value={notInterested} icon={<Tag/>} accentColor="#ef4444" size={3} />
        <DashCard title="Not Talk"         value={notTalk}       icon={<CheckCheck/>} accentColor="#f59e0b" size={3} />

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

                  {/* ── Requirements list ── */}
                  {actionForm.requirements.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                      {/* List header */}
                      <div className="grid grid-cols-[1fr_120px_auto] gap-2 px-4 py-2 bg-[#2a465a]/5 border-b border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requirement</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Cost</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</span>
                      </div>

                      {actionForm.requirements.map((req, idx) => (
                        <div
                          key={req.id}
                          className={`grid grid-cols-[1fr_120px_auto] gap-2 px-4 py-3 items-start
                            ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                            ${editingReqId === req.id ? "ring-2 ring-inset ring-[#2a465a]/30" : ""}
                            border-b border-slate-100 last:border-0`}
                        >
                          {/* Title + description */}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#2a465a] truncate">{req.title}</p>
                            {req.description && (
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                {req.description}
                              </p>
                            )}
                          </div>

                          {/* Cost */}
                          <p className="text-sm font-black text-[#2a465a] text-right pt-0.5">
                            {fmt(req.cost)}
                          </p>

                          {/* Edit / Delete */}
                          <div className="flex gap-1.5 pt-0.5">
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
                          </div>
                        </div>
                      ))}

                      {/* Total cost row */}
                      <div className="grid grid-cols-[1fr_120px_auto] gap-2 px-4 py-3 bg-[#2a465a] border-t border-[#1e3a52]">
                        <span className="text-xs font-black text-white/70 uppercase tracking-widest col-span-1">
                          Total Cost
                        </span>
                        <span className="text-sm font-black text-white text-right">
                          {fmt(totalCost)}
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

                {/* ── Discount section (only shown when there are requirements) ── */}
                {actionForm.requirements.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                      Discount
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SelectField
                        label="Discount Type"
                        id="disc-mode"
                        value={actionForm.discountMode}
                        onChange={(e) => {
                          af("discountMode", e.target.value);
                          af("discountValue", "");
                        }}
                      >
                        <Option value="None"       label="No Discount"   />
                        <Option value="Percentage" label="Percentage (%)" />
                        <Option value="Rupees"     label="Rupees (₹)"     />
                      </SelectField>

                      {actionForm.discountMode !== "None" ? (
                        <DataField
                          label={
                            actionForm.discountMode === "Percentage"
                              ? "Discount % (max 99)"
                              : `Discount ₹ (max ${fmt(totalCost)})`
                          }
                          id="disc-val"
                          type="number"
                          placeholder={
                            actionForm.discountMode === "Percentage" ? "e.g. 10" : "e.g. 5000"
                          }
                          value={actionForm.discountValue}
                          onChange={(e) => {
                            let v = parseFloat(e.target.value) || 0;
                            if (actionForm.discountMode === "Percentage") v = Math.min(v, 99);
                            else v = Math.min(v, totalCost);
                            af("discountValue", String(v || ""));
                          }}
                          size={12}
                        />
                      ) : (
                        <div className="hidden sm:block" />
                      )}
                    </div>

                    {/* Discount summary */}
                    {actionForm.discountMode !== "None" && discountAmt > 0 && (
                      <div className="rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-3 divide-x divide-slate-100">
                          {[
                            { label: "Total Cost",   value: fmt(totalCost)   },
                            { label: "Discount",     value: `- ${fmt(discountAmt)}` },
                            { label: "Net Payable",  value: fmt(netPayable),  highlight: true },
                          ].map(({ label, value, highlight }) => (
                            <div
                              key={label}
                              className={`flex flex-col items-center justify-center py-3 px-2 gap-0.5
                                ${highlight ? "bg-[#2a465a]" : "bg-white"}`}
                            >
                              <span className={`text-[10px] font-bold uppercase tracking-widest
                                ${highlight ? "text-white/60" : "text-slate-400"}`}>
                                {label}
                              </span>
                              <span className={`text-sm font-black
                                ${highlight ? "text-white" : "text-[#2a465a]"}`}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── GST section ── */}
                {actionForm.requirements.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DataField
                      label="GST"
                      id="client-gst"
                      value="18% Included"
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
                              .reduce((sum, p) => sum + calcAdvAmount(netPayable, p.mode, p.value), 0);
                            const maxAllowedRupees = Math.max(0, netPayable - paidOther);
                            const maxAllowedPercent = netPayable > 0 
                              ? Math.max(0, Math.min(100, (maxAllowedRupees / netPayable) * 100))
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
                              {fmt(calcAdvAmount(netPayable, advDraft.mode, advDraft.value))}
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
                              {p.mode === "Percentage" ? `${p.value}% (${fmt(calcAdvAmount(netPayable, p.mode, p.value))})` : fmt(p.value)}
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

                    {/* Advance payment breakdown cards */}
                    {actionForm.paymentStatus === "Advance" && advancePaid > 0 && (
                      <div className="rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-3 divide-x divide-slate-100">
                          {[
                            { label: "Net Payable", value: fmt(netPayable) },
                            {
                              label: "Advance Paid",
                              value: fmt(advancePaid),
                              color: "text-emerald-600",
                            },
                            {
                              label: "Remaining",
                              value: fmt(remaining),
                              highlight: true,
                            },
                          ].map(({ label, value, highlight, color }) => (
                            <div
                              key={label}
                              className={`flex flex-col items-center justify-center py-3 px-2 gap-0.5
                                ${highlight ? "bg-[#2a465a]" : "bg-white"}`}
                            >
                              <span className={`text-[10px] font-bold uppercase tracking-widest
                                ${highlight ? "text-white/60" : "text-slate-400"}`}>
                                {label}
                              </span>
                              <span className={`text-sm font-black flex items-center gap-0.5
                                ${highlight ? "text-white" : color || "text-[#2a465a]"}`}>
                                <IndianRupee size={11} />
                                {Number(value.replace(/[₹,]/g, "")).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Cost Breakdown Summary ── */}
                {actionForm.requirements.length > 0 && (
                  <div className="flex flex-col gap-3 mt-4">
                    <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                      Cost Breakdown
                    </p>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-2.5">
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Requirements (Base Cost)</span>
                        <span className="font-semibold text-[#2a465a]">{fmt(totalCost - Math.round(totalCost * 18 / 118))}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600 border-b border-slate-100 pb-2.5">
                        <span>GST (18% Included)</span>
                        <span className="font-semibold text-[#2a465a]">{fmt(Math.round(totalCost * 18 / 118))}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-[#2a465a] pt-1">
                        <span>Total Cost (Inclusive of GST)</span>
                        <span>{fmt(totalCost)}</span>
                      </div>
                      {discountAmt > 0 && (
                        <div className="flex justify-between text-sm font-semibold text-rose-600 border-b border-slate-100 pb-2.5">
                          <span>Discount (Applied)</span>
                          <span>- {fmt(discountAmt)}</span>
                        </div>
                      )}

                      {advancePaid > 0 ? (
                        <>
                          <div className="flex justify-between text-sm font-bold text-[#2a465a] border-t border-slate-100 pt-2 pb-1">
                            <span>Final Net Payable</span>
                            <span>{fmt(netPayable)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold text-emerald-600 border-b border-slate-100 pb-2.5">
                            <span>Advance Paid</span>
                            <span>- {fmt(advancePaid)}</span>
                          </div>
                          <div className="flex justify-between items-center bg-[#2a465a]/5 rounded-xl px-3.5 py-3 border border-[#2a465a]/10 mt-1">
                            <span className="text-sm font-bold text-[#2a465a]">Remaining Payment</span>
                            <span className="text-lg font-black text-[#2a465a]">{fmt(remaining)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center bg-[#2a465a]/5 rounded-xl px-3.5 py-3 border border-[#2a465a]/10 mt-1">
                          <span className="text-sm font-bold text-[#2a465a]">Final Net Payable</span>
                          <span className="text-lg font-black text-[#2a465a]">{fmt(netPayable)}</span>
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