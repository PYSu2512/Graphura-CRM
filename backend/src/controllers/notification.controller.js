/**
 * NOTIFICATION CONTROLLER — Production
 * Handles in-app announcement notifications for Sales TL and Sales Executive.
 * Notifications are derived from Announcements targeted at the user.
 */
'use strict';

const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const { Announcement, Team, ManagementTeam, Notification, User } = require('../models/index');

const RECEIVER_ROLES = [
  'SALES_TL',
  'SALES_EXECUTIVE',
  'FINANCE_MANAGER',
  'FINANCE_EXECUTIVE',
  'MANAGEMENT_MANAGER',
  'MANAGEMENT_TL',
  'MANAGEMENT_EMPLOYEE',
  'ADMIN',
];

const getActorRole = (req) => {
  if (req.userType === 'ADMIN') return 'ADMIN';
  if (req.userType === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  return req.user?.role;
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Build a Mongoose query filter that returns all announcements
 * visible to the given user, respecting:
 *   - targetType ALL  → everyone in the admin tenant
 *   - targetType ROLE → users whose role matches targetRole
 *   - targetType USER → only that specific user
 *   - targetType TEAM → all members (and leader) of the target team
 *
 * Also filters out expired announcements.
 */
const buildVisibilityFilter = async (adminId, user) => {
  const now = new Date();
  const role = user.role || 'ADMIN';

  // Find all sales and management teams this user belongs to (as member or leader)
  const membershipFilter = role === 'ADMIN'
    ? null
    : {
        admin: adminId,
        isDeleted: false,
        isActive: true,
        $or: [
          { leader: user._id },
          { 'members.user': user._id },
        ],
      };
  const [salesTeams, managementTeams] = await Promise.all([
    membershipFilter ? Team.find(membershipFilter).select('_id').lean() : [],
    membershipFilter ? ManagementTeam.find(membershipFilter).select('_id').lean() : [],
  ]);

  const salesTeamIds = salesTeams.map((t) => t._id);
  const managementTeamIds = managementTeams.map((t) => t._id);

  const visibilityOr = [
    // Broadcast to everyone in the tenant
    { targetType: 'ALL' },
    { platformTargetAdmin: user._id },
    // Role-based
    { targetType: 'ROLE', targetRole: role },
    { targetType: 'ROLE', targetRoles: role },
    // Direct user
    { targetType: 'USER', targetUser: user._id },
    // Department-wide
    ...(user.department ? [{ targetType: 'DEPARTMENT', targetDepartment: user.department }] : []),
    // Team-based (user is in the team)
    ...(salesTeamIds.length > 0 ? [{
      targetType: 'TEAM',
      targetTeam: { $in: salesTeamIds },
      $or: [{ targetTeamModel: 'Team' }, { targetTeamModel: { $exists: false } }],
    }] : []),
    ...(managementTeamIds.length > 0 ? [{
      targetType: 'TEAM',
      targetTeam: { $in: managementTeamIds },
      targetTeamModel: 'ManagementTeam',
    }] : []),
  ];

  return {
    admin: adminId,
    $or: visibilityOr,
    // Exclude expired announcements
    $and: [
      {
        $or: [
          { expiryDate: null },
          { expiryDate: { $gte: now } },
        ],
      },
    ],
  };
};

// ─────────────────────────────────────────────────────────────
// GET MY ANNOUNCEMENTS (for notification bell)
// Returns announcements visible to the logged-in user.
// Sorted newest first. Supports pagination.
// ─────────────────────────────────────────────────────────────
exports.getMyAnnouncements = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const user = req.user;
  const role = getActorRole(req);

  if (req.userType === 'SUPER_ADMIN') {
    return res.status(200).json(
      new ApiResponse(200, {
        announcements: [],
        unreadCount: 0,
        total: 0,
        page: 1,
        pages: 0,
      }, 'No announcements for super admin')
    );
  }

  if (!adminId || !user?._id) {
    return next(new AppError('Authentication required', 401));
  }

  // Only TL and Executive receive announcement notifications
  const allowedRoles = RECEIVER_ROLES;
  if (!allowedRoles.includes(role)) {
    return next(new AppError('This endpoint is for Sales TL and Sales Executive only', 403));
  }

  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip  = (page - 1) * limit;

  const filter = await buildVisibilityFilter(adminId, { ...user.toObject?.() || user, role });

  const [announcements, total] = await Promise.all([
    Announcement.find(filter)
      .populate('createdBy', 'name role')
      .populate('targetTeam', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Announcement.countDocuments(filter),
  ]);

  // Fetch which ones the user has already read (from Notification model)
  const announcementIds = announcements.map((a) => a._id);
  const readNotifs = await Notification.find({
    admin: adminId,
    user: user._id,
    type: 'ANNOUNCEMENT',
    refId: { $in: announcementIds },
    isRead: true,
  }).select('refId').lean();

  const readSet = new Set(readNotifs.map((n) => n.refId.toString()));

  const formatted = announcements.map((ann) => ({
    id:           ann._id,
    title:        ann.title,
    message:      ann.message,
    type:         ann.type,
    sentBy:       ann.createdByAdmin ? 'Super Admin' : (ann.createdBy?.name || 'Manager'),
    sentByRole:   ann.createdBy?.role || null,
    targetLabel:  ann.targetTeam?.name || null,
    expiryDate:   ann.expiryDate ? ann.expiryDate.toISOString().slice(0, 10) : null,
    createdAt:    ann.createdAt,
    isRead:       readSet.has(ann._id.toString()),
  }));

  const visibleIds = await Announcement.find(filter).distinct('_id');
  const readVisibleCount = await Notification.countDocuments({
    admin: adminId,
    user: user._id,
    type: 'ANNOUNCEMENT',
    refId: { $in: visibleIds },
    isRead: true,
  });
  const unreadCount = Math.max(0, total - readVisibleCount);

  res.status(200).json(
    new ApiResponse(200, {
      announcements: formatted,
      unreadCount,
      total,
      page,
      pages: Math.ceil(total / limit),
    }, 'Announcements retrieved successfully')
  );
});

// ─────────────────────────────────────────────────────────────
// MARK ANNOUNCEMENT AS READ
// Creates or updates a Notification record for this user+announcement.
// ─────────────────────────────────────────────────────────────
exports.markAnnouncementRead = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const user = req.user;
  const { announcementId } = req.params;

  if (req.userType === 'SUPER_ADMIN') {
    return res.status(200).json(
      new ApiResponse(200, { announcementId }, 'No announcements for super admin')
    );
  }

  if (!adminId || !user?._id) {
    return next(new AppError('Authentication required', 401));
  }

  if (!mongoose.Types.ObjectId.isValid(announcementId)) {
    return next(new AppError('Invalid announcement ID', 400));
  }

  // Verify the announcement exists and is visible to this user
  const role = getActorRole(req);
  const filter = await buildVisibilityFilter(adminId, { ...user.toObject?.() || user, role });
  const announcement = await Announcement.findOne({
    ...filter,
    _id: announcementId,
  });

  if (!announcement) {
    return next(new AppError('Announcement not found or not accessible', 404));
  }

  // Upsert notification read record
  await Notification.findOneAndUpdate(
    {
      admin:   adminId,
      user:    user._id,
      type:    'ANNOUNCEMENT',
      refId:   announcement._id,
      refType: 'Announcement',
    },
    {
      $set: {
        title:   announcement.title,
        body:    announcement.message,
        isRead:  true,
        readAt:  new Date(),
      },
      $setOnInsert: {
        admin:   adminId,
        user:    user._id,
        type:    'ANNOUNCEMENT',
        refId:   announcement._id,
        refType: 'Announcement',
      },
    },
    { upsert: true, new: true }
  );

  res.status(200).json(
    new ApiResponse(200, { announcementId }, 'Marked as read')
  );
});

// ─────────────────────────────────────────────────────────────
// MARK ALL ANNOUNCEMENTS AS READ
// ─────────────────────────────────────────────────────────────
exports.markAllAnnouncementsRead = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const user = req.user;

  if (req.userType === 'SUPER_ADMIN') {
    return res.status(200).json(
      new ApiResponse(200, { count: 0 }, 'No announcements for super admin')
    );
  }

  if (!adminId || !user?._id) {
    return next(new AppError('Authentication required', 401));
  }

  const role = getActorRole(req);
  const filter = await buildVisibilityFilter(adminId, { ...user.toObject?.() || user, role });
  const announcements = await Announcement.find(filter).select('_id title message').lean();

  if (announcements.length === 0) {
    return res.status(200).json(new ApiResponse(200, { count: 0 }, 'No announcements to mark'));
  }

  const now = new Date();
  const bulkOps = announcements.map((ann) => ({
    updateOne: {
      filter: {
        admin:   adminId,
        user:    user._id,
        type:    'ANNOUNCEMENT',
        refId:   ann._id,
        refType: 'Announcement',
      },
      update: {
        $set: {
          title:   ann.title,
          body:    ann.message,
          isRead:  true,
          readAt:  now,
        },
        $setOnInsert: {
          admin:   adminId,
          user:    user._id,
          type:    'ANNOUNCEMENT',
          refId:   ann._id,
          refType: 'Announcement',
        },
      },
      upsert: true,
    },
  }));

  await Notification.bulkWrite(bulkOps, { ordered: false });

  res.status(200).json(
    new ApiResponse(200, { count: announcements.length }, 'All announcements marked as read')
  );
});

// ─────────────────────────────────────────────────────────────
// GET UNREAD COUNT (lightweight — for badge polling)
// ─────────────────────────────────────────────────────────────
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id || req.admin?.id;
  const user = req.user;
  const role = getActorRole(req);

  if (req.userType === 'SUPER_ADMIN') {
    return res.status(200).json(new ApiResponse(200, { unreadCount: 0 }, 'OK'));
  }

  if (!adminId || !user?._id) {
    return next(new AppError('Authentication required', 401));
  }

  const allowedRoles = RECEIVER_ROLES;
  if (!allowedRoles.includes(role)) {
    return res.status(200).json(new ApiResponse(200, { unreadCount: 0 }, 'OK'));
  }

  const filter = await buildVisibilityFilter(adminId, { ...user.toObject?.() || user, role });
  const totalVisible = await Announcement.countDocuments(filter);

  const visibleIds = await Announcement.find(filter).distinct('_id');

  const readCount = await Notification.countDocuments({
    admin:   adminId,
    user:    user._id,
    type:    'ANNOUNCEMENT',
    refId:   { $in: visibleIds },
    isRead:  true,
  });

  const unreadCount = Math.max(0, totalVisible - readCount);

  res.status(200).json(
    new ApiResponse(200, { unreadCount }, 'Unread count retrieved')
  );
});
