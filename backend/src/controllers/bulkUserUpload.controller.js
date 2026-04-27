const fs = require('fs');
const path = require('path');
const { BulkUserUpload } = require('../models');
const bulkUserUploadService = require('../services/bulkUserUpload.service');
const { uploadOptionsSchema, commitUploadSchema } = require('../validators/bulkUserUpload.validator');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');

exports.uploadPreview = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const { error, value } = uploadOptionsSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const fileType = req.file.mimetype === 'text/csv' || req.file.originalname.endsWith('.csv') ? 'CSV' : 'EXCEL';

  const newUpload = new BulkUserUpload({
    admin: req.admin._id,
    uploadedBy: req.user ? req.user._id : req.admin._id,
    uploadedByType: req.user ? 'USER' : 'ADMIN',
    fileType,
    fileName: req.file.originalname,
    fileUrl: req.file.path,
    options: {
      skipDuplicates: value.skipDuplicates,
      strictMode: value.strictMode
    }
  });

  await newUpload.save();

  // Call service to generate preview
  const preview = await bulkUserUploadService.processUploadPreview(newUpload._id);

  const data = {
    uploadId: preview._id,
    summary: {
      totalRows: preview.totalRows,
      validRows: preview.validRows,
      invalidRows: preview.invalidRows,
      duplicates: preview.duplicates,
      status: preview.status
    },
    previewErrors: preview.failedRows.slice(0, 50) // Return first 50 errors for preview
  };

  res.status(200).json(new ApiResponse(200, data, 'Preview generated successfully'));
});

exports.commitUpload = catchAsync(async (req, res, next) => {
  const { uploadId } = req.params;
  
  const { error, value } = commitUploadSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const upload = await BulkUserUpload.findOne({ _id: uploadId, admin: req.admin._id });
  if (!upload) {
    return next(new AppError('Upload not found', 404));
  }

  const result = await bulkUserUploadService.commitUpload(uploadId, value.confirm, 'VALID_ONLY');

  const data = {
    uploadId: result._id,
    imported: result.imported,
    failed: result.failedRows.length,
    status: result.status
  };

  res.status(200).json(new ApiResponse(200, data, 'Upload committed successfully'));
});

exports.getStatus = catchAsync(async (req, res, next) => {
  const { uploadId } = req.params;
  const upload = await BulkUserUpload.findOne({ _id: uploadId, admin: req.admin._id })
    .select('-failedRows -errorMessages'); // Exclude heavy fields

  if (!upload) {
    return next(new AppError('Upload not found', 404));
  }

  res.status(200).json(new ApiResponse(200, upload, 'Status retrieved successfully'));
});

exports.downloadErrors = catchAsync(async (req, res, next) => {
  const { uploadId } = req.params;
  const upload = await BulkUserUpload.findOne({ _id: uploadId, admin: req.admin._id });

  if (!upload) {
    return next(new AppError('Upload not found', 404));
  }

  if (!upload.failedRows || upload.failedRows.length === 0) {
    return next(new AppError('No errors found for this upload', 400));
  }

  const csvContent = bulkUserUploadService.generateErrorCsv(upload.failedRows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=errors-${uploadId}.csv`);
  res.status(200).send(csvContent);
});

exports.downloadTemplate = catchAsync(async (req, res, next) => {
  const header = 'name,email,phone,department,role,team\n';
  const sample = 'John Doe,john@example.com,9876543210,SALES,SALES_EXECUTIVE,Alpha Team\n';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=bulk-user-template.csv');
  res.status(200).send(header + sample);
});
