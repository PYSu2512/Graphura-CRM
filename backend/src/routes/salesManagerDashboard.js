'use strict';

const express        = require('express');
const router         = express.Router();
const { requireUser } = require('../middleware/auth');
const ctrl           = require('../controllers/salesManagerDashboard.controller');

router.use(requireUser);
router.get('/summary', ctrl.getSummary);

module.exports = router;
