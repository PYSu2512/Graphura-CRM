import { useState, useEffect } from "react";
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
import { teamService } from '../../../services/teamService';
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

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_LEADS = 1500;

// ═════════════════════════════════════════════════════════════════════════════
// TEAM LEADERS PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function SalesTeamLeaders() {
    const [tls, setTls] = useState([]);
    const [viewTL, setViewTL] = useState(null);
    const [editTL, setEditTL] = useState(null);

    // ── Teams state ───────────────────────────────────────────────────────────
    // Each team: { id, name, leaderId, memberIds: Set<string> }
    const [teams, setTeams] = useState([]);
    const [teamForm, setTeamForm] = useState({ id: null, name: "", leaderId: "", memberIds: new Set() });
    const [teamError, setTeamError] = useState("");
    const [viewTeam, setViewTeam] = useState(null);
    const [employees, setEmployees] = useState([]);

    // Load available leaders for the current user's department
        const [loading, setLoading] = useState(false);
        const [toast, setToast] = useState(null);

        const showToast = (msg, type = 'success') => {
            setToast({ msg, type });
            setTimeout(() => setToast(null), 3000);
        };
    useEffect(() => {
        const loadLeaders = async () => {
            setLoading(true);
            try {
                const current = JSON.parse(localStorage.getItem('user') || localStorage.getItem('admin') || 'null');
                const departmentId = current?.department?._id || current?.department || null;
                if (!departmentId) return;
                const res = await teamService.getAvailableLeaders(departmentId);
                const leaders = res.data?.leaders || res.leaders || [];
                const mapped = leaders.map((l) => ({
                    id: l._id,
                    name: l.name,
                    email: l.email,
                    mobile: l.phone || l.mobile || '',
                    currentLeads: l.leadCount || 0,
                    target: l.target || 0,
                    status: l.isActive ? 'Active' : 'Inactive',
                }));
                setTls(mapped);

                // Load persisted teams for this user
                try {
                    const teamsRes = await teamService.getUserTeams();
                    const teamsData = teamsRes.data?.teams || teamsRes.teams || [];
                    const mappedTeams = teamsData.map((t) => ({ id: t._id, name: t.name, leaderId: t.leader?._id || t.leader, memberIds: new Set((t.members || []).map(m => m.user?._id || m.user)) }));
                    setTeams(mappedTeams);
                } catch (err) {
                    console.error('Failed to load user teams', err);
                }
            } catch (err) {
                console.error('Failed to load leaders', err);
                showToast('Failed to load leaders', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadLeaders();
    }, []);

    // Load employees under selected leader
    useEffect(() => {
        const leaderId = teamForm.leaderId;
        if (!leaderId) {
            setEmployees([]);
            return;
        }

        const loadEmployees = async () => {
            try {
                const res = await teamService.getLeaderEmployees(leaderId);
                const emps = res.data?.employees || res.employees || [];
                const mapped = emps.map((e) => ({
                    id: e._id,
                    name: e.name,
                    mobile: e.phone || e.phone || '',
                    currentLeads: e.leadCount || 0,
                    status: e.isActive ? 'Active' : 'Inactive',
                    teamLabel: e.assignedTeamName || '—',
                }));
                setEmployees(mapped);
                // Reset member selection when leader changes
                setTeamForm((p) => ({ ...p, memberIds: new Set() }));
            } catch (err) {
                console.error('Failed to load employees', err);
                setEmployees([]);
                showToast('Failed to load leader employees', 'error');
            }
        };
        loadEmployees();
    }, [teamForm.leaderId]);

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

    const saveTeam = async () => {
        try {
            if (!teamForm.name.trim()) { setTeamError("Team name is required."); return; }
            if (!teamForm.leaderId) { setTeamError("Please select a team leader."); return; }
            if (teamForm.memberIds.size === 0) { setTeamError("Add at least one member."); return; }

            // Create team via API (department user route)
            const current = JSON.parse(localStorage.getItem('user') || localStorage.getItem('admin') || 'null');
            const departmentId = current?.department?._id || current?.department || null;
            const createRes = await teamService.createTeam({ name: teamForm.name.trim(), department: departmentId, leader: teamForm.leaderId });
            const createdTeam = createRes.data?.team || createRes.team;

            // Add selected members
            const memberIds = Array.from(teamForm.memberIds);
            for (const uid of memberIds) {
                try {
                    await teamService.addTeamMember(createdTeam._id, uid);
                } catch (err) {
                    console.error('Failed to add member', uid, err);
                }
            }

            // Update local UI state
            setTeams((prev) => [...prev, {
                id: createdTeam._id,
                name: createdTeam.name,
                leaderId: createdTeam.leader?._id || createdTeam.leader,
                memberIds: new Set(memberIds),
            }]);

            closeModal("team-form-modal");
        } catch (err) {
            console.error('Create team failed', err);
            setTeamError(err.message || 'Failed to create team');
        }
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
                        <Button text={loading ? "Loading..." : "+ Create Team"} variant="primary" size={12} onClick={openCreateTeam} disabled={loading} />
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
                                onClick: async (row) => {
                                    try {
                                        setLoading(true);
                                        const res = await teamService.getTeamById(row.id);
                                        const team = res.data?.team || res.team;
                                        if (team) {
                                            // Map members for the view modal
                                            const members = (team.members || []).map((m) => {
                                                const u = m.user || m;
                                                return {
                                                    id: u._id || u.id,
                                                    name: u.name,
                                                    mobile: u.phone || u.mobile || '',
                                                    currentLeads: u.leadCount || 0,
                                                    calls: u.calls || 0,
                                                    sales: u.sales || 0,
                                                    status: u.isActive ? 'Active' : 'Inactive',
                                                };
                                            });
                                            setViewTeam({ id: team._id, name: team.name, leaderId: team.leader?._id || team.leader, members });
                                            openModal("view-team-modal");
                                        }
                                    } catch (err) {
                                        console.error('Failed to fetch team', err);
                                        showToast('Failed to load team details', 'error');
                                    } finally {
                                        setLoading(false);
                                    }
                                },
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

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[10000] flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-2xl transition-all duration-300 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                    {toast.type === 'error' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 9v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    {toast.msg}
                </div>
            )}

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
                    const members = viewTeam.members || employees.filter((e) => viewTeam.memberIds?.has?.(e.id));
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
                                        const available = employees.filter((e) => !takenMemberIds(teamForm.id).has(e.id));
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
                            rows={employees.map((emp) => {
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