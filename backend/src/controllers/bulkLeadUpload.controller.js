'use strict';

const { BulkLeadUpload } = require('../models');
const bulkLeadUploadService = require('../services/bulkLeadUpload.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');

/**
 * GET /api/sales-manager/leads/bulk/template
 * Returns a sample CSV template for bulk lead upload
 */
exports.downloadTemplate = catchAsync(async (req, res) => {
  const header = 'NAME,MOBILE,EMAIL,COMPANY NAME\n';
  const sample = 'Rahul Sharma,9876543210,rahul@example.com,Google\n' +
                 'Priya Gupta,9888777666,priya@business.in,Amazon\n';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=lead_template.csv');
  res.status(200).send(header + sample);
});

/**
 * POST /api/sales-manager/leads/bulk/preview
 */
exports.previewUpload = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded.', 400));
  }

  const fileType = req.file.mimetype === 'text/csv' || req.file.originalname.endsWith('.csv') ? 'CSV' : 'EXCEL';

  const newUpload = new BulkLeadUpload({
    admin: req.admin._id,
    uploadedBy: req.user._id,
    fileType,
    fileName: req.file.originalname,
    fileUrl: req.file.path,
    status: 'PROCESSING'
  });
  await newUpload.save();

  const preview = await bulkLeadUploadService.processUploadPreview(newUpload._id);

  res.status(200).json(
    new ApiResponse(200, {
      uploadId: preview.uploadId,
      summary: preview.summary,
      previewRows: preview.previewRows
    }, 'Preview generated successfully')
  );
});

/**
 * POST /api/sales-manager/leads/bulk/:uploadId/commit
 */
exports.commitUpload = catchAsync(async (req, res, next) => {
  const { uploadId } = req.params;
  const result = await bulkLeadUploadService.commitUpload(uploadId);

  res.status(200).json(
    new ApiResponse(200, {
      uploadId: result._id,
      importedCount: result.imported,
      failedCount: result.failedRows.length,
      status: result.status
    }, 'Upload committed successfully')
  );
});

/**
 * GET /api/sales-manager/leads/bulk/:uploadId/status
 */
exports.getStatus = catchAsync(async (req, res, next) => {
  const { uploadId } = req.params;
  const upload = await BulkLeadUpload.findOne({ _id: uploadId, admin: req.admin._id });
  if (!upload) return next(new AppError('Upload not found', 404));
  res.status(200).json(new ApiResponse(200, upload, 'Status retrieved successfully'));
});

/**
 * GET /api/sales-manager/leads
 */
exports.getAllLeads = catchAsync(async (req, res) => {
  const { Lead } = require('../models');
  
  const leads = await Lead.find({ 
    admin: req.admin._id,
    isDeleted: { $ne: true } 
  })
  .populate({
    path: 'client',
    select: 'name email mobile companyName'
  })
  .populate('assignedTo', 'name email role')
  .sort({ createdAt: -1 });

  const flatLeads = leads.map(l => ({
    id: l._id,
    name: l.client?.name || '',
    email: l.client?.email || '',
    mobile: l.client?.mobile || '',
    companyName: l.client?.companyName || '',
    status: l.status,
    createdAt: l.createdAt.toISOString().split('T')[0],
    assignedTo: l.assignedTo ? l.assignedTo.name : 'Unassigned',
    assignedAt: l.updatedAt.toISOString().split('T')[0]
  }));

  res.status(200).json(new ApiResponse(200, flatLeads, 'Leads retrieved successfully'));
});

/**
 * POST /api/sales-manager/leads/:leadId/assign
 */
exports.assignLead = catchAsync(async (req, res, next) => {
  const { leadId } = req.params;
  const { userId } = req.body;
  const result = await bulkLeadUploadService.assignLead(req.admin._id, leadId, userId, req.user._id);
  res.status(200).json(new ApiResponse(200, result, 'Lead assigned successfully'));
});

/**
 * POST /api/sales-manager/leads/bulk/:uploadId/assign-batch
 */
exports.assignBatchLeads = catchAsync(async (req, res, next) => {
  const { uploadId } = req.params;
  const { userId } = req.body;
  const result = await bulkLeadUploadService.assignBatchLeads(req.admin._id, uploadId, userId, req.user._id);
  res.status(200).json(new ApiResponse(200, result, `Successfully assigned ${result.count} leads`));
});

/**
 * DELETE /api/sales-manager/leads/:leadId
 */
exports.deleteLead = catchAsync(async (req, res, next) => {
  const { Lead, Client } = require('../models');
  const { leadId } = req.params;

  const lead = await Lead.findOne({ _id: leadId, admin: req.admin._id });
  if (!lead) return next(new AppError('Lead not found', 404));

  // To allow re-upload, we need to remove the Client as well (since mobile is unique)
  const clientId = lead.client;
  
  await Lead.deleteOne({ _id: leadId });
  await Client.deleteOne({ _id: clientId });

  res.status(200).json(new ApiResponse(200, null, 'Lead and client deleted permanently'));
});
