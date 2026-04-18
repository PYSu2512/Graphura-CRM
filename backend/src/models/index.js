// ============================================================
// GRAPHURA CRM — ALL MONGOOSE MODELS
// MongoDB + Mongoose v8 | Node.js 20+
// ============================================================

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────
// ENUMS (shared constants)
// ─────────────────────────────────────────────
const ROLES = ['SUPER_ADMIN','ADMIN','SALES_MANAGER','SALES_TL','SALES_EXECUTIVE',
               'FINANCE_MANAGER','MANAGEMENT_MANAGER','MANAGEMENT_TL','MANAGEMENT_EMPLOYEE'];

const LEAD_STATUS   = ['UNTOUCHED','TALK','NOT_TALK','INTERESTED','CONVERTED','DUMP'];
// Added 'WORK_STARTED' and 'FINALIZATION' milestones 
const PROJ_STATUS   = ['NOT_STARTED','WORK_STARTED','IN_PROGRESS','REVIEW','FINALIZATION','COMPLETED','DELIVERED','DELAYED']; 
const PROJ_PRIORITY = ['LOW','MEDIUM','HIGH','URGENT'];
const PAY_STATUS    = ['PENDING','SUCCESS','FAILED'];
const TICKET_STATUS = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','ESCALATED'];
const LEAVE_STATUS  = ['PENDING','APPROVED','REJECTED'];
const LEAVE_TYPE    = ['CASUAL','SICK','EARNED','HALF_DAY','UNPAID'];
const APPROVAL_STATUS = ['PENDING','APPROVED','REJECTED'];
const INVOICE_STATUS  = ['DRAFT','SENT','PAID','OVERDUE','CANCELLED'];
const NOTIF_TYPE = ['PAYMENT_SUCCESS','PAYMENT_FAILED','WORK_ORDER_SIGNED',
                    'TICKET_UPDATED','LEAD_ASSIGNED','REMINDER_DUE',
                    'ANNOUNCEMENT','TARGET_ALERT','LEAVE_STATUS','GENERAL'];

// ─────────────────────────────────────────────
// 1. COMPANY SETTINGS
// ─────────────────────────────────────────────
const CompanySettingsSchema = new Schema({
  name:    { type: String, required: true },
  logo:    String,
  email:   String,
  phone:   String,
  address: String,
  website: String, // [cite: 513]
  bankDetails: {
    accountNo: String,
    ifsc:      String,
    bankName:  String,
    upiId:     String,
  },
}, { timestamps: true });

// ─────────────────────────────────────────────
// 2. DEPARTMENT
// ─────────────────────────────────────────────
const DepartmentSchema = new Schema({
  name:     { type: String, required: true, unique: true }, 
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ─────────────────────────────────────────────
// 3. ROLE
// ─────────────────────────────────────────────
const RoleSchema = new Schema({
  name:        { type: String, required: true, unique: true, enum: ROLES },
  permissions: [String], 
  defaultLimit: Number, // To store role-based defaults like 250, 1500, etc. 
}, { timestamps: true });

// ─────────────────────────────────────────────
// 4. USER
// ─────────────────────────────────────────────
const UserSchema = new Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  password:       { type: String, required: true },       
  role:           { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  department:     { type: Schema.Types.ObjectId, ref: 'Department' },
  manager:        { type: Schema.Types.ObjectId, ref: 'User' }, 
  phone:          { type: String, match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number'] }, 
  fcmToken:       String,       
  dataLimit:      { type: Number, default: null }, // null uses Role default     
  isActive:       { type: Boolean, default: true },
  approvalStatus: { type: String, enum: APPROVAL_STATUS, default: 'PENDING' }, 
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ manager: 1 });

// ─────────────────────────────────────────────
// 5. REFRESH TOKEN (JWT Hardening)
// ─────────────────────────────────────────────
const RefreshTokenSchema = new Schema({
  user:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token:     { type: String, required: true, unique: true }, 
  expiresAt: { type: Date,   required: true },
  isRevoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

RefreshTokenSchema.index({ user: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 

// ─────────────────────────────────────────────
// 6. LOGIN LOG
// ─────────────────────────────────────────────
const LoginLogSchema = new Schema({
  user:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ipAddress: String,
  latitude:  Number,
  longitude: Number,
  userAgent: String,
  device:    String,
  createdAt: { type: Date, default: Date.now },
});

LoginLogSchema.index({ user: 1, createdAt: -1 });

// ─────────────────────────────────────────────
// 7. TEAM
// ─────────────────────────────────────────────
const TeamSchema = new Schema({
  name:       { type: String, required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  members: [{
    user:     { type: Schema.Types.ObjectId, ref: 'User' },
    role:     { type: String, enum: ['LEADER','MEMBER'], default: 'MEMBER' },
    joinedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// ─────────────────────────────────────────────
// 8. CLIENT
// ─────────────────────────────────────────────
const ClientSchema = new Schema({
  name:           String,
  email:          { type: String, lowercase: true },
  mobile:         { type: String, required: true, unique: true, match: /^\d{10}$/ }, // Primary identifier 
  source:         { type: String, enum: ['CSV_UPLOAD', 'EXCEL', 'MANUAL', 'PROSPECT_FORM', 'PAYMENT_PAGE'] }, // Added EXCEL [cite: 20, 411]
  prospectStatus: { type: String, enum: ['NONE','INTERESTED','NEGOTIATING','CLOSED_WON','CLOSED_LOST'], default: 'NONE' },
}, { timestamps: true });

ClientSchema.index({ mobile: 1 });
ClientSchema.index({ email: 1 });

// ─────────────────────────────────────────────
// 9. LEAD
// ─────────────────────────────────────────────
const LeadSchema = new Schema({
  client:          { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  assignedTo:      { type: Schema.Types.ObjectId, ref: 'User',   required: true },

  status:          { type: String, enum: LEAD_STATUS, default: 'UNTOUCHED' },
  talkCount:       { type: Number, default: 0 },
  notTalkCount:    { type: Number, default: 0 }, // For auto-dumping after 3 failed attempts 
  talkDuration:    Number,          
  isDumped:        { type: Boolean, default: false },
  dumpReason:      String,
  dumpedAt:        Date,
  restoredAt:      Date,
  restoredBy:      { type: Schema.Types.ObjectId, ref: 'User' },

  followUpAt:      Date,
  lastContactedAt: Date,
}, { timestamps: true });

LeadSchema.index({ assignedTo: 1, isDumped: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ client: 1 });
LeadSchema.index({ followUpAt: 1 });

// ─────────────────────────────────────────────
// 10. LEAD ACTIVITY
// ─────────────────────────────────────────────
const LeadActivitySchema = new Schema({
  lead:     { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment:  String,
  status:   { type: String, enum: LEAD_STATUS, required: true },
  duration: Number, 
}, { timestamps: true });

LeadActivitySchema.index({ lead: 1, createdAt: -1 });

// ─────────────────────────────────────────────
// 11. REMINDER
// ─────────────────────────────────────────────
const ReminderSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  lead:        { type: Schema.Types.ObjectId, ref: 'Lead' },
  project:     { type: Schema.Types.ObjectId, ref: 'Project' },
  title:       { type: String, required: true },
  note:        String,
  remindAt:    { type: Date, required: true },
  isMissed:    { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

ReminderSchema.index({ user: 1, remindAt: 1 });
ReminderSchema.index({ remindAt: 1, isCompleted: 1 }); 

// ─────────────────────────────────────────────
// 12. PROSPECT FORM
// ─────────────────────────────────────────────
const ProspectFormSchema = new Schema({
  client:    { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User',   required: true },
  services: [{
    name:            String,
    description:     String,
    estimatedAmount: Number,
  }],
  notes:           String,
  discountApplied: { type: Number, default: 0 },
  finalAmount:     Number,
  status: {
    type: String,
    enum: ['DRAFT','SUBMITTED','REVIEWED','CONVERTED'],
    default: 'DRAFT',
  },
}, { timestamps: true });

// ─────────────────────────────────────────────
// 13. BULK LEAD UPLOAD LOG
// ─────────────────────────────────────────────
const BulkLeadUploadSchema = new Schema({
  uploadedBy:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName:       { type: String, required: true },
  totalRows:      { type: Number, default: 0 },
  successCount:   { type: Number, default: 0 },
  duplicateCount: { type: Number, default: 0 },
  invalidCount:   { type: Number, default: 0 },
  errors: [{ row: Number, reason: String }],
}, { timestamps: true });

// ─────────────────────────────────────────────
// 14. SALES TARGET
// ─────────────────────────────────────────────
const SalesTargetSchema = new Schema({
  assignedTo:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  period:        { type: String, enum: ['DAILY','WEEKLY','MONTHLY'], required: true },
  startDate:     { type: Date, required: true },
  endDate:       { type: Date, required: true },
  targetType:    { type: String, enum: ['CALLS','CONVERSIONS','REVENUE'], required: true },
  targetValue:   { type: Number, required: true },
  achievedValue: { type: Number, default: 0 },
  team:          { type: Schema.Types.ObjectId, ref: 'Team' },
}, { timestamps: true });

SalesTargetSchema.index({ assignedTo: 1, period: 1 });

// ─────────────────────────────────────────────
// 15. PROJECT
// ─────────────────────────────────────────────
const ProjectSchema = new Schema({
  projectName:       { type: String, required: true }, // Added for tracking page 
  client:            { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  assignedTL:        { type: Schema.Types.ObjectId, ref: 'User' },
  assignedManager:   { type: Schema.Types.ObjectId, ref: 'User' },

  status:            { type: String, enum: PROJ_STATUS, default: 'NOT_STARTED' },
  priority:          { type: String, enum: PROJ_PRIORITY, default: 'MEDIUM' },
  completionPercent: { type: Number, default: 0, min: 0, max: 100 }, // Added for Progress Bar

  totalAmount:       { type: Number, required: true },
  paidAmount:        { type: Number, default: 0 },

  startDate:         Date,
  expectedDelivery:  Date, // Specific field for client tracking 
  deadline:          Date,
  deliveredAt:       Date,
  deliveryConfirmed: { type: Boolean, default: false },

  driveLink:         String,
  handoverLink:      String,  
}, { timestamps: true });

ProjectSchema.index({ client: 1 });
ProjectSchema.index({ assignedTL: 1 });
ProjectSchema.index({ status: 1 });

// ─────────────────────────────────────────────
// 16. PROJECT UPDATE (timeline log)
// ─────────────────────────────────────────────
const ProjectUpdateSchema = new Schema({
  project:       { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  updatedBy:     { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  status:        { type: String, enum: PROJ_STATUS, required: true },
  note:          String,
  workNotes:     String,
  attachmentUrl: String,
}, { timestamps: true });

ProjectUpdateSchema.index({ project: 1, createdAt: -1 });

// ─────────────────────────────────────────────
// 17. PAYMENT
// ─────────────────────────────────────────────
const PaymentSchema = new Schema({
  project:            { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  razorpayOrderId:    { type: String, required: true, unique: true },
  razorpayPaymentId:  String,
  razorpaySignature:  String,
  amount:             { type: Number, required: true },
  status:             { type: String, enum: PAY_STATUS, default: 'PENDING' },
  paymentType:        { type: String, enum: ['FULL','PARTIAL'], required: true },
  failureReason:      String,
  retryCount:         { type: Number, default: 0 },
}, { timestamps: true });

PaymentSchema.index({ project: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });

// ─────────────────────────────────────────────
// 18. WORK ORDER
// ─────────────────────────────────────────────
const WorkOrderSchema = new Schema({
  project:        { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  isGenerated:    { type: Boolean, default: false },
  pdfUrl:         String,
  isSigned:       { type: Boolean, default: false },
  signedAt:       Date,
  signedByName:   String,
  isApproved:     { type: Boolean, default: false },
  approvedAt:     Date,
  approvedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  sentAt:         Date,
  sentToEmail:    String,
}, { timestamps: true });

// ─────────────────────────────────────────────
// 19. INVOICE
// ─────────────────────────────────────────────
const InvoiceSchema = new Schema({
  project:       { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  createdBy:     { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  invoiceNumber: { type: String, required: true, unique: true }, 
  amount:        { type: Number, required: true },
  gstAmount:     { type: Number, default: 0 },
  gstPercent:    { type: Number, default: 18 },
  //isCustomGst:   { type: Boolean, default: false }, // Flag for custom GST logic 
  totalAmount:   { type: Number, required: true },
  discount:      { type: Number, default: 0 },
  status:        { type: String, enum: INVOICE_STATUS, default: 'DRAFT' },
  pdfUrl:        String,
  sentAt:        Date,
  sentToEmail:   String,
  dueDate:       Date,
}, { timestamps: true });

// ─────────────────────────────────────────────
// 20. EXPENSE
// ─────────────────────────────────────────────
const ExpenseSchema = new Schema({
  amount:    { type: Number, required: true },
  category:  { type: String, required: true },
  note:      String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

ExpenseSchema.index({ createdAt: -1 });
ExpenseSchema.index({ category: 1 });

// ─────────────────────────────────────────────
// 21. TICKET
// ─────────────────────────────────────────────
const TicketSchema = new Schema({
  raisedBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  subject:    { type: String, required: true },
  message:    { type: String, required: true },
  status:     { type: String, enum: TICKET_STATUS, default: 'OPEN' },
  priority:   { type: String, enum: ['LOW','NORMAL','HIGH','URGENT'], default: 'NORMAL' },
  refType:    { type: String, enum: ['CLIENT_DATA', 'SALES_MANAGER', 'TEAM_LEAD', 'EXECUTIVE', 'SYSTEM'] }, 
  refId:      Schema.Types.ObjectId,
  replies: [{
    user:      { type: Schema.Types.ObjectId, ref: 'User' },
    message:   String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

TicketSchema.index({ raisedBy: 1, status: 1 });

// ─────────────────────────────────────────────
// 22. ATTENDANCE
// ─────────────────────────────────────────────
const AttendanceSchema = new Schema({
  user:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date:      { type: Date, required: true },   
  clockIn:   Date,
  clockOut:  Date,
  latitude:  Number,
  longitude: Number,
  ipAddress: String,
}, { timestamps: true });

AttendanceSchema.index({ user: 1, date: 1 }, { unique: true }); 

// ─────────────────────────────────────────────
// 23. LEAVE
// ─────────────────────────────────────────────
const LeaveSchema = new Schema({
  user:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy:    { type: Schema.Types.ObjectId, ref: 'User' },
  leaveType:     { type: String, enum: LEAVE_TYPE, required: true },
  fromDate:      { type: Date, required: true },
  toDate:        { type: Date, required: true },
  days:          { type: Number, required: true },
  reason:        String,
  status:        { type: String, enum: LEAVE_STATUS, default: 'PENDING' },
  rejectionNote: String,
}, { timestamps: true });

LeaveSchema.index({ user: 1, status: 1 });

// ─────────────────────────────────────────────
// 24. ANNOUNCEMENT
// ─────────────────────────────────────────────
const AnnouncementSchema = new Schema({
  createdBy:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  type:       { type: String, enum: ['INFO','WARNING','APPRECIATION'], required: true },
  targetType: { type: String, enum: ['ALL','DEPARTMENT','TEAM','ROLE','USER','ADMIN_WISE'], required: true }, // Added ADMIN_WISE 
  targetId:   Schema.Types.ObjectId, 
}, { timestamps: true });

// ─────────────────────────────────────────────
// 25. NOTIFICATION
// ─────────────────────────────────────────────
const NotificationSchema = new Schema({
  user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  type:    { type: String, enum: NOTIF_TYPE, required: true },
  refId:   Schema.Types.ObjectId,
  refType: String,
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// ─────────────────────────────────────────────
// 26. API CONFIG (Super Admin)
// ─────────────────────────────────────────────
const ApiConfigSchema = new Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: String, required: true }, 
}, { timestamps: true });

// ─────────────────────────────────────────────
// 27. SUBSCRIPTION
// ─────────────────────────────────────────────
const SubscriptionSchema = new Schema({
  planName:   { type: String, required: true },
  maxUsers:   { type: Number, default: 40 }, // Admin Role limit 
  maxClients: { type: Number, default: 6000 },
  storageGB:  { type: Number, default: 10 },
  isActive:   { type: Boolean, default: true },
  startDate:  { type: Date, required: true },
  endDate:    Date,
}, { timestamps: true });

// ─────────────────────────────────────────────
// EXPORT ALL MODELS
// ─────────────────────────────────────────────
module.exports = {
  CompanySettings: mongoose.model('CompanySettings', CompanySettingsSchema),
  Department:      mongoose.model('Department',      DepartmentSchema),
  Role:            mongoose.model('Role',            RoleSchema),
  User:            mongoose.model('User',            UserSchema),
  RefreshToken:    mongoose.model('RefreshToken',    RefreshTokenSchema),
  LoginLog:        mongoose.model('LoginLog',        LoginLogSchema),
  Team:            mongoose.model('Team',            TeamSchema),
  Client:          mongoose.model('Client',          ClientSchema),
  Lead:            mongoose.model('Lead',            LeadSchema),
  LeadActivity:    mongoose.model('LeadActivity',    LeadActivitySchema),
  Reminder:        mongoose.model('Reminder',        ReminderSchema),
  ProspectForm:    mongoose.model('ProspectForm',    ProspectFormSchema),
  BulkLeadUpload:  mongoose.model('BulkLeadUpload',  BulkLeadUploadSchema),
  SalesTarget:     mongoose.model('SalesTarget',     SalesTargetSchema),
  Project:         mongoose.model('Project',         ProjectSchema),
  ProjectUpdate:   mongoose.model('ProjectUpdate',   ProjectUpdateSchema),
  Payment:         mongoose.model('Payment',         PaymentSchema),
  WorkOrder:       mongoose.model('WorkOrder',       WorkOrderSchema),
  Invoice:         mongoose.model('Invoice',         InvoiceSchema),
  Expense:         mongoose.model('Expense',         ExpenseSchema),
  Ticket:          mongoose.model('Ticket',          TicketSchema),
  Attendance:      mongoose.model('Attendance',      AttendanceSchema),
  Leave:           mongoose.model('Leave',           LeaveSchema),
  Announcement:    mongoose.model('Announcement',    AnnouncementSchema),
  Notification:    mongoose.model('Notification',    NotificationSchema),
  ApiConfig:       mongoose.model('ApiConfig',       ApiConfigSchema),
  Subscription:    mongoose.model('Subscription',    SubscriptionSchema),
};
