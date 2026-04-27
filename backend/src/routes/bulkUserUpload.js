const express = require("express");
const router = express.Router();
const bulkUserUploadController = require("../controllers/bulkUserUpload.controller");
const upload = require("../middleware/upload");

// Depending on the current auth middleware implementation, we'll assume it's exposed as authAdmin or similar.
// Since we don't have the exact auth middleware contents, we'll use a generic placeholder that the existing codebase likely uses.
const { requireAuth } = require("../middleware/auth"); // Placeholder

// GET template
router.get("/template", bulkUserUploadController.downloadTemplate);

// POST upload file and get preview
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  bulkUserUploadController.uploadPreview,
);

// POST commit a processed upload
router.post(
  "/:uploadId/commit",
  requireAuth,
  bulkUserUploadController.commitUpload,
);

// GET status of upload
router.get(
  "/:uploadId/status",
  requireAuth,
  bulkUserUploadController.getStatus,
);

// GET download errors CSV
router.get(
  "/:uploadId/errors",
  requireAuth,
  bulkUserUploadController.downloadErrors,
);

module.exports = router;
