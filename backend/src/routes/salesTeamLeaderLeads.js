const express = require('express');
const router = express.Router();
const salesTeamLeaderController = require('../controllers/salesTeamLeader.controller');
const bulkLeadUploadController = require('../controllers/bulkLeadUpload.controller');
const { requireUser } = require('../middleware/auth');
const { requireLeadAssigner } = require('../middleware/leadUpload');
const validate = require('../middleware/validate');
const {
  singleAssignSchema,
  bulkAssignSchema,
} = require('../validators/leadAssignment.validator');

// Base path: /api/sales-team-leader/leads

// Consolidate Workspace (Returns pool, assigned, and targets in ONE call)
router.get('/workspace', requireUser, requireLeadAssigner, salesTeamLeaderController.getWorkspace);

// Keep the specific target role endpoint if needed for dynamic role selection, 
// but workspace handles the default SALES_EXECUTIVE case.
router.get(
  '/assignment-targets',
  requireUser,
  requireLeadAssigner,
  bulkLeadUploadController.getAssignmentTargets
);

// Assign Actions
router.post(
  '/:leadId/assign',
  requireUser,
  requireLeadAssigner,
  validate(singleAssignSchema, 'body'),
  bulkLeadUploadController.assignLead
);

router.post(
  '/bulk/transfer',
  requireUser,
  requireLeadAssigner,
  validate(bulkAssignSchema, 'body'),
  bulkLeadUploadController.bulkAssignLeads
);

module.exports = router;
