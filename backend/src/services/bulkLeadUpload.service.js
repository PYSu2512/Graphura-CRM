'use strict';

const mongoose = require('mongoose');
const { BulkLeadUpload, Client, Lead } = require('../models');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

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

exports.assignLead = async (adminId, leadId, userId, managerId) => {
  const lead = await Lead.findOne({ _id: leadId, admin: adminId });
  if (!lead) throw new Error('Lead not found');

  lead.assignedTo = userId;
  lead.assignedBy = managerId;
  await lead.save();
  return lead;
};

exports.assignBatchLeads = async (adminId, uploadId, userId, managerId) => {
  const result = await Lead.updateMany(
    { admin: adminId, bulkUploadId: uploadId, assignedTo: null },
    { assignedTo: userId, assignedBy: managerId }
  );
  return { count: result.modifiedCount };
};
