import React, { useState } from 'react';
import { Users, UserCheck, UserX, Calendar, Download, Check, X, Eye } from 'lucide-react';
import {
  Heading,
  P,
  DashGrid,
  EnhancedDashCard,
  DataTable,
  GLineChart,
  GDoughnutChart,
  GColumnChart
} from '../../components/shared/Common_Components';
import { StatCard } from '../../components/UI/StatCard';

// -- Dummy Data for Charts & Overview --
const attendanceTrendData = [
  { name: 'Mon', present: 120, absent: 5, leave: 10 },
  { name: 'Tue', present: 125, absent: 2, leave: 8 },
  { name: 'Wed', present: 118, absent: 7, leave: 10 },
  { name: 'Thu', present: 122, absent: 4, leave: 9 },
  { name: 'Fri', present: 115, absent: 8, leave: 12 },
];

const departmentData = [
  { name: 'Sales', attendance: 95 },
  { name: 'Finance', attendance: 98 },
  { name: 'Management', attendance: 100 },
  { name: 'Engineering', attendance: 92 },
  { name: 'Support', attendance: 88 },
];

const employeeCompositionData = [
  { name: 'Sales', value: 45 },
  { name: 'Finance', value: 20 },
  { name: 'Management', value: 10 },
  { name: 'Engineering', value: 35 },
  { name: 'Support', value: 25 },
];

const leaveStatusData = [
  { name: 'Approved', value: 45 },
  { name: 'Pending', value: 15 },
  { name: 'Rejected', value: 5 },
];

// -- Dummy Data for Tables --

// Employees
const employeesColumns = [
  { key: "name", label: "EMPLOYEE NAME", width: "20%" },
  { key: "department", label: "DEPARTMENT", width: "16%" },
  { key: "attendance", label: "ATTENDANCE %", width: "16%" },
  { key: "totalLeaves", label: "TOTAL LEAVES", width: "16%" },
  { key: "workingDays", label: "WORKING DAYS", width: "16%" },
  { key: "empStatus", label: "CURRENT STATUS", width: "20%" },
];
const employeesRows = [
  { name: "Alice Smith", department: "Sales", date: "2024-01-15", attendance: "98%", totalLeaves: "2", workingDays: "22", status: "Active" },
  { name: "Bob Johnson", department: "Engineering", date: "2023-11-01", attendance: "95%", totalLeaves: "5", workingDays: "20", status: "Active" },
  { name: "Charlie Brown", department: "Finance", date: "2022-05-20", attendance: "88%", totalLeaves: "10", workingDays: "18", status: "Inactive" },
  { name: "David Clark", department: "Support", date: "2024-03-10", attendance: "92%", totalLeaves: "1", workingDays: "21", status: "Active" },
  { name: "Emma Wilson", department: "Marketing", date: "2023-08-05", attendance: "100%", totalLeaves: "0", workingDays: "22", status: "Active" },
];

// Attendance
const attendanceColumns = [
  { key: "name", label: "NAME", width: "18%" },
  { key: "department", label: "DEPARTMENT", width: "15%" },
  { key: "date", label: "DATE", width: "15%" },
  { key: "clockIn", label: "CLOCK IN", width: "12%" },
  { key: "clockOut", label: "CLOCK OUT", width: "12%" },
  { key: "totalHours", label: "TOTAL HOURS", width: "12%" },
  { key: "attStatus", label: "STATUS", width: "16%" },
];
const attendanceRows = [
  { name: "Alice Smith", department: "Sales", date: "2024-11-01", clockIn: "09:00 AM", clockOut: "05:00 PM", totalHours: "8h", status: "Present" },
  { name: "Bob Johnson", department: "Engineering", date: "2024-11-01", clockIn: "09:15 AM", clockOut: "05:30 PM", totalHours: "8h 15m", status: "Late" },
  { name: "Charlie Brown", department: "Finance", date: "2024-11-01", clockIn: "-", clockOut: "-", totalHours: "0h", status: "Absent" },
  { name: "David Clark", department: "Support", date: "2024-11-01", clockIn: "09:00 AM", clockOut: "01:00 PM", totalHours: "4h", status: "Half Day" },
  { name: "Emma Wilson", department: "Marketing", date: "2024-11-02", clockIn: "-", clockOut: "-", totalHours: "0h", status: "On Leave" },
];

// Leave Requests
const leaveColumns = [
  { key: "name", label: "NAME", width: "15%" },
  { key: "leaveType", label: "LEAVE TYPE", width: "15%" },
  { key: "dates", label: "FROM - TO DATES", width: "25%" },
  { key: "days", label: "DAYS", width: "10%" },
  { key: "status", label: "STATUS", width: "10%" },
];
const leaveRows = [
  { name: "Bob Johnson", leaveType: "Sick Leave", dates: "2024-11-05 to 2024-11-06", days: "2", status: "Approved" },
  { name: "Charlie Brown", leaveType: "Vacation", dates: "2024-11-10 to 2024-11-15", days: "6", status: "Pending" },
  { name: "Emma Wilson", leaveType: "Personal", dates: "2024-11-20 to 2024-11-20", days: "1", status: "Rejected" },
  { name: "Frank White", leaveType: "Sick Leave", dates: "2024-11-08 to 2024-11-09", days: "2", status: "Approved" },
  { name: "Grace Lee", leaveType: "Maternity", dates: "2024-12-01 to 2025-03-01", days: "90", status: "Approved" },
];

// Approvals
const approvalsColumns = [
  { key: "name", label: "NAME", width: "15%" },
  { key: "leaveDates", label: "LEAVE DATES", width: "20%" },
  { key: "reason", label: "REASON", width: "25%" },
];
const approvalsRows = [
  { id: 1, name: "Charlie Brown", leaveDates: "2024-11-10 to 2024-11-15", reason: "Family Vacation", status: "Pending" },
  { id: 2, name: "David Clark", leaveDates: "2024-11-25 to 2024-11-26", reason: "Moving House", status: "Pending" },
  { id: 3, name: "Henry Ford", leaveDates: "2024-12-20 to 2024-12-27", reason: "Holiday Trip", status: "Pending" },
  { id: 4, name: "Ivy Chen", leaveDates: "2024-11-18 to 2024-11-19", reason: "Family Emergency", status: "Pending" },
  { id: 5, name: "Alice Smith", leaveDates: "2024-12-24 to 2025-01-02", reason: "Year-end Vacation", status: "Pending" },
];

export default function HRM() {
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Employees', 'Attendance', 'Leave Requests', 'Approvals'];

  // Modal states
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvalsData, setApprovalsData] = useState(approvalsRows);

  // Attendance filter states
  const [filterDate, setFilterDate] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Employees filter states
  const [empFilterDate, setEmpFilterDate] = useState('');
  const [empFilterDept, setEmpFilterDept] = useState('');

  // Handle Approvals actions
  const handleRejectApproval = (id) => {
    setApprovalsData(prev => prev.map(row => row.id === id ? { ...row, status: 'Rejected' } : row));
  };

  const approvalActions = [
    {
      label: "Approve",
      icon: <Check size={16} />,
      onClick: (row) => {
        setSelectedApproval(row);
        setIsModalOpen(true);
      },
      variant: "primary"
    },
    {
      label: "Reject",
      icon: <X size={16} />,
      onClick: (row) => handleRejectApproval(row.id),
      variant: "danger"
    }
  ];

  // Helper: Export CSV (used by Attendance & Leave)
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

  // Pre-filter attendance data based on custom UI controls
  const filteredAttendanceRows = attendanceRows.filter(row => {
    let matchesDate = true;
    let matchesDept = true;
    if (filterDate) matchesDate = row.date === filterDate;
    if (filterDept) matchesDept = row.department === filterDept;
    return matchesDate && matchesDept;
  });

  // Pre-filter employees data based on custom UI controls
  const filteredEmployeesRows = employeesRows.filter(row => {
    let matchesDate = true;
    let matchesDept = true;
    if (empFilterDate) matchesDate = row.date === empFilterDate;
    if (empFilterDept) matchesDept = row.department === empFilterDept;
    return matchesDate && matchesDept;
  }).map(row => ({
    ...row,
    empStatus: (
      <span 
        title={row.status === 'Active' ? 'Employee is active' : 'Employee is inactive'} 
        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
      >
        {row.status}
      </span>
    )
  }));

  const getAttendanceStatusStyle = (status) => {
    switch(status) {
      case 'Present': return 'bg-emerald-100 text-emerald-700';
      case 'Late': return 'bg-amber-100 text-amber-700';
      case 'Absent': return 'bg-rose-100 text-rose-700';
      case 'Half Day': return 'bg-blue-100 text-blue-700';
      case 'On Leave': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const styledFilteredAttendanceRows = filteredAttendanceRows.map(row => ({
    ...row,
    attStatus: (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getAttendanceStatusStyle(row.status)}`}>
        {row.status}
      </span>
    )
  }));

  return (
    <div className="w-full min-h-screen bg-white p-4 md:p-8">
      <style>{`
        /* Employees Table Styles */
        .hrm-employees-table table {
          table-layout: fixed;
          width: 100%;
        }
        .hrm-employees-table th, 
        .hrm-employees-table td {
          white-space: normal !important;
          word-break: normal !important;
          overflow-wrap: break-word;
          padding: 12px 8px !important;
        }
        .hrm-employees-table th:nth-child(1) { width: 20%; }
        .hrm-employees-table th:nth-child(2) { width: 17%; }
        .hrm-employees-table th:nth-child(3) { width: 16%; }
        .hrm-employees-table th:nth-child(4) { width: 15%; }
        .hrm-employees-table th:nth-child(5) { width: 15%; }
        .hrm-employees-table th:nth-child(6) { width: 17%; }
        .hrm-employees-table .data-table-scroll {
          overflow-x: hidden !important;
        }

        /* Attendance Table Styles */
        .hrm-attendance-table table {
          table-layout: fixed;
          width: 100%;
        }
        .hrm-attendance-table th, 
        .hrm-attendance-table td {
          white-space: normal !important;
          word-break: normal !important;
          overflow-wrap: break-word;
          padding: 12px 8px !important;
        }
        .hrm-attendance-table th:nth-child(1) { width: 18%; }
        .hrm-attendance-table th:nth-child(2) { width: 16%; }
        .hrm-attendance-table th:nth-child(3) { width: 15%; }
        .hrm-attendance-table th:nth-child(4) { width: 12%; }
        .hrm-attendance-table th:nth-child(5) { width: 12%; }
        .hrm-attendance-table th:nth-child(6) { width: 13%; }
        .hrm-attendance-table th:nth-child(7) { width: 14%; }
        .hrm-attendance-table .data-table-scroll {
          overflow-x: hidden !important;
        }

        /* Approvals Table Styles */
        .hrm-approvals-table table {
          table-layout: fixed;
          width: 100%;
        }
        .hrm-approvals-table th, 
        .hrm-approvals-table td {
          white-space: nowrap !important;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 12px 8px !important;
        }
        .hrm-approvals-table th:nth-child(1) { width: 20%; }
        .hrm-approvals-table th:nth-child(2) { width: 28%; }
        .hrm-approvals-table th:nth-child(3) { width: 27%; }
        .hrm-approvals-table th:last-child,
        .hrm-approvals-table td:last-child {
          width: 190px !important;
          min-width: 190px !important;
          white-space: nowrap !important;
          text-align: center;
          overflow: visible;
        }
        .hrm-approvals-table td:last-child > div {
          flex-wrap: nowrap !important;
          justify-content: center;
        }
        .hrm-approvals-table .data-table-scroll {
          overflow-x: hidden !important;
        }
      `}</style>
      
      {/* Header & Tabs Wrap */}
      <div className="mb-6">
        <div className="flex flex-col mb-6">
          <Heading primaryText="HRM" secondaryText="Dashboard" size={12} />
          <P text="Overview of human resources and employee activities." size="sm" />
        </div>

        {/* Tabs */}
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

      {/* ── Overview Tab ── */}
      {activeTab === 'Overview' && (
        <div className="space-y-10">
          <DashGrid cols={12} gap={6}>
            <EnhancedDashCard
              title="Total Employees"
              value="135"
              icon={<Users size={22} />}
              accentColor="#38bdf8"
              size={3}
            />
            <EnhancedDashCard
              title="Present Today"
              value="118"
              icon={<UserCheck size={22} />}
              accentColor="#22c55e"
              size={3}
            />
            <EnhancedDashCard
              title="Absent Today"
              value="7"
              icon={<UserX size={22} />}
              accentColor="#f43f5e"
              size={3}
            />
            <EnhancedDashCard
              title="On Leave"
              value="10"
              icon={<Calendar size={22} />}
              accentColor="#eab308"
              size={3}
            />
          </DashGrid>

          <DashGrid cols={12} gap={6}>
            <GLineChart
              title="Attendance Trend"
              subtitle="Weekly breakdown"
              data={attendanceTrendData}
              lines={[
                { key: "present", label: "Present", color: "#3b82f6" },
                { key: "absent", label: "Absent", color: "#f59e0b" },
                { key: "leave", label: "Leave", color: "#f43f5e" },
              ]}
              size={7}
              height={320}
            />
            <GDoughnutChart
              title="Leave Status"
              subtitle="Distribution of leave requests"
              data={leaveStatusData}
              colors={["#8b5cf6", "#14b8a6", "#f43f5e"]}
              size={5}
              height={320}
              innerRadius={80}
            />
            <GColumnChart
              title="Department Attendance"
              subtitle="Attendance % by department"
              data={departmentData}
              bars={[{ key: "attendance", label: "Attendance %", color: "#3b82f6" }]}
              size={6}
              height={320}
            />
            <GDoughnutChart
              title="Employee Composition"
              subtitle="Distribution by department"
              data={employeeCompositionData}
              colors={["#8b5cf6", "#14b8a6", "#f43f5e", "#22c55e", "#f59e0b"]}
              size={6}
              height={320}
              innerRadius={70}
            />
          </DashGrid>
        </div>
      )}

      {/* ── Employees Tab ── */}
      {activeTab === 'Employees' && (
        <div className="bg-white rounded-xl p-3 flex-col gap-3 w-full hrm-employees-table">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2 p-2">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Filter by Date</label>
                <input
                  type="date"
                  value={empFilterDate}
                  onChange={e => setEmpFilterDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 w-full sm:w-auto"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Filter by Dept</label>
                <select
                  value={empFilterDept}
                  onChange={e => setEmpFilterDept(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 w-full sm:w-auto min-w-[150px]"
                >
                  <option value="">All Departments</option>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="Support">Support</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              {(empFilterDate || empFilterDept) && (
                <button
                  onClick={() => { setEmpFilterDate(''); setEmpFilterDept(''); }}
                  className="mb-1 text-xs text-rose-500 hover:text-rose-600 transition-colors font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <button
              onClick={() => handleExportCSV(employeesColumns, filteredEmployeesRows, 'employees_export.csv')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#355872] rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm w-full sm:w-auto justify-center"
            >
               <Download size={16} /> Export CSV
            </button>
          </div>
          <DataTable
            columns={employeesColumns}
            rows={filteredEmployeesRows}
            size={12}
            pageSize={5}
            searchable={true}
          />
        </div>
      )}

      {/* ── Attendance Tab ── */}
      {activeTab === 'Attendance' && (
        <div className="bg-white rounded-xl p-3 flex-col gap-3 w-full hrm-attendance-table">
          {/* Custom Filter Controls for Attendance */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2 p-2">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Filter by Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 w-full sm:w-auto"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Filter by Dept</label>
                <select
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 w-full sm:w-auto min-w-[150px]"
                >
                  <option value="">All Departments</option>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="Support">Support</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              {(filterDate || filterDept) && (
                <button
                  onClick={() => { setFilterDate(''); setFilterDept(''); }}
                  className="mb-1 text-xs text-rose-500 hover:text-rose-600 transition-colors font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <button
              onClick={() => handleExportCSV(attendanceColumns, filteredAttendanceRows, 'attendance_export.csv')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#355872] rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm w-full sm:w-auto justify-center"
            >
               <Download size={16} /> Export CSV
            </button>
          </div>
          
          <DataTable
            columns={attendanceColumns}
            rows={styledFilteredAttendanceRows}
            size={12}
            pageSize={5}
            searchable={true}
            hideTopBar={false}
          />
        </div>
      )}

      {/* ── Leave Requests Tab ── */}
      {activeTab === 'Leave Requests' && (
        <div className="bg-white rounded-xl p-3 flex-col gap-3 w-full">
          <div className="flex justify-end mb-2 p-2">
             <button
                onClick={() => handleExportCSV(leaveColumns, leaveRows, 'leave_export.csv')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#355872] rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm w-full sm:w-auto justify-center"
              >
                 <Download size={16} /> Export CSV
              </button>
          </div>
          <DataTable
            columns={leaveColumns}
            rows={leaveRows}
            size={12}
            pageSize={5}
            searchable={true}
          />
        </div>
      )}

      {/* ── Approvals Tab ── */}
      {activeTab === 'Approvals' && (
        <div className="bg-white rounded-xl p-3 flex-col gap-3 w-full hrm-approvals-table">
          <DataTable
            columns={approvalsColumns}
            rows={approvalsData.filter(row => row.status === 'Pending')}
            actions={approvalActions}
            size={12}
            pageSize={5}
            searchable={true}
          />
        </div>
      )}

      {/* ── Approval Modal ── */}
      {isModalOpen && selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#2a465a]">Confirm Approval</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-600">Are you sure you want to approve this leave request?</p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm space-y-2">
                <div className="flex justify-between"><span className="font-semibold text-slate-500">Employee:</span> <span className="font-medium text-[#2a465a]">{selectedApproval.name}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-slate-500">Dates:</span> <span className="font-medium text-[#2a465a]">{selectedApproval.leaveDates}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-slate-500">Reason:</span> <span className="font-medium text-[#2a465a]">{selectedApproval.reason}</span></div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setApprovalsData(prev => prev.map(row => row.id === selectedApproval.id ? { ...row, status: 'Approved' } : row));
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#355872] text-white hover:bg-[#2a465a] transition-colors flex items-center gap-2"
              >
                <Check size={16} /> Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

