/**
 * AUTH MIDDLEWARE — Admin JWT verification
 * 1. Reads Bearer token from Authorization header
 * 2. Verifies JWT signature and expiry
 * 3. Checks TokenBlacklist (handles logout / forced invalidation)
 * 4. Loads Admin document and confirms account is active
 * 5. Attaches req.admin for downstream controllers
 */
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { verifyAccessToken } = require('../services/auth.service');
const { Admin, TokenBlacklist } = require('../models');

/**
 * Middleware: require a valid Admin JWT
 * Use on any route that is Admin-only.
 */
exports.requireAdmin = catchAsync(async (req, _res, next) => {
  // ── 1. Extract token ──────────────────────────────────────
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please provide a Bearer token.', 401));
  }
  const token = authHeader.split(' ')[1];

  // ── 2. Verify JWT signature / expiry ──────────────────────
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // Only Admin tokens are accepted on this middleware
  if (decoded.type !== 'ADMIN') {
    return next(new AppError('This resource requires an Admin account.', 403));
  }

  // ── 3. Check TokenBlacklist ───────────────────────────────
  const blacklisted = await TokenBlacklist.findOne({ token });
  if (blacklisted) {
    return next(new AppError('Token has been invalidated. Please log in again.', 401));
  }

  // ── 4. Load Admin from DB ─────────────────────────────────
  const admin = await Admin.findOne({ _id: decoded.id, isDeleted: false, isActive: true });
  if (!admin) {
    return next(new AppError('Admin account not found or has been deactivated.', 401));
  }

  // ── 5. Attach to request ──────────────────────────────────
  req.admin = admin;
  next();
});

// Backward-compatible alias (old routes that imported requireAuth still work)
exports.requireAuth = exports.requireAdmin;

/**
 * Middleware: require a valid User JWT (for non-admin users like TLs, Executives)
 * Sets req.user and req.admin for downstream controllers.
 */
exports.requireUser = catchAsync(async (req, _res, next) => {
  const { User } = require('../models');

  // ── 1. Extract token ──────────────────────────────────────
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please provide a Bearer token.', 401));
  }
  const token = authHeader.split(' ')[1];

  // ── 2. Verify JWT signature / expiry ──────────────────────
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // Ensure this is a USER token
  if (decoded.type !== 'USER') {
    return next(new AppError('This resource requires a User account.', 403));
  }

  // ── 3. Check TokenBlacklist ───────────────────────────────
  // (Optional, implement if user tokens are blacklisted)

  // ── 4. Load User from DB ──────────────────────────────────
  const user = await User.findOne({ _id: decoded.id, isDeleted: false, isActive: true }).populate('admin');
  if (!user) {
    return next(new AppError('User account not found or has been deactivated.', 401));
  }

  // ── 5. Attach to request ──────────────────────────────────
  req.user = user;
  req.admin = user.admin; // Reference to the parent Admin (Tenant)
  next();
});
