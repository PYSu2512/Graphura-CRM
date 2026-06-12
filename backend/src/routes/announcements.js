'use strict';

const express = require('express');
const router = express.Router();

const announcementController = require('../controllers/announcement.controller');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createAnnouncementSchema,
  announcementTargetsQuerySchema,
  listAnnouncementsQuerySchema,
} = require('../validators/announcement.validator');

// All routes require a logged-in User
router.use(requireAuth);

// Role guard — allow SALES_MANAGER, SALES_TL, ADMIN, SUPER_ADMIN
const requireSender = (req, res, next) => {
  const allowed = ['SALES_MANAGER', 'SALES_TL', 'MANAGEMENT_MANAGER', 'MANAGEMENT_TL', 'ADMIN', 'SUPER_ADMIN'];
  const role = req.userType === 'ADMIN'
    ? 'ADMIN'
    : req.userType === 'SUPER_ADMIN'
      ? 'SUPER_ADMIN'
      : req.user?.role;

  if (!req.user || !allowed.includes(role)) {
    const AppError = require('../utils/appError');
    return next(new AppError('You do not have permission to access announcements', 403));
  }
  req.actorRole = role;
  next();
};

router.use(requireSender);

router.get('/meta',    announcementController.getAnnouncementMeta);
router.get('/targets', validate(announcementTargetsQuerySchema, 'query'), announcementController.getAnnouncementTargets);
router.get('/',        validate(listAnnouncementsQuerySchema,   'query'), announcementController.getAnnouncements);
router.post('/',       validate(createAnnouncementSchema,       'body'),  announcementController.createAnnouncement);

module.exports = router;
