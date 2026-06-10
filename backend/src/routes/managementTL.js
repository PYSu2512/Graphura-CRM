const express  = require('express');
const router   = express.Router();
const teamCtrl = require('../controllers/managementTL.controller');
const projCtrl = require('../controllers/managementTLProjects.controller');
const dashCtrl = require('../controllers/managementTLDashboard.controller');
const { requireUser } = require('../middleware/auth');

// ── Dashboard ──
router.get('/dashboard', requireUser, dashCtrl.getDashboard);

// ── Reports ──
router.get('/reports-data', requireUser, dashCtrl.getReports);

// ── Notifications data ──
router.get('/notifications-data', requireUser, dashCtrl.getNotificationsData);

// ── Team endpoints ──
router.get('/teams/overview', requireUser, teamCtrl.getOverview);
router.get('/teams/members',  requireUser, teamCtrl.getMyTeamMembers);

// ── Projects ──
router.get('/projects/form-data',   requireUser, projCtrl.getFormData);
router.get('/projects',             requireUser, projCtrl.listMyProjects);
router.get('/projects/:id',         requireUser, projCtrl.getProject);
router.get('/projects/:id/tasks',   requireUser, projCtrl.getProjectTasks);
router.post('/projects/:id/tasks',  requireUser, projCtrl.createTask);

// ── Tasks (cross-project task board) ──
router.get('/tasks',                requireUser, projCtrl.getAllTasks);
router.put('/tasks/:taskId',        requireUser, projCtrl.updateTask);
router.delete('/tasks/:taskId',     requireUser, projCtrl.deleteTask);

module.exports = router;
