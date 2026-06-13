const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");
const {
  SuperAdmin,
  SuperAdminLoginLog,
  AdminLoginLog,
  Admin,
  Announcement,
  Notification,
  AuditLog,
  SuperAdminTicket,
  Department,
  User,
  Project,
  Payment,
  Lead,
  ContactQuery,
} = require("../models/index");
const {
  comparePassword,
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
} = require("../services/auth.service");

const PLATFORM_ANNOUNCEMENT_TYPE_MAP = {
  Announcement: "ANNOUNCEMENT",
  Warning: "WARNING",
  Appreciation: "APPRECIATION",
};

const PLATFORM_ANNOUNCEMENT_TYPE_LABELS = {
  ANNOUNCEMENT: "Announcement",
  WARNING: "Warning",
  APPRECIATION: "Appreciation",
  INFO: "Announcement",
};

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const formatDateOnly = (date) => {
  if (!date) return null;
  const resolved = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(resolved.getTime())) return null;
  return resolved.toISOString().slice(0, 10);
};

const computeAnnouncementStatus = (expiryDate) => {
  if (!expiryDate) return "Active";
  return new Date(expiryDate) >= new Date() ? "Active" : "Expired";
};

const formatPlatformAnnouncement = (announcement) => {
  const targetAdmin = announcement.platformTargetAdmin || announcement.admin;
  const company = targetAdmin?.company?.name || targetAdmin?.company || "";
  const adminName = targetAdmin?.name || "";

  return {
    id: announcement.platformAnnouncementKey || String(announcement._id),
    title: announcement.title,
    type:
      PLATFORM_ANNOUNCEMENT_TYPE_LABELS[announcement.type] || announcement.type,
    audience: announcement.platformTargetAdmin ? "Admin" : "All",
    audienceDetail: announcement.platformTargetAdmin
      ? `${adminName}${company ? ` (${company})` : ""}`
      : "All Admins and Users",
    sentDate: formatDateOnly(announcement.createdAt),
    expiryDate: formatDateOnly(announcement.expiryDate),
    body: announcement.message,
    status: computeAnnouncementStatus(announcement.expiryDate),
  };
};

const createNotificationDocsForAnnouncement = async (
  announcement,
  adminId,
  { includeAdmin = true, includeUsers = true } = {},
) => {
  const [admin, users] = await Promise.all([
    includeAdmin
      ? Admin.findOne({ _id: adminId, isDeleted: false, isActive: true })
          .select("_id")
          .lean()
      : null,
    includeUsers
      ? User.find({
          admin: adminId,
          isDeleted: false,
          isActive: true,
        })
          .select("_id")
          .lean()
      : [],
  ]);

  const recipientIds = [
    ...(admin ? [admin._id] : []),
    ...users.map((user) => user._id),
  ];

  if (recipientIds.length === 0) return 0;

  const uniqueIds = [...new Set(recipientIds.map(String))];
  await Notification.insertMany(
    uniqueIds.map((userId) => ({
      admin: adminId,
      user: userId,
      title: announcement.title,
      body: announcement.message,
      type: "ANNOUNCEMENT",
      refId: announcement._id,
      refType: "Announcement",
      isRead: false,
    })),
    { ordered: false },
  ).catch(() => {});

  return uniqueIds.length;
};

/**
 * SUPER ADMIN LOGIN
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const ipAddress = getClientIp(req);
  const userAgent = req.get("user-agent") || "unknown";

  // 1. Find Super Admin
  const superAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });

  if (!superAdmin) {
    return next(new AppError("Invalid email or password.", 401));
  }

  // 2. Verify Password
  const isMatch = await comparePassword(password, superAdmin.password);

  // Log attempt
  await SuperAdminLoginLog.create({
    superAdmin: superAdmin._id,
    email: email.toLowerCase(),
    ipAddress,
    userAgent,
    isSuccess: isMatch,
    failReason: isMatch ? null : "INVALID_CREDENTIALS",
  });

  if (!isMatch) {
    return next(new AppError("Invalid email or password.", 401));
  }

  if (!superAdmin.isActive) {
    return next(new AppError("Account is deactivated.", 403));
  }

  // 3. Generate Tokens
  const accessToken = generateAccessToken({
    id: superAdmin._id,
    email: superAdmin.email,
    role: "SUPER_ADMIN",
    type: "SUPER_ADMIN",
  });

  const refreshToken = generateRefreshToken({
    id: superAdmin._id,
    email: superAdmin.email,
    role: "SUPER_ADMIN",
    type: "SUPER_ADMIN",
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        superAdmin: {
          id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: "SUPER_ADMIN",
        },
        accessToken,
        refreshToken,
      },
      "Super Admin login successful",
    ),
  );
});

/**
 * VIEW ALL ADMIN LOGIN LOGS
 * Requirement: Can see AdminLoginLog (all admins)
 */
exports.getAdminLoginLogs = catchAsync(async (req, res, next) => {
  const logs = await AdminLoginLog.find()
    .populate("admin", "name company.name")
    .sort({ loginAt: -1 })
    .limit(100); // Limit to latest 100 for performance

  res
    .status(200)
    .json(
      new ApiResponse(200, { logs }, "Admin login logs retrieved successfully"),
    );
});

/**
 * GET ALL ADMINS (PAGINATED)
 */
exports.getAllAdmins = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Find all active admins (excluding soft deleted)
  const query = { isDeleted: false };

  const admins = await Admin.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "_id name email phone company userLimit clientLimit planStatus isActive createdAt",
    );

  const total = await Admin.countDocuments(query);
  const pages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        admins,
        pagination: { total, page, pages },
      },
      "Admins retrieved successfully",
    ),
  );
});

exports.getAnnouncementMeta = catchAsync(async (_req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        messageTypes: Object.keys(PLATFORM_ANNOUNCEMENT_TYPE_MAP).map(
          (label) => ({
            label,
            value: PLATFORM_ANNOUNCEMENT_TYPE_MAP[label],
          }),
        ),
        audienceOptions: ["All", "Admin"],
      },
      "Platform announcement metadata retrieved successfully",
    ),
  );
});

exports.getAnnouncementTargets = catchAsync(async (req, res) => {
  const admins = await Admin.find({
    isDeleted: false,
    isActive: true,
  })
    .select("_id name email phone company isActive")
    .sort({ name: 1 })
    .lean();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        audience: req.query.audience || "Admin",
        targets: admins.map((admin) => ({
          id: admin._id,
          label: `${admin.name}${admin.company?.name ? ` (${admin.company.name})` : ""}`,
          email: admin.email,
          phone: admin.phone,
          company: admin.company?.name || "",
        })),
      },
      "Platform announcement targets retrieved successfully",
    ),
  );
});

exports.createAnnouncement = catchAsync(async (req, res, next) => {
  const { title, message, type, audience, targetId, expiryDate } = req.body;

  if (!title?.trim()) return next(new AppError("Title is required", 400));
  if (!message?.trim()) return next(new AppError("Message is required", 400));
  if (!PLATFORM_ANNOUNCEMENT_TYPE_MAP[type]) {
    return next(new AppError("Invalid announcement type", 400));
  }
  if (!["All", "Admin"].includes(audience)) {
    return next(new AppError("Invalid audience selected", 400));
  }

  const normalizedType = PLATFORM_ANNOUNCEMENT_TYPE_MAP[type];
  const platformAnnouncementKey = `platform-ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  let targetAdmins = [];
  if (audience === "Admin") {
    if (!targetId)
      return next(new AppError("Please select a target admin", 400));
    const admin = await Admin.findOne({
      _id: targetId,
      isDeleted: false,
      isActive: true,
    });
    if (!admin)
      return next(
        new AppError("Selected admin was not found or is inactive", 404),
      );
    targetAdmins = [admin];
  } else {
    targetAdmins = await Admin.find({
      isDeleted: false,
      isActive: true,
    }).select("_id name email company");
  }

  if (targetAdmins.length === 0) {
    return next(
      new AppError("No active admins found for this announcement", 404),
    );
  }

  const announcementDocs = await Announcement.insertMany(
    targetAdmins.map((admin) => ({
      admin: admin._id,
      platformAnnouncementKey,
      platformTargetAdmin: audience === "Admin" ? admin._id : null,
      createdBy: null,
      createdByAdmin: true,
      title: title.trim(),
      message: message.trim(),
      type: normalizedType,
      expiryDate: expiryDate || null,
      targetType: audience === "Admin" ? "ROLE" : "ALL",
      targetRole: audience === "Admin" ? "ADMIN" : null,
      targetRoles: [],
    })),
    { ordered: false },
  );

  await Promise.all(
    announcementDocs.map((announcement) =>
      createNotificationDocsForAnnouncement(announcement, announcement.admin, {
        includeAdmin: true,
        includeUsers: audience === "All",
      }),
    ),
  );

  await AuditLog.create({
    performedBy: req.user._id,
    performerType: "SUPER_ADMIN",
    action: "ANNOUNCEMENT_SENT",
    targetModel: "Announcement",
    targetId: announcementDocs[0]._id,
    ipAddress: getClientIp(req),
    note: `Super Admin sent platform announcement to ${audience}`,
    after: {
      title: title.trim(),
      audience,
      targetAdmin: targetId || null,
      tenantCount: targetAdmins.length,
    },
  }).catch(() => {});

  const created = await Announcement.findById(announcementDocs[0]._id)
    .populate("platformTargetAdmin", "name email company")
    .populate("admin", "name email company")
    .lean();

  res.status(201).json(
    new ApiResponse(
      201,
      {
        announcement: formatPlatformAnnouncement(created),
        tenantCount: targetAdmins.length,
      },
      "Announcement sent successfully",
    ),
  );
});

exports.getAnnouncements = catchAsync(async (_req, res) => {
  const announcements = await Announcement.find({
    createdByAdmin: true,
    platformAnnouncementKey: { $ne: null },
  })
    .populate("platformTargetAdmin", "name email company")
    .populate("admin", "name email company")
    .sort({ createdAt: -1 })
    .lean();

  const grouped = new Map();
  announcements.forEach((announcement) => {
    const key =
      announcement.platformAnnouncementKey || String(announcement._id);
    if (!grouped.has(key)) grouped.set(key, announcement);
  });

  const rows = [...grouped.values()].map(formatPlatformAnnouncement);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        announcements: rows,
        total: rows.length,
        page: 1,
        pages: 1,
      },
      "Platform announcements retrieved successfully",
    ),
  );
});

/**
 * CREATE NEW ADMIN (TENANT)
 */
exports.createAdmin = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, companyName, userLimit, clientLimit } =
    req.body;

  if (!name || !email || !password) {
    return next(new AppError("Name, email, and password are required", 400));
  }

  // Check unique email
  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
  if (existingAdmin) {
    return next(new AppError("Email is already registered", 400));
  }

  const hashedPassword = await hashPassword(password);

  const newAdmin = await Admin.create({
    name,
    email,
    phone,
    password: hashedPassword,
    company: {
      name: companyName || "",
    },
    userLimit: userLimit || 40,
    clientLimit: clientLimit || 5000,
    superAdmin: req.user._id,
    isActive: true,
  });

  // Audit Log
  await AuditLog.create({
    performedBy: req.user._id,
    performerType: "SUPER_ADMIN",
    action: "ADMIN_CREATED",
    targetModel: "Admin",
    targetId: newAdmin._id,
    ipAddress: getClientIp(req),
    note: `Super Admin created tenant ${name}`,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, { admin: newAdmin }, "Admin created successfully"),
    );
});

/**
 * TOGGLE ADMIN STATUS
 */
exports.toggleAdminStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return next(new AppError("isActive boolean is required", 400));
  }

  const admin = await Admin.findOne({ _id: id, isDeleted: false });
  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  admin.isActive = isActive;
  await admin.save();

  // Audit Log
  await AuditLog.create({
    performedBy: req.user._id,
    performerType: "SUPER_ADMIN",
    action: isActive ? "ADMIN_UPDATED" : "ADMIN_DEACTIVATED",
    targetModel: "Admin",
    targetId: admin._id,
    ipAddress: getClientIp(req),
    note: `Super Admin ${isActive ? "activated" : "deactivated"} admin ${admin.name}`,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { admin },
        `Admin ${isActive ? "activated" : "deactivated"} successfully`,
      ),
    );
});

/**
 * GET SINGLE ADMIN
 */
exports.getAdminById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const admin = await Admin.findOne({ _id: id, isDeleted: false }).populate(
    "plan",
  );
  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  const departments = await Department.find({ admin: id, isDeleted: false });
  const users = await User.find({ admin: id, isDeleted: false });
  const projects = await Project.find({ admin: id, isDeleted: false })
    .populate("client", "name")
    .populate("assignedTo", "name");
  const payments = await Payment.find({ admin: id })
    .populate("client", "name")
    .populate("project", "name");

  const totalLeads = await Lead.countDocuments({
    admin: id,
    isDeleted: { $ne: true },
  });
  const activeLeads = await Lead.countDocuments({
    admin: id,
    isDeleted: { $ne: true },
    isDumped: { $ne: true },
    status: { $ne: "CONVERTED" },
  });
  const dumpLeads = await Lead.countDocuments({
    admin: id,
    isDeleted: { $ne: true },
    isDumped: true,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        admin,
        departments,
        users,
        projects,
        payments,
        totalLeads,
        activeLeads,
        dumpLeads,
      },
      "Admin details retrieved successfully",
    ),
  );
});

/**
 * GET ALL SUPER ADMIN SUPPORT TICKETS (From Admins)
 */
exports.getSupportTickets = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const skip = (page - 1) * limit;

  const tickets = await SuperAdminTicket.find()
    .populate("raisedBy", "name email company.name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await SuperAdminTicket.countDocuments();
  console.log("Ticket Count:", tickets.length);

  if (tickets.length > 0) {
    console.log("First Ticket:", JSON.stringify(tickets[0], null, 2));
  }
  res.status(200).json(
    new ApiResponse(
      200,
      {
        tickets,
        pagination: { total, page, pages: Math.ceil(total / limit) },
      },
      "Support tickets retrieved successfully",
    ),
  );
});

/**
 * UPDATE SUPPORT TICKET STATUS
 */
exports.updateTicketStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, resolutionMessage } = req.body;

  const ticket = await SuperAdminTicket.findById(id);
  if (!ticket) {
    return next(new AppError("Ticket not found", 404));
  }

  if (status) ticket.status = status.toUpperCase();
  if (resolutionMessage) {
    ticket.replies.push({
      senderType: "SUPER_ADMIN",
      senderId: req.user._id,
      message: resolutionMessage,
      createdAt: new Date(),
    });
    if (status === "RESOLVED") {
      ticket.resolvedAt = new Date();
    }
  }

  await ticket.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, { ticket }, "Ticket status updated successfully"),
    );
});

/**
 * CONTACT QUERIES
 */

exports.getQueries = catchAsync(async (req, res, next) => {
  const queries = await ContactQuery.find().sort({ createdAt: -1 }).lean();

  // Map to frontend structure
  const formattedQueries = queries.map((q) => ({
    id: q._id.toString(),
    name: q.name,
    company: q.company,
    email: q.email,
    phone: q.phone,
    message: q.message,
    status: q.status,
    date: formatDateOnly(q.createdAt),
  }));

  res
    .status(200)
    .json(
      new ApiResponse(200, formattedQueries, "Queries retrieved successfully"),
    );
});

exports.updateQueryStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Read", "Unread"].includes(status)) {
    return next(new AppError("Status must be Read or Unread", 400));
  }

  const query = await ContactQuery.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );

  if (!query) {
    return next(new AppError("Query not found", 404));
  }

  res
    .status(200)
    .json(new ApiResponse(200, query, `Query status updated to ${status}`));
});

exports.deleteQuery = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const query = await ContactQuery.findByIdAndDelete(id);

  if (!query) {
    return next(new AppError("Query not found", 404));
  }

  res.status(200).json(new ApiResponse(200, null, "Query deleted permanently"));
});

/**
 * GET SUPER ADMIN PROFILE
 */
exports.getProfile = catchAsync(async (req, res, next) => {
  const superAdmin = await SuperAdmin.findById(req.user._id).select(
    "-password",
  );
  console.log("GET PROFILE:", superAdmin);

  if (!superAdmin) {
    return next(new AppError("Super Admin not found", 404));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: superAdmin },
        "Super Admin profile retrieved successfully",
      ),
    );
});

/**
 * UPDATE SUPER ADMIN PROFILE
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, email } = req.body;
  const updates = {};
  const beforeState = {};
  const afterState = {};

  const superAdmin = await SuperAdmin.findById(req.user._id);

  if (!superAdmin) {
    return next(new AppError("Super Admin not found", 404));
  }

  if (name && name !== superAdmin.name) {
    beforeState.name = superAdmin.name;
    updates.name = name;
    afterState.name = name;
  }
  if (phone && phone !== superAdmin.phone) {
    beforeState.phone = superAdmin.phone;
    updates.phone = phone;
    afterState.phone = phone;
  }
  if (email && email.toLowerCase() !== superAdmin.email) {
    const normalizedEmail = email.toLowerCase();

    // Check if email exists in SuperAdmin collection
    const existing = await SuperAdmin.findOne({
      email: normalizedEmail,
      _id: { $ne: superAdmin._id },
    });

    if (existing) {
      return next(
        new AppError("Email is already in use by another account", 409),
      );
    }

    beforeState.email = superAdmin.email;
    updates.email = normalizedEmail;
    afterState.email = normalizedEmail;
  }
  console.log("Before update:", {
    name: superAdmin.name,
    phone: superAdmin.phone,
    email: superAdmin.email,
  });

  if (Object.keys(updates).length > 0) {
    Object.assign(superAdmin, updates);
    await superAdmin.save();
    console.log("After update:", {
      name: superAdmin.name,
      phone: superAdmin.phone,
      email: superAdmin.email,
    });
    await AuditLog.create({
      admin: null,
      performedBy: superAdmin._id,
      performerType: "SUPER_ADMIN",
      action: "PROFILE_UPDATED",
      targetModel: "SuperAdmin",
      targetId: superAdmin._id,
      ipAddress: getClientIp(req),
      note: "Super Admin updated profile details",
      changes: {
        before: beforeState,
        after: afterState,
      },
    });
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: superAdmin },
        "Profile updated successfully",
      ),
    );
});
