'use strict';

const express = require('express');
const router = express.Router();

const announcementController = require('../controllers/announcement.controller');
const { requireUser } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createAnnouncementSchema,
  announcementTargetsQuerySchema,
  listAnnouncementsQuerySchema,
} = require('../validators/announcement.validator');

// All routes require a logged-in User
router.use(requireUser);

// Role guard — allow SALES_MANAGER, SALES_TL, ADMIN, SUPER_ADMIN
const requireSender = (req, res, next) => {
  const allowed = ['SALES_MANAGER', 'SALES_TL', 'ADMIN', 'SUPER_ADMIN'];
  if (!req.user || !allowed.includes(req.user.role)) {
    const AppError = require('../utils/appError');
    return next(new AppError('You do not have permission to access announcements', 403));
  }
  next();
};

router.use(requireSender);

router.get('/meta',    announcementController.getAnnouncementMeta);
router.get('/targets', validate(announcementTargetsQuerySchema, 'query'), announcementController.getAnnouncementTargets);
router.get('/',        validate(listAnnouncementsQuerySchema,   'query'), announcementController.getAnnouncements);
router.post('/',       validate(createAnnouncementSchema,       'body'),  announcementController.createAnnouncement);

module.exports = router;
