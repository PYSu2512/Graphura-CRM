const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const { User, Department, AuditLog, Team, Admin } = require('../models/index');
const { hashPassword } = require('../services/auth.service');

const ROLE_DEPARTMENT_MAP = {
  SALES: ['SALES_MANAGER', 'SALES_TL', 'SALES_EXECUTIVE'],
  FINANCE: ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE'],
  MANAGEMENT: ['MANAGEMENT_MANAGER', 'MANAGEMENT_TL', 'MANAGEMENT_EMPLOYEE']
};

exports.getRoleDepartmentMap = catchAsync(async (req, res, next) => {
  res.status(200).json(
    new ApiResponse(200, { roleDepartmentMap: ROLE_DEPARTMENT_MAP }, 'Role-Department mapping retrieved successfully')
  );
});

exports.createUser = catchAsync(async (req, res, next) => {
  // If auth middleware sets req.user
  let adminId = req.user?.id;

  // Fallback for missing auth middleware
  if (!adminId) {
    const defaultAdmin = await Admin.findOne();
    if (defaultAdmin) adminId = defaultAdmin._id;
  }

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

  // 5. Team validation (Optional)
  if (teamId) {
    const team = await Team.findOne({ _id: teamId, admin: adminId, department: departmentId });
    if (!team) return next(new AppError('Team not found in the selected department', 400));
  }

  // 6. Generate default password
  const last5 = phone.slice(-5);
  const defaultPasswordStr = `${email.toLowerCase()}@${last5}`;
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
    team: teamId || null,
    leadDataLimit: leadDataLimit || null,
    mustChangePassword: true,
    isProfileComplete: false
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
  let adminId = req.user?.id;

  if (!adminId) {
    const defaultAdmin = await Admin.findOne();
    if (defaultAdmin) adminId = defaultAdmin._id;
  }

  if (!adminId) return next(new AppError('Admin authentication required', 401));

  const users = await User.find({ admin: adminId }).populate('department', 'name');

  res.status(200).json(
    new ApiResponse(200, { users }, 'Users retrieved successfully')
  );
});

exports.getDepartments = catchAsync(async (req, res, next) => {
  let adminId = req.user?.id;

  if (!adminId) {
    const defaultAdmin = await Admin.findOne();
    if (defaultAdmin) adminId = defaultAdmin._id;
  }

  if (!adminId) return next(new AppError('Admin authentication required', 401));

  const departments = await Department.find({ admin: adminId, isActive: true });

  res.status(200).json(
    new ApiResponse(200, { departments }, 'Departments retrieved successfully')
  );
});
