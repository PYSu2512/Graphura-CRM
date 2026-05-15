'use strict';

const express         = require('express');
const router          = express.Router();
const { requireUser } = require('../middleware/auth');
const ctrl            = require('../controllers/salesManagerReports.controller');

router.use(requireUser);

router.get('/overview',      ctrl.getOverview);
router.get('/teams',         ctrl.getTeams);
router.get('/team-leaders',  ctrl.getTeamLeaders);
router.get('/executives',    ctrl.getExecutives);

module.exports = router;
