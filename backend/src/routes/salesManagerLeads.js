const express = require('express');
const router = express.Router();
const bulkLeadUploadController = require('../controllers/bulkLeadUpload.controller');
const { requireUser } = require('../middleware/auth');
const { requireSalesManager, requireLeadAssigner } = require('../middleware/leadUpload');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  singleAssignSchema,
  bulkAssignSchema,
  batchAssignSchema,
  distributeLeadsSchema,
  assignmentTargetsQuerySchema,
} = require('../validators/leadAssignment.validator');

// Base path: /api/sales-manager/leads

router.get('/', requireUser, requireLeadAssigner, bulkLeadUploadController.getAllLeads);
router.get('/assigned', requireUser, requireLeadAssigner, bulkLeadUploadController.getAssignedLeads);

router.get(
  '/assignment-targets',
  requireUser,
  requireLeadAssigner,
  validate(assignmentTargetsQuerySchema, 'query'),
  bulkLeadUploadController.getAssignmentTargets
);

router.get('/bulk/template', requireUser, requireSalesManager, bulkLeadUploadController.downloadTemplate);

router.post(
  '/bulk/preview',
  requireUser,
  requireSalesManager,
  upload.single('file'),
  bulkLeadUploadController.previewUpload
);

router.post(
  '/bulk/:uploadId/commit',
  requireUser,
  requireSalesManager,
  bulkLeadUploadController.commitUpload
);

router.get(
  '/bulk/:uploadId/status',
  requireUser,
  requireSalesManager,
  bulkLeadUploadController.getStatus
);

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

router.post(
  '/bulk/distribute',
  requireUser,
  requireLeadAssigner,
  validate(distributeLeadsSchema, 'body'),
  bulkLeadUploadController.distributeLeads
);

router.post(
  '/bulk/:uploadId/assign-batch',
  requireUser,
  requireLeadAssigner,
  validate(batchAssignSchema, 'body'),
  bulkLeadUploadController.assignBatchLeads
);

router.delete(
  '/:leadId',
  requireUser,
  requireSalesManager,
  bulkLeadUploadController.deleteLead
);

module.exports = router;
