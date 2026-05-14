# Management Manager Workspace — Team Guide

> **Audience:** the 4 teammates building out this folder, and any AI assistants helping them.
> **Sub-team Leader:** Pranjal (Packet 1 — Dashboard + Projects, will ship first as the reference). Pranjal is the single point of contact for routes, sidebar, shared components, and PRs.
> **Scope:** everything in `crm/frontend/src/pages/management/managementManager/`. No work outside this folder.

---

## 1. Project context (read first)

Graphura CRM is a multi-department, role-based platform. Hierarchy:

```
Super Admin → Admin → (Sales Manager / Management Manager / Finance Manager)
                                    ↓
                       Management Manager  ← THIS WORKSPACE
                                    ↓
                       Management Team Leader
                                    ↓
                       Management Employee
```

The **Management Manager (MM)** is the head of the Projects department. Per the spec (Brief Section 9):

- **Scope:** all projects, all team leaders, and all employees inside the Management department of this tenant. Sees three layers down: Self + TL + Employee.
- **Data unit:** projects, not leads. There is **no lead-capacity number**. (The "6,000 leads per instance" cap from Section 3 belongs to Sales — ignore it here.)
- **Cannot:** create/delete departments (Super Admin only), touch Sales or Finance data, do anything outside the Management department.
- **Can:** view/edit every project, set start date / priority / deadline, assign or reassign Team Leaders & Employees on any project, update project status, add the mandatory project-details drive link and the mandatory handover link, confirm delivery, monitor team performance, view login logs for self + TL + employees, and use HRM (apply leave, clock in/out, attendance).

Two **mandatory** fields the MM must enforce on every project (Brief Section 9):

1. **Project details drive link** — set at project creation / first edit.
2. **Final handover link** — set before delivery confirmation.

If either is missing, the project cannot be moved to "Delivered". Build the UI to block that transition.

The **Client Project Tracking Page** (Brief Section 14) is an external, no-login page that mirrors what the MM sets here: start date, expected delivery, milestones, progress %, WO status, payment, handover link. **You are not building that page** — it's a separate workspace — but every field you add on the MM side should correspond to something the tracking page reads. When in doubt, check Brief Section 14.

---

## 2. Permissions & escalation (HARD RULES — read this section before writing any code)

These rules come from the Frontend Lead. Violations will block your PR.

### What you CANNOT touch directly

| File / Area | Why | What to do instead |
|---|---|---|
| `src/routes/Manager/ManagementManagerRoutes.jsx` | Single source of truth for routing — must stay conflict-free | Send the route snippet you need to **Pranjal**. Pranjal applies it. |
| `src/routes/AppRoutes.jsx` | Owned by the Frontend Lead. The top-level `/management-manager/*` mount lives here | Do NOT modify. Pranjal coordinates with the Frontend Lead. |
| `src/components/Sidebar.jsx` | Owned by the Frontend Lead. The `management-manager` menu key is added here | Discuss with **Pranjal**. Pranjal coordinates with the Frontend Lead, who applies the change. |
| `src/components/shared/Common_Components.jsx` | Owned by the Frontend Lead. Editing it can break every page in the app | Do NOT modify. If you need a tweak to an existing shared component, message **Pranjal** with the exact change requested. |

### What you CAN do for new components

If you need a new UI piece that isn't in `Common_Components.jsx`:

- **Option A (default):** create it as a separate file inside your packet's folder, e.g. `managementManager/projects/components/MilestoneBar.jsx`. Use Tailwind + lucide-react, match the existing visual style.
- **Option B:** if it's reusable across packets, message **Pranjal** to request it be added to `Common_Components.jsx`. The Frontend Lead will add it.

### Escalation flow (memorize this)

```
Teammate (you) → Pranjal (sub-team leader) → Frontend Lead
```

You never go directly to the Frontend Lead. You never edit shared files. You give Pranjal a specific, copy-pasteable code request and Pranjal handles it.

---

## 3. Git workflow

- **Branch:** all work happens on the **`Management-Manager-Panel`** branch. Switch to it before you start.
  ```bash
  git fetch origin
  git checkout Management-Manager-Panel
  git pull origin Management-Manager-Panel
  ```
- **Push:** commit and push to `Management-Manager-Panel` only. **Do not push to `main`, `Sales-Team-Lead`, or any `feature/*` branch.**
- **Pull before push:** always `git pull --rebase origin Management-Manager-Panel` before pushing — multiple people share this branch, so stay current to avoid conflicts.
- **Commit scope:** keep commits limited to your packet's folder. If your commit touches a file outside your packet, stop and ping Pranjal.
- **No merging to main.** Pranjal will open the PR from `Management-Manager-Panel` to `main` when the workspace is complete.

---

## 4. Tech & conventions (do not deviate)

| Rule | What it means |
|---|---|
| **React + Vite + Tailwind** | No new dependencies. |
| **Shared components** | Import from `../../../components/shared/Common_Components.jsx`. The library exports `Heading`, `Grid`, `DashGrid`, `DashCard`, `DataTable`, `DataField`, `SelectField`, `Option`, `Button`, `Modal`, `ModalData`, `ModalGrid`, `ModalProfile`, `openModal`, `closeModal`, `GLineChart`, `GAreaChart`, `GColumnChart`, `GBarChart`, `GPieChart`, `GDoughnutChart`, `GRadarChart`, and more. **You may NOT modify this file** — see Section 2. |
| **New components** | Create them in your own packet folder, e.g. `projects/components/X.jsx`. Or request inclusion via Pranjal. |
| **Dummy data in `*Store.js`** | Never inline mock arrays in JSX. Always put them in a sibling `Store.js` file. |
| **Use `lucide-react` for icons** | Already imported across the codebase. Do not bring in another icon library. |
| **Modal IDs prefixed `mm-`** | e.g. `mm-project-view`, `mm-project-assign`, `mm-leave-approve`. |
| **No backend yet** | Everything is dummy. Do not write `fetch`, `axios`, or API services. |
| **No comments unless non-obvious** | The shared components are self-explanatory. Don't add prop descriptions. |
| **Drive links are mandatory** | Every project row in your dummy data has `driveLink` and (if delivered) `handoverLink`. Don't drop these fields when copying. |

### DataTable column gotchas

A few things about `<DataTable columns={...} />` that aren't obvious from the prop list:

- **No custom `render` callback support.** Column entries are `{ key, label }` only. If you write `{ key: "foo", render: (row) => <Badge>{row.foo}</Badge> }`, the `render` is silently ignored and the cell falls back to `row[col.key]`. Don't waste time on render functions — they look like they work in your editor but the table won't call them.
- **`status` key auto-renders as a colored badge.** Whatever value sits in `row.status` gets matched against a built-in `STATUS_MAP` in `Common_Components.jsx` (Present/Active/Approved/Delivered → emerald, Pending/Warm/In Progress → amber, Overdue/Delayed → orange, Rejected/Failed/Absent → rose, etc.). Use Title-Case status values that match the map so colors apply automatically.
- **If you want a colored badge on a field that isn't `status`** — copy the field into a `status` column, OR ask Pranjal to add the field to `STATUS_MAP`. Don't roll your own pill component inside the table.
- **`userProfile="name"`** prop renders an avatar prefix on the column matching that key. Use it on tables where rows are people (Team Leaders, Employees, Clients).

---

## 5. The 4 universal rules when copying from Sales Manager

We're cloning the Sales Manager pages (Dashboard, Employees, HRM, LoginLogs, Announcements, Reports, Support, Teams) and re-pointing them at projects/Management data. Every copied file must apply these 4 fixes:

1. **Replace dummy lead/sales arrays** — delete inline arrays. Import `projects`, `teamLeaders`, `employees`, `currentMM` from `managementManagerStore.js` instead.
2. **Scope all data to the Management department** — drop "Sales" labels, change column copy ("Calls" → "Projects", "Sales" → "Delivered", "Talk Ratio" → "On-time %", etc.). No lead/calls/talk-ratio metrics survive into the MM workspace.
3. **Drop Sales-only actions** — Bulk Lead Upload, Restore Dump, Sales Targets, Click-to-Connect (WhatsApp/voice), Prospect forms, Follow-up reminders. MM owns project lifecycle, not lead lifecycle.
4. **Rename modal IDs** — prefix everything with `mm-` (e.g., `tgt-form-modal` → `mm-project-form-modal`).

After paste, run these search-replaces:

| Find | Replace with |
|---|---|
| `Sales Manager Dashboard` | `Management Manager Dashboard` |
| `"Sales"` (in page titles) | `"Projects"` |
| `Sales Manager` (in body copy) | `Management Manager` |
| `Sales Executive` / `Executive` (when it means the role) | `Employee` |
| `Sales Team Leader` (when it means the role) | `Management Team Leader` |
| `lead` / `leads` (in field names, copy) | `project` / `projects` |

---

## 6. Folder structure (target)

```
src/pages/management/managementManager/
│
├── managementManagerStore.js              [TODO — Packet 1]  Canonical dummy data — import from here
├── TEAM_GUIDE.md                          [this file]
│
│   ── Packet 1 (Pranjal — first to ship as reference) ──
├── ManagementManagerDashboard.jsx         [TODO]  6 KPIs + 4 charts (project status / on-time / team load / monthly delivery)
├── ManagementManagerProjects.jsx          [TODO]  Outlet layout with tabs (All / Active / Delivered / Delayed)
├── projects/
│   ├── AllProjects.jsx                    [TODO]  table + view-modal + edit-modal + assign-TL + status update + handover link
│   ├── ActiveProjects.jsx                 [TODO]  filtered subset
│   ├── DeliveredProjects.jsx              [TODO]  read-only + handover link visible
│   ├── DelayedProjects.jsx                [TODO]  past deadline, not delivered
│   └── projectsStore.js                   [TODO]
│
│   ── Packet 2 — Teams workspace ──
├── ManagementManagerTeams.jsx             [TODO]  Outlet layout w/ tabs (Team Leaders | Employees | Team Structure)
├── teams/
│   ├── TeamLeaders.jsx                    [TODO]  TL list, view, reassign, performance summary
│   ├── Employees.jsx                      [TODO]  employee list, view, reassign-to-TL, status
│   ├── TeamStructure.jsx                  [TODO]  org-tree-style view (TL → employees), drag-or-move-modal
│   └── teamsStore.js                      [TODO]
│
│   ── Packet 3 — Clients + Reports ──
├── ManagementManagerClients.jsx           [TODO]  client list, drive link per client, multi-project view per client
├── clientsStore.js                        [TODO]
├── ManagementManagerReports.jsx           [TODO]  Outlet layout w/ tabs (Project / Team / Delivery / TL-wise)
├── reports/
│   ├── ProjectReports.jsx                 [TODO]
│   ├── TeamReports.jsx                    [TODO]
│   ├── DeliveryReports.jsx                [TODO]  on-time % / delayed / delivered counts
│   ├── TLReports.jsx                      [TODO]  per-TL breakdown
│   └── reportsStore.js                    [TODO]
│
│   ── Packet 4 — HRM + LoginLogs + Tickets ──
├── hrm/
│   ├── HRMPage.jsx                        [TODO]  tab layout (Attendance | Leaves) — mirrors Manager's HrmLayout
│   ├── Attendance.jsx                     [TODO]  KPIs + SessionTimer (My Attendance, shared with Navbar) + TL+Employee attendance table
│   └── Leaves.jsx                         [TODO]  My Leaves + Pending Leaves (Approve/Reject TL & Employees) + Leave History
├── loginLogs/
│   └── LoginLogs.jsx                      [TODO]  self + TL + employee (scope per Brief Section 3)
├── ManagementManagerTickets.jsx           [TODO]  wrapper holding state + AllTickets (mirrors Manager's SupportLayout)
├── tickets/
│   └── AllTickets.jsx                     [TODO]  KPIs + Create + My Tickets + Team Tickets + chat-modals
└── ticketsStore.js                        [TODO]
│
```

> **Note:** routes and sidebar entries for every packet are added by Pranjal (see Section 2). You only build the page; you ship a route snippet to Pranjal when your page is ready.

---

## 7. Reference implementations (study these)

Before writing any code, **open these in the editor** and read them. The Sales Team Leader workspace already shipped — its patterns are exactly what we copy here, just re-pointed at project data:

- `src/pages/sales/salesTeamLeader/SalesTeamLeaderDashboard.jsx` — KPI grid + charts pattern
- `src/pages/sales/salesTeamLeader/SalesTeamLeaderTargets.jsx` — table + view-modal + update-progress pattern
- `src/pages/sales/salesTeamLeader/SalesTeamLeaderTickets.jsx` — table + form-modal + filtering pattern
- `src/pages/sales/salesTeamLeader/teamLeaderStore.js` — dummy data shape
- `src/pages/sales/salesTeamLeader/hrm/{HRMPage,Attendance,Leaves}.jsx` — full HRM pattern (we copy this almost as-is)

For copy-paste sources (one level up in `salesManager/`):

| Your Packet | Copy from |
|---|---|
| Packet 1 (Dashboard) | `src/pages/sales/salesManager/Dashboard.jsx` — keep the KPI/charts shape, swap the data source. Drop calls/talk-ratio cards entirely. |
| Packet 1 (Projects) | No clean Sales analogue. Build from scratch using `<DataTable>` + `<Modal>` patterns. The closest reference is `src/pages/sales/salesTeamLeader/SalesTeamLeaderTargets.jsx` (table + view + update-progress flow). |
| Packet 2 (Teams) | `src/pages/sales/salesManager/Teams.jsx` + `src/pages/sales/salesManager/Employees/Employees.jsx` |
| Packet 3 (Clients) | No direct analogue. Use `<DataTable>` + drill-in modal listing per-client projects. |
| Packet 3 (Reports) | `src/pages/sales/salesManager/Reports/*` |
| Packet 4 (HRM) | `src/pages/sales/salesTeamLeader/hrm/{HRMPage,Attendance,Leaves}.jsx` — already tightened for non-Manager scope; the only edit is data source. |
| Packet 4 (Login Logs) | `src/pages/sales/salesManager/LoginLogs/LoginLogs.jsx` |
| Packet 4 (Tickets) | `src/pages/sales/salesTeamLeader/tickets/AllTickets.jsx` + `salesTeamLeader/ticketsStore.js` (full pattern already trimmed for non-Sales role) |

---

## 8. Per-packet specifications

### Packet 1 — Dashboard + Projects (reference — Pranjal ships this first)

**Pages to build:**

- `managementManagerStore.js` — canonical store. Exports `currentMM` (the logged-in MM), `teamLeaders` (3–4 TL profiles), `employees` (10–12 with `teamLeaderId` linking them to a TL), `projects` (20–25 with full lifecycle fields), `dashboardKPIs`, `projectStatusFunnel`, `monthlyDelivery`, `tlLoad` (chart-ready), `clientList`.
- `ManagementManagerDashboard.jsx` — 6 KPI cards + 4 charts + recent-projects leaderboard.
- `ManagementManagerProjects.jsx` — `<Outlet />` layout with tab navigation.
- `projects/AllProjects.jsx`, `ActiveProjects.jsx`, `DeliveredProjects.jsx`, `DelayedProjects.jsx`, `projectsStore.js`.

**6 KPIs the MM dashboard must show** (derived from Brief Sections 9 & 14):

1. Total Projects
2. Active Projects (`In Progress` + `Work Started` + `Review Stage`)
3. Delivered (this month)
4. Delayed (past deadline, not delivered)
5. On-time Delivery %
6. Pending Handover Links (delivered status but `handoverLink` missing — flags MM action)

**Project row shape** (canonical — every store/table must use exactly these keys):

```js
{
  id: "PRJ-001",
  name: "Acme Website Redesign",
  clientId: "CL-001",
  clientName: "Acme Corp",
  clientMobile: "+91 98xxx xxxxx",
  driveLink: "https://drive.google.com/...",    // MANDATORY
  startDate: "2026-03-10",
  deadline: "2026-05-20",
  priority: "High",                              // High | Medium | Low
  assignedTL: "TL-101",
  assignedTLName: "Ravi Khanna",
  assignedEmployees: ["EM-201", "EM-202"],
  status: "In Progress",                         // Not Started | In Progress | Work Started | Review Stage | Finalization | Delivered | Delayed
  progress: 45,                                  // 0–100
  handoverLink: null,                            // MANDATORY before status="Delivered"
  deliveredDate: null,
  lastUpdated: "2026-05-08",
}
```

**Spec features (from Brief Section 9):**

- View / edit all projects (every column editable from a single modal)
- Add project-details drive link (mandatory at create-time)
- Set start date, priority, deadline
- Assign Team Leader (dropdown sourced from `teamLeaders`)
- Update project status (the 7-stage funnel above)
- Final handover link (mandatory before flipping to `Delivered`)
- Confirm delivery
- Reassign TL or Employee on any project

**Hard rules for the Projects table:**

- The "Mark Delivered" action must check `handoverLink` is non-null AND `driveLink` is non-null. If either is missing, open a modal pointing the MM at the right field — do not allow the status flip.
- Priority column gets the same auto-badge treatment as `status` only if `STATUS_MAP` already covers `High`/`Medium`/`Low` (it does — they map to rose / amber / slate). If you change priority labels, request a `STATUS_MAP` extension via Pranjal.
- Don't roll a custom "drive link" cell. Just use the URL string as-is; if Pranjal needs a clickable cell later, that goes through the shared-component request flow.

**What to drop / change from Sales Manager copy:**

- All lead / call / talk-ratio metrics
- Sales targets (no MM-side targets — projects have deadlines, not quotas)
- Bulk-upload via CSV (MM creates projects one at a time)
- Conversion-rate chart (no leads → no conversion %)

**Routing:** the top-level mount `/management-manager/*` doesn't exist yet. **Pranjal will add it** in coordination with the Frontend Lead. Once it lives, send Pranjal the nested-route snippet for `projects/*`. Do NOT touch `AppRoutes.jsx` or `ManagementManagerRoutes.jsx` yourself.

---

### Packet 2 — Teams workspace

**Pages to build:**

- `ManagementManagerTeams.jsx` — Outlet layout with three tabs.
- `teams/TeamLeaders.jsx` — list of TLs, profile cards, current project load, performance summary.
- `teams/Employees.jsx` — list of employees with their current TL, status, projects-in-flight.
- `teams/TeamStructure.jsx` — visual org tree (TL → their employees) + "Move Employee" modal that calls a `moveEmployeeToTL(empId, newTLId)` state mutation.
- `teams/teamsStore.js` — re-exports `teamLeaders` + `employees` from `managementManagerStore.js`; do NOT redefine.

**Spec features (from Brief Section 9):**

- Assign team leaders & employees (initial assignment + reassignment)
- Change team structure (move an employee from one TL to another)
- Monitor team performance (read-only summary; drill-down goes to Reports)

**What to drop / change from Manager copy:**

- "Create Team" + "Delete Team" — out of scope per Brief Section 9 (MM works inside the existing Management dept; it doesn't create new sub-departments).
- "Team-wise filter on a leads table" — there are no leads in MM; you're filtering projects by TL instead.
- Sales-specific columns (calls / dump / talk ratio) on the Employees table — replace with `activeProjects`, `completedProjects`, `delayedProjects`.

**Routing:** parent route `/management-manager/teams` does not exist yet. Send Pranjal the route snippet for the layout + 3 children when ready.

---

### Packet 3 — Clients + Reports

**Pages to build:**

- `ManagementManagerClients.jsx` — client list table. Row click opens a modal showing: client mobile (primary key per Brief Section 12), email, all projects (multi-row), each project's drive link + handover link + status.
- `clientsStore.js` — `clients` array; each row has `id`, `name`, `mobile`, `email`, `driveLink` (general client folder), `projectIds: []`.
- `ManagementManagerReports.jsx` — Outlet layout with tabs.
- `reports/ProjectReports.jsx` — Daily / Weekly / Monthly delivery counts.
- `reports/TeamReports.jsx` — per-team (i.e., per-TL) progress.
- `reports/DeliveryReports.jsx` — on-time %, delayed %, average delay days.
- `reports/TLReports.jsx` — TL-wise breakdown (projects assigned, delivered, delayed, average completion days).
- `reports/reportsStore.js`.

**Spec features:**

- Clients: collect client details + add drive link (Brief Section 9.c). Mobile is the primary identifier (Brief Section 12 / 22).
- Reports: project / team / delivery / TL-wise breakdown, matching the level of detail Sales Manager has for their domain.

**What to drop / change from Manager copy:**

- "Conversion rate" / "Revenue" / "Calls per executive" — none of these apply. Replace with delivery-throughput and on-time-% metrics.
- Sales-specific export filenames (`leads_export.csv`) — use `projects_export.csv`, `clients_export.csv`, etc.

**Routing:** send Pranjal the route snippet when ready.

---

### Packet 4 — HRM + LoginLogs + Tickets

**Pages to build:**

- `hrm/HRMPage.jsx` — top-level tab layout (Attendance | Leaves), mirrors `salesTeamLeader/hrm/HRMPage.jsx`.
- `hrm/Attendance.jsx` — KPIs (Present Today, On Time, Absent Today, On Leave) + **`<SessionTimer>` from `components/shared` driven by `useAttendance()`** for MM self clock-in/out (matches the Navbar timer, do not roll a custom clock) + **department-wide attendance table** scoped to the TLs + Employees in this MM's department.
- `hrm/Leaves.jsx` — KPIs + Apply Leave button + **three tables**: My Leaves (MM's own), Pending Leaves (TL + Employee pending — with Approve/Reject row actions), Leave History (actioned).
- `loginLogs/LoginLogs.jsx` — logs for self + TLs + Employees (username, date/time, IP, lat/long, role). Scope per Brief Section 3.
- `ManagementManagerTickets.jsx` — wrapper holding `tickets` state, renders `<AllTickets />`. Mirrors `salesTeamLeader/SalesTeamLeaderTickets.jsx`.
- `tickets/AllTickets.jsx` — KPI cards + Create button + My Tickets table + Team Tickets table + chat-modals.
- `ticketsStore.js` — `initialTickets` (Team Tickets — from TLs/Employees → MM), `MY_TICKETS_SEED` (MM → Admin for escalation), `kpiTickets`, role constants. `<UserChat currentUser>` is `"Management Manager"`.

**Spec features:**

- HRM (Brief Section 16): MM has dept-wide scope — sees attendance + can approve leaves for everyone in Management dept.
- Login Logs (Brief Section 9.a): Self + TL + Employee (the full 3-layer view).
- Tickets (no explicit MM ticket spec in Section 9, but every role gets the standard ticket UI per Brief Section 16/HRM table — Tickets are how MM communicates issues to Admin and receives them from TL/Employees).

**Source-of-truth choice for HRM:** use the **Sales Team Leader HRM** files as the base. Reasons:
- They've already been trimmed for non-Sales-Manager scope.
- They already use `<SessionTimer>` + `useAttendance()` correctly.
- They already wire Apply Leave / Pending / History tables.
- You only need to swap the data source (TL+Exec → TL+Employee) and the role label.

**Routing — these are NEW routes.** Send Pranjal the snippet:

```jsx
<Route path="hrm" element={<HRMPage />} />
<Route path="login-logs" element={<LoginLogs />} />
<Route path="tickets" element={<ManagementManagerTickets />} />
```

Pranjal will add it to `ManagementManagerRoutes.jsx` and request the matching sidebar entries from the Frontend Lead.

---

## 9. Coordination rules

1. **Branch:** everyone works on `Management-Manager`. No feature branches inside the team.
2. **`managementManagerStore.js` is canonical.** Do not redefine `teamLeaders`, `employees`, `projects`, or `currentMM` anywhere. If you need new fields, ping Pranjal — Pranjal updates the store and announces the new shape.
3. **Routes / sidebar / shared components / AppRoutes:** never edited by you — see Section 2. Send Pranjal a request with the exact code you need.
4. **PR review.** Pranjal reviews every commit on the branch. Match the style of the already-shipped Sales Team Leader workspace.
5. **Modal IDs.** Always prefix `mm-`. Never reuse an ID across pages.
6. **No cross-packet edits.** If your work needs to change a file in another packet's folder, stop and discuss with Pranjal first.
7. **Mobile = primary key.** When you wire a Client modal to its project list, key the lookup on `clientMobile`, not on name. This matches Brief Section 12 and what Finance will use later.

---

## 10. Test plan (run before each push)

1. `cd frontend && npm install` (first time only)
2. `npm run dev`
3. Log in as Management Manager (use the existing department-login flow once Pranjal wires the route)
4. Visit your packet's routes:
   - Packet 1: `/management-manager`, `/management-manager/projects`, `/management-manager/projects/active`, `/management-manager/projects/delivered`, `/management-manager/projects/delayed`
   - Packet 2: `/management-manager/teams`, `/management-manager/teams/team-leaders`, `/management-manager/teams/employees`, `/management-manager/teams/structure`
   - Packet 3: `/management-manager/clients`, `/management-manager/reports/*`
   - Packet 4: `/management-manager/hrm`, `/management-manager/login-logs`, `/management-manager/tickets`
5. Verify on each page:
   - Page renders without console errors
   - All tables show data + pagination + search + export work
   - All filters apply (no broken keys)
   - All modals open and close properly
   - **Projects:** "Mark Delivered" is blocked when `driveLink` or `handoverLink` is missing
   - **Projects:** Reassign TL / Reassign Employee modal mutates the row's `assignedTL` / `assignedEmployees` correctly
   - **Teams → Structure:** "Move Employee" updates the org tree in both the source and destination TL
   - **HRM:** SessionTimer reflects the same state as the Navbar clock
   - **Login Logs:** scope is exactly Self + TL + Employee — no other dept's rows leak in
6. Compare visual style against the shipped Sales Team Leader Dashboard / Projects pages.

---

## 11. Common pitfalls

- **Editing routes / sidebar / `Common_Components.jsx` / `AppRoutes.jsx` directly.** Hard rule violation — see Section 2. Always go through Pranjal.
- **Pushing to a feature branch instead of `Management-Manager`.** Switch branches before you start.
- **Forgetting the mandatory drive links.** Both `driveLink` (always) and `handoverLink` (before delivery) are MANDATORY per Brief Section 9. A "Mark Delivered" action without the gate is a spec violation.
- **Treating projects like leads.** No talk-ratio, no dump, no follow-up reminders, no click-to-WhatsApp. Project lifecycle is different — re-read Brief Section 9 if unsure.
- **Inline dummy data.** Mock arrays must live in `*Store.js`. PRs with inline arrays in JSX will be rejected.
- **Modal ID collisions.** Always prefix `mm-`.
- **Cross-department data.** `teamLeaders` and `employees` are Management-dept-only. Do NOT pull from Sales `teamExecutives`.
- **Adding API calls.** Backend isn't ready. Keep everything in component state.
- **Adding a new shared component on your own.** Either create it inside your packet folder, or request it via Pranjal — never modify `Common_Components.jsx`.
- **Writing a `render` callback on a `<DataTable>` column.** Silently ignored — the table only reads `{ key, label }`. The `status` key auto-styles via the built-in `STATUS_MAP`; for everything else, render plain text or restructure the data. See Section 4 for details.
- **Confusing Management Manager with Sales Manager when search-replacing.** Both are "Manager" roles — when you copy from `salesManager/`, double-check that you replaced the role name everywhere, including the Navbar greeting, the sidebar title, and any `currentUser="Sales Manager"` props on shared chat components.

---

## 12. Acceptance criteria for Pranjal's review

A commit is ready to merge into `Management-Manager` when:

- [ ] Files only inside your packet's folder were modified
- [ ] No edits to `ManagementManagerRoutes.jsx`, `AppRoutes.jsx`, `Sidebar.jsx`, or `Common_Components.jsx`
- [ ] All UI uses shared components (no custom UI primitives unless created in your packet folder)
- [ ] Dummy data lives in a `*Store.js` file
- [ ] All data is scoped to the Management department (`teamLeaders` / `employees` / `projects` from `managementManagerStore.js`)
- [ ] No Sales-only features leaked through (no Bulk Lead Upload, no Restore from Dump, no Sales Targets, no Click-to-WhatsApp, no Prospect forms, no talk-ratio metrics)
- [ ] Mandatory drive-link gating is in place on the "Mark Delivered" flow
- [ ] All modal IDs prefixed `mm-`
- [ ] Page renders without console errors and matches the visual style of the Sales Team Leader workspace
- [ ] No `console.log`, no `fetch`, no commented-out code
- [ ] No new npm dependencies added
- [ ] Route snippet (if any) sent to Pranjal in chat / PR comment, NOT applied to the routes file by you

---

## Appendix A — quick component cheat-sheet

```jsx
// 12-column grid layout
<Grid cols={12} gap={4}>
  <Heading primaryText="My Page" secondaryText="Subtitle" size={12} />
</Grid>

// KPI dashboard cards
<DashGrid cols={12} gap={4}>
  <DashCard title="Total Projects" value="48" icon={<FolderOpen size={20} />} accentColor="#3b82f6" size={2} />
</DashGrid>

// Data table — searchable, exportable, with row actions
<DataTable
  title="All Projects"
  columns={[
    { key: "id", label: "ID" },
    { key: "name", label: "Project" },
    { key: "clientName", label: "Client" },
    { key: "assignedTLName", label: "Team Leader" },
    { key: "deadline", label: "Deadline" },
    { key: "status", label: "Status" },     // auto-badged
  ]}
  rows={projects}
  size={12}
  pageSize={10}
  searchable
  exportable
  exportFileName="projects_export"
  filters={[
    { title: "Status", type: "toggle", key: "status", options: ["Not Started","In Progress","Review Stage","Delivered","Delayed"] },
    { title: "Priority", type: "toggle", key: "priority", options: ["High","Medium","Low"] },
  ]}
  actions={[
    { icon: <Eye size={15} />, tooltip: "View",         variant: "ghost",   onClick: (row) => openProjectView(row) },
    { icon: <Pencil size={15} />, tooltip: "Edit",      variant: "ghost",   onClick: (row) => openProjectEdit(row) },
    { icon: <UserPlus size={15} />, tooltip: "Reassign", variant: "ghost",  onClick: (row) => openAssign(row) },
    { icon: <CheckCircle2 size={15} />, tooltip: "Mark Delivered", variant: "success", onClick: (row) => tryDeliver(row) },
  ]}
/>

// Modal pattern
<Modal id="mm-project-view" title="Project Details" size="lg">
  <ModalProfile name={p.name} subtitle={p.clientName} meta={`Deadline · ${p.deadline}`} />
  <ModalGrid title="Overview" cols={2}>
    <ModalData label="Status" value={p.status} />
    <ModalData label="Priority" value={p.priority} />
    <ModalData label="Drive Link" value={p.driveLink} />
    <ModalData label="Handover Link" value={p.handoverLink ?? "—"} />
  </ModalGrid>
  <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mm-project-view")} />
</Modal>

// Form fields
<DataField label="Project Name *" id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
<DataField label="Drive Link *"   id="driveLink" value={form.driveLink} onChange={(e) => set("driveLink", e.target.value)} />
<SelectField label="Priority" id="priority" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
  <Option value="High"   label="High" />
  <Option value="Medium" label="Medium" />
  <Option value="Low"    label="Low" />
</SelectField>
```

---

## Appendix B — project lifecycle gate (copy into AllProjects.jsx)

```jsx
function tryDeliver(project) {
  const missing = [];
  if (!project.driveLink)    missing.push("Project details drive link");
  if (!project.handoverLink) missing.push("Final handover link");

  if (missing.length) {
    setBlockedReason(missing);
    openModal("mm-deliver-blocked");
    return;
  }
  // proceed: setStatus("Delivered"), setDeliveredDate(today)
  markDelivered(project.id);
}
```

The `mm-deliver-blocked` modal renders the list of missing fields with a "Edit Project" CTA that opens `mm-project-edit` pre-focused on the first missing field. This is the canonical pattern — do not implement a silent failure or a `toast.error()` instead.
