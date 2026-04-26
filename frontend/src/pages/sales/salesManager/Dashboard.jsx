import { useState } from "react";
import {
    Grid,
    Heading,
    DashCard,
    GAreaChart,
    GLineChart,
    GColumnChart,
    GBarChart,
    GDoughnutChart,
    GPieChart,
    GRadarChart,
    DataTable,
    Modal,
    ModalData,
    ModalProfile,
    ModalGrid,
    Button,
    openModal,
    closeModal,
} from "../../../components/shared/Common_Components";
import {
    Users,
    TrendingUp,
    Target,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Clock,
    UserCheck,
    Eye,
    CalendarClock,
    Pencil,
    Trash2,
    Download,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

// Leads trend — monthly
const leadsTrendData = [
    { name: "Jan", leads: 142 }, { name: "Feb", leads: 168 },
    { name: "Mar", leads: 155 }, { name: "Apr", leads: 194 },
    { name: "May", leads: 221 }, { name: "Jun", leads: 208 },
    { name: "Jul", leads: 247 }, { name: "Aug", leads: 263 },
    { name: "Sep", leads: 289 }, { name: "Oct", leads: 274 },
    { name: "Nov", leads: 312 }, { name: "Dec", leads: 338 },
];

// Conversion funnel
const funnelData = [
    { name: "Contacted", value: 980 },
    { name: "Interested", value: 620 },
    { name: "Converted", value: 310 },
    { name: "Dump", value: 330 },
];

// Team performance — leads handled, conversions, revenue (₹K)
const teamPerfData = [
    { name: "Riya S.", leads: 148, conversions: 42, revenue: 186 },
    { name: "Arjun M.", leads: 132, conversions: 38, revenue: 162 },
    { name: "Priya K.", leads: 121, conversions: 31, revenue: 138 },
    { name: "Karan V.", leads: 109, conversions: 27, revenue: 119 },
    { name: "Sneha P.", leads: 98, conversions: 22, revenue: 97 },
    { name: "Rohit D.", leads: 87, conversions: 18, revenue: 81 },
];

// Target vs Achieved (₹K)
const targetData = [
    { name: "Riya S.", target: 200, achieved: 186 },
    { name: "Arjun M.", target: 180, achieved: 162 },
    { name: "Priya K.", target: 160, achieved: 138 },
    { name: "Karan V.", target: 140, achieved: 119 },
    { name: "Sneha P.", target: 120, achieved: 97 },
    { name: "Rohit D.", target: 100, achieved: 81 },
];

// Follow-up status
const followupData = [
    { name: "Completed", value: 312 },
    { name: "Pending", value: 87 },
    { name: "Missed", value: 43 },
];

// Radar — team skill overview
const teamRadarData = [
    { subject: "Leads", riya: 92, arjun: 84 },
    { subject: "Conversion", riya: 88, arjun: 79 },
    { subject: "Follow-ups", riya: 76, arjun: 91 },
    { subject: "Revenue", riya: 93, arjun: 81 },
    { subject: "Retention", riya: 80, arjun: 86 },
    { subject: "Response", riya: 85, arjun: 88 },
];

// Top performers table — only summary columns shown in the table
const performerCols = [
    { key: "name",   label: "Employee" },
    { key: "leads",  label: "Leads" },
    { key: "revenue",label: "Revenue" },
    { key: "status", label: "Status" },
];

// Full row data — extra fields shown only in the View modal
const performerRows = [
    {
        name: "Riya Sharma",       role: "Senior Executive",  region: "Mumbai",
        phone: "+91 98101 11001",  email: "riya.sharma@crm.in",
        joinDate: "2023-03-15",    leads: "148",  openLeads: "12",
        conversions: "42",         convRate: "28.4%",
        revenue: "₹1,86,000",     avgDeal: "₹4,428",
        target: "₹2,00,000",      targetPct: "93%",
        followupsDone: "61",       followupsMissed: "4",
        lastActivity: "2026-04-22", status: "Completed",
    },
    {
        name: "Arjun Mehta",       role: "Senior Executive",  region: "Delhi",
        phone: "+91 98102 22002",  email: "arjun.mehta@crm.in",
        joinDate: "2023-06-01",    leads: "132",  openLeads: "9",
        conversions: "38",         convRate: "28.8%",
        revenue: "₹1,62,000",     avgDeal: "₹4,263",
        target: "₹1,80,000",      targetPct: "90%",
        followupsDone: "54",       followupsMissed: "3",
        lastActivity: "2026-04-22", status: "Completed",
    },
    {
        name: "Priya Kulkarni",    role: "Executive",         region: "Pune",
        phone: "+91 98103 33003",  email: "priya.kulkarni@crm.in",
        joinDate: "2023-09-10",    leads: "121",  openLeads: "14",
        conversions: "31",         convRate: "25.6%",
        revenue: "₹1,38,000",     avgDeal: "₹4,451",
        target: "₹1,60,000",      targetPct: "86%",
        followupsDone: "48",       followupsMissed: "7",
        lastActivity: "2026-04-21", status: "Completed",
    },
    {
        name: "Karan Verma",       role: "Executive",         region: "Bangalore",
        phone: "+91 98104 44004",  email: "karan.verma@crm.in",
        joinDate: "2024-01-20",    leads: "109",  openLeads: "18",
        conversions: "27",         convRate: "24.8%",
        revenue: "₹1,19,000",     avgDeal: "₹4,407",
        target: "₹1,40,000",      targetPct: "85%",
        followupsDone: "41",       followupsMissed: "9",
        lastActivity: "2026-04-21", status: "In Progress",
    },
    {
        name: "Sneha Patil",       role: "Junior Executive",  region: "Hyderabad",
        phone: "+91 98105 55005",  email: "sneha.patil@crm.in",
        joinDate: "2024-04-05",    leads: "98",   openLeads: "21",
        conversions: "22",         convRate: "22.4%",
        revenue: "₹97,000",       avgDeal: "₹4,409",
        target: "₹1,20,000",      targetPct: "81%",
        followupsDone: "36",       followupsMissed: "11",
        lastActivity: "2026-04-20", status: "In Progress",
    },
    {
        name: "Rohit Desai",       role: "Junior Executive",  region: "Chennai",
        phone: "+91 98106 66006",  email: "rohit.desai@crm.in",
        joinDate: "2024-06-12",    leads: "87",   openLeads: "24",
        conversions: "18",         convRate: "20.7%",
        revenue: "₹81,000",       avgDeal: "₹4,500",
        target: "₹1,00,000",      targetPct: "81%",
        followupsDone: "29",       followupsMissed: "14",
        lastActivity: "2026-04-19", status: "In Progress",
    },
];

// Recent leads table
const leadCols = [
    { key: "lead", label: "Lead Name" },
    { key: "contact", label: "Contact" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
];
const leadRows = [
    { lead: "Nexus Retail", contact: "+91 98001 11234", assignedTo: "Riya Sharma", status: "In Progress", date: "2026-04-22" },
    { lead: "BlueWave Pvt Ltd", contact: "+91 98002 22345", assignedTo: "Arjun Mehta", status: "Completed", date: "2026-04-22" },
    { lead: "Orion Traders", contact: "+91 98003 33456", assignedTo: "Priya Kulkarni", status: "Pending", date: "2026-04-21" },
    { lead: "Apex Solutions", contact: "+91 98004 44567", assignedTo: "Karan Verma", status: "In Progress", date: "2026-04-21" },
    { lead: "Nova Enterprises", contact: "+91 98005 55678", assignedTo: "Sneha Patil", status: "Completed", date: "2026-04-20" },
    { lead: "Skyline Corp", contact: "+91 98006 66789", assignedTo: "Rohit Desai", status: "Failed", date: "2026-04-20" },
    { lead: "Pulse Media", contact: "+91 98007 77890", assignedTo: "Riya Sharma", status: "In Progress", date: "2026-04-19" },
    { lead: "Vortex Logistics", contact: "+91 98008 88901", assignedTo: "Arjun Mehta", status: "Pending", date: "2026-04-19" },
];

// Missed follow-ups table
const missedCols = [
    { key: "lead", label: "Lead Name" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "followupDate", label: "Follow-up Date" },
    { key: "status", label: "Status" },
];
const missedRows = [
    { lead: "Orion Traders", assignedTo: "Priya Kulkarni", followupDate: "2026-04-18", status: "Failed" },
    { lead: "Skyline Corp", assignedTo: "Rohit Desai", followupDate: "2026-04-17", status: "Failed" },
    { lead: "Delta Imports", assignedTo: "Karan Verma", followupDate: "2026-04-16", status: "Failed" },
    { lead: "Zenith Retail", assignedTo: "Sneha Patil", followupDate: "2026-04-15", status: "Failed" },
    { lead: "Crest Builders", assignedTo: "Rohit Desai", followupDate: "2026-04-14", status: "Failed" },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SalesManagerDashboard() {
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedPerformer, setSelectedPerformer] = useState(null);
    const [selectedMissed, setSelectedMissed] = useState(null);

    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-6">

            {/* ── 1. Header ── */}
            <Grid cols={12} gap={4}>
                <Heading
                    primaryText="Sales Manager Dashboard"
                    secondaryText="Sales performance and team overview"
                    fontSize="2xl"
                    size={12}
                />
            </Grid>

            {/* ── 2. KPI Cards ── */}
            <Grid cols={12} gap={4}>
                <DashCard title="Total Leads" value="1,240" icon={<Users size={20} />} accentColor="#3b82f6" size={3} />
                <DashCard title="Converted Leads" value="310" icon={<CheckCircle2 size={20} />} accentColor="#22c55e" size={3} />
                <DashCard title="Conversion Rate" value="25%" icon={<TrendingUp size={20} />} accentColor="#8b5cf6" size={3} />
                <DashCard title="Total Revenue" value="₹7,83,000" icon={<DollarSign size={20} />} accentColor="#14b8a6" size={3} />
                <DashCard title="Target Achieved" value="87%" icon={<Target size={20} />} accentColor="#f59e0b" size={3} />
                <DashCard title="Pending Follow-ups" value="87" icon={<Clock size={20} />} accentColor="#38bdf8" size={3} />
                <DashCard title="Missed Follow-ups" value="43" icon={<AlertCircle size={20} />} accentColor="#f43f5e" size={3} />
                <DashCard title="Active Executives" value="6" icon={<UserCheck size={20} />} accentColor="#64748b" size={3} />
            </Grid>

            {/* ── 3. Leads Trend + Conversion Funnel ── */}
            <Grid cols={12} gap={4}>
                <GAreaChart
                    title="Leads Trend"
                    subtitle="Monthly leads generated this year"
                    data={leadsTrendData}
                    areas={[{ key: "leads", label: "Leads", color: "#3b82f6" }]}
                    size={8}
                    height={300}
                />
                <GPieChart
                    title="Conversion Funnel"
                    subtitle="Lead pipeline breakdown"
                    data={funnelData}
                    colors={["#8b5cf6", "#22c55e", "#14b8a6", "#f43f5e"]}
                    size={4}
                    height={300}
                />
            </Grid>

            {/* ── 4. Team Performance + Target vs Achieved ── */}
            <Grid cols={12} gap={4}>
                <GColumnChart
                    title="Team Performance"
                    subtitle="Leads handled, conversions & revenue (₹K) per executive"
                    data={teamPerfData}
                    bars={[
                        { key: "leads", label: "Leads", color: "#3b82f6" },
                        { key: "conversions", label: "Conversions", color: "#22c55e" },
                        { key: "revenue", label: "Revenue (₹K)", color: "#f59e0b" },
                    ]}
                    size={7}
                    height={300}
                />
                <GBarChart
                    title="Target vs Achieved"
                    subtitle="Revenue target vs actual (₹K) per executive"
                    data={targetData}
                    bars={[
                        { key: "target", label: "Target (₹K)", color: "#64748b" },
                        { key: "achieved", label: "Achieved (₹K)", color: "#22c55e" },
                    ]}
                    size={5}
                    height={300}
                />
            </Grid>

            {/* ── 5. Follow-up Status + Team Radar ── */}
            <Grid cols={12} gap={4}>
                <GDoughnutChart
                    title="Follow-up Status"
                    subtitle="Completed vs pending vs missed"
                    data={followupData}
                    colors={["#22c55e", "#f59e0b", "#f43f5e"]}
                    size={4}
                    height={300}
                />
                <GRadarChart
                    title="Top 2 Executives — Skill Radar"
                    subtitle="Riya Sharma vs Arjun Mehta across key metrics"
                    data={teamRadarData}
                    radars={[
                        { key: "riya", label: "Riya Sharma", color: "#3b82f6" },
                        { key: "arjun", label: "Arjun Mehta", color: "#f59e0b" },
                    ]}
                    size={4}
                    height={300}
                />
                <GLineChart
                    title="Monthly Conversions"
                    subtitle="Conversion count trend across the year"
                    data={[
                        { name: "Jan", conversions: 18 }, { name: "Feb", conversions: 22 },
                        { name: "Mar", conversions: 19 }, { name: "Apr", conversions: 27 },
                        { name: "May", conversions: 31 }, { name: "Jun", conversions: 29 },
                        { name: "Jul", conversions: 35 }, { name: "Aug", conversions: 38 },
                        { name: "Sep", conversions: 42 }, { name: "Oct", conversions: 39 },
                        { name: "Nov", conversions: 46 }, { name: "Dec", conversions: 51 },
                    ]}
                    lines={[{ key: "conversions", label: "Conversions", color: "#22c55e" }]}
                    size={4}
                    height={300}
                />
            </Grid>

            {/* ── 7. Top Performers Table ── */}
            <Grid cols={12} gap={4}>
                <DataTable
                    title="Top Performers"
                    columns={performerCols}
                    rows={performerRows}
                    pageSize={5}
                    bulkAction={true}
                    bulkActions={[
                        {
                            title: "Assign",
                            icon: <UserCheck size={13} />,
                            onClick: (selectedRows) => console.log("Assign", selectedRows),
                        },
                        {
                            title: "Delete",
                            icon: <Trash2 size={13} />,
                            onClick: (selectedRows) => console.log("Delete", selectedRows),
                        },
                        {
                            title: "Export",
                            icon: <Download size={13} />,
                            onClick: (selectedRows) => console.log("Export", selectedRows),
                        },
                    ]}
                    actions={[
                        {
                            icon: <Eye size={15} />,
                            tooltip: "View",
                            variant: "ghost",
                            onClick: (row) => { setSelectedPerformer(row); openModal("performer-view"); },
                        },
                    ]}
                    size={12}
                    date={false}
                    filters={[
                        { title: "Status", type: "toggle", key: "status", options: ["Completed", "In Progress"] },
                    ]}
                />
            </Grid>

            {/* ── 8. Recent Leads Table ── */}
            <Grid cols={12} gap={4}>
                <DataTable
                    title="Recent Leads"
                    columns={leadCols}
                    rows={leadRows}
                    actions={[
                        {
                            icon: <Eye size={15} />,
                            tooltip: "View",
                            variant: "ghost",
                            onClick: (row) => { setSelectedLead(row); openModal("lead-view"); },
                        },
                        {
                            icon: <Pencil size={15} />,
                            tooltip: "Edit",
                            variant: "primary",
                            onClick: (row) => { setSelectedLead(row); openModal("lead-edit"); },
                        },
                    ]}
                    size={12}
                    pageSize={5}
                    date={true}
                    onDateFilter={true}
                    filters={[
                        { title: "Status", type: "toggle", key: "status", options: ["Completed", "In Progress", "Pending", "Failed"] },
                        { title: "Assigned To", type: "select", key: "assignedTo", options: ["Riya Sharma", "Arjun Mehta", "Priya Kulkarni", "Karan Verma", "Sneha Patil", "Rohit Desai"] },
                    ]}
                />
            </Grid>

            {/* ── 9. Missed Follow-ups Table ── */}
            <Grid cols={12} gap={4}>
                <DataTable
                    title="Missed Follow-ups"
                    columns={missedCols}
                    rows={missedRows}
                    actions={[
                        {
                            icon: <Eye size={15} />,
                            tooltip: "View",
                            variant: "ghost",
                            onClick: (row) => { setSelectedMissed(row); openModal("missed-view"); },
                        },
                        {
                            icon: <CalendarClock size={15} />,
                            tooltip: "Reschedule",
                            variant: "primary",
                            onClick: (row) => { setSelectedMissed(row); openModal("missed-reschedule"); },
                        },
                    ]}
                    size={12}
                    pageSize={5}
                    date={false}
                    filters={[
                        { title: "Assigned To", type: "select", key: "assignedTo", options: ["Priya Kulkarni", "Rohit Desai", "Karan Verma", "Sneha Patil"] },
                    ]}
                />
            </Grid>

            {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

            {/* Performer: View — full details */}
            <Modal id="performer-view" title="Performer Details" size="xl">
                {selectedPerformer && (
                    <div className="flex flex-col gap-4">

                        <ModalProfile
                            name={selectedPerformer.name}
                            subtitle={`${selectedPerformer.role} · ${selectedPerformer.region}`}
                            meta={`Joined ${selectedPerformer.joinDate}`}
                        />

                        <ModalGrid title="Contact" cols={2}>
                            <ModalData label="Phone" value={selectedPerformer.phone} />
                            <ModalData label="Email" value={selectedPerformer.email} />
                        </ModalGrid>

                        <ModalGrid title="Lead Stats" cols={3}>
                            <ModalData label="Total Leads"       value={selectedPerformer.leads} />
                            <ModalData label="Open Leads"        value={selectedPerformer.openLeads} />
                            <ModalData label="Conversions"       value={selectedPerformer.conversions} />
                            <ModalData label="Conv. Rate"        value={selectedPerformer.convRate} />
                            <ModalData label="Follow-ups Done"   value={selectedPerformer.followupsDone} />
                            <ModalData label="Follow-ups Missed" value={selectedPerformer.followupsMissed} />
                        </ModalGrid>

                        <ModalGrid title="Revenue & Target" cols={2}>
                            <ModalData label="Revenue Generated" value={selectedPerformer.revenue} />
                            <ModalData label="Avg Deal Size"     value={selectedPerformer.avgDeal} />
                            <ModalData label="Target"            value={selectedPerformer.target} />
                            <ModalData label="Target Achieved"   value={selectedPerformer.targetPct} />
                        </ModalGrid>

                        <ModalGrid title="Activity" cols={2}>
                            <ModalData label="Last Activity" value={selectedPerformer.lastActivity} />
                            <ModalData label="Status"        value={selectedPerformer.status} />
                        </ModalGrid>

                        <div className="flex justify-end pt-1">
                            <Button text="Close" variant="ghost" size={2} onClick={() => closeModal("performer-view")} />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Lead: View */}
            <Modal id="lead-view" title="Lead Details" size="md">
                {selectedLead && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <ModalData label="Lead Name" value={selectedLead.lead} />
                            <ModalData label="Contact" value={selectedLead.contact} />
                            <ModalData label="Assigned To" value={selectedLead.assignedTo} />
                            <ModalData label="Status" value={selectedLead.status} />
                            <ModalData label="Date" value={selectedLead.date} />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("lead-view")} />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Lead: Edit */}
            <Modal id="lead-edit" title="Edit Lead" size="md">
                {selectedLead && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <ModalData label="Lead Name" value={selectedLead.lead} />
                            <ModalData label="Contact" value={selectedLead.contact} />
                            <ModalData label="Assigned To" value={selectedLead.assignedTo} />
                            <ModalData label="Status" value={selectedLead.status} />
                        </div>
                        <p className="text-xs text-slate-400">Full edit form connects to your lead update API.</p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("lead-edit")} />
                            <Button text="Save" variant="primary" size={3} onClick={() => closeModal("lead-edit")} />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Missed: View */}
            <Modal id="missed-view" title="Missed Follow-up Details" size="md">
                {selectedMissed && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <ModalData label="Lead Name" value={selectedMissed.lead} />
                            <ModalData label="Assigned To" value={selectedMissed.assignedTo} />
                            <ModalData label="Follow-up Date" value={selectedMissed.followupDate} />
                            <ModalData label="Status" value={selectedMissed.status} />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("missed-view")} />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Missed: Reschedule */}
            <Modal id="missed-reschedule" title="Reschedule Follow-up" size="sm">
                {selectedMissed && (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-slate-600">
                            Reschedule follow-up for{" "}
                            <span className="font-bold text-[#2a465a]">{selectedMissed.lead}</span>{" "}
                            assigned to <span className="font-bold text-[#2a465a]">{selectedMissed.assignedTo}</span>.
                        </p>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">New Date</label>
                            <input
                                type="date"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button text="Cancel" variant="ghost" size={4} onClick={() => closeModal("missed-reschedule")} />
                            <Button text="Reschedule" variant="primary" size={4} onClick={() => closeModal("missed-reschedule")} />
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
}
