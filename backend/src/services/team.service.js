/**
 * TEAM SERVICE — Business logic for team management
 * Production-grade service with proper error handling and data validation
 */

const { Team, User, Department, Admin, AuditLog } = require('../models/index');
const AppError = require('../utils/appError');

/**
 * Create a new team
 * @param {Object} teamData - { admin, department, name, leader }
 * @param {String} performedBy - User ID who created the team
 * @returns {Object} Created team document
 */
exports.createTeam = async (teamData, performedBy) => {
  const { admin, department, name, leader } = teamData;

  // 1. Verify department exists and belongs to admin
  const dept = await Department.findOne({ _id: department, admin, isDeleted: false });
  if (!dept) {
    throw new AppError('Department not found or does not belong to your organization', 400);
  }

  // 2. Check team name uniqueness within department
  const existingTeam = await Team.findOne({
    admin,
    department,
    name: name.trim(),
    isDeleted: false,
  });
  if (existingTeam) {
    throw new AppError('Team name already exists in this department', 409);
  }

  // 3. If leader provided, verify user exists and belongs to department
  let teamLeader = null;
  let initialMembers = [];

  if (leader) {
    const leaderUser = await User.findOne({
      _id: leader,
      admin,
      department,
      isDeleted: false,
    });
    if (!leaderUser) {
      throw new AppError('Team leader not found or does not belong to this department', 400);
    }
    teamLeader = leader;

    // Add leader as a member automatically
    initialMembers.push({
      user: leader,
      joinedAt: new Date(),
    });
  }

  // 4. Create team
  const team = await Team.create({
    admin,
    department,
    name: name.trim(),
    leader: teamLeader,
    members: initialMembers,
    isActive: true,
  });

  // 5. Write audit log
  await AuditLog.create({
    admin,
    performedBy,
    performerType: 'USER',
    action: 'TEAM_CREATED',
    targetModel: 'Team',
    targetId: team._id,
    after: {
      name: team.name,
      department: department.toString(),
      leader: teamLeader ? teamLeader.toString() : null,
    },
  });

  await team.populate('leader', 'name email phone role');
  await team.populate('members.user', 'name email phone role');
  return team;
};

/**
 * Get all teams for admin (optionally filtered by department)
 * @param {String} admin - Admin ID
 * @param {String|null} department - Department ID (optional filter)
 * @param {Object} options - { page, limit, sort }
 * @returns {Object} { teams, total, page, pages }
 */
exports.getTeams = async (admin, department = null, options = {}) => {
  const { page = 1, limit = 20, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { admin, isDeleted: false };
  if (department) {
    // Verify department belongs to admin
    const dept = await Department.findOne({ _id: department, admin, isDeleted: false });
    if (!dept) {
      throw new AppError('Department not found', 400);
    }
    filter.department = department;
  }

  // Fetch teams
  const teams = await Team.find(filter)
    .populate('leader', 'name email phone role')
    .populate('department', 'name')
    .populate('members.user', 'name email phone role leadCount')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Team.countDocuments(filter);
  const pages = Math.ceil(total / limit);

  return { teams, total, page, pages };
};

/**
 * Get single team by ID
 * @param {String} teamId - Team ID
 * @param {String} admin - Admin ID (for scoping)
 * @returns {Object} Team document
 */
exports.getTeamById = async (teamId, admin) => {
  const team = await Team.findOne({ _id: teamId, admin, isDeleted: false })
    .populate('leader', 'name email phone role')
    .populate('department', 'name')
    .populate('members.user', 'name email phone role leadCount');

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  return team;
};

/**
 * Update team (name, leader, active status)
 * @param {String} teamId - Team ID
 * @param {String} admin - Admin ID (for scoping)
 * @param {Object} updateData - { name, leader, isActive }
 * @param {String} performedBy - User ID who performed update
 * @returns {Object} Updated team document
 */
exports.updateTeam = async (teamId, admin, updateData, performedBy) => {
  const { name, leader, isActive } = updateData;

  // 1. Get existing team
  const team = await Team.findOne({ _id: teamId, admin, isDeleted: false });
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  const before = {
    name: team.name,
    leader: team.leader ? team.leader.toString() : null,
    isActive: team.isActive,
  };

  // 2. If name is being updated, check uniqueness
  if (name && name !== team.name) {
    const existing = await Team.findOne({
      admin,
      department: team.department,
      name: name.trim(),
      _id: { $ne: teamId },
      isDeleted: false,
    });
    if (existing) {
      throw new AppError('Team name already exists in this department', 409);
    }
    team.name = name.trim();
  }

  // 3. If leader is being updated, verify new leader
  if (leader !== undefined && leader !== null) {
    if (leader !== team.leader?.toString()) {
      const leaderUser = await User.findOne({
        _id: leader,
        admin,
        department: team.department,
        isDeleted: false,
      });
      if (!leaderUser) {
        throw new AppError('Team leader not found or does not belong to this team\'s department', 400);
      }

      // Add new leader to members if not already there
      const isMember = team.members.some((m) => m.user.toString() === leader);
      if (!isMember) {
        team.members.push({
          user: leader,
          joinedAt: new Date(),
        });
      }

      team.leader = leader;
    }
  }

  // 4. Update active status
  if (isActive !== undefined) {
    team.isActive = isActive;
  }

  // 5. Save changes
  await team.save();

  // 6. Write audit log
  await AuditLog.create({
    admin,
    performedBy,
    performerType: 'USER',
    action: 'TEAM_UPDATED',
    targetModel: 'Team',
    targetId: team._id,
    before,
    after: {
      name: team.name,
      leader: team.leader ? team.leader.toString() : null,
      isActive: team.isActive,
    },
  });

  await team.populate('leader', 'name email phone role');
  await team.populate('members.user', 'name email phone role');
  return team;
};

/**
 * Add member to team
 * @param {String} teamId - Team ID
 * @param {String} userId - User ID to add
 * @param {String} admin - Admin ID (for scoping)
 * @param {String} performedBy - User ID who performed action
 * @returns {Object} Updated team document
 */
exports.addTeamMember = async (teamId, userId, admin, performedBy) => {
  // 1. Get team
  const team = await Team.findOne({ _id: teamId, admin, isDeleted: false });
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // 2. Verify user exists in same department
  const user = await User.findOne({
    _id: userId,
    admin,
    department: team.department,
    isDeleted: false,
  });
  if (!user) {
    throw new AppError('User not found in this team\'s department', 400);
  }

  // 3. Check if already a member
  const isMember = team.members.some((m) => m.user.toString() === userId);
  if (isMember) {
    throw new AppError('User is already a member of this team', 409);
  }

  // 4. Add member
  team.members.push({
    user: userId,
    joinedAt: new Date(),
  });
  await team.save();

  // 5. Write audit log
  await AuditLog.create({
    admin,
    performedBy,
    performerType: 'USER',
    action: 'TEAM_MEMBER_ADDED',
    targetModel: 'Team',
    targetId: team._id,
    after: {
      userId: userId.toString(),
      userName: user.name,
    },
  });

  return team.populate('members.user', 'name email phone role leadCount');
};

/**
 * Remove member from team
 * @param {String} teamId - Team ID
 * @param {String} userId - User ID to remove
 * @param {String} admin - Admin ID (for scoping)
 * @param {String} performedBy - User ID who performed action
 * @returns {Object} Updated team document
 */
exports.removeTeamMember = async (teamId, userId, admin, performedBy) => {
  // 1. Get team
  const team = await Team.findOne({ _id: teamId, admin, isDeleted: false });
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // 2. Check if member exists
  const memberIndex = team.members.findIndex((m) => m.user.toString() === userId);
  if (memberIndex === -1) {
    throw new AppError('User is not a member of this team', 400);
  }

  // 3. Prevent removing team leader
  if (team.leader?.toString() === userId) {
    throw new AppError('Cannot remove team leader. Update leader first or delete team.', 400);
  }

  // 4. Remove member
  team.members.splice(memberIndex, 1);
  await team.save();

  // 5. Write audit log
  await AuditLog.create({
    admin,
    performedBy,
    performerType: 'USER',
    action: 'TEAM_MEMBER_REMOVED',
    targetModel: 'Team',
    targetId: team._id,
    after: {
      userId: userId.toString(),
    },
  });

  return team.populate('members.user', 'name email phone role leadCount');
};

/**
 * Delete (soft) a team
 * @param {String} teamId - Team ID
 * @param {String} admin - Admin ID (for scoping)
 * @param {String} performedBy - User ID who performed deletion
 * @returns {Object} Deleted team document
 */
exports.deleteTeam = async (teamId, admin, performedBy) => {
  // 1. Get team
  const team = await Team.findOne({ _id: teamId, admin, isDeleted: false });
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // 2. Soft delete
  await team.softDelete(performedBy);

  // 3. Write audit log
  await AuditLog.create({
    admin,
    performedBy,
    performerType: 'USER',
    action: 'TEAM_DELETED',
    targetModel: 'Team',
    targetId: team._id,
    before: {
      name: team.name,
      membersCount: team.members.length,
    },
  });

  return team;
};

/**
 * Get available members for adding to team (users in same dept, not yet members)
 * @param {String} teamId - Team ID
 * @param {String} admin - Admin ID (for scoping)
 * @returns {Array} Available users
 */
exports.getAvailableMembers = async (teamId, admin) => {
  // 1. Get team
  const team = await Team.findOne({ _id: teamId, admin, isDeleted: false });
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // 2. Get all users in same department
  const allUsers = await User.findActive(
    { admin, department: team.department },
    'name email phone role leadCount',
    { sort: { name: 1 } }
  );

  // 3. Filter out existing members
  const memberIds = team.members.map((m) => m.user.toString());
  const available = allUsers.filter((u) => !memberIds.includes(u._id.toString()));

  return available;
};

/**
 * Get available team leaders (users in same dept with SALES_TL role)
 * @param {String} departmentId - Department ID
 * @param {String} admin - Admin ID (for scoping)
 * @returns {Array} Available team leaders
 */
exports.getAvailableLeaders = async (departmentId, admin) => {
  // 1. Verify department belongs to admin
  const dept = await Department.findOne({ _id: departmentId, admin, isDeleted: false });
  if (!dept) {
    throw new AppError('Department not found', 400);
  }

  // 2. Get users with SALES_TL role
  const leaders = await User.findActive(
    { admin, department: departmentId, role: 'SALES_TL' },
    'name email phone role isActive',
    { sort: { name: 1 } }
  );

  return leaders;
};
