import { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Target,
  Search,
  Download,
  Upload,
  UserPlus,
  RotateCcw,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard as DashCard,
  EnhancedDataTable as DataTable,
  Button,
  PanelModal as Modal,
  openModal,
  closeModal,
  DataField,
  SelectField,
  Option,
  Grid,
} from "../../../components/shared/Common_Components";
import { userService } from "../../../services/userService";



const statusOptions = ["All", "Active", "Inactive"];
const departmentOptions = ["All", "Sales", "Management", "Finance", "Administration"];

export default function AllUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for quick create
  const [quickName, setQuickName] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickMobile, setQuickMobile] = useState("");
  const [quickRole, setQuickRole] = useState("");
  const [quickDept, setQuickDept] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUsers();
      const mappedUsers = response.data.users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        mobile: u.phone,
        role: u.role,
        department: u.department?.name || "N/A",
        status: u.status || "Active",
        joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
        lastLogin: "Never", // Placeholder or fetch if available
        avatar: u.name.split(" ").map(n => n[0]).join("").toUpperCase()
      }));
      setUsersList(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await userService.getDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const handleCreateUser = async () => {
    try {
      setIsCreating(true);
      
      const roleMap = {
        "admin": "ADMIN",
        "sales_exec": "SALES_EXECUTIVE",
        "sales_tl": "SALES_TL",
        "mgmt_emp": "MANAGEMENT_EMPLOYEE",
        "mgmt_tl": "MANAGEMENT_TL",
        "finance_mgr": "FINANCE_MANAGER",
        "finance_exec": "FINANCE_EXECUTIVE",
        "super_admin": "SUPER_ADMIN",
        "administrator": "ADMIN"
      };

      await userService.createUser({
        name: quickName,
        email: quickEmail,
        phone: quickMobile,
        role: roleMap[quickRole] || quickRole,
        departmentId: quickDept // backend will lookup by name if not ObjectId
      });
      alert("User created successfully!");
      closeModal("create-user-quick-modal");
      setQuickName("");
      setQuickEmail("");
      setQuickMobile("");
      setQuickRole("");
      setQuickDept("");
      fetchUsers();
    } catch (error) {
      alert(error.message || "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Email,Role,Status\n" + 
      usersList.map(u => `${u.name},${u.email},${u.role},${u.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv, .xlsx";
    input.onchange = (e) => {
      if (e.target.files.length > 0) {
        alert(`Successfully uploaded and processed ${e.target.files[0].name}`);
      }
    };
    input.click();
  };

  // ── Stats ──
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter((u) => u.status === "Active").length;
  const inactiveUsers = usersList.filter((u) => u.status === "Inactive").length;
  const salesTeam = usersList.filter((u) => u.department === "Sales").length;

  // ── Filter Logic ──
  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.mobile.includes(q);
      const matchStatus =
        statusFilter === "All" || user.status === statusFilter;
      const matchDept =
        deptFilter === "All" || user.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [usersList, searchQuery, statusFilter, deptFilter]);

  // ── Table columns ──
  const columns = [
    { key: "name", label: "User Name" },
    { key: "email", label: "Email ID" },
    { key: "mobile", label: "Mobile" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department" },
    { key: "status", label: "Status" },
    { key: "joinedDate", label: "Joined" },
  ];

  // ── Table rows (formatted for DataTable) ──
  const rows = filteredUsers;

  // ── Actions ──
  const actions = [
    {
      label: "Edit",
      variant: "primary",
      onClick: (row) => {
        setSelectedUser(row);
        openModal("edit-user-modal");
      },
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row) => {
        setSelectedUser(row);
        openModal("delete-confirm-modal");
      },
    },
  ];

  const handleDelete = () => {
    if (selectedUser) {
      setUsersList((prev) => prev.filter((u) => u.id !== selectedUser.id));
      closeModal("delete-confirm-modal");
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header Actions ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">All Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and monitor all system users
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={handleBulkUpload}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95"
          >
            <Upload size={14} />
            Bulk Upload
          </button>
          <button
            onClick={() => openModal("create-user-quick-modal")}
            className="flex items-center gap-2 rounded-xl bg-[#2a465a] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#2a465a]/20 transition hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 shiny-sweep"
          >
            <UserPlus size={14} />
            + Create User
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <DashGrid cols={12} gap={4}>
        <DashCard
          title="Total Users"
          value={String(totalUsers)}
          icon={<Users size={22} />}
          accentColor="#38bdf8"
          size={3}
        />
        <DashCard
          title="Active Users"
          value={String(activeUsers)}
          icon={<UserCheck size={22} />}
          accentColor="#22c55e"
          size={3}
        />
        <DashCard
          title="Inactive Users"
          value={String(inactiveUsers)}
          icon={<UserX size={22} />}
          accentColor="#f43f5e"
          size={3}
        />
        <DashCard
          title="Sales Team"
          value={String(salesTeam)}
          icon={<Target size={22} />}
          accentColor="#7AAACE"
          size={3}
        />
      </DashGrid>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          {/* Status pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  statusFilter === s
                    ? "bg-[#2a465a] text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Department pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Dept:
            </span>
            <button
              onClick={() => setDeptFilter("All")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                deptFilter === "All"
                  ? "bg-[#2a465a] text-white shadow-md"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {departments.map((d) => (
              <button
                key={d._id}
                onClick={() => setDeptFilter(d.name)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  deptFilter === d.name
                    ? "bg-[#2a465a] text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {d.name.charAt(0) + d.name.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Data Table ── */}
      <DataTable
        title="User Records"
        columns={columns}
        rows={rows}
        actions={actions}
        pageSize={5}
        importantColumnsCount={4}
      />

      {/* ── Delete Confirmation Modal ── */}
      <Modal id="delete-confirm-modal" title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Are you sure you want to delete{" "}
            <strong className="text-[#2a465a]">{selectedUser?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => closeModal("delete-confirm-modal")}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition active:scale-95"
            >
              Delete User
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Edit User Modal ── */}
      <Modal id="edit-user-modal" title="Edit User">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2a465a]/10 flex items-center justify-center text-[#2a465a] font-bold text-sm">
              {selectedUser?.avatar}
            </div>
            <div>
              <p className="font-bold text-[#2a465a]">{selectedUser?.name}</p>
              <p className="text-xs text-slate-500">{selectedUser?.email}</p>
            </div>
          </div>
          <Grid cols={12} gap={4}>
            <DataField
              label="Full Name"
              id="edit-name"
              size={12}
              value={selectedUser?.name || ""}
              onChange={() => {}}
              placeholder="Full Name"
            />
            <DataField
              label="Email"
              id="edit-email"
              type="email"
              size={6}
              value={selectedUser?.email || ""}
              onChange={() => {}}
              placeholder="Email"
            />
            <DataField
              label="Mobile"
              id="edit-mobile"
              type="tel"
              size={6}
              value={selectedUser?.mobile || ""}
              onChange={() => {}}
              placeholder="Mobile"
            />
          </Grid>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => closeModal("edit-user-modal")}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                closeModal("edit-user-modal");
                alert("User updated successfully!");
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] shadow-lg shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95 shiny-sweep"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Create User Modal ── */}
      <Modal id="create-user-quick-modal" title="Create New User">
        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-4">
             <div className="w-10 h-10 rounded-full bg-[#2a465a]/10 flex items-center justify-center text-[#2a465a] mt-0.5">
               <UserPlus size={18} />
             </div>
             <div>
               <h4 className="text-sm font-bold text-[#2a465a]">User Profile Details</h4>
               <p className="text-xs text-slate-500 mt-0.5">Enter the basic details and assign a role to the new team member.</p>
             </div>
          </div>
          <Grid cols={12} gap={4}>
            <DataField label="Full Name" id="quick-name" size={12} placeholder="e.g. Rahul Sharma" value={quickName} onChange={e => setQuickName(e.target.value)} />
            <DataField label="Email Address" id="quick-email" type="email" size={6} placeholder="user@company.com" value={quickEmail} onChange={e => setQuickEmail(e.target.value)} />
            <DataField label="Mobile Number" id="quick-mobile" type="tel" size={6} placeholder="+91 9876543210" value={quickMobile} onChange={e => setQuickMobile(e.target.value)} />
            <DataField 
              label="Auto-generated Password" 
              id="quick-password" 
              size={12} 
              value={quickMobile.length >= 5 ? `Test@${quickMobile.slice(-5)}` : "Test@*****"} 
              readOnly 
              className="bg-slate-50 border-slate-200 text-slate-500 font-mono"
            />
            
            <SelectField label="Role Selection" id="quick-role" size={6} placeholder="Assign a role" value={quickRole} onChange={e => setQuickRole(e.target.value)}>
              <Option value="admin" label="Admin" />
              <Option value="sales_exec" label="Sales Executive" />
              <Option value="sales_tl" label="Sales Team Lead" />
              <Option value="mgmt_emp" label="Management Employee" />
              <Option value="mgmt_tl" label="Management TL" />
              <Option value="finance_mgr" label="Finance Manager" />
              <Option value="finance_exec" label="Finance Executive" />
              <Option value="super_admin" label="Super Admin" />
              <Option value="administrator" label="Administrator" />
            </SelectField>
            <SelectField label="Department" id="quick-dept" size={6} placeholder="Select department" value={quickDept} onChange={e => setQuickDept(e.target.value)}>
              {departments.map(d => (
                <Option key={d._id} value={d._id} label={d.displayName} />
              ))}
            </SelectField>
          </Grid>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => closeModal("create-user-quick-modal")}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              disabled={isCreating}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] shadow-lg shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95 shiny-sweep disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
