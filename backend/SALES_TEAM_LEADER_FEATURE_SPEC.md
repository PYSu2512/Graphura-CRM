# SALES TEAM LEADER FEATURE SPEC

Production implementation guide for the Sales Team Leader (TL) lead-assignment workspace in Graphura CRM.

This document is the source of truth for:
- routes and API endpoints
- controller responsibilities
- service responsibilities
- data rules and validation
- frontend behavior
- DB write guarantees
- assigned / unassigned table logic

---

## 1. Feature Goal

The Sales Team Leader panel must let a TL:
- see the leads assigned to self
- see the leads assigned by self to sales executives
- select unassigned leads from own team scope
- assign those leads to approved executives in the same team
- refresh assigned and unassigned tables after every mutation
- avoid data leakage across other teams or dumped leads

The flow must be fully DB-backed. No UI-only success states are allowed.

---

## 2. Scope

Access scope:
- tenant-scoped by `admin`
- team-scoped by `team`
- role-scoped to `SALES_TL`
- can assign only to `SALES_EXECUTIVE`
- can only operate on active, approved, non-deleted, non-dumped leads

Not allowed:
- assigning to another TL
- assigning to Sales Manager
- assigning outside the TL's own team
- assigning dumped leads
- assigning soft-deleted leads
- showing stale assigned rows from local state only

---

## 3. User Story

Sales TL opens the panel and sees:
1. Leads assigned to self
2. Leads currently unassigned in own scope
3. A list of executives from the same team with current capacity

TL selects leads, enters manual distribution counts, confirms, and the system:
- writes `Lead.assignedTo`
- writes `Lead.assignedBy`
- writes `Lead.team`
- writes `LeadAssignmentHistory`
- writes `AuditLog`
- writes `Notification`
- refreshes assigned/unassigned tables from backend

If nothing persists, the request must fail with an error.

---

## 4. Data Source of Truth

### Lead document
Assignment data lives on `Lead`.

Fields used:
- `admin`
- `client`
- `assignedTo`
- `assignedBy`
- `team`
- `status`
- `isDumped`
- `dumpReason`
- `bulkUploadId`
- `updatedAt`

### LeadAssignmentHistory
Used to show assignment history and trace reassignments.

Fields used:
- `admin`
- `lead`
- `assignedTo`
- `assignedBy`
- `team`
- `reason`
- `assignedAt`
- `releasedAt`

### AuditLog
Used for traceability.

### Notification
Used to alert the assigned executive.

---

## 5. Frontend Behavior

### Tables
The TL panel should show three DB-backed views:

#### A. Leads Assigned To Me
Backend source:
- `GET /api/sales-manager/leads/assigned`

This table must show only leads where:
- `admin = current admin`
- `assignedTo = current TL`
- `isDeleted != true`
- `isDumped != true`

Recommended columns:
- name
- mobile
- email
- companyName
- status
- assignedTo
- assignedBy
- team
- assignedAt
- assignmentReason

#### B. Leads I Assigned To Executives
Can use the same endpoint if the backend filters are extended, or a dedicated endpoint if required later.

#### C. Unassigned Team Pool
Use the general leads endpoint and filter strictly in UI:
- `assignedTo === null` or `assignedTo === 'Unassigned'`
- `isDumped !== true`
- `isDeleted !== true`

### Distribution Modal Defaults
- `Assign Leads = 0`
- `Target = 0`

The UI must not prefill automatic values.

### After Confirm
Frontend must refresh:
- assigned leads
- unassigned leads
- assignment targets

The UI must not rely only on local arrays after mutation.

### Error Handling
If backend returns 409 or any assignment failure:
- show the backend message directly
- do not show a fake success banner

---

## 6. Required API Endpoints

Base route:
- `/api/sales-manager/leads`

### 6.1 Get all leads
```http
GET /api/sales-manager/leads
```

Purpose:
- fetch all sales leads for the current admin

### 6.2 Get assigned leads
```http
GET /api/sales-manager/leads/assigned
```

Purpose:
- fetch DB-backed assigned rows for the current admin

### 6.3 Get assignment targets
```http
GET /api/sales-manager/leads/assignment-targets?role=SALES_EXECUTIVE
```

Purpose:
- fetch active executive targets with live capacity

### 6.4 Assign one lead
```http
POST /api/sales-manager/leads/:leadId/assign
```

Body:
```json
{
  "userId": "<sales_executive_id>",
  "reason": "Manual assignment from TL"
}
```

### 6.5 Bulk transfer
```http
POST /api/sales-manager/leads/bulk/transfer
```

Body:
```json
{
  "leadIds": ["<lead_id_1>", "<lead_id_2>"],
  "userId": "<sales_executive_id>",
  "reason": "Manual assignment from TL"
}
```

### 6.6 Bulk distribute
```http
POST /api/sales-manager/leads/bulk/distribute
```

Body:
```json
{
  "assignments": [
    {
      "userId": "<sales_executive_id>",
      "leadIds": ["<lead_id_1>", "<lead_id_2>"],
      "reason": "Distributed by Sales TL"
    }
  ]
}
```

### 6.7 Assign batch from upload
```http
POST /api/sales-manager/leads/bulk/:uploadId/assign-batch
```

---

## 7. Router Contract

Suggested router file:
- `backend/src/routes/salesManagerLeads.js`

Route order must avoid collisions:
1. `/assignment-targets`
2. `/assigned`
3. `/bulk/template`
4. `/bulk/preview`
5. `/bulk/:uploadId/commit`
6. `/bulk/:uploadId/status`
7. `/:leadId/assign`
8. `/bulk/transfer`
9. `/bulk/distribute`
10. `/bulk/:uploadId/assign-batch`
11. `/:leadId`

Middleware stack:
- `requireUser`
- `requireSalesManager` for admin-level lead listing and dump actions
- `requireLeadAssigner` for assignment operations
- `validate(...)` for Joi body/query validation

---

## 8. Controller Responsibilities

Suggested controller file:
- `backend/src/controllers/bulkLeadUpload.controller.js`

Controller functions:

### `getAllLeads`
- fetch all leads for current admin
- populate client and assignment relations
- expose assigned metadata to frontend

### `getAssignedLeads`
- fetch assigned leads for current admin
- filter out dumped and deleted rows
- populate assignment relations
- return DB-backed rows only

### `getAssignmentTargets`
- return active sales executives for the current admin
- include live capacity based on current assignment count and limit rules

### `assignLead`
- assign a single lead to one executive

### `bulkAssignLeads`
- assign a list of leads to one executive

### `distributeLeads`
- assign groups of leads to multiple executives
- must return total assigned count and skipped count
- must fail if zero leads persist

### `assignBatchLeads`
- assign leads from a bulk upload batch

### `deleteLead`
- hard delete only where the business rule explicitly allows it
- keep this separate from dump behavior

---

## 9. Service Responsibilities

Suggested service file:
- `backend/src/services/bulkLeadUpload.service.js`

Responsibilities:

### Assignment Target Resolution
- resolve allowed target roles from TL role
- resolve target team
- resolve current assignment count
- resolve effective lead limit

### Lead Selection
- select only valid leads for the current admin
- exclude dumped and soft-deleted rows
- reject invalid ObjectIds

### Assignment Write Path
For each lead:
- update `Lead.assignedTo`
- update `Lead.assignedBy`
- update `Lead.team`
- create `LeadAssignmentHistory`
- create `AuditLog`
- create `Notification`

### Skip Rules
- already assigned to same executive in same team → skip
- missing lead IDs → skip or fail depending on mode
- if no leads persist → fail request

### Capacity Rules
- do not exceed executive capacity
- respect role-wise lead limits and overrides

---

## 10. Validation Rules

### `userId`
- required
- valid Mongo ObjectId
- must be approved, active SALES_EXECUTIVE

### `leadIds`
- array of ObjectIds
- minimum 1 item

### `assignments`
- array of assignment groups
- each group requires `userId` and `leadIds`

### `role`
- allowed query values:
- `SALES_TL`
- `SALES_EXECUTIVE`

### Assignment Safety Checks
- same-team only
- active users only
- no dumped leads
- no deleted leads
- no zero-persist success

---

## 11. DB Write Guarantees

On successful TL assignment, the system must persist:
- `Lead.assignedTo`
- `Lead.assignedBy`
- `Lead.team`
- `LeadAssignmentHistory`
- `AuditLog`
- `Notification`

On failure:
- do not return success
- do not partially claim success without DB write confirmation

---

## 12. Suggested Response Shape

### Success
```json
{
  "success": true,
  "data": {
    "assignedCount": 12,
    "skippedCount": 1,
    "groups": [
      {
        "targetUser": {
          "id": "<id>",
          "name": "Neha Verma",
          "email": "...",
          "role": "SALES_EXECUTIVE"
        },
        "assignedCount": 12,
        "skippedCount": 0
      }
    ]
  }
}
```

### Failure
```json
{
  "success": false,
  "message": "No leads were assigned. skipped=..., missing=..., alreadyAssigned=..."
}
```

---

## 13. Recommended Frontend Screens

### TL Lead Dashboard
- top stats
- assigned to me
- assigned by me
- unassigned pool
- executive capacity preview

### Distribution Modal
- team executive rows
- manual input for assign count
- manual input for target count
- submit button
- success summary with backend-confirmed counts

### Assigned Table
- show DB-backed assigned rows only
- use dedicated assigned endpoint

### Assignment History Drawer
- lead history
- who assigned
- when assigned
- why assigned

---

## 14. Recommended Task Breakdown for Team Members

### Backend Member 1
- router endpoints
- validation schemas
- controller integration

### Backend Member 2
- assignment service logic
- DB write rules
- history and audit logging

### Frontend Member 1
- TL assigned table
- assigned data fetch
- live refresh behavior

### Frontend Member 2
- distribution modal UX
- manual counts
- error handling and success summary

### QA Member
- verify DB persistence
- verify no data leakage
- verify dumped leads never appear in active assignment workflow
- verify unassigned table shrinks after assignment

---

## 15. Acceptance Criteria

The feature is complete only if all are true:
- TL can fetch assigned leads from DB
- TL can assign only to own team executives
- assigned leads persist in DB
- assigned table updates from backend data
- unassigned table excludes assigned leads after refresh
- dumped leads stay out of assignment workflow
- 409 or other errors are shown correctly
- no fake success is possible without persistence


