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
  const { Lead, LeadAssignmentHistory } = require('../models');
  
  const query = { 
    admin: req.admin._id,
    isDeleted: { $ne: true } 
  };

  const leads = await Lead.find(query)
  .populate({
    path: 'client',
    select: 'name email mobile companyName'
  })
  .populate('assignedTo', 'name email role')
  .populate('assignedBy', 'name email role')
  .populate('team', 'name')
  .sort({ createdAt: -1 });

  const assignmentHistory = await LeadAssignmentHistory.find({
    admin: req.admin._id,
    lead: { $in: leads.map((lead) => lead._id) },
  })
    .sort({ assignedAt: -1 })
    .select('lead assignedAt reason')
    .lean();

  const latestAssignmentByLead = new Map();
  for (const entry of assignmentHistory) {
    const leadId = String(entry.lead);
    if (!latestAssignmentByLead.has(leadId)) {
      latestAssignmentByLead.set(leadId, entry);
    }
  }

  const flatLeads = leads.map(l => ({
    id: l._id,
    name: l.client?.name || '',
    email: l.client?.email || '',
    mobile: l.client?.mobile || '',
    companyName: l.client?.companyName || '',
    status: l.status,
    isDumped: Boolean(l.isDumped),
    dumpReason: l.dumpReason || null,
    createdAt: l.createdAt.toISOString().split('T')[0],
    assignedTo: l.assignedTo ? l.assignedTo.name : 'Unassigned',
    assignedBy: l.assignedBy ? l.assignedBy.name : 'Unassigned',
    team: l.team ? l.team.name : 'No Team',
    assignedAt: latestAssignmentByLead.get(String(l._id))?.assignedAt
      ? new Date(latestAssignmentByLead.get(String(l._id)).assignedAt).toISOString().split('T')[0]
      : l.updatedAt.toISOString().split('T')[0],
    assignmentReason: latestAssignmentByLead.get(String(l._id))?.reason || null,
  }));

  res.status(200).json(new ApiResponse(200, flatLeads, 'Leads retrieved successfully'));
});

/**
 * GET /api/sales-manager/leads/assigned
 */
exports.getAssignedLeads = catchAsync(async (req, res) => {
  const { Lead, LeadAssignmentHistory } = require('../models');

  const query = {
    admin: req.admin._id,
    isDeleted: { $ne: true },
    isDumped: { $ne: true },
    assignedTo: { $ne: null },
  };

  const leads = await Lead.find(query)
    .populate({
      path: 'client',
      select: 'name email mobile companyName',
    })
    .populate('assignedTo', 'name email role')
    .populate('assignedBy', 'name email role')
    .populate('team', 'name')
    .sort({ updatedAt: -1 });

  const assignmentHistory = await LeadAssignmentHistory.find({
    admin: req.admin._id,
    lead: { $in: leads.map((lead) => lead._id) },
  })
    .sort({ assignedAt: -1 })
    .select('lead assignedAt reason')
    .lean();

  const latestAssignmentByLead = new Map();
  for (const entry of assignmentHistory) {
    const leadId = String(entry.lead);
    if (!latestAssignmentByLead.has(leadId)) {
      latestAssignmentByLead.set(leadId, entry);
    }
  }

  const flatLeads = leads.map((l) => ({
    id: l._id,
    name: l.client?.name || '',
    email: l.client?.email || '',
    mobile: l.client?.mobile || '',
    companyName: l.client?.companyName || '',
    status: l.status,
    isDumped: Boolean(l.isDumped),
    dumpReason: l.dumpReason || null,
    createdAt: l.createdAt.toISOString().split('T')[0],
    assignedTo: l.assignedTo ? l.assignedTo.name : 'Unassigned',
    assignedBy: l.assignedBy ? l.assignedBy.name : 'Unassigned',
    team: l.team ? l.team.name : 'No Team',
    assignedAt: latestAssignmentByLead.get(String(l._id))?.assignedAt
      ? new Date(latestAssignmentByLead.get(String(l._id)).assignedAt).toISOString().split('T')[0]
      : l.updatedAt.toISOString().split('T')[0],
    assignmentReason: latestAssignmentByLead.get(String(l._id))?.reason || null,
  }));

  res.status(200).json(new ApiResponse(200, flatLeads, 'Assigned leads retrieved successfully'));
});

/**
 * GET /api/sales-manager/leads/assignment-targets
 */
exports.getAssignmentTargets = catchAsync(async (req, res) => {
  const targetRole = req.query.role ? String(req.query.role).trim() : null;
  const result = await bulkLeadUploadService.getAssignmentTargets(req.admin._id, req.user, targetRole);

  res.status(200).json(
    new ApiResponse(200, result, 'Assignment targets retrieved successfully')
  );
});

/**
 * POST /api/sales-manager/leads/:leadId/assign
 */
exports.assignLead = catchAsync(async (req, res, next) => {
  const { leadId } = req.params;
  const { userId, reason = null } = req.body;
  const result = await bulkLeadUploadService.assignLead(req.admin._id, leadId, userId, req.user, reason);
  res.status(200).json(new ApiResponse(200, result, 'Lead assigned successfully'));
});

/**
 * POST /api/sales-manager/leads/bulk/assign
 */
exports.bulkAssignLeads = catchAsync(async (req, res) => {
  const { leadIds, userId, reason = null } = req.body;
  const result = await bulkLeadUploadService.assignBulkLeads(req.admin._id, leadIds, userId, req.user, reason);

  res.status(200).json(
    new ApiResponse(200, result, `Successfully assigned ${result.assignedCount} leads`)
  );
});

/**
 * POST /api/sales-manager/leads/bulk/distribute
 */
exports.distributeLeads = catchAsync(async (req, res) => {
  const { assignments } = req.body;
  const result = await bulkLeadUploadService.distributeLeads(req.admin._id, assignments, req.user);

  if (!result.assignedCount || result.assignedCount <= 0) {
    const groups = Array.isArray(result.groups) ? result.groups : [];
    const missingCount = groups.reduce((sum, group) => sum + (Array.isArray(group.skippedLeadIds) ? group.skippedLeadIds.length : 0), 0);
    const alreadyAssignedCount = groups.reduce(
      (sum, group) => sum + (Array.isArray(group.skipped)
        ? group.skipped.filter((entry) => entry.reason === 'ALREADY_ASSIGNED').length
        : 0),
      0
    );
    const totalSkipped = Number(result.skippedCount || 0);

    throw new AppError(
      `No leads were assigned. skipped=${totalSkipped}, missing=${missingCount}, alreadyAssigned=${alreadyAssignedCount}. Refresh leads and retry.`,
      409
    );
  }

  res.status(200).json(
    new ApiResponse(200, result, `Successfully distributed ${result.assignedCount} leads`)
  );
});

/**
 * POST /api/sales-manager/leads/bulk/:uploadId/assign-batch
 */
exports.assignBatchLeads = catchAsync(async (req, res, next) => {
  const { uploadId } = req.params;
  const { leadIds = [], userId, reason = null } = req.body;
  const result = await bulkLeadUploadService.assignBatchLeads(req.admin._id, uploadId, leadIds, userId, req.user, reason);

  res.status(200).json(
    new ApiResponse(200, result, `Successfully assigned ${result.assignedCount} leads`)
  );
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

/**
 * GET /api/sales-executive/leads
 * Fetch leads assigned to the current Sales Executive
 */
exports.getMyAssignedLeads = catchAsync(async (req, res, next) => {
  const { Lead, LeadAssignmentHistory } = require('../models');

  if (req.user?.role !== 'SALES_EXECUTIVE') {
    return next(new AppError('Only Sales Executive users can access this resource', 403));
  }

  // Strict filtering: only this executive's leads
  const query = {
    admin: req.admin._id,
    assignedTo: req.user._id,
    isDeleted: { $ne: true },
    // Note: Keep isDumped leads to show dump history, but frontend can filter if needed
  };

  // Fetch leads with all necessary relationships
  const leads = await Lead.find(query)
    .populate({
      path: 'client',
      select: 'name email mobile companyName'
    })
    .populate('assignedTo', 'name email role')
    .populate('assignedBy', 'name email role')
    .populate('team', 'name')
    .sort({ updatedAt: -1 })
    .lean();

  // Keep only leads assigned by Sales Team Leaders as requested business rule.
  const leadsAssignedByTL = leads.filter((lead) => lead.assignedBy?.role === 'SALES_TL');

  // Get assignment history for latest assignment metadata
  const assignmentHistory = await LeadAssignmentHistory.find({
    admin: req.admin._id,
    lead: { $in: leadsAssignedByTL.map((lead) => lead._id) },
  })
    .sort({ assignedAt: -1 })
    .select('lead assignedAt reason')
    .lean();

  // Build map of latest assignment per lead
  const latestAssignmentByLead = new Map();
  for (const entry of assignmentHistory) {
    const leadId = String(entry.lead);
    if (!latestAssignmentByLead.has(leadId)) {
      latestAssignmentByLead.set(leadId, entry);
    }
  }

  // Transform to frontend format
  const transformedLeads = leadsAssignedByTL.map((l) => ({
    id: l._id,
    name: l.client?.name || '',
    email: l.client?.email || '',
    mobile: l.client?.mobile || '',
    companyName: l.client?.companyName || '',
    status: l.status || 'UNTOUCHED',
    isDumped: Boolean(l.isDumped),
    dumpReason: l.dumpReason || null,
    createdAt: l.createdAt ? new Date(l.createdAt).toISOString().split('T')[0] : '',
    assignedTo: l.assignedTo ? l.assignedTo.name : 'Unassigned',
    assignedBy: l.assignedBy ? l.assignedBy.name : 'Unassigned',
    team: l.team ? l.team.name : 'No Team',
    assignedAt: latestAssignmentByLead.get(String(l._id))?.assignedAt
      ? new Date(latestAssignmentByLead.get(String(l._id)).assignedAt).toISOString().split('T')[0]
      : (l.updatedAt ? new Date(l.updatedAt).toISOString().split('T')[0] : ''),
    assignmentReason: latestAssignmentByLead.get(String(l._id))?.reason || null,
  }));

  // Calculate status statistics
  const stats = {
    totalLeads: transformedLeads.length,
    talk: transformedLeads.filter((l) => l.status === 'TALK').length,
    interested: transformedLeads.filter((l) => l.status === 'INTERESTED').length,
    dumped: transformedLeads.filter((l) => l.isDumped === true).length,
    untouched: transformedLeads.filter((l) => l.status === 'UNTOUCHED').length,
    notTalk: transformedLeads.filter((l) => l.status === 'NOT_TALK').length,
    converted: transformedLeads.filter((l) => l.status === 'CONVERTED').length,
  };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        leads: transformedLeads,
        stats,
      },
      'Leads retrieved successfully'
    )
  );
});
