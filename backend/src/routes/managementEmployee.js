const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/managementEmployee.controller');
const { requireUser } = require('../middleware/auth');

// All routes: /api/management-employee
// Role enforced inside controller (MANAGEMENT_EMPLOYEE only)

router.get('/stats',           requireUser, ctrl.getStats);
router.get('/tasks',           requireUser, ctrl.getMyTasks);
router.get('/tasks/:taskId',   requireUser, ctrl.getTask);
router.patch('/tasks/:taskId', requireUser, ctrl.updateMyTask);

module.exports = router;
