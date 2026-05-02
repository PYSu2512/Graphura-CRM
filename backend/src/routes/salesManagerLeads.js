const express = require('express');
const router = express.Router();
const bulkLeadUploadController = require('../controllers/bulkLeadUpload.controller');
const { requireUser } = require('../middleware/auth');
const { requireSalesManager } = require('../middleware/leadUpload');
const upload = require('../middleware/upload');

// Base path: /api/sales-manager/leads

router.get('/', requireUser, requireSalesManager, bulkLeadUploadController.getAllLeads);
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
  requireSalesManager,
  bulkLeadUploadController.assignLead
);

router.post(
  '/bulk/:uploadId/assign-batch',
  requireUser,
  requireSalesManager,
  bulkLeadUploadController.assignBatchLeads
);

router.delete(
  '/:leadId',
  requireUser,
  requireSalesManager,
  bulkLeadUploadController.deleteLead
);

module.exports = router;
