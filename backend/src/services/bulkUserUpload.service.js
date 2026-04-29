'use strict';

const fs       = require('fs');
const { parse } = require('csv-parse');
const xlsx     = require('xlsx');
const mongoose = require('mongoose');

const {
  BulkUserUpload,
  User,
  Department,
  UserLimitOverride,
  Admin,
  AuditLog,
  Team,
} = require('../models');

const { hashPassword } = require('../services/auth.service');
const {
  ROLE_DEPARTMENT_MAP,
  RESTRICTED_ROLES,
} = require('../constants/roleDepartmentMap');

// ─────────────────────────────────────────────────────────────
// FILE PARSERS
// ─────────────────────────────────────────────────────────────

const buildDefaultUserPassword = (email, phone) => {
  const lastFiveDigits = String(phone || "").trim().slice(-5);
  return `${String(email || "").toLowerCase().trim()}@${lastFiveDigits}`;
};

const parseCsv = (filePath) =>
  new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
      .on('data', (data) => results.push(data))
      .on('error', reject)
      .on('end', () => resolve(results));
  });

const parseExcel = (filePath) => {
  const workbook  = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet, { defval: '' });
};

// ─────────────────────────────────────────────────────────────
// ROW NORMALIZER
// ─────────────────────────────────────────────────────────────

const normalizeUserRow = (row) => {
  const normalized = {};
  for (const key in row) {
    normalized[key.trim().toLowerCase()] =
      typeof row[key] === 'string' ? row[key].trim() : row[key];
  }
  return normalized;
};

// ─────────────────────────────────────────────────────────────
// ROW VALIDATOR
// Returns array of field-level errors for one row.
// deptMap / teamMap are pre-built Maps to avoid per-row DB hits.
// allowedRoles is a Set derived from the User schema enum.
// ─────────────────────────────────────────────────────────────

const validateRow = (row, { deptMap, teamMap, allowedRoles }) => {
  const errors = [];

  // ── Required fields ───────────────────────────────────────
  const requiredFields = ['name', 'email', 'phone', 'department', 'role'];
  for (const field of requiredFields) {
    if (!row[field]) errors.push({ field, message: `${field} is required` });
  }

  // ── Phone format ──────────────────────────────────────────
  const phone = row.phone ? String(row.phone).replace(/\D/g, '') : '';
  if (row.phone && !/^\d{10}$/.test(phone)) {
    errors.push({ field: 'phone', message: 'Phone must be exactly 10 digits' });
  }

  // ── Role check ────────────────────────────────────────────
  const roleName = row.role ? row.role.toUpperCase() : '';
  if (roleName) {
    if (RESTRICTED_ROLES.has(roleName)) {
      errors.push({
        field: 'role',
        message: `Security violation: Role ${roleName} cannot be assigned via bulk upload.`,
      });
    } else if (!allowedRoles.has(roleName)) {
      errors.push({
        field: 'role',
        message: `Invalid role: ${roleName}. Allowed roles: ${Array.from(allowedRoles).join(', ')}`,
      });
    }
  }

  // ── Department + Role-Department ──────────────────────────
  const deptName = row.department ? row.department.toUpperCase() : '';
  if (deptName && !deptMap.has(deptName)) {
    errors.push({ field: 'department', message: `Department "${deptName}" not found for this tenant` });
  } else if (deptName && roleName && !RESTRICTED_ROLES.has(roleName)) {
    const allowedForDept = ROLE_DEPARTMENT_MAP[deptName] || [];
    if (!allowedForDept.includes(roleName)) {
      errors.push({
        field: 'role',
        message: `Role ${roleName} is not permitted for the ${deptName} department.`,
      });
    }
  }

  // ── Team (optional) ───────────────────────────────────────
  if (row.team) {
    const teamName = row.team.toUpperCase();
    if (!teamMap.has(teamName)) {
      errors.push({ field: 'team', message: `Team "${row.team}" not found for this tenant` });
    }
  }

  return errors;
};

// ─────────────────────────────────────────────────────────────
// EFFECTIVE USER LIMIT HELPER
// ─────────────────────────────────────────────────────────────

const getEffectiveLimit = async (adminId) => {
  const adminDoc = await Admin.findById(adminId).select('userLimit');
  const override = await UserLimitOverride.findOne({ admin: adminId, isActive: true });
  return override ? override.userLimit : (adminDoc?.userLimit ?? 40);
};

// ─────────────────────────────────────────────────────────────
// CHUNKED INSERT — avoids MongoDB / memory limits on large files
// ─────────────────────────────────────────────────────────────

const CHUNK_SIZE = 200;

const insertInChunks = async (docs) => {
  const errors = [];
  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    try {
      await User.insertMany(chunk, { ordered: false });
    } catch (bulkErr) {
      // ordered:false — some docs may succeed even if others fail
      if (bulkErr.writeErrors) {
        for (const we of bulkErr.writeErrors) {
          errors.push({ index: i + we.index, message: we.errmsg });
        }
      } else {
        throw bulkErr; // unexpected error — re-throw
      }
    }
  }
  return errors;
};

// ═════════════════════════════════════════════════════════════
// PREVIEW (Upload + Parse + Validate — NO user inserts)
// ═════════════════════════════════════════════════════════════

exports.processUploadPreview = async (uploadId) => {
  const upload = await BulkUserUpload.findById(uploadId);
  if (!upload) throw new Error('Upload not found');

  try {
    // ── Parse file ────────────────────────────────────────────
    let rawRows = upload.fileType === 'CSV'
      ? await parseCsv(upload.fileUrl)
      : parseExcel(upload.fileUrl);

    upload.totalRows = rawRows.length;

    // ── Build lookup maps (single DB round-trip each) ─────────
    const departments = await Department.findActive({ admin: upload.admin });
    const deptMap     = new Map(departments.map((d) => [d.name.toUpperCase(), d._id]));

    const teams   = await Team.findActive({ admin: upload.admin });
    const teamMap = new Map(teams.map((t) => [t.name.toUpperCase(), t._id]));

    // Derive allowed roles from the schema enum, minus restricted ones
    const allowedRoles = new Set(
      User.schema.path('role').enumValues
        .filter((r) => !RESTRICTED_ROLES.has(r))
        .map((r) => r.toUpperCase()),
    );

    // Existing tenant user emails (for duplicate-in-DB detection)
    const existingUsers  = await User.findActive({ admin: upload.admin }, 'email');
    const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase()));

    // ── Per-row validation ────────────────────────────────────
    const seenEmailsInFile = new Set();
    const failedRows       = [];
    let validCount      = 0;
    let duplicateInFile = 0;
    let duplicateInDb   = 0;
    let invalidCount    = 0; // field-validation failures (NOT counting pure duplicates)

    for (let i = 0; i < rawRows.length; i++) {
      const row       = normalizeUserRow(rawRows[i]);
      const rowNumber = i + 2; // row 1 = header
      const email     = row.email ? row.email.toLowerCase() : '';

      const fieldErrors = validateRow(row, { deptMap, teamMap, allowedRoles });

      // ── Duplicate detection ───────────────────────────────
      let isDuplicate = false;
      if (email) {
        if (existingEmails.has(email)) {
          isDuplicate = true;
          duplicateInDb++;
          fieldErrors.push({ field: 'email', message: 'Email already exists in this tenant' });
        } else if (seenEmailsInFile.has(email)) {
          isDuplicate = true;
          duplicateInFile++;
          fieldErrors.push({ field: 'email', message: 'Duplicate email within the uploaded file' });
        } else {
          seenEmailsInFile.add(email);
        }
      }

      if (fieldErrors.length > 0) {
        if (!isDuplicate) invalidCount++; // pure field-validation failure (not a duplicate)
        failedRows.push({
          rowNumber,
          rawData: rawRows[i],
          reason:  fieldErrors.map((e) => e.message).join(' | '),
          fieldErrors,
        });
      } else {
        validCount++;
      }
    }

    // ── User-limit computation for preview info ────────────────
    const effectiveUserLimit  = await getEffectiveLimit(upload.admin);
    const currentActiveUsers  = await User.countActive({ admin: upload.admin });
    const allowedImportSlots  = Math.max(0, effectiveUserLimit - currentActiveUsers);
    const wouldExceedUserLimit = validCount > allowedImportSlots;

    // ── Persist preview state ─────────────────────────────────
    upload.validRows   = validCount;
    upload.invalidRows = invalidCount + duplicateInFile + duplicateInDb; // total unusable rows
    upload.duplicates  = duplicateInFile + duplicateInDb;
    upload.failedRows  = failedRows;
    upload.status      = 'UPLOADED';
    await upload.save();

    return {
      upload,
      duplicateBreakdown: { inFile: duplicateInFile, inDb: duplicateInDb },
      limitInfo: {
        effectiveUserLimit,
        currentActiveUsers,
        allowedImportSlots,
        wouldExceedUserLimit,
      },
    };
  } catch (error) {
    upload.status = 'FAILED';
    upload.errorMessages.push(error.message);
    await upload.save();
    throw error;
  }
};

// ═════════════════════════════════════════════════════════════
// COMMIT (Insert valid users in batches)
// ═════════════════════════════════════════════════════════════

exports.commitUpload = async (uploadId, importMode) => {
  const upload = await BulkUserUpload.findById(uploadId);
  if (!upload) throw new Error('Upload not found');

  // ── Status guard — reject terminal states ─────────────────
  const terminalStatuses = ['DONE', 'FAILED', 'PARTIAL', 'PROCESSING'];
  if (terminalStatuses.includes(upload.status)) {
    const err  = new Error(`Cannot commit upload with status "${upload.status}". Code: BULK_UPLOAD_ALREADY_COMMITTED`);
    err.statusCode = 409;
    throw err;
  }

  // ── Upload lock — reject concurrent PROCESSING for same admin ─
  const concurrentProcessing = await BulkUserUpload.findOne({
    admin:  upload.admin,
    status: 'PROCESSING',
    _id:    { $ne: upload._id },
  });
  if (concurrentProcessing) {
    const err = new Error('Another upload is currently being processed for this account. Code: BULK_UPLOAD_CONCURRENT');
    err.statusCode = 409;
    throw err;
  }

  // ── Effective user limit (fresh check at commit time) ─────
  const effectiveUserLimit = await getEffectiveLimit(upload.admin);
  const currentActiveUsers = await User.countActive({ admin: upload.admin });
  const allowedSlots       = Math.max(0, effectiveUserLimit - currentActiveUsers);

  // Strict mode: fail the entire commit if valid rows exceed available slots
  if (upload.options.strictMode && upload.validRows > allowedSlots) {
    upload.status = 'FAILED';
    upload.errorMessages.push(
      `Strict Mode: Valid rows (${upload.validRows}) exceed allowed slots (${allowedSlots}).`,
    );
    upload.completedAt = new Date();
    await upload.save();
    const err = new Error('User limit exceeded in strict mode. Code: BULK_UPLOAD_LIMIT_EXCEEDED');
    err.statusCode = 422;
    throw err;
  }

  // FAIL_ON_ANY_ERROR mode: any invalid/duplicate row aborts the whole commit
  if (importMode === 'FAIL_ON_ANY_ERROR' && upload.invalidRows > 0) {
    upload.status = 'FAILED';
    upload.errorMessages.push(
      `FAIL_ON_ANY_ERROR mode: ${upload.invalidRows} invalid/duplicate rows prevent commit.`,
    );
    upload.completedAt = new Date();
    await upload.save();
    const err = new Error('Commit aborted because the file contains invalid rows. Code: BULK_UPLOAD_INVALID_ROWS');
    err.statusCode = 422;
    throw err;
  }

  try {
    upload.status    = 'PROCESSING';
    upload.startedAt = new Date();
    // Reset counters for the commit pass (preview failedRows preserved until now)
    upload.failedRows  = [];
    upload.invalidRows = 0;
    upload.duplicates  = 0;
    upload.imported    = 0;
    await upload.save();

    // ── Re-parse file ─────────────────────────────────────────
    let rawRows = upload.fileType === 'CSV'
      ? await parseCsv(upload.fileUrl)
      : parseExcel(upload.fileUrl);

    // ── Re-build lookup maps ──────────────────────────────────
    const departments = await Department.findActive({ admin: upload.admin });
    const deptMap     = new Map(departments.map((d) => [d.name.toUpperCase(), d._id]));

    const teams   = await Team.findActive({ admin: upload.admin });
    const teamMap = new Map(teams.map((t) => [t.name.toUpperCase(), t._id]));

    const allowedRoles = new Set(
      User.schema.path('role').enumValues
        .filter((r) => !RESTRICTED_ROLES.has(r))
        .map((r) => r.toUpperCase()),
    );

    // Fresh email snapshot at commit time (prevents race with concurrent single-user creates)
    const existingUsersAtCommit = await User.findActive({ admin: upload.admin }, 'email');
    const existingEmails        = new Set(existingUsersAtCommit.map((u) => u.email.toLowerCase()));

    const usersToInsert      = [];
    const fileProcessedEmails = new Set();
    let   importedCount      = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const rowNumber = i + 2;

      // ── Slot enforcement (soft mode / non-strict) ─────────
      if (importedCount >= allowedSlots) {
        upload.invalidRows++;
        upload.failedRows.push({
          rowNumber,
          rawData: rawRows[i],
          reason:  'User limit reached during commit — this row was skipped. Code: BULK_UPLOAD_LIMIT_EXCEEDED',
          fieldErrors: [],
        });
        continue;
      }

      const row      = normalizeUserRow(rawRows[i]);
      const email    = row.email ? row.email.toLowerCase() : '';
      const roleName = row.role ? row.role.toUpperCase() : '';
      const deptName = row.department ? row.department.toUpperCase() : '';
      const phone    = row.phone ? String(row.phone).replace(/\D/g, '') : '';

      // ── Re-validate row (idempotency — file may have changed on disk) ──
      const errors = validateRow(
        { ...row, phone }, // use normalized phone
        { deptMap, teamMap, allowedRoles },
      );

      // ── Duplicate detection at commit time ────────────────
      if (email) {
        if (existingEmails.has(email)) {
          upload.duplicates++;
          if (upload.options.skipDuplicates) {
            // Silent skip — record for transparency but don't fail count
            upload.failedRows.push({
              rowNumber,
              rawData: rawRows[i],
              reason:  'Skipped: Email already exists in tenant (skipDuplicates=true)',
              fieldErrors: [{ field: 'email', message: 'Email already exists in this tenant' }],
            });
            continue;
          } else {
            errors.push({ field: 'email', message: 'Email already exists in this tenant' });
          }
        } else if (fileProcessedEmails.has(email)) {
          upload.duplicates++;
          errors.push({ field: 'email', message: 'Duplicate email within the uploaded file' });
        }
      }

      if (errors.length > 0) {
        upload.invalidRows++;
        upload.failedRows.push({
          rowNumber,
          rawData: rawRows[i],
          reason:  errors.map((e) => e.message).join(' | '),
          fieldErrors: errors,
        });
        continue;
      }

      fileProcessedEmails.add(email);

      // ── Build user document ───────────────────────────────
      const deptId  = deptMap.get(deptName);
      const teamId  = row.team ? (teamMap.get(row.team.toUpperCase()) ?? null) : null;
      const defaultPassword = buildDefaultUserPassword(email, row.phone);
      const hashedPassword = await hashPassword(defaultPassword);

      usersToInsert.push({
        admin:             upload.admin,
        department:        deptId,
        team:              teamId,
        name:              row.name,
        email,
        phone,
        password:          hashedPassword,
        role:              roleName,
        leadDataLimit:     row.leaddatalimit ? Number(row.leaddatalimit) : null,
        mustChangePassword: true,
        isFirstLogin:       true,
        isActive:           true,
        isProfileComplete:  false,
        approvalStatus:     'APPROVED',
        tempPassword:       defaultPassword,
      });

      importedCount++;
    }

    // ── Chunked bulk insert ───────────────────────────────────
    let actualImportedCount = 0;

    if (usersToInsert.length > 0) {
      const insertErrors = await insertInChunks(usersToInsert);
      actualImportedCount = Math.max(0, importedCount - insertErrors.length);

      // If ordered:false produced per-document errors, record them
      if (insertErrors.length > 0) {
        for (const ie of insertErrors) {
          const originalRow = usersToInsert[ie.index];
          upload.invalidRows++;
          upload.failedRows.push({
            rowNumber: ie.index + 2,
            rawData:   originalRow,
            reason:    `DB insert error: ${ie.message}`,
            fieldErrors: [],
          });
        }
      }

      // ── Audit log ─────────────────────────────────────────
      await AuditLog.create({
        admin:         upload.admin,
        performedBy:   upload.uploadedBy,
        performerType: upload.uploadedByType,
        action:        'BULK_USER_UPLOAD',
        targetModel:   'BulkUserUpload',
        targetId:      upload._id,
        after:         { importedCount: actualImportedCount, failedCount: upload.failedRows.length },
        note:          `Bulk imported ${actualImportedCount} users (${upload.failedRows.length} failed).`,
      });
    }

    upload.imported = actualImportedCount;

    // ── Final status ──────────────────────────────────────────
    if (actualImportedCount === 0) {
      upload.status = 'FAILED';
    } else if (upload.invalidRows > 0 || upload.failedRows.length > 0) {
      upload.status = 'PARTIAL';
    } else {
      upload.status = 'DONE';
    }

    upload.completedAt = new Date();
    await upload.save();

    return upload;
  } catch (err) {
    upload.status      = 'FAILED';
    upload.completedAt = new Date();
    upload.errorMessages.push(err.message);
    await upload.save();
    throw err;
  }
};

// ═════════════════════════════════════════════════════════════
// ERROR CSV GENERATOR
// ═════════════════════════════════════════════════════════════

exports.generateErrorCsv = (failedRows) => {
  if (!failedRows || failedRows.length === 0) return '';
  const header = 'RowNumber,Reason,RawData\n';
  const rows = failedRows.map((f) => {
    const rawDataStr = JSON.stringify(f.rawData || {}).replace(/"/g, '""');
    const reasonStr  = (f.reason || '').replace(/"/g, '""');
    return `"${f.rowNumber}","${reasonStr}","${rawDataStr}"`;
  });
  return header + rows.join('\n');
};
