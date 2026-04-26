import React, { useState } from 'react';
import { Users, UserCheck, UserX, Calendar, Download, Check, X } from 'lucide-react';
import {
  Heading,
  P,
  DashGrid,
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

const leaveStatusData = [
  { name: 'Approved', value: 45 },
  { name: 'Pending', value: 15 },
  { name: 'Rejected', value: 5 },
];

// -- Dummy Data for Tables --

// Employees
const employeesColumns = [
  { key: "name", label: "NAME" },
  { key: "department", label: "DEPARTMENT" },
  { key: "date", label: "JOIN DATE" },
  { key: "attendance", label: "ATTENDANCE %" },
  { key: "leaveTaken", label: "LEAVE TAKEN" },
  { key: "status", label: "STATUS" },
];
const employeesRows = [
  { name: "Alice Smith", department: "Sales", date: "2024-01-15", attendance: "98%", leaveTaken: "2 Days", status: "Active" },
  { name: "Bob Johnson", department: "Engineering", date: "2023-11-01", attendance: "95%", leaveTaken: "5 Days", status: "Active" },
  { name: "Charlie Brown", department: "Finance", date: "2022-05-20", attendance: "88%", leaveTaken: "10 Days", status: "Inactive" },
  { name: "David Clark", department: "Support", date: "2024-03-10", attendance: "92%", leaveTaken: "1 Day", status: "Active" },
  { name: "Emma Wilson", department: "Marketing", date: "2023-08-05", attendance: "100%", leaveTaken: "0 Days", status: "Active" },
];

// Attendance
const attendanceColumns = [
  { key: "name", label: "NAME" },
  { key: "department", label: "DEPARTMENT" },
  { key: "date", label: "DATE" },
  { key: "clockIn", label: "CLOCK IN" },
  { key: "clockOut", label: "CLOCK OUT" },
  { key: "totalHours", label: "TOTAL HOURS" },
  { key: "status", label: "STATUS" },
];
const attendanceRows = [
  { name: "Alice Smith", department: "Sales", date: "2024-11-01", clockIn: "09:00 AM", clockOut: "05:00 PM", totalHours: "8h", status: "Present" },
  { name: "Bob Johnson", department: "Engineering", date: "2024-11-01", clockIn: "09:15 AM", clockOut: "05:30 PM", totalHours: "8h 15m", status: "Late" },
  { name: "Charlie Brown", department: "Finance", date: "2024-11-01", clockIn: "-", clockOut: "-", totalHours: "0h", status: "Absent" },
  { name: "David Clark", department: "Support", date: "2024-11-01", clockIn: "08:50 AM", clockOut: "05:05 PM", totalHours: "8h 15m", status: "Present" },
  { name: "Emma Wilson", department: "Marketing", date: "2024-11-02", clockIn: "09:00 AM", clockOut: "05:00 PM", totalHours: "8h", status: "Present" },
];

// Leave Requests
const leaveColumns = [
  { key: "name", label: "NAME" },
  { key: "leaveType", label: "LEAVE TYPE" },
  { key: "dates", label: "FROM - TO DATES" },
  { key: "days", label: "DAYS" },
  { key: "status", label: "STATUS" },
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
  { key: "name", label: "NAME" },
  { key: "leaveDates", label: "LEAVE DATES" },
  { key: "reason", label: "REASON" },
  { key: "status", label: "STATUS" },
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

  // Attendance filter states
  const [filterDate, setFilterDate] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Employees filter states
  const [empFilterDate, setEmpFilterDate] = useState('');
  const [empFilterDept, setEmpFilterDept] = useState('');

  // Handle Approvals actions
  const approvalActions = [
    {
      label: "Approve",
      icon: <Check size={16} />,
      onClick: (row) => console.log("Approved", row),
      variant: "primary"
    },
    {
      label: "Reject",
      icon: <X size={16} />,
      onClick: (row) => console.log("Rejected", row),
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
  });

  return (
    <div className="w-full min-h-screen bg-white p-4 md:p-8">
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
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <div className="rounded-2xl p-4 flex items-center gap-3 shadow-md transition-all duration-300 hover:-translate-y-1 h-full" style={{ backgroundColor: "#355872", border: "1px solid #35587233" }}>
                <div className="flex-shrink-0 w-[40px] h-[40px] rounded-[14px] flex items-center justify-center bg-white/20 text-white shadow-sm">
                  <Users size={18} />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1 text-white">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider leading-tight mb-1 truncate opacity-90">Total Employees</h3>
                  <span className="text-[24px] font-extrabold leading-none tracking-tight">135</span>
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <div className="rounded-2xl p-4 flex items-center gap-3 shadow-md transition-all duration-300 hover:-translate-y-1 h-full" style={{ backgroundColor: "#355872", border: "1px solid #35587233" }}>
                <div className="flex-shrink-0 w-[40px] h-[40px] rounded-[14px] flex items-center justify-center bg-white/20 text-white shadow-sm">
                  <UserCheck size={18} />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1 text-white">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider leading-tight mb-1 truncate opacity-90">Present Today</h3>
                  <span className="text-[24px] font-extrabold leading-none tracking-tight">118</span>
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <div className="rounded-2xl p-4 flex items-center gap-3 shadow-md transition-all duration-300 hover:-translate-y-1 h-full" style={{ backgroundColor: "#355872", border: "1px solid #35587233" }}>
                <div className="flex-shrink-0 w-[40px] h-[40px] rounded-[14px] flex items-center justify-center bg-white/20 text-white shadow-sm">
                  <UserX size={18} />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1 text-white">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider leading-tight mb-1 truncate opacity-90">Absent Today</h3>
                  <span className="text-[24px] font-extrabold leading-none tracking-tight">7</span>
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <div className="rounded-2xl p-4 flex items-center gap-3 shadow-md transition-all duration-300 hover:-translate-y-1 h-full" style={{ backgroundColor: "#355872", border: "1px solid #35587233" }}>
                <div className="flex-shrink-0 w-[40px] h-[40px] rounded-[14px] flex items-center justify-center bg-white/20 text-white shadow-sm">
                  <Calendar size={18} />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1 text-white">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider leading-tight mb-1 truncate opacity-90">On Leave</h3>
                  <span className="text-[24px] font-extrabold leading-none tracking-tight">10</span>
                </div>
              </div>
            </div>
          </DashGrid>

          <DashGrid cols={12} gap={6}>
            <GLineChart
              title="Attendance Trend"
              subtitle="Weekly breakdown"
              data={attendanceTrendData}
              lines={[
                { key: "present", label: "Present", color: "#355872" },
                { key: "absent", label: "Absent", color: "#7AAACE" },
                { key: "leave", label: "Leave", color: "#9CD5FF" },
              ]}
              size={7}
              height={320}
            />
            <GDoughnutChart
              title="Leave Status"
              subtitle="Distribution of leave requests"
              data={leaveStatusData}
              colors={["#355872", "#9CD5FF", "#7AAACE"]}
              size={5}
              height={320}
              innerRadius={80}
            />
            <GColumnChart
              title="Department Attendance"
              subtitle="Attendance % by department"
              data={departmentData}
              bars={[{ key: "attendance", label: "Attendance %", color: "#7AAACE" }]}
              size={12}
              height={320}
            />
          </DashGrid>
        </div>
      )}

      {/* ── Employees Tab ── */}
      {activeTab === 'Employees' && (
        <div className="bg-[#efefefb1] rounded-xl p-3 flex-col gap-3 w-full">
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
        <div className="bg-[#efefefb1] rounded-xl p-3 flex-col gap-3 w-full">
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
            rows={filteredAttendanceRows}
            size={12}
            pageSize={5}
            searchable={true}
            hideTopBar={false}
          />
        </div>
      )}

      {/* ── Leave Requests Tab ── */}
      {activeTab === 'Leave Requests' && (
        <div className="bg-[#efefefb1] rounded-xl p-3 flex-col gap-3 w-full">
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
        <div className="bg-[#efefefb1] rounded-xl p-3 flex-col gap-3 w-full">
          <DataTable
            columns={approvalsColumns}
            rows={approvalsRows}
            actions={approvalActions}
            size={12}
            pageSize={5}
            searchable={true}
          />
        </div>
      )}

    </div>
  );
}

