'use strict';

const mongoose = require('mongoose');
const {
  BulkLeadUpload,
  Client,
  Lead,
  User,
  Admin,
  Team,
  DataLimitOverride,
  LeadAssignmentHistory,
  AuditLog,
  Notification,
} = require('../models');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');
const AppError = require('../utils/appError');

const ASSIGNMENT_RULES = {
  SALES_MANAGER: ['SALES_TL', 'SALES_EXECUTIVE'],
  SALES_TL: ['SALES_EXECUTIVE'],
  ADMIN: ['SALES_TL', 'SALES_EXECUTIVE'],
  SUPER_ADMIN: ['SALES_TL', 'SALES_EXECUTIVE'],
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeIds = (values = []) => [...new Set(values.filter((value) => value !== null && value !== undefined && value !== '').map((value) => String(value)).filter(Boolean))];

const resolveAllowedTargetRoles = (performerRole) => ASSIGNMENT_RULES[performerRole] || [];

const resolveEffectiveLimit = async (adminId, user) => {
  const [admin, dataOverride] = await Promise.all([
    Admin.findById(adminId).select('leadLimits').lean(),
    DataLimitOverride.findOne({ admin: adminId }).lean(),
  ]);

  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  const role = user.role;
  const individualLimit = user.leadDataLimit;
  const overrideLimit = dataOverride?.leadLimits?.[role];
  const adminDefault = admin.leadLimits?.[role];

  return individualLimit ?? overrideLimit ?? adminDefault ?? 0;
};

const resolveUserTeam = async (adminId, userId, role) => {
  if (role === 'SALES_MANAGER' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return null;
  }

  const query = role === 'SALES_TL'
    ? { admin: adminId, isDeleted: false, isActive: true, leader: userId }
    : { admin: adminId, isDeleted: false, isActive: true, 'members.user': userId };

  const team = await Team.findOne(query).select('_id name leader members department').lean();
  if (!team) {
    throw new AppError(
      role === 'SALES_TL'
        ? 'This sales team leader is not assigned to any active team.'
        : 'This sales executive is not assigned to any active team.',
      409
    );
  }

  return team;
};

const resolveCurrentAssignmentCount = async (adminId, userId) => {
  return Lead.countDocuments({
    admin: adminId,
    assignedTo: userId,
    isDeleted: { $ne: true },
    isDumped: { $ne: true },
  });
};

const createAssignmentNotification = async ({ adminId, userId, leadCount, performedByName }) => {
  await Notification.create({
    admin: adminId,
    user: userId,
    title: 'Leads assigned',
    body: `${leadCount} lead${leadCount === 1 ? '' : 's'} assigned by ${performedByName}.`,
    type: 'LEAD_ASSIGNED',
  });
};

const writeAssignmentAudit = async ({
  adminId,
  performedBy,
  performerType,
  action,
  leadId,
  before,
  after,
  note,
}) => {
  await AuditLog.create({
    admin: adminId,
    performedBy,
    performerType,
    action,
    targetModel: 'Lead',
    targetId: leadId,
    before,
    after,
    note,
  });
};

const writeAssignmentHistory = async ({
  adminId,
  leadId,
  assignedTo,
  assignedBy,
  team,
  reason,
}) => {
  await LeadAssignmentHistory.create({
    admin: adminId,
    lead: leadId,
    assignedTo,
    assignedBy,
    team,
    reason: reason || null,
    assignedAt: new Date(),
  });
};

const releasePreviousAssignment = async ({ adminId, leadId, newAssigneeId }) => {
  await LeadAssignmentHistory.findOneAndUpdate(
    {
      admin: adminId,
      lead: leadId,
      releasedAt: null,
      assignedTo: { $ne: newAssigneeId },
    },
    {
      $set: { releasedAt: new Date() },
    },
    { sort: { assignedAt: -1 } }
  );
};

const buildTargetPreview = async ({ adminId, user, team }) => {
  const effectiveLimit = await resolveEffectiveLimit(adminId, user);
  const currentAssigned = await resolveCurrentAssignmentCount(adminId, user._id);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    team: team ? {
      id: team._id,
      name: team.name,
    } : null,
    currentAssigned,
    effectiveLimit,
    remaining: Math.max(effectiveLimit - currentAssigned, 0),
  };
};

const normalizeAssignments = (assignments) => {
  const grouped = new Map();
  for (const assignment of assignments) {
    const userId = String(assignment.userId);
    const leadIds = normalizeIds(assignment.leadIds || []);
    if (!grouped.has(userId)) {
      grouped.set(userId, { userId, leadIds: [], reasons: [] });
    }
    const bucket = grouped.get(userId);
    bucket.leadIds.push(...leadIds);
    if (assignment.reason) {
      bucket.reasons.push(String(assignment.reason));
    }
  }
  return [...grouped.values()].map((group) => ({
    userId: group.userId,
    leadIds: normalizeIds(group.leadIds),
    reason: group.reasons.filter(Boolean).join(' | ') || null,
  }));
};

const getLeadAssignments = async (adminId, leadIds) => {
  const leads = await Lead.find({
    _id: { $in: leadIds },
    admin: adminId,
    isDeleted: { $ne: true },
    isDumped: { $ne: true },
  }).populate('assignedTo', 'name email role').populate('client', 'name email mobile companyName');

  const foundIds = new Set(leads.map((lead) => String(lead._id)));
  const missing = leadIds.filter((id) => !foundIds.has(String(id)));

  return { leads, missing };
};

const assignLeadsToUser = async ({
  adminId,
  leadIds,
  userId,
  performedBy,
  reason = null,
  performerRole,
  allowPartialMissing = false,
}) => {
  const normalizedLeadIds = normalizeIds(leadIds);
  if (normalizedLeadIds.length === 0) {
    throw new AppError('Select at least one lead to assign.', 400);
  }

  if (!isValidObjectId(userId)) {
    throw new AppError('Invalid target user.', 400);
  }

  const allowedRoles = resolveAllowedTargetRoles(performerRole);
  if (allowedRoles.length === 0) {
    throw new AppError('You do not have permission to assign leads.', 403);
  }

  const targetUser = await User.findOne({
    _id: userId,
    admin: adminId,
    isDeleted: false,
    isActive: true,
    approvalStatus: 'APPROVED',
    role: { $in: allowedRoles },
  }).select('name email phone role department leadDataLimit fcmToken');

  if (!targetUser) {
    throw new AppError('Target user not found or not allowed for lead assignment.', 404);
  }

  const targetTeam = await resolveUserTeam(adminId, targetUser._id, targetUser.role);
  const performerTeam = performedBy.role === 'SALES_TL'
    ? await resolveUserTeam(adminId, performedBy._id, performedBy.role)
    : null;

  if (performedBy.role === 'SALES_TL') {
    const targetTeamId = String(targetTeam?._id || '');
    const performerTeamId = String(performerTeam?._id || '');
    if (!targetTeamId || !performerTeamId || targetTeamId !== performerTeamId) {
      throw new AppError('Sales TL can only assign leads to executives in the same team.', 403);
    }
  }

  const { leads, missing } = await getLeadAssignments(adminId, normalizedLeadIds);
  const currentAssignedCount = await resolveCurrentAssignmentCount(adminId, targetUser._id);
  const effectiveLimit = await resolveEffectiveLimit(adminId, targetUser);

  if (leads.length === 0) {
    if (allowPartialMissing) {
      return {
        targetUser: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
        },
        assignedCount: 0,
        skippedCount: missing.length,
        skippedLeadIds: missing,
        assigned: [],
        skipped: missing.map((leadId) => ({ leadId, reason: 'NOT_FOUND' })),
        effectiveLimit,
        currentAssignedCount,
        remainingAfterAssignment: Math.max(effectiveLimit - currentAssignedCount, 0),
        targetTeam: targetTeam ? { id: targetTeam._id, name: targetTeam.name } : null,
      };
    }

    throw new AppError(`Lead not found for id(s): ${missing.join(', ')}`, 404);
  }

  const leadsToChange = leads.filter((lead) => String(lead.assignedTo?._id || lead.assignedTo || '') !== String(targetUser._id));

  if (currentAssignedCount + leadsToChange.length > effectiveLimit) {
    throw new AppError(
      `Lead limit reached for ${targetUser.name}. Effective limit: ${effectiveLimit}, current: ${currentAssignedCount}, requested: ${leadsToChange.length}.`,
      409
    );
  }

  const now = new Date();
  const assigned = [];
  const skipped = [];

  for (const lead of leads) {
    const currentAssignedTo = String(lead.assignedTo?._id || lead.assignedTo || '');
    const targetAssignedTo = String(targetUser._id);
    const targetTeamId = targetTeam?._id || null;

    if (currentAssignedTo === targetAssignedTo && String(lead.team || '') === String(targetTeamId || '')) {
      skipped.push({ leadId: lead._id, reason: 'ALREADY_ASSIGNED' });
      continue;
    }

    const before = {
      assignedTo: currentAssignedTo || null,
      team: lead.team ? String(lead.team) : null,
    };

    await releasePreviousAssignment({ adminId, leadId: lead._id, newAssigneeId: targetUser._id });

    lead.assignedTo = targetUser._id;
    lead.assignedBy = performedBy._id;
    lead.team = targetTeamId;
    await lead.save();

    await writeAssignmentHistory({
      adminId,
      leadId: lead._id,
      assignedTo: targetUser._id,
      assignedBy: performedBy._id,
      team: targetTeamId,
      reason,
    });

    await writeAssignmentAudit({
      adminId,
      performedBy: performedBy._id,
      performerType: performedBy.role === 'ADMIN' ? 'ADMIN' : 'USER',
      action: currentAssignedTo ? 'LEAD_REASSIGNED' : 'LEAD_ASSIGNED',
      leadId: lead._id,
      before,
      after: {
        assignedTo: String(targetUser._id),
        team: targetTeamId ? String(targetTeamId) : null,
      },
      note: reason,
    });

    assigned.push({
      leadId: lead._id,
      client: lead.client,
      assignedTo: targetUser._id,
      assignedAt: now,
    });
  }

  if (assigned.length > 0) {
    await createAssignmentNotification({
      adminId,
      userId: targetUser._id,
      leadCount: assigned.length,
      performedByName: performedBy.name || 'your manager',
    });
  }

  return {
    targetUser: {
      id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
    },
    assignedCount: assigned.length,
    skippedCount: skipped.length,
    skippedLeadIds: missing,
    assigned,
    skipped,
    effectiveLimit,
    currentAssignedCount,
    remainingAfterAssignment: Math.max(effectiveLimit - (currentAssignedCount + assigned.length), 0),
    targetTeam: targetTeam ? { id: targetTeam._id, name: targetTeam.name } : null,
  };
};

const parseCsv = async (filePath) => {
  const content = fs.readFileSync(filePath);
  return parse(content, { columns: true, skip_empty_lines: true });
};

const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

// ─────────────────────────────────────────────────────────────
// ROW NORMALIZER
// ─────────────────────────────────────────────────────────────

const normalizeLeadRow = (row) => {
  const normalized = {};
  for (const key in row) {
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');

    // Map common variations to our expected keys
    let finalKey = normalizedKey;
    if (normalizedKey === 'name' || normalizedKey === 'company' || normalizedKey === 'companyname') finalKey = 'name';
    if (normalizedKey === 'email' || normalizedKey === 'emailid' || normalizedKey === 'emailaddress') finalKey = 'email';
    if (normalizedKey === 'mobile' || normalizedKey === 'phone' || normalizedKey === 'mobilenumber' || normalizedKey === 'phonenumber') finalKey = 'mobile';
    if (normalizedKey === 'companyname' || normalizedKey === 'organization' || normalizedKey === 'org') finalKey = 'companyName';

    normalized[finalKey] = typeof row[key] === 'string' ? row[key].trim() : row[key];
  }
  return normalized;
};

const EXPECTED_HEADERS = ['name', 'email', 'mobile', 'companyName'];

const validateFileStructure = (rows) => {
  if (!rows || rows.length === 0) {
    throw new Error('Uploaded file is empty. Add at least one data row.');
  }

  const firstRow = normalizeLeadRow(rows[0]);
  const headers = Object.keys(firstRow);
  const missingHeaders = EXPECTED_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Invalid file format. Missing required columns: ${missingHeaders.join(', ')}`);
  }
};

// ─────────────────────────────────────────────────────────────
// ROW VALIDATOR
// ─────────────────────────────────────────────────────────────

const validateRow = (row) => {
  const fieldErrors = [];

  if (!row.name) fieldErrors.push({ field: 'name', message: 'Name is required' });

  const email = row.email ? String(row.email).trim().toLowerCase() : '';
  if (!email) {
    fieldErrors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.push({ field: 'email', message: 'Invalid email format' });
  }

  const mobile = row.mobile ? String(row.mobile).replace(/\D/g, '') : '';
  if (!row.mobile) {
    fieldErrors.push({ field: 'mobile', message: 'Mobile number is required' });
  } else if (!/^\d{10}$/.test(mobile)) {
    fieldErrors.push({ field: 'mobile', message: 'Mobile must be exactly 10 digits' });
  }

  return fieldErrors;
};

// ─────────────────────────────────────────────────────────────
// PREVIEW
// ─────────────────────────────────────────────────────────────

exports.processUploadPreview = async (uploadId) => {
  const upload = await BulkLeadUpload.findById(uploadId);
  if (!upload) throw new Error('Upload not found');

  try {
    let rawRows = upload.fileType === 'CSV'
      ? await parseCsv(upload.fileUrl)
      : parseExcel(upload.fileUrl);

    validateFileStructure(rawRows);
    upload.totalRows = rawRows.length;

    // Existing clients/leads for duplicate detection
    const existingClients = await Client.find({ admin: upload.admin }, 'email mobile');
    const existingEmails = new Set(existingClients.map(c => c.email?.toLowerCase()).filter(Boolean));
    const existingMobiles = new Set(existingClients.map(c => c.mobile).filter(Boolean));

    const seenEmailsInFile = new Set();
    const seenMobilesInFile = new Set();
    const failedRows = [];

    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    const previewRows = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = normalizeLeadRow(rawRows[i]);
      const rowNumber = i + 2;
      const email = row.email ? row.email.toLowerCase() : '';
      const mobile = row.mobile ? String(row.mobile).replace(/\D/g, '') : '';

      const fieldErrors = validateRow(row);
      let isDuplicate = false;

      if (fieldErrors.length === 0) {
        if (existingEmails.has(email) || existingMobiles.has(mobile)) {
          isDuplicate = true;
          fieldErrors.push({ field: 'duplicate', message: 'Lead already exists in database' });
        } else if (seenEmailsInFile.has(email) || seenMobilesInFile.has(mobile)) {
          isDuplicate = true;
          fieldErrors.push({ field: 'duplicate', message: 'Duplicate lead in file' });
        }
      }

      if (fieldErrors.length > 0) {
        if (isDuplicate) duplicateCount++;
        else invalidCount++;

        failedRows.push({
          rowNumber,
          rawData: rawRows[i],
          reason: fieldErrors.map(e => e.message).join(' | '),
        });
      } else {
        validCount++;
        seenEmailsInFile.add(email);
        seenMobilesInFile.add(mobile);
      }

      // Add to preview rows (limit to first 10 for performance)
      if (i < 10) {
        previewRows.push({
          rowNumber,
          name: row.name,
          email,
          mobile,
          companyName: row.companyName,
          status: 'UNTOUCHED',
          validationStatus: fieldErrors.length > 0 ? 'INVALID' : 'VALID',
          errorReason: fieldErrors.length > 0 ? fieldErrors.map(e => e.message).join(' | ') : null
        });
      }
    }

    upload.validRows = validCount;
    upload.invalidRows = invalidCount;
    upload.duplicates = duplicateCount;
    upload.failedRows = failedRows;
    upload.status = 'PREVIEWED';
    await upload.save();

    return {
      uploadId: upload._id,
      summary: {
        totalRows: upload.totalRows,
        validRows: validCount,
        invalidRows: invalidCount,
        duplicateRows: duplicateCount
      },
      previewRows
    };
  } catch (error) {
    upload.status = 'FAILED';
    upload.errorMessages.push(error.message);
    await upload.save();
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// COMMIT
// ─────────────────────────────────────────────────────────────

exports.commitUpload = async (uploadId) => {
  const upload = await BulkLeadUpload.findById(uploadId);
  if (!upload) throw new Error('Upload not found');

  if (upload.status === 'DONE') throw new Error('Upload is already committed');

  try {
    upload.status = 'PROCESSING';
    await upload.save();

    let rawRows = upload.fileType === 'CSV'
      ? await parseCsv(upload.fileUrl)
      : parseExcel(upload.fileUrl);

    const existingClients = await Client.find({ admin: upload.admin }, 'email mobile');
    const existingEmails = new Set(existingClients.map(c => c.email?.toLowerCase()).filter(Boolean));
    const existingMobiles = new Set(existingClients.map(c => c.mobile).filter(Boolean));

    const seenEmailsInFile = new Set();
    const seenMobilesInFile = new Set();

    let importedCount = 0;
    const finalFailedRows = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = normalizeLeadRow(rawRows[i]);
      const rowNumber = i + 2;
      const email = row.email ? row.email.toLowerCase() : '';
      const mobile = row.mobile ? String(row.mobile).replace(/\D/g, '') : '';

      const fieldErrors = validateRow(row);
      if (fieldErrors.length > 0 || existingEmails.has(email) || existingMobiles.has(mobile) || seenEmailsInFile.has(email) || seenMobilesInFile.has(mobile)) {
        finalFailedRows.push({
          rowNumber,
          rawData: rawRows[i],
          reason: fieldErrors.length > 0 ? fieldErrors.map(e => e.message).join(' | ') : 'Duplicate'
        });
        continue;
      }

      // Create Client and Lead
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const client = await Client.create([{
          admin: upload.admin,
          name: row.name,
          email,
          mobile: mobile,
          companyName: row.companyName,
          source: 'CSV_UPLOAD',
          addedBy: upload.uploadedBy
        }], { session });

        await Lead.create([{
          admin: upload.admin,
          client: client[0]._id,
          status: 'UNTOUCHED',
          assignedTo: null,
          bulkUploadId: upload._id
        }], { session });

        await session.commitTransaction();
        importedCount++;
        seenEmailsInFile.add(email);
        seenMobilesInFile.add(mobile);
      } catch (err) {
        await session.abortTransaction();
        finalFailedRows.push({
          rowNumber,
          rawData: rawRows[i],
          reason: err.message
        });
      } finally {
        session.endSession();
      }
    }

    upload.imported = importedCount;
    upload.failedRows = finalFailedRows;
    upload.status = importedCount > 0 ? 'DONE' : 'FAILED';
    await upload.save();

    return upload;
  } catch (error) {
    upload.status = 'FAILED';
    upload.errorMessages.push(error.message);
    await upload.save();
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// ASSIGNMENT & EXPORT
// ─────────────────────────────────────────────────────────────

exports.generateErrorCsv = (failedRows) => {
  if (!failedRows || failedRows.length === 0) return '';
  const header = 'Row,Reason,Data\n';
  const rows = failedRows.map(f => {
    const dataStr = JSON.stringify(f.rawData).replace(/"/g, '""');
    return `${f.rowNumber},"${f.reason}","${dataStr}"`;
  }).join('\n');
  return header + rows;
};

exports.getAssignmentTargets = async (adminId, performer, targetRole = null) => {
  const performerRole = performer.role;
  const allowedRoles = resolveAllowedTargetRoles(performerRole);
  const effectiveAdminId = String(adminId?._id || adminId);

  if (allowedRoles.length === 0) {
    throw new AppError('You do not have permission to view assignment targets.', 403);
  }

  const roles = targetRole ? [targetRole] : allowedRoles;
  if (targetRole && !allowedRoles.includes(targetRole)) {
    throw new AppError('Target role is not allowed for your account.', 403);
  }

  const query = {
    admin: effectiveAdminId,
    isDeleted: false,
    isActive: true,
    approvalStatus: 'APPROVED',
    role: { $in: roles },
  };

  // If performer is a TL, only show members of their team
  if (performerRole === 'SALES_TL') {
    const team = await resolveUserTeam(effectiveAdminId, performer._id, performerRole);
    if (team && team.members) {
      const memberIds = team.members.map(m => m.user).filter(Boolean);
      query._id = { $in: memberIds };
    }
  }

  const users = await User.find(query).select('name email phone role leadDataLimit').sort({ name: 1 });

  const userIds = users.map((user) => user._id);
  const teams = await Team.find({
    admin: effectiveAdminId,
    isDeleted: false,
    isActive: true,
    $or: [{ leader: { $in: userIds } }, { 'members.user': { $in: userIds } }],
  }).select('_id name leader members').lean();

  const teamMap = new Map();
  for (const team of teams) {
    const leaderId = String(team.leader || '');
    if (leaderId) teamMap.set(leaderId, team);
    for (const member of team.members || []) {
      if (member?.user) teamMap.set(String(member.user), team);
    }
  }

  const targets = [];
  for (const user of users) {
    targets.push(await buildTargetPreview({
      adminId,
      user,
      team: teamMap.get(String(user._id)) || null,
    }));
  }

  return {
    targets,
    allowedRoles,
  };
};

exports.assignLead = async (adminId, leadId, userId, performer, reason = null) => {
  return assignLeadsToUser({
    adminId,
    leadIds: [leadId],
    userId,
    performedBy: performer,
    reason,
    performerRole: performer.role,
  });
};

exports.assignBulkLeads = async (adminId, leadIds, userId, performer, reason = null) => {
  return assignLeadsToUser({
    adminId,
    leadIds,
    userId,
    performedBy: performer,
    reason,
    performerRole: performer.role,
  });
};

exports.distributeLeads = async (adminId, assignments, performer) => {
  const normalizedAssignments = normalizeAssignments(assignments);
  const groups = [];

  for (const assignment of normalizedAssignments) {
    groups.push(await assignLeadsToUser({
      adminId,
      leadIds: assignment.leadIds,
      userId: assignment.userId,
      performedBy: performer,
      reason: assignment.reason,
      performerRole: performer.role,
      allowPartialMissing: true,
    }));
  }

  return {
    groups,
    assignedCount: groups.reduce((total, group) => total + group.assignedCount, 0),
    skippedCount: groups.reduce((total, group) => total + group.skippedCount, 0),
  };
};

exports.assignBatchLeads = async (adminId, uploadId, leadIds, userId, performer, reason = null) => {
  let effectiveLeadIds = normalizeIds(leadIds || []);

  if (effectiveLeadIds.length === 0) {
    const upload = await BulkLeadUpload.findOne({ _id: uploadId, admin: adminId });
    if (!upload) {
      throw new AppError('Upload not found', 404);
    }

    const uploadLeads = await Lead.find({
      admin: adminId,
      bulkUploadId: uploadId,
      isDeleted: { $ne: true },
      isDumped: { $ne: true },
    }).select('_id');

    effectiveLeadIds = uploadLeads.map((lead) => String(lead._id));
  }

  return assignLeadsToUser({
    adminId,
    leadIds: effectiveLeadIds,
    userId,
    performedBy: performer,
    reason,
    performerRole: performer.role,
  });
};

exports.__private__ = {
  isValidObjectId,
  normalizeIds,
  resolveAllowedTargetRoles,
  resolveEffectiveLimit,
  resolveCurrentAssignmentCount,
  normalizeAssignments,
};
