const mongoose = require('mongoose');
const { Attendance, User, Team, Leave } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');

/**
 * Helper: Normalize date to start of day
 */
const getTodayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Helper: Parse YYYY-MM-DD to local midnight
 */
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Helper: Format date to local YYYY-MM-DD
 */
const toLocalYMD = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const getEffectiveAdminId = (req) => {
  const admin = req.user?.admin || req.admin;
  if (!admin) return null;
  if (typeof admin === 'string') return admin;
  if (typeof admin === 'object') {
    return admin._id || admin.id || admin.toString();
  }
  return String(admin);
};

/**
 * @desc    Clock In
 * @route   POST /api/attendance/clock-in
 * @access  Private (User)
 */
exports.clockIn = catchAsync(async (req, res, next) => {
  const today = getTodayDate();

  // Check if already clocked in for today
  let attendance = await Attendance.findOne({ user: req.user._id, date: today });

  if (attendance && attendance.clockIn) {
    return next(new AppError('Already clocked in for today.', 400));
  }

  if (!attendance) {
    attendance = new Attendance({
      admin: req.admin._id,
      user: req.user._id,
      date: today,
      clockIn: new Date(),
      isAbsent: false,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
    });
  } else {
    attendance.clockIn = new Date();
    attendance.isAbsent = false;
    attendance.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  }

  await attendance.save();

  res.status(200).json(
    new ApiResponse(200, attendance, 'Clocked in successfully.')
  );
});

/**
 * @desc    Clock Out
 * @route   POST /api/attendance/clock-out
 * @access  Private (User)
 */
exports.clockOut = catchAsync(async (req, res, next) => {
  const today = getTodayDate();
  let targetUserId = req.user._id;

  // Allow Managers/TLs to clock out others if targetUserId is provided in body
  if (req.body.userId && String(req.body.userId) !== String(req.user._id)) {
    if (req.user.role === 'SALES_MANAGER' || req.user.role === 'SALES_TL' || req.user.role === 'ADMIN') {
      targetUserId = req.body.userId;
    } else {
      return next(new AppError('You are not authorized to clock out other users.', 403));
    }
  }

  const attendance = await Attendance.findOne({ user: targetUserId, date: today });

  if (!attendance || !attendance.clockIn) {
    return next(new AppError('No active session found. Please clock in first.', 400));
  }

  if (attendance.clockOut) {
    return next(new AppError('Already clocked out for today.', 400));
  }

  attendance.clockOut = new Date();

  // 1. Calculate Total duration (ms)
  const totalMs = attendance.clockOut - attendance.clockIn;

  // 2. Calculate Break duration (ms)
  let breakMs = 0;
  attendance.breaks.forEach(b => {
    if (b.startedAt && b.endedAt) {
      breakMs += (new Date(b.endedAt) - new Date(b.startedAt));
    } else if (b.startedAt && !b.endedAt) {
      // If user forgot to resume before clocking out, auto-end the break now
      b.endedAt = attendance.clockOut;
      breakMs += (new Date(b.endedAt) - new Date(b.startedAt));
    }
  });

  // 3. Set derived fields
  const netMs = totalMs - breakMs;
  const netMinutes = netMs / 60000;

  attendance.breakMinutes = Number((breakMs / 60000).toFixed(2));
  attendance.hoursWorked = Number((netMs / 3600000).toFixed(2));

  // 4. Overtime (target 8h = 480 mins)
  const TARGET_MINS = 480;
  attendance.overtimeMinutes = netMinutes > TARGET_MINS ? Number((netMinutes - TARGET_MINS).toFixed(2)) : 0;

  // 5. Half Day (e.g. less than 4h = 240 mins)
  attendance.isHalfDay = netMinutes > 0 && netMinutes < 240;

  // 6. Final absence check
  attendance.isAbsent = false;


  await attendance.save();

  res.status(200).json(
    new ApiResponse(200, attendance, 'Clocked out successfully.')
  );
});

/**
 * @desc    Toggle Break (Pause/Resume)
 * @route   POST /api/attendance/break-toggle
 * @access  Private (User)
 */
exports.toggleBreak = catchAsync(async (req, res, next) => {
  if (!req.body || !req.body.action) {
    return next(new AppError("Please provide an action ('pause' or 'resume') in the request body.", 400));
  }
  const { action } = req.body; // 'pause' or 'resume'
  const today = getTodayDate();
  const attendance = await Attendance.findOne({ user: req.user._id, date: today });

  if (!attendance || !attendance.clockIn || attendance.clockOut) {
    return next(new AppError('Attendance session is not in a valid state to toggle break.', 400));
  }

  const activeBreak = attendance.breaks.find(b => !b.endedAt);

  if (action === 'pause') {
    if (activeBreak) {
      return next(new AppError('A break is already in progress.', 400));
    }
    attendance.breaks.push({ startedAt: new Date() });
  } else if (action === 'resume') {
    if (!activeBreak) {
      return next(new AppError('No active break found to resume from.', 400));
    }
    activeBreak.endedAt = new Date();

    // Recalculate breakMinutes so far
    let totalBreakMs = 0;
    attendance.breaks.forEach(b => {
      if (b.startedAt && b.endedAt) {
        totalBreakMs += (new Date(b.endedAt) - new Date(b.startedAt));
      }
    });
    attendance.breakMinutes = Number((totalBreakMs / 60000).toFixed(2));
  } else {
    return next(new AppError("Invalid action. Use 'pause' or 'resume'.", 400));
  }



  await attendance.save();

  res.status(200).json(
    new ApiResponse(
      200,
      attendance,
      `Break ${action === 'pause' ? 'started' : 'ended'} successfully.`
    )
  );
});

/**
 * @desc    Get Today's Attendance Status
 * @route   GET /api/attendance/today
 * @access  Private (User)
 */
exports.getTodayStatus = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const userType = req.userType || req.user?.role;

  if (userType === 'ADMIN' || userType === 'SUPER_ADMIN') {
    return res.status(200).json(
      new ApiResponse(200, null, 'Admins do not have attendance status.')
    );
  }

  const today = getTodayDate();
  const attendance = await Attendance.findOne({
    user: userId,
    date: today
  });

  res.status(200).json(
    new ApiResponse(200, attendance || null, 'Today\'s status fetched.')
  );
});
/**
 * @desc    Get My Attendance History
 * @route   GET /api/attendance/my
 * @access  Private (User)
 */
exports.getMyAttendanceHistory = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.user?.admin?._id || req.user?.admin;
  const userId = req.user?._id;
  const userType = req.userType || req.user?.role;

  if (userType === 'ADMIN' || userType === 'SUPER_ADMIN') {
    return res.status(200).json(new ApiResponse(200, [], 'Admins do not have attendance history.'));
  }

  if (!adminId) {
    return next(new AppError('Organization context not found.', 401));
  }

  const { startDate, endDate } = req.query;

  const query = {
    admin: adminId,
    user: userId
  };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = parseLocalDate(startDate);
    if (endDate) {
      const end = parseLocalDate(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  const records = await Attendance.find(query).sort({ date: -1 }).lean();

  res.status(200).json(new ApiResponse(200, records, 'Personal attendance history fetched.'));
});

/**
 * @desc    Get Team Attendance (For Managers/TLs)
...
 * @route   GET /api/attendance/team
 * @access  Private (Manager/TL)
 */
exports.getTeamAttendance = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.user?.admin?._id || req.user?.admin;
  const userId = req.user?._id;
  const role = req.user?.role || req.userType;
  const userDept = req.user?.department;
  
  const { startDate, endDate, teamLeader, search } = req.query;

  if (!adminId) {
    return next(new AppError('Organization context not found.', 401));
  }

  const adminIdObj = new mongoose.Types.ObjectId(String(adminId));
  const userIdObj = userId ? new mongoose.Types.ObjectId(String(userId)) : null;

  let targetUserIds = [];

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    const users = await User.find({ admin: adminIdObj, isDeleted: false }).select('_id');
    targetUserIds = users.map(u => u._id);
  } else if (role.endsWith('_MANAGER')) {
    // Managers see everyone in their department
    if (!userDept) {
      return next(new AppError('Department context not found for manager.', 400));
    }
    const users = await User.find({
      admin: adminIdObj,
      department: userDept,
      isDeleted: false,
      isActive: true,
      _id: { $ne: userIdObj } // Exclude self
    }).select('_id');
    targetUserIds = users.map(u => u._id);
  } else if (role.endsWith('_TL')) {
    // TLs see members of ALL teams they lead OR users who report to them directly
    const teams = await Team.find({ admin: adminIdObj, leader: userIdObj, isDeleted: false, isActive: true });
    const teamMemberIds = teams.flatMap(t => t.members.map(m => m.user)).filter(id => id && String(id) !== String(userId));
    const directReports = await User.find({ admin: adminIdObj, manager: userIdObj, isDeleted: false, isActive: true }).select('_id');
    targetUserIds = [...new Set([...teamMemberIds.map(String), ...directReports.map(String)])];
  } else {
    return next(new AppError('You are not authorized to view team attendance.', 403));
  }

  if (targetUserIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], 'No team members found.'));
  }

  // Build User filter
  const userQuery = { 
    _id: { $in: targetUserIds } 
  };
  if (userIdObj) {
    userQuery._id.$ne = userIdObj;
  }

  if (search) {
    userQuery.name = { $regex: search, $options: 'i' };
  }

  const users = await User.find(userQuery)
    .select('_id name role email phone manager department')
    .populate('manager', 'name')
    .populate('department', 'name');

  // If teamLeader filter is applied
  let filteredUsers = users;
  if (teamLeader && teamLeader !== 'All') {
    const tls = Array.isArray(teamLeader) ? teamLeader : [teamLeader];
    filteredUsers = users.filter(u => tls.includes(u.manager?.name || "Self"));
  }

  const finalUserIds = filteredUsers.map(u => u._id);
  
  // Date range handling (Local time)
  const start = parseLocalDate(startDate) || getTodayDate();
  const end = parseLocalDate(endDate) || new Date(start);
  end.setHours(23, 59, 59, 999);

  // Fetch Attendance
  const attendanceRecords = await Attendance.find({
    admin: adminIdObj,
    user: { $in: finalUserIds },
    date: { $gte: start, $lte: end }
  }).lean();

  // Fetch Leaves
  const leaves = await Leave.find({
    admin: adminIdObj,
    user: { $in: finalUserIds },
    status: 'APPROVED',
    $or: [
      { fromDate: { $lte: end }, toDate: { $gte: start } }
    ]
  }).lean();

  const results = [];
  
  // Loop through each user and each date in range
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  
  for (const u of filteredUsers) {
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      const currentYMD = toLocalYMD(currentDate);

      const att = attendanceRecords.find(a => {
        return String(a.user) === String(u._id) && toLocalYMD(a.date) === currentYMD;
      });

      const leave = leaves.find(l => {
        const leaveStart = toLocalYMD(l.fromDate);
        const leaveEnd = toLocalYMD(l.toDate);
        return String(l.user) === String(u._id) && 
               currentYMD >= leaveStart && 
               currentYMD <= leaveEnd;
      });

      let calcStatus = "Absent";
      if (att) {
        if (att.clockIn && !att.clockOut) calcStatus = "Active"; 
        else if (att.clockIn && att.clockOut) calcStatus = "Present";
      } else if (leave) {
        calcStatus = "Leave";
      }

      results.push({
        id: u._id,
        name: u.name,
        role: u.role,
        department: u.department?.name || "Unknown",
        teamLeader: u.manager?.name || "Self",
        date: currentDate.toISOString(),
        attendance: att || null,
        status: calcStatus
      });
    }
  }

  res.status(200).json(new ApiResponse(200, results, 'Team attendance fetched successfully.'));
});
