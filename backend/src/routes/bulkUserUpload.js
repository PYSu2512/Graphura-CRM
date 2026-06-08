const express = require('express');
const router  = express.Router();
const bulkUserUploadController = require('../controllers/bulkUserUpload.controller');
const upload = require('../middleware/upload');
const addToCrmCollection = require('../middleware/cloudinaryCollection');
const { requireAdmin } = require('../middleware/auth');

// GET template — public, no auth needed to download the template
router.get('/template', bulkUserUploadController.downloadTemplate);

// POST /api/users/bulk/upload — parse file and return preview
router.post(
  '/upload',
  requireAdmin,
  upload.single('file'),
  addToCrmCollection,
  bulkUserUploadController.uploadPreview,
);

// POST /api/users/bulk/:uploadId/commit — insert valid rows
router.post(
  '/:uploadId/commit',
  requireAdmin,
  bulkUserUploadController.commitUpload,
);

// GET /api/users/bulk/:uploadId/status — job lifecycle status
router.get(
  '/:uploadId/status',
  requireAdmin,
  bulkUserUploadController.getStatus,
);

// GET /api/users/bulk/:uploadId/errors — downloadable error CSV
router.get(
  '/:uploadId/errors',
  requireAdmin,
  bulkUserUploadController.downloadErrors,
);

module.exports = router;

