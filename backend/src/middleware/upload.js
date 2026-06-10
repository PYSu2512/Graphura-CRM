"use strict";

/**
 * upload.js — Multer middleware
 *
 * Uses multer memoryStorage + Cloudinary v2 SDK upload_stream.
 * This approach works correctly with cloudinary@^2.x (SDK v2).
 *
 * The old multer-storage-cloudinary adapter is NOT used because it
 * only supports cloudinary@^1.x (SDK v1) and cannot be installed
 * alongside cloudinary@^2.x without peer-dep conflicts.
 *
 * Usage:
 *   router.post('/upload', upload.single('file'), uploadToCloudinary, handler);
 *
 * After uploadToCloudinary runs:
 *   req.cloudinaryResult — full Cloudinary upload result object
 *   req.file.cloudinaryUrl — the secure_url shortcut
 */

const multer  = require('multer');
const path    = require('path');
const cloudinary = require('../config/cloudinary');

// ── Allowed extensions ────────────────────────────────────────────────────────
const ALLOWED_EXT = new Set(['.csv', '.xlsx', '.xls', '.pdf', '.jpg', '.jpeg', '.png']);
const RAW_EXT     = new Set(['.csv', '.xlsx', '.xls', '.pdf']);

// ── Multer: store file in memory (buffer), validate extension ─────────────────
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXT.has(ext)) return cb(null, true);
  cb(new Error(`File type not supported. Allowed: ${[...ALLOWED_EXT].join(', ')}`), false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── Cloudinary stream-upload middleware (run AFTER multer) ────────────────────
const uploadToCloudinary = (req, _res, next) => {
  // No file attached — skip (route handler decides if file is required)
  if (!req.file) return next();

  const ext        = path.extname(req.file.originalname).toLowerCase();
  const isRaw      = RAW_EXT.has(ext);
  const publicId   = `${path.parse(req.file.originalname).name}-${Date.now()}`;

  const stream = cloudinary.uploader.upload_stream(
    {
      folder:        'crm',
      resource_type: isRaw ? 'raw' : 'auto',
      public_id:     publicId,
      tags:          ['crm'],
    },
    (error, result) => {
      if (error) return next(error);
      req.cloudinaryResult    = result;
      req.file.cloudinaryUrl  = result.secure_url;
      next();
    },
  );

  stream.end(req.file.buffer);
};

module.exports = upload;
module.exports.uploadToCloudinary = uploadToCloudinary;
