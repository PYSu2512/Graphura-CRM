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
  console.log("RESET TOKEN:", lookupToken);
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

module.exports = exports;
