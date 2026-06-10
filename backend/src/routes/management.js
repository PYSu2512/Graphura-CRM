const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/management.controller');
const { requireUser } = require('../middleware/auth');

// /api/management
router.get('/dashboard', requireUser, ctrl.getDashboard);
router.get('/clients',   requireUser, ctrl.listClients);
router.get('/reports',   requireUser, ctrl.getReports);

module.exports = router;
