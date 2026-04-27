const fs = require("fs");
const { parse } = require("csv-parse");
const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const {
  BulkUserUpload,
  User,
  Department,
  UserLimitOverride,
  Admin,
  AuditLog,
  Team,
} = require("../models");

const ROLE_DEPARTMENT_MAP = {
  SALES: ["SALES_MANAGER", "SALES_TL", "SALES_EXECUTIVE"],
  FINANCE: ["FINANCE_MANAGER"],
  MANAGEMENT: ["MANAGEMENT_MANAGER", "MANAGEMENT_TL", "MANAGEMENT_EMPLOYEE"],
};

const RESTRICTED_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

const parseCsv = (filePath) =>
  new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
      .on("data", (data) => results.push(data))
      .on("error", reject)
      .on("end", () => resolve(results));
  });

const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet, { defval: "" });
};

const normalizeUserRow = (row) => {
  const normalized = {};
  for (const key in row) {
    normalized[key.trim().toLowerCase()] =
      typeof row[key] === "string" ? row[key].trim() : row[key];
  }
  return normalized;
};

exports.processUploadPreview = async (uploadId) => {
  const upload = await BulkUserUpload.findById(uploadId);
  if (!upload) throw new Error("Upload not found");

  try {
    let rawRows = [];
    if (upload.fileType === "CSV") {
      rawRows = await parseCsv(upload.fileUrl);
    } else {
      rawRows = parseExcel(upload.fileUrl);
    }

    upload.totalRows = rawRows.length;
    console.log("UPLOAD ADMIN:", upload.admin);
    // Load necessary Lookups
    const departments = await Department.findActive({ admin: upload.admin });
    console.log("DEPARTMENTS FOUND:", departments);
    const departments1 = await Department.find({});
    console.log("ALL DEPARTMENTS:", departments);
    console.log("DB NAME:", mongoose.connection.name);
    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.name.toUpperCase()] = d._id;
    });

    const teams = await Team.findActive({ admin: upload.admin });
    const teamMap = {};
    teams.forEach((t) => {
      teamMap[t.name.toUpperCase()] = t._id;
    });

    const allowedRoles = new Set(
      User.schema.path("role").enumValues.map((r) => r.toUpperCase()),
    );

    const existingUsers = await User.findActive({ admin: upload.admin });
    const existingEmails = new Set(
      existingUsers.map((u) => u.email.toLowerCase()),
    );

    const emailInFile = new Set();
    const failedRows = [];
    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const row = normalizeUserRow(rawRows[i]);
      const rowNumber = i + 2; // Assuming header row

      const errors = [];
      const requiredFields = ["name", "email", "phone", "department", "role"];

      // Check required fields
      for (const field of requiredFields) {
        if (!row[field]) {
          errors.push({ field, message: `${field} is required` });
        }
      }

      // Check phone format
      if (row.phone && !/^\d{10}$/.test(row.phone)) {
        errors.push({
          field: "phone",
          message: "Phone must be exactly 10 digits",
        });
      }

      // Validate Role
      const roleName = row.role ? row.role.toUpperCase() : "";
      if (roleName && RESTRICTED_ROLES.has(roleName)) {
        errors.push({
          field: "role",
          message: `Security violation: Role ${roleName} cannot be assigned via bulk upload.`,
        });
      } else if (roleName && !allowedRoles.has(roleName)) {
        errors.push({
          field: "role",
          message: `Invalid role. Allowed roles: ${Array.from(allowedRoles).join(", ")}`,
        });
      }

      // Check Email (Duplicate handling)
      const email = row.email ? row.email.toLowerCase() : "";
      if (email) {
        if (existingEmails.has(email)) {
          duplicateCount++;
          errors.push({
            field: "email",
            message: "Email already exists in database",
          });
        } else if (emailInFile.has(email)) {
          duplicateCount++;
          errors.push({
            field: "email",
            message: "Duplicate email within the uploaded file",
          });
        } else {
          emailInFile.add(email);
        }
      }

      // Check Department
      const deptName = row.department ? row.department.toUpperCase() : "";
      if (deptName && !deptMap[deptName]) {
        errors.push({ field: "department", message: "Department not found" });
      } else if (deptName && roleName) {
        const allowedForDept = ROLE_DEPARTMENT_MAP[deptName] || [];
        if (!allowedForDept.includes(roleName)) {
          errors.push({
            field: "role",
            message: `Role ${roleName} is not permitted for the ${deptName} department.`,
          });
        }
      }

      // If errors exist
      if (errors.length > 0) {
        invalidCount++;
        failedRows.push({
          rowNumber,
          rawData: rawRows[i], // raw unnormalized data
          reason: errors.map((e) => e.message).join(" | "),
          fieldErrors: errors,
        });
      } else {
        validCount++;
      }
    }

    upload.validRows = validCount;
    upload.invalidRows = invalidCount;
    upload.duplicates = duplicateCount;
    upload.failedRows = failedRows;
    upload.status = "UPLOADED";

    await upload.save();
    return upload;
  } catch (error) {
    upload.status = "FAILED";
    upload.errorMessages.push(error.message);
    await upload.save();
    throw error;
  }
};

exports.commitUpload = async (uploadId, confirm, importMode) => {
  const upload = await BulkUserUpload.findById(uploadId);
  if (!upload) throw new Error("Upload not found");
  if (upload.status !== "UPLOADED")
    throw new Error(`Cannot commit upload with status ${upload.status}`);

  // Limit check
  const adminDoc = await Admin.findById(upload.admin);
  const override = await UserLimitOverride.findOne({
    admin: upload.admin,
    isActive: true,
  });
  const effectiveUserLimit = override ? override.userLimit : adminDoc.userLimit;
  const currentActiveUsers = await User.countActive({ admin: upload.admin });
  const allowedSlots = effectiveUserLimit - currentActiveUsers;

  if (upload.options.strictMode && upload.validRows > allowedSlots) {
    upload.status = "FAILED";
    upload.errorMessages.push(
      `Strict Mode: Valid rows (${upload.validRows}) exceed allowed slots (${allowedSlots})`,
    );
    await upload.save();
    throw new Error("User limit exceeded");
  }

  try {
    upload.status = "PROCESSING";
    upload.startedAt = new Date();
    // Idempotency: Reset error state in case commit is somehow retried or to ensure exact state mapping
    upload.failedRows = [];
    upload.invalidRows = 0;
    upload.duplicates = 0;
    upload.imported = 0;
    await upload.save();

    let rawRows = [];
    if (upload.fileType === "CSV") {
      rawRows = await parseCsv(upload.fileUrl);
    } else {
      rawRows = parseExcel(upload.fileUrl);
    }

    const departments = await Department.findActive({ admin: upload.admin });
    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.name.toUpperCase()] = d._id;
    });

    const teams = await Team.findActive({ admin: upload.admin });
    const teamMap = {};
    teams.forEach((t) => {
      teamMap[t.name.toUpperCase()] = t._id;
    });

    const allowedRoles = new Set(
      User.schema.path("role").enumValues.map((r) => r.toUpperCase()),
    );

    const existingUsers = await User.findActive({ admin: upload.admin });
    const existingEmails = new Set(
      existingUsers.map((u) => u.email.toLowerCase()),
    );

    const usersToInsert = [];
    let imported = 0;
    const fileProcessedEmails = new Set();

    for (let i = 0; i < rawRows.length; i++) {
      const rowNumber = i + 2;

      if (imported >= allowedSlots) {
        upload.invalidRows++;
        upload.failedRows.push({
          rowNumber,
          rawData: rawRows[i],
          reason: "User limit exceeded during insert",
          fieldErrors: [],
        });
        continue;
      }

      const row = normalizeUserRow(rawRows[i]);
      const email = row.email ? row.email.toLowerCase() : "";
      const roleName = row.role ? row.role.toUpperCase() : "";

      // Re-validate row to ensure idempotency and accurate failure logging
      const errors = [];
      const requiredFields = ["name", "email", "phone", "department", "role"];

      for (const field of requiredFields) {
        if (!row[field])
          errors.push({ field, message: `${field} is required` });
      }

      if (row.phone && !/^\d{10}$/.test(row.phone)) {
        errors.push({
          field: "phone",
          message: "Phone must be exactly 10 digits",
        });
      }

      if (roleName && RESTRICTED_ROLES.has(roleName)) {
        errors.push({
          field: "role",
          message: `Security violation: Role ${roleName} cannot be assigned via bulk upload.`,
        });
      } else if (roleName && !allowedRoles.has(roleName)) {
        errors.push({
          field: "role",
          message: `Invalid role. Allowed roles: ${Array.from(allowedRoles).join(", ")}`,
        });
      }

      const deptName = row.department ? row.department.toUpperCase() : "";
      if (deptName && !deptMap[deptName]) {
        errors.push({ field: "department", message: "Department not found" });
      } else if (deptName && roleName) {
        const allowedForDept = ROLE_DEPARTMENT_MAP[deptName] || [];
        if (!allowedForDept.includes(roleName)) {
          errors.push({
            field: "role",
            message: `Role ${roleName} is not permitted for the ${deptName} department.`,
          });
        }
      }

      let isDuplicate = false;
      if (email) {
        if (existingEmails.has(email)) {
          isDuplicate = true;
          upload.duplicates++;
          errors.push({
            field: "email",
            message: "Email already exists in database",
          });
        } else if (fileProcessedEmails.has(email)) {
          isDuplicate = true;
          upload.duplicates++;
          errors.push({
            field: "email",
            message: "Duplicate email within the uploaded file",
          });
        }
      }

      if (errors.length > 0) {
        upload.invalidRows++;
        // Idempotency: skipDuplicates dictates whether duplicates fail the entire job or are just silently ignored in terms of strict valid counts, but we still must skip inserting them.
        // We log them in failedRows for transparency.
        upload.failedRows.push({
          rowNumber,
          rawData: rawRows[i],
          reason: errors.map((e) => e.message).join(" | "),
          fieldErrors: errors,
        });
        continue; // Skip insertion
      }

      fileProcessedEmails.add(email);

      const deptId = deptMap[deptName];
      let teamId = null;
      if (row.team && teamMap[row.team.toUpperCase()]) {
        teamId = teamMap[row.team.toUpperCase()];
      }

      const defaultPassword = `${email}@${row.phone.slice(-5)}`;
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      usersToInsert.push({
        admin: upload.admin,
        department: deptId,
        team: teamId,
        name: row.name,
        email: email,
        phone: row.phone,
        password: hashedPassword,
        role: roleName,
        mustChangePassword: true,
        isActive: true,
        isProfileComplete: false,
      });

      imported++;
    }

    if (usersToInsert.length > 0) {
      await User.insertMany(usersToInsert, { ordered: false });

      // Audit Log
      await AuditLog.create({
        admin: upload.admin,
        performedBy: upload.uploadedBy,
        performerType: upload.uploadedByType,
        action: "USER_CREATED", // Bulk logic mapped
        targetModel: "BulkUserUpload",
        targetId: upload._id,
        after: { count: imported },
        note: `Bulk imported ${imported} users`,
      });
    }

    upload.imported = imported;
    if (
      upload.invalidRows > 0 ||
      upload.failedRows.length > 0 ||
      imported < upload.validRows
    ) {
      upload.status = "PARTIAL";
    } else {
      upload.status = "DONE";
    }

    upload.completedAt = new Date();
    await upload.save();

    return upload;
  } catch (err) {
    upload.status = "FAILED";
    upload.errorMessages.push(err.message);
    upload.completedAt = new Date();
    await upload.save();
    throw err;
  }
};

exports.generateErrorCsv = (failedRows) => {
  if (!failedRows || failedRows.length === 0) return "";
  const header = "RowNumber,Reason,RawData\n";
  const rows = failedRows.map((f) => {
    return `"${f.rowNumber}","${f.reason}","${JSON.stringify(f.rawData).replace(/"/g, '""')}"`;
  });
  return header + rows.join("\n");
};
