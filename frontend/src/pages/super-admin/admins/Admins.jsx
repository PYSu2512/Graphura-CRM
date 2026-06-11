import { useState, useEffect } from "react";
import apiClient from "../../../services/apiClient";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Heading,
  EnhancedDashCard,
  DataTable,
  Modal,
  ModalData,
  ModalProfile,
  ModalGrid,
  Button,
  DataField,
  SelectField,
  Option,
  ToggleButton,
  DashGrid,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components";
import {
  Users,
  CheckCircle2,
  XCircle,
  Building2,
  Eye,
  Pencil,
  Power,
  Plus,
} from "lucide-react";

// ── Helper: progress bar color by percentage ──
const limitColor = (pct) =>
  pct > 90 ? "#f43f5e" : pct > 70 ? "#f59e0b" : "#22c55e";

// ── Inline progress bar component ──
const LimitBar = ({ used, max, label }) => {
  const pct = Math.min((used / max) * 100, 100);
  const color = limitColor(pct);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#2a465a]">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs text-slate-400 font-medium">
        {used.toLocaleString()} / {max.toLocaleString()}
      </span>
    </div>
  );
};

// ── Initial mock admin data removed, fetching from API ──

const adminCols = [
  { key: "adminName", label: "Admin Name" },
  { key: "company", label: "Company" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
  { key: "plan", label: "Plan" },
];

function AdminsSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-6 max-w-[1600px] mx-auto">
      {/* Heading Skeleton */}
      <div className="h-9 w-64 bg-slate-200 rounded-2xl mb-8" />

      {/* KPI Cards Skeletons */}
      <div className="grid grid-cols-12 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-span-12 md:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 flex justify-between items-center h-28">
            <div className="space-y-3">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-7 w-16 bg-slate-200 rounded" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4 w-full bg-[#efefefb1] rounded-xl p-3">
        <div className="flex justify-between items-center gap-3">
          <div className="h-10 w-48 bg-slate-200 rounded-2xl" />
          <div className="h-10 w-32 bg-slate-200 rounded-2xl" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-12 bg-slate-100 flex items-center px-6 gap-4 border-b border-slate-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 rounded flex-1" />
            ))}
          </div>
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className="h-16 flex items-center px-6 gap-4">
                {[...Array(6)].map((_, colIndex) => (
                  <div key={colIndex} className="h-3 bg-slate-200/70 rounded flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admins() {
  // ── Live admin data (stateful) ──
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ── Selected row states ──
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // ── Edit form state ──
  const [editForm, setEditForm] = useState({
    adminName: "",
    company: "",
    email: "",
    phone: "",
    plan: "",
    userMax: "",
    dataMax: "",
    status: "",
    renewal: "",
  });
  const handleEditField = (field) => (e) =>
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Deactivate reason state ──
  const [deactivateReason, setDeactivateReason] = useState("");

  // ── Create form state ──
  const [createForm, setCreateForm] = useState({
    adminName: "",
    company: "",
    email: "",
    phone: "",
    password: "",
    plan: "Starter",
    userMax: "40",
    dataMax: "5000",
    renewal: "",
  });
  const handleCreateField = (field) => (e) =>
    setCreateForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Open edit modal pre-filled ──
  const openEditModal = (row) => {
    setSelectedAdmin(row);
    setEditForm({
      adminName: row.adminName,
      company: row.company,
      email: row.email,
      phone: row.phone,
      plan: row.plan,
      userMax: String(row.userMax),
      dataMax: String(row.dataMax),
      status: row.status,
      renewal: row.renewal,
    });
    openModal("admin-edit");
  };

  // ── Fetch Data ──
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/superadmin/admins");
      const mappedAdmins = res.data.data.admins.map((admin) => ({
        id: admin._id,
        adminName: admin.name,
        company: admin.company?.name || "-",
        email: admin.email,
        phone: admin.phone,
        status: admin.isActive ? "Active" : "Inactive",
        plan: admin.planStatus || "TRIAL",
        userUsed: 0, // Mocked for now, need user count endpoint
        userMax: admin.userLimit,
        dataUsed: 0, // Mocked for now
        dataMax: admin.clientLimit,
        createdDate: new Date(admin.createdAt).toISOString().split("T")[0],
        date: new Date(admin.createdAt).toISOString().split("T")[0],
        renewal: "—", // Mocked, would come from planExpiresAt
      }));
      setAdmins(mappedAdmins);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ── Action handlers ──
  const handleToggleStatus = async () => {
    if (!selectedAdmin) return;
    if (selectedAdmin.status === "Active" && !deactivateReason.trim()) return;

    const newStatus = selectedAdmin.status === "Active" ? false : true;

    try {
      await apiClient.patch(`/superadmin/admins/${selectedAdmin.id}/status`, {
        isActive: newStatus,
      });
      await fetchAdmins();
      setSelectedAdmin((prev) => ({
        ...prev,
        status: newStatus ? "Active" : "Inactive",
      }));
      setDeactivateReason("");
      closeModal("admin-toggle");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to toggle status");
    }
  };

  const handleSaveEdit = () => {
    if (!selectedAdmin) return;
    setAdmins((prev) =>
      prev.map((a) =>
        a.id === selectedAdmin.id
          ? {
              ...a,
              adminName: editForm.adminName,
              company: editForm.company,
              email: editForm.email,
              phone: editForm.phone,
              plan: editForm.plan,
              userMax: Number(editForm.userMax),
              dataMax: Number(editForm.dataMax),
              status: editForm.status,
              renewal: editForm.renewal,
            }
          : a,
      ),
    );
    closeModal("admin-edit");
  };

  const handleCreateAdmin = async () => {
    try {
      const payload = {
        name: createForm.adminName,
        email: createForm.email,
        phone: createForm.phone,
        password: createForm.password || "Graphura@123", // Fallback password
        companyName: createForm.company,
        userLimit: Number(createForm.userMax) || 40,
        clientLimit: Number(createForm.dataMax) || 5000,
      };

      await apiClient.post("/superadmin/admins", payload);
      await fetchAdmins();
      closeModal("admin-create");
      setCreateForm({
        adminName: "",
        company: "",
        email: "",
        phone: "",
        password: "",
        plan: "Starter",
        userMax: "40",
        dataMax: "5000",
        renewal: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create admin");
    }
  };

  if (loading) return <AdminsSkeleton />;

  // ── KPI calculations ──
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter((r) => r.status === "Active").length;
  const inactiveAdmins = totalAdmins - activeAdmins;
  const totalUsers = admins.reduce((sum, r) => sum + r.userUsed, 0);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* ── 1. Page Header ── */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Admin"
          secondaryText="Management"
          size={12}
          fontSize="3xl"
          showAnimations={true}
        />
      </Grid>
      {/* ── 2. KPI Summary Cards ── */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard
          title="Total Admins"
          value={String(totalAdmins)}
          icon={<Users size={22} />}
          accentColor="#3b82f6"
          size={3}
        />
        <EnhancedDashCard
          title="Active Admins"
          value={String(activeAdmins)}
          icon={<CheckCircle2 size={22} />}
          accentColor="#22c55e"
          size={3}
        />
        <EnhancedDashCard
          title="Inactive Admins"
          value={String(inactiveAdmins)}
          icon={<XCircle size={22} />}
          accentColor="#f43f5e"
          size={3}
        />
        <EnhancedDashCard
          title="Total User Accounts"
          value={totalUsers.toLocaleString()}
          icon={<Building2 size={22} />}
          accentColor="#8b5cf6"
          size={3}
        />
      </DashGrid>

      {/* ── 3. Admin Table ── */}
      <Grid cols={12} gap={4}>
        <div className="col-span-12 flex bg-[#efefefb1] rounded-xl p-3 flex-col gap-3">
          {/* Table header: title + create button */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              <span className="text-[#2a465a]">All Admins</span>
              <span className="text-slate-400 font-extrabold"> Data table</span>
            </h2>
            <button
              onClick={() => {
                setCreateForm({
                  adminName: "",
                  company: "",
                  email: "",
                  phone: "",
                  password: "",
                  plan: "Starter",
                  userMax: "40",
                  dataMax: "5000",
                  renewal: "",
                });
                openModal("admin-create");
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm shadow-lg bg-[#2a465a] hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shiny-sweep"
            >
              <Plus size={16} />
              Create Admin
            </button>
          </div>

          {error ? (
            <div className="flex justify-center items-center py-12 text-rose-500 font-medium">
              {error}
            </div>
          ) : (
            <DataTable
              columns={adminCols}
              rows={admins}
              size={12}
              pageSize={5}
              date={true}
              filterSize="xl"
              filters={[
                {
                  title: "Status",
                  type: "toggle",
                  key: "status",
                  options: ["Active", "Inactive"],
                },
                {
                  title: "Plan",
                  type: "toggle",
                  key: "plan",
                  options: ["Starter", "Pro", "Enterprise"],
                },
              ]}
              actions={[
                {
                  icon: <Eye size={15} />,
                  tooltip: "View",
                  variant: "ghost",
                  onClick: (row) => {
                    navigate(`/super-admin/departments?id=${row.id || row._id}`, {
                      state: { admin: row },
                    });
                  },
                },
                {
                  icon: <Pencil size={15} />,
                  tooltip: "Edit",
                  variant: "primary",
                  onClick: (row) => openEditModal(row),
                },
                {
                  icon: <Power size={15} />,
                  tooltip: "Toggle Status",
                  variant: "ghost",
                  onClick: (row) => {
                    setSelectedAdmin(row);
                    setDeactivateReason("");
                    openModal("admin-toggle");
                  },
                },
              ]}
            />
          )}
        </div>
      </Grid>

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* ── View Admin Detail ── */}
      <Modal id="admin-view" title="Admin Details" size="lg">
        {selectedAdmin && (
          <div className="flex flex-col gap-5">
            <ModalProfile
              name={selectedAdmin.adminName}
              subtitle={`${selectedAdmin.company} · ${selectedAdmin.plan}`}
              meta={`Joined ${selectedAdmin.createdDate}`}
              avatarColor={
                selectedAdmin.status === "Active" ? "#22c55e" : "#94a3b8"
              }
            />

            {/* Quick Actions */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-auto">
                Quick Actions
              </span>
              <Button
                text="Edit"
                variant="secondary"
                size={2}
                onClick={() => {
                  closeModal("admin-view");
                  openEditModal(selectedAdmin);
                }}
              />
              <ToggleButton
                checked={selectedAdmin.status === "Active"}
                onChange={() => {
                  closeModal("admin-view");
                  openModal("admin-toggle");
                }}
                label="Active"
                labelOff="Inactive"
                size="sm"
              />
            </div>

            {/* Contact */}
            <ModalGrid title="Contact" cols={2}>
              <ModalData label="Email" value={selectedAdmin.email} />
              <ModalData label="Phone" value={selectedAdmin.phone} />
            </ModalGrid>

            {/* Usage Limits */}
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#2a465a]/5 border-b border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3e8ca7] flex-shrink-0" />
                <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
                  Usage Limits
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-100">
                <div className="bg-white p-4">
                  <LimitBar
                    used={selectedAdmin.userUsed}
                    max={selectedAdmin.userMax}
                    label="User Limit"
                  />
                </div>
                <div className="bg-white p-4">
                  <LimitBar
                    used={selectedAdmin.dataUsed}
                    max={selectedAdmin.dataMax}
                    label="Data / Lead Limit"
                  />
                </div>
              </div>
            </div>

            {/* Subscription */}
            <ModalGrid title="Subscription" cols={2}>
              <ModalData label="Plan" value={selectedAdmin.plan} />
              <ModalData label="Status" value={selectedAdmin.status} />
              <ModalData
                label="Created Date"
                value={selectedAdmin.createdDate}
              />
              <ModalData label="Renewal Date" value={selectedAdmin.renewal} />
            </ModalGrid>

            {/* Danger Zone */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest mr-auto">
                Danger Zone
              </span>
              <Button
                text="Reset Password"
                variant="ghost"
                size={3}
                onClick={() => {
                  closeModal("admin-view");
                  openModal("admin-reset");
                }}
              />
              <Button
                text="Delete Admin"
                variant="danger"
                size={3}
                onClick={() => {
                  closeModal("admin-view");
                  openModal("admin-delete");
                }}
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                text="Close"
                variant="ghost"
                size={2}
                onClick={() => closeModal("admin-view")}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Admin ── */}
      <Modal id="admin-edit" title="Edit Admin" size="lg">
        {selectedAdmin && (
          <div className="flex flex-col gap-5">
            <Grid cols={12} gap={3}>
              <DataField
                label="Admin Name"
                id="edit-adminName"
                size={6}
                value={editForm.adminName}
                onChange={handleEditField("adminName")}
                placeholder="e.g. Arjun Mehta"
              />
              <DataField
                label="Company Name"
                id="edit-company"
                size={6}
                value={editForm.company}
                onChange={handleEditField("company")}
                placeholder="e.g. Nexus Corp"
              />
              <DataField
                label="Email"
                id="edit-email"
                type="email"
                size={6}
                value={editForm.email}
                onChange={handleEditField("email")}
                placeholder="e.g. arjun@nexus.com"
              />
              <DataField
                label="Phone"
                id="edit-phone"
                type="tel"
                size={6}
                value={editForm.phone}
                onChange={handleEditField("phone")}
                placeholder="+91 98101 10001"
              />
              <SelectField
                label="Plan"
                id="edit-plan"
                size={4}
                value={editForm.plan}
                onChange={handleEditField("plan")}
              >
                <Option value="Starter" label="Starter" />
                <Option value="Pro" label="Pro" />
                <Option value="Enterprise" label="Enterprise" />
              </SelectField>
              <DataField
                label="User Limit"
                id="edit-userMax"
                type="number"
                size={4}
                value={editForm.userMax}
                onChange={handleEditField("userMax")}
                placeholder="e.g. 200"
              />
              <DataField
                label="Data Limit"
                id="edit-dataMax"
                type="number"
                size={4}
                value={editForm.dataMax}
                onChange={handleEditField("dataMax")}
                placeholder="e.g. 20000"
              />
              <SelectField
                label="Status"
                id="edit-status"
                size={6}
                value={editForm.status}
                onChange={handleEditField("status")}
              >
                <Option value="Active" label="Active" />
                <Option value="Inactive" label="Inactive" />
              </SelectField>
              <DataField
                label="Renewal Date"
                id="edit-renewal"
                type="date"
                size={6}
                value={editForm.renewal}
                onChange={handleEditField("renewal")}
              />
            </Grid>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                text="Cancel"
                variant="ghost"
                size={2}
                onClick={() => closeModal("admin-edit")}
              />
              <Button
                text="Save Changes"
                variant="primary"
                size={3}
                onClick={handleSaveEdit}
              />
            </div>

            {/* ── Danger Zone ── */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest mr-auto">
                Danger Zone
              </span>
              <Button
                text="Reset Password"
                variant="ghost"
                size={3}
                onClick={() => {
                  closeModal("admin-edit");
                  openModal("admin-reset");
                }}
              />
              <Button
                text="Delete Admin"
                variant="danger"
                size={3}
                onClick={() => {
                  closeModal("admin-edit");
                  openModal("admin-delete");
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Create Admin ── */}
      <Modal id="admin-create" title="Create New Admin" size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={3}>
            <DataField
              label="Admin Name"
              id="create-adminName"
              size={6}
              value={createForm.adminName}
              onChange={handleCreateField("adminName")}
              placeholder="Full name"
            />
            <DataField
              label="Company Name"
              id="create-company"
              size={6}
              value={createForm.company}
              onChange={handleCreateField("company")}
              placeholder="Company name"
            />
            <DataField
              label="Email"
              id="create-email"
              type="email"
              size={4}
              value={createForm.email}
              onChange={handleCreateField("email")}
              placeholder="admin@company.com"
            />
            <DataField
              label="Phone"
              id="create-phone"
              type="tel"
              size={4}
              value={createForm.phone}
              onChange={handleCreateField("phone")}
              placeholder="98101XXXXX"
            />
            <DataField
              label="Password"
              id="create-password"
              type="password"
              size={4}
              value={createForm.password}
              onChange={handleCreateField("password")}
              placeholder="Password"
            />
            <SelectField
              label="Plan"
              id="create-plan"
              size={6}
              value={createForm.plan}
              onChange={handleCreateField("plan")}
            >
              <Option value="Starter" label="Starter" />
              <Option value="Pro" label="Pro" />
              <Option value="Enterprise" label="Enterprise" />
            </SelectField>
            <DataField
              label="Renewal Date"
              id="create-renewal"
              type="date"
              size={6}
              value={createForm.renewal}
              onChange={handleCreateField("renewal")}
            />
            <DataField
              label="User Limit"
              id="create-userMax"
              type="number"
              size={6}
              value={createForm.userMax}
              onChange={handleCreateField("userMax")}
              placeholder="40"
            />
            <DataField
              label="Data Limit"
              id="create-dataMax"
              type="number"
              size={6}
              value={createForm.dataMax}
              onChange={handleCreateField("dataMax")}
              placeholder="5000"
            />
          </Grid>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              text="Cancel"
              variant="ghost"
              size={2}
              onClick={() => closeModal("admin-create")}
            />
            <Button
              text="Create Admin"
              variant="primary"
              size={3}
              onClick={handleCreateAdmin}
            />
          </div>
        </div>
      </Modal>

      <Modal
        id="admin-toggle"
        title={
          selectedAdmin?.status === "Active"
            ? "Deactivate Admin"
            : "Activate Admin"
        }
        size="sm"
      >
        {selectedAdmin && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              {selectedAdmin.status === "Active" ? (
                <>
                  <span className="font-bold text-rose-500">Deactivate</span>{" "}
                  <span className="font-bold text-[#2a465a]">
                    {selectedAdmin.adminName}
                  </span>
                  ? They will lose access to the platform.
                </>
              ) : (
                <>
                  Reactivate{" "}
                  <span className="font-bold text-[#2a465a]">
                    {selectedAdmin.adminName}
                  </span>
                  ? They will regain access to the platform.
                </>
              )}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Company" value={selectedAdmin.company} />
              <ModalData label="Current Status" value={selectedAdmin.status} />
            </div>

            {/* Reason textarea — only for deactivation */}
            {selectedAdmin.status === "Active" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Reason for Deactivation *
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="e.g. Subscription expired, policy violation..."
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 transition duration-200 resize-none"
                />
                <p className="text-xs text-slate-400 text-right">
                  {deactivateReason.length}/300
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                text="Cancel"
                variant="ghost"
                size={3}
                onClick={() => closeModal("admin-toggle")}
              />
              <Button
                text={
                  selectedAdmin.status === "Active" ? "Deactivate" : "Activate"
                }
                variant={
                  selectedAdmin.status === "Active" ? "danger" : "primary"
                }
                size={3}
                onClick={handleToggleStatus}
                disabled={
                  selectedAdmin.status === "Active" && !deactivateReason.trim()
                }
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Confirm: Reset Password ── */}
      <Modal id="admin-reset" title="Reset Password" size="sm">
        {selectedAdmin && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Send a password reset link to{" "}
              <span className="font-bold text-[#2a465a]">
                {selectedAdmin.adminName}
              </span>
              ?
            </p>
            <ModalData label="Email" value={selectedAdmin.email} />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                text="Cancel"
                variant="ghost"
                size={3}
                onClick={() => closeModal("admin-reset")}
              />
              <Button
                text="Send Reset Link"
                variant="primary"
                size={4}
                onClick={() => closeModal("admin-reset")}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Confirm: Delete Admin ── */}
      <Modal id="admin-delete" title="Delete Admin" size="sm">
        {selectedAdmin && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Permanently delete{" "}
              <span className="font-bold text-rose-500">
                {selectedAdmin.adminName}
              </span>{" "}
              from{" "}
              <span className="font-bold text-[#2a465a]">
                {selectedAdmin.company}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Admin" value={selectedAdmin.adminName} />
              <ModalData label="Company" value={selectedAdmin.company} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                text="Cancel"
                variant="ghost"
                size={3}
                onClick={() => closeModal("admin-delete")}
              />
              <Button
                text="Delete Permanently"
                variant="danger"
                size={4}
                onClick={() => {
                  setAdmins((prev) =>
                    prev.filter((a) => a.id !== selectedAdmin.id),
                  );
                  setSelectedAdmin(null);
                  closeModal("admin-delete");
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
