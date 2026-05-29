# Management Employee Workspace — Team Guide

> **Audience:** the 4 teammates building out this folder, and any AI assistants helping them.
> **Sub-team Leader:** Pranjal (Packet 1 — Store + Dashboard + My Projects, will ship first as the reference). Pranjal is the single point of contact for routes, sidebar, shared components, and PRs.
> **Scope:** everything in `crm/frontend/src/pages/management/managementEmployee/`. No work outside this folder.

---

## 1. Project context (read first)

Graphura CRM is a multi-department, role-based platform. Hierarchy:

```
Super Admin → Admin → (Sales Manager / Management Manager / Finance Manager)
                                    ↓
                       Management Manager
                                    ↓
                       Management Team Leader
                                    ↓
                       Management Employee  ← THIS WORKSPACE
```

The **Management Employee (ME)** is the project executor — the frontline role inside the Projects department. Per the spec (Brief Section 11):

- **Scope:** self only. Sees only projects where their own employee-ID is in the project's `assignedEmployees[]`. Cannot see other employees' projects, other teams' work, other departments' anything.
- **Data unit:** projects, not leads. There is **no lead-capacity number** and no client-pool concept here.
- **Cannot:**
  - Create projects (Management Manager only)
  - Edit project name, start date, priority, deadline, drive link, handover link, total cost, payment fields, or WO fields
  - Reassign a project to another TL or employee
  - Mark a project as `Review Stage`, `Finalization`, `Completed`, or `Delayed` — those statuses are owned by TL/Manager
  - View / approve leaves for anyone else (no subordinates exist)
  - See login logs for anyone other than themselves
- **Can:**
  - View all projects assigned to them (the canonical filter — see Section 5 below)
  - Update project status — **only between `Not Started` and `In Progress`** (Brief Section 11.a.i.1 — explicitly lists these two states)
  - Add a `comment` on an assigned project (free text, shows in the project's comment thread)
  - Add a `workNote` on an assigned project (longer text — internal log of what was done; feeds the `updates[]` timeline that the Client Tracking Page reads)
  - View deadlines on their assigned projects
  - Set personal reminders (private, ME-only — does not push to anyone else's UI)
  - View own performance metrics (Brief Section 11.c)
  - HRM: apply leave, clock in/out, view own attendance (Brief Section 11.d / Section 16 — ME is the "Sales Exec" column equivalent: `Self` scope only)
  - View own login logs
  - Raise support tickets to their Management Team Leader (escalate path: ME → MTL → MM → Admin per Brief Section 11.g of the Mgmt TL spec)

**Hard rule on status:** the status dropdown for an ME row must show **only `Not Started` and `In Progress`** — never `Review Stage`, `Finalization`, `Completed`, `Delayed`, or `Work Started`. If you ship a dropdown with more options, the PR will be rejected. The project's `progress` percent can be updated alongside the status, but the status enum is hard-capped.

The **Client Project Tracking Page** (Brief Section 14) is an external no-login page that reads the `updates[]` log on each project. **Every workNote you append on the ME side becomes a tracking-page entry** if `isClientVisible: true` (the default per the canonical project shape). Pick wording that's safe to show clients — and add an `isClientVisible: false` toggle to the "Add Work Note" form for internal-only notes.

---

## 2. Permissions & escalation (HARD RULES — read this section before writing any code)

These rules come from the Frontend Lead. Violations will block your PR.

### What you CANNOT touch directly

| File / Area | Why | What to do instead |
|---|---|---|
| `src/routes/Manager/ManagementEmployeeRouter.jsx` | Single source of truth for routing — must stay conflict-free. Currently it's a 14-line stub; Pranjal owns the build-out. | Send the route snippet you need to **Pranjal**. Pranjal applies it. |
| `src/routes/AppRoutes.jsx` | Owned by the Frontend Lead. The top-level `/management-employee/*` mount already lives here — do NOT re-touch it. | Do NOT modify. Pranjal coordinates with the Frontend Lead. |
| `src/components/Sidebar.jsx` | Owned by the Frontend Lead. The `"management-employee"` role key is recognised in `useRole()` but there is **no menu config for it yet** — Pranjal requests one from the Frontend Lead during Packet 1. | Discuss with **Pranjal**. Pranjal coordinates with the Frontend Lead, who applies the change. |
| `src/components/shared/Common_Components.jsx` | Owned by the Frontend Lead. Editing it can break every page in the app | Do NOT modify. If you need a tweak to an existing shared component, message **Pranjal** with the exact change requested. |

### What you CAN do for new components

If you need a new UI piece that isn't in `Common_Components.jsx`:

- **Option A (default):** create it as a separate file inside your packet's folder, e.g. `managementEmployee/projects/components/StatusToggle.jsx`. Use Tailwind + lucide-react, match the existing visual style.
- **Option B:** if it's reusable across packets, message **Pranjal** to request it be added to `Common_Components.jsx`. The Frontend Lead will add it.

### Escalation flow (memorize this)

```
Teammate (you) → Pranjal (sub-team leader) → Frontend Lead
```

You never go directly to the Frontend Lead. You never edit shared files. You give Pranjal a specific, copy-pasteable code request and Pranjal handles it.

---

## 3. Git workflow

- **Branch:** all work happens on the **`Management-Employee-Panel`** branch. Switch to it before you start.
  ```bash
  git fetch origin
  git checkout Management-Employee-Panel
  git pull origin Management-Employee-Panel
  ```
- **Push:** commit and push to `Management-Employee-Panel` only. **Do not push to `main`, `Management-Manager-Panel`, `Sales-Team-Lead`, or any `feature/*` branch.**
- **Pull before push:** always `git pull --rebase origin Management-Employee-Panel` before pushing — multiple people share this branch, so stay current to avoid conflicts.
- **Commit scope:** keep commits limited to your packet's folder. If your commit touches a file outside your packet, stop and ping Pranjal.
- **No merging to main.** Pranjal will open the PR from `Management-Employee-Panel` to `main` when the workspace is complete.

---

## 4. Tech & conventions (do not deviate)

| Rule | What it means |
|---|---|
| **React + Vite + Tailwind** | No new dependencies. |
| **Shared components** | Import from `../../../components/shared/Common_Components.jsx`. The library exports `Heading`, `Grid`, `DashGrid`, `DashCard`, `EnhancedDashCard`, `DataTable`, `DataField`, `SelectField`, `Option`, `Button`, `Modal`, `ModalData`, `ModalGrid`, `ModalProfile`, `openModal`, `closeModal`, `GLineChart`, `GAreaChart`, `GColumnChart`, `GBarChart`, `GPieChart`, `GDoughnutChart`, `GRadarChart`, `UserChat`, `SessionTimer`, and more. **You may NOT modify this file** — see Section 2. |
| **New components** | Create them in your own packet folder, e.g. `projects/components/X.jsx`. Or request inclusion via Pranjal. |
| **Dummy data in `*Store.js`** | Never inline mock arrays in JSX. Always put them in a sibling `Store.js` file. |
| **Use `lucide-react` for icons** | Already imported across the codebase. Do not bring in another icon library. |
| **Modal IDs prefixed `me-`** | e.g. `me-project-view`, `me-status-update`, `me-add-worknote`, `me-leave-apply`. |
| **No backend yet** | Everything is dummy. Do not write `fetch`, `axios`, or API services. |
| **No comments unless non-obvious** | The shared components are self-explanatory. Don't add prop descriptions. |
| **Read-only display of fields you can't edit** | Drive link, handover link, deadline, priority, total cost, paid amount, WO fields — render as plain text inside `<ModalData>`. Never show them inside an editable input. |

### DataTable column gotchas

A few things about `<DataTable columns={...} />` that aren't obvious from the prop list:

- **No custom `render` callback support.** Column entries are `{ key, label }` only. If you write `{ key: "foo", render: (row) => <Badge>{row.foo}</Badge> }`, the `render` is silently ignored and the cell falls back to `row[col.key]`. Don't waste time on render functions — they look like they work in your editor but the table won't call them.
- **`status` key auto-renders as a colored badge.** Whatever value sits in `row.status` gets matched against a built-in `STATUS_MAP` in `Common_Components.jsx` (Present/Active/Approved/Completed → emerald, Pending/Warm/In Progress → amber, Overdue/Delayed → orange, Rejected/Failed/Absent → rose, etc.). Use Title-Case status values that match the map so colors apply automatically.
- **If you want a colored badge on a field that isn't `status`** — copy the field into a `status` column, OR ask Pranjal to add the field to `STATUS_MAP`. Don't roll your own pill component inside the table.
- **`userProfile="name"`** prop renders an avatar prefix on the column matching that key. Use it for the ME profile card; tables on the ME side are project rows (no people), so you likely won't need it.

---

## 5. The 4 universal rules when copying from Management Manager / Sales Executive

We're cloning patterns from two places:

1. **Management Manager workspace** — for the project data model, the `<DataTable>` + view-modal pattern, the projects/clients structure.
2. **Sales Executive workspace** — for the self-scope HRM, self-scope Login Logs, self-scope tickets pattern (no team tables anywhere).

Every copied file must apply these 4 fixes:

1. **Replace dept-wide / team-wide arrays** — delete inline arrays. Import `currentEmployee`, `myProjects`, `myReminders` from `managementEmployeeStore.js` instead. There is no `teamLeaders`, no `employees[]`, no `projects[]` (all projects) on the ME side — only the projects assigned to `currentEmployee.id`.
2. **Scope every list to self** — wherever Manager/TL code shows "all employees" or "all team leaders", **delete the column and delete the filter**. The ME never sees other people's names except their own TL and their own MM (and those are read-only labels, not filterable rows).
3. **Drop Manager / TL-only actions** —
   - Bulk Lead Upload, Restore Dump, Sales Targets, Click-to-WhatsApp, Prospect forms, Follow-up reminders **(Sales-only)**
   - Reassign TL, Reassign Employee, Create Project, Edit Deadline, Mark Delivered, Edit Drive/Handover Link, Approve/Reject Leave **(Manager/TL-only)**
   - The status dropdown is **hard-capped** to `Not Started` and `In Progress` (see Section 1).
4. **Rename modal IDs** — prefix everything with `me-` (e.g., `mm-project-view` → `me-project-view`, `tl-leave-apply` → `me-leave-apply`).

After paste, run these search-replaces:

| Find | Replace with |
|---|---|
| `Management Manager Dashboard` | `My Dashboard` |
| `"Projects"` (page title when it means "all projects") | `"My Projects"` |
| `Management Manager` (in body copy) | `Employee` (the logged-in ME refers to themselves as "Me") |
| `Management Team Leader` (in body copy where it's the user's role) | `Employee` |
| `assignedTLName` (when it's the "your TL" label) | keep — it's the ME's reporting TL, render as read-only |
| `projects` (when it means the org-wide pool) | `myProjects` |

---

## 6. Folder structure (target)

```
src/pages/management/managementEmployee/
│
├── managementEmployeeStore.js              [DONE — Packet 1]  Canonical dummy data — import from here
├── TEAM_GUIDE.md                           [this file]
│
│   ── Packet 1 (Pranjal — DONE) ──
├── ManagementEmployeeDashboard.jsx         [DONE]  4 KPIs + 2 charts (status mix / weekly notes) + upcoming deadlines table + recent comments feed
├── ManagementEmployeeMyProjects.jsx        [DONE]  Outlet layout w/ tabs (All Assigned | Active | Completed) + lifted state via useOutletContext
├── projects/
│   ├── AllAssigned.jsx                     [DONE]  table + view-modal + status-toggle (gated to Not Started ↔ In Progress) + add-comment + add-workNote
│   ├── AllAssignedRoute.jsx                [DONE]  thin wrapper for the index tab — reads {projects, updateProject} from useOutletContext
│   ├── ActiveProjects.jsx                  [DONE]  filtered subset (status === "In Progress")
│   ├── CompletedProjects.jsx               [DONE]  read-only; rows where MM has already flipped status to "Completed"
│   └── projectsStore.js                    [DONE]  re-exports `myProjects` + filter helpers; do NOT redefine the array
│
│   ── Packet 2 — Activity (Comments + Work Notes + Project Drawer) ──
├── ManagementEmployeeActivity.jsx          [TODO]  Outlet layout w/ tabs (Comments | Work Notes)
├── activity/
│   ├── CommentsLog.jsx                     [TODO]  chronological table of comments the ME added across all assigned projects
│   ├── WorkNotesLog.jsx                    [TODO]  chronological table of work notes the ME added (with `isClientVisible` column)
│   ├── components/
│   │   └── ProjectActivityDrawer.jsx       [TODO]  shared drawer used by Packet 1 view-modal + Packet 2 row click — shows full comment + workNote thread for a single project
│   └── activityStore.js                    [TODO]  `commentsByProject`, `workNotesByProject`; provides `addComment(projectId, body)` + `addWorkNote(projectId, body, isClientVisible)` mutators
│
│   ── Packet 3 — Deadlines + Reminders + Performance ──
├── ManagementEmployeeDeadlines.jsx         [TODO]  upcoming-deadlines table sorted by `deadline` asc + colour-coded overdue/this-week/this-month buckets
├── ManagementEmployeeReminders.jsx         [TODO]  personal reminders CRUD (create / mark done / delete); modal-driven
├── ManagementEmployeePerformance.jsx       [TODO]  self performance: projects assigned, completed by self-effort, average days-to-status-change, on-time %, work-notes added, comments added
├── remindersStore.js                       [TODO]
└── performanceStore.js                     [TODO]
│
│   ── Packet 4 — HRM + LoginLogs + Tickets ──
├── hrm/
│   ├── HRMPage.jsx                         [TODO]  tab layout (Attendance | Leaves) — mirrors Sales Executive HRM layout (self-only, no team tabs)
│   ├── Attendance.jsx                      [TODO]  KPIs (Today's status, This Week, This Month, Avg Hours) + `<SessionTimer>` from `components/shared` driven by `useAttendance()` + own attendance history table only
│   └── Leaves.jsx                          [TODO]  KPIs (Used, Remaining, Pending, Approved) + Apply Leave button + a single My Leaves table — NO Pending Leaves table, NO Leave History for others, NO Approve/Reject actions
├── loginLogs/
│   └── LoginLogs.jsx                       [TODO]  SELF only — username, date/time, IP, lat/long, role (Brief Section 3 — Employee scope = Self)
├── ManagementEmployeeTickets.jsx           [TODO]  wrapper holding `tickets` state, renders `<AllTickets />` (mirrors Sales Executive's `Support.jsx`)
├── tickets/
│   └── AllTickets.jsx                      [TODO]  KPIs + Create button + a single My Tickets table (tickets the ME raised). NO Team Tickets table — the ME has no subordinates. Defaults: `<UserChat currentUser>` = `"Management Employee"`, Create-form "Send To" defaults to `"Management Team Leader"`, escalate sets `raisedTo: "Management Manager"`.
└── ticketsStore.js                         [TODO]  `MY_TICKETS_SEED` only — no `initialTickets` (Team Tickets) since there are none
│
```

> **Note:** routes and sidebar entries for every packet are added by Pranjal (see Section 2). You only build the page; you ship a route snippet to Pranjal when your page is ready.

---

## 7. Reference implementations (study these)

Before writing any code, **open these in the editor** and read them. We mix and match patterns from two already-shipped workspaces:

**For data shape + project tables + view-modal patterns** (Management Manager — already shipped):

- `src/pages/management/managementManager/managementManagerStore.js` — canonical project row shape (clone exactly; just narrow to assigned-to-self)
- `src/pages/management/managementManager/ManagementManagerDashboard.jsx` — KPI grid + charts pattern
- `src/pages/management/managementManager/projects/AllProjects.jsx` — table + view-modal pattern (you'll keep the view, drop most edits)

**For self-scope HRM / Login Logs / Tickets** (Sales Executive — already shipped, same scope rules):

- `src/pages/sales/salesExecutive/hrm/{HrmLayout,Attendance,Leaves}.jsx` — self-only HRM with `SessionTimer`, single "My Leaves" table, no Approve/Reject
- `src/pages/sales/salesExecutive/LoginLogs/LoginLogs.jsx` — self-only logs
- `src/pages/sales/salesExecutive/Support/Support.jsx` + `TicketStore.js` — single-user ticket flow (raise + view own)

**For the Outlet+tabs layout pattern:**

- `src/pages/management/managementManager/ManagementManagerProjects.jsx`

For copy-paste sources:

| Your Packet | Copy from |
|---|---|
| Packet 1 (Store) | `managementManager/managementManagerStore.js` — clone `projects` rows; **narrow to only those where `assignedEmployees.includes(currentEmployee.id)`**. Drop `teamLeaders` and other employees entirely. Add `currentEmployee` (the logged-in ME) and `myTL` (read-only label for the row's TL). |
| Packet 1 (Dashboard) | `managementManager/ManagementManagerDashboard.jsx` — keep the KPI/charts shape, swap to ME's 4 KPIs (see Section 8). Drop the cross-team / cross-TL charts. |
| Packet 1 (Projects) | `managementManager/projects/AllProjects.jsx` — keep the table + view-modal; **gut the actions list** down to View, Update Status, Add Comment, Add Work Note. Drop Edit, Reassign, Mark Delivered. |
| Packet 2 (Activity) | No direct analogue. Build the comments/notes tables from scratch using the standard `<DataTable>` pattern; the drawer is a thin `<Modal>` wrapper. |
| Packet 3 (Deadlines) | `managementManager/projects/AllProjects.jsx` (re-use the row shape, sort by `deadline` asc, add overdue colouring via `status` column trick). |
| Packet 3 (Reminders) | `salesExecutive/leads/*Reminder*` if it exists, otherwise `salesTeamLeader/leads/FollowUps.jsx` for the add/edit modal pattern. Strip the lead-link — ME reminders are free-text, project-optional. |
| Packet 3 (Performance) | `managementManager/reports/*` — pick the per-TL breakdown and re-point at "per-status" for a single ME. |
| Packet 4 (HRM) | `salesExecutive/hrm/{HrmLayout,Attendance,Leaves}.jsx` — already trimmed for single-user scope; drop nothing. |
| Packet 4 (Login Logs) | `salesExecutive/LoginLogs/LoginLogs.jsx` |
| Packet 4 (Tickets) | `salesExecutive/Support/Support.jsx` + `TicketStore.js` — single-user ticket pattern. Change `currentUser` to `"Management Employee"` and default Send-To to `"Management Team Leader"`. |

---

## 8. Per-packet specifications

### Packet 1 — Store + Dashboard + My Projects (reference — Pranjal ships this first)

**Pages to build:**

- `managementEmployeeStore.js` — canonical store. Exports:
  - `currentEmployee` — `{ id: "EM-201", name: "Karan Malhotra", email, phone, teamLeaderId: "TL-101", teamLeaderName: "Ravi Khanna", role: "Frontend", joinDate, status: "Active" }`. Pick one of the employees from `managementManagerStore.js → employees[]` to keep IDs consistent across workspaces.
  - `myProjects` — the subset of `managementManagerStore → projects[]` where `assignedEmployees.includes(currentEmployee.id)`. **Copy the rows in directly** (don't import — Packet 1 is allowed to seed its own data so the ME workspace runs standalone) but keep the row shape **byte-identical** to the canonical project shape (see Section 9).
  - `dashboardKPIs` — chart-ready array for the 4 KPIs below.
  - `statusFunnel` — `{ "Not Started": n, "In Progress": n, "Review Stage": n, "Completed": n, "Delayed": n }` for the doughnut chart.
  - `weeklyNotesAdded` — `[{ week: "W-18", count: 4 }, ...]` for the weekly-activity chart.
  - `recentComments` — the last 5 comments the ME added (chronological), for the dashboard feed.
- `ManagementEmployeeDashboard.jsx` — 4 KPI cards + 3 charts + recent-activity feed.
- `ManagementEmployeeMyProjects.jsx` — `<Outlet />` layout with tab navigation.
- `projects/AllAssigned.jsx`, `projects/ActiveProjects.jsx`, `projects/CompletedProjects.jsx`, `projects/projectsStore.js`.

**4 KPIs the ME dashboard must show** (derived from Brief Section 11):

1. My Projects (total assigned to me)
2. Active (status === `In Progress`)
3. Completed (status === `Completed` — set by MM, ME sees them read-only)
4. Pending Status Update (status === `Not Started` AND `startDate <= today`) — the "you should have started this by now" flag

> **Don't add an "Overdue" KPI.** The ME doesn't own the `Delayed` flip — that's MM. If you want to surface overdue work, put it in Packet 3's Deadlines page as a colour-coded bucket, not as a top-level ME KPI.

**Spec features (from Brief Section 11.a):**

- Update project status — **dropdown shows only `Not Started` and `In Progress`** (hard rule from Section 1)
- Add `comment` on assigned project — short free text, threaded with date + author name
- Add `workNote` on assigned project — longer text + optional `isClientVisible` toggle (default `true`); pushes a row into the project's `updates[]` array

**Hard rules for the My Projects table:**

- The status column shows the full canonical status (`Not Started`, `In Progress`, `Review Stage`, `Finalization`, `Completed`, `Delayed`) — but the **status-update modal's dropdown is restricted to the two ME-allowed transitions**. If a project is currently `Review Stage` or beyond, the "Update Status" action must be **disabled** with a tooltip "Your TL or Manager owns this transition."
- Drive link and handover link render as read-only `<ModalData>` cells. Don't render them inside `<DataField>`.
- Priority, deadline, totalCost, paidAmount, woGenerated, woSigned — all **read-only** in the view modal. Never editable on the ME side.
- The "Update Status" action button must show in the table for rows where the ME-allowed transition is possible (`Not Started → In Progress` or `In Progress → Not Started`). Hide or grey it for `Completed` / `Delayed` / `Review Stage` / `Finalization` rows.

**What to drop / change from Management Manager copy:**

- Cross-team / cross-TL columns (`assignedTLName` stays as a read-only column; everything else aggregate-level goes)
- Bulk actions, Create Project button, Edit Project modal
- "Mark Delivered" gate (MM-only)
- Reassign actions
- Priority / Deadline / Drive Link editor inputs

**Routing:** the top-level mount `/management-employee/*` already exists in `AppRoutes.jsx` and the router stub `ManagementEmployeeRouter.jsx` already exists. **Pranjal will fill in the routes** during Packet 1. When your sub-pages are ready, send Pranjal the nested-route snippet — do NOT touch `ManagementEmployeeRouter.jsx` or `AppRoutes.jsx` yourself.

---

### Packet 2 — Activity (Comments + Work Notes + Drawer)

**Pages to build:**

- `ManagementEmployeeActivity.jsx` — Outlet layout with two tabs (Comments | Work Notes).
- `activity/CommentsLog.jsx` — chronological table of every comment the ME added across all assigned projects. Columns: `date`, `projectId`, `projectName`, `body` (truncated; full text in a side drawer).
- `activity/WorkNotesLog.jsx` — same as comments but for work notes. Extra column: `isClientVisible` (Yes / No badge).
- `activity/components/ProjectActivityDrawer.jsx` — shared drawer (a `<Modal size="lg">` is fine) showing the full comment + workNote thread for a single project, with inline "Add Comment" / "Add Work Note" forms. **Packet 1's view-modal embeds this** — Packet 2 owns the file; Packet 1 imports it.
- `activity/activityStore.js`:
  - `commentsByProject` — `{ "PRJ-001": [{ date, author, body }, ...], ... }`
  - `workNotesByProject` — `{ "PRJ-001": [{ date, author, body, isClientVisible }, ...], ... }`
  - `addComment(projectId, body)` and `addWorkNote(projectId, body, isClientVisible)` — pure functions that return a new state object (the consumer page lifts the result into its `useState`). Both functions stamp `author = currentEmployee.name` from `managementEmployeeStore.js`.

**Spec features (from Brief Section 11.a.i & ii):**

- Add comments on assigned projects
- Add work notes on projects
- View full activity history per project (the drawer)

**Hard rules:**

- An ME can only add comments/notes to projects in their `myProjects` list. The drawer's add-forms must call `currentEmployee.id` and assert the project ID is in `myProjects.map(p => p.id)` — fail closed if not.
- The drawer renders comments and notes as a single chronological thread, with type pills (`Comment` blue, `Work Note · Client-visible` emerald, `Work Note · Internal` slate).
- The `isClientVisible` toggle defaults to `true` — match the canonical `ProjectUpdate.isClientVisible` default from the backend models. Tell the ME in helper text that "Client-visible notes appear on the public Client Tracking Page."

**What to drop from Manager copy:** the Manager has no direct analogue — build the tables from `<DataTable>` directly. Don't roll a custom timeline component; the drawer's thread is a vertical list of `<div>`s styled with Tailwind, not a chart.

**Routing:** send Pranjal the route snippet when ready:

```jsx
<Route path="activity" element={<ManagementEmployeeActivity />}>
  <Route index element={<Navigate to="comments" replace />} />
  <Route path="comments"   element={<CommentsLog />} />
  <Route path="work-notes" element={<WorkNotesLog />} />
</Route>
```

---

### Packet 3 — Deadlines + Reminders + Performance

**Pages to build:**

- `ManagementEmployeeDeadlines.jsx` — single page (no sub-tabs). Two stacked sections:
  1. KPI row: Overdue, This Week, This Month, Future
  2. A `<DataTable>` sorted by `deadline` asc, grouped via a `status` column whose value is one of `Overdue`, `This Week`, `This Month`, `Future` (NOT the project status — copy the project's actual status into a separate `projectStatus` column). Using `status` for the bucket label lets `STATUS_MAP` colour it automatically: `Overdue` → orange, `This Week` → amber, others → slate.
- `ManagementEmployeeReminders.jsx` — single page. Table of reminders + an "Add Reminder" modal-driven form. Fields: `title`, `dueAt`, `linkedProjectId` (optional dropdown sourced from `myProjects`), `note`. Row actions: View / Mark Done / Delete. Per Brief Section 11.b.ii these reminders are personal — they don't notify the TL or anyone else.
- `ManagementEmployeePerformance.jsx` — single page. Self performance:
  - 4 KPI cards: Total Assigned, Currently Active, Completed, On-time %
  - 2 charts: Monthly Notes Added (column chart) + Status Mix (doughnut)
  - One table: Per-project breakdown — `projectName`, `status`, `daysOnIt` (today minus startDate, capped at deliveredDate if completed), `commentsByMe`, `notesByMe`, `wasOnTime` (`Yes` / `No` / `In Progress`)
- `remindersStore.js` — `myReminders` seed array; `addReminder`, `markDone`, `removeReminder` mutators.
- `performanceStore.js` — derives KPIs and chart data from `myProjects` + `activityStore`. Keep it pure; no fetches.

**Spec features:**

- Deadlines & reminders (Brief Section 11.b)
- Self performance tracking (Brief Section 11.c)

**Hard rules:**

- The Performance page is **self-only**. There is no comparison-to-team chart, no leaderboard, no "vs. team average" line. Per Brief Section 11.c the ME sees their own metrics — nothing more.
- The Reminders page does NOT push to other users. No `assignedTo`, no `share-with-TL` toggle. They're private.
- "On-time %" on the Performance page is computed as `completedOnTimeCount / completedCount` for the ME's projects only. If `completedCount === 0`, display `—` instead of `0%` or `NaN%`.

**What to drop from Manager copy:** all team-rollup charts, all cross-employee comparisons, all per-TL breakdowns. The Reports workspace on the MM side is fundamentally a different scope — borrow the chart shapes but not the data shapes.

**Routing:** send Pranjal the route snippet when ready:

```jsx
<Route path="deadlines"   element={<ManagementEmployeeDeadlines />} />
<Route path="reminders"   element={<ManagementEmployeeReminders />} />
<Route path="performance" element={<ManagementEmployeePerformance />} />
```

---

### Packet 4 — HRM + LoginLogs + Tickets

**Pages to build:**

- `hrm/HRMPage.jsx` — top-level tab layout (Attendance | Leaves). Mirror `salesExecutive/hrm/HrmLayout.jsx`. Self-only — no department-wide tab, no Pending Leaves tab.
- `hrm/Attendance.jsx` — KPIs (Today's status, This Week, This Month, Avg Hours) + **`<SessionTimer>` from `components/shared` driven by `useAttendance()`** for ME's clock-in/out (the `AttendanceProvider` is already wired in `MainLayout`; do NOT roll a custom clock — it shares state with the Navbar timer) + a "My Attendance History" table (self only — no rows for any other user).
- `hrm/Leaves.jsx` — KPIs (Used, Remaining, Pending, Approved) + Apply Leave button + a **single My Leaves table**. **NO** Pending Leaves table. **NO** Leave History for others. **NO** Approve/Reject row actions. The ME applies; their TL (or MM) approves elsewhere.
- `loginLogs/LoginLogs.jsx` — own logs only. Columns: `date/time`, `IP`, `latitude`, `longitude`. Add a "User Role" column for consistency with other workspaces even though it's always `Management Employee`. Per Brief Section 3 the Employee's log-scope is `Self`.
- `ManagementEmployeeTickets.jsx` — 9-line wrapper holding `tickets` state, renders `<AllTickets />`. Mirror the wrapper from `salesTeamLeader/SalesTeamLeaderTickets.jsx`.
- `tickets/AllTickets.jsx` — KPI cards + Create button + a **single My Tickets table** (tickets the ME raised). **NO Team Tickets table** — the ME has no subordinates.
- `ticketsStore.js` — `MY_TICKETS_SEED` only (no `initialTickets`); `kpiTickets` derived from `MY_TICKETS_SEED`; role constants. `<UserChat currentUser>` is `"Management Employee"`. Create-form "Send To" defaults to `"Management Team Leader"`. Escalate action sets `raisedTo: "Management Manager"`.

**Spec features:**

- HRM (Brief Section 11.d / Section 16): ME has **Self** scope — same row as the Sales Executive in the HRM matrix table. Clock in/out, apply leave, view own attendance, view own leave status / total leaves / total working days / total attendance. No "Approve Leaves" feature, no "View All Attendance" feature.
- Login Logs (Brief Section 3 — `Login Log Scope` column for Sales Executive reads `Self only`, and Management Employee is the same level): Self only.
- Tickets: the ME raises tickets — to their TL by default, escalable to MM. No subordinate tickets to handle.

**Source-of-truth choice for HRM:** use the **Sales Executive HRM** files as the base. Reasons:
- They've already been trimmed for self-only scope.
- They already use `<SessionTimer>` + `useAttendance()` correctly.
- They already wire Apply Leave with a single My Leaves table.
- You only need to swap the role label and the dummy data — no structural changes.

**Routing — these are NEW routes.** Send Pranjal the snippet:

```jsx
<Route path="hrm"         element={<HRMPage />} />
<Route path="login-logs"  element={<LoginLogs />} />
<Route path="tickets"     element={<ManagementEmployeeTickets />} />
```

Pranjal will add it to `ManagementEmployeeRouter.jsx` and request the matching sidebar entries from the Frontend Lead.

---

## 9. Canonical project row shape (copy exactly)

Every project row in `managementEmployeeStore.js` MUST use these keys, byte-for-byte matching the Management Manager store. Other packets read these keys — if you rename one, you break the workspace.

```js
{
  id: "PRJ-001",
  name: "Acme Website Redesign",
  clientId: "CL-001",
  clientName: "Acme Corp",
  clientMobile: "+91 99001 10001",
  driveLink: "https://drive.google.com/...",         // READ-ONLY for ME
  startDate: "2026-03-10",
  deadline: "2026-05-20",                            // READ-ONLY for ME
  priority: "High",                                  // READ-ONLY for ME — High | Medium | Low
  assignedTL: "TL-101",
  assignedTLName: "Ravi Khanna",                     // ME's reporting TL — read-only label
  assignedEmployees: ["EM-201", "EM-202"],           // currentEmployee.id MUST appear in this list
  status: "In Progress",                             // Not Started | In Progress | Review Stage | Finalization | Completed | Delayed
                                                     // ME can only flip between "Not Started" and "In Progress"
  progress: 45,                                      // 0–100 — editable by ME alongside status updates
  handoverLink: null,                                // READ-ONLY for ME
  deliveredDate: null,                               // READ-ONLY for ME
  lastUpdated: "2026-05-08",                         // auto-stamped on any ME mutation
  totalCost: 350000,                                 // READ-ONLY for ME (Finance-owned)
  paidAmount: 175000,                                // READ-ONLY for ME (Finance-owned)
  paymentType: "Partial",                            // READ-ONLY for ME
  woGenerated: true,                                 // READ-ONLY for ME
  woSigned: true,                                    // READ-ONLY for ME
  woSignedDate: "2026-03-09",                        // READ-ONLY for ME
  updates: [                                         // ME appends rows via "Add Work Note"
    { date: "2026-03-10", status: "Work Started", note: "...", isClientVisible: true },
  ],
}
```

**Things to verify before opening a PR:**

- Every row in `myProjects` has `assignedEmployees.includes(currentEmployee.id)`.
- No row has an `isClientVisible: false` workNote unless the ME explicitly set it that way (default is `true`).
- No row has a status outside the canonical enum.
- No row has `progress` outside `[0, 100]`.

---

## 10. Coordination rules

1. **Branch:** everyone works on `Management-Employee-Panel`. No feature branches inside the team.
2. **`managementEmployeeStore.js` is canonical.** Do not redefine `currentEmployee`, `myProjects`, or `myReminders` anywhere. If you need new fields, ping Pranjal — Pranjal updates the store and announces the new shape.
3. **Routes / sidebar / shared components / AppRoutes:** never edited by you — see Section 2. Send Pranjal a request with the exact code you need.
4. **PR review.** Pranjal reviews every commit on the branch. Match the style of the already-shipped Management Manager workspace and the Sales Executive workspace.
5. **Modal IDs.** Always prefix `me-`. Never reuse an ID across pages.
6. **No cross-packet edits.** If your work needs to change a file in another packet's folder, stop and discuss with Pranjal first.
7. **Mobile = primary key (read-only on the ME side).** When you display the client on a project row, show `clientMobile` alongside `clientName` — don't drop it. The ME doesn't edit it, but downstream Finance and the Client Tracking Page key off it.
8. **Status enum is hard-capped.** This rule is repeated three times in this document because PRs keep tripping on it. The status dropdown in any ME-built form is `["Not Started", "In Progress"]`. That's it.

---

## 11. Test plan (run before each push)

1. `cd frontend && npm install` (first time only)
2. `npm run dev`
3. Log in as Management Employee (use the existing department-login flow once Pranjal wires the sidebar entry)
4. Visit your packet's routes:
   - Packet 1: `/management-employee`, `/management-employee/my-projects`, `/management-employee/my-projects/active`, `/management-employee/my-projects/completed`
   - Packet 2: `/management-employee/activity`, `/management-employee/activity/comments`, `/management-employee/activity/work-notes`
   - Packet 3: `/management-employee/deadlines`, `/management-employee/reminders`, `/management-employee/performance`
   - Packet 4: `/management-employee/hrm`, `/management-employee/login-logs`, `/management-employee/tickets`
5. Verify on each page:
   - Page renders without console errors
   - All tables show data + pagination + search + export work
   - All filters apply (no broken keys)
   - All modals open and close properly
   - **Status updates:** dropdown shows ONLY `Not Started` and `In Progress`
   - **Reassign / Edit Deadline / Mark Delivered:** these buttons must NOT exist anywhere in the workspace
   - **Comments / Work Notes:** appending a row mutates the right project and updates the recent-activity feed on the Dashboard
   - **HRM:** SessionTimer reflects the same state as the Navbar clock
   - **Leaves:** there is NO Approve/Reject button anywhere
   - **Login Logs:** only the current ME's rows show — no rows for any TL, MM, or other employee
   - **Tickets:** there is NO Team Tickets table — only My Tickets
6. Compare visual style against the shipped Management Manager and Sales Executive workspaces.

---

## 12. Common pitfalls

- **Editing routes / sidebar / `Common_Components.jsx` / `AppRoutes.jsx` directly.** Hard rule violation — see Section 2. Always go through Pranjal.
- **Pushing to a feature branch instead of `Management-Employee-Panel`.** Switch branches before you start.
- **Status dropdown showing more than `Not Started` and `In Progress`.** The #1 spec violation. See Section 1 + Section 10 rule 8.
- **Showing other employees' projects.** `myProjects` is filtered by `assignedEmployees.includes(currentEmployee.id)`. If a project appears that doesn't have the ME's ID in that array, the store is wrong — don't paper over it in the UI.
- **Editable drive link / handover link / deadline / priority / cost / WO fields.** All read-only on the ME side. If you put them inside a `<DataField>`, the PR will be rejected.
- **Treating the Activity page like a chat.** Comments and work notes are append-only audit entries with a date stamp, not a real-time chat. Don't add typing indicators, edit-in-place, or delete actions. Once added, they stay.
- **Adding an "Approve Leave" button on the Leaves page.** ME has no subordinates. The only leave action is "Apply Leave".
- **Adding a Team Tickets table.** ME has no subordinates. The only ticket table is "My Tickets".
- **Inline dummy data.** Mock arrays must live in `*Store.js`. PRs with inline arrays in JSX will be rejected.
- **Modal ID collisions.** Always prefix `me-`.
- **Cross-department / cross-team data.** `currentEmployee` is one person inside Management dept. Do NOT pull from Sales `teamExecutives` or from MM's full `employees[]` list.
- **Adding API calls.** Backend isn't ready. Keep everything in component state.
- **Adding a new shared component on your own.** Either create it inside your packet folder, or request it via Pranjal — never modify `Common_Components.jsx`.
- **Writing a `render` callback on a `<DataTable>` column.** Silently ignored — the table only reads `{ key, label }`. The `status` key auto-styles via the built-in `STATUS_MAP`; for everything else, render plain text or restructure the data. See Section 4 for details.
- **Forgetting the `isClientVisible` toggle on the Add Work Note form.** Defaults to `true`, but the toggle MUST exist — Brief Section 14 (Client Tracking Page) reads `isClientVisible` to decide what to show externally.
- **Showing the ME themselves inside their HRM "team" table.** There is no team table on the ME side. The SessionTimer IS the My Attendance display; the history table is for past days only.

---

## 13. Acceptance criteria for Pranjal's review

A commit is ready to merge into `Management-Employee-Panel` when:

- [ ] Files only inside your packet's folder were modified
- [ ] No edits to `ManagementEmployeeRouter.jsx`, `AppRoutes.jsx`, `Sidebar.jsx`, or `Common_Components.jsx`
- [ ] All UI uses shared components (no custom UI primitives unless created in your packet folder)
- [ ] Dummy data lives in a `*Store.js` file
- [ ] All data is scoped to `currentEmployee.id` (only `myProjects` / `myReminders` / own attendance / own leaves / own logs / own tickets)
- [ ] No Manager/TL-only features leaked through (no Create Project, no Edit Deadline / Drive Link / Handover Link, no Reassign, no Mark Delivered, no Approve Leave, no Team Tickets table, no team attendance table, no other-employees' login logs)
- [ ] No Sales-only features leaked through (no Bulk Lead Upload, no Restore from Dump, no Sales Targets, no Click-to-WhatsApp, no Prospect forms)
- [ ] Status dropdown is hard-capped to `["Not Started", "In Progress"]` everywhere it appears
- [ ] All read-only project fields render in `<ModalData>`, never in `<DataField>`
- [ ] All modal IDs prefixed `me-`
- [ ] `<UserChat currentUser>` props say `"Management Employee"`
- [ ] Page renders without console errors and matches the visual style of the Management Manager workspace
- [ ] No `console.log`, no `fetch`, no commented-out code
- [ ] No new npm dependencies added
- [ ] Route snippet (if any) sent to Pranjal in chat / PR comment, NOT applied to the routes file by you

---

## Appendix A — quick component cheat-sheet

```jsx
// 12-column grid layout
<Grid cols={12} gap={4}>
  <Heading primaryText="My Dashboard" secondaryText="Today's work" size={12} />
</Grid>

// KPI dashboard cards
<DashGrid cols={12} gap={4}>
  <DashCard title="My Projects" value="6" icon={<FolderOpen size={20} />} accentColor="#3b82f6" size={3} />
</DashGrid>

// Data table — searchable, exportable, with row actions
<DataTable
  title="My Projects"
  columns={[
    { key: "id",             label: "ID" },
    { key: "name",           label: "Project" },
    { key: "clientName",     label: "Client" },
    { key: "assignedTLName", label: "My TL" },
    { key: "deadline",       label: "Deadline" },
    { key: "status",         label: "Status" },        // auto-badged
  ]}
  rows={myProjects}
  size={12}
  pageSize={10}
  searchable
  exportable
  exportFileName="my_projects"
  filters={[
    { title: "Status",   type: "toggle", key: "status",   options: ["Not Started","In Progress","Review Stage","Completed","Delayed"] },
    { title: "Priority", type: "toggle", key: "priority", options: ["High","Medium","Low"] },
  ]}
  actions={[
    { icon: <Eye size={15} />,        tooltip: "View",            variant: "ghost",   onClick: (row) => openView(row) },
    { icon: <RefreshCw size={15} />,  tooltip: "Update Status",   variant: "ghost",   onClick: (row) => openStatus(row) },
    { icon: <MessageSquare size={15} />, tooltip: "Add Comment",  variant: "ghost",   onClick: (row) => openComment(row) },
    { icon: <FileText size={15} />,   tooltip: "Add Work Note",   variant: "ghost",   onClick: (row) => openNote(row) },
  ]}
/>

// Modal pattern (read-only fields)
<Modal id="me-project-view" title="Project Details" size="lg">
  <ModalProfile name={p.name} subtitle={p.clientName} meta={`Deadline · ${p.deadline}`} />
  <ModalGrid title="Overview" cols={2}>
    <ModalData label="Status"        value={p.status} />
    <ModalData label="Priority"      value={p.priority} />
    <ModalData label="My TL"         value={p.assignedTLName} />
    <ModalData label="Drive Link"    value={p.driveLink} />
    <ModalData label="Handover Link" value={p.handoverLink ?? "—"} />
  </ModalGrid>
  <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("me-project-view")} />
</Modal>

// Status update form (HARD-CAPPED dropdown — only 2 options)
<SelectField label="New Status" id="status" value={form.status} onChange={(e) => set("status", e.target.value)}>
  <Option value="Not Started" label="Not Started" />
  <Option value="In Progress" label="In Progress" />
</SelectField>
<DataField label="Progress %" id="progress" type="number" min={0} max={100}
  value={form.progress} onChange={(e) => set("progress", e.target.value)} />
```

---

## Appendix B — status-update gate (copy into AllAssigned.jsx)

```jsx
const ME_ALLOWED_STATUSES = ["Not Started", "In Progress"];

function canUpdateStatus(project) {
  return ME_ALLOWED_STATUSES.includes(project.status);
}

function openStatusUpdate(project) {
  if (!canUpdateStatus(project)) {
    setBlockedReason(
      `Status is currently "${project.status}". Your Team Leader or Manager owns this transition.`
    );
    openModal("me-status-blocked");
    return;
  }
  setEditing(project);
  openModal("me-status-update");
}
```

The `me-status-blocked` modal renders the read-only reason with a "Got it" button — no action. This is the canonical pattern; don't fall through with a toast or a silent no-op.

---

## Appendix C — add-work-note form (copy into ProjectActivityDrawer.jsx)

```jsx
const [form, setForm] = useState({ body: "", isClientVisible: true });

function submit() {
  if (!form.body.trim()) return;
  const updated = addWorkNote(project.id, form.body.trim(), form.isClientVisible);
  setActivityState(updated);
  setForm({ body: "", isClientVisible: true });
}

<DataField label="Work note *" id="body" multiline rows={4}
  value={form.body} onChange={(e) => set("body", e.target.value)} />

<label className="flex items-center gap-2 text-sm text-slate-700">
  <input
    type="checkbox"
    checked={form.isClientVisible}
    onChange={(e) => set("isClientVisible", e.target.checked)}
  />
  Show this note on the public Client Tracking Page
</label>

<Button text="Add Work Note" variant="primary" size={4} onClick={submit} />
```

Default `isClientVisible` to `true` to match the backend `ProjectUpdate.isClientVisible` default. The label wording is non-negotiable — it tells the ME exactly what flipping the toggle does.
