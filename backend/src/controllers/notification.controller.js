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
const { Announcement, Team, Notification, User } = require('../models/index');

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

  // Find all teams this user belongs to (as member or leader)
  const userTeams = await Team.find({
    admin: adminId,
    isDeleted: false,
    isActive: true,
    $or: [
      { leader: user._id },
      { 'members.user': user._id },
    ],
  }).select('_id');

  const teamIds = userTeams.map((t) => t._id);

  const visibilityOr = [
    // Broadcast to everyone in the tenant
    { targetType: 'ALL' },
    // Role-based
    { targetType: 'ROLE', targetRole: user.role },
    // Direct user
    { targetType: 'USER', targetUser: user._id },
    // Team-based (user is in the team)
    ...(teamIds.length > 0 ? [{ targetType: 'TEAM', targetTeam: { $in: teamIds } }] : []),
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

  if (!adminId || !user?._id) {
    return next(new AppError('Authentication required', 401));
  }

  // Only TL and Executive receive announcement notifications
  const allowedRoles = ['SALES_TL', 'SALES_EXECUTIVE'];
  if (!allowedRoles.includes(user.role)) {
    return next(new AppError('This endpoint is for Sales TL and Sales Executive only', 403));
  }

  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip  = (page - 1) * limit;

  const filter = await buildVisibilityFilter(adminId, user);

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
    sentBy:       ann.createdBy?.name || 'Manager',
    sentByRole:   ann.createdBy?.role || null,
    targetLabel:  ann.targetTeam?.name || null,
    expiryDate:   ann.expiryDate ? ann.expiryDate.toISOString().slice(0, 10) : null,
    createdAt:    ann.createdAt,
    isRead:       readSet.has(ann._id.toString()),
  }));

  // Unread count
  const unreadCount = formatted.filter((a) => !a.isRead).length;

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

  if (!adminId || !user?._id) {
    return next(new AppError('Authentication required', 401));
  }

  if (!mongoose.Types.ObjectId.isValid(announcementId)) {
    return next(new AppError('Invalid announcement ID', 400));
  }

  // Verify the announcement exists and is visible to this user
  const filter = await buildVisibilityFilter(adminId, user);
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

  if (!adminId || !user?._id) {
    return next(new AppError('Authentication required', 401));
  }

  const filter = await buildVisibilityFilter(adminId, user);
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

  if (!adminId || !user?._id) {
    return next(new AppError('Authentication required', 401));
  }

  const allowedRoles = ['SALES_TL', 'SALES_EXECUTIVE'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(200).json(new ApiResponse(200, { unreadCount: 0 }, 'OK'));
  }

  const filter = await buildVisibilityFilter(adminId, user);
  const totalVisible = await Announcement.countDocuments(filter);

  const readCount = await Notification.countDocuments({
    admin:   adminId,
    user:    user._id,
    type:    'ANNOUNCEMENT',
    isRead:  true,
  });

  const unreadCount = Math.max(0, totalVisible - readCount);

  res.status(200).json(
    new ApiResponse(200, { unreadCount }, 'Unread count retrieved')
  );
});
