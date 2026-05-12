const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware to ensure the user has SALES_MANAGER or ADMIN role
 */
exports.requireSalesManager = (req, res, next) => {
  const allowedRoles = ['SALES_MANAGER', 'ADMIN', 'SUPER_ADMIN'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

/**
 * Middleware to ensure the authenticated user can assign sales leads.
 * Sales Managers can assign to TLs, Sales TLs can assign to Executives.
 */
exports.requireLeadAssigner = (req, res, next) => {
  const allowedRoles = ['SALES_MANAGER', 'SALES_TL', 'ADMIN', 'SUPER_ADMIN'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to assign leads', 403));
  }
  next();
};
