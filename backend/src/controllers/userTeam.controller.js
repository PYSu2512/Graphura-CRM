const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const teamService = require('../services/team.service');

// Create team as a department user (Sales Manager or TL)
exports.createTeam = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const userId = req.user?._id || req.user?.id;
  if (!adminId || !userId) return next(new AppError('Authentication required', 401));

  const { name, department, leader } = req.body;

  const team = await teamService.createTeam(
    { admin: adminId, department, name, leader: leader || null },
    userId
  );

  res.status(201).json(new ApiResponse(201, { team }, 'Team created successfully'));
});

exports.getAvailableLeaders = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  if (!adminId) return next(new AppError('Authentication required', 401));

  const { departmentId } = req.params;
  const leaders = await teamService.getAvailableLeaders(departmentId, adminId);

  res.status(200).json(new ApiResponse(200, { leaders }, 'Available leaders fetched successfully'));
});

exports.getAvailableMembers = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  if (!adminId) return next(new AppError('Authentication required', 401));

  const { id } = req.params;
  const members = await teamService.getAvailableMembers(id, adminId);

  res.status(200).json(new ApiResponse(200, { members }, 'Available members fetched successfully'));
});

exports.getLeaderEmployees = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  if (!adminId) return next(new AppError('Authentication required', 401));

  const { leaderId } = req.params;
  const { User } = require('../models/index');

  const leader = await User.findOne({
    _id: leaderId,
    admin: adminId,
    isDeleted: false,
  }).select('department');

  if (!leader) {
    return next(new AppError('Leader not found', 404));
  }

  const employees = await User.find({
    admin: adminId,
    department: leader.department,
    role: 'SALES_EXECUTIVE',
    isDeleted: false,
    isActive: true,
    _id: { $ne: leaderId },
  }).select('name email phone role isActive').sort({ name: 1 });

  res.status(200).json(new ApiResponse(200, { employees }, 'Leader employees fetched successfully'));
});

// List teams visible to the current department user (same department)
exports.listUserTeams = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const user = req.user;
  if (!adminId || !user) return next(new AppError('Authentication required', 401));

  const departmentId = user.department;
  // Use teamService.getTeams scoped to department
  const result = await teamService.getTeams(adminId, departmentId, { page: 1, limit: 1000 });

  res.status(200).json(new ApiResponse(200, result, 'Teams fetched successfully'));
});

// Get single team details (ensure user has access)
exports.getUserTeamById = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const user = req.user;
  if (!adminId || !user) return next(new AppError('Authentication required', 401));

  const { id } = req.params;

  const team = await teamService.getTeamById(id, adminId);

  // Ensure same department or user has broader permissions
  if (team.department?.toString() !== user.department?.toString()) {
    return next(new AppError('Access denied to this team', 403));
  }

  res.status(200).json(new ApiResponse(200, { team }, 'Team fetched successfully'));
});


exports.addTeamMember = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const userId = req.user?._id || req.user?.id;
  if (!adminId || !userId) return next(new AppError('Authentication required', 401));

  const { id } = req.params;
  const { userId: newMemberId } = req.body;

  const team = await teamService.addTeamMember(id, newMemberId, adminId, userId);

  res.status(200).json(new ApiResponse(200, { team }, 'Member added to team successfully'));
});
