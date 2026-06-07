const mongoose = require('mongoose');
const { Leave, User, Team, Admin } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');

/**
 * Helper: Extract adminId from request
 */
const getEffectiveAdminId = (req) => {
  const admin = req.user?.admin || req.admin;
  if (!admin) return null;
  return typeof admin === 'object' ? (admin._id || admin.id) : admin;
};

/**
 * @desc    Apply for Leave
 * @route   POST /api/leaves
 * @access  Private (User)
 */
exports.applyLeave = catchAsync(async (req, res, next) => {
  const adminId = getEffectiveAdminId(req);
  const { leaveType, fromDate, toDate, reason, days } = req.body;

  if (!adminId) {
    return next(new AppError('Organization context not found.', 401));
  }

  const leave = await Leave.create({
    admin: adminId,
    user: req.user._id,
    leaveType: leaveType.toUpperCase().replace(' LEAVE', ''), // Normalize to enum
    fromDate,
    toDate,
    days,
    reason,
    status: 'PENDING'
  });

  res.status(201).json(new ApiResponse(201, leave, 'Leave application submitted successfully.'));
});

/**
 * @desc    Get My Leaves
 * @route   GET /api/leaves/my
 * @access  Private (User)
 */
exports.getMyLeaves = catchAsync(async (req, res, next) => {
  const adminId = getEffectiveAdminId(req);

  if (!adminId) {
    return next(new AppError('Organization context not found.', 401));
  }

  const leaves = await Leave.find({
    admin: adminId,
    user: req.user._id
  }).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, leaves, 'Personal leaves fetched.'));
});

/**
 * @desc    Get Team Leaves (For Managers/TLs)
 * @route   GET /api/leaves/team
 * @access  Private (Manager/TL)
 */
exports.getTeamLeaves = catchAsync(async (req, res, next) => {
  const adminId = getEffectiveAdminId(req);
  const role = req.user?.role || req.userType;
  const userDept = req.user?.department;
  const userId = req.user?._id || req.admin?._id;

  if (!adminId) {
    return next(new AppError('Organization context not found.', 401));
  }

  let targetUserIds = [];

  if (role === 'ADMIN') {
    const users = await User.find({ admin: adminId, isDeleted: false }).select('_id');
    targetUserIds = users.map(u => u._id);
  } else if (role.endsWith('_MANAGER')) {
    const users = await User.find({ admin: adminId, department: userDept, isDeleted: false }).select('_id');
    targetUserIds = users.map(u => u._id);
  } else if (role.endsWith('_TL')) {
    const teams = await Team.find({ admin: adminId, leader: userId, isDeleted: false });
    const teamMemberIds = teams.flatMap(t => t.members.map(m => m.user)).filter(id => id && String(id) !== String(userId));
    const directReports = await User.find({ admin: adminId, manager: userId, isDeleted: false }).select('_id');
    targetUserIds = [...new Set([...teamMemberIds.map(String), ...directReports.map(String)])];
  }

  const leaves = await Leave.find({
    admin: adminId,
    user: { 
      $in: targetUserIds.map(id => new mongoose.Types.ObjectId(String(id))), 
      $ne: new mongoose.Types.ObjectId(String(userId)) 
    }
  })
  .populate({
    path: 'user',
    select: 'name role department',
    populate: { path: 'department', select: 'name displayName' }
  })
  .sort({ createdAt: -1 })
  .lean();

  // Fetch unique non-null approvedBy IDs as strings
  const approverIds = [...new Set(leaves.map(l => l.approvedBy).filter(Boolean).map(id => String(id)))];

  // Bulk query both User and Admin collections
  const [users, admins] = await Promise.all([
    User.find({ _id: { $in: approverIds } }).select('name').lean(),
    Admin.find({ _id: { $in: approverIds } }).select('name').lean()
  ]);

  // Create lookup maps
  const userMap = new Map(users.map(u => [String(u._id), u.name]));
  const adminMap = new Map(admins.map(a => [String(a._id), a.name]));

  const processedLeaves = leaves.map((l) => {
    let actionedByName = '—';
    const s = (l.status || '').toUpperCase().trim();
    
    if (s !== 'PENDING' && s !== '') {
      if (l.approvedBy) {
        const approverId = String(l.approvedBy);
        if (adminMap.has(approverId)) {
          actionedByName = adminMap.get(approverId);
        } else if (userMap.has(approverId)) {
          actionedByName = userMap.get(approverId);
        } else {
          actionedByName = 'Admin';
        }
      } else {
        actionedByName = 'Admin';
      }
    }

    const dept = l.user?.department;
    const deptName = (typeof dept === 'object' ? (dept?.displayName || dept?.name) : dept) || '—';

    return { ...l, actionedByName, deptName };
  });

  res.status(200).json(new ApiResponse(200, processedLeaves, 'Team leaves fetched.'));
});

/**
 * @desc    Update Leave Status (Approve/Reject)
 * @route   PATCH /api/leaves/:id/status
 * @access  Private (Manager/TL/Admin)
 */
exports.updateLeaveStatus = catchAsync(async (req, res, next) => {
  const adminId = getEffectiveAdminId(req);
  const { status, rejectionNote } = req.body;
  const leaveId = req.params.id;

  // Authorization check: Only Admin or Manager roles
  const userRole = req.user?.role || req.userType;
  const isManagerOrAdmin = 
    userRole === 'ADMIN' || 
    //userRole === 'SUPER_ADMIN' || 
    (userRole && userRole.includes('_MANAGER'));

  if (!isManagerOrAdmin) {
    return next(new AppError('Only Admins or Managers are authorized to approve/reject leaves.', 403));
  }

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return next(new AppError('Invalid status update.', 400));
  }

  const leave = await Leave.findOne({ _id: leaveId, admin: adminId });

  if (!leave) {
    return next(new AppError('Leave record not found.', 404));
  }

  // Prevent self-approval
  const currentUserId = req.user?._id || req.admin?._id;
  if (String(leave.user) === String(currentUserId)) {
    return next(new AppError('You cannot approve or reject your own leave request.', 403));
  }

  leave.status = status;
  leave.rejectionNote = rejectionNote;
  leave.approvedBy = currentUserId;
  leave.approvedAt = new Date();

  const saved = await leave.save();

  res.status(200).json(new ApiResponse(200, saved, `Leave ${status.toLowerCase()} successfully.`));
});

/**
 * @desc    Cancel/Delete Own Leave
 * @route   DELETE /api/leaves/:id
 * @access  Private (User)
 */
exports.deleteLeave = catchAsync(async (req, res, next) => {
  const adminId = getEffectiveAdminId(req);
  const leave = await Leave.findOne({ _id: req.params.id, user: req.user._id, admin: adminId });

  if (!leave) {
    return next(new AppError('Leave record not found or not authorized.', 404));
  }

  if (leave.status !== 'PENDING') {
    return next(new AppError('Only pending leaves can be canceled.', 400));
  }

  await leave.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Leave application canceled.'));
});
