// ============================================================
// GRAPHURA CRM — FINAL PRODUCTION MONGOOSE MODELS v3.0
// THIS IS THE FINAL VERSION — NO FURTHER CHANGES NEEDED
// Architecture: SuperAdmin → Admins (Tenants) → Departments → Users
// MongoDB + Mongoose v8 | Node.js 20+
// Total Models: 42
// ============================================================

'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────────────
// SOFT DELETE PLUGIN
// Applied to every model that needs safe deletion.
// NEVER hard-delete — always softDelete().
// ─────────────────────────────────────────────────────────────
function softDeletePlugin(schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  });

  schema.index({ isDeleted: 1 });

  // Instance method — call: await doc.softDelete(userId)
  schema.methods.softDelete = async function (userId) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId || null;
    return this.save();
  };

  // Restore soft-deleted doc
  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };

  // Static — always excludes deleted docs
  schema.statics.findActive = function (filter = {}, projection, options) {
    return this.find({ ...filter, isDeleted: false }, projection, options);
  };

  schema.statics.findOneActive = function (filter = {}, projection, options) {
    return this.findOne({ ...filter, isDeleted: false }, projection, options);
  };

  schema.statics.countActive = function (filter = {}) {
    return this.countDocuments({ ...filter, isDeleted: false });
  };
}

// ─────────────────────────────────────────────────────────────
// ENUMS — Single source of truth
// ─────────────────────────────────────────────────────────────
const ROLES = [
  'SUPER_ADMIN', 'ADMIN',
  'SALES_MANAGER', 'SALES_TL', 'SALES_EXECUTIVE',
  'FINANCE_MANAGER', 'FINANCE_EXECUTIVE',
  'MANAGEMENT_MANAGER', 'MANAGEMENT_TL', 'MANAGEMENT_EMPLOYEE',
];

const LEAD_STATUS = ['UNTOUCHED', 'TALK', 'NOT_TALK', 'INTERESTED', 'CONVERTED', 'DUMP'];
const PROJ_STATUS = ['NOT_STARTED', 'WORK_STARTED', 'IN_PROGRESS', 'REVIEW', 'FINALIZATION', 'COMPLETED', 'DELIVERED', 'DELAYED'];
const PROJ_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const PAY_STATUS = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];
const TICKET_STATUS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'];
const LEAVE_STATUS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const LEAVE_TYPE = ['CASUAL', 'SICK', 'EARNED', 'HALF_DAY', 'UNPAID'];
const APPROVAL_ST = ['PENDING', 'APPROVED', 'REJECTED'];
const INVOICE_STATUS = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];
const PLAN_STATUS = ['TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED'];
const TARGET_PERIOD = ['DAILY', 'WEEKLY', 'MONTHLY'];
const HOLDER_TYPE = ['SUPER_ADMIN', 'ADMIN', 'USER'];
const NOTIF_TYPE = [
  'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'WORK_ORDER_SIGNED',
  'TICKET_UPDATED', 'LEAD_ASSIGNED', 'REMINDER_DUE',
  'ANNOUNCEMENT', 'TARGET_ALERT', 'LEAVE_STATUS', 'GENERAL',
];
const AUDIT_ACTIONS = [
  'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_ACTIVATED', 'USER_DEACTIVATED',
  'BULK_USER_UPLOAD',
  'LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_REASSIGNED', 'LEAD_DUMPED', 'LEAD_RESTORED',
  'LEAD_STATUS_CHANGED', 'BULK_LEAD_UPLOAD',
  'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_STATUS_CHANGED', 'PROJECT_DELIVERED',
  'PAYMENT_CREATED', 'PAYMENT_VERIFIED', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED',
  'INVOICE_CREATED', 'INVOICE_SENT',
  'WORK_ORDER_GENERATED', 'WORK_ORDER_SIGNED', 'WORK_ORDER_APPROVED',
  'LEAVE_APPLIED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_CANCELLED',
  'TARGET_SET', 'TARGET_UPDATED',
  'ANNOUNCEMENT_SENT', 'TICKET_CREATED', 'TICKET_RESOLVED', 'TICKET_ESCALATED',
  'ADMIN_CREATED', 'ADMIN_UPDATED', 'ADMIN_DEACTIVATED',
  'LIMIT_CHANGED', 'PASSWORD_CHANGED', 'PROFILE_UPDATED',
  'ATTENDANCE_CLOCK_IN', 'ATTENDANCE_CLOCK_OUT',
  'PROSPECT_CREATED', 'PROSPECT_UPDATED',
  'TEAM_CREATED', 'TEAM_UPDATED', 'TEAM_MEMBER_ADDED', 'TEAM_MEMBER_REMOVED', 'TEAM_DELETED',
];
const RESET_PURPOSE = ['PASSWORD_RESET', 'EMAIL_VERIFY'];
const WEBHOOK_SOURCE = ['RAZORPAY'];
const BLOCK_REASON = ['TOO_MANY_ATTEMPTS', 'SUSPICIOUS_ACTIVITY', 'MANUAL'];

// ─────────────────────────────────────────────────────────────
// REUSABLE SUB-SCHEMAS
// ─────────────────────────────────────────────────────────────
const AddressSchema = new Schema({
  line1: { type: String, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  country: { type: String, default: 'India', trim: true },
}, { _id: false });

const BankDetailsSchema = new Schema({
  bankName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  ifscCode: { type: String, trim: true, uppercase: true },
  upiId: { type: String, trim: true },
  branch: { type: String, trim: true },
}, { _id: false });


// ════════════════════════════════════════════════════════════
// MODEL 1 — SUPER ADMIN
// Single document. Seeded in DB. NO registration route.
// Login only. Logs stored in SuperAdminLoginLog.
// ════════════════════════════════════════════════════════════
const SuperAdminSchema = new Schema({
  name: { type: String, default: 'Super Admin', trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },    // bcrypt hashed — seeded in DB
  isActive: { type: Boolean, default: true },
}, { timestamps: true });


// ════════════════════════════════════════════════════════════
// MODEL 2 — SUPER ADMIN LOGIN LOG
// Records every Super Admin login attempt.
// Stored separately — Super Admin sees only this.
// ════════════════════════════════════════════════════════════
const SuperAdminLoginLogSchema = new Schema({
  superAdmin: { type: Schema.Types.ObjectId, ref: 'SuperAdmin', required: true },
  email: String,
  ipAddress: String,
  latitude: Number,
  longitude: Number,
  userAgent: String,
  device: String,
  isSuccess: { type: Boolean, default: true },
  failReason: String,
  loginAt: { type: Date, default: Date.now },
});

SuperAdminLoginLogSchema.index({ superAdmin: 1, loginAt: -1 });


// ════════════════════════════════════════════════════════════
// MODEL 3 — LOGIN ATTEMPT (Brute Force Protection)
// Tracks failed login attempts per email/IP.
// Auto-blocks after threshold. TTL auto-clears records.
// ════════════════════════════════════════════════════════════
const LoginAttemptSchema = new Schema({
  identifier: { type: String, required: true },   // email or IP address
  identifierType: { type: String, enum: ['EMAIL', 'IP'], required: true },
  attempts: { type: Number, default: 1 },
  isBlocked: { type: Boolean, default: false },
  blockReason: { type: String, enum: BLOCK_REASON },
  blockedAt: Date,
  blockedUntil: Date,                               // block expires at this time
  lastAttemptAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
});

// Auto-delete record 24 hours after last attempt
LoginAttemptSchema.index({ lastAttemptAt: 1 }, { expireAfterSeconds: 86400 });
LoginAttemptSchema.index({ identifier: 1, identifierType: 1 }, { unique: true });
LoginAttemptSchema.index({ blockedUntil: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 4 — TOKEN BLACKLIST
// Immediate JWT revocation — no waiting for expiry.
// Used when: logout, deactivation, password change, forced logout.
// Auth middleware checks this BEFORE validating JWT.
// TTL auto-cleans after token naturally expires.
// ════════════════════════════════════════════════════════════
const TokenBlacklistSchema = new Schema({
  token: { type: String, required: true, unique: true },
  holderType: { type: String, enum: HOLDER_TYPE, required: true },
  holderId: { type: Schema.Types.ObjectId, required: true },
  reason: {
    type: String,
    enum: ['LOGOUT', 'DEACTIVATED', 'PASSWORD_CHANGED', 'FORCED_LOGOUT'],
    default: 'LOGOUT',
  },
  blacklistedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },    // same as JWT expiry
});

TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete
TokenBlacklistSchema.index({ holderId: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 5 — REFRESH TOKEN
// JWT Hardening. Works for SuperAdmin, Admin, User.
// Logout = isRevoked: true + add access token to TokenBlacklist.
// TTL auto-deletes expired tokens.
// ════════════════════════════════════════════════════════════
const RefreshTokenSchema = new Schema({
  holderId: { type: Schema.Types.ObjectId, required: true },
  holderType: { type: String, enum: HOLDER_TYPE, required: true },
  admin: { type: Schema.Types.ObjectId, ref: 'Admin' },  // null for SuperAdmin
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  ipAddress: String,
  userAgent: String,
  revokedAt: Date,
  revokedReason: {
    type: String,
    enum: ['LOGOUT', 'FORCED', 'PASSWORD_CHANGED', 'EXPIRED'],
  },
}, { timestamps: true });

RefreshTokenSchema.index({ holderId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


// ════════════════════════════════════════════════════════════
// MODEL 6 — PASSWORD RESET
// Handles forgot password flow. Tokens are hashed with bcrypt.
// ════════════════════════════════════════════════════════════
const PasswordResetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  token: { type: String, required: true }, // bcrypt hashed
  expiresAt: { type: Date, required: true }, // TTL index
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date, default: null },
  ipAddress: { type: String },
  userAgent: { type: String },
  attemptCount: { type: Number, default: 0 }
}, { timestamps: true });

PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete
PasswordResetSchema.index({ userId: 1, isUsed: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 6A — EMAIL VERIFICATION (Registration OTP)
// Used during Admin signup flow.
// OTP is short-lived and auto-deletes via TTL.
// ════════════════════════════════════════════════════════════
const EmailVerificationSchema = new Schema({
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

EmailVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });


// ════════════════════════════════════════════════════════════
// MODEL 7 — SUBSCRIPTION PLAN
// Created and managed by Super Admin only.
// Each Admin is assigned one plan.
// ════════════════════════════════════════════════════════════
const SubscriptionPlanSchema = new Schema({
  planName: { type: String, required: true, trim: true, unique: true },
  maxUsers: { type: Number, default: 40 },
  maxClients: { type: Number, default: 6000 },
  storageGB: { type: Number, default: 10 },
  priceINR: { type: Number, default: 0 },
  durationDays: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
  features: [{ type: String, trim: true }],
  description: String,
}, { timestamps: true });


// ════════════════════════════════════════════════════════════
// MODEL 8 — ADMIN (TENANT)
// Each Admin = one company = one tenant.
// Admin self-registers. ALL other data scoped to admin._id.
// company.website added as requested.
// ════════════════════════════════════════════════════════════
const AdminSchema = new Schema({
  // ── Identity ──
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, match: [/^\d{10}$/, 'Phone must be 10 digits'], trim: true },

  // ── Company Branding (Admin can edit) ──
  company: {
    name: { type: String, trim: true, default: '' },
    logo: { type: String, default: '' },            // URL to logo image
    email: { type: String, lowercase: true, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' }, // ← ADDED as requested
    address: { type: AddressSchema, default: () => ({}) },
  },

  // ── Bank Details (shown on invoices) ──
  bankDetails: { type: BankDetailsSchema, default: () => ({}) },

  // ── Limits (set by Super Admin — Admin cannot change these) ──
  userLimit: { type: Number, default: 40 },     // max users Admin can create
  clientLimit: { type: Number, default: 6000 },   // max total leads/clients

  // ── Role-wise Lead Data Limits (Admin CAN change these for their users) ──
  leadLimits: {
    SALES_EXECUTIVE: { type: Number, default: 250 },
    SALES_TL: { type: Number, default: 1500 },
    SALES_MANAGER: { type: Number, default: 6000 },
  },

  // ── Subscription ──
  plan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', default: null },
  planActivatedAt: { type: Date, default: null },
  planExpiresAt: { type: Date, default: null },
  planStatus: { type: String, enum: PLAN_STATUS, default: 'TRIAL' },

  // ── Status ──
  isActive: { type: Boolean, default: true },
  isProfileComplete: { type: Boolean, default: false },

  // ── Super Admin reference ──
  superAdmin: { type: Schema.Types.ObjectId, ref: 'SuperAdmin', default: null },
}, { timestamps: true });

AdminSchema.plugin(softDeletePlugin);
AdminSchema.index({ isActive: 1, isDeleted: 1 });
AdminSchema.index({ planStatus: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 9 — ADMIN LOGIN LOG
// Every Admin login attempt recorded here.
// Super Admin dashboard shows this.
// ════════════════════════════════════════════════════════════
const AdminLoginLogSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  email: String,
  role: { type: String, default: 'ADMIN' },
  ipAddress: String,
  latitude: Number,
  longitude: Number,
  userAgent: String,
  device: String,
  isSuccess: { type: Boolean, default: true },
  failReason: String,
  loginAt: { type: Date, default: Date.now },
});

AdminLoginLogSchema.index({ admin: 1, loginAt: -1 });


// ════════════════════════════════════════════════════════════
// MODEL 10 — USER LIMIT OVERRIDE
// Super Admin grants extra user capacity to a specific Admin
// without changing their subscription plan.
// ════════════════════════════════════════════════════════════
const UserLimitOverrideSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true, unique: true },
  userLimit: { type: Number, required: true },
  reason: String,
  grantedBy: { type: Schema.Types.ObjectId, ref: 'SuperAdmin' },
  grantedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },         // null = permanent
  isActive: { type: Boolean, default: true },
}, { timestamps: true });


// ════════════════════════════════════════════════════════════
// MODEL 11 — DATA LIMIT OVERRIDE
// Super Admin increases a specific Admin's lead/client data limits.
// ════════════════════════════════════════════════════════════
const DataLimitOverrideSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true, unique: true },
  clientLimit: { type: Number, default: null },
  leadLimits: {
    SALES_EXECUTIVE: { type: Number, default: null },
    SALES_TL: { type: Number, default: null },
    SALES_MANAGER: { type: Number, default: null },
  },
  reason: String,
  grantedBy: { type: Schema.Types.ObjectId, ref: 'SuperAdmin' },
  grantedAt: { type: Date, default: Date.now },
}, { timestamps: true });


// ════════════════════════════════════════════════════════════
// MODEL 12 — DEPARTMENT
// Proper model — not a hardcoded enum.
// Default 3 departments auto-created on Admin registration:
// SALES, FINANCE, MANAGEMENT
// Super Admin can define new global department types.
// Each Admin gets their own department documents.
// ════════════════════════════════════════════════════════════
const DepartmentSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  name: { type: String, required: true, trim: true, uppercase: true },
  displayName: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },   // true = SALES/FINANCE/MANAGEMENT
  isActive: { type: Boolean, default: true },
  manager: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

DepartmentSchema.plugin(softDeletePlugin);
DepartmentSchema.index({ admin: 1, name: 1 }, { unique: true });
DepartmentSchema.index({ admin: 1, isActive: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 13 — SERVICE CATALOG
// Services/products offered by Admin's company.
// Used in ProspectForm + Invoice line items.
// ════════════════════════════════════════════════════════════
const ServiceSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, default: 0, min: 0 },
  unit: { type: String, trim: true },   // "per month", "one-time", "per page"
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ServiceSchema.plugin(softDeletePlugin);
ServiceSchema.index({ admin: 1, isActive: 1, isDeleted: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 14 — USER (Department Members)
// Created ONLY by Admin — NO self-registration.
// Default password = email + '@' + last 5 digits of phone.
// Must change password on first login.
// ════════════════════════════════════════════════════════════
const UserSchema = new Schema({
  // ── Tenant Scope (CRITICAL — every query must include this) ──
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },

  // ── Identity ──
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, match: [/^\d{10}$/, 'Phone must be 10 digits'], trim: true },

  // ── Role ──
  role: { type: String, enum: ROLES, required: true },

  // ── Hierarchy ──
  manager: { type: Schema.Types.ObjectId, ref: 'User', default: null },

  // ── Profile (filled after first login) ──
  address: { type: AddressSchema, default: () => ({}) },
  bankDetails: { type: BankDetailsSchema, default: () => ({}) },
  profilePic: { type: String, default: '' },

  // ── Firebase Push Token ──
  fcmToken: { type: String, default: null },

  // ── Lead Data Limit ──
  // null = use admin.leadLimits[role] as default
  leadDataLimit: { type: Number, default: null },

  // ── Account Flags ──
  isActive: { type: Boolean, default: true },
  isProfileComplete: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: true },  // force on first login
  isFirstLogin: { type: Boolean, default: true },
  tempPassword: { type: String, default: null }, // Store raw auto-generated password
  approvalStatus: { type: String, enum: APPROVAL_ST, default: 'APPROVED' },

  // ── Tracking ──
  lastLoginAt: { type: Date, default: null },
  lastActiveAt: { type: Date, default: null },

  // ── Password Reset Tracking ──
  lastPasswordResetAt: { type: Date, default: null },
  passwordResetCount: { type: Number, default: 0 },
  passwordHistory: [{
    hash: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    _id: false,
  }],
}, { timestamps: true });

UserSchema.plugin(softDeletePlugin);
// email unique PER admin (tenant) — NOT globally
UserSchema.index({ admin: 1, email: 1 }, { unique: true });
UserSchema.index({ admin: 1, role: 1, isDeleted: 1 });
UserSchema.index({ admin: 1, department: 1, isDeleted: 1 });
UserSchema.index({ admin: 1, isActive: 1, isDeleted: 1 });
UserSchema.index({ manager: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 15 — USER LOGIN LOG
// Every User login attempt recorded here.
// Admin sees all users' logs (filtered by admin._id).
// Role-based visibility enforced at API/service layer.
// ════════════════════════════════════════════════════════════
const UserLoginLogSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: String,
  role: String,
  ipAddress: String,
  latitude: Number,
  longitude: Number,
  userAgent: String,
  device: String,
  isSuccess: { type: Boolean, default: true },
  failReason: String,
  loginAt: { type: Date, default: Date.now },
});

UserLoginLogSchema.index({ admin: 1, user: 1, loginAt: -1 });
UserLoginLogSchema.index({ admin: 1, role: 1, loginAt: -1 });


// ════════════════════════════════════════════════════════════
// MODEL 16 — AUDIT LOG
// Tracks every important system action.
// Who changed what + before/after snapshots.
// Scoped to admin (tenant). null for SuperAdmin actions.
// ════════════════════════════════════════════════════════════
const AuditLogSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  performedBy: { type: Schema.Types.ObjectId, required: true },
  performerType: { type: String, enum: HOLDER_TYPE, required: true },
  action: { type: String, enum: AUDIT_ACTIONS, required: true },
  targetModel: { type: String, required: true },   // 'Lead', 'User', 'Project'
  targetId: { type: Schema.Types.ObjectId, required: true },
  before: { type: Schema.Types.Mixed, default: null },
  after: { type: Schema.Types.Mixed, default: null },
  ipAddress: String,
  note: String,
}, { timestamps: true });

AuditLogSchema.index({ admin: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ admin: 1, targetModel: 1, targetId: 1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });


// ════════════════════════════════════════════════════════════
// MODEL 17 — INVOICE COUNTER
// Atomic sequence number per admin.
// Prevents duplicate invoice numbers under concurrent requests.
// USAGE:
//   const c = await InvoiceCounter.findOneAndUpdate(
//     { admin: adminId },
//     { $inc: { seq: 1 } },
//     { upsert: true, new: true }
//   );
//   invoiceNumber = `${c.prefix}-${String(c.seq).padStart(6,'0')}`;
//   → INV-000001, INV-000002 ...
// ════════════════════════════════════════════════════════════
const InvoiceCounterSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true, unique: true },
  seq: { type: Number, default: 0 },
  prefix: { type: String, default: 'INV', trim: true },
}, { timestamps: true });


// ════════════════════════════════════════════════════════════
// MODEL 18 — WEBHOOK LOG
// Raw log of every Razorpay webhook received.
// Enables replay detection, debugging, audit trail.
// ════════════════════════════════════════════════════════════
const WebhookLogSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  source: { type: String, enum: WEBHOOK_SOURCE, required: true },
  event: { type: String, required: true },   // 'payment.captured', 'payment.failed'
  payload: { type: Schema.Types.Mixed },        // raw webhook body
  signature: String,
  isVerified: { type: Boolean, default: false },
  isProcessed: { type: Boolean, default: false },
  processedAt: Date,
  error: String,
  razorpayPaymentId: String,
  razorpayOrderId: String,
}, { timestamps: true });

WebhookLogSchema.index({ source: 1, event: 1, createdAt: -1 });
WebhookLogSchema.index({ razorpayOrderId: 1 });
WebhookLogSchema.index({ isProcessed: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 19 — TEAM
// Sales: TL leads executives.
// Management: TL leads employees.
// Scoped to admin (tenant).
// ════════════════════════════════════════════════════════════
const TeamSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  name: { type: String, required: true, trim: true },
  leader: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    _id: false,
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

TeamSchema.plugin(softDeletePlugin);
TeamSchema.index({ admin: 1, department: 1, isDeleted: 1 });
TeamSchema.index({ admin: 1, leader: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 20 — CLIENT
// PRIMARY IDENTIFIER = mobile (unique per admin — NOT globally).
// Used in Sales (leads) and Finance (payments/projects).
// Tracked by mobile number on Payment Page.
// ════════════════════════════════════════════════════════════
const ClientSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  name: { type: String, trim: true, default: '' },
  email: { type: String, lowercase: true, trim: true, default: '' },
  mobile: { type: String, required: true, match: [/^\d{10}$/, 'Mobile must be 10 digits'], trim: true },
  companyName: { type: String, trim: true, default: '' },  // from CSV upload
  source: {
    type: String,
    enum: ['CSV_UPLOAD', 'EXCEL', 'MANUAL', 'PROSPECT_FORM', 'PAYMENT_PAGE'],
    default: 'MANUAL',
  },
  prospectStatus: {
    type: String,
    enum: ['NONE', 'INTERESTED', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST'],
    default: 'NONE',
  },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

ClientSchema.plugin(softDeletePlugin);
// mobile unique PER admin — NOT globally (two admins can have same client)
ClientSchema.index({ admin: 1, mobile: 1 }, { unique: true });
ClientSchema.index({ admin: 1, email: 1 });
ClientSchema.index({ admin: 1, isDeleted: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 21 — LEAD
// Lead = Client assigned to a Sales Executive.
// Full lifecycle: UNTOUCHED → TALK → INTERESTED → CONVERTED / DUMP
// RULE: notTalkCount >= 3 → auto-dump (enforced in service layer)
// RULE: Never hard-delete — always isDumped or softDelete
// ════════════════════════════════════════════════════════════
const LeadSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },

  // ── Assignment (chain tracked for performance reporting) ──
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  team: { type: Schema.Types.ObjectId, ref: 'Team', default: null },

  // ── Status ──
  status: { type: String, enum: LEAD_STATUS, default: 'UNTOUCHED' },

  // ── Talk Tracking ──
  talkCount: { type: Number, default: 0 },
  notTalkCount: { type: Number, default: 0 },  // >= 3 triggers auto-dump
  talkDuration: { type: Number, default: 0 },  // total minutes
  lastContactedAt: { type: Date, default: null },

  // ── Dump Management ──
  isDumped: { type: Boolean, default: false },
  dumpReason: { type: String, default: null },
  dumpedAt: { type: Date, default: null },
  dumpedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  restoredAt: { type: Date, default: null },
  restoredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

  // ── Follow-up ──
  followUpAt: { type: Date, default: null },
  followUpMissed: { type: Boolean, default: false },

  // ── Conversion ──
  convertedAt: { type: Date, default: null },
  convertedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

  // ── Reference ──
  bulkUploadId: { type: Schema.Types.ObjectId, ref: 'BulkLeadUpload', default: null },
}, { timestamps: true });

LeadSchema.index({ admin: 1, assignedTo: 1, isDumped: 1, isDeleted: 1 });
LeadSchema.index({ admin: 1, status: 1, isDeleted: 1 });
LeadSchema.index({ admin: 1, team: 1, isDeleted: 1 });
LeadSchema.index({ admin: 1, client: 1 });
LeadSchema.index({ admin: 1, followUpAt: 1, followUpMissed: 1 });
LeadSchema.index({ admin: 1, isDumped: 1, isDeleted: 1 });
LeadSchema.index({ admin: 1, convertedAt: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 22 — LEAD ASSIGNMENT HISTORY
// Full history of every reassignment.
// Enables: who had this lead + when + why + performance tracking.
// ════════════════════════════════════════════════════════════
const LeadAssignmentHistorySchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  team: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
  reason: { type: String, trim: true },
  assignedAt: { type: Date, default: Date.now },
  releasedAt: { type: Date, default: null },  // when reassigned away
}, { timestamps: true });

LeadAssignmentHistorySchema.index({ admin: 1, lead: 1, assignedAt: -1 });
LeadAssignmentHistorySchema.index({ admin: 1, assignedTo: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 23 — LEAD ACTIVITY
// Every status update/comment by Sales Executive.
// Used for: comment history, performance tracking, reports.
// ════════════════════════════════════════════════════════════
const LeadActivitySchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: LEAD_STATUS, required: true },
  comment: { type: String, trim: true },
  duration: { type: Number, default: 0 },   // call duration in minutes
}, { timestamps: true });

LeadActivitySchema.index({ admin: 1, lead: 1, createdAt: -1 });
LeadActivitySchema.index({ admin: 1, user: 1, createdAt: -1 });


// ════════════════════════════════════════════════════════════
// MODEL 24 — BULK LEAD UPLOAD
// Tracks every CSV/Excel upload by Sales Manager.
// Stores row-level errors for debugging and re-upload.
// ════════════════════════════════════════════════════════════
const BulkLeadUploadSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileType: { type: String, enum: ['CSV', 'EXCEL'] },
  fileName: String,
  fileUrl: String,
  totalRows: { type: Number, default: 0 },
  imported: { type: Number, default: 0 },
  duplicates: { type: Number, default: 0 },
  invalidRows: { type: Number, default: 0 },
  // Row-level error details for debugging/re-upload
  failedRows: [{
    rowNumber: Number,
    rawData: Schema.Types.Mixed,
    reason: String,   // 'INVALID_PHONE' | 'DUPLICATE' | 'MISSING_FIELD'
    _id: false,
  }],
  errorMessages: [String],
  status: { type: String, enum: ['PROCESSING', 'PREVIEWED', 'DONE', 'PARTIAL', 'FAILED'], default: 'PROCESSING' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

BulkLeadUploadSchema.index({ admin: 1, uploadedBy: 1, createdAt: -1 });


// ════════════════════════════════════════════════════════════
// MODEL 24A — BULK USER UPLOAD
// Tracks bulk member onboarding jobs (CSV/Excel).
// Used by Admin panel to preview/commit/review uploads.
// ════════════════════════════════════════════════════════════
const BulkUserUploadSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  uploadedBy: { type: Schema.Types.ObjectId, required: true },
  uploadedByType: { type: String, enum: ['ADMIN', 'USER'], default: 'ADMIN' },

  fileType: { type: String, enum: ['CSV', 'EXCEL'], required: true },
  fileName: { type: String, trim: true, required: true },
  fileUrl: { type: String, default: null },

  totalRows: { type: Number, default: 0 },
  validRows: { type: Number, default: 0 },
  imported: { type: Number, default: 0 },
  duplicates: { type: Number, default: 0 },
  invalidRows: { type: Number, default: 0 },

  failedRows: [{
    rowNumber: { type: Number, required: true },
    rawData: { type: Schema.Types.Mixed, default: {} },
    reason: { type: String, required: true },
    fieldErrors: [{
      field: { type: String, trim: true },
      message: { type: String, trim: true },
      _id: false,
    }],
    _id: false,
  }],

  errorMessages: [String],

  status: {
    type: String,
    enum: ['UPLOADED', 'PROCESSING', 'DONE', 'PARTIAL', 'FAILED'],
    default: 'UPLOADED',
  },

  options: {
    skipDuplicates: { type: Boolean, default: true },
    strictMode: { type: Boolean, default: false },
    _id: false,
  },

  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

BulkUserUploadSchema.index({ admin: 1, createdAt: -1 });
BulkUserUploadSchema.index({ admin: 1, status: 1, createdAt: -1 });
BulkUserUploadSchema.index({ admin: 1, uploadedBy: 1, createdAt: -1 });


// ════════════════════════════════════════════════════════════
// MODEL 25 — PROSPECT FORM
// Filled by Sales Executive for interested leads.
// suggestedServices → sent to Finance Manager.
// finalServices → edited by Finance Manager.
// ════════════════════════════════════════════════════════════
const ProspectFormSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  filledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

  requirement: { type: String, trim: true },
  budget: { type: Number, default: 0 },
  expectedClosing: Date,
  notes: { type: String, trim: true },

  // Services suggested by Sales Executive (references Service catalog)
  suggestedServices: [{
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
    name: String,
    price: Number,
    qty: { type: Number, default: 1 },
    _id: false,
  }],

  // Final services edited by Finance Manager
  finalServices: [{
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
    name: String,
    price: Number,
    qty: { type: Number, default: 1 },
    discount: { type: Number, default: 0 },
    _id: false,
  }],

  totalAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['OPEN', 'IN_NEGOTIATION', 'SENT_TO_FINANCE', 'WON', 'LOST'],
    default: 'OPEN',
  },
}, { timestamps: true });

ProspectFormSchema.index({ admin: 1, lead: 1 });
ProspectFormSchema.index({ admin: 1, filledBy: 1 });
ProspectFormSchema.index({ admin: 1, status: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 26 — REMINDER
// Used by Sales Executive, TL, Management Employee.
// Can be linked to a Lead OR Project.
// ════════════════════════════════════════════════════════════
const ReminderSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', default: null },
  project: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
  title: { type: String, required: true, trim: true },
  note: { type: String, trim: true },
  remindAt: { type: Date, required: true },
  isMissed: { type: Boolean, default: false },
  isDone: { type: Boolean, default: false },
  doneAt: { type: Date, default: null },
}, { timestamps: true });

ReminderSchema.index({ admin: 1, user: 1, remindAt: 1, isDone: 1 });
ReminderSchema.index({ admin: 1, isMissed: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 27 — SALES TARGET
// Set by Sales Manager or Admin.
// IMPORTANT: achievedCalls/Sales/Revenue must ONLY be updated
// via $inc — NEVER via $set (prevents race conditions).
// ════════════════════════════════════════════════════════════
const SalesTargetSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  setBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetFor: { type: String, enum: ['USER', 'TEAM', 'DEPARTMENT'], required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  team: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
  department: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
  period: { type: String, enum: TARGET_PERIOD, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  targetCalls: { type: Number, default: 0 },
  targetSales: { type: Number, default: 0 },
  targetRevenue: { type: Number, default: 0 },
  // ⚠ ONLY update via $inc — never $set (race condition risk)
  achievedCalls: { type: Number, default: 0 },
  achievedSales: { type: Number, default: 0 },
  achievedRevenue: { type: Number, default: 0 },
}, { timestamps: true });

SalesTargetSchema.index({ admin: 1, period: 1, fromDate: 1 });
SalesTargetSchema.index({ admin: 1, user: 1, period: 1 });
SalesTargetSchema.index({ admin: 1, team: 1, period: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 28 — DAILY REPORT SNAPSHOT
// Pre-computed daily snapshot per user.
// Avoids expensive real-time aggregation on large data.
// Auto-generated at end of day OR on-demand first access.
// ════════════════════════════════════════════════════════════
const DailyReportSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },    // normalized to start of day
  totalCalls: { type: Number, default: 0 },
  todayCalls: { type: Number, default: 0 },
  todayProspect: { type: Number, default: 0 },
  todaySell: { type: Number, default: 0 },
  todayDump: { type: Number, default: 0 },
  totalUntouched: { type: Number, default: 0 },
  totalLeads: { type: Number, default: 0 },
  talkRatio: { type: Number, default: 0 },   // percentage
  followUpMissed: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// One snapshot per user per day
DailyReportSchema.index({ admin: 1, user: 1, date: 1 }, { unique: true });
DailyReportSchema.index({ admin: 1, date: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 29 — PROJECT
// Created after deal finalized (Finance → Management).
// soldBy = Sales Executive who made the sale (performance tracking).
// paidAmount updated ONLY via $inc (atomic — no race condition).
// handoverLink is mandatory before delivery (enforced in service).
// ════════════════════════════════════════════════════════════
const ProjectSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },

  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  driveLink: { type: String, default: null },
  handoverLink: { type: String, default: null },   // mandatory before delivery
  priority: { type: String, enum: PROJ_PRIORITY, default: 'MEDIUM' },
  status: { type: String, enum: PROJ_STATUS, default: 'NOT_STARTED' },

  startDate: { type: Date, default: null },
  expectedDelivery: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },

  // ── Assignment ──
  assignedTeam: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
  teamLeader: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },

  // ── Sales Reference ──
  soldBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  prospectForm: { type: Schema.Types.ObjectId, ref: 'ProspectForm', default: null },

  // ── Finance ──
  totalAmount: { type: Number, default: 0 },
  // ⚠ paidAmount: ONLY update via $inc with overpayment check
  paidAmount: { type: Number, default: 0 },

  // ── Delivery ──
  isDelivered: { type: Boolean, default: false },
  deliveryConfirmed: { type: Boolean, default: false },

  // ── Progress ──
  progressPercent: { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true });

ProjectSchema.plugin(softDeletePlugin);
ProjectSchema.index({ admin: 1, status: 1, isDeleted: 1 });
ProjectSchema.index({ admin: 1, client: 1 });
ProjectSchema.index({ admin: 1, teamLeader: 1 });
ProjectSchema.index({ admin: 1, assignedTo: 1 });
ProjectSchema.index({ admin: 1, soldBy: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 30 — PROJECT UPDATE (Progress Tracker)
// Every milestone/update in the project timeline.
// Powers both internal tracking AND client-facing tracking page.
// isClientVisible controls what clients can see.
// ════════════════════════════════════════════════════════════
const ProjectUpdateSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: PROJ_STATUS, required: true },
  note: { type: String, trim: true },
  workNote: { type: String, trim: true },
  attachmentUrl: { type: String, default: null },
  progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  isClientVisible: { type: Boolean, default: true },
}, { timestamps: true });

ProjectUpdateSchema.index({ admin: 1, project: 1, createdAt: -1 });


// ════════════════════════════════════════════════════════════
// MODEL 31 — PAYMENT
// Razorpay integration. Full & Partial payments.
// signatureVerified MUST be true before storing SUCCESS.
// webhookVerified = backup confirmation via Razorpay webhook.
// paidAmount on Project updated via $inc (atomic).
// ════════════════════════════════════════════════════════════
const PaymentSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },

  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },

  amount: { type: Number, required: true, min: 1 },
  paymentType: { type: String, enum: ['FULL', 'PARTIAL'], required: true },
  status: { type: String, enum: PAY_STATUS, default: 'PENDING' },
  failureReason: { type: String, default: null },

  signatureVerified: { type: Boolean, default: false },
  webhookVerified: { type: Boolean, default: false },

  paidAt: { type: Date, default: null },
  retryCount: { type: Number, default: 0 },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

  isRefunded: { type: Boolean, default: false },
  refundedAt: { type: Date, default: null },
  refundReason: { type: String, default: null },
  razorpayRefundId: { type: String, default: null },
}, { timestamps: true });

PaymentSchema.index({ admin: 1, project: 1 });
PaymentSchema.index({ admin: 1, client: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ admin: 1, status: 1 });
PaymentSchema.index({ admin: 1, createdAt: -1 });


// ════════════════════════════════════════════════════════════
// MODEL 32 — WORK ORDER
// Generated by Finance Manager after deal finalization.
// Client signs the work order (tracked).
// ════════════════════════════════════════════════════════════
const WorkOrderSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  isGenerated: { type: Boolean, default: false },
  pdfUrl: { type: String, default: null },
  isSigned: { type: Boolean, default: false },
  signedAt: { type: Date, default: null },
  signedByName: { type: String, default: null },
  isApproved: { type: Boolean, default: false },
  approvedAt: { type: Date, default: null },
  sentToEmail: { type: String, default: null },
  sentAt: { type: Date, default: null },
}, { timestamps: true });

WorkOrderSchema.index({ admin: 1, project: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 33 — INVOICE
// Auto or manual. Atomic invoice number via InvoiceCounter.
// Custom GST amount supported.
// ════════════════════════════════════════════════════════════
const InvoiceSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  payment: { type: Schema.Types.ObjectId, ref: 'Payment', default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  invoiceNumber: { type: String, required: true },   // generated via InvoiceCounter

  amount: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  gstPercent: { type: Number, default: 18, min: 0 },
  gstAmount: { type: Number, default: 0, min: 0 },
  isCustomGst: { type: Boolean, default: false },
  totalAmount: { type: Number, required: true, min: 0 },

  lineItems: [{
    name: { type: String, trim: true },
    qty: { type: Number, default: 1 },
    price: Number,
    amount: Number,
    _id: false,
  }],

  status: { type: String, enum: INVOICE_STATUS, default: 'DRAFT' },
  pdfUrl: { type: String, default: null },
  dueDate: { type: Date, default: null },
  sentAt: { type: Date, default: null },
  sentToEmail: { type: String, default: null },
  paidAt: { type: Date, default: null },
}, { timestamps: true });

// invoiceNumber unique per admin
InvoiceSchema.index({ admin: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ admin: 1, project: 1 });
InvoiceSchema.index({ admin: 1, status: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 34 — EXPENSE
// Added by Finance Manager. Full CRUD with soft delete.
// ════════════════════════════════════════════════════════════
const ExpenseSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  note: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  receiptUrl: { type: String, default: null },
}, { timestamps: true });

ExpenseSchema.plugin(softDeletePlugin);
ExpenseSchema.index({ admin: 1, date: -1, isDeleted: 1 });
ExpenseSchema.index({ admin: 1, category: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 35 — SUPPORT TICKET (Internal)
// Raised by any user. Scoped to admin.
// ════════════════════════════════════════════════════════════
const TicketSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: { type: String, enum: TICKET_STATUS, default: 'OPEN' },
  priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
  refType: {
    type: String,
    enum: ['CLIENT_DATA', 'SALES_MANAGER', 'SALES_TL', 'EXECUTIVE', 'SYSTEM'],
    default: null,
  },
  refId: { type: Schema.Types.ObjectId, default: null },
  replies: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now },
    _id: false,
  }],
  isEscalated: { type: Boolean, default: false },
  escalatedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

TicketSchema.index({ admin: 1, raisedBy: 1, status: 1 });
TicketSchema.index({ admin: 1, assignedTo: 1, status: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 36 — SUPER ADMIN SUPPORT TICKET
// Admin → Super Admin tickets. Completely separate collection.
// ════════════════════════════════════════════════════════════
const SuperAdminTicketSchema = new Schema({
  raisedBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: { type: String, enum: TICKET_STATUS, default: 'OPEN' },
  priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
  replies: [{
    senderType: { type: String, enum: ['ADMIN', 'SUPER_ADMIN'] },
    senderId: Schema.Types.ObjectId,
    message: String,
    createdAt: { type: Date, default: Date.now },
    _id: false,
  }],
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

SuperAdminTicketSchema.index({ raisedBy: 1, status: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 37 — ATTENDANCE
// Clock In / Clock Out per user per day (one record).
// Date MUST be normalized to start-of-day (pre-save hook).
// Includes breaks and overtime tracking.
// ════════════════════════════════════════════════════════════
const AttendanceSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },   // normalized to 00:00:00 by pre-save hook

  clockIn: { type: Date, default: null },
  clockOut: { type: Date, default: null },
  latitude: Number,
  longitude: Number,
  ipAddress: String,

  breaks: [{
    startedAt: { type: Date },
    endedAt: { type: Date },
    _id: false,
  }],

  // Calculated on clockOut
  hoursWorked: { type: Number, default: 0 },
  breakMinutes: { type: Number, default: 0 },
  overtimeMinutes: { type: Number, default: 0 },
  isHalfDay: { type: Boolean, default: false },
  isAbsent: { type: Boolean, default: false },
  note: String,
}, { timestamps: true });

// Pre-save: normalize date to start of day
AttendanceSchema.pre('save', function (next) {
  if (this.isModified('date') || this.isNew) {
    const d = new Date(this.date);
    d.setHours(0, 0, 0, 0);
    this.date = d;
  }
  next();
});

// One record per user per day per admin
AttendanceSchema.index({ admin: 1, user: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ admin: 1, date: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 38 — LEAVE BALANCE
// Tracks remaining leave quota per user per year.
// Updated when leave is approved.
// ════════════════════════════════════════════════════════════
const LeaveBalanceSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },   // e.g. 2025
  casual: {
    total: { type: Number, default: 12 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 12 },
  },
  sick: {
    total: { type: Number, default: 6 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 6 },
  },
  earned: {
    total: { type: Number, default: 15 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 15 },
  },
  unpaid: {
    total: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
  },
}, { timestamps: true });

// One balance record per user per year
LeaveBalanceSchema.index({ admin: 1, user: 1, year: 1 }, { unique: true });


// ════════════════════════════════════════════════════════════
// MODEL 39 — LEAVE
// Applied by any user. Top-level approved by Admin.
// TL can approve direct reports (enforced at API layer).
// Updates LeaveBalance when approved.
// ════════════════════════════════════════════════════════════
const LeaveSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  leaveType: { type: String, enum: LEAVE_TYPE, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  days: { type: Number, required: true, min: 0.5 },
  reason: { type: String, trim: true },
  status: { type: String, enum: LEAVE_STATUS, default: 'PENDING' },
  rejectionNote: { type: String, default: null },
  approvedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
}, { timestamps: true });

LeaveSchema.index({ admin: 1, user: 1, status: 1 });
LeaveSchema.index({ admin: 1, approvedBy: 1 });
LeaveSchema.index({ admin: 1, fromDate: 1, status: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 40 — ANNOUNCEMENT
// Sent by Admin, Sales Manager, Sales TL.
// targetType controls visibility scope.
// ════════════════════════════════════════════════════════════
const AnnouncementSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  createdByAdmin: { type: Boolean, default: false },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['INFO', 'WARNING', 'APPRECIATION'], required: true },
  targetType: {
    type: String,
    enum: ['ALL', 'DEPARTMENT', 'TEAM', 'ROLE', 'USER'],
    required: true,
  },
  targetDepartment: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
  targetTeam: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
  targetRole: { type: String, enum: ROLES, default: null },
  targetUser: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

AnnouncementSchema.index({ admin: 1, createdAt: -1 });
AnnouncementSchema.index({ admin: 1, targetType: 1 });


// ════════════════════════════════════════════════════════════
// MODEL 41 — NOTIFICATION
// Firebase FCM push notifications.
// isRead updated when user opens notification.
// ════════════════════════════════════════════════════════════
const NotificationSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: NOTIF_TYPE, required: true },
  refId: { type: Schema.Types.ObjectId, default: null },
  refType: { type: String, default: null },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
}, { timestamps: true });

NotificationSchema.index({ admin: 1, user: 1, isRead: 1, createdAt: -1 });


// ════════════════════════════════════════════════════════════
// MODEL 42 — API CONFIG
// Global API keys managed by Super Admin ONLY.
// Razorpay, Brevo, Firebase keys.
// ════════════════════════════════════════════════════════════
const ApiConfigSchema = new Schema({
  key: { type: String, required: true, unique: true, trim: true },
  value: { type: String, required: true },
  description: { type: String, trim: true },
  isEncrypted: { type: Boolean, default: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'SuperAdmin', default: null },
}, { timestamps: true });


// ════════════════════════════════════════════════════════════
// MODEL 43 — CLIENT PROJECT TRACKING TOKEN
// Public-facing page. No login required.
// Client gets unique token linked to their project.
// TTL: set expiresAt or null for permanent.
// ════════════════════════════════════════════════════════════
const ProjectTrackingTokenSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  token: { type: String, required: true, unique: true },  // UUID v4
  expiresAt: { type: Date, default: null },                   // null = never expires
  isActive: { type: Boolean, default: true },
  lastAccessedAt: { type: Date, default: null },
  accessCount: { type: Number, default: 0 },
}, { timestamps: true });

ProjectTrackingTokenSchema.index({ admin: 1, project: 1 });


// ════════════════════════════════════════════════════════════
// EXPORT ALL 43 MODELS
// ════════════════════════════════════════════════════════════
module.exports = {
  // ── Super Admin ──
  SuperAdmin: mongoose.model('SuperAdmin', SuperAdminSchema),
  SuperAdminLoginLog: mongoose.model('SuperAdminLoginLog', SuperAdminLoginLogSchema),

  // ── Security ──
  LoginAttempt: mongoose.model('LoginAttempt', LoginAttemptSchema),
  TokenBlacklist: mongoose.model('TokenBlacklist', TokenBlacklistSchema),
  RefreshToken: mongoose.model('RefreshToken', RefreshTokenSchema),
  PasswordReset: mongoose.model('PasswordReset', PasswordResetSchema),
  EmailVerification: mongoose.model('EmailVerification', EmailVerificationSchema),

  // ── Plans & Limits ──
  SubscriptionPlan: mongoose.model('SubscriptionPlan', SubscriptionPlanSchema),
  UserLimitOverride: mongoose.model('UserLimitOverride', UserLimitOverrideSchema),
  DataLimitOverride: mongoose.model('DataLimitOverride', DataLimitOverrideSchema),

  // ── Tenant ──
  Admin: mongoose.model('Admin', AdminSchema),
  AdminLoginLog: mongoose.model('AdminLoginLog', AdminLoginLogSchema),

  // ── Structure ──
  Department: mongoose.model('Department', DepartmentSchema),
  Service: mongoose.model('Service', ServiceSchema),
  Team: mongoose.model('Team', TeamSchema),

  // ── Users ──
  User: mongoose.model('User', UserSchema),
  UserLoginLog: mongoose.model('UserLoginLog', UserLoginLogSchema),

  // ── System ──
  AuditLog: mongoose.model('AuditLog', AuditLogSchema),
  InvoiceCounter: mongoose.model('InvoiceCounter', InvoiceCounterSchema),
  WebhookLog: mongoose.model('WebhookLog', WebhookLogSchema),

  // ── Sales ──
  Client: mongoose.model('Client', ClientSchema),
  Lead: mongoose.model('Lead', LeadSchema),
  LeadAssignmentHistory: mongoose.model('LeadAssignmentHistory', LeadAssignmentHistorySchema),
  LeadActivity: mongoose.model('LeadActivity', LeadActivitySchema),
  BulkLeadUpload: mongoose.model('BulkLeadUpload', BulkLeadUploadSchema),
  BulkUserUpload: mongoose.model('BulkUserUpload', BulkUserUploadSchema),
  ProspectForm: mongoose.model('ProspectForm', ProspectFormSchema),
  Reminder: mongoose.model('Reminder', ReminderSchema),
  SalesTarget: mongoose.model('SalesTarget', SalesTargetSchema),
  DailyReport: mongoose.model('DailyReport', DailyReportSchema),

  // ── Projects ──
  Project: mongoose.model('Project', ProjectSchema),
  ProjectUpdate: mongoose.model('ProjectUpdate', ProjectUpdateSchema),
  ProjectTrackingToken: mongoose.model('ProjectTrackingToken', ProjectTrackingTokenSchema),

  // ── Finance ──
  Payment: mongoose.model('Payment', PaymentSchema),
  WorkOrder: mongoose.model('WorkOrder', WorkOrderSchema),
  Invoice: mongoose.model('Invoice', InvoiceSchema),
  Expense: mongoose.model('Expense', ExpenseSchema),

  // ── HR ──
  Attendance: mongoose.model('Attendance', AttendanceSchema),
  LeaveBalance: mongoose.model('LeaveBalance', LeaveBalanceSchema),
  Leave: mongoose.model('Leave', LeaveSchema),

  // ── Communication ──
  Ticket: mongoose.model('Ticket', TicketSchema),
  SuperAdminTicket: mongoose.model('SuperAdminTicket', SuperAdminTicketSchema),
  Announcement: mongoose.model('Announcement', AnnouncementSchema),
  Notification: mongoose.model('Notification', NotificationSchema),

  // ── Config ──
  ApiConfig: mongoose.model('ApiConfig', ApiConfigSchema),
};