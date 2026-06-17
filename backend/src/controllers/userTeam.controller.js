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
  const { Lead, Team } = require('../models/index');

  const leaders = await teamService.getAvailableLeaders(departmentId, adminId);

  if (!leaders.length) {
    return res.status(200).json(new ApiResponse(200, { leaders: [] }, 'Available leaders fetched successfully'));
  }

  // Count leads assigned directly to each TL (manager → TL assignments)
  const leaderIds = leaders.map(l => l._id);
  const [leadCounts, tlTeams] = await Promise.all([
    Lead.aggregate([
      {
        $match: {
          admin: adminId,
          assignedTo: { $in: leaderIds },
          isDeleted: false,
          isDumped: false,
        },
      },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]),
    Team.find({
      admin: adminId,
      leader: { $in: leaderIds },
      isDeleted: false,
    }).select('leader name'),
  ]);

  const leadCountMap = {};
  leadCounts.forEach(lc => { leadCountMap[lc._id.toString()] = lc.count; });

  const tlTeamMap = {};
  tlTeams.forEach(t => { tlTeamMap[t.leader.toString()] = t.name; });

  const enriched = leaders.map(l => ({
    ...l.toObject(),
    leadCount: leadCountMap[l._id.toString()] || 0,
    teamName: tlTeamMap[l._id.toString()] || null,
    hasTeam: !!tlTeamMap[l._id.toString()],
  }));

  res.status(200).json(new ApiResponse(200, { leaders: enriched }, 'Available leaders fetched successfully'));
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
  const { User, Lead, Team } = require('../models/index');

  const leader = await User.findOne({
    _id: leaderId,
    admin: adminId,
    isDeleted: false,
  }).select('department');

  if (!leader) {
    return next(new AppError('Leader not found', 404));
  }

  // Fetch all SALES_EXECUTIVE in same department
  const employees = await User.find({
    admin: adminId,
    department: leader.department,
    role: 'SALES_EXECUTIVE',
    isDeleted: false,
    isActive: true,
    _id: { $ne: leaderId },
  }).select('name email phone role isActive').sort({ name: 1 });

  // Count active leads per executive in a single aggregation
  const empIds = employees.map(e => e._id);
  const leadCounts = await Lead.aggregate([
    {
      $match: {
        admin: adminId,
        assignedTo: { $in: empIds },
        isDeleted: false,
        isDumped: false,
      },
    },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
  ]);
  const leadCountMap = {};
  leadCounts.forEach(lc => { leadCountMap[lc._id.toString()] = lc.count; });

  // Get team assignment for each executive
  const teamsWithMembers = await Team.find({
    admin: adminId,
    isDeleted: false,
    'members.user': { $in: empIds },
  }).select('name members');
  const empTeamMap = {};
  teamsWithMembers.forEach(t => {
    t.members.forEach(m => {
      empTeamMap[m.user.toString()] = t.name;
    });
  });

  const enriched = employees.map(e => ({
    ...e.toObject(),
    leadCount: leadCountMap[e._id.toString()] || 0,
    assignedTeamName: empTeamMap[e._id.toString()] || null,
  }));

  res.status(200).json(new ApiResponse(200, { employees: enriched }, 'Leader employees fetched successfully'));
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

// Remove member from team (user-scoped)
exports.removeTeamMember = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const userId = req.user?._id || req.user?.id;
  if (!adminId || !userId) return next(new AppError('Authentication required', 401));

  const { id, userId: memberId } = req.params;

  // Ensure team belongs to user's department
  const team = await teamService.getTeamById(id, adminId);
  if (!team) return next(new AppError('Team not found', 404));

  const updated = await teamService.removeTeamMember(id, memberId, adminId, userId);

  res.status(200).json(new ApiResponse(200, { team: updated }, 'Member removed from team successfully'));
});

// Update team (name, leader) — user-scoped
exports.updateTeam = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const userId = req.user?._id || req.user?.id;
  if (!adminId || !userId) return next(new AppError('Authentication required', 401));

  const { id } = req.params;
  const { name, leader, isActive } = req.body;

  // Ensure team belongs to user's department before update
  const existing = await teamService.getTeamById(id, adminId);
  if (!existing) return next(new AppError('Team not found', 404));

  const team = await teamService.updateTeam(id, adminId, { name, leader, isActive }, userId);

  res.status(200).json(new ApiResponse(200, { team }, 'Team updated successfully'));
});

// Delete team (soft delete) — user-scoped
exports.deleteTeam = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const userId = req.user?._id || req.user?.id;
  if (!adminId || !userId) return next(new AppError('Authentication required', 401));

  const { id } = req.params;

  // Ensure team belongs to admin's scope before deletion
  const existing = await teamService.getTeamById(id, adminId);
  if (!existing) return next(new AppError('Team not found', 404));

  const team = await teamService.deleteTeam(id, adminId, userId);

  res.status(200).json(new ApiResponse(200, { team }, 'Team deleted successfully'));
});
