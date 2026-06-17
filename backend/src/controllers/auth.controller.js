/**
 * AUTH CONTROLLER — Admin registration and authentication flows
 * Handles multi-step registration with email OTP verification
 * Production-level validation, error handling, and security
 */
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");
const { generateOTP, OTP_EXPIRY } = require("../utils/generateOTP");
const {
  sendOTPEmail,
  sendRegistrationConfirmationEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
} = require("../services/email.service");
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
} = require("../services/auth.service");
const {
  Admin,
  AdminLoginLog,
  EmailVerification,
  RefreshToken,
  TokenBlacklist,
  Department,
  InvoiceCounter,
  LoginAttempt,
  User,
  PasswordReset,
  AuditLog,
  SuperAdmin,
} = require("../models/index");
const logger = require("../utils/logger");
const { generateResetToken } = require("../utils/tokenGenerator");
const bcrypt = require("bcryptjs");

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

// ────────────────────────────────────────────────────────────
// STEP 1: Send OTP to Email
// ────────────────────────────────────────────────────────────
/**
 * Send OTP email for registration
 * Prevents re-use within cooldown period
 */
exports.sendOTP = catchAsync(async (req, res, next) => {
  const { email, adminName } = req.body;

  // Check if email is already registered as Admin
  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
  if (existingAdmin) {
    return next(
      new AppError("Email is already registered. Please sign in instead.", 409),
    );
  }

  // Check if OTP already sent recently (cooldown: 2 minutes)
  const recentOTP = await EmailVerification.findOne({
    email: email.toLowerCase(),
    createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) }, // Within 2 minutes
  });

  if (recentOTP) {
    return next(
      new AppError(
        "OTP already sent. Please check your email or wait 2 minutes before requesting a new one.",
        429,
      ),
    );
  }

  // Generate OTP
  const otp = generateOTP();
  logger.debug(`Generated OTP for ${email}: ${otp}`);

  // Store OTP in database (TTL will auto-delete after 10 minutes)
  await EmailVerification.updateOne(
    { email: email.toLowerCase() },
    {
      email: email.toLowerCase(),
      otp,
      attempts: 0,
      isVerified: false,
    },
    { upsert: true },
  );

  // Send OTP email
  try {
    await sendOTPEmail(email.toLowerCase(), otp, adminName || "Admin");
    logger.info(`OTP email sent to ${email}`);
  } catch (emailError) {
    logger.error("Email sending failed", emailError.message);
    return next(
      new AppError("Failed to send OTP. Please try again later.", 500),
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: email.toLowerCase() },
        "OTP sent successfully",
      ),
    );
});

// ────────────────────────────────────────────────────────────
// STEP 2: Verify OTP
// ────────────────────────────────────────────────────────────
/**
 * Verify OTP entered by user
 * Prevents brute force with attempt limits
 */
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  // Find OTP record
  const verification = await EmailVerification.findOne({
    email: email.toLowerCase(),
  });

  if (!verification) {
    return next(
      new AppError("OTP expired or not found. Please request a new OTP.", 400),
    );
  }

  // Check if OTP is already verified (one-time use)
  if (verification.isVerified) {
    return next(
      new AppError("This OTP has already been used. Request a new one.", 400),
    );
  }

  // Check attempt limit (max 5 attempts)
  if (verification.attempts >= 5) {
    await EmailVerification.deleteOne({ email: email.toLowerCase() });
    return next(
      new AppError("Too many failed attempts. Please request a new OTP.", 429),
    );
  }

  // Verify OTP
  if (verification.otp !== otp) {
    verification.attempts += 1;
    await verification.save();
    return next(
      new AppError(
        `Invalid OTP. ${5 - verification.attempts} attempts remaining.`,
        400,
      ),
    );
  }

  // Mark as verified
  verification.isVerified = true;
  await verification.save();
  logger.info(`OTP verified for ${email}`);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: email.toLowerCase(), verified: true },
        "OTP verified successfully",
      ),
    );
});

// ────────────────────────────────────────────────────────────
// STEP 3: Create Admin Account
// ────────────────────────────────────────────────────────────
/**
 * Complete registration and create Admin account
 * Creates default departments and invoice counter
 * Sets up multi-tenant structure
 */
exports.registerAdmin = catchAsync(async (req, res, next) => {
  const {
    companyName,
    companyEmail,
    companyPhone,
    companyAddress,
    adminName,
    ownerName,
    adminEmail,
    adminPhone,
    password,
  } = req.body;

  const resolvedAdminName = (adminName || ownerName || "").trim();
  const resolvedAdminEmail = (adminEmail || companyEmail || "").toLowerCase();
  const resolvedAdminPhone = adminPhone || companyPhone;

  if (!resolvedAdminName) {
    return next(new AppError("Admin/Owner name is required.", 400));
  }

  if (!resolvedAdminEmail) {
    return next(new AppError("Admin email is required.", 400));
  }

  const normalizedEmail = resolvedAdminEmail;
  const normalizedCompanyEmail = companyEmail.toLowerCase();

  // Verify email is OTP-verified
  const verification = await EmailVerification.findOne({
    email: normalizedEmail,
    isVerified: true,
  });

  if (!verification) {
    return next(
      new AppError("Email not verified. Please verify OTP first.", 400),
    );
  }

  // Double-check email is not already registered
  const existingAdmin = await Admin.findOne({ email: normalizedEmail });
  if (existingAdmin) {
    return next(new AppError("Email already registered.", 409));
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create Admin document
  const admin = new Admin({
    name: resolvedAdminName,
    email: normalizedEmail,
    password: hashedPassword,
    phone: resolvedAdminPhone,
    company: {
      name: companyName,
      email: normalizedCompanyEmail,
      phone: companyPhone,
      address: companyAddress ? { line1: companyAddress } : undefined,
    },
    isActive: true,
    isProfileComplete: false,
    planStatus: "TRIAL",
    userLimit: 40, // Default user limit
    clientLimit: 6000, // Default client/lead limit
  });

  await admin.save();
  logger.info(`New Admin registered: ${normalizedEmail}`);

  // ──────────────────────────────────────────────────────────────
  // AUTO-SETUP: Create Default Departments
  // ──────────────────────────────────────────────────────────────
  const defaultDepts = [
    { name: "SALES", displayName: "Sales Department", isDefault: true },
    { name: "FINANCE", displayName: "Finance Department", isDefault: true },
    {
      name: "MANAGEMENT",
      displayName: "Management Department",
      isDefault: true,
    },
  ];

  const deptData = defaultDepts.map((d) => ({
    ...d,
    admin: admin._id,
  }));

  await Department.insertMany(deptData);
  logger.info(`Default departments created for admin: ${admin._id}`);

  // ──────────────────────────────────────────────────────────────
  // AUTO-SETUP: Create Invoice Counter
  // ──────────────────────────────────────────────────────────────
  await InvoiceCounter.create({
    admin: admin._id,
    seq: 0,
    prefix: "INV",
  });
  logger.info(`Invoice counter created for admin: ${admin._id}`);

  // ──────────────────────────────────────────────────────────────
  // Generate Tokens
  // ──────────────────────────────────────────────────────────────
  const accessToken = generateAccessToken({
    id: admin._id,
    email: admin.email,
    role: "ADMIN",
    type: "ADMIN",
  });

  const refreshToken = generateRefreshToken({
    id: admin._id,
    email: admin.email,
    role: "ADMIN",
    type: "ADMIN",
  });

  // Store refresh token in database
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

  await RefreshToken.create({
    token: refreshToken,
    holderType: "ADMIN",
    holderId: admin._id,
    expiresAt: refreshTokenExpiry,
  });

  // ──────────────────────────────────────────────────────────────
  // Send Confirmation Email (async, don't wait)
  // ──────────────────────────────────────────────────────────────
  sendRegistrationConfirmationEmail(
    normalizedEmail,
    resolvedAdminName,
    companyName,
  ).catch((err) =>
    logger.error("Failed to send confirmation email", err.message),
  );

  // ──────────────────────────────────────────────────────────────
  // Delete OTP record
  // ──────────────────────────────────────────────────────────────
  await EmailVerification.deleteOne({ email: normalizedEmail });

  // ──────────────────────────────────────────────────────────────
  // Response
  // ──────────────────────────────────────────────────────────────
  res.status(201).json(
    new ApiResponse(
      201,
      {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          company: admin.company.name,
        },
        accessToken,
        refreshToken,
      },
      "Registration successful. Welcome to Graphura CRM!",
    ),
  );
});

// ────────────────────────────────────────────────────────────
// RESEND OTP
// ────────────────────────────────────────────────────────────
/**
 * Resend OTP if user didn't receive it
 */
exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email, adminName } = req.body;

  // Delete old OTP
  await EmailVerification.deleteOne({ email: email.toLowerCase() });

  // Generate new OTP
  const otp = generateOTP();

  // Store new OTP
  await EmailVerification.create({
    email: email.toLowerCase(),
    otp,
    attempts: 0,
    isVerified: false,
  });

  // Send OTP email
  try {
    await sendOTPEmail(email.toLowerCase(), otp, adminName || "Admin");
  } catch (emailError) {
    return next(
      new AppError("Failed to send OTP. Please try again later.", 500),
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: email.toLowerCase() },
        "OTP resent successfully",
      ),
    );
});

// ────────────────────────────────────────────────────────────
// ADMIN LOGIN
// ────────────────────────────────────────────────────────────
exports.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password, latitude, longitude, rememberMe = false } = req.body;

  const normalizedEmail = email.toLowerCase().trim();
  const ipAddress = getClientIp(req);
  const userAgent = req.get("user-agent") || "unknown";

  if (latitude === undefined || longitude === undefined) {
    return next(
      new AppError("Location permission is required to continue.", 403),
    );
  }

  const blockRecord = await LoginAttempt.findOne({
    identifier: normalizedEmail,
    identifierType: "EMAIL",
  });

  if (
    blockRecord?.isBlocked &&
    blockRecord.blockedUntil &&
    blockRecord.blockedUntil > new Date()
  ) {
    return next(
      new AppError("Too many failed attempts. Please try again later.", 429),
    );
  }

  const admin = await Admin.findOne({
    email: normalizedEmail,
    isDeleted: false,
  });

  if (!admin) {
    await LoginAttempt.updateOne(
      { identifier: normalizedEmail, identifierType: "EMAIL" },
      {
        $set: {
          identifier: normalizedEmail,
          identifierType: "EMAIL",
          ipAddress,
          userAgent,
          lastAttemptAt: new Date(),
        },
        $inc: { attempts: 1 },
      },
      { upsert: true },
    );
    return next(new AppError("Invalid email or password.", 401));
  }

  if (!admin.isActive) {
    await AdminLoginLog.create({
      admin: admin._id,
      email: normalizedEmail,
      role: "ADMIN",
      ipAddress,
      latitude,
      longitude,
      userAgent,
      device: userAgent,
      isSuccess: false,
      failReason: "ADMIN_DEACTIVATED",
      loginAt: new Date(),
    });
    return next(
      new AppError("Your account is deactivated. Contact support.", 403),
    );
  }

  const isPasswordValid = await comparePassword(password, admin.password);
  if (!isPasswordValid) {
    const updatedAttempt = await LoginAttempt.findOneAndUpdate(
      { identifier: normalizedEmail, identifierType: "EMAIL" },
      {
        $set: {
          identifier: normalizedEmail,
          identifierType: "EMAIL",
          ipAddress,
          userAgent,
          lastAttemptAt: new Date(),
        },
        $inc: { attempts: 1 },
      },
      { new: true, upsert: true },
    );

    if (updatedAttempt.attempts >= 5) {
      updatedAttempt.isBlocked = true;
      updatedAttempt.blockReason = "TOO_MANY_ATTEMPTS";
      updatedAttempt.blockedAt = new Date();
      updatedAttempt.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await updatedAttempt.save();
    }

    await AdminLoginLog.create({
      admin: admin._id,
      email: normalizedEmail,
      role: "ADMIN",
      ipAddress,
      latitude,
      longitude,
      userAgent,
      device: userAgent,
      isSuccess: false,
      failReason: "INVALID_CREDENTIALS",
      loginAt: new Date(),
    });

    return next(new AppError("Invalid email or password.", 401));
  }

  await LoginAttempt.deleteOne({
    identifier: normalizedEmail,
    identifierType: "EMAIL",
  });

  const accessToken = generateAccessToken({
    id: admin._id,
    email: admin.email,
    role: "ADMIN",
    type: "ADMIN",
  });

  const refreshToken = generateRefreshToken({
    id: admin._id,
    email: admin.email,
    role: "ADMIN",
    type: "ADMIN",
  });

  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(
    refreshTokenExpiry.getDate() + (rememberMe ? 30 : 7),
  );

  await RefreshToken.create({
    token: refreshToken,
    holderType: "ADMIN",
    holderId: admin._id,
    admin: admin._id,
    expiresAt: refreshTokenExpiry,
    ipAddress,
    userAgent,
  });

  await AdminLoginLog.create({
    admin: admin._id,
    email: normalizedEmail,
    role: "ADMIN",
    ipAddress,
    latitude,
    longitude,
    userAgent,
    device: userAgent,
    isSuccess: true,
    loginAt: new Date(),
  });

  logger.info(`Admin login success: ${normalizedEmail}`);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          company: admin.company?.name || "",
          role: "ADMIN",
        },
        accessToken,
        refreshToken,
      },
      "Login successful",
    ),
  );
});

// ────────────────────────────────────────────────────────────
// LOGOUT
// ────────────────────────────────────────────────────────────
/**
 * Logout endpoint
 * - Blacklists the provided access token
 * - Revokes refresh tokens for the holder
 * Accepts access token in `Authorization: Bearer <token>` header
 * Optionally accepts `refreshToken` via query param or header `x-refresh-token`
 */
exports.logout = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const accessToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  const refreshToken =
    req.headers["x-refresh-token"] ||
    req.query.refreshToken ||
    req.body?.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(200).json(new ApiResponse(200, null, "Logged out"));
  }

  let decoded = null;
  try {
    if (accessToken) decoded = verifyAccessToken(accessToken);
  } catch (err) {
    decoded = null;
  }

  if (accessToken && decoded && decoded.exp) {
    const expiresAt = new Date(decoded.exp * 1000);
    try {
      await TokenBlacklist.create({
        token: accessToken,
        holderType: decoded.type || "ADMIN",
        holderId: decoded.id,
        reason: "LOGOUT",
        expiresAt,
      });
    } catch (e) {
      // ignore duplicate/index errors
    }
  }

  if (refreshToken) {
    await RefreshToken.updateOne(
      { token: refreshToken },
      {
        $set: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: "LOGOUT",
        },
      },
    );
  } else if (decoded && decoded.id) {
    await RefreshToken.updateMany(
      { holderId: decoded.id },
      {
        $set: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: "LOGOUT",
        },
      },
    );
  }

  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

// ────────────────────────────────────────────────────────────
// FORGET PASSWORD
// ────────────────────────────────────────────────────────────
exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const ipAddress = getClientIp(req);
  const userAgent = req.get("user-agent") || "unknown";

  // 1. Find user (or Admin, though plan says except SuperAdmin. Assuming User model as per schema `userId: { ref: 'User' }`)
  // To support both Admin and User, we can check both, but the plan focused on User. We'll search User first.
  let user = await User.findOne({ email: normalizedEmail, isDeleted: false });
  let isUser = true;

  if (!user) {
    // Try Admin
    user = await Admin.findOne({ email: normalizedEmail, isDeleted: false });
    isUser = false;
  }

  // Email Enumeration Protection: Always return success even if user not found
  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "If that email exists, a reset link has been sent.",
        ),
      );
  }

  // 2. Generate Token
  const { rawToken, hashedToken } = await generateResetToken();

  // 3. Save to DB
  // Invalidate any existing unused tokens for this user
  await PasswordReset.updateMany(
    { userId: user._id, isUsed: false },
    { $set: { isUsed: true, usedAt: new Date() } },
  );

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
  await PasswordReset.create({
    userId: user._id,
    email: normalizedEmail,
    token: hashedToken,
    expiresAt,
    ipAddress,
    userAgent,
  });

  // 4. Send Email
  // Construct token string as `userId.rawToken` to allow fast lookup later
  const lookupToken = `${user._id.toString()}.${rawToken}`;
  await sendPasswordResetEmail(normalizedEmail, lookupToken, user.name);

  // 5. Audit Log
  await AuditLog.create({
    admin: isUser ? user.admin : user._id,
    performedBy: user._id,
    performerType: isUser ? "USER" : "ADMIN",
    action: "PASSWORD_CHANGED", // Close enough, or add a new action like PASSWORD_RESET_REQUESTED
    targetModel: isUser ? "User" : "Admin",
    targetId: user._id,
    ipAddress,
    note: "Password reset requested",
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "If that email exists, a reset link has been sent.",
      ),
    );
});

// ────────────────────────────────────────────────────────────
// VERIFY RESET TOKEN
// ────────────────────────────────────────────────────────────
exports.verifyResetToken = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token || !token.includes(".")) {
    return next(new AppError("Invalid or expired reset link", 400));
  }

  const [userId, rawToken] = token.split(".");

  const resetRecord = await PasswordReset.findOne({
    userId,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    return next(new AppError("Invalid or expired reset link", 400));
  }

  if (resetRecord.attemptCount >= 3) {
    return next(
      new AppError("Too many failed attempts. Please request a new link.", 400),
    );
  }

  // Verify bcrypt hash
  const isValid = await bcrypt.compare(rawToken, resetRecord.token);

  if (!isValid) {
    resetRecord.attemptCount += 1;
    await resetRecord.save();
    return next(new AppError("Invalid or expired reset link", 400));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: resetRecord.email, tokenValid: true },
        "Token is valid",
      ),
    );
});

// ────────────────────────────────────────────────────────────
// RESET PASSWORD
// ────────────────────────────────────────────────────────────
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, newPassword } = req.body;
  const ipAddress = getClientIp(req);

  if (!token || !token.includes(".")) {
    return next(new AppError("Invalid or expired reset link", 400));
  }

  const [userId, rawToken] = token.split(".");

  const resetRecord = await PasswordReset.findOne({
    userId,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    return next(new AppError("Invalid or expired reset link", 400));
  }

  if (resetRecord.attemptCount >= 3) {
    return next(
      new AppError("Too many failed attempts. Please request a new link.", 400),
    );
  }

  const isValid = await bcrypt.compare(rawToken, resetRecord.token);

  if (!isValid) {
    resetRecord.attemptCount += 1;
    await resetRecord.save();
    return next(new AppError("Invalid or expired reset link", 400));
  }

  // Find User or Admin
  let user = await User.findById(userId);
  let isUser = true;
  if (!user) {
    user = await Admin.findById(userId);
    isUser = false;
  }

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Current password check
  const isSameAsCurrent = await comparePassword(newPassword, user.password);
  if (isSameAsCurrent) {
    return next(
      new AppError(
        "New password cannot be the same as your current password",
        422,
      ),
    );
  }

  // Password history check (only for User as per Schema changes, Admin schema doesn't have it unless added)
  if (isUser && user.passwordHistory && user.passwordHistory.length > 0) {
    for (const past of user.passwordHistory) {
      const isReused = await bcrypt.compare(newPassword, past.hash);
      if (isReused) {
        return next(new AppError("Cannot reuse a recently used password", 422));
      }
    }
  }

  // Hash new password
  const newHashedPassword = await hashPassword(newPassword);

  // Update User
  user.password = newHashedPassword;

  if (isUser) {
    user.lastPasswordResetAt = new Date();
    user.passwordResetCount = (user.passwordResetCount || 0) + 1;

    // Add to history and maintain max 5
    user.passwordHistory.unshift({
      hash: newHashedPassword,
      changedAt: new Date(),
    });
    if (user.passwordHistory.length > 5) {
      user.passwordHistory = user.passwordHistory.slice(0, 5);
    }
  }

  await user.save();

  // Mark token as used
  resetRecord.isUsed = true;
  resetRecord.usedAt = new Date();
  await resetRecord.save();

  // Send confirmation email
  await sendPasswordResetConfirmationEmail(user.email, user.name);

  // Invalidate all Refresh Tokens (forces logout everywhere)
  await RefreshToken.updateMany(
    { holderId: user._id },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: "PASSWORD_CHANGED",
      },
    },
  );

  // Audit Log
  await AuditLog.create({
    admin: isUser ? user.admin : user._id,
    performedBy: user._id,
    performerType: isUser ? "USER" : "ADMIN",
    action: "PASSWORD_CHANGED",
    targetModel: isUser ? "User" : "Admin",
    targetId: user._id,
    ipAddress,
    note: "Password reset successfully completed",
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { redirectUrl: "/login" },
        "Password reset successfully",
      ),
    );
});

// ────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ────────────────────────────────────────────────────────────
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const ipAddress = getClientIp(req);

  // 1. Fetch authenticated account based on userType
  let account;
  if (req.userType === "USER") {
    account = await User.findOne({
      _id: req.user._id,
      isDeleted: false,
      isActive: true,
    });
  } else if (req.userType === "ADMIN") {
    account = await Admin.findOne({
      _id: req.user._id,
      isDeleted: false,
      isActive: true,
    });
  } else if (req.userType === "SUPER_ADMIN") {
    account = await SuperAdmin.findOne({ _id: req.user._id, isActive: true });
  }

  if (!account) {
    return next(new AppError("Account not found or inactive", 404));
  }

  // 2. Verify current password
  const isCurrentPasswordValid = await comparePassword(
    currentPassword,
    account.password,
  );

  if (!isCurrentPasswordValid) {
    return next(new AppError("Current password is incorrect", 422));
  }

  // 3. Prevent password reuse
  const isSameAsCurrent = await comparePassword(newPassword, account.password);
  if (isSameAsCurrent) {
    return next(
      new AppError(
        "New password cannot be the same as your current password",
        422,
      ),
    );
  }

  // 4. Hash new password
  const newHashedPassword = await hashPassword(newPassword);

  // 5. User-Specific Logic (Password History, etc)
  if (req.userType === "USER") {
    if (account.passwordHistory && account.passwordHistory.length > 0) {
      for (const past of account.passwordHistory) {
        const isReused = await bcrypt.compare(newPassword, past.hash);
        if (isReused) {
          return next(
            new AppError("Cannot reuse a recently used password", 422),
          );
        }
      }
    }

    account.mustChangePassword = false;
    account.isFirstLogin = false;
    account.lastPasswordResetAt = new Date();
    account.passwordResetCount = (account.passwordResetCount || 0) + 1;

    if (!account.passwordHistory) {
      account.passwordHistory = [];
    }
    account.passwordHistory.unshift({
      hash: newHashedPassword,
      changedAt: new Date(),
    });
    if (account.passwordHistory.length > 5) {
      account.passwordHistory = account.passwordHistory.slice(0, 5);
    }
  }

  // 6. Update password
  account.password = newHashedPassword;
  await account.save();

  // 7. Revoke Refresh Tokens dynamically
  await RefreshToken.updateMany(
    {
      holderId: account._id,
      holderType: req.userType,
      isRevoked: false,
    },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: "PASSWORD_CHANGED",
      },
    },
  );

  // 8. Audit Log dynamically
  let targetModel;
  let adminRef = null;

  if (req.userType === "USER") {
    targetModel = "User";
    adminRef = account.admin;
  } else if (req.userType === "ADMIN") {
    targetModel = "Admin";
    adminRef = account._id;
  } else if (req.userType === "SUPER_ADMIN") {
    targetModel = "SuperAdmin";
    adminRef = null;
  }

  await AuditLog.create({
    admin: adminRef,
    performedBy: account._id,
    performerType: req.userType,
    action: "PASSWORD_CHANGED",
    targetModel: targetModel,
    targetId: account._id,
    ipAddress: req.ip || ipAddress,
    note: "Password changed from profile settings",
  });

  // 9. Response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        forceLogout: true,
      },
      "Password changed successfully. Please login again.",
    ),
  );
});

// ────────────────────────────────────────────────────────────
// FORGOT PASSWORD — OTP FLOW (Admin + Department Users)
// ────────────────────────────────────────────────────────────
//
// Flow:
//   Step 1: POST /api/auth/forgot-password/send-otp  → send 6-digit OTP to email
//   Step 2: POST /api/auth/forgot-password/verify-otp → verify OTP, return session token
//   Step 3: POST /api/auth/forgot-password/reset      → set new password using session token
//
// Rules:
//   - Works for Admin AND department User accounts (not SuperAdmin)
//   - Max 2 password resets per calendar month
//   - OTP: 6 digits, bcrypt-hashed in DB, 10-minute TTL
//   - OTP max 5 attempts before invalidation
//   - Resend cooldown: 2 minutes
//   - New password cannot match current or last 5 passwords
// ────────────────────────────────────────────────────────────

/**
 * Helper: count resets this calendar month
 */
const countResetsThisMonth = (account) => {
  if (!account.lastPasswordResetAt) return 0;
  const last = new Date(account.lastPasswordResetAt);
  const now = new Date();
  const sameMonth = last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear();
  if (!sameMonth) return 0;
  return account.passwordResetCount || 0;
};

/**
 * STEP 1 — Send OTP
 * POST /api/auth/forgot-password/send-otp
 * Body: { email }
 */
exports.forgotPasswordSendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email?.trim()) return next(new AppError('Email is required', 400));

  const normalizedEmail = email.toLowerCase().trim();
  const ipAddress = getClientIp(req);
  const userAgent = req.get('user-agent') || 'unknown';

  // Find account — Admin or User
  let account = await User.findOne({ email: normalizedEmail, isDeleted: false, isActive: true });
  let holderType = 'USER';
  if (!account) {
    account = await Admin.findOne({ email: normalizedEmail, isDeleted: false, isActive: true });
    holderType = 'ADMIN';
  }

  // Email enumeration protection — always return success
  if (!account) {
    return res.status(200).json(new ApiResponse(200, null, 'If that email is registered, you will receive an OTP shortly.'));
  }

  // Check monthly reset limit (max 2 per calendar month)
  const resetsThisMonth = countResetsThisMonth(account);
  if (resetsThisMonth >= 2) {
    return next(new AppError('You have reached the maximum of 2 password resets per month. Please contact your administrator.', 429));
  }

  // Resend cooldown — 2 minutes
  const recent = await PasswordReset.findOne({
    userId:   account._id,
    isUsed:   false,
    expiresAt: { $gt: new Date() },
    createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) },
  });
  if (recent) {
    return next(new AppError('OTP already sent. Please wait 2 minutes before requesting a new one.', 429));
  }

  // Generate 6-digit OTP
  const rawOTP = String(Math.floor(100000 + Math.random() * 900000));
  const hashedOTP = await bcrypt.hash(rawOTP, 10);

  // Invalidate any existing unused OTPs for this user
  await PasswordReset.updateMany(
    { userId: account._id, isUsed: false },
    { $set: { isUsed: true, usedAt: new Date() } },
  );

  // Save new OTP record (expires in 10 minutes)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await PasswordReset.create({
    userId:     account._id,
    email:      normalizedEmail,
    token:      hashedOTP,     // store hashed OTP in `token` field
    expiresAt,
    ipAddress,
    userAgent,
    attemptCount: 0,
  });

  // Send OTP email
  const { sendPasswordResetOTPEmail } = require('../services/email.service');
  try {
    await sendPasswordResetOTPEmail(normalizedEmail, rawOTP, account.name || 'User');
  } catch (emailErr) {
    logger.error('Forgot password OTP email failed', emailErr.message);
    return next(new AppError('Failed to send OTP email. Please try again.', 500));
  }

  logger.info(`Forgot-password OTP sent to ${normalizedEmail} [${holderType}]`);

  res.status(200).json(new ApiResponse(200, { email: normalizedEmail }, 'OTP sent to your registered email address.'));
});

/**
 * STEP 2 — Verify OTP
 * POST /api/auth/forgot-password/verify-otp
 * Body: { email, otp }
 * Returns: { resetToken } — short-lived session token for Step 3
 */
exports.forgotPasswordVerifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email?.trim() || !otp?.trim()) return next(new AppError('Email and OTP are required', 400));

  const normalizedEmail = email.toLowerCase().trim();

  const record = await PasswordReset.findOne({
    email:    normalizedEmail,
    isUsed:   false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    return next(new AppError('OTP has expired or is invalid. Please request a new one.', 400));
  }

  if (record.attemptCount >= 5) {
    record.isUsed = true;
    await record.save();
    return next(new AppError('Too many failed attempts. Please request a new OTP.', 429));
  }

  const isValid = await bcrypt.compare(otp.trim(), record.token);
  if (!isValid) {
    record.attemptCount += 1;
    await record.save();
    const remaining = 5 - record.attemptCount;
    return next(new AppError(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, 400));
  }

  // OTP verified — generate a short-lived reset session token (valid 15 min)
  // We reuse the PasswordReset doc: mark verified but NOT used yet
  const { generateResetToken } = require('../utils/tokenGenerator');
  const { rawToken, hashedToken } = await generateResetToken();
  record.token = hashedToken;      // replace OTP hash with session token hash
  record.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min window
  record.attemptCount = 0;
  await record.save();

  // Build a lookup key: userId.rawToken (same pattern as existing resetPassword)
  const sessionToken = `${record.userId.toString()}.${rawToken}`;

  logger.info(`Forgot-password OTP verified for ${normalizedEmail}`);

  res.status(200).json(new ApiResponse(200, {
    resetToken: sessionToken,
    email:      normalizedEmail,
  }, 'OTP verified. You may now reset your password.'));
});

/**
 * STEP 3 — Reset Password
 * POST /api/auth/forgot-password/reset
 * Body: { resetToken, newPassword }
 */
exports.forgotPasswordReset = catchAsync(async (req, res, next) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken?.trim() || !newPassword?.trim()) {
    return next(new AppError('Reset token and new password are required', 400));
  }
  if (newPassword.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }

  const ipAddress = getClientIp(req);

  if (!resetToken.includes('.')) {
    return next(new AppError('Invalid or expired reset session. Please start again.', 400));
  }

  const [userId, rawToken] = resetToken.split('.');

  const record = await PasswordReset.findOne({
    userId,
    isUsed:   false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    return next(new AppError('Reset session has expired. Please start the process again.', 400));
  }

  const isValid = await bcrypt.compare(rawToken, record.token);
  if (!isValid) {
    return next(new AppError('Invalid reset session. Please start again.', 400));
  }

  // Find account
  let account = await User.findById(userId);
  let isUserAccount = true;
  if (!account) {
    account = await Admin.findById(userId);
    isUserAccount = false;
  }
  if (!account) return next(new AppError('Account not found', 404));

  // Check monthly limit
  const resetsThisMonth = countResetsThisMonth(account);
  if (resetsThisMonth >= 2) {
    return next(new AppError('Monthly password reset limit (2) reached. Contact your administrator.', 429));
  }

  // Cannot reuse current password
  const isSameCurrent = await comparePassword(newPassword, account.password);
  if (isSameCurrent) {
    return next(new AppError('New password cannot be the same as your current password.', 422));
  }

  // Password history check (Users only)
  if (isUserAccount && account.passwordHistory?.length > 0) {
    for (const past of account.passwordHistory) {
      const reused = await bcrypt.compare(newPassword, past.hash);
      if (reused) return next(new AppError('Cannot reuse a recently used password.', 422));
    }
  }

  const newHashedPassword = await hashPassword(newPassword);
  account.password = newHashedPassword;

  if (isUserAccount) {
    account.mustChangePassword = false;
    account.isFirstLogin = false;
    account.lastPasswordResetAt = new Date();
    // Increment monthly count — only track within calendar month
    const lastReset = account.lastPasswordResetAt ? new Date(account.lastPasswordResetAt) : null;
    const now = new Date();
    const inSameMonth = lastReset &&
      lastReset.getMonth() === now.getMonth() &&
      lastReset.getFullYear() === now.getFullYear();
    account.passwordResetCount = inSameMonth ? (account.passwordResetCount || 0) + 1 : 1;
    account.lastPasswordResetAt = now;

    if (!account.passwordHistory) account.passwordHistory = [];
    account.passwordHistory.unshift({ hash: newHashedPassword, changedAt: now });
    if (account.passwordHistory.length > 5) account.passwordHistory = account.passwordHistory.slice(0, 5);
  } else {
    // Admin — track reset count too
    const now = new Date();
    const lastReset = account.lastPasswordResetAt ? new Date(account.lastPasswordResetAt) : null;
    const inSameMonth = lastReset &&
      lastReset.getMonth() === now.getMonth() &&
      lastReset.getFullYear() === now.getFullYear();
    account.passwordResetCount = inSameMonth ? (account.passwordResetCount || 0) + 1 : 1;
    account.lastPasswordResetAt = now;
  }

  await account.save();

  // Mark record as used
  record.isUsed = true;
  record.usedAt = new Date();
  await record.save();

  // Revoke all active refresh tokens (force re-login everywhere)
  await RefreshToken.updateMany(
    { holderId: account._id, isRevoked: false },
    { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: 'PASSWORD_CHANGED' } },
  );

  // Send confirmation email (async, non-blocking)
  const { sendPasswordResetConfirmationEmail } = require('../services/email.service');
  sendPasswordResetConfirmationEmail(account.email, account.name || 'User').catch(() => {});

  // Audit log
  await AuditLog.create({
    admin:         isUserAccount ? account.admin : account._id,
    performedBy:   account._id,
    performerType: isUserAccount ? 'USER' : 'ADMIN',
    action:        'PASSWORD_CHANGED',
    targetModel:   isUserAccount ? 'User' : 'Admin',
    targetId:      account._id,
    ipAddress,
    note:          'Password reset via forgot-password OTP flow',
  }).catch(() => {});

  logger.info(`Password reset successful for ${account.email}`);

  res.status(200).json(new ApiResponse(200, { redirectUrl: '/login' }, 'Password reset successfully. Please sign in with your new password.'));
});

module.exports = exports;
