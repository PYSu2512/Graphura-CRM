const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const {
  User,
  Department,
  AuditLog,
  Team,
  Admin,
  UserLoginLog,
  LoginAttempt,
  RefreshToken,
} = require('../models/index');
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} = require('../services/auth.service');

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const getDepartmentNextRoute = (role, user) => {
  if (user.mustChangePassword || !user.isProfileComplete) {
    return '/department';
  }

  if (role === 'SALES_MANAGER') return '/sales-manager';
  if (role === 'SALES_TL' || role === 'SALES_EXECUTIVE') return '/department';
  if (role === 'FINANCE_MANAGER') return '/department';
  if (role === 'MANAGEMENT_MANAGER' || role === 'MANAGEMENT_TL' || role === 'MANAGEMENT_EMPLOYEE') {
    return '/department';
  }

  return '/department';
};

const ROLE_DEPARTMENT_MAP = {
  SALES: ['SALES_MANAGER', 'SALES_TL', 'SALES_EXECUTIVE'],
  FINANCE: ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE'],
  MANAGEMENT: ['MANAGEMENT_MANAGER', 'MANAGEMENT_TL', 'MANAGEMENT_EMPLOYEE']
};

const DEPARTMENT_MEMBER_ROLES = new Set(Object.values(ROLE_DEPARTMENT_MAP).flat());

const buildDefaultUserPassword = (email, phone) => {
  const lastFiveDigits = String(phone || '').trim().slice(-5);
  return `${String(email || '').toLowerCase().trim()}@${lastFiveDigits}`;
};

exports.getRoleDepartmentMap = catchAsync(async (req, res, next) => {
  res.status(200).json(
    new ApiResponse(200, { roleDepartmentMap: ROLE_DEPARTMENT_MAP }, 'Role-Department mapping retrieved successfully')
  );
});

exports.createUser = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id;
  if (!adminId) return next(new AppError('Admin authentication required', 401));

  const { name, email, phone, departmentId, role, teamId, leadDataLimit } = req.body;

  // 1. Department exists under same admin
  const department = await Department.findOne({ _id: departmentId, admin: adminId });
  if (!department) {
    return next(new AppError('Department not found or does not belong to your tenant', 400));
  }

  // 2. Role is allowed for selected department
  const allowedRoles = ROLE_DEPARTMENT_MAP[department.name] || [];
  if (!allowedRoles.includes(role) && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return next(new AppError(`Role ${role} is not allowed for department ${department.name}`, 422));
  }

  // 3. Email uniqueness per tenant
  const existingUser = await User.findOne({ email: email.toLowerCase(), admin: adminId });
  if (existingUser) {
    return next(new AppError('Email is already registered in your organization', 409));
  }

  // 4. One Manager per Department Constraint
  if (role.endsWith('_MANAGER')) {
    const existingManager = await User.findOne({
      admin: adminId,
      department: departmentId,
      role: role,
      isDeleted: false
    });

    if (existingManager) {
      return next(new AppError(`A manager for the ${department.name} department already exists.`, 409));
    }
  }

  // 5. Team validation (Optional)
  if (teamId) {
    const team = await Team.findOne({ _id: teamId, admin: adminId, department: departmentId });
    if (!team) return next(new AppError('Team not found in the selected department', 400));
  }

  // 6. Generate default password
  const defaultPasswordStr = buildDefaultUserPassword(email, phone);
  const hashedPassword = await hashPassword(defaultPasswordStr);

  // 7. Create User
  const newUser = await User.create({
    admin: adminId,
    department: departmentId,
    name,
    email: email.toLowerCase(),
    phone,
    role,
    password: hashedPassword,
    tempPassword: defaultPasswordStr,
    team: teamId || null,
    leadDataLimit: leadDataLimit || null,
    mustChangePassword: true,
    isProfileComplete: false,
    approvalStatus: 'APPROVED',
  });

  // 8. Write AuditLog entry
  await AuditLog.create({
    admin: adminId,
    performedBy: adminId,
    performerType: 'ADMIN',
    action: 'USER_CREATED',
    targetModel: 'User',
    targetId: newUser._id,
    after: { name, email: email.toLowerCase(), role, departmentId }
  });

  res.status(201).json(
    new ApiResponse(201, {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: department.name
      }
    }, 'User created successfully')
  );
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id;
  if (!adminId) return next(new AppError('Admin authentication required', 401));

  const { departmentId, roles } = req.query;

  // Use explicit casting for robustness
  const filter = {
    admin: new mongoose.Types.ObjectId(adminId),
    isDeleted: false
  };

  if (departmentId) {
    filter.department = new mongoose.Types.ObjectId(departmentId);
  }

  if (roles) {
    const roleArray = roles.split(',').map(r => r.trim());
    filter.role = { $in: roleArray };
  }

  console.log('Fetching users with filter:', JSON.stringify(filter));
  const users = await User.find(filter).populate('department', 'name');
  console.log(`Found ${users.length} users`);

  res.status(200).json(
    new ApiResponse(200, { users }, 'Users retrieved successfully')
  );
});

exports.getDepartments = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id;
  if (!adminId) return next(new AppError('Admin authentication required', 401));

  const departments = await Department.find({ admin: adminId, isActive: true, isDeleted: false });

  res.status(200).json(
    new ApiResponse(200, { departments }, 'Departments retrieved successfully')
  );
});

exports.getCurrentUserProfile = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('Authentication required', 401));
  }

  const user = await User.findOne({
    _id: userId,
    isDeleted: false,
    isActive: true,
    role: { $in: Array.from(DEPARTMENT_MEMBER_ROLES) },
  })
    .populate('department', 'name')
    .populate('team', 'name')
    .populate('manager', 'name email role')
    .select('name email phone role department team manager address bankDetails profilePic leadDataLimit isActive isProfileComplete mustChangePassword isFirstLogin prereqCompleted prereqStep approvalStatus lastLoginAt lastActiveAt createdAt updatedAt');

  if (!user) {
    return next(new AppError('Department member profile not found', 404));
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { user },
      'Profile retrieved successfully'
    )
  );
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password, latitude, longitude, rememberMe = false } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const ipAddress = getClientIp(req);
  const userAgent = req.get('user-agent') || 'unknown';

  const blockedAttempt = await LoginAttempt.findOne({
    identifier: normalizedEmail,
    identifierType: 'EMAIL',
  });

  if (blockedAttempt?.isBlocked && blockedAttempt.blockedUntil && blockedAttempt.blockedUntil > new Date()) {
    return next(new AppError('Too many failed attempts. Please try again later.', 429));
  }

  const user = await User.findOne({ email: normalizedEmail, isDeleted: false })
    .sort({ createdAt: -1 })
    .populate('admin', 'isActive company name');

  if (!user) {
    await LoginAttempt.findOneAndUpdate(
      { identifier: normalizedEmail, identifierType: 'EMAIL' },
      {
        $set: {
          identifier: normalizedEmail,
          identifierType: 'EMAIL',
          ipAddress,
          userAgent,
          lastAttemptAt: new Date(),
        },
        $inc: { attempts: 1 },
      },
      { upsert: true, new: true }
    );
    return next(new AppError('Invalid email or password.', 401));
  }

  const approvalStatus = user.approvalStatus || 'APPROVED';

  if (!user.admin?.isActive || !user.isActive || approvalStatus !== 'APPROVED') {
    await UserLoginLog.create({
      admin: user.admin?._id,
      user: user._id,
      email: normalizedEmail,
      role: user.role,
      ipAddress,
      latitude,
      longitude,
      userAgent,
      device: userAgent,
      isSuccess: false,
      failReason: !user.admin?.isActive ? 'ADMIN_INACTIVE' : 'USER_INACTIVE',
      loginAt: new Date(),
    });
    return next(new AppError('Your account is not active. Contact your admin.', 403));
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    const updatedAttempt = await LoginAttempt.findOneAndUpdate(
      { identifier: normalizedEmail, identifierType: 'EMAIL' },
      {
        $set: {
          identifier: normalizedEmail,
          identifierType: 'EMAIL',
          ipAddress,
          userAgent,
          lastAttemptAt: new Date(),
        },
        $inc: { attempts: 1 },
      },
      { new: true, upsert: true }
    );

    if (updatedAttempt.attempts >= 5) {
      updatedAttempt.isBlocked = true;
      updatedAttempt.blockReason = 'TOO_MANY_ATTEMPTS';
      updatedAttempt.blockedAt = new Date();
      updatedAttempt.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await updatedAttempt.save();
    }

    await UserLoginLog.create({
      admin: user.admin?._id,
      user: user._id,
      email: normalizedEmail,
      role: user.role,
      ipAddress,
      latitude,
      longitude,
      userAgent,
      device: userAgent,
      isSuccess: false,
      failReason: 'INVALID_CREDENTIALS',
      loginAt: new Date(),
    });

    return next(new AppError('Invalid email or password.', 401));
  }

  await LoginAttempt.deleteOne({ identifier: normalizedEmail, identifierType: 'EMAIL' });

  const accessToken = generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role,
    type: 'USER',
    adminId: user.admin?._id,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
    email: user.email,
    role: user.role,
    type: 'USER',
    adminId: user.admin?._id,
  });

  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + (rememberMe ? 30 : 7));

  await RefreshToken.create({
    token: refreshToken,
    holderType: 'USER',
    holderId: user._id,
    admin: user.admin?._id,
    expiresAt: refreshTokenExpiry,
    ipAddress,
    userAgent,
  });

  user.lastLoginAt = new Date();
  user.lastActiveAt = new Date();
  user.isFirstLogin = false;
  await user.save();

  await UserLoginLog.create({
    admin: user.admin?._id,
    user: user._id,
    email: normalizedEmail,
    role: user.role,
    ipAddress,
    latitude,
    longitude,
    userAgent,
    device: userAgent,
    isSuccess: true,
    loginAt: new Date(),
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          mustChangePassword: user.mustChangePassword,
          isProfileComplete: user.isProfileComplete,
        },
        accessToken,
        refreshToken,
        nextRoute: getDepartmentNextRoute(user.role, user),
      },
      'Login successful'
    )
  );
});

const mongoose = require('mongoose');

/**
 * Get dynamic user statistics based on roles
 * Scoped to the current Admin (Tenant)
 */
exports.getUserStats = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id;
  if (!adminId) return next(new AppError('Admin authentication required', 401));

  const { departmentId, roles } = req.query;

  // Create match filter with proper ObjectId casting for aggregation
  const matchFilter = {
    admin: new mongoose.Types.ObjectId(adminId),
    isDeleted: false
  };

  if (departmentId) {
    matchFilter.department = new mongoose.Types.ObjectId(departmentId);
  }

  // Support role filtering in stats just like the main user list
  if (roles) {
    const roleArray = roles.split(',').map(r => r.trim());
    matchFilter.role = { $in: roleArray };
  }

  // Aggregate stats dynamically by role
  const roleStats = await User.aggregate([
    { $match: matchFilter },
    { $group: { _id: "$role", count: { $sum: 1 } } }
  ]);

  const [activeCount, totalEmployees] = await Promise.all([
    User.countDocuments({ ...matchFilter, isActive: true }),
    User.countDocuments(matchFilter)
  ]);

  const roleCounts = {};
  roleStats.forEach(rs => {
    roleCounts[rs._id] = rs.count;
  });

  const teamLeaders = Object.keys(roleCounts)
    .filter(role => role.endsWith('_TL'))
    .reduce((sum, role) => sum + roleCounts[role], 0);

  const executives = Object.keys(roleCounts)
    .filter(role => role.endsWith('_EXECUTIVE'))
    .reduce((sum, role) => sum + roleCounts[role], 0);

  res.status(200).json(
    new ApiResponse(200, {
      totalEmployees,
      active: activeCount,
      teamLeaders,
      executives,
      roleCounts
    }, 'User stats retrieved successfully')
  );
});

/**
 * Handle initial account setup for department users
 * (Changes password from default and completes profile)
 */
exports.setupAccount = catchAsync(async (req, res, next) => {
  const { newPassword } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('Authentication required', 401));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // 1. Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // 2. Update user status
  user.password = hashedPassword;
  user.mustChangePassword = false;
  user.tempPassword = undefined; // Security: Clear the temporary password if it exists
  
  // Update onboarding progress
  user.prereqStep = 'bank-details';
  // Note: isProfileComplete and prereqCompleted will be set true after bank details are provided
  
  await user.save();

  // 3. Log the activity
  await AuditLog.create({
    admin: user.admin,
    performedBy: user._id,
    performerType: 'USER',
    action: 'PASSWORD_CHANGED',
    targetModel: 'User',
    targetId: user._id,
    note: 'User completed account setup and changed default password'
  });

  res.status(200).json(
    new ApiResponse(200, {
      user: {
        id: user._id,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
        isProfileComplete: user.isProfileComplete,
        prereqStep: user.prereqStep
      }
    }, 'Password updated successfully. Please provide your bank details.')
  );
});
