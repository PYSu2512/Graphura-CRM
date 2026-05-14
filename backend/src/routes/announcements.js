const express = require('express');
const router = express.Router();

const announcementController = require('../controllers/announcement.controller');
const { requireUser } = require('../middleware/auth');
const { requireSalesManager } = require('../middleware/leadUpload');
const validate = require('../middleware/validate');
const {
	createAnnouncementSchema,
	announcementTargetsQuerySchema,
	listAnnouncementsQuerySchema,
} = require('../validators/announcement.validator');

router.use(requireUser);
router.use(requireSalesManager);

router.get('/meta', announcementController.getAnnouncementMeta);
router.get('/targets', validate(announcementTargetsQuerySchema, 'query'), announcementController.getAnnouncementTargets);
router.get('/', validate(listAnnouncementsQuerySchema, 'query'), announcementController.getAnnouncements);
router.post('/', validate(createAnnouncementSchema, 'body'), announcementController.createAnnouncement);

module.exports = router;
