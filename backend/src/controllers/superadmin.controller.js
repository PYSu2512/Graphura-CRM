const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");
const {
  SuperAdmin,
  SuperAdminLoginLog,
  AdminLoginLog,
  Admin,
  AuditLog,
  SuperAdminTicket,
  Department,
  User,
  Project,
  Payment,
  Lead,
} = require("../models/index");
const {
  comparePassword,
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
} = require("../services/auth.service");

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
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

  const admin = await Admin.findOne({ _id: id, isDeleted: false }).populate("plan");
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

  const totalLeads = await Lead.countDocuments({ admin: id, isDeleted: { $ne: true } });
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
