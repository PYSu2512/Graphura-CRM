import { useState, useEffect } from "react";
import {
    Heading,
    Grid,
    DashGrid,
    EnhancedDashCard,
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
import { maskId } from '../../../utils/idMask';
import {
    Users,
    Briefcase,
    Target,
    TrendingUp,
    AlertTriangle,
    Eye,
    Pencil,
    Trash2,
    UserMinus,
    Lock,
    CheckCircle2,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_LEADS = 1500;

// ─── Toast component ─────────────────────────────────────────────────────────
function Toast({ toast }) {
    if (!toast) return null;
    return (
        <div
            className={`fixed top-6 right-6 z-[10000] flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-2xl transition-all duration-300 ${
                toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
        >
            {toast.type === 'error' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 17h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
            {toast.msg}
        </div>
    );
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                        <AlertTriangle size={20} className="text-rose-600" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base">{title}</h3>
                </div>
                <p className="text-sm text-slate-500 mb-5 ml-[52px]">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 60" />
                            </svg>
                        )}
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// TEAMS PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function SalesTeamLeaders() {
    // ── All TL leaders (from API) ──────────────────────────────────────────────
    const [tls, setTls] = useState([]);
    const [viewTL, setViewTL] = useState(null);

    // ── Teams state ───────────────────────────────────────────────────────────
    // mode: 'create' | 'edit'
    // For EDIT: leader is locked — only memberIds can change
    const [teams, setTeams] = useState([]);
    const [teamForm, setTeamForm] = useState({
        id: null,
        name: "",
        leaderId: "",
        leaderName: "",
        memberIds: new Set(),
    });
    const [teamError, setTeamError] = useState("");
    const [viewTeam, setViewTeam] = useState(null);
    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const showConfirm = (title, message, onConfirm) =>
        setConfirm({ open: true, title, message, onConfirm });

    const closeConfirm = () =>
        setConfirm({ open: false, title: '', message: '', onConfirm: null });

    // ── Initial data load ──────────────────────────────────────────────────────
    const loadData = async () => {
        setLoading(true);
        try {
            const current = JSON.parse(
                sessionStorage.getItem('user') || sessionStorage.getItem('admin') || 'null'
            );
            const departmentId = current?.department?._id || current?.department || null;
            if (!departmentId) return;

            const [leadersRes, teamsRes] = await Promise.allSettled([
                teamService.getAvailableLeaders(departmentId),
                teamService.getUserTeams(),
            ]);

            if (leadersRes.status === 'fulfilled') {
                const leaders = leadersRes.value?.data?.leaders || leadersRes.value?.leaders || [];
                setTls(leaders.map((l) => ({
                    id: l._id,
                    name: l.name,
                    email: l.email,
                    mobile: l.phone || l.mobile || '',
                    // leadCount = leads assigned directly to this TL by manager
                    currentLeads: l.leadCount || 0,
                    target: l.target || 0,
                    status: l.isActive ? 'Active' : 'Inactive',
                    hasTeam: l.hasTeam || false,
                    teamName: l.teamName || null,
                })));
            }

            if (teamsRes.status === 'fulfilled') {
                const teamsData = teamsRes.value?.data?.teams || teamsRes.value?.teams || [];
                setTeams(teamsData.map((t) => ({
                    id: t._id,
                    name: t.name,
                    leaderId: t.leader?._id || t.leader,
                    leaderName: t.leader?.name || '—',
                    leaderEmail: t.leader?.email || '—',
                    leaderMobile: t.leader?.phone || t.leader?.mobile || '—',
                    memberIds: new Set(
                        (t.members || []).map(m => m.user?._id || m.user)
                    ),
                })));
            }
        } catch (err) {
            console.error('Failed to load data', err);
            showToast('Failed to load team data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // ── Load employees when editing / creating ────────────────────────────────
    // For edit mode: load employees scoped to the LOCKED leader
    // For create mode: load employees when leader is selected
    const loadEmployeesForLeader = async (leaderId) => {
        if (!leaderId) { setEmployees([]); return; }
        try {
            const res = await teamService.getLeaderEmployees(leaderId);
            const emps = res?.data?.employees || res?.employees || [];
            setEmployees(emps.map((e) => ({
                id: e._id,
                name: e.name,
                mobile: e.phone || '',
                currentLeads: e.leadCount || 0,
                status: e.isActive ? 'Active' : 'Inactive',
                teamLabel: e.assignedTeamName || null,
            })));
        } catch (err) {
            console.error('Failed to load employees', err);
            setEmployees([]);
            showToast('Failed to load employees', 'error');
        }
    };

    // When leader changes in CREATE mode
    useEffect(() => {
        if (!teamForm.id) {
            // create mode — load employees on leader change, reset members
            if (teamForm.leaderId) {
                setTeamForm(p => ({ ...p, memberIds: new Set() }));
                loadEmployeesForLeader(teamForm.leaderId);
            } else {
                setEmployees([]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamForm.leaderId, teamForm.id]);

    // ── KPIs ─────────────────────────────────────────────────────────────────
    const totalLeaders = tls.length;
    const totalAssigned = tls.reduce((s, t) => s + t.currentLeads, 0);
    const totalCapacity = tls.reduce((s, t) => s + (MAX_LEADS - t.currentLeads), 0);

    // ── Helpers ───────────────────────────────────────────────────────────────
    // Member IDs taken by OTHER teams (not the team being edited)
    const takenMemberIds = (excludeTeamId = null) =>
        new Set(
            teams
                .filter((t) => t.id !== excludeTeamId)
                .flatMap((t) => [...t.memberIds])
        );

    // ── Create team ────────────────────────────────────────────────────────────
    const openCreateTeam = () => {
        setTeamForm({ id: null, name: "", leaderId: "", leaderName: "", memberIds: new Set() });
        setEmployees([]);
        setTeamError("");
        openModal("team-form-modal");
    };

    // ── Edit team (leader LOCKED, members only) ────────────────────────────────
    const openEditTeam = async (team) => {
        try {
            setActionLoading(true);
            const res = await teamService.getTeamById(team.id);
            const t = res?.data?.team || res?.team || team;
            const memberIds = new Set(
                (t.members || [])
                    .map(m => m.user?._id || m.user)
                    // exclude the leader from the selectable members set
                    .filter(id => id.toString() !== (t.leader?._id || t.leader)?.toString())
            );
            const leaderId = t.leader?._id?.toString() || t.leader?.toString() || team.leaderId;
            const leaderName = t.leader?.name || team.leaderName || '—';

            setTeamForm({
                id: t._id || team.id,
                name: t.name || team.name,
                leaderId,
                leaderName,
                memberIds,
            });

            // Pre-load employees for the locked leader
            await loadEmployeesForLeader(leaderId);
        } catch {
            const memberIds = new Set(
                [...(team.memberIds || [])]
                    .filter(id => id.toString() !== team.leaderId?.toString())
            );
            setTeamForm({
                ...team,
                memberIds,
            });
            await loadEmployeesForLeader(team.leaderId);
        } finally {
            setActionLoading(false);
        }
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

    // ── Save (Create or Edit) ─────────────────────────────────────────────────
    const saveTeam = async () => {
        if (!teamForm.name.trim()) { setTeamError("Team name is required."); return; }
        if (!teamForm.id && !teamForm.leaderId) { setTeamError("Please select a team leader."); return; }
        if (teamForm.memberIds.size === 0) { setTeamError("Add at least one member."); return; }

        try {
            setActionLoading(true);

            if (teamForm.id) {
                // ── EDIT: only update name + member list. Leader stays locked ─
                await teamService.updateTeam(teamForm.id, { name: teamForm.name.trim() });

                const existingTeam = teams.find(t => t.id === teamForm.id);
                // Old members excludes leader (leader is always in members array but not user-managed)
                const oldMemberIds = new Set(
                    [...(existingTeam?.memberIds || [])]
                        .filter(id => id.toString() !== teamForm.leaderId?.toString())
                );
                const newMemberIds = teamForm.memberIds;

                const toAdd = [...newMemberIds].filter(id => !oldMemberIds.has(id));
                const toRemove = [...oldMemberIds].filter(id => !newMemberIds.has(id));

                const results = await Promise.allSettled([
                    ...toAdd.map(uid => teamService.addTeamMember(teamForm.id, uid)),
                    ...toRemove.map(uid => teamService.removeTeamMember(teamForm.id, uid)),
                ]);

                // Count any failures
                const failures = results.filter(r => r.status === 'rejected');
                if (failures.length > 0) {
                    console.warn('Some member operations failed:', failures);
                }

                // Rebuild memberIds: leader + new members
                const allMemberIds = new Set([teamForm.leaderId, ...newMemberIds]);

                setTeams((prev) => prev.map((t) =>
                    t.id === teamForm.id
                        ? { ...t, name: teamForm.name.trim(), memberIds: allMemberIds }
                        : t
                ));
                closeModal("team-form-modal");
                const msg = failures.length > 0
                    ? `Team updated but ${failures.length} member operation(s) failed.`
                    : `Team "${teamForm.name.trim()}" updated successfully! ✓`;
                showToast(msg, failures.length > 0 ? 'error' : 'success');

            } else {
                // ── CREATE ─────────────────────────────────────────────────────
                const current = JSON.parse(
                    sessionStorage.getItem('user') || sessionStorage.getItem('admin') || 'null'
                );
                const departmentId = current?.department?._id || current?.department || null;

                const createRes = await teamService.createTeam({
                    name: teamForm.name.trim(),
                    department: departmentId,
                    leader: teamForm.leaderId,
                });
                const createdTeam = createRes?.data?.team || createRes?.team;

                const memberIds = Array.from(teamForm.memberIds);
                await Promise.allSettled(
                    memberIds.map(uid => teamService.addTeamMember(createdTeam._id, uid))
                );

                const leader = tls.find(l => l.id === teamForm.leaderId);
                const allMemberIds = new Set([teamForm.leaderId, ...memberIds]);

                setTeams((prev) => [...prev, {
                    id: createdTeam._id,
                    name: createdTeam.name,
                    leaderId: createdTeam.leader?._id || createdTeam.leader,
                    leaderName: leader?.name || '—',
                    leaderEmail: leader?.email || '—',
                    leaderMobile: leader?.mobile || '—',
                    memberIds: allMemberIds,
                }]);

                // Mark TL as hasTeam in local state
                setTls(prev => prev.map(l =>
                    l.id === teamForm.leaderId
                        ? { ...l, hasTeam: true, teamName: teamForm.name.trim() }
                        : l
                ));

                closeModal("team-form-modal");
                showToast(`Team "${teamForm.name.trim()}" created successfully! ✓`);
            }
        } catch (err) {
            console.error('Save team failed', err);
            setTeamError(
                err?.response?.data?.message || err?.message || 'Failed to save team'
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ── Delete team ────────────────────────────────────────────────────────────
    const confirmDeleteTeam = (team) => {
        showConfirm(
            'Delete Team',
            `Are you sure you want to delete "${team.name}"? All members will be unassigned.`,
            async () => {
                try {
                    setConfirm(p => ({ ...p, onConfirm: null }));
                    await teamService.deleteTeam(team.id);
                    setTeams((prev) => prev.filter((t) => t.id !== team.id));
                    // Un-mark TL's hasTeam flag
                    setTls(prev => prev.map(l =>
                        l.id === team.leaderId ? { ...l, hasTeam: false, teamName: null } : l
                    ));
                    closeConfirm();
                    showToast(`Team "${team.name}" deleted.`);
                } catch (err) {
                    closeConfirm();
                    showToast(err?.response?.data?.message || 'Failed to delete team', 'error');
                }
            }
        );
    };

    // ── Remove member from view modal ─────────────────────────────────────────
    const confirmRemoveMember = (teamId, member) => {
        showConfirm(
            'Remove Member',
            `Remove "${member.name}" from this team?`,
            async () => {
                try {
                    setConfirm(p => ({ ...p, onConfirm: null }));
                    await teamService.removeTeamMember(teamId, member.id);
                    setViewTeam((prev) => ({
                        ...prev,
                        members: prev.members.filter(m => m.id !== member.id),
                    }));
                    setTeams((prev) => prev.map(t => {
                        if (t.id !== teamId) return t;
                        const next = new Set(t.memberIds);
                        next.delete(member.id);
                        return { ...t, memberIds: next };
                    }));
                    closeConfirm();
                    showToast(`${member.name} removed from team.`);
                } catch (err) {
                    closeConfirm();
                    showToast(err?.response?.data?.message || 'Failed to remove member', 'error');
                }
            }
        );
    };

    // ── Table rows for TL table ───────────────────────────────────────────────
    const tlTableRows = tls.map((t) => ({
        ...t,
        availableCapacity: MAX_LEADS - t.currentLeads,
        capacityPct: `${Math.round((t.currentLeads / MAX_LEADS) * 100)}%`,
        teamDisplay: t.hasTeam ? t.teamName : '—',
    }));

    // ═══ RENDER ═══════════════════════════════════════════════════════════════
    return (
        <div>
            <Grid cols={12} gap={6}>

                {/* Heading */}
                <div className="col-span-12 flex items-center gap-4">
                    <div className="flex-1">
                        <Heading primaryText="Teams" secondaryText="Management" size={12} fontSize="2xl" />
                    </div>
                    <div className="flex-shrink-0 self-center">
                        <Button
                            text={loading ? "Loading..." : "+ Create Team"}
                            variant="primary"
                            size={12}
                            onClick={openCreateTeam}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="col-span-12">
                    <DashGrid cols={12} gap={4}>
                        <EnhancedDashCard title="Total Teams" value={String(teams.length)} icon={<Users size={22} />} accentColor="#2a465a" size={3} />
                        <EnhancedDashCard title="Team Leaders" value={String(totalLeaders)} icon={<Briefcase size={22} />} accentColor="#3b82f6" size={3} />
                        <EnhancedDashCard title="Leads Distributed" value={String(totalAssigned)} icon={<TrendingUp size={22} />} accentColor="#22c55e" size={3} />
                        <EnhancedDashCard title="Available Capacity" value={totalCapacity.toLocaleString()} icon={<Target size={22} />} accentColor="#f59e0b" size={3} />
                    </DashGrid>
                </div>

                {/* ── Teams Table ── */}
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
                        rows={teams.map((t) => ({
                            ...t,
                            leaderName: t.leaderName || tls.find(l => l.id === t.leaderId)?.name || '—',
                            leaderEmail: t.leaderEmail || tls.find(l => l.id === t.leaderId)?.email || '—',
                            leaderMobile: t.leaderMobile || tls.find(l => l.id === t.leaderId)?.mobile || '—',
                            members: t.memberIds.size,
                        }))}
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
                                        setActionLoading(true);
                                        const res = await teamService.getTeamById(row.id);
                                        const team = res?.data?.team || res?.team;
                                        if (team) {
                                            const leader = team.leader;
                                            const members = (team.members || [])
                                                .filter(m => {
                                                    const uid = m.user?._id || m.user;
                                                    const leaderId = leader?._id || leader;
                                                    return uid?.toString() !== leaderId?.toString();
                                                })
                                                .map((m) => {
                                                    const u = m.user || m;
                                                    return {
                                                        id: u._id || u.id,
                                                        name: u.name,
                                                        mobile: u.phone || u.mobile || '',
                                                        currentLeads: u.leadCount || 0,
                                                        status: u.isActive ? 'Active' : 'Inactive',
                                                    };
                                                });
                                            setViewTeam({
                                                id: team._id,
                                                name: team.name,
                                                leaderId: leader?._id || leader,
                                                leaderName: leader?.name || '—',
                                                leaderEmail: leader?.email || '—',
                                                members,
                                            });
                                            openModal("view-team-modal");
                                        }
                                    } catch (err) {
                                        showToast('Failed to load team details', 'error');
                                    } finally {
                                        setActionLoading(false);
                                    }
                                },
                            },
                            {
                                icon: <Pencil size={15} />,
                                tooltip: "Edit Team (Members Only)",
                                variant: "ghost",
                                onClick: (row) => openEditTeam(teams.find((t) => t.id === row.id)),
                            },
                            {
                                icon: <Trash2 size={15} />,
                                tooltip: "Delete Team",
                                variant: "danger",
                                onClick: (row) => confirmDeleteTeam(teams.find((t) => t.id === row.id)),
                            },
                        ]}
                    />
                </div>

                {/* ── Team Leaders Table (no edit button) ── */}
                <div className="col-span-12">
                    <DataTable
                        title="Team Leaders"
                        columns={[
                            { key: "name", label: "Name" },
                            { key: "currentLeads", label: "Leads Assigned" },
                            { key: "availableCapacity", label: "Capacity Left" },
                            { key: "teamDisplay", label: "Current Team" },
                            { key: "status", label: "Status" },
                        ]}
                        rows={tlTableRows}
                        searchable
                        filters={[
                            { title: "Status", key: "status", type: "toggle", options: ["Active", "Inactive"] },
                        ]}
                        actions={[
                            {
                                icon: <Eye size={15} />,
                                tooltip: "View",
                                variant: "ghost",
                                onClick: (row) => {
                                    setViewTL(tls.find((t) => t.id === row.id));
                                    openModal("view-tl-modal");
                                },
                            },
                        ]}
                        size={12}
                        pageSize={10}
                    />
                </div>
            </Grid>

            {/* Toasts & Dialogs */}
            <Toast toast={toast} />
            <ConfirmDialog
                open={confirm.open}
                title={confirm.title}
                message={confirm.message}
                onConfirm={confirm.onConfirm}
                onCancel={closeConfirm}
                loading={actionLoading}
            />

            {/* ── View TL Modal ── */}
            <Modal id="view-tl-modal" title="Team Leader Details" size="xl">
                {viewTL && (() => {
                    const cap = MAX_LEADS - viewTL.currentLeads;
                    const pct = Math.round((viewTL.currentLeads / MAX_LEADS) * 100);
                    return (
                        <div className="space-y-5">
                            <ModalProfile
                                name={viewTL.name}
                                subtitle={`${viewTL.status} · ${viewTL.hasTeam ? `Team: ${viewTL.teamName}` : 'No Team Assigned'}`}
                                meta={`Ref: ${maskId(viewTL.id, 'TL')} · ${viewTL.status}`}
                                avatarColor={viewTL.status === "Active" ? "#2a465a" : "#94a3b8"}
                            />
                            <ModalGrid title="Contact Info" cols={2}>
                                <ModalData label="Email" value={viewTL.email} />
                                <ModalData label="Mobile" value={viewTL.mobile} />
                            </ModalGrid>
                            <ModalGrid title="Lead Stats" cols={3}>
                                <ModalData label="Leads Assigned by Manager" value={viewTL.currentLeads} />
                                <ModalData label="Lead Limit" value={MAX_LEADS} />
                                <ModalData label="Capacity Left" value={cap} />
                                <ModalData label="Capacity Used" value={`${pct}%`} />
                                <ModalData label="Current Team" value={viewTL.teamName || '—'} />
                            </ModalGrid>
                            <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lead Capacity</p>
                                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500"}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5">{viewTL.currentLeads} / {MAX_LEADS} leads assigned</p>
                            </div>
                            <div className="flex justify-end">
                                <Button text="Close" variant="ghost" size={2} onClick={() => closeModal("view-tl-modal")} />
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* ── View Team Modal ── */}
            <Modal id="view-team-modal" title="Team Details" size="xl">
                {viewTeam && (() => {
                    const members = viewTeam.members || [];
                    return (
                        <div className="flex flex-col gap-5">
                            <ModalProfile
                                name={viewTeam.name}
                                subtitle={`Led by ${viewTeam.leaderName ?? "—"}`}
                                meta={`${members.length} member${members.length !== 1 ? "s" : ""} · Ref: ${maskId(viewTeam.id, 'TM')}`}
                            />
                            <ModalGrid title="Team Info" cols={2}>
                                <ModalData label="Team Name" value={viewTeam.name} />
                                <ModalData label="Team Leader" value={viewTeam.leaderName ?? "—"} />
                                <ModalData label="Members" value={members.length} />
                                <ModalData label="Leader Email" value={viewTeam.leaderEmail ?? "—"} />
                            </ModalGrid>

                            <div>
                                <p className="text-xs font-black text-[#2a465a] uppercase tracking-widest mb-3">
                                    Team Members (Sales Executives)
                                </p>
                                <DataTable
                                    columns={[
                                        { key: "name", label: "Name" },
                                        { key: "mobile", label: "Mobile" },
                                        { key: "currentLeads", label: "Leads" },
                                        { key: "status", label: "Status" },
                                    ]}
                                    rows={members}
                                    searchable={false}
                                    pageSize={10}
                                    size={12}
                                    actions={[
                                        {
                                            icon: <UserMinus size={14} />,
                                            tooltip: "Remove from Team",
                                            variant: "danger",
                                            onClick: (row) => confirmRemoveMember(viewTeam.id, row),
                                        },
                                    ]}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                                <Button text="Close" variant="ghost" size={2} onClick={() => closeModal("view-team-modal")} />
                                <Button
                                    text="Edit Members"
                                    variant="primary"
                                    size={2}
                                    onClick={() => {
                                        closeModal("view-team-modal");
                                        openEditTeam(teams.find(t => t.id === viewTeam.id) || viewTeam);
                                    }}
                                />
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* ── Create / Edit Team Modal ── */}
            <Modal
                id="team-form-modal"
                title={teamForm.id ? "Edit Team Members" : "Create New Team"}
                size="xl"
            >
                <div className="flex flex-col gap-5">

                    {/* Profile card for edit mode */}
                    {teamForm.id && (
                        <ModalProfile
                            name={teamForm.name || "Unnamed Team"}
                            subtitle={`Led by ${teamForm.leaderName || '—'}`}
                            meta={`${teamForm.memberIds.size} member${teamForm.memberIds.size !== 1 ? "s" : ""} selected · Ref: ${maskId(teamForm.id, 'TM')}`}
                        />
                    )}

                    {/* Team Name */}
                    <Grid cols={12} gap={4}>
                        <DataField
                            label="Team Name"
                            id="tf-name"
                            placeholder="e.g. Alpha Squad"
                            value={teamForm.name}
                            size={teamForm.id ? 12 : 6}
                            onChange={(e) => setTeamForm((p) => ({ ...p, name: e.target.value }))}
                        />

                        {/* Leader selector — CREATE only */}
                        {!teamForm.id && (
                            <SelectField
                                label="Team Leader"
                                id="tf-leader"
                                size={6}
                                value={teamForm.leaderId}
                                placeholder="Select a leader"
                                onChange={(e) => setTeamForm((p) => ({ ...p, leaderId: e.target.value }))}
                            >
                                {tls
                                    .filter((t) => t.status === "Active" && !t.hasTeam)
                                    .map((t) => (
                                        <Option key={t.id} value={t.id} label={t.name} />
                                    ))}
                            </SelectField>
                        )}

                        {/* Leader is LOCKED in edit mode */}
                        {teamForm.id && (
                            <div className="col-span-12">
                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                    <Lock size={14} className="text-amber-600 flex-shrink-0" />
                                    <p className="text-sm text-amber-700">
                                        <span className="font-bold">Team Leader is locked.</span>
                                        {" "}Only member changes are allowed. Leader: <span className="font-bold">{teamForm.leaderName}</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </Grid>

                    {/* Selected leader info — CREATE only */}
                    {!teamForm.id && teamForm.leaderId && (() => {
                        const leader = tls.find((t) => t.id === teamForm.leaderId);
                        if (!leader) return null;
                        return (
                            <ModalGrid title="Selected Leader Info" cols={3}>
                                <ModalData label="Email" value={leader.email} />
                                <ModalData label="Mobile" value={leader.mobile} />
                                <ModalData label="Status" value={leader.status} />
                                <ModalData label="Leads Assigned" value={leader.currentLeads} />
                                <ModalData label="Capacity Left" value={MAX_LEADS - leader.currentLeads} />
                            </ModalGrid>
                        );
                    })()}

                    {/* Member picker — only shown when leader is selected (create) or in edit mode */}
                    {(teamForm.id || teamForm.leaderId) && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-[#2a465a] uppercase tracking-widest">
                                    Select Sales Executives
                                    <span className="ml-2 text-slate-400 font-semibold normal-case tracking-normal">
                                        — already in another team are disabled
                                    </span>
                                </p>
                            </div>

                            <DataTable
                                columns={[
                                    {
                                        key: "selectState",
                                        label: "",
                                        headerNode: (() => {
                                            const available = employees.filter(
                                                (e) => !takenMemberIds(teamForm.id).has(e.id)
                                            );
                                            const allSel =
                                                available.length > 0 &&
                                                available.every((e) => teamForm.memberIds.has(e.id));
                                            return (
                                                <button
                                                    type="button"
                                                    onClick={(ev) => {
                                                        ev.stopPropagation();
                                                        setTeamForm((p) => {
                                                            const next = new Set(p.memberIds);
                                                            available.forEach((emp) =>
                                                                allSel ? next.delete(emp.id) : next.add(emp.id)
                                                            );
                                                            return { ...p, memberIds: next };
                                                        });
                                                    }}
                                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                                                        allSel
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
                                        ? teams.find(
                                            (t) => t.id !== teamForm.id && t.memberIds.has(emp.id)
                                          )
                                        : null;
                                    return {
                                        ...emp,
                                        selectState: (
                                            <button
                                                type="button"
                                                disabled={taken}
                                                onClick={() => { if (!taken) toggleTeamMember(emp.id); }}
                                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                                    selected
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
                                                : emp.teamLabel
                                                    ? `In: ${emp.teamLabel}`
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
                                {teamForm.memberIds.size} executive{teamForm.memberIds.size !== 1 ? "s" : ""} selected
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {teamError && (
                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
                            <AlertTriangle size={15} /> {teamError}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                        <Button text="Cancel" variant="ghost" size={2} onClick={() => closeModal("team-form-modal")} />
                        <Button
                            text={actionLoading ? "Saving..." : teamForm.id ? "Save Members" : "Create Team"}
                            variant="primary"
                            size={3}
                            onClick={saveTeam}
                            disabled={actionLoading}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}