const express = require('express');
const router = express.Router();
const hrmController = require('../controllers/hrm.controller');
const { requireUser, requireAuth } = require('../middleware/auth');

router.get('/today', requireAuth, hrmController.getTodayStatus);
router.get('/my', requireAuth, hrmController.getMyAttendanceHistory);
router.get('/team', requireAuth, hrmController.getTeamAttendance);
router.post('/clock-in', requireUser, hrmController.clockIn);
router.post('/clock-out', requireUser, hrmController.clockOut);
router.post('/break-toggle', requireUser, hrmController.toggleBreak);

module.exports = router;
