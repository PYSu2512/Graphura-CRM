const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");
const { User, Team, UserLoginLog } = require("../models/index");

const formatLatitude = (lat) => {
  if (lat === null || lat === undefined || isNaN(lat)) return "Unknown";
  const dir = lat >= 0 ? "N" : "S";
  return `${Math.abs(lat).toFixed(4)}° ${dir}`;
};

const formatLongitude = (lng) => {
  if (lng === null || lng === undefined || isNaN(lng)) return "Unknown";
  const dir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lng).toFixed(4)}° ${dir}`;
};

const formatRole = (str) => {
  if (!str) return "—";
  const clean = str.replace(/^(SALES|FINANCE|MANAGEMENT)_/, "");
  if (clean === "TL") return "Team Leader";
  return clean
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const mapLog = (l) => {
  const d = new Date(l.loginAt);

  // Format to local date string YYYY-MM-DD
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const dateVal = String(d.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${dateVal}`;

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return {
    id: l._id,
    name: l.user?.name || l.email?.split("@")[0] || "Unknown",
    email: l.email || "—",
    role: formatRole(l.role),
    date: dateStr,
    time: timeStr,
    ip: l.ipAddress || "—",
    latitude: formatLatitude(l.latitude),
    longitude: formatLongitude(l.longitude),
    status: l.isSuccess ? "Active" : "Rejected",
    device: l.device || l.userAgent || "Unknown",
  };
};

/**
 * @desc    Get Login Logs and KPIs dynamically based on role scoping
 * @route   GET /api/logs/login
 * @access  Private (Authenticated User or Admin)
 */
exports.getLoginLogs = catchAsync(async (req, res, next) => {
  const userType = req.userType;
  let userId, adminId, role, userDept;

  if (userType === "ADMIN") {
    userId = req.admin._id;
    adminId = req.admin._id;
    role = "ADMIN";
  } else {
    userId = req.user._id;
    adminId = req.admin._id;
    role = req.user.role;
    userDept = req.user.department;
  }

  if (!adminId) {
    return next(new AppError("Organization context not found.", 401));
  }

  // 1. Determine Team Members (Target User IDs) based on hierarchy scoping
  let targetUserIds = [];

  if (role === "ADMIN") {
    const users = await User.find({ admin: adminId, isDeleted: false }).select(
      "_id",
    );
    targetUserIds = users.map((u) => u._id);
  } else if (role.endsWith("_MANAGER")) {
    const users = await User.find({
      admin: adminId,
      department: userDept,
      role: { $not: /_MANAGER$/ },
      isDeleted: false,
    }).select("_id");
    targetUserIds = users.map((u) => u._id);
  } else if (role.endsWith("_TL")) {
    const teams = await Team.find({
      admin: adminId,
      leader: userId,
      isDeleted: false,
    });
    const teamMemberIds = teams
      .flatMap((t) => t.members.map((m) => m.user))
      .filter((id) => id && String(id) !== String(userId));
    const directReports = await User.find({
      admin: adminId,
      manager: userId,
      isDeleted: false,
    }).select("_id");
    targetUserIds = [
      ...new Set([
        ...teamMemberIds.map((id) => String(id)),
        ...directReports.map((u) => String(u._id)),
      ]),
    ].map((id) => new mongoose.Types.ObjectId(id));
  }

  // 2. Fetch My Login Logs
  const myLogsRaw = await UserLoginLog.find({
    admin: adminId,
    user: userId,
  })
    .populate("user", "name")
    .sort({ loginAt: -1 })
    .lean();
  // 3. Fetch Team/Department Login Logs
  let teamLogsRaw = [];
  if (targetUserIds.length > 0) {
    teamLogsRaw = await UserLoginLog.find({
      admin: adminId,
      user: { $in: targetUserIds, $ne: userId },
    })
      .populate("user", "name")
      .sort({ loginAt: -1 })
      .lean();
  }

  // 4. Format log data according to frontend table requirements
  const myLogs = myLogsRaw.map(mapLog);
  const teamLogs = teamLogsRaw.map(mapLog);

  // 5. Calculate KPI stats based on timestamps
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const myLoginsToday = myLogsRaw.filter(
    (l) => new Date(l.loginAt) >= startOfToday,
  ).length;
  const myTotalLogins = myLogsRaw.length;
  const teamLoginsToday = teamLogsRaw.filter(
    (l) => new Date(l.loginAt) >= startOfToday,
  ).length;
  const teamTotalLogins = teamLogsRaw.length;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        myLogs,
        teamLogs,
        kpiStats: {
          myLoginsToday,
          myTotalLogins,
          teamLoginsToday,
          teamTotalLogins,
        },
      },
      "Login logs retrieved successfully.",
    ),
  );
});
