'use strict';

const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const { requireUser } = require('../middleware/auth');

// All routes require a logged-in User (not Admin)
router.use(requireUser);

// GET  /api/notifications/announcements        — paginated list for bell dropdown
router.get('/announcements', notificationController.getMyAnnouncements);

// GET  /api/notifications/unread-count         — lightweight badge count
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/notifications/announcements/read-all — mark all read
// IMPORTANT: must be registered BEFORE /:announcementId/read to avoid param collision
router.patch('/announcements/read-all', notificationController.markAllAnnouncementsRead);

// PATCH /api/notifications/announcements/:announcementId/read — mark one read
router.patch('/announcements/:announcementId/read', notificationController.markAnnouncementRead);

module.exports = router;
