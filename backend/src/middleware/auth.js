/**
 * AUTH MIDDLEWARE — Flexible JWT verification
 * Supports both ADMIN and USER tokens.
 */
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { verifyAccessToken } = require('../services/auth.service');
const { Admin, User, TokenBlacklist, SuperAdmin } = require('../models');

/**
 * Middleware: require a valid JWT (Admin, User, or SuperAdmin)
 */
exports.requireAuth = catchAsync(async (req, res, next) => {
  // 1. Extract token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please provide a Bearer token.', 401));
  }
  const token = authHeader.split(' ')[1];

  // 2. Verify JWT signature / expiry
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // 3. Check TokenBlacklist
  const blacklisted = await TokenBlacklist.findOne({ token });
  if (blacklisted) {
    return next(new AppError('Token has been invalidated. Please log in again.', 401));
  }

  // 4. Load from DB
  if (decoded.type === 'SUPER_ADMIN') {
    const superAdmin = await SuperAdmin.findOne({ _id: decoded.id, isActive: true });
    if (!superAdmin) return next(new AppError('SuperAdmin account not found or deactivated.', 401));
    req.user = superAdmin;
    req.userType = 'SUPER_ADMIN';
    req.admin = null;
  } else if (decoded.type === 'ADMIN') {
    const admin = await Admin.findOne({ _id: decoded.id, isDeleted: false, isActive: true });
    if (!admin) return next(new AppError('Admin account not found or deactivated.', 401));
    req.user = admin;
    req.admin = admin;
    req.userType = 'ADMIN';
  } else if (decoded.type === 'USER') {
    const user = await User.findOne({ _id: decoded.id, isDeleted: false, isActive: true }).populate('admin');
    if (!user) return next(new AppError('User account not found or deactivated.', 401));
    if (!user.admin?.isActive) return next(new AppError('Organization account is inactive.', 403));
    
    req.user = user;
    req.admin = user.admin;
    req.userType = 'USER';
  } else {
    return next(new AppError('Invalid token type.', 403));
  }

  next();
});

/**
 * Middleware: require a valid Admin JWT specifically
 */
exports.requireAdmin = catchAsync(async (req, res, next) => {
  await exports.requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.userType !== 'ADMIN') {
      return next(new AppError('This resource requires an Admin account.', 403));
    }
    next();
  });
});

/**
 * Middleware: require a valid User JWT specifically
 */
exports.requireUser = catchAsync(async (req, res, next) => {
  await exports.requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.userType !== 'USER') {
      return next(new AppError('This resource requires a User account.', 403));
    }
    next();
  });
});
