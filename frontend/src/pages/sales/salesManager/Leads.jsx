import { useState, useRef } from "react";
import {
  Heading,
  Grid,
  DataTable,
  Button,
  Modal,
  DataField,
  SelectField,
  Option,
  openModal,
  closeModal,
  ModalProfile,
  ModalData,
  ModalGrid,
} from "../../../components/shared/Common_Components";
import {
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  Users,
  Trash2,
  Eye,
  Pencil,
  UserCheck,
  ArchiveX,
  CalendarClock,
  BadgeCheck,
  GitBranch,
  Target,
  List,
  TrendingUp,
  Database,
} from "lucide-react";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const TEAM_LEADERS = [
  { id: "TL001", name: "Rahul Mehta",    currentLeads: 1200, email: "rahul@crm.com" },
  { id: "TL002", name: "Sneha Patel",    currentLeads: 980,  email: "sneha@crm.com" },
  { id: "TL003", name: "Arjun Verma",    currentLeads: 450,  email: "arjun@crm.com" },
  { id: "TL004", name: "Priya Sharma",   currentLeads: 1490, email: "priya@crm.com" },
  { id: "TL005", name: "Kabir Singh",    currentLeads: 300,  email: "kabir@crm.com" },
];

const MAX_LEADS = 1500;

const INITIAL_LEADS = [
  { id: "L001", name: "Amit Joshi",     mobile: "9876543210", email: "amit@gmail.com",    status: "New",         assignedTo: "Rahul Mehta",  createdDate: "2025-04-01" },
  { id: "L002", name: "Nisha Agarwal",  mobile: "9123456780", email: "nisha@yahoo.com",   status: "Follow-up",   assignedTo: "Sneha Patel",  createdDate: "2025-04-02" },
  { id: "L003", name: "Rohit Kumar",    mobile: "8765432109", email: "rohit@gmail.com",   status: "Prospect",    assignedTo: "Arjun Verma",  createdDate: "2025-04-03" },
  { id: "L004", name: "Deepa Singh",    mobile: "7654321098", email: "deepa@outlook.com", status: "New",         assignedTo: "Unassigned",   createdDate: "2025-04-04" },
  { id: "L005", name: "Vikram Shah",    mobile: "6543210987", email: "vikram@gmail.com",  status: "Prospect",    assignedTo: "Kabir Singh",  createdDate: "2025-04-05" },
  { id: "L006", name: "Meera Nair",     mobile: "9988776655", email: "meera@gmail.com",   status: "New",         assignedTo: "Unassigned",   createdDate: "2025-04-06" },
  { id: "L007", name: "Suresh Babu",    mobile: "8877665544", email: "suresh@gmail.com",  status: "Follow-up",   assignedTo: "Rahul Mehta",  createdDate: "2025-04-07" },
  { id: "L008", name: "Kavya Reddy",    mobile: "7766554433", email: "kavya@gmail.com",   status: "Converted",   assignedTo: "Sneha Patel",  createdDate: "2025-04-08" },
];

const DUMMY_PROSPECTS = [
  { id: "P001", name: "Amit Joshi",    mobile: "9876543210", email: "amit@gmail.com",    service: "CRM Software",  budget: "₹50,000",  assignedTL: "Rahul Mehta", status: "Hot" },
  { id: "P002", name: "Rohit Kumar",   mobile: "8765432109", email: "rohit@gmail.com",   service: "HR Module",     budget: "₹30,000",  assignedTL: "Arjun Verma", status: "Warm" },
  { id: "P003", name: "Vikram Shah",   mobile: "6543210987", email: "vikram@gmail.com",  service: "Payroll Suite", budget: "₹80,000",  assignedTL: "Kabir Singh", status: "Cold" },
  { id: "P004", name: "Pooja Tiwari",  mobile: "9871234560", email: "pooja@gmail.com",   service: "ERP System",    budget: "₹1,50,000", assignedTL: "Rahul Mehta", status: "Hot" },
];

const DUMMY_FOLLOWUPS = [
  { name: "Amit Joshi",   assignedTL: "Rahul Mehta",  assignedExec: "Raj Patel",    followUpDate: "2025-04-28", priority: "High",   status: "Pending" },
  { name: "Nisha Agarwal",assignedTL: "Sneha Patel",  assignedExec: "Priti Shah",   followUpDate: "2025-04-29", priority: "Medium", status: "Pending" },
  { name: "Rohit Kumar",  assignedTL: "Arjun Verma",  assignedExec: "Sunita Roy",   followUpDate: "2025-04-30", priority: "Low",    status: "Done" },
  { name: "Meera Nair",   assignedTL: "Rahul Mehta",  assignedExec: "Raj Patel",    followUpDate: "2025-05-01", priority: "High",   status: "Pending" },
];

const DUMMY_DUMP = [
  { id: "D001", name: "Old Lead 1",  mobile: "9000000001", email: "old1@gmail.com", dumpReason: "Invalid Number", dumpedBy: "Rahul Mehta", dumpDate: "2025-03-15" },
  { id: "D002", name: "Old Lead 2",  mobile: "9000000002", email: "old2@gmail.com", dumpReason: "Not Interested", dumpedBy: "Sneha Patel", dumpDate: "2025-03-18" },
  { id: "D003", name: "Old Lead 3",  mobile: "9000000003", email: "old3@gmail.com", dumpReason: "Duplicate",      dumpedBy: "Arjun Verma", dumpDate: "2025-03-20" },
];

// ─── CSV Validation ──────────────────────────────────────────────────────────
function validateCSVRows(rows, existingLeads) {
  const seenMobiles = new Set(existingLeads.map((l) => l.mobile));
  const seenEmails  = new Set(existingLeads.map((l) => l.email));
  const localMobiles = new Set();
  const localEmails  = new Set();

  return rows
    .filter((row) => row.name?.trim() || row.mobile?.trim() || row.email?.trim()) // skip fully blank rows
    .map((row, idx) => {
    const errors = [];
    if (!row.name?.trim()) errors.push("Name required");
    if (!/^\d{10}$/.test((row.mobile || "").trim())) errors.push("Mobile must be 10 digits");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((row.email || "").trim())) errors.push("Invalid email");
    if (seenMobiles.has(row.mobile?.trim()) || localMobiles.has(row.mobile?.trim())) errors.push("Duplicate mobile");
    if (seenEmails.has(row.email?.trim())   || localEmails.has(row.email?.trim()))   errors.push("Duplicate email");
    localMobiles.add(row.mobile?.trim());
    localEmails.add(row.email?.trim());

    return {
      _idx: idx,
      name:   row.name?.trim()   || "",
      mobile: row.mobile?.trim() || "",
      email:  row.email?.trim()  || "",
      validationStatus: errors.length === 0 ? "Valid" : "Invalid",
      errorReason: errors.join("; "),
      selected: errors.length === 0,
    };
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// LEADS PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function SalesManagerLeads() {
  const TABS = [
    { key: "All Leads",         label: "All Leads",         icon: List },
    { key: "Prospects",         label: "Prospects",         icon: TrendingUp },
    { key: "Follow-ups",        label: "Follow-ups",        icon: CalendarClock },
    { key: "Bulk Upload",       label: "Bulk Upload",       icon: Upload },
    { key: "Lead Distribution", label: "Lead Distribution", icon: GitBranch },
    { key: "Dump Data",         label: "Dump Data",         icon: Database },
  ];
  const [activeTab, setActiveTab]   = useState("All Leads");
  const [leads, setLeads]           = useState(INITIAL_LEADS);
  const [dumpData, setDumpData]     = useState(DUMMY_DUMP);
  const [csvRows, setCsvRows]       = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // Distribution state
  const [distLeads, setDistLeads]         = useState([]);
  const [distTLs, setDistTLs]             = useState([]);
  const [distTableRows, setDistTableRows] = useState([]);
  const [distStep, setDistStep]           = useState(1); // 1=select, 2=configure
  const [distWarning, setDistWarning]     = useState("");

  // Modal state
  const [viewLead, setViewLead]           = useState(null);
  const [editLead, setEditLead]           = useState(null);
  const [assignLead, setAssignLead]       = useState(null);
  const [assignTL, setAssignTL]           = useState("");
  const [reassignDump, setReassignDump]   = useState(null);
  const [reassignTL, setReassignTL]       = useState("");
  const [reassignWarning, setReassignWarning] = useState("");

  // ── Delete confirmation state ─────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null); // dump row to delete

  const fileRef = useRef();
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split("\n").filter((l) => l.trim());
      const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
      const nameIdx   = header.indexOf("name");
      const mobileIdx = header.indexOf("mobile");
      const emailIdx  = header.indexOf("email");
      const parsed = lines.slice(1).map((line) => {
        const cols = line.split(",");
        return {
          name:   cols[nameIdx]   ?? "",
          mobile: cols[mobileIdx] ?? "",
          email:  cols[emailIdx]  ?? "",
        };
      });
      setCsvRows(validateCSVRows(parsed, leads));
    };
    reader.readAsText(file);
  };

  const toggleCsvRow = (idx) => {
    setCsvRows((prev) =>
      prev.map((r) => (r._idx === idx ? { ...r, selected: !r.selected } : r))
    );
  };

  const saveValidLeads = () => {
    const toAdd = csvRows
      .filter((r) => r.selected && r.validationStatus === "Valid")
      .map((r, i) => ({
        id: `L${String(leads.length + i + 1).padStart(3, "0")}`,
        name:        r.name,
        mobile:      r.mobile,
        email:       r.email,
        status:      "New",
        assignedTo:  "Unassigned",
        createdDate: new Date().toISOString().split("T")[0],
      }));
    setLeads((prev) => [...prev, ...toAdd]);
    setCsvRows([]);
    setCsvFileName("");
    setActiveTab("All Leads");
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadCSVFormat = () => {
    const content = "Name,Mobile,Email\nJohn Doe,9876543210,john@example.com";
    const blob = new Blob([content], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "lead_upload_format.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Move to Dump ──────────────────────────────────────────────────────────
  const moveToDump = (row) => {
    setLeads((prev) => prev.filter((l) => l.id !== row.id));
    setDumpData((prev) => [
      ...prev,
      {
        id:         row.id,
        name:       row.name,
        mobile:     row.mobile,
        email:      row.email,
        dumpReason: "Moved by Manager",
        dumpedBy:   "Sales Manager",
        dumpDate:   new Date().toISOString().split("T")[0],
      },
    ]);
  };

  // ── Assign Lead ───────────────────────────────────────────────────────────
  const confirmAssign = () => {
    if (!assignTL) return;
    setLeads((prev) =>
      prev.map((l) => (l.id === assignLead?.id ? { ...l, assignedTo: assignTL } : l))
    );
    setAssignLead(null);
    setAssignTL("");
    closeModal("assign-lead-modal");
  };

  // ── Reassign from Dump ────────────────────────────────────────────────────
  const confirmReassign = () => {
    if (!reassignTL) return;
    const tl = TEAM_LEADERS.find((t) => t.name === reassignTL);
    const cap = tl ? MAX_LEADS - tl.currentLeads : 0;
    if (cap <= 0) {
      setReassignWarning(`${tl.name} has no capacity.`);
      return;
    }
    setLeads((prev) => [
      ...prev,
      {
        id:          reassignDump.id,
        name:        reassignDump.name,
        mobile:      reassignDump.mobile,
        email:       reassignDump.email,
        status:      "New",
        assignedTo:  reassignTL,
        createdDate: new Date().toISOString().split("T")[0],
      },
    ]);
    setDumpData((prev) => prev.filter((d) => d.id !== reassignDump.id));
    setReassignDump(null);
    setReassignTL("");
    setReassignWarning("");
    closeModal("reassign-dump-modal");
  };

  // ── Lead Distribution ─────────────────────────────────────────────────────
  const unassignedLeads = leads.filter((l) => l.assignedTo === "Unassigned");

  const initDistribution = () => {
    const selected = leads.filter((l) => selectedLeadIds.includes(l.id));
    if (selected.length === 0) { alert("Please select leads first from All Leads tab."); return; }
    setDistLeads(selected);
    setDistTLs([]);
    setDistTableRows([]);
    setDistStep(1);
    setDistWarning("");
  };

  const addTLToDistribution = (tlId) => {
    const tl = TEAM_LEADERS.find((t) => t.id === tlId);
    if (!tl || distTLs.find((t) => t.id === tlId)) return;
    const cap = MAX_LEADS - tl.currentLeads;
    setDistTLs((prev) => [...prev, tl]);
    setDistTableRows((prev) => [
      ...prev,
      { tlId, tlName: tl.name, currentLeads: tl.currentLeads, capacity: cap, assignLeads: 0, target: 0 },
    ]);
  };

  const updateDistRow = (tlId, field, val) => {
    setDistTableRows((prev) =>
      prev.map((r) => (r.tlId === tlId ? { ...r, [field]: Number(val) } : r))
    );
  };

  const distributeLeads = () => {
    const totalAssigning = distTableRows.reduce((s, r) => s + r.assignLeads, 0);
    setDistWarning("");

    if (totalAssigning > distLeads.length) {
      setDistWarning(`Cannot assign ${totalAssigning} leads — only ${distLeads.length} selected.`);
      return;
    }
    for (const r of distTableRows) {
      if (r.target > r.assignLeads) {
        setDistWarning(`Target for ${r.tlName} (${r.target}) cannot exceed assigned leads (${r.assignLeads}).`);
        return;
      }
      if (r.assignLeads > r.capacity) {
        setDistWarning(`${r.tlName} only has capacity for ${r.capacity} more leads.`);
        return;
      }
    }

    // Randomly distribute leads among TLs
    const shuffled = [...distLeads].sort(() => Math.random() - 0.5);
    let pointer = 0;
    const updates = {};
    for (const r of distTableRows) {
      const slice = shuffled.slice(pointer, pointer + r.assignLeads);
      pointer += r.assignLeads;
      slice.forEach((l) => { updates[l.id] = r.tlName; });
    }

    setLeads((prev) =>
      prev.map((l) => (updates[l.id] ? { ...l, assignedTo: updates[l.id] } : l))
    );
    setSelectedLeadIds([]);
    setDistStep(1);
    setDistLeads([]);
    setDistTLs([]);
    setDistTableRows([]);
    alert("Leads distributed successfully!");
    setActiveTab("All Leads");
  };

  // ═══ RENDER SECTIONS ══════════════════════════════════════════════════════

  // ── A. All Leads ──────────────────────────────────────────────────────────
  const renderAllLeads = () => (
    <DataTable
      title="All Leads"
      columns={[
        { key: "name",       label: "Name" },
        { key: "mobile",     label: "Mobile" },
        { key: "email",     label: "Email" },
        { key: "status",     label: "Status" },
        { key: "assignedTo", label: "Assigned To" },
      ]}
      rows={leads}
      searchable
      date={true}
      bulkAction
      bulkActions={[
        {
          title: "Move to Dump",
          icon: <Trash2 size={14} />,
          onClick: (selected) => selected.forEach((row) => {
            const lead = leads.find((l) => l.id === row.id);
            if (lead) moveToDump(lead);
          }),
        },
        {
          title: "Select for Distribution",
          icon: <Users size={14} />,
          onClick: (selected) => {
            setSelectedLeadIds(selected.map((r) => r.id));
            setActiveTab("Lead Distribution");
          },
        },
      ]}
      filters={[
        { title: "Status",      type: "toggle", key: "status",     options: ["New", "Follow-up", "Prospect", "Converted"] },
        { title: "Assigned To", type: "select", key: "assignedTo", options: ["Unassigned", ...TEAM_LEADERS.map((t) => t.name)] },
      ]}
      actions={[
        { icon: <Eye size={15} />,      tooltip: "View",   variant: "ghost",   onClick: (row) => { setViewLead(leads.find((l) => l.id === row.id)); openModal("view-lead-modal"); } },
        { icon: <Pencil size={15} />,   tooltip: "Edit",   variant: "ghost",   onClick: (row) => { setEditLead({ ...leads.find((l) => l.id === row.id) }); openModal("edit-lead-modal"); } },
        { icon: <UserCheck size={15} />,tooltip: "Assign", variant: "primary", onClick: (row) => { setAssignLead(leads.find((l) => l.id === row.id)); setAssignTL(""); openModal("assign-lead-modal"); } },
        { icon: <ArchiveX size={15} />, tooltip: "Dump",   variant: "danger",  onClick: (row) => { const lead = leads.find((l) => l.id === row.id); if (lead) moveToDump(lead); } },
      ]}
      size={12}
      pageSize={10}
    />
  );

  // ── B. Bulk Upload ────────────────────────────────────────────────────────
  const validRows     = csvRows.filter((r) => r.validationStatus === "Valid");
  const invalidRows   = csvRows.filter((r) => r.validationStatus === "Invalid");
  const duplicateRows = csvRows.filter((r) => r.errorReason?.includes("Duplicate"));
  const selectedCount = csvRows.filter((r) => r.selected).length;

  const toggleAllValid = () => {
    const allSelected = validRows.every((r) => r.selected);
    setCsvRows((prev) =>
      prev.map((r) =>
        r.validationStatus === "Valid" ? { ...r, selected: !allSelected } : r
      )
    );
  };

  const renderBulkUpload = () => (
    <Grid cols={12} gap={4}>
      {/* Upload controls */}
      <div className="col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
        <div>
          <p className="text-base font-bold text-[#2a465a]">CSV Bulk Upload</p>
          <p className="text-sm text-slate-500 mt-1">
            Upload a CSV with columns:{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">Name, Mobile, Email</code>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button text="Download CSV Format" variant="secondary" size={3} onClick={downloadCSVFormat} />
          <label className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-dashed border-[#2a465a]/40 bg-slate-50 text-sm font-bold text-[#2a465a] cursor-pointer hover:bg-slate-100 transition">
            <Upload size={15} /> {csvFileName || "Choose CSV File"}
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* Duplicate warning banner */}
      {duplicateRows.length > 0 && (
        <div className="col-span-12 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-2xl">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">
              {duplicateRows.length} duplicate entr{duplicateRows.length > 1 ? "ies" : "y"} detected
            </p>
            <p className="text-xs mt-0.5">
              The following rows have mobile numbers or emails that already exist in your leads list or appear more than once in this file. They have been deselected automatically.
            </p>
            <ul className="mt-2 space-y-0.5">
              {duplicateRows.map((r) => (
                <li key={r._idx} className="text-xs font-medium">
                  • <span className="font-bold">{r.name || "(no name)"}</span> — {r.errorReason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Validation results table */}
      {csvRows.length > 0 && (
        <div className="col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <p className="font-bold text-[#2a465a]">Validation Results</p>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="text-emerald-600 font-semibold">{validRows.length} valid</span>
                {" · "}
                <span className="text-rose-500 font-semibold">{invalidRows.length} invalid</span>
                {" · "}
                <span className="text-slate-500">{selectedCount} selected</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCsvRows([]); setCsvFileName(""); if (fileRef.current) fileRef.current.value = ""; }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveValidLeads}
                disabled={selectedCount === 0}
                className="px-5 py-2.5 rounded-xl bg-[#2a465a] text-white text-sm font-bold hover:bg-[#1e3a52] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save {selectedCount > 0 ? `${selectedCount} ` : ""}Selected Leads
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#2a465a] to-[#3a5a7a]">
                  {/* Select-all checkbox for valid rows */}
                  <th className="py-3.5 pl-5 pr-2 w-10">
                    <button
                      type="button"
                      onClick={toggleAllValid}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                        validRows.length > 0 && validRows.every((r) => r.selected)
                          ? "bg-white border-white"
                          : "bg-transparent border-white/40 hover:border-white/80"
                      }`}
                    >
                      {validRows.length > 0 && validRows.every((r) => r.selected) && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#2a465a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  </th>
                  {["Name", "Mobile", "Email", "Status", "Error"].map((h) => (
                    <th key={h} className="py-3.5 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvRows.map((row, i) => {
                  const isValid = row.validationStatus === "Valid";
                  return (
                    <tr
                      key={row._idx}
                      className={`border-b border-slate-100 transition ${
                        row.selected ? "bg-blue-50/60" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      } ${!isValid ? "opacity-70" : ""}`}
                    >
                      {/* Row checkbox */}
                      <td className="py-3 pl-5 pr-2 w-10">
                        <button
                          type="button"
                          disabled={!isValid}
                          onClick={() => toggleCsvRow(row._idx)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                            row.selected
                              ? "bg-[#2a465a] border-[#2a465a]"
                              : isValid
                              ? "bg-white border-slate-300 hover:border-[#2a465a]/60"
                              : "bg-slate-100 border-slate-200 cursor-not-allowed"
                          }`}
                        >
                          {row.selected && (
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#2a465a]">
                        {row.name || <span className="text-rose-400 italic text-xs">missing</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {row.mobile || <span className="text-rose-400 italic text-xs">missing</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {row.email || <span className="text-rose-400 italic text-xs">missing</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isValid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          {isValid ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                          {isValid ? "Valid" : "Invalid"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-rose-500 max-w-[200px]">
                        {row.errorReason || <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Grid>
  );

  // ── C. Lead Distribution ──────────────────────────────────────────────────
  const renderLeadDistribution = () => (
    <Grid cols={12} gap={4}>
      {/* Header info */}
      <div className="col-span-12 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold text-[#2a465a]">Lead Distribution</p>
          <p className="text-sm text-slate-500 mt-0.5">
            {selectedLeadIds.length > 0
              ? `${selectedLeadIds.length} leads selected from All Leads`
              : "Go to All Leads → select leads → click 'Select for Distribution'"}
          </p>
        </div>
        {selectedLeadIds.length > 0 && distStep === 1 && (
          <Button text="Configure Distribution" variant="primary" size={3} onClick={initDistribution} />
        )}
      </div>

      {distLeads.length > 0 && (
        <>
          {/* TL Selector */}
          <div className="col-span-12 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="font-bold text-[#2a465a] mb-3">Select Team Leaders</p>
            <div className="flex flex-wrap gap-2">
              {TEAM_LEADERS.map((tl) => {
                const cap = MAX_LEADS - tl.currentLeads;
                const added = !!distTLs.find((t) => t.id === tl.id);
                return (
                  <Button
                    key={tl.id}
                    text={`${tl.name} (${cap} cap)`}
                    variant={added ? "primary" : cap === 0 ? "ghost" : "secondary"}
                    size={2}
                    disabled={added || cap === 0}
                    onClick={() => addTLToDistribution(tl.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* Distribution Table */}
          {distTableRows.length > 0 && (
            <div className="col-span-12">
              {distWarning && (
                <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
                  <AlertTriangle size={15} /> {distWarning}
                </div>
              )}
              <DataTable
                title="Distribution Configuration"
                columns={[
                  { key: "tlName",       label: "Team Leader" },
                  { key: "currentLeads", label: "Current Leads" },
                  { key: "capacity",     label: "Available Capacity" },
                  { key: "assignLeads",  label: "Assign Leads" },
                  { key: "target",       label: "Target" },
                  { key: "status",       label: "Status" },
                ]}
                rows={distTableRows.map((r) => ({
                  ...r,
                  assignLeads: (
                    <input
                      type="number" min={0} max={Math.min(r.capacity, distLeads.length)}
                      value={r.assignLeads}
                      onChange={(e) => updateDistRow(r.tlId, "assignLeads", e.target.value)}
                      className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20"
                    />
                  ),
                  target: (
                    <input
                      type="number" min={0} max={r.assignLeads}
                      value={r.target}
                      onChange={(e) => updateDistRow(r.tlId, "target", e.target.value)}
                      className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20"
                    />
                  ),
                  status: r.assignLeads > 0 ? "Completed" : "Pending",
                }))}
                size={12}
                pageSize={10}
                searchable={false}
              />
              <div className="mt-3">
                <Button text="Distribute Leads" variant="primary" size={3} onClick={distributeLeads} />
              </div>
            </div>
          )}
        </>
      )}
    </Grid>
  );

  // ── D. Prospects ──────────────────────────────────────────────────────────
  const renderProspects = () => (
    <DataTable
      title="Prospects"
      columns={[
        { key: "name",       label: "Name" },
        { key: "service",    label: "Service" },
        { key: "budget",     label: "Budget" },
        { key: "assignedTL", label: "Assigned TL" },
        { key: "status",     label: "Status" },
      ]}
      rows={DUMMY_PROSPECTS}
      searchable
      filters={[
        { title: "Status",      type: "toggle", key: "status",     options: ["Hot", "Warm", "Cold"] },
        { title: "Assigned TL", type: "select", key: "assignedTL", options: TEAM_LEADERS.map((t) => t.name) },
      ]}
      actions={[
        { icon: <Eye size={15} />,       tooltip: "View",            variant: "ghost",   onClick: () => {} },
        { icon: <Pencil size={15} />,    tooltip: "Edit",            variant: "ghost",   onClick: () => {} },
        { icon: <BadgeCheck size={15} />,tooltip: "Send to Finance", variant: "primary", onClick: () => {} },
      ]}
      size={12}
      pageSize={10}
    />
  );

  const renderFollowUps = () => (
    <DataTable
      title="Follow-ups"
      columns={[
        { key: "name",         label: "Lead Name" },
        { key: "assignedTL",   label: "Assigned TL" },
        { key: "followUpDate", label: "Follow-up Date" },
        { key: "priority",     label: "Priority" },
        { key: "status",       label: "Status" },
      ]}
      rows={DUMMY_FOLLOWUPS}
      searchable
      date={true}
      filters={[
        { title: "Priority", type: "toggle", key: "priority", options: ["High", "Medium", "Low"] },
        { title: "Status",   type: "toggle", key: "status",   options: ["Pending", "Done"] },
      ]}
      actions={[
        { icon: <Eye size={15} />,         tooltip: "View",       variant: "ghost",   onClick: () => {} },
        { icon: <CalendarClock size={15} />,tooltip: "Reschedule", variant: "ghost",   onClick: () => {} },
        { icon: <BadgeCheck size={15} />,  tooltip: "Mark Done",  variant: "primary", onClick: () => {} },
      ]}
      size={12}
      pageSize={10}
    />
  );

  // ── F. Dump Data ──────────────────────────────────────────────────────────
  const renderDumpData = () => (
    <>
      <DataTable
        title="Dump Data"
        columns={[
          { key: "name",       label: "Name" },
          { key: "dumpReason", label: "Dump Reason" },
          { key: "dumpedBy",   label: "Dumped By" },
          { key: "dumpDate",   label: "Dump Date" },
        ]}
        rows={dumpData}
        searchable
        actions={[
          { icon: <Eye size={15} />,       tooltip: "View",     variant: "ghost",   onClick: () => {} },
          { icon: <Pencil size={15} />,    tooltip: "Edit",     variant: "ghost",   onClick: () => {} },
          { icon: <UserCheck size={15} />, tooltip: "Reassign", variant: "primary", onClick: (row) => { const d = dumpData.find((x) => x.id === row.id); setReassignDump(d); setReassignTL(""); setReassignWarning(""); openModal("reassign-dump-modal"); } },
          { icon: <Trash2 size={15} />,    tooltip: "Delete",   variant: "danger",  onClick: (row) => { setDeleteTarget(dumpData.find((d) => d.id === row.id)); openModal("delete-confirm-modal"); } },
        ]}
        size={12}
        pageSize={10}
      />

      {/* Reassign Modal */}
      <Modal id="reassign-dump-modal" title="Reassign Lead" size="md">
        {reassignDump && (
          <div className="space-y-4">
            <ModalProfile name={reassignDump.name} subtitle={reassignDump.mobile} meta={reassignDump.email} />
            <SelectField
              label="Select Team Leader"
              value={reassignTL}
              onChange={(e) => { setReassignTL(e.target.value); setReassignWarning(""); }}
              placeholder="Choose a TL"
            >
              {TEAM_LEADERS.map((tl) => {
                const cap = MAX_LEADS - tl.currentLeads;
                return <Option key={tl.id} value={tl.name} label={`${tl.name} (${cap} capacity)`} disabled={cap === 0} />;
              })}
            </SelectField>
            {reassignWarning && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
                <AlertTriangle size={15} /> {reassignWarning}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button text="Reassign" variant="primary" size={6} onClick={confirmReassign} />
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("reassign-dump-modal")} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );

  // ═══ MAIN RENDER ══════════════════════════════════════════════════════════
  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <Grid cols={12} gap={6}>
        {/* Page Heading */}
        <Heading primaryText="Leads" secondaryText="Management" size={12} fontSize="2xl" />

        {/* Tab Buttons */}
        <div className="col-span-12">
          <div className="flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === key
                    ? "bg-[#2a465a] text-white shadow"
                    : "text-slate-500 hover:bg-slate-100 hover:text-[#2a465a]"
                }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                {label}
                {key === "All Leads" && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {leads.length}
                  </span>
                )}
                {key === "Dump Data" && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === key ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>
                    {dumpData.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Section Content */}
        <div className="col-span-12">
          {activeTab === "All Leads"         && renderAllLeads()}
          {activeTab === "Bulk Upload"        && renderBulkUpload()}
          {activeTab === "Lead Distribution"  && renderLeadDistribution()}
          {activeTab === "Prospects"          && renderProspects()}
          {activeTab === "Follow-ups"         && renderFollowUps()}
          {activeTab === "Dump Data"          && renderDumpData()}        </div>
      </Grid>

      {/* Delete Confirmation Modal */}
      <Modal id="delete-confirm-modal" title="Delete Lead" size="sm">
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-[#2a465a]">{deleteTarget.name}</span> from dump data? This action cannot be undone.
            </p>
            <ModalGrid title="Lead Info" cols={2}>
              <ModalData label="Mobile"      value={deleteTarget.mobile} />
              <ModalData label="Dump Reason" value={deleteTarget.dumpReason} />
            </ModalGrid>
            <div className="flex justify-end gap-2 pt-1">
              <Button text="Cancel" variant="ghost"  size={4} onClick={() => { setDeleteTarget(null); closeModal("delete-confirm-modal"); }} />
              <Button text="Delete" variant="danger" size={4} onClick={() => {
                setDumpData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
                setDeleteTarget(null);
                closeModal("delete-confirm-modal");
              }} />
            </div>
          </div>
        )}
      </Modal>

      {/* View Lead Modal */}
      <Modal id="view-lead-modal" title="Lead Details" size="md">
        {viewLead && (
          <div className="space-y-4">
            <ModalProfile
              name={viewLead.name}
              subtitle={`${viewLead.assignedTo} · ${viewLead.status}`}
              meta={`ID: ${viewLead.id} · Created: ${viewLead.createdDate}`}
            />
            <ModalGrid title="Contact Info" cols={2}>
              <ModalData label="Mobile" value={viewLead.mobile} />
              <ModalData label="Email"  value={viewLead.email} />
            </ModalGrid>
            <ModalGrid title="Lead Info" cols={2}>
              <ModalData label="Lead ID"     value={viewLead.id} />
              <ModalData label="Status"      value={viewLead.status} />
              <ModalData label="Assigned To" value={viewLead.assignedTo} />
              <ModalData label="Created"     value={viewLead.createdDate} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("view-lead-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Lead Modal */}
      <Modal id="edit-lead-modal" title="Edit Lead" size="md">
        {editLead && (
          <div className="space-y-4">
            <Grid cols={12} gap={4}>
              <DataField label="Name"   id="el-name"   value={editLead.name}   size={6} onChange={(e) => setEditLead((p) => ({ ...p, name: e.target.value }))} />
              <DataField label="Mobile" id="el-mobile" value={editLead.mobile} size={6} onChange={(e) => setEditLead((p) => ({ ...p, mobile: e.target.value }))} />
              <DataField label="Email"  id="el-email"  value={editLead.email}  size={12} type="email" onChange={(e) => setEditLead((p) => ({ ...p, email: e.target.value }))} />
              <SelectField label="Status" value={editLead.status} size={6} onChange={(e) => setEditLead((p) => ({ ...p, status: e.target.value }))}>
                {["New","Follow-up","Prospect","Converted"].map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <SelectField label="Assign To" value={editLead.assignedTo} size={6} onChange={(e) => setEditLead((p) => ({ ...p, assignedTo: e.target.value }))}>
                <Option value="Unassigned" label="Unassigned" />
                {TEAM_LEADERS.map((tl) => <Option key={tl.id} value={tl.name} label={tl.name} />)}
              </SelectField>
              <Button text="Save Changes" variant="primary" size={6} onClick={() => {
                setLeads((prev) => prev.map((l) => (l.id === editLead.id ? editLead : l)));
                closeModal("edit-lead-modal");
              }} />
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("edit-lead-modal")} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* Assign Lead Modal */}
      <Modal id="assign-lead-modal" title="Assign Lead" size="sm">
        {assignLead && (
          <div className="space-y-4">
            <ModalProfile name={assignLead.name} subtitle={assignLead.mobile} meta={assignLead.email} />
            <SelectField label="Team Leader" value={assignTL} onChange={(e) => setAssignTL(e.target.value)} placeholder="Select TL">
              {TEAM_LEADERS.map((tl) => {
                const cap = MAX_LEADS - tl.currentLeads;
                return <Option key={tl.id} value={tl.name} label={`${tl.name} (${cap} cap)`} disabled={cap === 0} />;
              })}
            </SelectField>
            <div className="flex gap-3">
              <Button text="Assign" variant="primary" size={6} onClick={confirmAssign} disabled={!assignTL} />
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("assign-lead-modal")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}