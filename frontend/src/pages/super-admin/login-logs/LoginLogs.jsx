import { useMemo, useState } from "react";
import { MapPin, Shield, Clock, ChevronDown, ChevronUp } from "lucide-react";

import {
  Grid,
  Heading,
  DashGrid,
  DashCard,
  Select,
  Option,
  Button,
  DataTable,
} from "./../../../components/shared/Common_Components";
import { RoleBadge } from "./RoleBadge";
import { ALL_LOGS, ROLE_DEPT } from "./loginLogs.constants";
import { exportCSV } from "./helper";

// MAIN PAGE COMPONENT

const LoginLogs = () => {
  // ── Filter state
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const sortedLogDates = useMemo(
    () =>
      [...new Set(ALL_LOGS.map((log) => log.loginAt.split(" ")[0]))].sort(
        (a, b) => b.localeCompare(a),
      ),
    [],
  );

  const todayDate = sortedLogDates[0] ?? "";
  const yesterdayDate = sortedLogDates[1] ?? "";
  const roleOptions = useMemo(
    () => [...new Set(ALL_LOGS.map((log) => log.role))].sort(),
    [],
  );

  const filteredLogs = useMemo(() => {
    return ALL_LOGS.filter((log) => {
      if (roleFilter && log.role !== roleFilter) return false;
      if (deptFilter && ROLE_DEPT[log.role] !== deptFilter) return false;
      if (dateFilter === "today" && !log.loginAt.startsWith(todayDate))
        return false;
      if (dateFilter === "yesterday" && !log.loginAt.startsWith(yesterdayDate))
        return false;
      return true;
    });
  }, [dateFilter, deptFilter, roleFilter, todayDate, yesterdayDate]);

  const totalLogins = filteredLogs.length;
  const todayLogins = filteredLogs.filter((log) =>
    log.loginAt.startsWith(todayDate),
  ).length;
  const uniqueRoles = new Set(filteredLogs.map((l) => l.role)).size;
  const uniqueCities = new Set(filteredLogs.map((l) => l.city)).size;

  const columns = [
    {
      key: "user",
      label: "Name",
      headerClassName: "w-[18%] whitespace-nowrap",
      cellClassName:
        "w-[18%] py-3.5 px-4 text-slate-700 font-semibold whitespace-normal break-words",
      render: (row) => (
        <span className="text-[14px] font-semibold text-slate-700">
          {row.user}
        </span>
      ),
      searchValue: (row) => `${row.user} ${row.ip}`,
    },
    {
      key: "email",
      label: "Email",
      headerClassName: "w-[24%] whitespace-nowrap",
      cellClassName:
        "w-[24%] py-3.5 px-4 text-[14px] text-slate-600 whitespace-normal break-words",
    },
    {
      key: "role",
      label: "Role",
      render: (row) => <RoleBadge role={row.role} />,
      searchValue: (row) => row.role,
      sortValue: (row) => row.role,
      headerClassName: "w-[16%] whitespace-nowrap",
      cellClassName: "w-[16%] py-3.5 px-4 whitespace-normal",
    },
    {
      key: "city",
      label: "Location",
      headerClassName: "w-[16%] whitespace-nowrap",
      cellClassName:
        "w-[16%] py-3.5 px-4 text-[14px] text-slate-600 whitespace-normal",
    },
    {
      key: "device",
      label: "System",
      headerClassName: "w-[18%] whitespace-nowrap",
      cellClassName:
        "w-[18%] py-3.5 px-4 text-[14px] text-slate-600 whitespace-normal break-words",
    },
    {
      key: "expand",
      label: "",
      sortable: false,
      headerClassName: "w-[8%] whitespace-nowrap",
      cellClassName: "w-[8%] py-3 px-4 text-right",
      render: (_, index) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpandedIndex((current) => (current === index ? null : index));
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
          aria-label={expandedIndex === index ? "Show less" : "Show more"}
        >
          {expandedIndex === index ? (
            <ChevronUp size={15} />
          ) : (
            <ChevronDown size={15} />
          )}
        </button>
      ),
    },
  ];

  const tableRows = filteredLogs.map((log) => ({
    ...log,
    loginDate: log.loginAt.split(" ")[0],
    loginTime: log.loginAt.split(" ")[1],
  }));

  return (
    <div className=" space-y-6">
      {/* PAGE HEADING — uses shared Heading component */}
      <Grid cols={12} gap={2}>
        <Heading
          primaryText="Login Logs"
          secondaryText="— Access History"
          size={12}
        />
      </Grid>

      {/* STAT CARDS — uses shared DashGrid + DashCard */}
      <DashGrid cols={12} gap={4}>
        <DashCard
          title="Total Logins"
          value={String(totalLogins)}
          icon={<Shield size={22} />}
          accentColor="#2a465a"
          size={3}
        />
        <DashCard
          title="Today's Logins"
          value={String(todayLogins)}
          icon={<Clock size={22} />}
          accentColor="#3b82f6"
          size={3}
        />
        <DashCard
          title="Active Roles"
          value={String(uniqueRoles)}
          icon={<Shield size={22} />}
          accentColor="#14b8a6"
          size={3}
        />
        <DashCard
          title="Unique Locations"
          value={String(uniqueCities)}
          icon={<MapPin size={22} />}
          accentColor="#8b5cf6"
          size={3}
        />
      </DashGrid>

      {/* FILTERS + EXPORT — uses shared Grid, Select, Option, Button */}
      <Grid cols={12} gap={4}>
        {/* Role filter */}
        <Select
          id="role-filter"
          size={3}
          value={roleFilter}
          placeholder="All roles"
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setExpandedIndex(null);
          }}
        >
          <Option value="" label="All roles" />
          {roleOptions.map((role) => (
            <Option key={role} value={role} label={role} />
          ))}
        </Select>

        {/* Department filter */}
        <Select
          id="dept-filter"
          size={3}
          value={deptFilter}
          placeholder="All departments"
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setExpandedIndex(null);
          }}
        >
          <Option value="" label="All departments" />
          <Option value="Sales" label="Sales" />
          <Option value="Management" label="Management" />
          <Option value="Finance" label="Finance" />
          <Option value="Admin" label="Admin" />
        </Select>

        {/* Date filter */}
        <Select
          id="date-filter"
          size={3}
          value={dateFilter}
          placeholder="All time"
          onChange={(e) => {
            setDateFilter(e.target.value);
            setExpandedIndex(null);
          }}
        >
          <Option value="" label="All time" />
          <Option value="today" label="Today" />
          {yesterdayDate ? (
            <Option value="yesterday" label="Yesterday" />
          ) : null}        </Select>

        {/* Export CSV button */}
        <Button
          text="Export CSV"
          size={3}
          variant="secondary"
          onClick={() => exportCSV(filteredLogs)}
        />
      </Grid>

      {/* DATA TABLE — uses shared DataTable */}
      <Grid cols={12} gap={4}>
        <DataTable
          columns={columns}
          rows={tableRows}
          size={12}
          pageSize={10}
          searchable={true}
          title="Login Records"
          wrapperClassName="overflow-hidden "
          tableClassName="table-fixed"
          expandedRowRender={(row, index) =>
            expandedIndex === index ? (
              <div className="grid grid-cols-1 gap-5 border-b border-slate-100 bg-slate-50/90 px-5 py-5 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Date
                  </p>
                  <p className="text-[15px] font-medium text-slate-700">
                    {row.loginDate}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Time
                  </p>
                  <p className="text-[15px] font-medium text-slate-700">
                    {row.loginTime}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Latitude
                  </p>
                  <p className="text-[15px] font-medium text-slate-700">
                    {row.lat}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Longitude
                  </p>
                  <p className="text-[15px] font-medium text-slate-700">
                    {row.lng}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    IP Address
                  </p>
                  <p className="text-[15px] font-medium text-slate-700 break-all">
                    {row.ip}
                  </p>
                </div>
              </div>
            ) : null
          }
        />
      </Grid>
    </div>
  );
};

export default LoginLogs;
