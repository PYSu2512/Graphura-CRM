# ================================================================
# GRAPHURA CRM — COMPLETE MASTER KNOWLEDGE BASE
# FOR: GitHub Copilot / Any AI Assistant
# VERSION: FINAL PRODUCTION v3.0
# ================================================================
# HOW TO USE:
# Paste this entire file into GitHub Copilot Chat or any AI.
# Say: "Store this as project knowledge. Do not write any code yet.
#        I will give you tasks one by one."
# ================================================================

---

# PART 1 — SYSTEM OVERVIEW

## What is This Project?
A **multi-tenant CRM SaaS** built for Graphura India Private Limited.
It manages Sales, Finance, and Management departments for multiple companies.
Each company (Admin) is a completely isolated tenant.

## Architecture
```
SUPER ADMIN (1 only — Graphura owner, seeded in DB)
    │
    ├── ADMIN 1 (Company A — Tenant 1)
    │     ├── Sales Department
    │     │     ├── Sales Manager (1)
    │     │     ├── Sales Team Leader (many)
    │     │     └── Sales Executive (many)
    │     ├── Finance Department
    │     │     └── Finance Manager (1)
    │     └── Management Department
    │           ├── Management Manager (1)
    │           ├── Management Team Leader (many)
    │           └── Management Employee (many)
    │
    ├── ADMIN 2 (Company B — Tenant 2)
    │     └── (exact same structure, fully isolated)
    └── ADMIN N ...
```

## Golden Rules
1. **ONE Super Admin** in entire system — no registration, seeded in DB
2. **Multiple Admins** — each admin = one company = one tenant
3. **Max 40 users per admin** by default (Super Admin can increase)
4. **EVERY model** has `admin: ObjectId` field — this is the tenant scope
5. **Department members NEVER self-register** — Admin creates all users
6. **Never hard-delete leads** — always move to dump
7. **Never hard-delete any record** — use softDelete plugin
8. **Client mobile is unique PER admin** — not globally

---

# PART 2 — TECH STACK

```
Runtime:       Node.js 20+
Framework:     Express.js
Database:      MongoDB + Mongoose v8
Auth:          JWT Access Token (1-2hr) + Refresh Token (DB stored)
Payments:      Razorpay (orders + checkout + signature + webhooks)
Email:         Brevo (transactional emails — invoices, OTP, WO)
Push Notif:    Firebase FCM (mobile push — token stored in User.fcmToken)
Password:      bcrypt (all passwords + OTP hashing)
Security:      RBAC + Rate Limiting + Input Validation + JWT Hardening
UI Ref 1:      https://themesbrand.com/velzon/html/master/dashboard-crm.html
UI Ref 2:      https://preview.themeforest.net/item/hrm-crm-next-js-dashboard-template-manez/full_screen_preview/55890159
```

---

# PART 3 — ALL ROLES

```
SUPER_ADMIN          Graphura owner. ONE only. Seeded in DB. No registration.
ADMIN                Company owner/tenant. Self-registers. One per company.
SALES_MANAGER        Head of Sales. Created by Admin.
SALES_TL             Sales Team Leader. Created by Admin.
SALES_EXECUTIVE      Sales agent. Created by Admin.
FINANCE_MANAGER      Head of Finance. Created by Admin.
MANAGEMENT_MANAGER   Head of Management. Created by Admin.
MANAGEMENT_TL        Management Team Leader. Created by Admin.
MANAGEMENT_EMPLOYEE  Management worker. Created by Admin.
```

---

# PART 4 — ALL 45 MODELS (What Each Stores)

## [M1] SuperAdmin
Single document seeded in DB. No API registration ever.
```
name, email (unique), password (bcrypt), isActive
createdAt, updatedAt
```

## [M2] SuperAdminLoginLog
Every Super Admin login attempt. Super Admin sees this dashboard.
```
superAdmin (ref), email, ipAddress, latitude, longitude,
userAgent, device, isSuccess, failReason, loginAt
```

## [M3] LoginAttempt
Brute force protection. Blocks after 5 fails for 30 minutes.
TTL auto-deletes after 24 hours of last attempt.
```
identifier (email or IP), identifierType (EMAIL/IP),
attempts, isBlocked, blockReason, blockedAt, blockedUntil,
lastAttemptAt (TTL field), ipAddress, userAgent
UNIQUE INDEX: { identifier, identifierType }
TTL INDEX: { lastAttemptAt } expireAfterSeconds: 86400
```

## [M4] TokenBlacklist
Immediate JWT revocation. Auth middleware checks this BEFORE validating JWT.
TTL auto-deletes after token naturally expires.
```
token (unique), holderType (SUPER_ADMIN/ADMIN/USER),
holderId, reason (LOGOUT/DEACTIVATED/PASSWORD_CHANGED/FORCED_LOGOUT),
blacklistedAt, expiresAt (TTL field)
TTL INDEX: { expiresAt } expireAfterSeconds: 0
```

## [M5] RefreshToken
JWT refresh token storage. Revoked on logout.
TTL auto-deletes expired tokens.
```
holderId, holderType, admin (ref, null for SuperAdmin),
token (unique), expiresAt (TTL), isRevoked,
ipAddress, userAgent, revokedAt, revokedReason
TTL INDEX: { expiresAt } expireAfterSeconds: 0
```

## [M6] PasswordReset
OTP for forgot password. bcrypt hashed. Expires in 10 minutes.
```
userId, email, token (bcrypt hashed OTP),
expiresAt (TTL 10min), isUsed, usedAt, ipAddress, userAgent, attemptCount
TTL INDEX: { expiresAt } expireAfterSeconds: 0
```

## [M6A] EmailVerification
OTP for Admin email verification during signup. Expires in 10 minutes.
```
email (unique), otp, attempts, isVerified
TTL INDEX: { createdAt } expireAfterSeconds: 600
```

## [M7] SubscriptionPlan
Plans created by Super Admin. Controls admin limits.
```
planName (unique), maxUsers (40), maxClients (6000),
storageGB (10), priceINR, durationDays (30),
isActive, features [], description
```

## [M8] Admin — TENANT MODEL ⭐ MOST IMPORTANT
Each Admin = one company = one tenant. All data scoped to admin._id.
```
name, email (unique globally), password (bcrypt), phone (10 digits)

company: {
  name, logo (URL), email, phone,
  website,          ← added as requested
  address: { line1, line2, city, state, pincode, country }
}

bankDetails: { bankName, accountNumber, ifscCode, upiId, branch }

userLimit: 40          ← Super Admin controls. Admin cannot change.
clientLimit: 6000      ← Super Admin controls. Admin cannot change.

leadLimits: {
  SALES_EXECUTIVE: 250,   ← Admin CAN change these
  SALES_TL: 1500,
  SALES_MANAGER: 6000
}

plan (ref SubscriptionPlan), planActivatedAt, planExpiresAt,
planStatus (TRIAL/ACTIVE/EXPIRED/SUSPENDED)

isActive, isProfileComplete, superAdmin (ref)
isDeleted, deletedAt, deletedBy  ← softDeletePlugin
createdAt, updatedAt
```

## [M9] AdminLoginLog
Every Admin login attempt. Super Admin dashboard shows all admin logs.
```
admin (ref), email, role (ADMIN), ipAddress,
latitude, longitude, userAgent, device,
isSuccess, failReason, loginAt
INDEX: { admin, loginAt: -1 }
```

## [M10] UserLimitOverride
Super Admin increases a specific Admin's user limit without changing plan.
ONE record per Admin.
```
admin (ref, unique), userLimit, reason,
grantedBy (ref SuperAdmin), grantedAt,
expiresAt (null = permanent), isActive
```

## [M11] DataLimitOverride
Super Admin increases a specific Admin's lead/client data limits.
ONE record per Admin.
```
admin (ref, unique), clientLimit,
leadLimits: { SALES_EXECUTIVE, SALES_TL, SALES_MANAGER },
reason, grantedBy (ref SuperAdmin), grantedAt
```

## [M12] Department
Proper model — NOT hardcoded enum. Expandable.
3 defaults auto-created on Admin registration: SALES, FINANCE, MANAGEMENT.
```
admin (ref), name (uppercase, unique per admin), displayName,
isDefault, isActive, manager (ref User)
isDeleted, deletedAt, deletedBy
UNIQUE INDEX: { admin, name }
```

## [M13] Service (Catalog)
Services/products offered by Admin's company.
Used in ProspectForm (suggested services) + Invoice line items.
```
admin (ref), name, description, price, unit
(e.g. "per month", "one-time", "per page")
isActive, isDeleted, deletedAt, deletedBy
```

## [M14] User — DEPARTMENT MEMBERS ⭐
Created ONLY by Admin. NO self-registration.
Default password = email + '@' + last 5 digits of phone.
email is unique PER admin (not globally).
```
admin (ref) ← REQUIRED — tenant scope
department (ref Department) ← REQUIRED
name, email, password (bcrypt), phone (10 digits)
role (SALES_MANAGER/SALES_TL/SALES_EXECUTIVE/
      FINANCE_MANAGER/MANAGEMENT_MANAGER/
      MANAGEMENT_TL/MANAGEMENT_EMPLOYEE)
manager (ref User) ← direct reporting user
address: { line1, line2, city, state, pincode, country }
bankDetails: { bankName, accountNumber, ifscCode, upiId, branch }
profilePic (URL), fcmToken (Firebase push token)
leadDataLimit (null = use admin.leadLimits[role])
isActive, isProfileComplete,
mustChangePassword: true  ← forced on first login
isFirstLogin: true
tempPassword (raw auto-generated — clear after first login)
approvalStatus (PENDING/APPROVED/REJECTED)
lastLoginAt, lastActiveAt
lastPasswordResetAt, passwordResetCount
passwordHistory: [{ hash, changedAt }]
isDeleted, deletedAt, deletedBy
UNIQUE INDEX: { admin, email }
```

## [M15] UserLoginLog
Every department member login. Scoped to admin.
Role-based visibility enforced at API layer.
```
admin (ref) ← tenant scope
user (ref), email, role, ipAddress,
latitude, longitude, userAgent, device,
isSuccess, failReason, loginAt
INDEX: { admin, user, loginAt: -1 }
INDEX: { admin, role, loginAt: -1 }
```

## [M16] AuditLog
Tracks every important action. Who changed what. Before/after snapshots.
```
admin (ref, null for SuperAdmin actions)
performedBy (ObjectId), performerType (SUPER_ADMIN/ADMIN/USER)
action (enum — 45+ actions listed below)
targetModel (Lead/User/Project/etc.), targetId
before (Mixed — snapshot before), after (Mixed — snapshot after)
ipAddress, note
```
**Audit Actions (45+):**
USER_CREATED, USER_UPDATED, USER_DELETED, USER_ACTIVATED, USER_DEACTIVATED, BULK_USER_UPLOAD,
LEAD_CREATED, LEAD_ASSIGNED, LEAD_REASSIGNED, LEAD_DUMPED, LEAD_RESTORED, LEAD_STATUS_CHANGED, BULK_LEAD_UPLOAD,
PROJECT_CREATED, PROJECT_UPDATED, PROJECT_STATUS_CHANGED, PROJECT_DELIVERED,
PAYMENT_CREATED, PAYMENT_VERIFIED, PAYMENT_FAILED, PAYMENT_REFUNDED,
INVOICE_CREATED, INVOICE_SENT, WORK_ORDER_GENERATED, WORK_ORDER_SIGNED, WORK_ORDER_APPROVED,
LEAVE_APPLIED, LEAVE_APPROVED, LEAVE_REJECTED, LEAVE_CANCELLED,
TARGET_SET, TARGET_UPDATED, ANNOUNCEMENT_SENT,
TICKET_CREATED, TICKET_RESOLVED, TICKET_ESCALATED,
ADMIN_CREATED, ADMIN_UPDATED, ADMIN_DEACTIVATED,
LIMIT_CHANGED, PASSWORD_CHANGED, PROFILE_UPDATED,
ATTENDANCE_CLOCK_IN, ATTENDANCE_CLOCK_OUT,
PROSPECT_CREATED, PROSPECT_UPDATED,
TEAM_CREATED, TEAM_UPDATED, TEAM_MEMBER_ADDED, TEAM_MEMBER_REMOVED, TEAM_DELETED

## [M17] InvoiceCounter
Atomic sequence number per Admin. Prevents duplicate invoice numbers.
ONE record per Admin. Use findOneAndUpdate + $inc ONLY.
```
admin (ref, unique), seq (0 → auto incremented), prefix (INV)
Generated format: INV-000001, INV-000002 ...
UNIQUE INDEX: { admin }
```

## [M18] WebhookLog
Raw log of every Razorpay webhook. Enables replay detection and audit trail.
```
admin (ref), source (RAZORPAY), event (payment.captured/payment.failed/etc.)
payload (Mixed — full raw JSON), signature,
isVerified, isProcessed, processedAt, error,
razorpayPaymentId, razorpayOrderId
```

## [M19] Team
Groups of users. Sales TL leads Executives. Management TL leads Employees.
```
admin (ref), department (ref), name, leader (ref User),
members: [{ user (ref), joinedAt }]
isActive, isDeleted, deletedAt, deletedBy
INDEX: { admin, department, isDeleted }
INDEX: { admin, leader }
```

## [M20] Client ⭐
PRIMARY IDENTIFIER = mobile (unique per admin — NOT globally).
Two different admins CAN have the same client mobile. That is correct.
```
admin (ref) ← tenant scope
name, email, mobile (10 digits — PRIMARY KEY per tenant)
companyName (from CSV), source (CSV_UPLOAD/EXCEL/MANUAL/PROSPECT_FORM/PAYMENT_PAGE)
prospectStatus (NONE/INTERESTED/NEGOTIATING/CLOSED_WON/CLOSED_LOST)
addedBy (ref User)
isDeleted, deletedAt, deletedBy
UNIQUE INDEX: { admin, mobile }  ← NOT globally unique
```
**CSV Upload columns:** companyName, mobile, email

## [M21] Lead ⭐
Lead = Client assigned to a Sales Executive.
Lifecycle: UNTOUCHED → TALK/NOT_TALK → INTERESTED → CONVERTED or DUMP.
NEVER hard-delete. notTalkCount >= 3 triggers auto-dump.
```
admin (ref), client (ref)
assignedTo (ref User — Sales Executive)
assignedBy (ref User — TL or Manager who assigned)
team (ref Team)
status (UNTOUCHED/TALK/NOT_TALK/INTERESTED/CONVERTED/DUMP)
talkCount, notTalkCount (>=3 = auto-dump), talkDuration (minutes total)
lastContactedAt
isDumped, dumpReason, dumpedAt, dumpedBy (ref)
restoredAt, restoredBy (ref — Manager/Admin only)
followUpAt, followUpMissed
convertedAt, convertedBy (ref)
bulkUploadId (ref BulkLeadUpload)
```

## [M22] LeadAssignmentHistory
Full reassignment history. Who had which lead, when, and why.
```
admin (ref), lead (ref), assignedTo (ref User),
assignedBy (ref User), team (ref),
reason, assignedAt, releasedAt (null if current owner)
INDEX: { admin, lead, assignedAt: -1 }
INDEX: { admin, assignedTo }
```

## [M23] LeadActivity
Every status update and comment by Sales Executive on a lead.
```
admin (ref), lead (ref), user (ref User — who acted)
status (lead status at time of activity)
comment (call notes), duration (call minutes)
INDEX: { admin, lead, createdAt: -1 }
INDEX: { admin, user, createdAt: -1 }
```

## [M24] BulkLeadUpload
Tracks every CSV/Excel lead upload. Row-level errors for debugging.
CSV columns required: companyName, mobile, email
```
admin (ref), uploadedBy (ref User — Sales Manager)
fileType (CSV/EXCEL), fileName, fileUrl
totalRows, imported, duplicates, invalidRows
failedRows: [{ rowNumber, rawData, reason (INVALID_PHONE/DUPLICATE/MISSING_FIELD) }]
errorMessages [], status (PROCESSING/PREVIEWED/DONE/PARTIAL/FAILED)
assignedTo (ref User — who leads assigned to after upload)
```

## [M24A] BulkUserUpload
Tracks bulk user/member creation by Admin via CSV/Excel.
```
admin (ref), uploadedBy, uploadedByType (ADMIN/USER)
fileType, fileName, fileUrl
totalRows, validRows, imported, duplicates, invalidRows
failedRows: [{ rowNumber, rawData, reason, fieldErrors: [{ field, message }] }]
errorMessages [], status (UPLOADED/PROCESSING/DONE/PARTIAL/FAILED)
options: { skipDuplicates, strictMode }
startedAt, completedAt
```

## [M25] ProspectForm
Filled by Sales Executive for interested leads.
Sales → Finance Manager flow via suggestedServices → finalServices.
```
admin (ref), lead (ref), client (ref)
filledBy (ref User — Sales Executive), updatedBy (ref User)
requirement, budget, expectedClosing, notes
suggestedServices: [{ service (ref), name, price, qty }]  ← Sales fills
finalServices: [{ service (ref), name, price, qty, discount }]  ← Finance edits
totalAmount, discount, finalAmount
status (OPEN/IN_NEGOTIATION/SENT_TO_FINANCE/WON/LOST)
```

## [M26] Reminder
Follow-up reminders. Can be on a Lead OR a Project.
```
admin (ref), user (ref — who set it)
lead (ref, null if project), project (ref, null if lead)
title, note, remindAt, isMissed, isDone, doneAt
INDEX: { admin, user, remindAt, isDone }
```

## [M27] SalesTarget
Targets set by Sales Manager or Admin. USER/TEAM/DEPARTMENT level.
⚠ achievedCalls/Sales/Revenue MUST ONLY use $inc — NEVER $set.
```
admin (ref), setBy (ref User)
targetFor (USER/TEAM/DEPARTMENT)
user (ref), team (ref), department (ref)
period (DAILY/WEEKLY/MONTHLY), fromDate, toDate
targetCalls, targetSales, targetRevenue
achievedCalls ← $inc ONLY
achievedSales ← $inc ONLY
achievedRevenue ← $inc ONLY
```

## [M28] DailyReport
Pre-computed daily snapshot per user. Avoids expensive aggregation.
Generated by cron or on-demand. ONE record per user per day.
```
admin (ref), user (ref), date (normalized to 00:00:00)
totalCalls, todayCalls, todayProspect, todaySell,
todayDump, totalUntouched, totalLeads, talkRatio, followUpMissed
generatedAt
UNIQUE INDEX: { admin, user, date }
```

## [M29] Project ⭐
Created after deal finalized. Links Sales (who sold) → Finance (payment) → Management (execution).
handoverLink is MANDATORY before delivery.
⚠ paidAmount ONLY via $inc with overpayment check.
```
admin (ref), client (ref)
name, description, driveLink, handoverLink (mandatory before delivery)
priority (LOW/MEDIUM/HIGH/URGENT)
status (NOT_STARTED/WORK_STARTED/IN_PROGRESS/REVIEW/FINALIZATION/COMPLETED/DELIVERED/DELAYED)
startDate, expectedDelivery, deliveredAt
assignedTeam (ref), teamLeader (ref User — Management TL)
assignedTo (ref User — Management Employee)
soldBy (ref User — Sales Executive who converted) ← performance tracking
prospectForm (ref)
totalAmount, paidAmount ← $inc WITH OVERPAYMENT CHECK ONLY
isDelivered, deliveryConfirmed, progressPercent (0-100)
isDeleted, deletedAt, deletedBy
```

## [M30] ProjectUpdate
Every timeline milestone/update entry.
Powers internal tracking AND public client tracking page.
```
admin (ref), project (ref), updatedBy (ref User)
status, note (client visible), workNote (internal only)
attachmentUrl, progressPercent, isClientVisible (true/false)
```

## [M31] Payment
Razorpay payments. signatureVerified MUST be true before SUCCESS.
webhookVerified = backup confirmation.
```
admin (ref), project (ref), client (ref)
razorpayOrderId, razorpayPaymentId, razorpaySignature
amount (min 1), paymentType (FULL/PARTIAL)
status (PENDING/SUCCESS/FAILED/REFUNDED), failureReason
signatureVerified (false → true after Razorpay sig check)
webhookVerified (false → true after webhook received)
paidAt, retryCount, verifiedBy (ref User — Finance Manager)
isRefunded, refundedAt, refundReason, razorpayRefundId
```

## [M32] WorkOrder
Generated by Finance Manager. Client must sign before project starts.
```
admin (ref), project (ref)
generatedBy (ref User), approvedBy (ref User)
isGenerated, pdfUrl
isSigned, signedAt, signedByName (client's name)
isApproved, approvedAt, sentToEmail, sentAt
```

## [M33] Invoice
Auto or manual. Number generated atomically via InvoiceCounter.
Custom GST supported. Line items from Service catalog.
```
admin (ref), project (ref), payment (ref), createdBy (ref User)
invoiceNumber (e.g. INV-000001 — NEVER manually generated)
amount, discount, gstPercent (18 default), gstAmount, isCustomGst
totalAmount, lineItems: [{ name, qty, price, amount }]
status (DRAFT/SENT/PAID/OVERDUE/CANCELLED)
pdfUrl, dueDate, sentAt, sentToEmail, paidAt
UNIQUE INDEX: { admin, invoiceNumber }
```

## [M34] Expense
Company expenses tracked by Finance Manager.
Used for: Net Profit = Total Revenue - Total Expenses.
```
admin (ref), createdBy (ref User), updatedBy (ref User)
category, amount (min 0), note, date, receiptUrl
isDeleted, deletedAt, deletedBy
Reports: Daily / Monthly / Category-wise
```

## [M35] Ticket (Internal Support)
Raised by any user to any level within the company.
Supports escalation up the hierarchy.
```
admin (ref), raisedBy (ref User), assignedTo (ref User)
subject, message
status (OPEN/IN_PROGRESS/RESOLVED/CLOSED/ESCALATED)
priority (LOW/NORMAL/HIGH/URGENT)
refType (CLIENT_DATA/SALES_MANAGER/SALES_TL/EXECUTIVE/SYSTEM), refId
replies: [{ user (ref), message, createdAt }]
isEscalated, escalatedAt, resolvedAt, resolvedBy (ref)
```

## [M36] SuperAdminTicket
Tickets from Admin TO Super Admin. Completely separate from internal tickets.
```
raisedBy (ref Admin), subject, message
status (OPEN/IN_PROGRESS/RESOLVED/CLOSED/ESCALATED)
priority, replies: [{ senderType (ADMIN/SUPER_ADMIN), senderId, message, createdAt }]
resolvedAt
```

## [M37] Attendance
Clock in/out per user per day. ONE record per user per day.
Date MUST be normalized to 00:00:00 via pre-save hook.
```
admin (ref), user (ref), date (normalized by pre-save hook)
clockIn, clockOut, latitude, longitude, ipAddress
breaks: [{ startedAt, endedAt }]
hoursWorked (decimal), breakMinutes, overtimeMinutes
isHalfDay, isAbsent, note
UNIQUE INDEX: { admin, user, date }
PRE-SAVE: d.setHours(0,0,0,0)
```

## [M38] LeaveBalance
Leave quota per user per year. Updated when leave approved.
ONE record per user per year.
```
admin (ref), user (ref), year (e.g. 2025)
casual:  { total: 12, used: 0, remaining: 12 }
sick:    { total: 6,  used: 0, remaining: 6  }
earned:  { total: 15, used: 0, remaining: 15 }
unpaid:  { total: 0,  used: 0, remaining: 0  }
UNIQUE INDEX: { admin, user, year }
Update: $inc { casual.used: days, casual.remaining: -days }
```

## [M39] Leave
Leave request by any user. Approved by Admin or Team Leader.
Updates LeaveBalance on approval.
```
admin (ref), user (ref), approvedBy (ref User)
leaveType (CASUAL/SICK/EARNED/HALF_DAY/UNPAID)
fromDate, toDate, days (min 0.5)
reason, status (PENDING/APPROVED/REJECTED/CANCELLED)
rejectionNote, approvedAt, cancelledAt
```

## [M40] Announcement
Internal communications. INFO / WARNING / APPRECIATION.
Targeted by department, team, role, or specific user.
```
admin (ref), createdBy (ref User, null if by Admin directly)
createdByAdmin (true if Admin sent it)
title, message, type (INFO/WARNING/APPRECIATION)
targetType (ALL/DEPARTMENT/TEAM/ROLE/USER)
targetDepartment (ref), targetTeam (ref), targetRole, targetUser (ref)
```

## [M41] Notification
Firebase FCM push notification records. Read/unread tracking.
```
admin (ref), user (ref — recipient)
title, body, type (PAYMENT_SUCCESS/PAYMENT_FAILED/WORK_ORDER_SIGNED/
TICKET_UPDATED/LEAD_ASSIGNED/REMINDER_DUE/ANNOUNCEMENT/TARGET_ALERT/LEAVE_STATUS/GENERAL)
refId, refType (related model name), isRead, readAt
INDEX: { admin, user, isRead, createdAt: -1 }
```

## [M42] ApiConfig
Global API keys. Managed by Super Admin ONLY.
```
key (unique — e.g. RAZORPAY_KEY_ID, BREVO_API_KEY, FIREBASE_SERVER_KEY)
value (encrypted in production), description, isEncrypted, updatedBy (ref SuperAdmin)
```

## [M43] ProjectTrackingToken
Public client tracking page. No login needed. UUID token in URL.
```
admin (ref), project (ref), client (ref)
token (UUID v4, unique — used as: /track/{token})
expiresAt (null = never expires), isActive
lastAccessedAt, accessCount
INDEX: { admin, project }
```

---

# PART 5 — LOGIN FLOWS

## Super Admin Login
```
1. POST /api/superadmin/login
2. Find SuperAdmin by email
3. Check LoginAttempt (brute force) → block if needed
4. Check isActive
5. bcrypt compare password
6. On fail: increment LoginAttempt
7. On success: clear LoginAttempt, create RefreshToken, return JWT
8. Log to SuperAdminLoginLog
```

## Admin Login
```
1. POST /api/admin/login
2. Find Admin by email (isDeleted: false, isActive: true)
3. Check LoginAttempt (brute force)
4. bcrypt compare password
5. On fail: increment LoginAttempt
6. On success: clear LoginAttempt, create RefreshToken, return JWT
7. Log to AdminLoginLog
```

## Admin Registration
```
1. POST /api/admin/register
2. Check email not already exists in Admin collection
3. Send OTP to email via Brevo → store in EmailVerification
4. POST /api/admin/verify-email (verify OTP)
5. Create Admin record (planStatus: TRIAL, userLimit: 40)
6. AUTO-CREATE:
   - 3 Departments (SALES, FINANCE, MANAGEMENT)
   - InvoiceCounter { admin, seq: 0, prefix: 'INV' }
7. Return JWT
```

## User (Department Member) Login
```
1. POST /api/user/login
2. Find User by email AND admin (tenant scope)
3. Check isActive, approvalStatus = APPROVED
4. Check LoginAttempt
5. bcrypt compare password
6. On success:
   a. If mustChangePassword = true → return { mustChangePassword: true }
      (Frontend redirects to change password page)
   b. Else → return full JWT access
7. Update User.lastLoginAt, User.fcmToken (from request)
8. Log to UserLoginLog (admin scoped)
```

## First Login Flow (Department Members)
```
1. User logs in with default password (email@last5digits)
2. API returns: { mustChangePassword: true, tempToken: <short-lived> }
3. Frontend shows change password form
4. POST /api/user/change-password (using tempToken)
5. User sets new password
6. mustChangePassword = false, isFirstLogin = false
7. Frontend shows profile completion form
8. POST /api/user/complete-profile
   → fill: address, bankDetails (email + phone already filled)
9. isProfileComplete = true
10. Clear tempPassword field from DB
11. Normal access granted
```

---

# PART 6 — FEATURES BY ROLE

## SUPER ADMIN Features
```
Dashboard:
  - Global metrics: total admins, active/inactive, revenue by plan
  - Total system usage

Admin Management:
  - Create / Edit / View / Delete admins
  - Activate / Deactivate admin accounts
  - Manage user limit per admin (UserLimitOverride)
  - Manage data limit per admin (DataLimitOverride)

Login Logs:
  - View AdminLoginLog (all admin logins)
  - View SuperAdminLoginLog (own logs)
  - Fields: Username/Email, Date/Time, Lat/Long, IP, Role

Communication:
  - Send announcements to specific admins

Subscription & Billing:
  - Create/manage subscription plans (SubscriptionPlan)
  - Assign plans to admins
  - Track billing and storage usage

Support Tickets:
  - View/manage SuperAdminTickets from admins only
  - Reply, resolve, close tickets

API Configuration:
  - Set/update: Razorpay keys, Brevo API key, Firebase key
  - Stored in ApiConfig model
```

## ADMIN Features
```
Dashboard (Global — All Departments):
  - Total Leads, Total Revenue, Total Expense
  - Active Projects, Total Support Tickets
  - Conversion Rate = (Converted Clients × 100) / Total Connected Leads
  - Department-wise: Sales performance, Project progress, Finance summary

User & Role Management (max 40 users by default):
  - Create users (assign role + department)
  - Bulk create via CSV/Excel (BulkUserUpload)
  - Edit / Delete / Activate / Deactivate users
  - Assign roles: Sales Manager, Finance Manager, Management Manager etc.
  - Reset passwords
  - View approval queue (PENDING users)
  - RBAC permission mapping

Department Management:
  - View all 3 default departments
  - Assign managers to departments
  - Monitor department performance

Login Logs (All Departments):
  - View ALL UserLoginLog for this admin
  - Fields: Username/Email, Date/Time, Lat/Long, IP, Role

HRM Control:
  - View attendance for ALL users
  - Approve/reject leave requests for ALL users
  - Track working days, attendance records
  - View LeaveBalance for all users

Sales Target Management:
  - Set daily/weekly/monthly targets (Manager-wise)
  - Monitor progress across all sales teams

Dump Data Control:
  - View all dump leads
  - Restore leads (IMPORTANT — only Admin or Manager can restore)
  - Export dump data (CSV/Excel)
  - Delete dump data permanently (Admin only)

Support & Escalation:
  - View ALL internal tickets
  - Create/resolve/close tickets
  - Create support ticket for Super Admin (SuperAdminTicket)

Communication System:
  - Send announcements (department/team/role/user wise)
  - Send warnings/appreciation messages

Project Control:
  - View/edit ALL projects
  - Set priority, deadlines
  - Update project status
  - Confirm delivery

Finance Dashboard:
  - Total Revenue, Today Revenue, Pending/Failed Payments
  - View/download invoices
  - View/download expenses
  - Set expense limit (approves Finance Manager's limit)

Company Branding:
  - Edit: Logo, Name, Email, Address, Phone, Website
  - Stored in Admin.company fields

Lead Limit Management:
  - Change role-wise lead limits (SALES_EXECUTIVE: 250, etc.)
  - Only Admin can change leadLimits within their account

Show Bank Details:
  - Admin.bankDetails shown for payments reference

Underperformer Detection:
  - Identify underperforming executives/leaders
```

## SALES MANAGER Features
```
Access Scope: ALL sales data under this admin

Bulk Lead Upload:
  - Upload CSV/Excel files
  - CSV columns: companyName, mobile, email
  - Validation: 10-digit phone, duplicate check, invalid format
  - Duplicate handling: skip duplicates, log in BulkLeadUpload
  - Row-level error report generated

Global Lead View:
  - View ALL leads (all teams, all executives)
  - Filters: Talk/Not Talk/Untouched/Interested/Dump
  - Filter by: team, employee, date
  - Actions: Search, Filter, Sort, View comments & history

Team Management:
  - Create teams (Team model)
  - Assign Team Leaders to teams
  - Add/remove executives from teams
  - Move executives between teams

Lead Distribution:
  - Assign leads to Team Leaders or Executives
  - Bulk assign leads
  - Reassign leads

Sales Target Management:
  - Set daily/weekly/monthly targets (user/team/dept level)
  - Monitor progress (SalesTarget model)

Performance Dashboard:
  Global metrics: Total Leads, Total Calls, Conversion Rate, Revenue
  Team-wise: Calls, Sales, Dump%, Follow-up Miss
  Individual: Executive performance, Leaderboard
  Date/Day/Employee/Team Leader wise filtering

Prospect:
  - View ALL prospect forms across all teams

Follow-up Control:
  - View ALL reminders across all teams
  - Detect/flag missed follow-ups

Dump Data Control:
  - View all dump leads
  - Analyze dump reasons
  - Restore leads (IMPORTANT)
  - Export dump data (CSV/Excel)

Support & Escalation:
  - View all tickets in Sales dept
  - Create tickets for Team Lead/Executive
  - Resolve tickets

HRM (Self):
  - Apply Leave, view Leave Status, Total Leaves, Working Days
  - Clock In / Clock Out
  - View own attendance

Communication:
  - Send announcements to Sales Department / Team / Role wise
  - Send warnings/appreciation to executives

Login Logs:
  - View: Self + Sales TL + Sales Executive
  - Fields: Username/Email, Date/Time, Lat/Long, IP, Role

Self Report (Daily, date-wise):
  - Total Calls, Today Calls, Today Prospect
  - Today Sell, Today Dump, Total Untouched, Complete list

Reporting System:
  - Reports: Daily/Weekly/Monthly
  - Team-wise reports, Executive-wise reports

Payment Alerts:
  - Failed/Successful payment notifications

Pro-Level (Optional):
  - Auto lead distribution (round-robin)
  - Underperformer detection
```

## SALES TEAM LEADER Features
```
Access Scope: OWN TEAM executives only

Lead Management:
  - Assign/Reassign leads to own team executives
  - Bulk assign leads
  - View ALL leads assigned to own team

Sales Target:
  - View own team's sales targets

Prospect Forms:
  - View all prospect forms from own team
  - Update prospect forms

Login Logs:
  - View: Self + Own team executives only
  - Fields: Username/Email, Date/Time, Lat/Long, IP, Role

Reminders:
  - View all team reminders
  - Add new reminders for team

Payment Alerts:
  - Failed/Successful (Self + Own team members)

Team Management:
  - View own team members
  - Track team attendance
  - View/approve leave requests of own team executives

Performance Dashboard:
  Team Metrics: Total Calls, Today Calls, Total Prospect, Today Sales,
                Talk Ratio, Untouched Leads, Dump Count, Follow-up Missed
  Individual: Executive-wise performance

HRM (Self):
  - Apply Leave, Leave Status, Total Leaves, Working Days
  - Clock In / Clock Out

Support Tickets:
  - Raise ticket / View team tickets / Reply / Escalate to Manager
  - Raise ticket for client data / sales manager

Self Report (Daily, date-wise):
  - Total Calls, Today Calls, Today Prospect
  - Today Sell, Today Dump, Total Untouched, Complete list

Communication:
  - Send Warning / Appreciation to own executives

Pro-Level (Optional):
  - Auto lead distribution (round-robin)
  - Missed follow-up alerts
  - Underperformer alerts
  - Team leaderboard
  - Call quality scoring (future AI)
```

## SALES TEAM LEADER Lead Assignment Workspace
```
Purpose:
  - Sales TL is the operational owner of the team's active pipeline.
  - The panel must fetch assigned-to-me leads from DB, assign leads to own executives,
    and refresh both assigned and unassigned lists after every mutation.

Access Scope:
  - admin-scoped only (tenant isolation)
  - own team only
  - active team only
  - no cross-team assignment
  - no dumped leads in active assignment screens
  - no soft-deleted leads anywhere in TL assignment workflow

Panel Tabs:
  1. Leads Assigned To Me
     - DB source: Lead where admin = current admin, assignedTo = current TL, isDeleted != true, isDumped != true
     - Use case: review, reassign, track workload, and view current team pipeline

  2. Leads I Assigned To Executives
     - DB source: Lead where admin = current admin, assignedBy = current TL, isDeleted != true, isDumped != true
     - Use case: audit trail, accountability, and manager reporting

  3. Unassigned Team Pool
     - DB source: Lead where admin = current admin, assignedTo = null, isDeleted != true, isDumped != true
     - Use case: select leads for distribution to own executives

  4. Assignment History
     - DB source: LeadAssignmentHistory filtered by admin and team
     - Shows assignedTo, assignedBy, team, reason, assignedAt, releasedAt

Assignment Rules:
  - TL can assign only to approved, active SALES_EXECUTIVE users in the same team
  - TL cannot assign to another TL, Sales Manager, or different team
  - TL cannot assign dumped or deleted leads
  - Lead limits must respect user leadDataLimit, admin leadLimits, or DataLimitOverride
  - If a lead is already assigned to the same executive in the same team, skip it
  - If the backend persists zero leads, return an error instead of success

DB Write Rules on Successful TL Assignment:
  - Update Lead.assignedTo = target executive
  - Update Lead.assignedBy = current TL
  - Update Lead.team = current team
  - Insert one LeadAssignmentHistory row per lead
  - Insert one AuditLog row per lead
  - Insert Notification row for the target executive
  - Never hard-delete or duplicate lead records

Frontend Behavior:
  - Distribution modal defaults Assign Leads = 0 and Target = 0
  - TL manually enters distribution counts per executive
  - After success, refresh assigned leads, unassigned leads, and assignment targets from backend
  - Assigned table must use DB-backed assigned-leads endpoint, not local derivation
  - Unassigned table must immediately exclude assigned leads after refresh
  - Any 409 or assignment error must display the backend message verbatim

Required APIs:
  - GET /api/sales-manager/leads/assignment-targets?role=SALES_EXECUTIVE
  - GET /api/sales-manager/leads/assigned
  - POST /api/sales-manager/leads/:leadId/assign
  - POST /api/sales-manager/leads/bulk/transfer
  - POST /api/sales-manager/leads/bulk/distribute

Recommended Table Columns:
  - Assigned To table: name, mobile, email, companyName, status, assignedTo, assignedBy, team, assignedAt, assignmentReason
  - Unassigned table: name, mobile, email, companyName, status, createdAt
  - History table: lead, assignedTo, assignedBy, team, reason, assignedAt, releasedAt

Operational Guarantees:
  - No fake success messages
  - No leakage across teams
  - No stale assigned rows after refresh
  - No dumped leads in active assignment workflows
  - Every assignment must be reconstructible from DB history
```

## SALES EXECUTIVE Features
```
Access Scope: OWN ASSIGNED leads only

Lead Management:
  - View own assigned leads
  - Filter: Talk / Not Talk / Untouched / Interested
  - Add talk timing in minutes (talkDuration)
  - Set reminder / view reminders
  - View all comments on own leads

Communication:
  - Click to connect on WhatsApp (opens wa.me/{mobile})
  - Click to connect on voice call (tel:{mobile})

Lead Status Updates:
  - Update status (TALK/NOT_TALK/INTERESTED/CONVERTED/DUMP)
  - Update comment (stored in LeadActivity)
  - Move to Dump after 3 NOT_TALK marks (auto-trigger)

Prospect Form:
  - Fill prospect form for interested leads
  - View own prospect forms
  - Update prospect forms

Payment Alerts:
  - Own deal alerts only
  - Real-time FAILED/SUCCESS notifications

Login Logs:
  - View SELF ONLY
  - Fields: Username/Email, Date/Time, Lat/Long, IP, Role

HRM (Self):
  - Apply Leave, Leave Status, Total Leaves, Working Days
  - Clock In / Clock Out

Support Tickets:
  - Raise ticket for: Client Data / Sales TL / Sales Manager

Daily Report (date-wise):
  - Total Calls, Today Calls, Today Prospect
  - Today Sell, Today Dump, Total Untouched, Complete list
```

## FINANCE MANAGER Features
```
Deal Finalization (from ProspectForm):
  - View suggested services from Sales Executive
  - Edit final services, prices, quantities
  - Apply discount
  - Set final amount

Payment Control:
  - Verify payments in system
  - Handle failed payments
  - View payment history per project/client

Work Order Control:
  - Generate work order (PDF)
  - Verify work order data
  - Send work order to client email (Brevo)
  - Mark work order as approved

Invoice Management:
  - Auto-generate invoice on payment success
  - Create manual invoice with custom GST
  - Download PDF invoice
  - Send invoice to client email (Brevo)

Finance Dashboard:
  - Total Revenue, Today Revenue
  - Pending Payments, Failed Payments

Expense Management:
  - Add/Edit/Delete expenses (with category)
  - View all expenses
  - Reports: Daily/Monthly/Category-wise
  - Metrics: Total Revenue, Total Expense, Net Profit

Login Logs: Self only

HRM (Self):
  - Apply Leave, Leave Status, Working Days, Clock In/Out

Notification Control:
  - Receive notification when work order is signed
  - Receive notification when work order is signed

Global Payment Page (Razorpay):
  - Monitors incoming payments from public payment page
```

## MANAGEMENT MANAGER Features
```
Access Scope: ALL Management dept data under this admin

Login Logs:
  - View: Self + Management TL + Management Employee

Project Control:
  - View/Edit ALL projects
  - Add Google Drive link
  - Set project start date
  - Set project priority (LOW/MEDIUM/HIGH/URGENT)
  - Assign deadlines
  - Assign Team Leader
  - Update project status
  - Add handover link (MANDATORY before delivery)
  - Confirm delivery

Monitor Projects:
  - View all project reports/updates
  - Reassign Team Leader
  - Reassign Employee

Team Management:
  - Assign Team Leaders
  - Assign Employees
  - Change team structure
  - Monitor team performance

HRM (Self):
  - Apply Leave, Leave Status, Working Days, Clock In/Out

Pro-Level (Optional):
  - Client update automation
  - Delay prediction system
```

## MANAGEMENT TEAM LEADER Features
```
Access Scope: OWN TEAM employees only

Project Management:
  - View projects assigned to own team
  - Assign projects to employees
  - Reassign projects between employees

Team Handling:
  - Manage own team members
  - Daily coordination via comments on ProjectUpdate
  - Track team activity

Progress Tracking:
  - Monitor work progress per employee
  - Track task completion status
  - Track: Completed vs Pending, Delays, Quality issues

Reporting to Manager:
  - Daily progress reports
  - Weekly updates
  - Report: Total/Completed/Pending projects

Project Updates:
  - Update project progress in system (ProjectUpdate)

Issue Handling:
  - Resolve team-level issues (Support Ticket)
  - Escalate major issues to Manager

HRM (Self):
  - Apply Leave, Leave Status, Working Days, Clock In/Out

Pro-Level (Optional):
  - Missed deadline alerts
  - Automated reminders
```

## MANAGEMENT EMPLOYEE Features
```
Access Scope: OWN ASSIGNED projects only

Project Execution:
  - View own assigned projects
  - Update project status: Not Started / In Progress
  - Add comments (client-visible via ProjectUpdate.isClientVisible)
  - Add work notes (internal only)

Reminder & Deadline:
  - View project deadlines
  - Set personal reminders

Self Performance:
  - View own performance metrics

HRM (Self):
  - Apply Leave, Leave Status, Working Days, Clock In/Out
```

---

# PART 7 — DATA FLOW BETWEEN DEPARTMENTS

## Flow: Lead → Project → Payment → Delivery
```
SALES:
1. Sales Manager uploads leads (CSV/Excel) → Client + Lead records created
2. Sales Manager distributes leads to Sales TL → Lead.assignedTo + LeadAssignmentHistory
3. Sales TL opens Assigned Leads panel:
  - fetches leads assigned to self from DB
  - fetches own team executives from DB
  - assigns selected leads to own executives
  - writes Lead.assignedTo, Lead.assignedBy, Lead.team, LeadAssignmentHistory, AuditLog, Notification
  - refreshes assigned/unassigned tables from backend after success
4. Sales TL can reassign or redistribute within own team only
5. Sales Executive contacts client:
   - Updates status: TALK/NOT_TALK/INTERESTED
   - Logs in LeadActivity (status + comment + duration)
   - notTalkCount >= 3 → auto-dump (isDumped: true)
6. Client interested → Executive fills ProspectForm
   (requirement, budget, suggestedServices from Service catalog)
7. ProspectForm.status = SENT_TO_FINANCE

FINANCE:
7. Finance Manager views ProspectForm
8. Edits finalServices, applies discount → finalAmount
9. Generates WorkOrder (PDF) → sends to client email
10. Client signs WorkOrder → isSigned: true
    Firebase notification sent to Sales Manager + Finance Manager
11. Finance Manager approves WorkOrder → isApproved: true
12. Creates Project record (soldBy = Sales Executive who handled)
13. Client pays via Global Payment Page (Razorpay):
    - Full or partial payment
    - Signature verified → Payment.status = SUCCESS
    - Project.paidAmount += amount (atomic $inc)
    - Invoice auto-generated (atomic InvoiceCounter)
    - Email confirmation via Brevo
14. Finance Manager marks payment verified

MANAGEMENT:
15. Management Manager views new project
16. Sets priority, deadline, driveLink
17. Assigns to Management TL → Team
18. Management TL assigns to Management Employee
19. Management Employee updates status:
    → ProjectUpdate record created (with isClientVisible)
20. Management TL monitors progress, sends daily reports to Manager
21. Project completed → Manager adds handoverLink (MANDATORY)
22. isDelivered: true → deliveryConfirmed: true
23. ProjectTrackingToken sent to client for tracking page
```

---

# PART 8 — CRITICAL CODING RULES (NEVER VIOLATE)

## RULE 1 — Multi-tenancy: Every query MUST include admin filter
```js
// ✅ CORRECT
await Lead.find({ admin: req.admin._id, assignedTo: userId })

// ❌ WRONG — returns ALL tenants data
await Lead.find({ assignedTo: userId })
```

## RULE 2 — Soft Delete: Never hard-delete
```js
// ✅ CORRECT
await doc.softDelete(userId)
await Model.findActive({ admin: adminId }) // excludes isDeleted:true

// ❌ WRONG
await Model.deleteOne({ _id: id })
await Model.findByIdAndDelete(id)
```

## RULE 3 — Lead Dump: Never delete leads
```js
// ✅ CORRECT — move to dump
await Lead.findByIdAndUpdate(leadId, {
  isDumped: true, status: 'DUMP',
  dumpReason: reason, dumpedAt: new Date(), dumpedBy: userId
})
// Auto-dump: notTalkCount >= 3 → service layer triggers dump

// ❌ WRONG
await Lead.deleteOne({ _id: leadId })
```

## RULE 4 — SalesTarget: Only $inc for achieved fields
```js
// ✅ CORRECT — atomic, no race condition
await SalesTarget.findOneAndUpdate(
  { admin: adminId, user: userId },
  { $inc: { achievedCalls: 1 } }
)

// ❌ WRONG — race condition risk
target.achievedCalls = target.achievedCalls + 1
await target.save()
```

## RULE 5 — Payment: Prevent overpayment atomically
```js
// ✅ CORRECT
const result = await Project.findOneAndUpdate(
  { _id: projectId, admin: adminId,
    $expr: { $lt: ['$paidAmount', '$totalAmount'] }
  },
  { $inc: { paidAmount: paymentAmount } },
  { new: true }
)
if (!result) throw new Error('Overpayment not allowed')

// ❌ WRONG
project.paidAmount += amount
await project.save()
```

## RULE 6 — Invoice Number: Always atomic via InvoiceCounter
```js
// ✅ CORRECT
const counter = await InvoiceCounter.findOneAndUpdate(
  { admin: adminId },
  { $inc: { seq: 1 } },
  { upsert: true, new: true }
)
const invoiceNumber = `${counter.prefix}-${String(counter.seq).padStart(6, '0')}`
// → INV-000001, INV-000002 ...

// ❌ WRONG
const last = await Invoice.findOne({ admin: adminId }).sort({ createdAt: -1 })
const num = last.seq + 1  // duplicate risk under concurrent requests
```

## RULE 7 — Token: Check blacklist BEFORE JWT validation
```js
// Auth middleware order (ALWAYS follow this):
// 1. Extract token from Authorization: Bearer <token>
// 2. Check TokenBlacklist.findOne({ token }) → 401 if found
// 3. jwt.verify(token, secret)
// 4. Check Admin/User.isActive → 401 if false
// 5. Attach to req.user or req.admin

// On logout:
await TokenBlacklist.create({
  token: accessToken, holderType: 'USER',
  holderId: userId, reason: 'LOGOUT', expiresAt: tokenExpiry
})
await RefreshToken.findOneAndUpdate(
  { token: refreshToken },
  { isRevoked: true, revokedAt: new Date(), revokedReason: 'LOGOUT' }
)
```

## RULE 8 — Client Mobile: Unique per admin only
```js
// ✅ Two admins CAN have same client mobile — correct behavior
// Index: { admin: 1, mobile: 1 } UNIQUE

const exists = await Client.findOne({ admin: adminId, mobile })
if (exists) throw new Error('Client already exists in your account')

// ❌ WRONG — checking globally
const exists = await Client.findOne({ mobile })
```

## RULE 9 — Attendance Date: Always normalize
```js
// Pre-save hook does this automatically. But also in service:
const date = new Date(inputDate)
date.setHours(0, 0, 0, 0)
// Use normalized date for all attendance queries
```

## RULE 10 — Brute Force: Check before auth
```js
// Before every login attempt:
const attempt = await LoginAttempt.findOne({
  identifier: email, identifierType: 'EMAIL'
})
if (attempt?.isBlocked && attempt.blockedUntil > new Date()) {
  throw new Error(`Blocked until ${attempt.blockedUntil}`)
}

// On failed login:
await LoginAttempt.findOneAndUpdate(
  { identifier: email, identifierType: 'EMAIL' },
  { $inc: { attempts: 1 }, lastAttemptAt: new Date() },
  { upsert: true }
)
// Block after 5 attempts for 30 minutes:
if (updatedAttempt.attempts >= 5) {
  await LoginAttempt.findOneAndUpdate(
    { identifier: email },
    { isBlocked: true, blockedUntil: new Date(Date.now() + 30*60*1000) }
  )
}
// On successful login: clear attempt record
await LoginAttempt.deleteOne({ identifier: email })
```

## RULE 11 — Default Password Generation
```js
// Default password for new users created by Admin:
const defaultPassword = `${email}@${phone.slice(-5)}`
// Example: john@company.com + 9876543210 → john@company.com@43210
// Store bcrypt hash. Also store in tempPassword field (clear after first login).
```

## RULE 12 — Audit Every Important Action
```js
// Always create audit log for important changes:
await AuditLog.create({
  admin: adminId,
  performedBy: userId,
  performerType: 'USER',
  action: 'LEAD_RESTORED',
  targetModel: 'Lead',
  targetId: lead._id,
  before: { isDumped: true, status: 'DUMP' },
  after: { isDumped: false, status: 'UNTOUCHED' },
  ipAddress: req.ip,
  note: 'Restored by Sales Manager'
})
```

---

# PART 9 — PAYMENT FLOW (RAZORPAY)

## Global Payment Page Flow (Step by Step)
```
1. Client opens: /pay (public page, no login needed)

2. Client enters: Full Name (optional), Email (required), Mobile (required)

3. System checks:
   a. Existing Client? → find by { admin, mobile }
      → If found: auto-fetch name, email
      → If not: create new Client record
   b. Existing Project? → find by { admin, client }
      → If found: show project details + remaining amount
      → If not found: show manual entry (Service Name + Amount)

4. Client selects: Full Payment OR Partial Payment (enter amount)

5. Server creates Razorpay Order:
   POST to Razorpay API → get order_id
   Create Payment record: { status: PENDING, razorpayOrderId }

6. Frontend opens Razorpay Checkout:
   Pre-filled: name, email, mobile
   Methods: UPI / Cards / Net Banking / Wallets
   CTA: "Pay Now"

7. On Razorpay success (frontend):
   Returns: razorpayOrderId, razorpayPaymentId, razorpaySignature

8. Frontend sends to server for verification:
   POST /api/payment/verify

9. Server verifies Razorpay signature (MANDATORY):
   const body = `${razorpayOrderId}|${razorpayPaymentId}`
   const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
     .update(body).digest('hex')
   if (expected !== razorpaySignature) → REJECT (do not store success)

10. On verified success:
    a. Update Payment: status=SUCCESS, signatureVerified=true, paidAt=now
    b. Atomic update Project.paidAmount (with overpayment check)
    c. Generate Invoice (atomic InvoiceCounter)
    d. Send email via Brevo: invoice + payment confirmation
    e. Send Firebase notification to Sales Manager + Finance Manager
    f. Send payment alert to Sales Executive (who sold this project)

11. Razorpay Webhook (backup validation):
    POST /api/webhook/razorpay
    → Log to WebhookLog
    → Verify webhook signature
    → Update Payment.webhookVerified = true
    → Log WebhookLog.isProcessed = true

12. Success screen shown to client:
    Payment Successful, Transaction ID, Amount, Date/Time

13. Failure screen:
    Payment Failed, Retry Button
```

## Razorpay Signature Verification (NON-NEGOTIABLE)
```js
const crypto = require('crypto')
const body = `${razorpayOrderId}|${razorpayPaymentId}`
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(body)
  .digest('hex')

if (expectedSignature !== razorpaySignature) {
  // Log failed attempt, DO NOT update payment to SUCCESS
  throw new Error('Invalid payment signature')
}
// Only AFTER this verification: update status to SUCCESS
```

---

# PART 10 — CLIENT PROJECT TRACKING PAGE (PUBLIC)

## Purpose
Client tracks project without login. Gets unique URL: `/track/{token}`

## How Token is Created
```
1. Finance/Management Manager generates tracking link
2. System creates ProjectTrackingToken { admin, project, client, token: uuid() }
3. Token URL sent to client via email (Brevo)
4. Client opens URL → no login required → sees project dashboard
```

## What Client Sees
```
Project Overview:
  - Project Name, Client Name, Mobile, Start Date, Expected Delivery
  - Live Status Badge: In Progress / Work Started / Completed / Delayed

Payment Details:
  - Total Project Cost, Amount Paid, Remaining Amount
  - Payment Type: Full / Partial
  - Status: Paid / Partially Paid / Pending
  - View Payment History (date-wise list of all payments)

Work Order Status:
  - Work Order Generated: Yes/No
  - Work Order Signed: Yes/No + Signed Date
  - Actions: View Work Order PDF / Sign Work Order (if pending)

Project Progress:
  - Progress Bar: 0% → 100%
  - Milestones Timeline:
    Project Started → Work in Progress → Review → Finalization → Delivery
  - Each update shows: Date/Time, Status, Description, Attachment
  - Only shows ProjectUpdate where isClientVisible = true

Final Delivery:
  - Delivery Status: Pending / Delivered
  - Delivery Date
  - Handover Link (if delivered)

Pro Enhancements (Optional):
  - Live progress percentage auto-update
  - AI-based estimated completion
```

---

# PART 11 — LIMIT CALCULATION LOGIC

## User Limit
```js
// Step 1: Check for Super Admin override
const override = await UserLimitOverride.findOne({
  admin: adminId, isActive: true,
  $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
})
// Step 2: Effective limit
const effectiveUserLimit = override?.userLimit ?? admin.userLimit // default 40

// Step 3: Before creating a new user
const currentCount = await User.countActive({ admin: adminId })
if (currentCount >= effectiveUserLimit) {
  throw new Error('User limit reached. Contact Super Admin to increase.')
}
```

## Lead Data Limit Per User
```js
// Priority: individual override > Super Admin data override > Admin default

const [user, admin, dataOverride] = await Promise.all([
  User.findById(userId),
  Admin.findById(adminId),
  DataLimitOverride.findOne({ admin: adminId })
])

const individualOverride = user.leadDataLimit
const superAdminOverride = dataOverride?.leadLimits?.[user.role]
const adminDefault = admin.leadLimits[user.role]

// Priority chain
const effectiveLimit = individualOverride ?? superAdminOverride ?? adminDefault

// Before assigning lead to executive
const currentLeads = await Lead.countDocuments({
  admin: adminId, assignedTo: userId,
  isDumped: false, isDeleted: false
})
if (currentLeads >= effectiveLimit) {
  throw new Error(`Lead limit of ${effectiveLimit} reached for this user`)
}
```

---

# PART 12 — LOGIN LOG VISIBILITY (ENFORCE AT API LAYER)

| Role | Can See Logs Of |
|------|----------------|
| Super Admin | SuperAdminLoginLog (own) + AdminLoginLog (all admins) |
| Admin | ALL UserLoginLog where admin = admin._id |
| Sales Manager | Self + Sales TL + Sales Executive |
| Sales TL | Self + Sales Executive (own team only) |
| Sales Executive | Self only |
| Finance Manager | Self only |
| Management Manager | Self + Management TL + Management Employee |
| Management TL | Self + Management Employee (own team only) |
| Management Employee | Self only |

---

# PART 13 — JWT HARDENING COMPLETE FLOW

## Token Configuration
```
Access Token:  expiry = 1-2 hours
Refresh Token: expiry = 7 days (stored in RefreshToken collection)
```

## Login
```js
// 1. Verify credentials
// 2. Clear old revoked/expired RefreshTokens for this user (cleanup)
// 3. Create new RefreshToken record in DB
// 4. Sign JWT: { id, role, admin, type: 'access' }
// 5. Return: { accessToken, refreshToken, expiresIn }
// 6. Update User.fcmToken if provided in request
```

## Token Refresh
```js
// 1. Client sends refreshToken
// 2. Find in RefreshToken collection: { token, isRevoked: false }
// 3. Check expiresAt > now
// 4. Verify holderType matches
// 5. Issue new accessToken (optionally rotate refreshToken)
// 6. Return: { accessToken, expiresIn }
```

## Logout
```js
// 1. Set RefreshToken.isRevoked = true, revokedReason = 'LOGOUT'
// 2. Add access token to TokenBlacklist (until its expiry)
// 3. Optionally clear User.fcmToken (stops push notifications)
```

## Force Logout (Admin deactivates User mid-session)
```js
// 1. Set User.isActive = false
// 2. Revoke ALL active RefreshTokens for that user
// 3. Add all their current access tokens to TokenBlacklist
// 4. Next request with old token → blacklist check → 401
```

## Password Change
```js
// 1. Validate old password
// 2. Hash new password
// 3. Update User.password
// 4. Add new hash to User.passwordHistory
// 5. Revoke ALL RefreshTokens for this user
// 6. Blacklist current access token
// 7. Set mustChangePassword = false (if first login)
// 8. Force re-login
```

---

# PART 14 — ON ADMIN REGISTRATION (AUTO-CREATE)

```js
// After Admin is successfully created:

// 1. Create 3 default departments
await Department.insertMany([
  { admin: adminId, name: 'SALES',      displayName: 'Sales Department',      isDefault: true },
  { admin: adminId, name: 'FINANCE',    displayName: 'Finance Department',     isDefault: true },
  { admin: adminId, name: 'MANAGEMENT', displayName: 'Management Department',  isDefault: true },
])

// 2. Create InvoiceCounter
await InvoiceCounter.create({ admin: adminId, seq: 0, prefix: 'INV' })

// 3. Send welcome email via Brevo
// 4. Log to AdminLoginLog on first login
```

---

# PART 15 — DUMP DATA SYSTEM

## What is Dump Data?
Leads that are no longer useful for the active sales pipeline.
Stored separately. Can be restored for future re-targeting.

## Rules
```
Rule 1 — No Direct Delete:
  Lead permanently delete mat karo.
  Always move to dump (isDumped: true, status: DUMP).

Rule 2 — No Auto Restore:
  Only Manager or Admin can manually restore dump leads.

Rule 3 — Auto Dump Trigger:
  If notTalkCount >= 3 → automatically set isDumped: true.
  Service layer enforces this on every NOT_TALK status update.
```

## Dump Flow
```js
// On NOT_TALK update:
await Lead.findByIdAndUpdate(leadId, {
  $inc: { notTalkCount: 1 }
})
const lead = await Lead.findById(leadId)
if (lead.notTalkCount >= 3) {
  await Lead.findByIdAndUpdate(leadId, {
    isDumped: true, status: 'DUMP',
    dumpReason: 'Auto-dumped after 3 Not Talk marks',
    dumpedAt: new Date(), dumpedBy: userId
  })
  await AuditLog.create({ action: 'LEAD_DUMPED', ... })
}
```

## Restore Flow
```js
// Only Sales Manager or Admin can restore:
await Lead.findByIdAndUpdate(leadId, {
  isDumped: false, status: 'UNTOUCHED',
  restoredAt: new Date(), restoredBy: userId,
  notTalkCount: 0 // reset counter
})
await AuditLog.create({ action: 'LEAD_RESTORED', ... })
```

## Recycle Campaign (Future Feature)
Manager can bulk-activate dump leads for a new sales campaign.

---

# PART 16 — HRM SYSTEM

## Attendance Flow
```
Clock In:
  POST /api/attendance/clock-in
  → Create Attendance record (or find existing for today)
  → Set clockIn = now, latitude, longitude, ipAddress
  → Date normalized to 00:00:00 by pre-save hook
  → AuditLog: ATTENDANCE_CLOCK_IN

Clock Out:
  POST /api/attendance/clock-out
  → Find today's Attendance record
  → Set clockOut = now
  → Calculate: hoursWorked = (clockOut - clockIn - breakMinutes) in hours
  → Calculate: overtimeMinutes if hoursWorked > 8 hours
  → AuditLog: ATTENDANCE_CLOCK_OUT

Break:
  POST /api/attendance/break-start → push to breaks[] (startedAt)
  POST /api/attendance/break-end → update last break (endedAt), calc breakMinutes
```

## Leave Flow
```
Apply:
  POST /api/leave/apply
  → Create Leave record (status: PENDING)
  → AuditLog: LEAVE_APPLIED
  → Notify Admin/TL via Firebase

Approve (Admin or TL for direct reports):
  PUT /api/leave/:id/approve
  → Set Leave.status = APPROVED, approvedBy, approvedAt
  → Update LeaveBalance: $inc { casual.used: days, casual.remaining: -days }
  → AuditLog: LEAVE_APPROVED
  → Notify User via Firebase

Reject:
  PUT /api/leave/:id/reject
  → Set status = REJECTED, rejectionNote
  → AuditLog: LEAVE_REJECTED
  → Notify User

Cancel (User cancels own pending leave):
  PUT /api/leave/:id/cancel
  → Set status = CANCELLED, cancelledAt
  → If was APPROVED: restore LeaveBalance
```

---

# PART 17 — ALL UNIQUE INDEXES SUMMARY

```js
// User — email unique PER admin (tenant), NOT globally
{ admin: 1, email: 1 }  UNIQUE

// Client — mobile unique PER admin, NOT globally
{ admin: 1, mobile: 1 }  UNIQUE

// Department — name unique per admin
{ admin: 1, name: 1 }  UNIQUE

// Attendance — one per user per day per admin
{ admin: 1, user: 1, date: 1 }  UNIQUE

// Invoice — number unique per admin
{ admin: 1, invoiceNumber: 1 }  UNIQUE

// InvoiceCounter — one per admin
{ admin: 1 }  UNIQUE  (on InvoiceCounter model)

// LeaveBalance — one per user per year
{ admin: 1, user: 1, year: 1 }  UNIQUE

// DailyReport — one per user per day
{ admin: 1, user: 1, date: 1 }  UNIQUE

// LoginAttempt — one per identifier
{ identifier: 1, identifierType: 1 }  UNIQUE

// UserLimitOverride — one per admin
{ admin: 1 }  UNIQUE

// DataLimitOverride — one per admin
{ admin: 1 }  UNIQUE

// EmailVerification — one per email
{ email: 1 }  UNIQUE
```

## TTL Auto-Delete Indexes
```js
TokenBlacklist.expiresAt     expireAfterSeconds: 0
RefreshToken.expiresAt       expireAfterSeconds: 0
PasswordReset.expiresAt      expireAfterSeconds: 0
LoginAttempt.lastAttemptAt   expireAfterSeconds: 86400 (24hr)
EmailVerification.createdAt  expireAfterSeconds: 600 (10min)
```

---

# PART 18 — API INTEGRATIONS

## Razorpay
```
Purpose: Payment processing
Used for: Order creation (server-side), Checkout (frontend),
          Signature verification, Webhooks, Refunds
Keys: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (in ApiConfig)
Webhook endpoint: POST /api/webhook/razorpay
Security: Always verify signature before trusting payment success
```

## Brevo (Email)
```
Purpose: Transactional emails
Sends:
  - Welcome email (Admin registration)
  - Email OTP (Admin signup verification)
  - Password reset OTP
  - Invoice PDF email (to client)
  - Work Order email (to client)
  - Payment confirmation email (to client)
  - Project tracking link email (to client)
Key: BREVO_API_KEY (in ApiConfig)
```

## Firebase FCM (Push Notifications)
```
Purpose: Mobile push notifications
Token: Stored in User.fcmToken (updated on each login)
Sends notifications for:
  - Payment success/failure (to Finance Manager + Sales Manager + Executive)
  - Lead assigned (to Sales Executive)
  - Reminder due (to respective user)
  - Work order signed (to Finance Manager)
  - Ticket updated (to assignee)
  - Announcement sent (to target users)
  - Leave status changed (to applicant)
  - Target alert (to sales team)
Key: FIREBASE_SERVER_KEY (in ApiConfig)
```

---

# PART 19 — SOFT DELETE PLUGIN USAGE

## Models WITH softDelete plugin (use .softDelete() not .deleteOne()):
```
Admin, Department, Service, Team, User, Client, Project, Expense
```

## Methods Available on These Models:
```js
// Instance methods:
await doc.softDelete(userId)    // marks isDeleted:true, sets deletedAt, deletedBy
await doc.restore()              // reverses soft delete

// Static methods:
await Model.findActive(filter)      // excludes isDeleted:true
await Model.findOneActive(filter)   // excludes isDeleted:true
await Model.countActive(filter)     // excludes isDeleted:true
```

## Fields Added by Plugin:
```js
isDeleted: Boolean  // default: false
deletedAt: Date     // default: null
deletedBy: ObjectId // default: null (ref: User)
```

---

# PART 20 — DAILY REPORT GENERATION

```js
// Generate/refresh snapshot for a user on a specific date:
async function generateDailyReport(adminId, userId, targetDate) {
  const date = new Date(targetDate)
  date.setHours(0, 0, 0, 0)

  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)

  const [activities, allLeads] = await Promise.all([
    LeadActivity.find({
      admin: adminId, user: userId,
      createdAt: { $gte: date, $lt: nextDay }
    }),
    Lead.find({ admin: adminId, assignedTo: userId, isDeleted: false })
  ])

  const snapshot = {
    todayCalls:     activities.filter(a => ['TALK','NOT_TALK'].includes(a.status)).length,
    todayProspect:  activities.filter(a => a.status === 'INTERESTED').length,
    todaySell:      activities.filter(a => a.status === 'CONVERTED').length,
    todayDump:      activities.filter(a => a.status === 'DUMP').length,
    totalLeads:     allLeads.length,
    totalUntouched: allLeads.filter(l => l.status === 'UNTOUCHED').length,
    talkRatio:      allLeads.length > 0
                    ? (allLeads.filter(l=>l.talkCount>0).length / allLeads.length * 100)
                    : 0,
    generatedAt: new Date()
  }

  return await DailyReport.findOneAndUpdate(
    { admin: adminId, user: userId, date },
    { $set: snapshot },
    { upsert: true, new: true }
  )
}
```

---

# PART 21 — ENUMS REFERENCE

```js
ROLES: ['SUPER_ADMIN','ADMIN','SALES_MANAGER','SALES_TL','SALES_EXECUTIVE',
        'FINANCE_MANAGER','MANAGEMENT_MANAGER','MANAGEMENT_TL','MANAGEMENT_EMPLOYEE']

LEAD_STATUS:   ['UNTOUCHED','TALK','NOT_TALK','INTERESTED','CONVERTED','DUMP']

PROJ_STATUS:   ['NOT_STARTED','WORK_STARTED','IN_PROGRESS','REVIEW',
                'FINALIZATION','COMPLETED','DELIVERED','DELAYED']

PROJ_PRIORITY: ['LOW','MEDIUM','HIGH','URGENT']

PAY_STATUS:    ['PENDING','SUCCESS','FAILED','REFUNDED']

TICKET_STATUS: ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','ESCALATED']

LEAVE_STATUS:  ['PENDING','APPROVED','REJECTED','CANCELLED']

LEAVE_TYPE:    ['CASUAL','SICK','EARNED','HALF_DAY','UNPAID']

INVOICE_STATUS:['DRAFT','SENT','PAID','OVERDUE','CANCELLED']

PLAN_STATUS:   ['TRIAL','ACTIVE','EXPIRED','SUSPENDED']

TARGET_PERIOD: ['DAILY','WEEKLY','MONTHLY']

HOLDER_TYPE:   ['SUPER_ADMIN','ADMIN','USER']

NOTIF_TYPE:    ['PAYMENT_SUCCESS','PAYMENT_FAILED','WORK_ORDER_SIGNED',
                'TICKET_UPDATED','LEAD_ASSIGNED','REMINDER_DUE',
                'ANNOUNCEMENT','TARGET_ALERT','LEAVE_STATUS','GENERAL']

PROSPECT_STATUS:['OPEN','IN_NEGOTIATION','SENT_TO_FINANCE','WON','LOST']

CLIENT_SOURCE: ['CSV_UPLOAD','EXCEL','MANUAL','PROSPECT_FORM','PAYMENT_PAGE']

APPROVAL_ST:   ['PENDING','APPROVED','REJECTED']
```

---

# PART 22 — PERFORMANCE METRICS FORMULAS

```
Conversion Rate = (Clients converted × 100) / Total leads connected
Talk Ratio      = (Leads talked × 100) / Total assigned leads
Dump %          = (Dumped leads × 100) / Total assigned leads
Follow-up Miss% = (Missed follow-ups × 100) / Total follow-ups set
Net Profit      = Total Revenue (sum of successful payments) - Total Expenses
```

---

# PART 23 — COMPLETE MODEL EXPORT REFERENCE

```js
// From the models file, these are exported:
SuperAdmin, SuperAdminLoginLog,
LoginAttempt, TokenBlacklist, RefreshToken, PasswordReset, EmailVerification,
SubscriptionPlan, UserLimitOverride, DataLimitOverride,
Admin, AdminLoginLog,
Department, Service, Team,
User, UserLoginLog,
AuditLog, InvoiceCounter, WebhookLog,
Client, Lead, LeadAssignmentHistory, LeadActivity,
BulkLeadUpload, BulkUserUpload,
ProspectForm, Reminder, SalesTarget, DailyReport,
Project, ProjectUpdate, ProjectTrackingToken,
Payment, WorkOrder, Invoice, Expense,
Attendance, LeaveBalance, Leave,
Ticket, SuperAdminTicket, Announcement, Notification,
ApiConfig
```

---

# END OF KNOWLEDGE BASE
# Total Models: 45
# This is the FINAL COMPLETE version.
# All business logic, flows, rules, and model details are covered above.
# You now have full context to implement any feature in this system.