const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/publicTracking.controller');

// /api/public
// No authentication — token is the credential
router.get('/track/:token', ctrl.getTrackingData);

module.exports = router;
