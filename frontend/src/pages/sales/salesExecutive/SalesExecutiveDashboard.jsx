import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  PhoneCall,
  TrendingUp,
  DollarSign,
  Clock,
  Trash2,
  Plus,
  Upload,
  Ticket,
  UserPlus,
  Bell,
  Calendar,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  DashCard,
  EnhancedDashCard,
  DataTable,
  Heading,
  Grid,
  DashGrid,
  GLineChart,
  GBarChart,
  GDoughnutChart,
  Button,
} from "../../../components/shared/Common_Components";

const SalesExecutiveDashboard = () => {
  const navigate = useNavigate();

  // Dummy Data for Charts
  const weeklySalesData = [
    { name: "Mon", leads: 45, closed: 12 },
    { name: "Tue", leads: 52, closed: 15 },
    { name: "Wed", leads: 48, closed: 18 },
    { name: "Thu", leads: 61, closed: 22 },
    { name: "Fri", leads: 55, closed: 20 },
    { name: "Sat", leads: 32, closed: 8 },
    { name: "Sun", leads: 25, closed: 5 },
  ];

  const callConversionData = [
    { name: "Week 1", calls: 120, conversions: 25 },
    { name: "Week 2", calls: 150, conversions: 32 },
    { name: "Week 3", calls: 110, conversions: 28 },
    { name: "Week 4", calls: 180, conversions: 45 },
  ];

  const leadStatusData = [
    { name: "New", value: 40 },
    { name: "Contacted", value: 30 },
    { name: "Qualified", value: 20 },
    { name: "Closed", value: 10 },
  ];

  // Dummy Data for Table
  const recentActivities = [
    {
      id: 1,
      leadName: "John Doe",
      status: "Hot",
      executive: "Alex Johnson",
      lastFollowUp: "2024-05-01",
      nextReminder: "2024-05-04",
      priority: "High",
    },
    {
      id: 2,
      leadName: "Jane Smith",
      status: "Warm",
      executive: "Alex Johnson",
      lastFollowUp: "2024-05-02",
      nextReminder: "2024-05-05",
      priority: "Medium",
    },
    {
      id: 3,
      leadName: "Robert Brown",
      status: "Cold",
      executive: "Alex Johnson",
      lastFollowUp: "2024-04-30",
      nextReminder: "2024-05-06",
      priority: "Low",
    },
    {
      id: 4,
      leadName: "Emily Davis",
      status: "Interested",
      executive: "Alex Johnson",
      lastFollowUp: "2024-05-03",
      nextReminder: "2024-05-03",
      priority: "High",
    },
  ];

  const columns = [
    { key: "leadName", label: "Lead Name" },
    { key: "status", label: "Status" },
    { key: "executive", label: "Executive" },
    { key: "lastFollowUp", label: "Last Follow-up" },
    { key: "nextReminder", label: "Next Reminder" },
    { key: "priority", label: "Priority" },
  ];

  return (
    <div className="p-1 space-y-8 animate-in fade-in duration-700">
      {/* DASHBOARD HEADING */}
      <Heading
        primaryText="Sales Executive "
        secondaryText="Dashboard"
        showAnimations={true}
      />

<<<<<<< HEAD
      {/* TOP KPI CARDS */}
      <DashGrid cols={12} gap={4}>
        <DashCard
          title="Total Leads"
          value="1,284"
          icon={<Users />}
          accentColor="#3b82f6"
          size={4}
        />
        <DashCard
          title="Today Calls"
          value="42"
          icon={<PhoneCall />}
          accentColor="#8b5cf6"
          size={4}
        />
        <DashCard
          title="Conversion Rate"
          value="18.5%"
          icon={<TrendingUp />}
          accentColor="#10b981"
          size={4}
        />
        <DashCard
          title="Revenue Generated"
          value="$124,500"
          icon={<DollarSign />}
          accentColor="#f59e0b"
          size={4}
        />
        <DashCard
          title="Pending Follow-ups"
          value="12"
          icon={<Clock />}
          accentColor="#ef4444"
          size={4}
        />
        <DashCard
          title="Dump Leads"
          value="342"
          icon={<Trash2 />}
          accentColor="#64748b"
          size={4}
        />
      </DashGrid>
=======
      {/* ── FOLLOW-UPS SECTION ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-6 bg-[#f43f5e] rounded-full" />
          <h2 className="text-lg font-bold text-[#2a465a] uppercase tracking-wider">Follow-Ups</h2>
        </div>
        <DashGrid cols={12} gap={4}>
          <EnhancedDashCard
            title="Today Follow-Ups"
            value="42"
            icon={<PhoneCall size={22} />}
            accentColor="#f43f5e"
            size={3}
          />
          <EnhancedDashCard
            title="Pending Follow-Ups"
            value="12"
            icon={<Clock size={22} />}
            accentColor="#ef4444"
            size={3}
          />
          <EnhancedDashCard
            title="Missed Follow-Ups"
            value="05"
            icon={<AlertCircle size={22} />}
            accentColor="#64748b"
            size={3}
          />
          <EnhancedDashCard
            title="Upcoming Follow-Ups"
            value="28"
            icon={<Calendar size={22} />}
            accentColor="#38bdf8"
            size={3}
          />
        </DashGrid>
      </div>
>>>>>>> 48e512a (Fixed the changes and added new followups)

      {/* CHARTS & WIDGETS SECTION */}
      <Grid cols={12} gap={6}>
        {/* Weekly Prospect Trend */}
        <div className="col-span-12 lg:col-span-8">
          <GLineChart
            title="Weekly Prospect Trend"
            subtitle="Comparison of New Prospects vs Conversions"
            data={weeklySalesData}
            lines={[
              { key: "leads", label: "New Prospects", color: "#3b82f6" },
              { key: "closed", label: "Conversions", color: "#10b981" },
            ]}
            size={12}
            height={320}
          />
        </div>

        {/* Today's Target Progress */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#2a465a]/5 rounded-full blur-3xl group-hover:bg-[#2a465a]/10 transition-colors duration-500"></div>
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#2a465a]">Daily Target</h3>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                  85% Done
                </span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                    <span>Calls Made</span>
                    <span>36/40</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "90%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                    <span>Prospects Converted</span>
                    <span>4/5</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                    <span>Follow-ups</span>
                    <span>12/15</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("prospects")}
              className="mt-8 w-full py-3 bg-[#2a465a] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1e3a52] transition-colors shadow-lg shadow-[#2a465a]/20">
              View Full Report <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Prospect Status Distribution */}
        <div className="col-span-12 lg:col-span-4">
          <GDoughnutChart
            title="Prospect Distribution"
            subtitle="By Current Interest Level"
            data={leadStatusData}
            colors={["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"]}
            size={12}
            height={300}
          />
        </div>

        {/* Calls vs Conversion */}
        <div className="col-span-12 lg:col-span-8">
          <GBarChart
            title="Calls vs Conversion"
            subtitle="Weekly performance breakdown"
            data={callConversionData}
            bars={[
              { key: "calls", label: "Total Calls", color: "#64748b" },
              { key: "conversions", label: "Conversions", color: "#3b82f6" },
            ]}
            size={12}
            height={300}
          />
        </div>
      </Grid>

      {/* Recent Activity Table */}
      <DataTable
        title="Recent Prospect Activity"
        columns={columns}
        rows={recentActivities}
        pageSize={5}
        searchable={true}
        size={12}
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Hot", "Warm", "Cold", "Interested"] },
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High"] },
        ]}
      />

      {/* Upcoming Reminders Widget */}
      <Grid cols={12}>
        <div className="col-span-12">
          <div className="bg-[#2a465a] rounded-3xl p-6 shadow-xl shadow-[#2a465a]/20 text-white relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calendar size={80} />
            </div>
            <h3 className="text-lg font-bold mb-4 relative z-10">Upcoming Reminders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
              <div className="flex gap-3 items-start border-l-2 border-emerald-400 pl-3">
                <div>
                  <p className="text-sm font-bold">Follow up with John</p>
                  <p className="text-xs text-slate-300">Today, 2:30 PM</p>
                </div>
              </div>
              <div className="flex gap-3 items-start border-l-2 border-amber-400 pl-3">
                <div>
                  <p className="text-sm font-bold">Proposal Review - Globex</p>
                  <p className="text-xs text-slate-300">Tomorrow, 10:00 AM</p>
                </div>
              </div>
              <div className="flex gap-3 items-start border-l-2 border-blue-400 pl-3">
                <div>
                  <p className="text-sm font-bold">Team Sync Meeting</p>
                  <p className="text-xs text-slate-300">May 5, 11:30 AM</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => navigate("leads")}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">
                  View All Reminders
                </button>
              </div>
            </div>
          </div>
        </div>
      </Grid>
    </div>
  );
};

export default SalesExecutiveDashboard;
