# Sales Team Leader Workspace — Team Guide

> **Audience:** the 4 teammates building out this folder, and any AI assistants helping them.
> **Sub-team Leader:** Pranjal (Packet 1 — Dashboard + Targets, already shipped as the reference). Pranjal is the single point of contact for routes, sidebar, shared components, and PRs.
> **Scope:** everything in `crm/frontend/src/pages/sales/salesTeamLeader/`. No work outside this folder.

---

## 1. Project context (read first)

Graphura CRM is a multi-department, role-based platform. Hierarchy:

```
Super Admin → Admin → (Sales Manager / Management Manager / Finance Manager)
                            ↓
                       Sales Team Leader  ← THIS WORKSPACE
                            ↓
                       Sales Executive
```

The **Sales Team Leader (TL)** is the coordinator of one team of executives. Per the spec (Brief Section 7):

- **Scope:** own team's executives only. Cannot see other teams' data.
- **Lead capacity:** 1,500 leads max.
- **Cannot:** bulk-upload leads, restore dump leads, create/delete sales targets, or see anything outside their team.
- **Can:** assign/reassign leads inside team, view all team prospect forms, monitor 8 KPIs, send warning/appreciation messages to executives, approve team leaves, raise tickets to Sales Manager.

The 8 KPIs the TL must see (`teamLeaderStore.js → dashboardKPIs`):

1. Total Calls
2. Today Calls
3. Total Prospects
4. Today Sales
5. Talk Ratio
6. Untouched Leads
7. Dump Count
8. Follow-up Missed

---

## 2. Permissions & escalation (HARD RULES — read this section before writing any code)

These rules come from the Frontend Lead. Violations will block your PR.

### What you CANNOT touch directly

| File / Area | Why | What to do instead |
|---|---|---|
| `src/routes/Sales/salesTeamLeaderRoutes.jsx` | Single source of truth for routing — must stay conflict-free | Send the route snippet you need to **Pranjal**. Pranjal applies it. |
| `src/components/Sidebar.jsx` | Owned by the Frontend Lead | Discuss with **Pranjal**. Pranjal coordinates with the Frontend Lead, who applies the change. |
| `src/components/shared/Common_Components.jsx` | Owned by the Frontend Lead. Editing it can break every page in the app | Do NOT modify. If you need a tweak to an existing shared component, message **Pranjal** with the exact change requested. |

### What you CAN do for new components

If you need a new UI piece that isn't in `Common_Components.jsx`:

- **Option A (default):** create it as a separate file inside your packet's folder, e.g. `salesTeamLeader/leads/components/MyNewBit.jsx`. Use Tailwind + lucide-react, match the existing visual style.
- **Option B:** if it's reusable across packets, message **Pranjal** to request it be added to `Common_Components.jsx`. The Frontend Lead will add it.

### Escalation flow (memorize this)

```
Teammate (you) → Pranjal (sub-team leader) → Frontend Lead
```

You never go directly to the Frontend Lead. You never edit shared files. You give Pranjal a specific, copy-pasteable code request and Pranjal handles it.

---

## 3. Git workflow

- **Branch:** all work happens on the **`Sales-Team-Lead`** branch. Switch to it before you start.
  ```bash
  git fetch origin
  git checkout Sales-Team-Lead
  git pull origin Sales-Team-Lead
  ```
- **Push:** commit and push to `Sales-Team-Lead` only. **Do not push to `main` or any `feature/*` branch.**
- **Pull before push:** always `git pull --rebase origin Sales-Team-Lead` before pushing — multiple people share this branch, so stay current to avoid conflicts.
- **Commit scope:** keep commits limited to your packet's folder. If your commit touches a file outside your packet, stop and ping Pranjal.
- **No merging to main.** Pranjal will open the PR from `Sales-Team-Lead` to `main` when the workspace is complete.

---

## 4. Tech & conventions (do not deviate)

| Rule | What it means |
|---|---|
| **React + Vite + Tailwind** | No new dependencies. |
| **Shared components** | Import from `../../../components/shared/Common_Components.jsx`. The library exports `Heading`, `Grid`, `DashGrid`, `DashCard`, `DataTable`, `DataField`, `SelectField`, `Option`, `Button`, `Modal`, `ModalData`, `ModalGrid`, `ModalProfile`, `openModal`, `closeModal`, `GLineChart`, `GAreaChart`, `GColumnChart`, `GBarChart`, `GPieChart`, `GDoughnutChart`, `GRadarChart`, and more. **You may NOT modify this file** — see Section 2. |
| **New components** | Create them in your own packet folder, e.g. `leads/components/X.jsx`. Or request inclusion via Pranjal. |
| **Dummy data in `*Store.js`** | Never inline mock arrays in JSX. Always put them in a sibling `Store.js` file. |
| **Use `lucide-react` for icons** | Already imported across the codebase. Do not bring in another icon library. |
| **Modal IDs prefixed `tl-`** | e.g. `tl-tgt-view`, `tl-leave-approve`. |
| **No backend yet** | Everything is dummy. Do not write `fetch`, `axios`, or API services. |
| **No comments unless non-obvious** | The shared components are self-explanatory. Don't add prop descriptions. |

### DataTable column gotchas

A few things about `<DataTable columns={...} />` that aren't obvious from the prop list:

- **No custom `render` callback support.** Column entries are `{ key, label }` only. If you write `{ key: "foo", render: (row) => <Badge>{row.foo}</Badge> }`, the `render` is silently ignored and the cell falls back to `row[col.key]`. Don't waste time on render functions — they look like they work in your editor but the table won't call them.
- **`status` key auto-renders as a colored badge.** Whatever value sits in `row.status` gets matched against a built-in `STATUS_MAP` in `Common_Components.jsx` (Present/Active/Approved → emerald, Pending/Warm/Late → amber, Overdue → orange, Rejected/Failed/Absent → rose, etc.). Use Title-Case status values that match the map so colors apply automatically.
- **If you want a colored badge on a field that isn't `status`** — copy the field into a `status` column, OR ask Pranjal to add the field to `STATUS_MAP`. Don't roll your own pill component inside the table.
- **`userProfile="name"`** prop renders an avatar prefix on the column matching that key. Use it on tables where rows are people.

---

## 5. The 4 universal rules when copying from Sales Manager

We're cloning the Sales Manager pages and trimming them. Every copied file must apply these 4 fixes:

1. **Replace dummy executive/team arrays** — delete inline arrays. Import `teamExecutives` and `currentTL` from `teamLeaderStore.js` instead.
2. **Scope all data to the TL's team** — wherever Manager code shows "all teams", filter by `currentTL.team`. Drop "Team" columns and team filters from `<DataTable>`.
3. **Drop Manager-only actions** — Create Target, Bulk Upload, Delete Lead, Restore Dump, Cross-team Assign. TL is a coordinator, not an owner.
4. **Rename modal IDs** — prefix everything with `tl-` (e.g., `tgt-form-modal` → `tl-tgt-form-modal`).

After paste, run these search-replaces:

| Find | Replace with |
|---|---|
| `Sales Manager Dashboard` | `Team Leader Dashboard` |
| `"Sales"` (in page titles) | `"Team"` |
| `Manager` (in body copy) | `Team Leader` |

---

## 6. Folder structure (target)

```
src/pages/sales/salesTeamLeader/
│
├── teamLeaderStore.js                    [DONE]  Canonical dummy data — import from here
├── TEAM_GUIDE.md                         [this file]
│
│   ── Packet 1 (Pranjal — DONE) ──
├── SalesTeamLeaderDashboard.jsx          [DONE]  8 KPIs + 4 charts + leaderboard
├── SalesTeamLeaderTargets.jsx            [DONE]  View + update-progress only
├── targetsStore.js                       [DONE]
│
├── SalesTeamLeaderTickets.jsx            [DONE earlier — reference for in-folder import style]
│
│   ── Packet 2 — Leads workspace ──
├── SalesTeamLeaderLeads.jsx              [TODO] becomes <Outlet/> layout w/ tabs
├── leads/
│   ├── AllLeads.jsx                      [TODO] team leads + assign/reassign + filters
│   ├── Prospects.jsx                     [TODO] team prospect forms
│   ├── FollowUps.jsx                     [TODO] reminders + missed
│   └── leadsStore.js                     [TODO]
│
│   ── Packet 3 — My Team workspace ──
├── SalesTeamLeaderMyTeam.jsx             [TODO] becomes <Outlet/> layout w/ tabs
├── myTeam/
│   ├── TeamMembers.jsx                   [TODO]
│   ├── Attendance.jsx                    [TODO]
│   ├── LeaveApprovals.jsx                [TODO]
│   └── teamStore.js                      [TODO]  imports teamExecutives from root store
│
│   ── Packet 4 — Reports + Announcements ──
├── SalesTeamLeaderReports.jsx            [TODO] becomes <Outlet/> layout w/ tabs
├── reports/
│   ├── DailyReport.jsx                   [TODO] self daily report
│   ├── WeeklyReport.jsx                  [TODO]
│   ├── ExecutiveReport.jsx               [TODO] exec-wise breakdown
│   └── reportsStore.js                   [TODO]
├── SalesTeamLeaderAnnouncements.jsx      [TODO] warning/appreciation messages
├── announcementsStore.js                 [TODO]
│
│   ── Packet 5 — HRM + LoginLogs + PaymentAlerts ──
├── hrm/
│   ├── HRMPage.jsx                       [TODO] tab layout (Attendance | Leaves) — mirrors Manager's HrmLayout
│   ├── Attendance.jsx                    [TODO] self KPIs + clock-in/out widget + attendance log + work summary + charts
│   └── Leaves.jsx                        [TODO] My Leaves table + Apply Leave modal (no Pending/History — that's Packet 3)
├── loginLogs/
│   └── LoginLogs.jsx                     [TODO] self + team executives
└── payments/
    └── PaymentAlerts.jsx                 [TODO] failed/successful (self + team)
```

> **Note:** routes and sidebar entries for every packet are added by Pranjal (see Section 2). You only build the page; you ship a route snippet to Pranjal when your page is ready.

---

## 7. Reference implementations (study these)

Before writing any code, **open these in the editor** and read them:

- `src/pages/sales/salesTeamLeader/SalesTeamLeaderDashboard.jsx` — KPI grid + charts pattern
- `src/pages/sales/salesTeamLeader/SalesTeamLeaderTargets.jsx` — table + view-modal + update-progress pattern
- `src/pages/sales/salesTeamLeader/SalesTeamLeaderTickets.jsx` — table + form-modal + filtering pattern
- `src/pages/sales/salesTeamLeader/teamLeaderStore.js` — dummy data shape

For copy-paste sources (one level up in `salesManager/`):

| Your Packet | Copy from |
|---|---|
| Packet 2 (Leads) | `src/pages/sales/salesManager/leads/{LeadsLayout,AllLeads,Prospects,FollowUps,leadsStore}` |
| Packet 3 (My Team) | `src/pages/sales/salesManager/Employees/Employees.jsx` + `salesManager/HRM/{Attendance,Leaves}.jsx` |
| Packet 4 (Reports) | `src/pages/sales/salesManager/Reports/*` |
| Packet 4 (Announcements) | `src/pages/sales/salesManager/Announcements/*` |
| Packet 5 (HRM) | `src/pages/sales/salesManager/HRM/{HrmLayout,Attendance,Leaves}.jsx` — use Manager's tabbed layout (Attendance \| Leaves), trim to self-only data and drop the "Pending Leaves" / "Leave History" tables (those Approve-others workflows live in Packet 3). |
| Packet 5 (Login Logs) | `src/pages/sales/salesManager/LoginLogs/LoginLogs.jsx` |
| Packet 5 (Payment Alerts) | `src/pages/sales/salesExecutive/payments/PaymentsPage.jsx` |

---

## 8. Per-packet specifications

### Packet 2 — Leads workspace

**Pages to build:**

- `SalesTeamLeaderLeads.jsx` — convert from stub into a layout component with tab navigation and `<Outlet />`
- `leads/AllLeads.jsx`
- `leads/Prospects.jsx`
- `leads/FollowUps.jsx`
- `leads/leadsStore.js`

**Spec features (from Brief Section 7):**

- View team's leads with filters: `Talk` / `Not Talk` / `Untouched` / `Interested`
- Assign/Reassign leads to executives (individual + bulk)
- View & update prospect forms across the team
- View team reminders + add reminder
- Detect missed follow-ups
- Click-to-connect (WhatsApp + voice call) — already exists in shared components

**What to drop from the Manager copy:**

- `BulkUpload.jsx` (Manager-only — TL doesn't bulk-upload leads, only re-distributes)
- `DumpData.jsx` (Manager-only — TL cannot restore dump per Brief Section 15)

**Routing:** the parent route `/sales-team-leader/leads` already exists. Your `SalesTeamLeaderLeads.jsx` becomes the layout. **Send Pranjal the nested-route snippet** (e.g. `<Route path="prospects" element={<Prospects />} />`) when your sub-pages are ready — Pranjal will add it to the routes file.

---

### Packet 3 — My Team workspace

**Pages to build:**

- `SalesTeamLeaderMyTeam.jsx` — layout with tabs
- `myTeam/TeamMembers.jsx` — list of executives, basic profile cards, contact info
- `myTeam/Attendance.jsx` — team attendance grid (per-exec attendance status)
- `myTeam/LeaveApprovals.jsx` — pending leave requests with Approve/Reject actions
- `myTeam/teamStore.js`

**Spec features (from Brief Section 7):**

- View team members
- Track attendance
- View leave requests + approve team leaves
- Performance per executive (link to Dashboard for full leaderboard — keep this page focused on team admin)

**What to drop / change from Manager copy:**

- Drop "Team" filter (TL only sees one team)
- Drop "Add team member" / "Move between teams" actions (Manager-only)
- Use `teamExecutives` from `teamLeaderStore.js` — do not redefine

**Routing:** parent route `/sales-team-leader/my-team` exists. Send Pranjal the nested-route snippet for sub-pages.

---

### Packet 4 — Reports + Announcements

**Pages to build:**

- `SalesTeamLeaderReports.jsx` — layout with tabs
- `reports/DailyReport.jsx` — self daily report (Total calls, Today calls, Today prospect, Today sells, Today dump, Total untouched)
- `reports/WeeklyReport.jsx`
- `reports/ExecutiveReport.jsx` — per-executive breakdown
- `reports/reportsStore.js`
- `SalesTeamLeaderAnnouncements.jsx` — single page (no sub-pages); compose + list of past messages
- `announcementsStore.js`

**Spec features (from Brief Section 7):**

- Reports: Daily / Weekly / Monthly + Executive-wise + self daily report
- Announcements: send `Warning` or `Appreciation` message to a specific executive

**What to drop from Manager copy:**

- `TLReports.jsx` (Manager looks at TLs; TL doesn't manage other TLs)
- `TeamReports.jsx` (TL has only one team — no cross-team report)
- Audience picker: Manager picks dept/team/role; TL picks one executive from `teamExecutives`

**Routing:** parent routes `/reports` and `/communication` already exist. Send Pranjal the nested-route snippet for the Reports sub-pages.

---

### Packet 5 — HRM + LoginLogs + PaymentAlerts

**Pages to build:**

- `hrm/HRMPage.jsx` — top-level tab layout (Attendance | Leaves), matches Manager's `HrmLayout.jsx`
- `hrm/Attendance.jsx` — self KPIs + clock-in/out widget + attendance log + work summary + charts
- `hrm/Leaves.jsx` — My Leaves table + Apply Leave modal
- `loginLogs/LoginLogs.jsx` — logs for self + team executives (username, date/time, IP, lat/long)
- `payments/PaymentAlerts.jsx` — failed/successful payment feed for self + team

**Spec source for self-HRM:** copy from `salesManager/HRM/{HrmLayout,Attendance,Leaves}.jsx`. Use Manager's tabbed structure but trim to self-only data — drop the Pending Leaves and Leave History tables (those Approve-others workflows live in Packet 3's `LeaveApprovals.jsx`). The clock-in/out widget shape comes from `services/hrmService.js`.

**Routing — these are NEW routes that don't exist yet.** When your pages are ready, send Pranjal the following snippet (or your final version of it):

```jsx
<Route path="hrm" element={<HRMPage />} />
<Route path="login-logs" element={<LoginLogs />} />
<Route path="payment-alerts" element={<PaymentAlerts />} />
```

Pranjal will add it to `salesTeamLeaderRoutes.jsx` and request the matching sidebar entries from the Frontend Lead.

---

## 9. Coordination rules

1. **Branch:** everyone works on `Sales-Team-Lead`. No feature branches inside the team.
2. **`teamLeaderStore.js` is canonical.** Do not redefine `teamExecutives` or `currentTL` anywhere. If you need new fields, ping Pranjal.
3. **Routes / sidebar / shared components:** never edited by you — see Section 2. Send Pranjal a request with the exact code you need.
4. **PR review.** Pranjal reviews every commit on the branch. Match the style of the already-shipped Dashboard and Targets pages.
5. **Modal IDs.** Always prefix `tl-`. Never reuse an ID across pages.
6. **No cross-packet edits.** If your work needs to change a file in another packet's folder, stop and discuss with Pranjal first.

---

## 10. Test plan (run before each push)

1. `cd frontend && npm install` (first time only)
2. `npm run dev`
3. Log in as Sales Team Leader (use the existing department-login flow)
4. Visit your packet's routes:
   - Packet 2: `/sales-team-leader/leads`, `/sales-team-leader/leads/prospects`, `/sales-team-leader/leads/follow-ups`
   - Packet 3: `/sales-team-leader/my-team`, `/sales-team-leader/my-team/attendance`, `/sales-team-leader/my-team/leaves`
   - Packet 4: `/sales-team-leader/reports/*`, `/sales-team-leader/communication`
   - Packet 5: `/sales-team-leader/hrm`, `/sales-team-leader/login-logs`, `/sales-team-leader/payment-alerts` *(routes go live after Pranjal adds them)*
5. Verify on each page:
   - Page renders without console errors
   - All tables show data + pagination + search + export work
   - All filters apply (no broken keys)
   - All modals open and close properly
   - No data references outside the TL's team
6. Compare visual style against `SalesTeamLeaderDashboard.jsx` and `SalesTeamLeaderTargets.jsx`.

---

## 11. Common pitfalls

- **Editing routes / sidebar / `Common_Components.jsx` directly.** Hard rule violation — see Section 2. Always go through Pranjal.
- **Pushing to a feature branch instead of `Sales-Team-Lead`.** Switch branches before you start.
- **Forgetting to scope to team.** Leaving "Team" filters in `<DataTable>` is the #1 spec violation.
- **Inline dummy data.** Mock arrays must live in `*Store.js`. PRs with inline arrays in JSX will be rejected.
- **Modal ID collisions.** Always prefix `tl-`.
- **Cross-team data.** `teamExecutives` lists 6 people. Do not add executives from outside the TL's team.
- **Adding API calls.** Backend isn't ready. Keep everything in component state.
- **Adding a new shared component on your own.** Either create it inside your packet folder, or request it via Pranjal — never modify `Common_Components.jsx`.
- **Writing a `render` callback on a `<DataTable>` column.** Silently ignored — the table only reads `{ key, label }`. The `status` key auto-styles via the built-in `STATUS_MAP`; for everything else, render plain text or restructure the data. See Section 4 for details.

---

## 12. Acceptance criteria for Pranjal's review

A commit is ready to merge into `Sales-Team-Lead` when:

- [ ] Files only inside your packet's folder were modified
- [ ] No edits to `salesTeamLeaderRoutes.jsx`, `Sidebar.jsx`, or `Common_Components.jsx`
- [ ] All UI uses shared components (no custom UI primitives unless created in your packet folder)
- [ ] Dummy data lives in a `*Store.js` file
- [ ] All data is scoped to `currentTL.team` / `teamExecutives`
- [ ] No Manager-only features leaked through (no Bulk Upload, no Restore from Dump, no Create Target, no cross-team filters)
- [ ] All modal IDs prefixed `tl-`
- [ ] Page renders without console errors and matches the visual style of Dashboard / Targets
- [ ] No `console.log`, no `fetch`, no commented-out code
- [ ] No new npm dependencies added
- [ ] Route snippet (if any) sent to Pranjal in chat / PR comment, NOT applied to the routes file by you

---

## Appendix — quick component cheat-sheet

```jsx
// 12-column grid layout
<Grid cols={12} gap={4}>
  <Heading primaryText="My Page" secondaryText="Subtitle" size={12} />
</Grid>

// KPI dashboard cards
<DashGrid cols={12} gap={4}>
  <DashCard title="Total" value="1,240" icon={<Users size={20} />} accentColor="#3b82f6" size={3} />
</DashGrid>

// Data table — searchable, exportable, with row actions
<DataTable
  title="My Table"
  columns={[{ key: "id", label: "ID" }, { key: "name", label: "Name" }]}
  rows={rows}
  size={12}
  pageSize={10}
  searchable
  exportable
  exportFileName="my_data"
  filters={[{ title: "Status", type: "toggle", key: "status", options: ["Active", "Inactive"] }]}
  actions={[{ icon: <Eye size={15} />, tooltip: "View", variant: "ghost", onClick: (row) => {...} }]}
/>

// Modal pattern
<Modal id="tl-my-modal" title="Details" size="md">
  <ModalProfile name="..." subtitle="..." meta="..." />
  <ModalGrid title="Section" cols={2}>
    <ModalData label="Field" value="..." />
  </ModalGrid>
  <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-my-modal")} />
</Modal>

// Form fields
<DataField label="Name *" id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
<SelectField label="Type" id="type" value={form.type} onChange={(e) => set("type", e.target.value)}>
  <Option value="A" label="Option A" />
</SelectField>
```
