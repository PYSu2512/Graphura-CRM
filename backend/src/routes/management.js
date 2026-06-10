const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/management.controller');
const { requireUser } = require('../middleware/auth');

// /api/management
router.get('/dashboard', requireUser, ctrl.getDashboard);
router.get('/clients',   requireUser, ctrl.listClients);
router.get('/reports',   requireUser, ctrl.getReports);

// Send tracking link to a specific client
const publicCtrl = require('../controllers/publicTracking.controller');
router.post('/clients/:clientId/send-tracking-link', requireUser, publicCtrl.sendTrackingLink);

module.exports = router;
