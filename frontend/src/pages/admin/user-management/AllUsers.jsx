/**
 * AllUsers.jsx — Admin User Management
 * Features: list users, edit (name/phone/role/status), soft-delete,
 *           right-side toast notifications (auto-dismiss 4s)
 */

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Users, UserCheck, UserX, Target, Download, Upload, UserPlus,
  CheckCircle2, AlertTriangle, X,
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

  // Delete state
  const [deleteUser,  setDeleteUser]  = useState(null);
  const [isDeleting,  setIsDeleting]  = useState(false);

  // Create state
  const [quickName,   setQuickName]   = useState("");
  const [quickEmail,  setQuickEmail]  = useState("");
  const [quickMobile, setQuickMobile] = useState("");
  const [quickRole,   setQuickRole]   = useState("");
  const [quickDept,   setQuickDept]   = useState("");
  const [isCreating,  setIsCreating]  = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

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

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const openEdit = (row) => {
    const full = usersList.find((u) => u.id === row.id);
    setEditUser(full || row);
    setEditForm({
      name:     full?.name     || "",
      mobile:   full?.mobile   || "",
      role:     full?.role     || "",
      isActive: full?.isActive ?? true,
    });
    openModal("edit-user-modal");
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await apiClient.put(`/users/${editUser.id}`, {
        name:     editForm.name,
        phone:    editForm.mobile,
        role:     editForm.role,
        isActive: editForm.isActive,
      });
      showToast("User updated", `${editForm.name} has been updated successfully.`, "success");
      closeModal("edit-user-modal");
      fetchUsers();
    } catch (err) {
      showToast("Update failed", err?.message || "Could not update user.", "error");
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
      await userService.createUser({
        name: quickName, email: quickEmail, phone: quickMobile,
        role: quickRole, departmentId: quickDept,
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

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const csv = "Name,Email,Role,Department,Status\n" +
      usersList.map((u) => `${u.name},${u.email},${u.role},${u.department},${u.status}`).join("\n");
    const a = document.createElement("a");
    a.href = encodeURI("data:text/csv;charset=utf-8," + csv);
    a.download = "users_export.csv";
    a.click();
  };

  // ── Bulk upload ────────────────────────────────────────────────────────────
  const handleBulkUpload = () => {
    if (isBulkUploading) return;
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".csv,.xlsx";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsBulkUploading(true);
      try {
        const pre = await userService.uploadBulkUsers(file, { skipDuplicates: true });
        const preData = pre?.data ?? pre;
        if (!preData?.summary?.validRows) {
          showToast("No valid rows", "Check your CSV format.", "error");
          return;
        }
        const res = await userService.commitBulkUsers(preData.uploadId, "VALID_ONLY");
        const resData = res?.data ?? res;
        showToast("Bulk upload done", `${resData?.importedCount || 0} users imported.`, "success");
        fetchUsers();
      } catch (err) {
        showToast("Bulk upload failed", err?.message, "error");
      } finally {
        setIsBulkUploading(false);
      }
    };
    input.click();
  };

  const actions = [
    { label: "Edit",   variant: "primary", onClick: openEdit   },
    { label: "Delete", variant: "danger",  onClick: openDelete },
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
          <button onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={handleBulkUpload} disabled={isBulkUploading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95 disabled:opacity-60">
            <Upload size={14} /> {isBulkUploading ? "Uploading…" : "Bulk Upload"}
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

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {["All","Active","Inactive"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  statusFilter === s ? "bg-[#2a465a] text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}>{s}</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Dept:</span>
            <button onClick={() => setDeptFilter("All")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                deptFilter === "All" ? "bg-[#2a465a] text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}>All</button>
            {departments.map((d) => (
              <button key={d._id} onClick={() => setDeptFilter(d.name)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  deptFilter === d.name ? "bg-[#2a465a] text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}>{d.name.charAt(0) + d.name.slice(1).toLowerCase()}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        title="User Records"
        columns={columns}
        rows={filteredUsers}
        actions={actions}
        pageSize={5}
        searchable
        size={12}
        loading={isLoading}
      />

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
            <DataField label="Full Name" id="edit-name" size={12}
              value={editForm.name || ""}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
            <DataField label="Mobile" id="edit-mobile" type="tel" size={12}
              value={editForm.mobile || ""}
              onChange={(e) => setEditForm((f) => ({ ...f, mobile: e.target.value }))} />
            <SelectField label="Role" id="edit-role" size={6} value={editForm.role || ""} searchable={false}
              onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}>
              {editRoles.map((r) => (
                <Option key={r} value={r}
                  label={r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())} />
              ))}
            </SelectField>
            <SelectField label="Status" id="edit-status" size={6}
              value={editForm.isActive ? "Active" : "Inactive"} searchable={false}
              onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.value === "Active" }))}>
              <Option value="Active"   label="Active"   />
              <Option value="Inactive" label="Inactive" />
            </SelectField>
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
            <DataField label="Mobile" id="c-mobile" type="tel" size={6}
              placeholder="9876543210" value={quickMobile}
              onChange={(e) => setQuickMobile(e.target.value)} />
            <DataField label="Auto Password" id="c-pass" size={12} readOnly
              value={quickMobile.length >= 5
                ? `${quickEmail.split("@")[0]}@${quickMobile.slice(-5)}`
                : "Fill email & mobile"} />
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
