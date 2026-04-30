import { useState } from "react";
import {
    Heading,
    Grid,
    DashGrid,
    DashCard,
    DataTable,
    Button,
    Modal,
    DataField,
    SelectField,
    Option,
    openModal,
    closeModal,
    ModalProfile,
    ModalData,
    ModalGrid,
} from "../../../components/shared/Common_Components";
import {
    Users,
    Briefcase,
    Target,
    TrendingUp,
    AlertTriangle,
    Eye,
    Pencil,
    UserCheck,
    Trash2,
} from "lucide-react";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const MAX_LEADS = 1500;

// Single source of truth — each TL carries their employees inline
const INITIAL_TLS = [
    {
        id: "TL001", name: "Rahul Mehta", email: "rahul@crm.com", mobile: "9876543210",
        currentLeads: 1200, target: 1000, targetAchieved: 820, status: "Active",
        employees: [
            { id: "E101", name: "Raj Patel", email: "raj@crm.com", mobile: "9801111001", currentLeads: 120, calls: 340, sales: 18, status: "Active" },
            { id: "E102", name: "Asha Mehta", email: "asha@crm.com", mobile: "9801111002", currentLeads: 95, calls: 270, sales: 12, status: "Active" },
            { id: "E103", name: "Nikhil Roy", email: "nikhil@crm.com", mobile: "9801111003", currentLeads: 140, calls: 400, sales: 22, status: "Active" },
            { id: "E104", name: "Pooja Das", email: "pooja@crm.com", mobile: "9801111004", currentLeads: 80, calls: 210, sales: 9, status: "Inactive" },
        ],
    },
    {
        id: "TL002", name: "Sneha Patel", email: "sneha@crm.com", mobile: "9123456780",
        currentLeads: 980, target: 850, targetAchieved: 710, status: "Active",
        employees: [
            { id: "E201", name: "Priti Shah", email: "priti@crm.com", mobile: "9802221001", currentLeads: 110, calls: 300, sales: 15, status: "Active" },
            { id: "E202", name: "Mohan Lal", email: "mohan@crm.com", mobile: "9802221002", currentLeads: 130, calls: 380, sales: 20, status: "Active" },
            { id: "E203", name: "Sunita Roy", email: "sunita@crm.com", mobile: "9802221003", currentLeads: 90, calls: 250, sales: 11, status: "Active" },
        ],
    },
    {
        id: "TL003", name: "Arjun Verma", email: "arjun@crm.com", mobile: "8765432109",
        currentLeads: 450, target: 400, targetAchieved: 290, status: "Active",
        employees: [
            { id: "E301", name: "Arun Kumar", email: "arun@crm.com", mobile: "9803331001", currentLeads: 60, calls: 180, sales: 7, status: "Active" },
            { id: "E302", name: "Ravi Sharma", email: "ravi@crm.com", mobile: "9803331002", currentLeads: 75, calls: 220, sales: 9, status: "Active" },
        ],
    },
    {
        id: "TL004", name: "Priya Sharma", email: "priya@crm.com", mobile: "7654321098",
        currentLeads: 1490, target: 1400, targetAchieved: 1380, status: "Active",
        employees: [
            { id: "E401", name: "Geeta Singh", email: "geeta@crm.com", mobile: "9804441001", currentLeads: 200, calls: 580, sales: 35, status: "Active" },
            { id: "E402", name: "Vivek Bose", email: "vivek@crm.com", mobile: "9804441002", currentLeads: 190, calls: 530, sales: 30, status: "Active" },
            { id: "E403", name: "Divya Nair", email: "divya@crm.com", mobile: "9804441003", currentLeads: 185, calls: 510, sales: 28, status: "Inactive" },
        ],
    },
    {
        id: "TL005", name: "Kabir Singh", email: "kabir@crm.com", mobile: "6543210987",
        currentLeads: 300, target: 250, targetAchieved: 180, status: "Inactive",
        employees: [
            { id: "E501", name: "Kiran Rao", email: "kiran@crm.com", mobile: "9805551001", currentLeads: 45, calls: 130, sales: 5, status: "Active" },
            { id: "E502", name: "Hari Verma", email: "hari@crm.com", mobile: "9805551002", currentLeads: 55, calls: 160, sales: 6, status: "Active" },
        ],
    },
];

// Derived flat pool — used for the team member picker
const ALL_EMPLOYEES = INITIAL_TLS.flatMap((tl) => tl.employees);

// Sample teams — each memberIds is a Set of employee IDs
const INITIAL_TEAMS = [
    {
        id: "TEAM001",
        name: "Alpha Squad",
        leaderId: "TL001",
        memberIds: new Set(["E101", "E102", "E103"]),
    },
    {
        id: "TEAM002",
        name: "Beta Force",
        leaderId: "TL002",
        memberIds: new Set(["E201", "E202"]),
    },
    {
        id: "TEAM003",
        name: "Gamma Strike",
        leaderId: "TL003",
        memberIds: new Set(["E301", "E302"]),
    },
    {
        id: "TEAM004",
        name: "Delta Closers",
        leaderId: "TL004",
        memberIds: new Set(["E401", "E402", "E403"]),
    },
    {
        id: "TEAM005",
        name: "Epsilon Hunters",
        leaderId: "TL005",
        memberIds: new Set(["E501", "E502", "E104"]),
    },
];

// ═════════════════════════════════════════════════════════════════════════════
// TEAM LEADERS PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function SalesTeamLeaders() {
    const [tls, setTls] = useState(INITIAL_TLS);
    const [viewTL, setViewTL] = useState(null);
    const [editTL, setEditTL] = useState(null);

    // ── Teams state ───────────────────────────────────────────────────────────
    // Each team: { id, name, leaderId, memberIds: Set<string> }
    const [teams, setTeams] = useState(INITIAL_TEAMS);
    const [teamForm, setTeamForm] = useState({ id: null, name: "", leaderId: "", memberIds: new Set() });
    const [teamError, setTeamError] = useState("");
    const [viewTeam, setViewTeam] = useState(null);

    // ── KPIs ─────────────────────────────────────────────────────────────────
    const totalLeaders = tls.length;
    const totalExecs = tls.reduce((s, t) => s + (t.employees?.length ?? 0), 0);
    const totalAssigned = tls.reduce((s, t) => s + t.currentLeads, 0);
    const totalCapacity = tls.reduce((s, t) => s + (MAX_LEADS - t.currentLeads), 0);

    // ── Edit TL ────────────────────────────────────────────────────────────────
    const saveEditTL = () => {
        setTls((prev) => prev.map((t) => (t.id === editTL.id ? editTL : t)));
        closeModal("edit-tl-modal");
    };

    // ── Team Management ───────────────────────────────────────────────────────
    // IDs of members already assigned to ANY team (excluding the team being edited)
    const takenMemberIds = (excludeTeamId = null) =>
        new Set(
            teams
                .filter((t) => t.id !== excludeTeamId)
                .flatMap((t) => [...t.memberIds])
        );

    const openCreateTeam = () => {
        setTeamForm({ id: null, name: "", leaderId: "", memberIds: new Set() });
        setTeamError("");
        openModal("team-form-modal");
    };

    const openEditTeam = (team) => {
        setTeamForm({ ...team, memberIds: new Set(team.memberIds) });
        setTeamError("");
        openModal("team-form-modal");
    };

    const toggleTeamMember = (empId) => {
        setTeamForm((prev) => {
            const next = new Set(prev.memberIds);
            next.has(empId) ? next.delete(empId) : next.add(empId);
            return { ...prev, memberIds: next };
        });
    };

    const saveTeam = () => {
        if (!teamForm.name.trim()) { setTeamError("Team name is required."); return; }
        if (!teamForm.leaderId) { setTeamError("Please select a team leader."); return; }
        if (teamForm.memberIds.size === 0) { setTeamError("Add at least one member."); return; }

        if (teamForm.id) {
            // Edit existing
            setTeams((prev) => prev.map((t) => t.id === teamForm.id ? { ...teamForm } : t));
        } else {
            // Create new
            const newId = `TEAM${String(teams.length + 1).padStart(3, "0")}`;
            setTeams((prev) => [...prev, { ...teamForm, id: newId }]);
        }
        closeModal("team-form-modal");
    };

    const deleteTeam = (teamId) => {
        setTeams((prev) => prev.filter((t) => t.id !== teamId));
    };

    // ── Table rows — only key fields shown; full details in View modal ──────────
    const tableRows = tls.map((t) => ({
        ...t,
        availableCapacity: MAX_LEADS - t.currentLeads,
        employees: t.employees?.length ?? 0,
        capacityPct: `${Math.round((t.currentLeads / MAX_LEADS) * 100)}%`,
    }));

    // ═══ RENDER ═══════════════════════════════════════════════════════════════
    return (
        <div>
            <Grid cols={12} gap={6}>
                    
                {/* Heading + Create Team button */}
                <div className="col-span-12 flex items-center gap-4">
                    <div className="flex-1">
                        <Heading primaryText="Teams" secondaryText="Management" size={12} fontSize="2xl" />
                    </div>
                    <div className="flex-shrink-0 self-center">
                        <Button text="+ Create Team" variant="primary" size={12} onClick={openCreateTeam} />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="col-span-12">
                    <DashGrid cols={12} gap={4}>
                        <DashCard title="Total Teams" value={String(teams.length)} icon={<Users size={22} />} accentColor="#2a465a" size={3} />
                        <DashCard title="Team Leaders" value={String(totalLeaders)} icon={<Briefcase size={22} />} accentColor="#3b82f6" size={3} />
                        <DashCard title="Total Executives" value={String(totalExecs)} icon={<TrendingUp size={22} />} accentColor="#22c55e" size={3} />
                        <DashCard title="Available Capacity" value={totalCapacity.toLocaleString()} icon={<Target size={22} />} accentColor="#f59e0b" size={3} />
                    </DashGrid>
                </div>

                {/* ── Teams Table (primary) ── */}
                <div className="col-span-12">
                    <DataTable
                        title="Teams"
                        columns={[
                            { key: "name", label: "Team Name" },
                            { key: "leaderName", label: "Team Leader" },
                            { key: "leaderEmail", label: "Leader Email" },
                            { key: "leaderMobile", label: "Leader Mobile" },
                            { key: "members", label: "Members" },
                        ]}
                        rows={teams.map((t) => {
                            const leader = tls.find((l) => l.id === t.leaderId);
                            return {
                                ...t,
                                leaderName: leader?.name ?? "—",
                                leaderEmail: leader?.email ?? "—",
                                leaderMobile: leader?.mobile ?? "—",
                                members: t.memberIds.size,
                            };
                        })}
                        searchable
                        size={12}
                        pageSize={10}
                        actions={[
                            {
                                icon: <Eye size={15} />,
                                tooltip: "View Team",
                                variant: "ghost",
                                onClick: (row) => { setViewTeam(teams.find((t) => t.id === row.id)); openModal("view-team-modal"); },
                            },
                            {
                                icon: <Pencil size={15} />,
                                tooltip: "Edit Team",
                                variant: "ghost",
                                onClick: (row) => openEditTeam(teams.find((t) => t.id === row.id)),
                            },
                            {
                                icon: <Trash2 size={15} />,
                                tooltip: "Delete Team",
                                variant: "danger",
                                onClick: (row) => deleteTeam(row.id),
                            },
                        ]}
                    />
                </div>

                {/* ── Team Leaders Table (secondary) ── */}
                <div className="col-span-12">
                    <DataTable
                        title="Team Leaders"
                        columns={[
                            { key: "name", label: "Name" },
                            { key: "currentLeads", label: "Leads" },
                            { key: "availableCapacity", label: "Capacity" },
                            { key: "employees", label: "Employees" },
                            { key: "status", label: "Status" },
                        ]}
                        rows={tableRows}
                        searchable
                        filters={[
                            { title: "Status", key: "status", type: "toggle", options: ["Active", "Inactive"] },
                        ]}
                        actions={[
                            {
                                icon: <Eye size={15} />,
                                tooltip: "View",
                                variant: "ghost",
                                onClick: (row) => { setViewTL(tls.find((t) => t.id === row.id)); openModal("view-tl-modal"); },
                            },
                            {
                                icon: <Pencil size={15} />,
                                tooltip: "Edit",
                                variant: "ghost",
                                onClick: (row) => { setEditTL({ ...tls.find((t) => t.id === row.id) }); openModal("edit-tl-modal"); },
                            },
                        ]}
                        size={12}
                        pageSize={10}
                    />
                </div>
            </Grid>

            <Modal id="view-tl-modal" title="Team Leader Details" size="xl">
                {viewTL && (() => {
                    const cap = MAX_LEADS - viewTL.currentLeads;
                    const emps = viewTL.employees ?? [];
                    const pct = Math.round((viewTL.currentLeads / MAX_LEADS) * 100);
                    return (
                        <div className="space-y-5">
                            <ModalProfile
                                name={viewTL.name}
                                subtitle={`${viewTL.status} · ${emps.length} Employees`} meta={`ID: ${viewTL.id}`}
                                avatarColor={viewTL.status === "Active" ? "#2a465a" : "#94a3b8"}
                            />

                            <ModalGrid title="Contact Info" cols={2}>
                                <ModalData label="Email" value={viewTL.email} />
                                <ModalData label="Mobile" value={viewTL.mobile} />
                            </ModalGrid>

                            <ModalGrid title="Lead Stats" cols={3}>
                                <ModalData label="Current Leads" value={viewTL.currentLeads} />
                                <ModalData label="Lead Limit" value={MAX_LEADS} />
                                <ModalData label="Available Capacity" value={cap} />
                                <ModalData label="Target Assigned" value={viewTL.target} />
                                <ModalData label="Target Achieved" value={viewTL.targetAchieved} />
                                <ModalData label="Capacity Used" value={`${pct}%`} />
                            </ModalGrid>

                            {/* Capacity visual bar */}
                            <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lead Capacity</p>
                                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500"}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5">{viewTL.currentLeads} / {MAX_LEADS} leads</p>
                            </div>

                            {/* Employees table via DataTable */}
                            <DataTable
                                title="Employees Under This TL"
                                columns={[
                                    { key: "name", label: "Employee" },
                                    { key: "mobile", label: "Mobile" },
                                    { key: "currentLeads", label: "Leads" },
                                    { key: "calls", label: "Calls" },
                                    { key: "sales", label: "Sales" },
                                    { key: "status", label: "Status" },
                                ]}
                                rows={emps}
                                pageSize={10}
                                size={12}
                            />

                            <div className="flex justify-end">
                                <Button text="Close" variant="ghost" size={2} onClick={() => closeModal("view-tl-modal")} />
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* ── Edit TL Modal ─────────────────────────────────────────────────── */}
            <Modal id="edit-tl-modal" title="Edit Team Leader" size="md">
                {editTL && (
                    <div className="space-y-4">
                        <ModalProfile name={editTL.name} subtitle={editTL.email} meta={editTL.id} />
                        <Grid cols={12} gap={4}>
                            <DataField label="Full Name" id="et-name" value={editTL.name} size={6} onChange={(e) => setEditTL((p) => ({ ...p, name: e.target.value }))} />
                            <DataField label="Email" id="et-email" value={editTL.email} size={6} type="email" onChange={(e) => setEditTL((p) => ({ ...p, email: e.target.value }))} />
                            <DataField label="Mobile" id="et-mobile" value={editTL.mobile} size={6} onChange={(e) => setEditTL((p) => ({ ...p, mobile: e.target.value }))} />
                            <SelectField label="Status" value={editTL.status} size={6} onChange={(e) => setEditTL((p) => ({ ...p, status: e.target.value }))}>
                                <Option value="Active" label="Active" />
                                <Option value="Inactive" label="Inactive" />
                            </SelectField>
                            <DataField label="Target" id="et-target" type="number" value={String(editTL.target)} size={6} onChange={(e) => setEditTL((p) => ({ ...p, target: Number(e.target.value) }))} />
                        </Grid>
                        <div className="flex gap-3 pt-2">
                            <Button text="Save Changes" variant="primary" size={6} onClick={saveEditTL} />
                            <Button text="Cancel" variant="ghost" size={6} onClick={() => closeModal("edit-tl-modal")} />
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── View Team Modal (read-only) ───────────────────────────────────── */}
            <Modal id="view-team-modal" title="Team Details" size="xl">
                {viewTeam && (() => {
                    const leader = tls.find((t) => t.id === viewTeam.leaderId);
                    const members = ALL_EMPLOYEES.filter((e) => viewTeam.memberIds.has(e.id));
                    return (
                        <div className="flex flex-col gap-5">
                            <ModalProfile
                                name={viewTeam.name}
                                subtitle={`Led by ${leader?.name ?? "—"}`}
                                meta={`${members.length} member${members.length !== 1 ? "s" : ""} · ID: ${viewTeam.id}`}
                            />

                            <ModalGrid title="Team Info" cols={2}>
                                <ModalData label="Team Name" value={viewTeam.name} />
                                <ModalData label="Team Leader" value={leader?.name ?? "—"} />
                                <ModalData label="Members" value={members.length} />
                                <ModalData label="Leader Email" value={leader?.email ?? "—"} />
                            </ModalGrid>

                            <div>
                                <p className="text-xs font-black text-[#2a465a] uppercase tracking-widest mb-3">Team Members</p>
                                <DataTable
                                    columns={[
                                        { key: "name", label: "Name" },
                                        { key: "mobile", label: "Mobile" },
                                        { key: "currentLeads", label: "Leads" },
                                        { key: "calls", label: "Calls" },
                                        { key: "sales", label: "Sales" },
                                        { key: "status", label: "Status" },
                                    ]}
                                    rows={members}
                                    searchable={false}
                                    pageSize={10}
                                    size={12}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                                <Button text="Close" variant="ghost" size={2} onClick={() => closeModal("view-team-modal")} />
                                <Button
                                    text="Edit Team"
                                    variant="primary"
                                    size={2}
                                    onClick={() => {
                                        closeModal("view-team-modal");
                                        openEditTeam(viewTeam);
                                    }}
                                />
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* ── Create / Edit Team Modal ──────────────────────────────────────── */}
            <Modal id="team-form-modal" title={teamForm.id ? "Edit Team" : "Create Team"} size="xl">
                <div className="flex flex-col gap-5">

                    {/* Profile card — shown when editing an existing team */}
                    {teamForm.id && (() => {
                        const leader = tls.find((t) => t.id === teamForm.leaderId);
                        return (
                            <ModalProfile
                                name={teamForm.name || "Unnamed Team"}
                                subtitle={leader ? `Led by ${leader.name}` : "No leader selected"}
                                meta={`${teamForm.memberIds.size} member${teamForm.memberIds.size !== 1 ? "s" : ""} · ID: ${teamForm.id}`}
                            />
                        );
                    })()}

                    {/* Team name + leader */}
                    <Grid cols={12} gap={4}>
                        <DataField
                            label="Team Name"
                            id="tf-name"
                            placeholder="e.g. Alpha Squad"
                            value={teamForm.name}
                            size={6}
                            onChange={(e) => setTeamForm((p) => ({ ...p, name: e.target.value }))}
                        />
                        <SelectField
                            label="Team Leader"
                            id="tf-leader"
                            size={6}
                            value={teamForm.leaderId}
                            placeholder="Select a leader"
                            onChange={(e) => setTeamForm((p) => ({ ...p, leaderId: e.target.value }))}
                        >
                            {tls.filter((t) => t.status === "Active").map((t) => (
                                <Option key={t.id} value={t.id} label={t.name} />
                            ))}
                        </SelectField>
                    </Grid>

                    {/* Selected leader info */}
                    {teamForm.leaderId && (() => {
                        const leader = tls.find((t) => t.id === teamForm.leaderId);
                        if (!leader) return null;
                        return (
                            <ModalGrid title="Selected Leader Info" cols={3}>
                                <ModalData label="Email" value={leader.email} />
                                <ModalData label="Mobile" value={leader.mobile} />
                                <ModalData label="Status" value={leader.status} />
                                <ModalData label="Leads" value={leader.currentLeads} />
                                <ModalData label="Capacity" value={MAX_LEADS - leader.currentLeads} />
                                <ModalData label="Target" value={leader.target} />
                            </ModalGrid>
                        );
                    })()}

                    {/* Member picker — uses DataTable for consistent styling */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-[#2a465a] uppercase tracking-widest">
                                Select Members
                                <span className="ml-2 text-slate-400 font-semibold normal-case tracking-normal">
                                    — members in another team are disabled
                                </span>
                            </p>
                        </div>

                        <DataTable
                            columns={[
                                {
                                    key: "selectState",
                                    label: "",
                                    // Select-all checkbox rendered in the header
                                    headerNode: (() => {
                                        const available = ALL_EMPLOYEES.filter((e) => !takenMemberIds(teamForm.id).has(e.id));
                                        const allSel = available.length > 0 && available.every((e) => teamForm.memberIds.has(e.id));
                                        return (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTeamForm((p) => {
                                                        const next = new Set(p.memberIds);
                                                        available.forEach((emp) => allSel ? next.delete(emp.id) : next.add(emp.id));
                                                        return { ...p, memberIds: next };
                                                    });
                                                }}
                                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${allSel
                                                        ? "bg-white border-white"
                                                        : "bg-transparent border-white/40 hover:border-white/80"
                                                    }`}
                                            >
                                                {allSel && (
                                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                                        <path d="M2 6l3 3 5-5" stroke="#2a465a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                                {!allSel && available.some((e) => teamForm.memberIds.has(e.id)) && (
                                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                        <path d="M2.5 6h7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })(),
                                },
                                { key: "name", label: "Name" },
                                { key: "mobile", label: "Mobile" },
                                { key: "currentLeads", label: "Leads" },
                                { key: "status", label: "Status" },
                                { key: "teamLabel", label: "Team" },
                            ]}
                            rows={ALL_EMPLOYEES.map((emp) => {
                                const taken = takenMemberIds(teamForm.id).has(emp.id);
                                const selected = teamForm.memberIds.has(emp.id);
                                const takenByTeam = taken
                                    ? teams.find((t) => t.id !== teamForm.id && t.memberIds.has(emp.id))
                                    : null;
                                return {
                                    ...emp,
                                    _taken: taken,
                                    _selected: selected,
                                    // Checkbox visual rendered as a cell value
                                    selectState: (
                                        <button
                                            type="button"
                                            disabled={taken}
                                            onClick={() => { if (!taken) toggleTeamMember(emp.id); }}
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected
                                                    ? "bg-[#2a465a] border-[#2a465a]"
                                                    : taken
                                                        ? "bg-slate-100 border-slate-200 cursor-not-allowed"
                                                        : "bg-white border-slate-300 hover:border-[#2a465a]/60"
                                                }`}
                                        >
                                            {selected && (
                                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>
                                    ),
                                    teamLabel: takenByTeam
                                        ? takenByTeam.name
                                        : selected
                                            ? "This team"
                                            : "—",
                                };
                            })}
                            searchable
                            size={12}
                            pageSize={10}
                            date={false}
                            filters={[
                                { title: "Status", type: "toggle", key: "status", options: ["Active", "Inactive"] },
                            ]}
                        />
                        <p className="text-xs text-slate-400">
                            {teamForm.memberIds.size} member{teamForm.memberIds.size !== 1 ? "s" : ""} selected
                        </p>
                    </div>

                    {/* Error */}
                    {teamError && (
                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
                            <AlertTriangle size={15} /> {teamError}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                        <Button text="Cancel" variant="ghost" size={2} onClick={() => closeModal("team-form-modal")} />
                        <Button text={teamForm.id ? "Save Changes" : "Create Team"} variant="primary" size={3} onClick={saveTeam} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}