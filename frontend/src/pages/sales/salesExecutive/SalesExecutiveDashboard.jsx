import { useState } from "react";
import {
    Grid,
    Heading,
    DashCard,
    GAreaChart,
    GPieChart,
    DataTable,
    Button,
} from "../../../components/shared/Common_Components";
import {
    Users,
    TrendingUp,
    Target,
    DollarSign,
    CheckCircle2,
    Clock,
} from "lucide-react";

const leadsTrendData = [
    { name: "Jan", leads: 42 }, { name: "Feb", leads: 68 },
    { name: "Mar", leads: 55 }, { name: "Apr", leads: 94 },
];

const funnelData = [
    { name: "Contacted", value: 380 },
    { name: "Interested", value: 220 },
    { name: "Converted", value: 110 },
    { name: "Dump", value: 130 },
];

const leadCols = [
    { key: "lead", label: "Lead Name" },
    { key: "contact", label: "Contact" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
];

const leadRows = [
    { lead: "Nexus Retail", contact: "+91 98001 11234", status: "In Progress", date: "2026-04-22" },
    { lead: "BlueWave Pvt Ltd", contact: "+91 98002 22345", status: "Completed", date: "2026-04-22" },
];

export default function SalesExecutiveDashboard() {
    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
            <Grid cols={12} gap={4}>
                <Heading
                    primaryText="Sales Executive Dashboard"
                    secondaryText="Your performance and leads overview"
                    fontSize="2xl"
                    size={12}
                />
            </Grid>

            <Grid cols={12} gap={4}>
                <DashCard title="My Leads" value="148" icon={<Users size={20} />} accentColor="#3b82f6" size={3} />
                <DashCard title="Converted" value="42" icon={<CheckCircle2 size={20} />} accentColor="#22c55e" size={3} />
                <DashCard title="Conv. Rate" value="28.4%" icon={<TrendingUp size={20} />} accentColor="#8b5cf6" size={3} />
                <DashCard title="Revenue" value="₹1,86,000" icon={<DollarSign size={20} />} accentColor="#14b8a6" size={3} />
                <DashCard title="Target Achieved" value="93%" icon={<Target size={20} />} accentColor="#f59e0b" size={3} />
                <DashCard title="Pending Follow-ups" value="12" icon={<Clock size={20} />} accentColor="#38bdf8" size={3} />
            </Grid>

            <Grid cols={12} gap={4}>
                <GAreaChart
                    title="My Leads Trend"
                    subtitle="Monthly leads assigned"
                    data={leadsTrendData}
                    areas={[{ key: "leads", label: "Leads", color: "#3b82f6" }]}
                    size={8}
                    height={300}
                />
                <GPieChart
                    title="My Pipeline"
                    subtitle="Lead status breakdown"
                    data={funnelData}
                    colors={["#8b5cf6", "#22c55e", "#14b8a6", "#f43f5e"]}
                    size={4}
                    height={300}
                />
            </Grid>

            <Grid cols={12} gap={4}>
                <DataTable
                    title="My Recent Leads"
                    columns={leadCols}
                    rows={leadRows}
                    size={12}
                    pageSize={5}
                />
            </Grid>
        </div>
    );
}