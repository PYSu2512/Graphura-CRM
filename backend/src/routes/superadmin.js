const express = require('express');
const superAdminController = require('../controllers/superadmin.controller');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

const { updateProfileSchema } = require('../validators/user.validator');
const validate = require('../middleware/validate');

const router = express.Router();

// Public route
router.post('/login', superAdminController.login);

// Protected routes (Super Admin only)
router.use(requireSuperAdmin);

router.get('/admin-login-logs', superAdminController.getAdminLoginLogs);

// Profile
router.get('/me', superAdminController.getProfile);
router.patch('/me', validate(updateProfileSchema, 'body'), superAdminController.updateProfile);

// Admin Management
router.get('/admins', superAdminController.getAllAdmins);
router.post('/admins', superAdminController.createAdmin);
router.get('/admins/:id', superAdminController.getAdminById);
router.patch('/admins/:id/status', superAdminController.toggleAdminStatus);

// Platform announcements
router.get('/announcements/meta', superAdminController.getAnnouncementMeta);
router.get('/announcements/targets', superAdminController.getAnnouncementTargets);
router.get('/announcements', superAdminController.getAnnouncements);
router.post('/announcements', superAdminController.createAnnouncement);

// Support Ticket Management
router.get('/support-tickets', superAdminController.getSupportTickets);
router.patch('/support-tickets/:id/status', superAdminController.updateTicketStatus);

module.exports = router;
