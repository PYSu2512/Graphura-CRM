import React, { useState } from "react";
import {
  Grid,
  Heading,
  DataField,
  SelectField,
  Option,
  Button,
  DataTable,
  GBarChart,
  DashCard,
  GDoughnutChart,
  GColumnChart,
  GLineChart,
  GPieChart,
  GRadarChart,
  GAreaChart,
} from "./Commons";
import { TrendingDown, Users } from "lucide-react";

const Page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState("");
  const [address, setAddress] = useState("");

  // Sample employee data
  const [employees, setEmployees] = useState([
    { name: "John Doe", dept: "Engineering" },
    { name: "Jane Smith", dept: "Sales" },
    { name: "Bob Johnson", dept: "HR" },
    { name: "John Doe", dept: "Engineering" },
    { name: "Jane Smith", dept: "Sales" },
    { name: "Bob Johnson", dept: "HR" },
    { name: "John Doe", dept: "Engineering" },
    { name: "Jane Smith", dept: "Sales" },
    { name: "Bob Johnson", dept: "HR" },
    { name: "John Doe", dept: "Engineering" },
    { name: "Jane Smith", dept: "Sales" },
    { name: "Bob Johnson", dept: "HR" },
  ]);

  const data = [
    { name: "Sales", target: 120, achieved: 95 },
    { name: "Support", target: 80, achieved: 78 },
    { name: "HR", target: 40, achieved: 42 },
  ];

  const handleEdit = (row) => {
    console.log("Edit employee:", row);
    // Implement edit logic here
  };

  const handleDelete = (row) => {
    console.log("Delete employee:", row);
    // Implement delete logic here
  };

  const revenueData = [
    { name: "Mon", revenue: 4000, users: 2400 },
    { name: "Tue", revenue: 3000, users: 1398 },
    { name: "Wed", revenue: 2000, users: 9800 },
    { name: "Thu", revenue: 2780, users: 3908 },
    { name: "Fri", revenue: 1890, users: 4800 },
  ];

  const categoryData = [
    { name: "Engineering", value: 400 },
    { name: "Sales", value: 300 },
    { name: "Marketing", value: 300 },
    { name: "HR", value: 200 },
  ];

  const pieData = [
    { name: "Direct", value: 540 },
    { name: "Organic", value: 320 },
    { name: "Paid", value: 210 },
    { name: "Referral", value: 130 },
  ];

  const radardata = [
    { subject: "Sales", teamA: 80, teamB: 65 },
    { subject: "Support", teamA: 90, teamB: 72 },
    { subject: "Dev", teamA: 70, teamB: 85 },
    { subject: "Design", teamA: 60, teamB: 78 },
    { subject: "Marketing", teamA: 85, teamB: 55 },
    { subject: "Finance", teamA: 75, teamB: 90 },
  ];

    const areadata = [
    { name: "Jan", visits: 2400, signups: 400 },
    { name: "Feb", visits: 1398, signups: 210 },
    { name: "Mar", visits: 5800, signups: 890 },
    { name: "April", visits: 2400, signups: 400 },
    { name: "May", visits: 1398, signups: 210 },
    { name: "June", visits: 5800, signups: 890 },
    { name: "July", visits: 2400, signups: 400 },
    { name: "Aug", visits: 1398, signups: 210 },
    { name: "Sep", visits: 5800, signups: 890 },
    { name: "Oct", visits: 2400, signups: 400 },
    { name: "Nov", visits: 1398, signups: 210 },
    { name: "Dec", visits: 5800, signups: 890 },
  ];

  const linedata = [
    { name: "Jan", revenue: 4000, cost: 2400 },
    { name: "Feb", revenue: 3000, cost: 1398 },
    { name: "Mar", revenue: 5000, cost: 3200 },
    { name: "April", revenue: 4000, cost: 2400 },
    { name: "May", revenue: 3000, cost: 1398 },
    { name: "June", revenue: 5000, cost: 3200 },
    { name: "July", revenue: 4000, cost: 2400 },
    { name: "Aug", revenue: 3000, cost: 1398 },
    { name: "Sep", revenue: 5000, cost: 3200 },
    { name: "Oct", revenue: 4000, cost: 2400 },
    { name: "Nov", revenue: 3000, cost: 1398 },
    { name: "Dec", revenue: 5000, cost: 3200 },
  ];


  return (
    <Grid cols={12} gap={4}>
      <Heading
        primaryText="Add New Employee"
        secondaryText="Fill all fields below"
        size={12}
      />
      <DashCard
        title="Total Employees"
        value="313"
        icon={<Users size={22} />}
        accentColor="#3b82f6"
        size={4}
      />

      <DashCard
        title="Churn Rate"
        value="4.2%"
        icon={<TrendingDown size={22} />}
        accentColor="#f43f5e"
        size={4}
      />
      <DashCard
        title="Churn Rate"
        value="4.2%"
        icon={<TrendingDown size={22} />}
        accentColor="#f43f5e"
        size={4}
      />
      {/* <DashCard
        title="Churn Rate"
        value="4.2%"
        icon={<TrendingDown size={22} />}
        accentColor="#f43f5e"
        size={3}
      /> */}
      <DataField
        label="Full Name"
        id="name"
        size={6}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <DataField
        label="Work Email"
        id="email"
        type="email"
        size={6}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <DataField
        label="Phone Number"
        id="phone"
        type="tel"
        size={4}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <SelectField
        label="Department"
        id="dept"
        size={4}
        value={dept}
        onChange={(e) => setDept(e.target.value)}
      >
        <Option value="engineering" label="Engineering" />
        <Option value="sales" label="Sales" />
        <Option value="hr" label="Human Resources" />
      </SelectField>
      <DataField
        label="Office Address"
        id="address"
        size={4}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Button text="Save Employee →" type="submit" size={6} variant="primary" />
      <Button text="Cancel" size={6} variant="secondary" link="/employees" />
      <DataTable
        title="Employee Directory"
        pageSize={5}
        pageSizeOptions={[5, 10, 50, 500, 5000]}
        columns={[
          { key: "name", label: "Name" },
          { key: "dept", label: "Dept" },
          { key: "name_2", label: "Name" },
          { key: "dept_2", label: "Dept" },
        ]}
        rows={employees}
        actions={[
          {
            label: "Edit",
            variant: "primary",
            onClick: (row) => handleEdit(row),
          },
          {
            label: "Remove",
            variant: "danger",
            onClick: (row) => handleDelete(row),
          },
        ]}
        size={6}
      />
      <DataTable
        title="Employee Directory"
        pageSize={5}
        pageSizeOptions={[5, 10, 50, 500, 5000]}
        columns={[
          { key: "name", label: "Name" },
          { key: "dept", label: "Dept" },
        ]}
        rows={employees}
        actions={[
          {
            label: "Edit",
            variant: "primary",
            onClick: (row) => handleEdit(row),
          },
          {
            label: "Remove",
            variant: "danger",
            onClick: (row) => handleDelete(row),
          },
        ]}
        size={6}
      />
      <GBarChart
        title="Department Performance"
        subtitle="Target vs Achieved"
        data={data}
        bars={[
          { key: "target", label: "Target", color: "#64748b" },
          { key: "achieved", label: "Achieved", color: "#3b82f6" },
        ]}
        size={4}
      />
      <GLineChart
        size={4}
        title="Weekly Revenue"
        subtitle="Revenue vs Users"
        data={revenueData}
        lines={[
          { key: "revenue", color: "#3b82f6", label: "Revenue ($)" },
          { key: "users", color: "#10b981", label: "Active Users" },
        ]}
      />

      {/* 2. Column Chart */}
      <GColumnChart
        size={4}
        title="Daily Performance"
        data={revenueData}
        bars={[{ key: "revenue", color: "#b9b9b9ff", label: "Profit" }]}
      />

      {/* 3. Doughnut Chart */}
      <GDoughnutChart
        size={4}
        title="Staff Distribution"
        subtitle="By Department"
        data={categoryData}
        innerRadius={70}
      />

      <GPieChart
        title="Traffic Sources"
        data={pieData}
        colors={["#3b82f6", "#14b8a6", "#f59e0b", "#8b5cf6"]}
        size={4}
        height={260}
      />

      <GRadarChart
        title="Team Performance"
        subtitle="Skill comparison"
        data={radardata}
        radars={[
          { key: "teamA", label: "Team A", color: "#3b82f6" },
          { key: "teamB", label: "Team B", color: "#f43f5e" },
        ]}
        size={4}
        height={280}
      />

      <GAreaChart
        title="Website Traffic"
        subtitle="Visits & Signups"
        data={areadata}
        areas={[
          { key: "visits", label: "Visits", color: "#38bdf8" },
          { key: "signups", label: "Signups", color: "#22c55e" },
        ]}
        stacked={false}
        size={6}
        height={260}
      />

      <GLineChart
    title="Revenue vs Cost"
    subtitle="Monthly breakdown"
    data={linedata}
    lines={[
      { key: "revenue", label: "Revenue", color: "#3b82f6" },
      { key: "cost",    label: "Cost",    color: "#f43f5e" },
    ]}
    size={6}
    height={260}
  />
    </Grid>
  );
};

export default Page;
