# Pre-PR Cleanup Checklist — Management Employee Panel

> **Audience:** Pranjal (sub-team leader).
> **Purpose:** Track every change made on the `Management-Employee-Panel` branch that lives **outside** the allowed scope (the `managementEmployee/` folder and `ManagementEmployeeRouter.jsx`). These changes were made locally to make the workspace testable end-to-end during development — **they MUST be reverted before opening the PR to `main`**.

Per the TEAM_GUIDE.md hard rules (Section 2 — Permissions & escalation):

- The only files we are allowed to push from this branch are:
  - everything inside `crm/frontend/src/pages/management/managementEmployee/`
  - `crm/frontend/src/routes/Manager/ManagementEmployeeRouter.jsx`
- `Sidebar.jsx`, `Common_Components.jsx`, `AppRoutes.jsx` are owned by the Frontend Lead. The Frontend Lead applies sidebar / routes-mount / shared-component changes on `main` after the PR is merged.

---

## Out-of-scope edits on this branch (must revert before opening PR)

### 1. `crm/frontend/src/components/Sidebar.jsx`

**What was added:** a `"management-employee"` entry in the `MENUS` registry. Live entries cover the shipped packets (1 + 4): Overview (Dashboard), Work (My Projects), Support (Tickets), Personal (HRM + Login Logs). The Packet 2 (Activity) and Packet 3 (Planning section: Deadlines + Reminders + Performance) entries are present **commented out** — teammates uncomment them when their pages ship, then the entries become a one-line live edit instead of a from-scratch task.

**Why it was added:** the `useRole()` switch in `Sidebar.jsx` already recognises the `/management-employee/*` path, but without a menu config the sidebar renders empty for ME users.

**How to revert:**

```bash
git checkout origin/main -- crm/frontend/src/components/Sidebar.jsx
```

(or, if `origin/main` has moved meaningfully since branch-off, restore the file from the commit immediately before our branch's first sidebar edit — `git log --follow crm/frontend/src/components/Sidebar.jsx` to find it).

**What to hand to the Frontend Lead instead:** the exact menu snippet to add (final form — uncomment everything that's currently commented out in the live file so the Frontend Lead applies the complete menu in one go). Copy-paste this block into the PR description / Slack message:

```jsx
"management-employee": {
  title: "Management Employee",
  initials: "ME",
  sections: [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", path: "/management-employee", icon: LayoutDashboard, end: true },
      ],
    },
    {
      label: "Work",
      items: [
        { name: "My Projects", path: "/management-employee/my-projects", icon: FolderOpen },
        { name: "Activity",    path: "/management-employee/activity",    icon: Activity },
      ],
    },
    {
      label: "Planning",
      items: [
        { name: "Deadlines",   path: "/management-employee/deadlines",   icon: ClipboardList },
        { name: "Reminders",   path: "/management-employee/reminders",   icon: Bell },
        { name: "Performance", path: "/management-employee/performance", icon: TrendingUp },
      ],
    },
    {
      label: "Support",
      items: [
        { name: "Tickets", path: "/management-employee/tickets", icon: Ticket },
      ],
    },
    {
      label: "Personal",
      items: [
        { name: "HRM",        path: "/management-employee/hrm",        icon: UserCheck },
        { name: "Login Logs", path: "/management-employee/login-logs", icon: History },
      ],
    },
  ],
},
```

Icons used (`LayoutDashboard`, `FolderOpen`, `Activity`, `ClipboardList`, `Bell`, `TrendingUp`, `Ticket`, `UserCheck`, `History`) are already imported at the top of `Sidebar.jsx` — no new icon imports needed.

---

## In-scope edits (KEEP — these go in the PR)

For reference, everything below is in scope and should remain in the diff:

- `crm/frontend/src/pages/management/managementEmployee/**` — all packet files
- `crm/frontend/src/routes/Manager/ManagementEmployeeRouter.jsx` — route registrations for every packet

---

## Pre-PR checklist (run through this before `gh pr create`)

- [ ] `git diff origin/main -- crm/frontend/src/components/Sidebar.jsx` returns no output (sidebar reverted)
- [ ] `git diff origin/main -- crm/frontend/src/components/Navbar.jsx` returns no output (we did not touch Navbar — but double-check)
- [ ] `git diff origin/main -- crm/frontend/src/routes/AppRoutes.jsx` returns no output (we did not touch AppRoutes — but double-check)
- [ ] `git diff origin/main -- crm/frontend/src/components/shared/Common_Components.jsx` returns no output (we did not touch shared components — but double-check)
- [ ] `git diff --name-only origin/main` shows files only under `crm/frontend/src/pages/management/managementEmployee/` and `crm/frontend/src/routes/Manager/ManagementEmployeeRouter.jsx`
- [ ] PR description contains the Sidebar menu snippet from this file under a "**Frontend Lead — sidebar request**" heading so the Frontend Lead can apply it on `main` after merge
- [ ] `cd crm/frontend && npm run build` passes (post-revert — the sidebar will render empty for ME users on this branch after revert, that's expected)

---

## Pre-wired Packet 2 + 3 placeholders (commented in router + sidebar — uncomment when shipping)

No stub page files exist for Packets 2 and 3 — the entries are commented blocks in two places. To go live with a packet:

**Packet 2 (Activity):**
1. Create the page files per TEAM_GUIDE.md Section 8 → Packet 2.
2. Uncomment the import + nested `<Route>` block in [`ManagementEmployeeRouter.jsx`](../../../routes/Manager/ManagementEmployeeRouter.jsx) (search for `Packet 2 — Activity (TODO)`).
3. Uncomment the `Activity` menu item under the `Work` section in [`Sidebar.jsx`](../../../components/Sidebar.jsx) (search for `Packet 2 — Activity (TODO)`).

**Packet 3 (Deadlines / Reminders / Performance):**
1. Create the three page files per TEAM_GUIDE.md Section 8 → Packet 3.
2. Uncomment the imports + three `<Route>` lines in [`ManagementEmployeeRouter.jsx`](../../../routes/Manager/ManagementEmployeeRouter.jsx) (search for `Packet 3`).
3. Uncomment the entire `Planning` section in [`Sidebar.jsx`](../../../components/Sidebar.jsx) (search for `Packet 3 — Planning (TODO)`).

Both router and sidebar live edits get one line each from "commented" to "uncommented" — no menu re-design, no route re-design, just flip the comments.

---

## Add a new entry to this checklist whenever…

Any future out-of-scope edit goes here with the same three sections:

1. **What was added** (one line)
2. **Why it was added** (one sentence)
3. **How to revert** (one command) + the snippet the Frontend Lead needs

The sidebar snippet above already covers every planned packet (1 through 4). If a packet's URL or label changes during implementation, update the snippet AND the live `Sidebar.jsx` entry together — don't let them drift.
