/**
 * AllUsers.jsx — Admin User Management
 * Features: list users, edit (name/phone/role/status), soft-delete,
 *           right-side toast notifications (auto-dismiss 4s)
 */

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Users, UserCheck, UserX, Target, Download, Upload, UserPlus,
  CheckCircle2, AlertTriangle, X, Eye, Pencil, Trash2,
  Building2, CreditCard, User as UserIcon, Phone, Mail,
  CalendarDays, BadgeCheck, Landmark,
} from "lucide-react";
import {
  DashGrid, EnhancedDashCard, DataTable,
  PanelModal as Modal, openModal, closeModal,
  DataField, SelectField, Option, Grid,
} from "../../../components/shared/Common_Components";
import { userService } from "../../../services/userService";
import apiClient from "../../../services/apiClient";

// ── Right-side Toast ──────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none" style={{ minWidth: 300 }}>
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-xl border pointer-events-auto transition-all ${
            t.type === "success" ? "bg-white border-emerald-200"
            : t.type === "error" ? "bg-white border-rose-200"
            : "bg-white border-blue-200"
          }`}
          style={{ maxWidth: 360 }}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            t.type === "success" ? "bg-emerald-100" : t.type === "error" ? "bg-rose-100" : "bg-blue-100"
          }`}>
            {t.type === "success"
              ? <CheckCircle2 size={16} className="text-emerald-600" />
              : <AlertTriangle size={16} className={t.type === "error" ? "text-rose-600" : "text-blue-600"} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${
              t.type === "success" ? "text-emerald-700" : t.type === "error" ? "text-rose-700" : "text-blue-700"
            }`}>{t.title}</p>
            {t.message && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.message}</p>}
          </div>
          <button type="button" onClick={() => onRemove(t.id)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const show = useCallback((title, message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, duration);
  }, []);

  const remove = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, remove };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AllUsers() {
  const { toasts, show: showToast, remove: removeToast } = useToasts();

  const [usersList,       setUsersList]       = useState([]);
  const [departments,     setDepartments]     = useState([]);
  const [roleDeptMap,     setRoleDeptMap]     = useState({});
  const [isLoading,       setIsLoading]       = useState(true);
  const [statusFilter,    setStatusFilter]    = useState("All");
  const [deptFilter,      setDeptFilter]      = useState("All");

  // Edit state
  const [editUser,   setEditUser]   = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [isSaving,   setIsSaving]   = useState(false);

  // View state
  const [viewUser,    setViewUser]    = useState(null);

  // Delete state
  const [deleteUser,  setDeleteUser]  = useState(null);
  const [isDeleting,  setIsDeleting]  = useState(false);

  // Create state
  const [quickName,   setQuickName]   = useState("");
  const [quickEmail,  setQuickEmail]  = useState("");
  const [quickMobile, setQuickMobile] = useState("");
  const [quickRole,   setQuickRole]   = useState("");
  const [quickDept,   setQuickDept]   = useState("");
  const [isCreating,      setIsCreating]      = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // Bulk preview state
  const [bulkPreview,     setBulkPreview]     = useState(null);  // { valid, invalid, duplicate, totalLimit }
  const [bulkFile,        setBulkFile]        = useState(null);
  const bulkInputRef = useRef(null);

  // ── Fetch users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      // userService.getUsers() returns response.data (axios .data already unwrapped)
      // The API response shape: { status, data: { users: [] } }
      const res = await userService.getUsers();
      // Handle both possible shapes: res.users or res.data.users
      const usersArr = res?.users ?? res?.data?.users ?? [];
      setUsersList(usersArr.map((u) => ({
        id:           u._id,
        name:         u.name,
        email:        u.email,
        mobile:       u.phone || "—",
        role:         u.role,
        department:   u.department?.name || "N/A",
        departmentId: u.department?._id,
        status:       u.isActive ? "Active" : "Inactive",
        isActive:     u.isActive,
        joinedDate:   u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
        avatar:       u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        // extra profile fields for view modal
        address:      u.address || {},
        bankDetails:  u.bankDetails || {},
        profilePic:   u.profilePic || "",
        isProfileComplete: u.isProfileComplete,
        lastLoginAt:  u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never",
      })));
    } catch (err) {
      showToast("Failed to load users", err?.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // ── Fetch meta ─────────────────────────────────────────────────────────────
  const fetchMeta = useCallback(async () => {
    try {
      const [deptRes, mapRes] = await Promise.all([
        userService.getDepartments(),
        userService.getRoleDepartmentMap(),
      ]);
      // getDepartments() -> response.data -> { departments: [] }
      setDepartments(deptRes?.departments ?? deptRes?.data?.departments ?? []);
      // getRoleDepartmentMap() -> response.data -> { roleDepartmentMap: {} }
      setRoleDeptMap(mapRes?.roleDepartmentMap ?? mapRes?.data?.roleDepartmentMap ?? {});
    } catch (err) {
      console.error("Failed to fetch meta:", err);
    }
  }, []);

  useEffect(() => { fetchUsers(); fetchMeta(); }, [fetchUsers, fetchMeta]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalUsers    = usersList.length;
  const activeUsers   = usersList.filter((u) => u.isActive).length;
  const inactiveUsers = usersList.filter((u) => !u.isActive).length;
  const salesTeam     = usersList.filter((u) => u.department?.toUpperCase() === "SALES").length;

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() =>
    usersList.filter((u) => {
      const matchStatus = statusFilter === "All" || u.status === statusFilter;
      const matchDept   = deptFilter   === "All" || u.department === deptFilter;
      return matchStatus && matchDept;
    }),
    [usersList, statusFilter, deptFilter],
  );

  const columns = [
    { key: "email",      label: "Email ID"   },
    { key: "mobile",     label: "Mobile"     },
    { key: "role",       label: "Role"       },
    { key: "department", label: "Department" },
    { key: "status",     label: "Status"     },
    { key: "joinedDate", label: "Joined"     },
  ];

  // ── Roles for edit form ────────────────────────────────────────────────────
  const editRoles = useMemo(() => {
    if (!editUser) return [];
    const deptName = editUser.department;
    return (roleDeptMap[deptName] || []).filter((r) => r !== "ADMIN" && r !== "SUPER_ADMIN");
  }, [editUser, roleDeptMap]);

  // ── Roles for create form ──────────────────────────────────────────────────
  const createRoles = useMemo(() => {
    if (!quickDept) return [];
    const dept = departments.find((d) => d._id === quickDept);
    return (roleDeptMap[dept?.name] || []).filter((r) => r !== "ADMIN" && r !== "SUPER_ADMIN");
  }, [quickDept, roleDeptMap, departments]);

  // ── View handler ───────────────────────────────────────────────────────────
  const openView = (row) => {
    const full = usersList.find((u) => u.id === row.id);
    setViewUser(full || row);
    openModal("view-user-modal");
  };

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const openEdit = (row) => {
    const full = usersList.find((u) => u.id === row.id);
    setEditUser(full || row);
    setEditForm({
      name:     full?.name     || "",
      email:    full?.email    || "",
      mobile:   full?.mobile   || "",
      isActive: full?.isActive ?? true,
    });
    openModal("edit-user-modal");
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await apiClient.put(`/users/${editUser.id}`, {
        name:     editForm.name,
        email:    editForm.email,
        phone:    editForm.mobile,
        isActive: editForm.isActive,
      });
      showToast("User updated", `${editForm.name} has been updated successfully.`, "success");
      closeModal("edit-user-modal");
      fetchUsers();
    } catch (err) {
      showToast("Update failed", err?.response?.data?.message || err?.message || "Could not update user.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete handlers ────────────────────────────────────────────────────────
  const openDelete = (row) => {
    setDeleteUser(usersList.find((u) => u.id === row.id) || row);
    openModal("delete-confirm-modal");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/users/${deleteUser.id}`);
      showToast("User deleted", `${deleteUser.name} has been removed.`, "success");
      closeModal("delete-confirm-modal");
      setDeleteUser(null);
      fetchUsers();
    } catch (err) {
      showToast("Delete failed", err?.message || "Could not delete user.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Create handler ─────────────────────────────────────────────────────────
  const resetCreateForm = () => {
    setQuickName(""); setQuickEmail(""); setQuickMobile(""); setQuickRole(""); setQuickDept("");
  };

  const handleCreateUser = async () => {
    setIsCreating(true);
    try {
      // Build the auto-password: emailPrefix@last5digits
      const emailPrefix = quickEmail.includes("@") ? quickEmail.split("@")[0] : quickEmail;
      const last5       = quickMobile.slice(-5);
      const autoPassword = `${emailPrefix}@${last5}`;

      await userService.createUser({
        name: quickName, email: quickEmail, phone: quickMobile,
        role: quickRole, departmentId: quickDept,
        password: autoPassword,
      });
      showToast("User created", `${quickName} has been added.`, "success");
      closeModal("create-user-quick-modal");
      resetCreateForm();
      fetchUsers();
    } catch (err) {
      showToast("Create failed", err?.message || "Could not create user.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // ── Manager roles that must be unique (only 1 per company) ───────────────
  const MANAGER_ROLES = ["SALES_MANAGER", "MANAGEMENT_MANAGER", "FINANCE_MANAGER"];

  // ── Download sample CSV ────────────────────────────────────────────────────
  const handleDownloadSample = () => {
    const header  = "Name,Email,Phone,Department,Role";
    const example = "Rahul Sharma,rahul@company.com,9876543210,Sales,SALES_EXECUTIVE";
    const csv = `${header}\n${example}\n`;
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "sample_users_import.csv";
    a.click();
  };

  // ── Parse CSV text into array of row objects ───────────────────────────────
  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    // Normalise header keys
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      return headers.reduce((obj, h, i) => { obj[h] = vals[i] ?? ""; return obj; }, {});
    });
  };

  // ── Validate a single CSV row against all rules ────────────────────────────
  const validateRow = (row, existingEmails, seenEmailsInFile, existingManagers) => {
    const warnings = [];
    const name  = row["name"]  || "";
    const email = row["email"] || "";
    const phone = row["phone"] || "";
    const dept  = row["department"] || "";
    const role  = (row["role"] || "").toUpperCase().replace(/ /g, "_");

    if (!name.trim()) warnings.push("Name is required");
    if (!/^\S+@\S+\.\S+$/.test(email)) warnings.push("Invalid email address");
    if (!/^\d{10}$/.test(phone)) warnings.push("Phone must be exactly 10 digits");
    if (!dept.trim()) warnings.push("Department is required");
    if (!role.trim()) warnings.push("Role is required");

    // Duplicate email in existing users
    if (existingEmails.has(email.toLowerCase())) warnings.push("Email already exists (duplicate)");
    // Duplicate email within this file
    if (seenEmailsInFile.has(email.toLowerCase())) warnings.push("Duplicate email within file");

    // Manager uniqueness rule
    if (MANAGER_ROLES.includes(role)) {
      const alreadyHasManager = existingManagers.has(role);
      const fileHasManager    = seenEmailsInFile.size > 0 &&
        // We track manager roles found so far in the file via a separate set passed in
        existingManagers.has(`__file__${role}`);
      if (alreadyHasManager) warnings.push(`A ${role.replace(/_/g, " ")} already exists — only 1 allowed`);
      if (fileHasManager)    warnings.push(`Duplicate ${role.replace(/_/g, " ")} in file — only 1 allowed`);
    }

    return { name, email, phone, dept, role, warnings };
  };

  // ── Open file picker → parse → show preview modal ─────────────────────────
  const handleBulkUploadClick = () => {
    if (bulkInputRef.current) bulkInputRef.current.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const rows = parseCSV(text);

      // Build sets for fast lookup
      const existingEmails   = new Set(usersList.map((u) => u.email.toLowerCase()));
      const existingManagers = new Set(
        usersList.filter((u) => MANAGER_ROLES.includes(u.role)).map((u) => u.role)
      );

      const MAX_USERS = 40;
      const currentCount = usersList.length;
      const remainingSlots = Math.max(0, MAX_USERS - currentCount);

      const seenEmailsInFile = new Set();
      const seenManagersInFile = new Set();

      const validRows   = [];
      const invalidRows = [];

      rows.forEach((row, idx) => {
        const email = (row["email"] || "").toLowerCase();
        const role  = (row["role"]  || "").toUpperCase().replace(/ /g, "_");

        // Inject file-level manager tracking into existingManagers temporarily
        const checkManagers = new Set([...existingManagers]);
        seenManagersInFile.forEach((mr) => checkManagers.add(`__file__${mr}`));

        const result = validateRow(row, existingEmails, seenEmailsInFile, checkManagers);
        result.rowIndex = idx + 2; // 1-based + header row

        if (result.warnings.length === 0) {
          // Check total user cap
          if (validRows.length >= remainingSlots) {
            result.warnings.push(`User limit reached (max ${MAX_USERS} total users)`);
            invalidRows.push(result);
          } else {
            validRows.push(result);
            seenEmailsInFile.add(email);
            if (MANAGER_ROLES.includes(role)) seenManagersInFile.add(role);
          }
        } else {
          invalidRows.push(result);
          seenEmailsInFile.add(email); // still track to catch downstream dupes
        }
      });

      setBulkPreview({
        validRows,
        invalidRows,
        totalInFile: rows.length,
        remainingSlots,
        currentCount,
      });
      openModal("bulk-preview-modal");
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  // ── Commit the valid rows ──────────────────────────────────────────────────
  const handleCommitBulk = async () => {
    if (!bulkPreview?.validRows?.length) return;
    setIsBulkUploading(true);

    let imported = 0;
    const failed = [];

    for (const row of bulkPreview.validRows) {
      try {
        // Find department id by name
        const dept = departments.find(
          (d) => d.name?.toLowerCase() === row.dept?.toLowerCase() ||
                 d.displayName?.toLowerCase() === row.dept?.toLowerCase()
        );

        const emailPrefix  = row.email.includes("@") ? row.email.split("@")[0] : row.email;
        const last5        = row.phone.slice(-5);
        const autoPassword = `${emailPrefix}@${last5}`;

        await userService.createUser({
          name:         row.name,
          email:        row.email,
          phone:        row.phone,
          role:         row.role,
          departmentId: dept?._id ?? "",
          password:     autoPassword,
        });
        imported++;
      } catch (err) {
        failed.push(row.email);
      }
    }

    setIsBulkUploading(false);
    closeModal("bulk-preview-modal");
    setBulkPreview(null);
    setBulkFile(null);
    fetchUsers();

    if (failed.length === 0) {
      showToast("Import done", `${imported} user${imported !== 1 ? "s" : ""} imported successfully.`, "success");
    } else {
      showToast(
        `${imported} imported, ${failed.length} failed`,
        `Failed: ${failed.slice(0, 3).join(", ")}${failed.length > 3 ? "…" : ""}`,
        "info",
      );
    }
  };

  // ── Custom CSV Export ─────────────────────────────────────────────────────
  const handleExportUsers = () => {
    if (!usersList.length) return;

    const headers = [
      "Name", "Email", "Mobile", "Role", "Department",
      "Status", "Joined Date", "Last Login", "Profile Complete",
      // Bank details
      "Beneficiary Name", "Bank Name", "Branch", "Account Number", "IFSC Code", "UPI ID",
    ];

    const escape = (val) => {
      const str = val == null ? "-" : String(val).trim() === "" ? "-" : String(val);
      return str.includes(",") || str.includes("\n") || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const rows = usersList.map((u) => {
      const bd = u.bankDetails || {};
      return [
        u.name,
        u.email,
        u.mobile,
        u.role,
        u.department,
        u.status,
        u.joinedDate,
        u.lastLoginAt,
        u.isProfileComplete ? "Yes" : "No",
        // Bank details — "-" if not filled
        bd.beneficiaryName || "-",
        bd.bankName        || "-",
        bd.branch          || "-",
        bd.accountNumber   || "-",
        bd.ifscCode        || "-",
        bd.upiId           || "-",
      ].map(escape);
    });

    const csvLines = [headers.map(escape).join(","), ...rows.map((r) => r.join(","))];
    const blob = new Blob(["\uFEFF" + csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "User_Records.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const actions = [
    {
      icon: <Eye size={15} />,
      tooltip: "View Details",
      variant: "ghost",
      onClick: openView,
    },
    {
      icon: <Pencil size={15} />,
      tooltip: "Edit User",
      variant: "primary",
      onClick: openEdit,
    },
    {
      icon: <Trash2 size={15} />,
      tooltip: "Terminate / Delete User",
      variant: "danger",
      onClick: openDelete,
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">All Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage and monitor all system users</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hidden file input */}
          <input
            ref={bulkInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelected}
          />
          <button onClick={handleDownloadSample}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95">
            <Download size={14} /> Sample CSV
          </button>
          <button onClick={handleExportUsers} disabled={!usersList.length}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50">
            <Download size={14} /> Export Users
          </button>
          <button onClick={handleBulkUploadClick} disabled={isBulkUploading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95 disabled:opacity-60">
            <Upload size={14} /> {isBulkUploading ? "Importing…" : "Bulk Import"}
          </button>
          <button onClick={() => openModal("create-user-quick-modal")}
            className="flex items-center gap-2 rounded-xl bg-[#2a465a] px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-[#1e3a52] transition active:scale-95">
            <UserPlus size={14} /> + Create User
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Total Users"    value={String(totalUsers)}    icon={<Users size={22}/>}     accentColor="#38bdf8" size={3} />
        <EnhancedDashCard title="Active Users"   value={String(activeUsers)}   icon={<UserCheck size={22}/>} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Inactive Users" value={String(inactiveUsers)} icon={<UserX size={22}/>}     accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Sales Team"     value={String(salesTeam)}     icon={<Target size={22}/>}    accentColor="#7AAACE" size={3} />
      </DashGrid>

      {/* Login info banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2a465a]/20 bg-gradient-to-r from-[#2a465a] to-[#1a3347] px-5 py-4 shadow-md">
        {/* Decorative background circles */}
        <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -right-2 top-6 w-12 h-12 rounded-full bg-white/5" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m0 0a2 2 0 01-2 2m2-2H7m8 0V7m0 4v2M9 11H7m2 0v2m0-2V9m6 8l-3-3m0 0l-3 3m3-3V4" />
            </svg>
          </div>

          {/* Text block */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm mb-1">Department User Login Info</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                Login via
                <a
                  href="/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-bold underline underline-offset-2 hover:text-sky-300 transition-colors"
                >
                  Department Login
                </a>
              </span>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                Default password:
                <code className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white font-mono text-[11px] tracking-wide">
                  emailprefix@last5digits
                </code>
              </span>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                Example:
                <code className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white font-mono text-[11px]">
                  user@12345
                </code>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        title="User Records"
        exportable={false}
        columns={columns}
        rows={usersList}
        actions={actions}
        pageSize={10}
        searchable
        size={12}
        loading={isLoading}
        filters={[
          {
            title: "Status",
            type: "toggle",
            key: "status",
            options: ["Active", "Inactive"],
          },
          {
            title: "Department",
            type: "toggle",
            key: "department",
            options: departments.map((d) => d.name),
          },
        ]}
      />

      {/* ── View User Modal ── */}
      <Modal id="view-user-modal" title="User Details">
        {viewUser && (
          <div className="space-y-5">
            {/* Avatar + name header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#2a465a]/5 to-[#2a465a]/10 rounded-2xl border border-[#2a465a]/10">
              <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                {viewUser.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-[#2a465a] text-base">{viewUser.name}</p>
                <p className="text-sm text-slate-500">{viewUser.email}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    viewUser.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${viewUser.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {viewUser.status}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700">
                    {viewUser.role?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserIcon size={14} className="text-[#2a465a]" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Basic Information</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mobile</p>
                  <p className="text-sm font-semibold text-[#2a465a]">{viewUser.mobile}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                  <p className="text-sm font-semibold text-[#2a465a]">{viewUser.department}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                  <p className="text-sm font-semibold text-[#2a465a]">{viewUser.joinedDate}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Login</p>
                  <p className="text-sm font-semibold text-[#2a465a]">{viewUser.lastLoginAt}</p>
                </div>
                <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Profile Complete</p>
                  <p className={`text-sm font-semibold ${viewUser.isProfileComplete ? "text-emerald-600" : "text-amber-600"}`}>
                    {viewUser.isProfileComplete ? "✓ Profile is complete" : "⚠ Profile not yet completed"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Landmark size={14} className="text-[#2a465a]" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Bank Details</p>
              </div>
              {viewUser.bankDetails && Object.values(viewUser.bankDetails).some(Boolean) ? (
                <div className="grid grid-cols-2 gap-3">
                  {viewUser.bankDetails.beneficiaryName && (
                    <div className="col-span-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Beneficiary Name</p>
                      <p className="text-sm font-semibold text-[#2a465a]">{viewUser.bankDetails.beneficiaryName}</p>
                    </div>
                  )}
                  {viewUser.bankDetails.bankName && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                      <p className="text-sm font-semibold text-[#2a465a]">{viewUser.bankDetails.bankName}</p>
                    </div>
                  )}
                  {viewUser.bankDetails.branch && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Branch</p>
                      <p className="text-sm font-semibold text-[#2a465a]">{viewUser.bankDetails.branch}</p>
                    </div>
                  )}
                  {viewUser.bankDetails.accountNumber && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                      <p className="text-sm font-semibold text-[#2a465a] font-mono tracking-wider">
                        {viewUser.bankDetails.accountNumber}
                      </p>
                    </div>
                  )}
                  {viewUser.bankDetails.ifscCode && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">IFSC Code</p>
                      <p className="text-sm font-semibold text-[#2a465a] font-mono">{viewUser.bankDetails.ifscCode}</p>
                    </div>
                  )}
                  {viewUser.bankDetails.upiId && (
                    <div className="col-span-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">UPI ID</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#2a465a]">{viewUser.bankDetails.upiId}</p>
                        {/^[\w.\-+]+@[\w]+$/.test(viewUser.bankDetails.upiId) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            <BadgeCheck size={11} /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            <AlertTriangle size={11} /> Invalid format
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center gap-2">
                  <CreditCard size={24} className="text-slate-300" />
                  <p className="text-sm font-semibold text-slate-400">No bank details added yet</p>
                  <p className="text-xs text-slate-400">The user hasn't completed their bank details setup.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => closeModal("view-user-modal")}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal id="edit-user-modal" title="Edit User">
        <div className="space-y-4">
          {editUser && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#2a465a]/10 flex items-center justify-center text-[#2a465a] font-black text-sm">
                {editUser.avatar}
              </div>
              <div>
                <p className="font-bold text-[#2a465a] text-sm">{editUser.name}</p>
                <p className="text-xs text-slate-500">{editUser.email}</p>
              </div>
            </div>
          )}
          <Grid cols={12} gap={4}>
            <DataField label="Full Name" id="edit-name" size={6}
              value={editForm.name || ""}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
            <DataField label="Email" id="edit-email" type="email" size={6}
              value={editForm.email || ""}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
            <DataField label="Mobile" id="edit-mobile" type="tel" size={6}
              value={editForm.mobile || ""}
              onChange={(e) => setEditForm((f) => ({ ...f, mobile: e.target.value }))} />
            <SelectField label="Status" id="edit-status" size={6}
              value={editForm.isActive ? "Active" : "Inactive"} searchable={false}
              onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.value === "Active" }))}>
              <Option value="Active"   label="Active"   />
              <Option value="Inactive" label="Inactive" />
            </SelectField>
            <div className="col-span-12 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none">Role</label>
              <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-100 text-sm font-medium text-slate-500 cursor-not-allowed">
                <span className="flex-1">{editUser?.role?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) || "—"}</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Read-only</span>
              </div>
            </div>
          </Grid>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button onClick={() => closeModal("edit-user-modal")}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">
              Cancel
            </button>
            <button onClick={handleSaveEdit} disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] shadow-lg hover:bg-[#1e3a52] transition active:scale-95 disabled:opacity-60">
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal id="delete-confirm-modal" title="Delete User">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle size={20} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-700">This action cannot be undone</p>
              <p className="text-sm text-rose-600 mt-1">
                You are about to delete <strong>{deleteUser?.name}</strong> ({deleteUser?.email}).
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => closeModal("delete-confirm-modal")}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 shadow-lg hover:bg-rose-600 transition active:scale-95 disabled:opacity-60">
              {isDeleting ? "Deleting…" : "Delete User"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Bulk Import Preview Modal ── */}
      <Modal id="bulk-preview-modal" title="Bulk Import Preview">
        {bulkPreview && (
          <div className="space-y-4">
            {/* Summary chips */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CheckCircle2 size={13}/> {bulkPreview.validRows.length} Valid
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <AlertTriangle size={13}/> {bulkPreview.invalidRows.length} Invalid
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
                Total in file: {bulkPreview.totalInFile}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                Slots remaining: {bulkPreview.remainingSlots} / 40
              </span>
            </div>

            {/* Limit warning */}
            {bulkPreview.currentCount >= 40 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5"/>
                <p className="text-xs font-semibold text-amber-700">
                  User limit reached (40/40). No new users can be imported.
                </p>
              </div>
            )}

            {/* Valid rows */}
            {bulkPreview.validRows.length > 0 && (
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  ✅ Valid rows — will be imported
                </p>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {bulkPreview.validRows.map((r) => (
                    <div key={r.rowIndex} className="flex items-center gap-3 px-3 py-2.5">
                      <span className="text-[10px] text-slate-400 font-bold w-6 shrink-0">#{r.rowIndex}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#2a465a] truncate">{r.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{r.email} · {r.phone}</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold shrink-0">{r.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invalid rows */}
            {bulkPreview.invalidRows.length > 0 && (
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  ❌ Invalid rows — will be skipped
                </p>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-rose-200 divide-y divide-rose-100">
                  {bulkPreview.invalidRows.map((r) => (
                    <div key={r.rowIndex} className="px-3 py-2.5 bg-rose-50/40">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-slate-400 font-bold w-6 shrink-0">#{r.rowIndex}</span>
                        <p className="text-xs font-semibold text-slate-700 truncate">{r.email || "—"}</p>
                      </div>
                      <div className="ml-8 flex flex-wrap gap-1">
                        {r.warnings.map((w, wi) => (
                          <span key={wi} className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => { closeModal("bulk-preview-modal"); setBulkPreview(null); setBulkFile(null); }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                disabled={isBulkUploading}>
                Cancel
              </button>
              <button
                onClick={handleCommitBulk}
                disabled={isBulkUploading || bulkPreview.validRows.length === 0}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] shadow-lg hover:bg-[#1e3a52] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {isBulkUploading
                  ? "Importing…"
                  : `Import ${bulkPreview.validRows.length} User${bulkPreview.validRows.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Create User Modal ── */}
      <Modal id="create-user-quick-modal" title="Create New User" onClose={resetCreateForm}>
        <div className="space-y-5">
          <Grid cols={12} gap={4}>
            <DataField label="Full Name" id="c-name" size={12}
              placeholder="e.g. Rahul Sharma" value={quickName}
              onChange={(e) => setQuickName(e.target.value)} />
            <DataField label="Email" id="c-email" type="email" size={6}
              placeholder="user@company.com" value={quickEmail}
              onChange={(e) => setQuickEmail(e.target.value)} />
            <DataField label="Mobile" id="c-mobile" type="number" size={6}
              placeholder="9876543210" value={quickMobile} min={10} max={10}
              onChange={(e) => setQuickMobile(e.target.value)} />
            <DataField label="Auto Password" id="c-pass" size={12} readOnly
              value={
                quickEmail.includes("@") && quickMobile.length >= 5
                  ? `${quickEmail.split("@")[0]}@${quickMobile.slice(-5)}`
                  : "Fill email & mobile"
              } />
            <SelectField label="Department" id="c-dept" size={6}
              placeholder="Select department" value={quickDept}
              onChange={(e) => { setQuickDept(e.target.value); setQuickRole(""); }}>
              {departments.map((d) => <Option key={d._id} value={d._id} label={d.displayName || d.name} />)}
            </SelectField>
            <SelectField label="Role" id="c-role" size={6}
              placeholder={quickDept ? "Select role" : "Select dept first"}
              value={quickRole}
              onChange={(e) => setQuickRole(e.target.value)}
              disabled={!quickDept} searchable={false}>
              {createRoles.map((r) => (
                <Option key={r} value={r}
                  label={r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())} />
              ))}
            </SelectField>
          </Grid>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => { closeModal("create-user-quick-modal"); resetCreateForm(); }}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
              disabled={isCreating}>
              Cancel
            </button>
            <button onClick={handleCreateUser} disabled={isCreating}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] shadow-lg hover:bg-[#1e3a52] transition active:scale-95 disabled:opacity-60">
              {isCreating ? "Creating…" : "Create User"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
