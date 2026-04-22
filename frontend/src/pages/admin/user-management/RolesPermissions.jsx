import { useState } from "react";
import {
  Shield,
  UserCog,
  Settings,
  Target,
  Briefcase,
  BarChart3,
  Check,
  Save,
  Users
} from "lucide-react";

// ── Role data ──
const roles = [
  { key: "admin", name: "Admin", icon: Shield },
  { key: "sales_mgr", name: "Sales Manager", icon: Shield },
  { key: "sales_tl", name: "Sales Team Leader", icon: Shield },
  { key: "sales_exec", name: "Sales Executive", icon: Shield },
  { key: "mgmt_mgr", name: "Management Manager", icon: Shield },
  { key: "mgmt_tl", name: "Management Team Leader", icon: Shield },
  { key: "mgmt_emp", name: "Management Employee", icon: Shield },
  { key: "finance_mgr", name: "Finance Manager", icon: Shield },
];

const allPermissions = {
  LEADS: [
    { key: "view_leads", label: "View Leads" },
    { key: "edit_leads", label: "Edit Leads" },
    { key: "assign_leads", label: "Assign / Reassign Leads" },
    { key: "move_leads", label: "Move Leads to Dump" },
  ],
  PROJECTS: [
    { key: "view_projects", label: "View Projects" },
    { key: "edit_projects", label: "Edit Projects" },
  ],
  FINANCE: [
    { key: "view_finance", label: "View Finance" },
    { key: "edit_invoices", label: "Edit Invoices / Payments" },
  ],
  ADMIN: [
    { key: "view_users", label: "View Users" },
    { key: "manage_users", label: "Manage Users" },
    { key: "manage_settings", label: "Manage Settings" },
  ],
};

const defaultPermissions = () => {
  const defaults = {};
  roles.forEach((r) => {
    defaults[r.key] = {};
    Object.keys(allPermissions).forEach((cat) => {
      allPermissions[cat].forEach((perm) => {
        if (r.key === "admin") {
          defaults[r.key][perm.key] = true;
        } else if (r.key.includes("mgr") || r.key.includes("tl")) {
          // Medium permissions
          defaults[r.key][perm.key] = !["manage_users", "manage_settings", "move_leads"].includes(perm.key);
        } else {
          // Limited permissions (mainly view)
          defaults[r.key][perm.key] = perm.key.startsWith("view_");
        }
      });
    });
  });
  return defaults;
};

export default function RolesPermissions() {
  const [activeRole, setActiveRole] = useState(roles[0].key);
  const [permissions, setPermissions] = useState(defaultPermissions());

  const currentRole = roles.find((r) => r.key === activeRole);
  
  const togglePermission = (permKey) => {
    setPermissions((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [permKey]: !prev[activeRole][permKey],
      },
    }));
  };

  const handleSave = () => {
    alert(`Permissions saved for ${currentRole.name}`);
  };

  // calculate active permissions for progress
  const activePermsCount = Object.values(permissions[activeRole]).filter(Boolean).length;
  const totalPermsCount = Object.values(allPermissions).flat().length;
  const progressPercent = Math.round((activePermsCount / totalPermsCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">Roles & Permissions</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Fine-grained access control (RBAC). Toggle to grant or revoke.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-[#2a465a] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#2a465a]/20 transition hover:bg-[#1e3a52] active:scale-95"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Nav */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-3 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 py-2 mb-2">
              Select Role
            </h3>
            <div className="space-y-1">
              {roles.map((r) => {
                const isActive = activeRole === r.key;
                const Icon = r.icon;
                const rolePermCount = Object.values(permissions[r.key] || {}).filter(Boolean).length;
                return (
                  <button
                    key={r.key}
                    onClick={() => setActiveRole(r.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#2a465a] text-white shadow-md shadow-[#2a465a]/10"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#2a465a]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? "opacity-100" : "opacity-50"} />
                      <span>{r.name}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {rolePermCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white/90 rounded-2xl border border-slate-200/60 p-6 shadow-sm relative overflow-hidden z-0">
          
          {/* Animated Background Shapes (Admin Permission Card) */}
          <div className="absolute inset-0 pointer-events-none z-[-1]">
            {/* Top Right Group */}
            <div className="absolute top-0 right-0 w-80 h-80 opacity-50">
              <div className="absolute -top-10 -right-10 w-56 h-56 bg-gradient-to-br from-[#38bdf8]/40 to-[#818cf8]/30" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', animation: 'trapezoidFloat1 18s linear infinite' }} />
              <div className="absolute top-16 right-24 w-32 h-32 bg-gradient-to-bl from-[#34d399]/40 to-[#3b82f6]/30" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', animation: 'trapezoidFloat2 22s linear infinite reverse' }} />
            </div>

            {/* Bottom Left Group */}
            <div className="absolute bottom-0 left-0 w-96 h-96 opacity-50">
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-tr from-[#f472b6]/30 to-[#818cf8]/40" style={{ clipPath: 'polygon(0% 20%, 100% 0%, 80% 100%, 20% 100%)', animation: 'trapezoidFloat1 20s linear infinite reverse' }} />
              <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tl from-[#0ea5e9]/30 to-[#10b981]/40" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', animation: 'trapezoidFloat2 15s linear infinite' }} />
            </div>

            {/* Middle Group (Faint) */}
            <div className="absolute top-[30%] left-[30%] w-[40rem] h-[40rem] opacity-25">
              <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[#2a465a]/50 to-[#38bdf8]/50 blur-2xl" style={{ animation: 'trapezoidFloat1 30s linear infinite' }} />
              <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-tr from-[#34d399]/50 to-[#0ea5e9]/50 blur-xl" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', animation: 'trapezoidFloat2 25s linear infinite reverse' }} />
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-[#2a465a] flex items-center gap-2">
                {currentRole?.name} Permissions
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {activePermsCount} of {totalPermsCount} granted
              </p>
            </div>
            {/* Progress Bar visual indicator */}
            <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-[#2a465a] transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-8">
            {Object.keys(allPermissions).map((category) => (
              <div key={category}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allPermissions[category].map((perm) => {
                    const isGranted = permissions[activeRole]?.[perm.key];
                    return (
                      <div
                        key={perm.key}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {perm.label}
                        </span>
                        <div
                          onClick={() => togglePermission(perm.key)}
                          className={`relative flex items-center w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out shadow-inner ${
                            isGranted ? "bg-[#2a465a]" : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`pointer-events-none w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                              isGranted ? "translate-x-7" : "translate-x-1"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
