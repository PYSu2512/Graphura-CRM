import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, UserX, Calendar, Download, BadgeCheck, Ban, Eye, RefreshCw } from 'lucide-react';
import {
  Heading,
  P,
  DashGrid,
  EnhancedDashCard,
  DataTable,
  GLineChart,
  GDoughnutChart,
  GColumnChart,
  PanelModal as Modal,
  openModal,
  closeModal,
  ModalGrid,
  ModalData,
  Button
} from '../../components/shared/Common_Components';
import { hrmService } from '../../services/hrmService';
import { userService } from '../../services/userService';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';
import { useCurrentUser } from '../../hooks/useCurrentUser';

// -- Static data only for charts that have no real endpoint --
const attendanceTrendData = [
  { name: 'Mon', present: 120, absent: 5, leave: 10 },
  { name: 'Tue', present: 125, absent: 2, leave: 8 },
  { name: 'Wed', present: 118, absent: 7, leave: 10 },
  { name: 'Thu', present: 122, absent: 4, leave: 9 },
  { name: 'Fri', present: 115, absent: 8, leave: 12 },
];

// Static data kept for overview chart only
const LEAVE_TYPES = [
  "Sick Leave",
  "Casual Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Unpaid Leave",
  "Half Day",
  "Other",
];

const DEPARTMENTS = ["Sales", "Finance", "Management", "Engineering", "Support", "Marketing", "Administration"];
const ROLES = [
  "ADMIN",
  "SALES_MANAGER",
  "SALES_TL",
  "SALES_EXECUTIVE",
  "FINANCE_MANAGER",
  "FINANCE_EXECUTIVE",
  "MANAGEMENT_MANAGER",
  "MANAGEMENT_TL",
  "MANAGEMENT_EMPLOYEE",
];

const formatRole = (str) => {
  if (!str) return "—";
  const clean = str.replace(/^(SALES|FINANCE|MANAGEMENT)_/, '');
  if (clean === 'TL') return "Team Leader";
  return clean.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// -- Columns for Tables --

const employeesColumns = [
  { key: "name",        label: "EMPLOYEE NAME",   width: "20%" },
  { key: "department",  label: "DEPARTMENT",      width: "16%" },
  { key: "attendance",  label: "ATTENDANCE %",    width: "16%" },
  { key: "totalLeaves", label: "TOTAL LEAVES",    width: "16%" },
  { key: "workingDays", label: "WORKING DAYS",    width: "16%" },
  { key: "empStatus",   label: "CURRENT STATUS",  width: "16%" },
];

const attendanceColumns = [
  { key: "name", label: "NAME", width: "15%" },
  { key: "roleDisplay", label: "ROLE", width: "15%" },
  { key: "department", label: "DEPARTMENT", width: "15%" },
  { key: "date", label: "DATE", width: "10%" },
  { key: "clockIn", label: "CLOCK IN", width: "15%" },
  { key: "clockOut", label: "CLOCK OUT", width: "15%" },
  { key: "totalHours", label: "TOTAL HOURS", width: "10%" },
  { key: "status", label: "STATUS", width: "5%" },
];
const attendanceRows = [
  { name: "Alice Smith", department: "Sales", date: "2024-11-01", clockIn: "09:00 AM", clockOut: "05:00 PM", totalHours: "8h", status: "Present" },
  { name: "Bob Johnson", department: "Engineering", date: "2024-11-01", clockIn: "09:15 AM", clockOut: "05:30 PM", totalHours: "8h 15m", status: "Late" },
  { name: "Charlie Brown", department: "Finance", date: "2024-11-01", clockIn: "-", clockOut: "-", totalHours: "0h", status: "Absent" },
  { name: "David Clark", department: "Support", date: "2024-11-01", clockIn: "09:00 AM", clockOut: "01:00 PM", totalHours: "4h", status: "Half Day" },
  { name: "Emma Wilson", department: "Marketing", date: "2024-11-02", clockIn: "-", clockOut: "-", totalHours: "0h", status: "On Leave" },
];

const leaveColumns = [
  { key: "name", label: "NAME", width: "15%" },
  { key: "department", label: "DEPARTMENT", width: "12%" },
  { key: "appliedOn", label: "APPLIED ON", width: "12%", sortValue: (row) => new Date(row.createdAt).getTime() },
  { key: "leaveType", label: "LEAVE TYPE", width: "12%" },
  { key: "dates", label: "FROM - TO DATES", width: "22%" },
  { key: "days", label: "DAYS", width: "10%" },
  { key: "statusDisplay", label: "STATUS", width: "10%" },
];

const approvalColumns = [
  { key: "name", label: "NAME", width: "12%" },
  { key: "department", label: "DEPARTMENT", width: "12%" },
  { key: "appliedOn", label: "APPLIED ON", width: "12%", sortValue: (row) => new Date(row.createdAt).getTime() },
  { key: "role", label: "ROLE", width: "12%" },
  { key: "leaveType", label: "LEAVE TYPE", width: "12%" },
  { key: "dates", label: "FROM - TO DATES", width: "18%" },
  { key: "days", label: "DAYS", width: "8%" },
  { key: "actionedByName", label: "ACTIONED BY", width: "10%" },
  { key: "statusDisplay", label: "STATUS", width: "10%" },
];

export default function HRM() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Employees', 'Attendance', 'Leave Requests', 'Approvals'];

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [allLeaves, setAllLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);

  // ── Employee state (real API) ──────────────────────────────────────────────
  const [employees,    setEmployees]    = useState([]);
  const [empLoading,   setEmpLoading]   = useState(false);
  const [empStats,     setEmpStats]     = useState({ total: 0, active: 0, inactive: 0 });

  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true);
    try {
      const res = await apiClient.get('/admin/hrm/employees');
      const data = res.data?.data || {};
      const empArr = data.employees || [];
      setEmpStats(data.stats || {});
      setEmployees(empArr.map((e) => ({
        ...e,
        empStatus: (
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
            e.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>{e.status}</span>
        ),
      })));
    } catch (err) {
      toast.error('Failed to load employees.');
    } finally {
      setEmpLoading(false);
    }
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await hrmService.getTeamLeaves();
      if (res.success) {
        // Exclude current user from the list (robust check for _id or id)
        const currentId = String(currentUser?._id || currentUser?.id || "");
        const filtered = res.data.filter(l => String(l.user?._id || l.user?.id || "") !== currentId);
        
        const mapped = filtered.map(l => {
          const from = l.fromDate ? new Date(l.fromDate).toLocaleDateString() : '—';
          const to = l.toDate ? new Date(l.toDate).toLocaleDateString() : '—';
          const status = l.status || 'PENDING';

          const LEAVE_MAP = {
            'SICK': 'Sick Leave',
            'CASUAL': 'Casual Leave',
            'EARNED': 'Earned Leave',
            'MATERNITY': 'Maternity Leave',
            'PATERNITY': 'Paternity Leave',
            'BEREAVEMENT': 'Bereavement Leave',
            'UNPAID': 'Unpaid Leave',
            'HALF_DAY': 'Half Day',
            'OTHER': 'Other',
          };

          return {
            ...l,
            id: l._id,
            status,
            name: l.user?.name || "Unknown",
            department: l.deptName || "—",
            role: formatRole(l.user?.role),
            leaveType: LEAVE_MAP[l.leaveType] || l.leaveType,
            dates: `${from} to ${to}`,
            actionedByName: l.actionedByName || "—",
            statusDisplay: (
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </span>
            )
          };
        });
        
        // Explicitly sort by createdAt descending (newest first)
        mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setAllLeaves(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      toast.error("Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  };

  const [attendance, setAttendance] = useState([]);
  const [attLoading, setAttLoading] = useState(false);
  const [totalEmp, setTotalEmp] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await userService.getUserStats();
      if (res.success) {
        setTotalEmp(res.data.totalEmployees);
      }
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    }
  };

  const [attDateRange, setAttDateRange] = useState(() => {
    const d = new Date();
    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { startDate: formatted, endDate: formatted };
  });

  const fetchAttendance = async (filters = {}) => {
    setAttLoading(true);
    try {
      const params = { ...filters };
      if (!params.startDate) params.startDate = attDateRange.startDate;
      if (!params.endDate)   params.endDate   = attDateRange.endDate;

      // Fetch Team and Self in parallel
      const [res, selfRes] = await Promise.all([
        hrmService.getTeamAttendance(params),
        hrmService.getMyAttendanceHistory(params)
      ]);

      let combined = [];

      const formatTime = (iso) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };

      const formatHours = (hours) => {
        const h = Math.floor(hours || 0);
        const m = Math.round(((hours || 0) % 1) * 60);
        return `${h}h ${m}m`;
      };

      // 1. Process Self data
      if (selfRes.success && selfRes.data) {
        selfRes.data.forEach(r => {
          let statusLabel = "Present";
          if (r.clockIn && !r.clockOut) statusLabel = "Active";
          if (r.isHalfDay) statusLabel = "Half Day";
          if (r.isAbsent) statusLabel = "Absent";

          const d = new Date(r.date);
          const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          combined.push({
            ...r,
            id: 'self-' + r._id + '-' + formattedDate,
            name: "Self",
            role: currentUser?.role || "ADMIN",
            roleDisplay: "Admin",
            department: "Administration",
            date: formattedDate,
            clockIn: formatTime(r.clockIn),
            clockOut: formatTime(r.clockOut),
            totalHours: r.clockOut ? formatHours(r.hoursWorked) : (r.clockIn ? "Working..." : "—"),
            status: statusLabel
          });
        });
      }

      // 2. Process Team data
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(a => {
          const att = a.attendance;
          const d = new Date(a.date);
          const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return {
            ...a,
            id: `${a.id}-${formattedDate}`,
            name: a.name,
            roleDisplay: formatRole(a.role),
            department: a.department || "Unknown",
            date: formattedDate,
            clockIn: formatTime(att?.clockIn),
            clockOut: formatTime(att?.clockOut),
            totalHours: att?.clockOut ? formatHours(att.hoursWorked) : (att?.clockIn ? "Working..." : "—"),
            status: a.status
          };
        });
        combined = [...combined, ...mapped];
      }
      
      // Explicitly sort by date descending (newest first)
      combined.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setAttendance(combined);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setAttLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchStats();
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchAttendance(attDateRange);
  }, [attDateRange]);

  const todayStr = new Date().toISOString().split('T')[0];
  const onLeaveTodayCount = allLeaves.filter(l => {
    if (l.status !== 'APPROVED') return false;
    const fromStr = l.fromDate ? new Date(l.fromDate).toISOString().split('T')[0] : '';
    const toStr = l.toDate ? new Date(l.toDate).toISOString().split('T')[0] : '';
    return fromStr && toStr && todayStr >= fromStr && todayStr <= toStr;
  }).length;

  const leaveStats = [
    { name: 'Approved', value: allLeaves.filter(l => l.status === 'APPROVED').length },
    { name: 'Pending', value: allLeaves.filter(l => l.status === 'PENDING').length },
    { name: 'Rejected', value: allLeaves.filter(l => l.status === 'REJECTED').length },
  ];

  const presentToday = attendance.filter(r => r.date === todayStr && ["Present", "Active", "Late", "Present"].includes(r.status)).length;
  const absentToday  = attendance.filter(r => r.date === todayStr && r.status === "Absent").length;

  const handleUpdateStatus = async (id, status) => {
    if (!id) {
      toast.error("Invalid leave record ID.");
      return;
    }
    
    setActionLoading(true);
    const startTime = Date.now();

    try {
      const res = await hrmService.updateLeaveStatus(id, status);
      
      // Ensure spinner stays for at least 800ms for visual polish
      const elapsed = Date.now() - startTime;
      if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));

      if (res.success) {
        toast.success(`Leave ${status.toLowerCase()} successfully.`);
        await fetchLeaves(); 
        closeModal("approval-modal");
      } else {
        toast.error(res.message || `Failed to ${status.toLowerCase()} leave.`);
      }
    } catch (err) {
      console.error("[HRM] Approval Action Error:", err);
      
      // Artificial delay for fast-failing errors (like 403)
      const elapsed = Date.now() - startTime;
      if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));

      // Extract the most descriptive error message
      const msg = err.data?.message || err.message || "An error occurred.";
      
      // FALLBACK ALERT to ensure user sees the 403 restriction message
      if (err.statusCode === 403) {
        alert(`ACCESS DENIED: ${msg}`);
      }
      
      toast.error(msg, { duration: 4000 });
    } finally {
      setActionLoading(false);
    }
  };

  const leaveActions = [
    {
      icon: <Eye size={16} />,
      tooltip: "View Details",
      onClick: (row) => {
        setSelectedLeave(row);
        openModal("view-leave-modal");
      },
      variant: "ghost"
    },
    {
      icon: <BadgeCheck size={16} />,
      tooltip: "Approve",
      onClick: (row) => {
        setSelectedApproval(row);
        openModal("approval-modal");
      },
      variant: "primary",
      disabled: (row) => row.status !== 'PENDING'
    },
    {
      icon: <Ban size={16} />,
      tooltip: "Reject",
      onClick: (row) => {
        if(window.confirm("Are you sure you want to reject this leave request?")) {
           handleUpdateStatus(row.id, 'REJECTED');
        }
      },
      variant: "danger",
      disabled: (row) => row.status !== 'PENDING'
    }
  ];

  const handleExportCSV = (columns, rows, filename) => {
    if (rows.length === 0) return;
    const headers = columns.map(col => col.label).join(',');
    const csvRows = rows.map(row => columns.map(col => `"${row[col.key] || ''}"`).join(','));
    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // styledFilteredAttendanceRows removed — attendance tab uses live `attendance` state directly

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <Heading primaryText="HRM" secondaryText="Dashboard" size={12} />
          <P text="Overview of human resources and employee activities." size="sm" />
        </div>

        <div className="flex border-b border-slate-200 gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === tab ? 'text-[#355872]' : 'text-slate-400 hover:text-[#355872]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#355872] rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <DashGrid cols={12} gap={6}>
            <EnhancedDashCard title="Total Employees" value={String(totalEmp)} icon={<Users size={22} />} accentColor="#38bdf8" size={3} />
            <EnhancedDashCard title="Present Today" value={String(presentToday)} icon={<UserCheck size={22} />} accentColor="#22c55e" size={3} />
            <EnhancedDashCard title="Absent Today" value={String(absentToday)} icon={<UserX size={22} />} accentColor="#f43f5e" size={3} />
            <EnhancedDashCard title="On Leave" value={String(onLeaveTodayCount)} icon={<Calendar size={22} />} accentColor="#eab308" size={3} />
          </DashGrid>

          <DashGrid cols={12} gap={6}>
            <GLineChart
              title="Attendance Trend"
              data={attendanceTrendData}
              lines={[
                { key: "present", label: "Present", color: "#3b82f6" },
                { key: "absent",  label: "Absent", color: "#f59e0b" },
                { key: "leave",   label: "Leave", color: "#f43f5e" },
              ]}
              size={8} height={320}
            />
            <GDoughnutChart
              title="Leave Status"
              data={leaveStats}
              colors={["#10b981", "#f59e0b", "#f43f5e"]}
              size={4} height={320} innerRadius={80}
            />
          </DashGrid>
        </div>
      )}

      {activeTab === 'Employees' && (
        <div className="flex-col gap-3 w-full">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-bold text-[#2a465a]">{empStats.total || 0}</span> total ·
              <span className="text-emerald-600 font-bold">{empStats.active || 0}</span> active ·
              <span className="text-rose-500 font-bold">{empStats.inactive || 0}</span> inactive
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchEmployees}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-[#355872] rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={() => handleExportCSV(
                  employeesColumns.map((c) => ({ ...c, key: c.key === 'empStatus' ? 'status' : c.key })),
                  employees.map((e) => ({ ...e, empStatus: e.status })),
                  'employees_export.csv',
                )}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#355872] rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>
          <DataTable
            columns={employeesColumns}
            rows={employees}
            loading={empLoading}
            size={12}
            pageSize={10}
            searchable
            filters={[
              { title: "Status",     type: "toggle", key: "status",     options: ["Active", "Inactive"] },
              { title: "Department", type: "toggle", key: "department", options: [...new Set(employees.map((e) => e.department).filter(Boolean))] },
            ]}
          />
        </div>
      )}

      {activeTab === 'Attendance' && (
        <div className="flex-col gap-3 w-full">
          <DataTable 
            title={attDateRange.startDate === attDateRange.endDate 
              ? `Attendance for ${attDateRange.startDate}` 
              : `Attendance for ${attDateRange.startDate} to ${attDateRange.endDate}`
            }
            columns={attendanceColumns} 
            rows={attendance} 
            loading={attLoading}
            size={12} 
            pageSize={10} 
            searchable={true} 
            onDateFilter={false}
            date={true}
            onApplyFilters={(f) => {
              if (f.startDate || f.endDate) {
                setAttDateRange({
                  startDate: f.startDate || attDateRange.startDate,
                  endDate: f.endDate || attDateRange.endDate
                });
              } else {
                const d = new Date();
                const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                setAttDateRange({ startDate: formatted, endDate: formatted });
              }
            }}
            exportable
            exportFileName={`attendance_${attDateRange.startDate}_${attDateRange.endDate}`}
            filters={[
              { title: "Status", type: "toggle", key: "status", options: ["Present", "Active", "Absent", "Leave", "Half Day"] },
              { title: "Department", type: "toggle", key: "department", options: DEPARTMENTS },
              { title: "Role", type: "toggle", key: "roleDisplay", options: ROLES.map(r => formatRole(r)) },
            ]}
          />
        </div>
      )}

      {activeTab === 'Leave Requests' && (
        <div className="flex-col gap-3 w-full">
          <div className="flex justify-end mb-4">
             <button onClick={() => handleExportCSV(leaveColumns, allLeaves.filter(l => l.status === 'PENDING'), 'leave_requests_export.csv')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#355872] rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm w-full sm:w-auto justify-center">
                 <Download size={16} /> Export CSV
              </button>
          </div>
          <DataTable columns={leaveColumns} rows={allLeaves.filter(l => l.status === 'PENDING')} loading={loading} actions={leaveActions} size={12} pageSize={10} searchable={true}
            defaultSortKey="appliedOn"
            defaultSortDir="desc"
            filters={[
              { title: "Leave Type", type: "toggle", key: "leaveType", options: LEAVE_TYPES },
            ]}
          />
        </div>
      )}

      {activeTab === 'Approvals' && (
        <div className="flex-col gap-3 w-full">
           <div className="flex justify-end mb-4">
             <button onClick={() => handleExportCSV(approvalColumns, allLeaves.filter(l => ['APPROVED', 'REJECTED'].includes(l.status)), 'leave_approvals_export.csv')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#355872] rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm w-full sm:w-auto justify-center">
                 <Download size={16} /> Export CSV
              </button>
          </div>
          <DataTable columns={approvalColumns} rows={allLeaves.filter(l => ['APPROVED', 'REJECTED'].includes(l.status))} loading={loading} actions={[{
            icon: <Eye size={16} />,
            tooltip: "View Details",
            onClick: (row) => {
              setSelectedLeave(row);
              openModal("view-leave-modal");
            },
            variant: "ghost"
          }]} size={12} pageSize={10} searchable={true}
            defaultSortKey="appliedOn"
            defaultSortDir="desc"
            filters={[
              { title: "Leave Type", type: "toggle", key: "leaveType", options: LEAVE_TYPES },
              { title: "Status", type: "toggle", key: "status", options: ["APPROVED", "REJECTED"] }
            ]}
          />
        </div>
      )}

      <Modal id="approval-modal" title="Confirm Approval" size="md">
        {selectedApproval && (
          <div className="space-y-6">
            <P text="Are you sure you want to approve this leave request?" size="sm" />
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <ModalGrid title="Leave Information" cols={1}>
                <ModalData label="Employee" value={selectedApproval.name} />
                <ModalData label="Dates" value={selectedApproval.dates} />
                <ModalData label="Reason" value={selectedApproval.reason} />
              </ModalGrid>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <DashGrid cols={12} gap={3}>
                <Button 
                  text="Cancel" 
                  variant="ghost" 
                  size={6} 
                  onClick={() => closeModal("approval-modal")} 
                />
                <Button 
                  text="Confirm Approve"
                  variant="primary"
                  size={6}
                  loading={actionLoading}
                  onClick={() => handleUpdateStatus(selectedApproval.id, 'APPROVED')} 
                />
              </DashGrid>
            </div>
            </div>
            )}
            </Modal>

      <Modal id="view-leave-modal" title="Leave Application Details" size="md">
        {selectedLeave && (
          <div className="flex flex-col gap-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold ${
              selectedLeave.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
              selectedLeave.status === 'REJECTED' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <span className="text-xs font-black uppercase tracking-widest">Status:</span>
              {selectedLeave.status}
            </div>
            <ModalGrid title="Employee Info" cols={2}>
              <ModalData label="Name" value={selectedLeave.name} />
              <ModalData label="Role" value={selectedLeave.role || '—'} />
              <ModalData label="Applied On" value={new Date(selectedLeave.createdAt).toLocaleDateString()} />
            </ModalGrid>
            <ModalGrid title="Leave Details" cols={2}>
              <ModalData label="Type" value={selectedLeave.leaveType} />
              <ModalData label="Dates" value={selectedLeave.dates} />
              <ModalData label="Total Days" value={selectedLeave.days} />
              {selectedLeave.status !== 'PENDING' && (
                <ModalData label="Actioned By" value={selectedLeave.actionedByName || '—'} />
              )}
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Description" value={selectedLeave.reason} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("view-leave-modal")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
