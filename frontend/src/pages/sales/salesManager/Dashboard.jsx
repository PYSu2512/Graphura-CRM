import { useState, useEffect, useCallback } from "react";
import {
    Grid,
    Heading,
    EnhancedDashCard,
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
    CheckCircle2,
    AlertCircle,
    Clock,
    UserCheck,
    Eye,
    CalendarClock,
    Pencil,
    RefreshCw,
} from "lucide-react";
import { salesManagerDashboardService } from "../../../services/salesManagerDashboardService";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
        />
    );
}

function ErrorBanner({ message, onRetry }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1">{message}</span>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-1 text-xs font-medium underline"
                >
                    <RefreshCw size={12} /> Retry
                </button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// TABLE COLUMN DEFINITIONS
// ─────────────────────────────────────────────────────────────

const performerCols = [
    { key: "name",        label: "Employee"     },
    { key: "leads",       label: "Leads"        },
    { key: "conversions", label: "Conversions"  },
    { key: "convRate",    label: "Conv. Rate"   },
    { key: "status",      label: "Status"       },
];

const leadCols = [
    { key: "lead",       label: "Lead Name"   },
    { key: "contact",    label: "Contact"     },
    { key: "assignedTo", label: "Assigned To" },
    { key: "status",     label: "Status"      },
    { key: "date",       label: "Date"        },
];

const missedCols = [
    { key: "lead",         label: "Lead Name"      },
    { key: "assignedTo",   label: "Assigned To"    },
    { key: "followupDate", label: "Follow-up Date" },
    { key: "status",       label: "Status"         },
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function SalesManagerDashboard() {
    const [data,              setData]              = useState(null);
    const [loading,           setLoading]           = useState(true);
    const [error,             setError]             = useState(null);
    const [selectedLead,      setSelectedLead]      = useState(null);
    const [selectedPerformer, setSelectedPerformer] = useState(null);
    const [selectedMissed,    setSelectedMissed]    = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await salesManagerDashboardService.getSummary();
            setData(result);
        } catch (err) {
            setError(err?.message || "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Radar config — labels come from API ──
    const radarConfig = data
        ? [
              {
                  key:   "exec1",
                  label: data.exec1Label || "Executive 1",
                  color: "#3b82f6",
              },
              {
                  key:   "exec2",
                  label: data.exec2Label || "Executive 2",
                  color: "#f59e0b",
              },
          ]
        : [];

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

            {/* ── Error Banner ── */}
            {error && (
                <Grid cols={12} gap={4}>
                    <div className="col-span-12">
                        <ErrorBanner message={error} onRetry={fetchData} />
                    </div>
                </Grid>
            )}

            {/* ── 2. KPI Cards ── */}
            <Grid cols={12} gap={4}>
                {loading ? (
                    <>
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className={i < 4 ? "col-span-3" : "col-span-4"}>
                                <Skeleton className="h-28 w-full" />
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <EnhancedDashCard
                            title="Total Leads"
                            value={data?.kpis.totalLeads ?? 0}
                            icon={<Users size={20} />}
                            accentColor="#3b82f6"
                            size={3}
                        />
                        <EnhancedDashCard
                            title="Converted Leads"
                            value={data?.kpis.convertedLeads ?? 0}
                            icon={<CheckCircle2 size={20} />}
                            accentColor="#22c55e"
                            size={3}
                        />
                        <EnhancedDashCard
                            title="Conversion Rate"
                            value={`${data?.kpis.conversionRate ?? 0}%`}
                            icon={<TrendingUp size={20} />}
                            accentColor="#8b5cf6"
                            size={3}
                        />
                        <EnhancedDashCard
                            title="Target Achieved"
                            value={`${data?.kpis.targetAchievedPct ?? 0}%`}
                            icon={<Target size={20} />}
                            accentColor="#f59e0b"
                            size={3}
                        />
                        <EnhancedDashCard
                            title="Pending Follow-ups"
                            value={data?.kpis.pendingFollowUps ?? 0}
                            icon={<Clock size={20} />}
                            accentColor="#38bdf8"
                            size={4}
                        />
                        <EnhancedDashCard
                            title="Missed Follow-ups"
                            value={data?.kpis.missedFollowUps ?? 0}
                            icon={<AlertCircle size={20} />}
                            accentColor="#f43f5e"
                            size={4}
                        />
                        <EnhancedDashCard
                            title="Active Executives"
                            value={data?.kpis.activeExecutives ?? 0}
                            icon={<UserCheck size={20} />}
                            accentColor="#64748b"
                            size={4}
                        />
                    </>
                )}
            </Grid>

            {/* ── 3. Leads Trend + Conversion Funnel ── */}
            <Grid cols={12} gap={4}>
                {loading ? (
                    <>
                        <div className="col-span-8"><Skeleton className="h-72 w-full" /></div>
                        <div className="col-span-4"><Skeleton className="h-72 w-full" /></div>
                    </>
                ) : (
                    <>
                        <GAreaChart
                            title="Leads Trend"
                            subtitle="Monthly leads generated this year"
                            data={data?.leadsTrend || []}
                            areas={[{ key: "leads", label: "Leads", color: "#3b82f6" }]}
                            size={8}
                            height={300}
                        />
                        <GPieChart
                            title="Conversion Funnel"
                            subtitle="Lead pipeline breakdown"
                            data={data?.conversionFunnel || []}
                            colors={["#8b5cf6", "#22c55e", "#14b8a6", "#f43f5e", "#f59e0b", "#94a3b8"]}
                            size={4}
                            height={300}
                        />
                    </>
                )}
            </Grid>

            {/* ── 4. Team Performance + Target vs Achieved ── */}
            <Grid cols={12} gap={4}>
                {loading ? (
                    <>
                        <div className="col-span-7"><Skeleton className="h-72 w-full" /></div>
                        <div className="col-span-5"><Skeleton className="h-72 w-full" /></div>
                    </>
                ) : (
                    <>
                        <GColumnChart
                            title="Team Performance"
                            subtitle="Leads handled and conversions per executive"
                            data={data?.teamPerformance || []}
                            bars={[
                                { key: "leads",       label: "Leads",       color: "#3b82f6" },
                                { key: "conversions", label: "Conversions", color: "#22c55e" },
                            ]}
                            size={7}
                            height={300}
                        />
                        <GBarChart
                            title="Calls Target vs Achieved"
                            subtitle="Monthly calls target vs actual per executive"
                            data={data?.targetVsAchieved || []}
                            bars={[
                                { key: "target",   label: "Target",   color: "#64748b" },
                                { key: "achieved", label: "Achieved", color: "#22c55e" },
                            ]}
                            size={5}
                            height={300}
                        />
                    </>
                )}
            </Grid>

            {/* ── 5. Follow-up Status + Radar + Monthly Conversions ── */}
            <Grid cols={12} gap={4}>
                {loading ? (
                    <>
                        <div className="col-span-4"><Skeleton className="h-72 w-full" /></div>
                        <div className="col-span-4"><Skeleton className="h-72 w-full" /></div>
                        <div className="col-span-4"><Skeleton className="h-72 w-full" /></div>
                    </>
                ) : (
                    <>
                        <GDoughnutChart
                            title="Follow-up Status"
                            subtitle="Completed vs pending vs missed"
                            data={data?.followUpStatus || []}
                            colors={["#22c55e", "#f59e0b", "#f43f5e"]}
                            size={4}
                            height={300}
                        />
                        <GRadarChart
                            title="Top 2 Executives"
                            subtitle={
                                data?.exec1Label && data?.exec2Label
                                    ? `${data.exec1Label} vs ${data.exec2Label}`
                                    : "Top executives across key metrics"
                            }
                            data={data?.topExecutivesRadar || []}
                            radars={radarConfig}
                            size={4}
                            height={300}
                        />
                        <GLineChart
                            title="Monthly Conversions"
                            subtitle="Conversion count trend across the year"
                            data={data?.monthlyConversions || []}
                            lines={[{ key: "conversions", label: "Conversions", color: "#22c55e" }]}
                            size={4}
                            height={300}
                        />
                    </>
                )}
            </Grid>

            {/* ── 6. Top Performers Table ── */}
            <Grid cols={12} gap={4}>
                <DataTable
                    title="Top Performers"
                    columns={performerCols}
                    rows={data?.topPerformers || []}
                    exportable
                    exportFileName="Top_Performers"
                    pageSizeOptions={[5, 10, 30, 50]}
                    pageSize={5}
                    actions={[
                        {
                            icon:    <Eye size={15} />,
                            tooltip: "View",
                            variant: "ghost",
                            onClick: (row) => {
                                setSelectedPerformer(row);
                                openModal("performer-view");
                            },
                        },
                    ]}
                    filters={[
                        {
                            title:   "Status",
                            type:    "toggle",
                            key:     "status",
                            options: ["Active", "Inactive"],
                        },
                    ]}
                    size={12}
                    date={false}
                />
            </Grid>

            {/* ── 7. Recent Leads Table ── */}
            <Grid cols={12} gap={4}>
                <DataTable
                    title="Recent Leads"
                    columns={leadCols}
                    rows={data?.recentLeads || []}
                    actions={[
                        {
                            icon:    <Eye size={15} />,
                            tooltip: "View",
                            variant: "ghost",
                            onClick: (row) => {
                                setSelectedLead(row);
                                openModal("lead-view");
                            },
                        },
                        {
                            icon:    <Pencil size={15} />,
                            tooltip: "Edit",
                            variant: "primary",
                            onClick: (row) => {
                                setSelectedLead(row);
                                openModal("lead-edit");
                            },
                        },
                    ]}
                    size={12}
                    pageSize={5}
                    date={true}
                    onDateFilter={true}
                    filters={[
                        {
                            title:   "Status",
                            type:    "toggle",
                            key:     "status",
                            options: ["Completed", "In Progress", "Pending", "Failed"],
                        },
                    ]}
                />
            </Grid>

            {/* ── 8. Missed Follow-ups Table ── */}
            <Grid cols={12} gap={4}>
                <DataTable
                    title="Missed Follow-ups"
                    columns={missedCols}
                    rows={data?.missedFollowUps || []}
                    actions={[
                        {
                            icon:    <Eye size={15} />,
                            tooltip: "View",
                            variant: "ghost",
                            onClick: (row) => {
                                setSelectedMissed(row);
                                openModal("missed-view");
                            },
                        },
                        {
                            icon:    <CalendarClock size={15} />,
                            tooltip: "Reschedule",
                            variant: "primary",
                            onClick: (row) => {
                                setSelectedMissed(row);
                                openModal("missed-reschedule");
                            },
                        },
                    ]}
                    size={12}
                    pageSize={5}
                    date={false}
                />
            </Grid>

            {/* ══════════════════════════════════════════════════════════════════════
                MODALS
            ══════════════════════════════════════════════════════════════════════ */}

            {/* Performer: View */}
            <Modal id="performer-view" title="Performer Details" size="xl">
                {selectedPerformer && (
                    <div className="flex flex-col gap-4">
                        <ModalProfile
                            name={selectedPerformer.name}
                            subtitle={selectedPerformer.email}
                            meta={selectedPerformer.phone || ""}
                        />

                        <ModalGrid title="Lead Stats" cols={3}>
                            <ModalData label="Total Leads"        value={selectedPerformer.leads}           />
                            <ModalData label="Conversions"        value={selectedPerformer.conversions}     />
                            <ModalData label="Conv. Rate"         value={selectedPerformer.convRate}        />
                            <ModalData label="Follow-ups Done"    value={selectedPerformer.followupsDone}   />
                            <ModalData label="Follow-ups Missed"  value={selectedPerformer.followupsMissed} />
                            <ModalData label="Status"             value={selectedPerformer.status}          />
                        </ModalGrid>

                        <div className="flex justify-end pt-1">
                            <Button
                                text="Close"
                                variant="ghost"
                                size={2}
                                onClick={() => closeModal("performer-view")}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Lead: View */}
            <Modal id="lead-view" title="Lead Details" size="md">
                {selectedLead && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <ModalData label="Lead Name"   value={selectedLead.lead}       />
                            <ModalData label="Contact"     value={selectedLead.contact}    />
                            <ModalData label="Assigned To" value={selectedLead.assignedTo} />
                            <ModalData label="Status"      value={selectedLead.status}     />
                            <ModalData label="Date"        value={selectedLead.date}       />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                text="Close"
                                variant="ghost"
                                size={3}
                                onClick={() => closeModal("lead-view")}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Lead: Edit */}
            <Modal id="lead-edit" title="Edit Lead" size="md">
                {selectedLead && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <ModalData label="Lead Name"   value={selectedLead.lead}       />
                            <ModalData label="Contact"     value={selectedLead.contact}    />
                            <ModalData label="Assigned To" value={selectedLead.assignedTo} />
                            <ModalData label="Status"      value={selectedLead.status}     />
                        </div>
                        <p className="text-xs text-slate-400">
                            Full edit form connects to your lead update API.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                text="Cancel"
                                variant="ghost"
                                size={3}
                                onClick={() => closeModal("lead-edit")}
                            />
                            <Button
                                text="Save"
                                variant="primary"
                                size={3}
                                onClick={() => closeModal("lead-edit")}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Missed: View */}
            <Modal id="missed-view" title="Missed Follow-up Details" size="md">
                {selectedMissed && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <ModalData label="Lead Name"      value={selectedMissed.lead}         />
                            <ModalData label="Assigned To"    value={selectedMissed.assignedTo}   />
                            <ModalData label="Follow-up Date" value={selectedMissed.followupDate} />
                            <ModalData label="Status"         value={selectedMissed.status}       />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                text="Close"
                                variant="ghost"
                                size={3}
                                onClick={() => closeModal("missed-view")}
                            />
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
                            <span className="font-bold text-[#2a465a]">
                                {selectedMissed.lead}
                            </span>{" "}
                            assigned to{" "}
                            <span className="font-bold text-[#2a465a]">
                                {selectedMissed.assignedTo}
                            </span>
                            .
                        </p>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                New Date
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                text="Cancel"
                                variant="ghost"
                                size={4}
                                onClick={() => closeModal("missed-reschedule")}
                            />
                            <Button
                                text="Reschedule"
                                variant="primary"
                                size={4}
                                onClick={() => closeModal("missed-reschedule")}
                            />
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
}
