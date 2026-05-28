const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth');

router.get('/leads', requireAdmin, leadController.getAdminLeads);
router.get('/profile', requireAdmin, adminController.getAdminProfile);

module.exports = router;
