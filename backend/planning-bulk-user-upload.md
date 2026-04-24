# Bulk Member Upload Plan (Admin Uploads Multiple Users)

## 1. Objective
Build a production-grade bulk onboarding flow where Admin uploads many department members through CSV/Excel, with strict tenant safety, partial success support, and row-level error reporting.

## 2. Scope
- In scope: CSV/XLSX upload, schema validation, preview, dry-run, commit, duplicate handling, audit logging.
- In scope: Optional auto-team assignment rules.
- Out of scope: Asynchronous HRMS sync from third-party APIs (future integration).

## 3. High-Level Workflow
1. Admin uploads file
2. Server stores file metadata and creates upload job record
3. Parse file and normalize rows
4. Validate each row with business rules
5. Return preview summary (valid/invalid/duplicates)
6. Admin confirms commit
7. Insert valid users in batch (transaction-aware chunking)
8. Persist row-level results and final status
9. Expose downloadable error report

## 4. Storage Design
Primary records:
- User (final destination)

Tracking records:
- BulkLeadUpload-like pattern for users (recommended new collection: BulkUserUpload)
  - admin
  - uploadedBy
  - uploadedByType
  - fileType
  - fileName
  - fileUrl
  - totalRows
  - validRows
  - imported
  - duplicates
  - invalidRows
  - failedRows: rowNumber, rawData, reason
  - errorMessages
  - status: UPLOADED, PROCESSING, DONE, PARTIAL, FAILED
  - options: skipDuplicates, strictMode
  - startedAt, completedAt
  - createdAt, updatedAt

Supporting lookup collections:
- Department
- Team
- UserLimitOverride
- AuditLog

## 5. File Contract (Template)
Required columns:
- name
- email
- phone
- department
- role

Optional columns:
- team
- leadDataLimit
- addressLine1
- city
- state
- pincode

Normalization rules:
- Trim spaces
- Lowercase email
- Remove non-digit phone chars, then validate 10 digits
- Department and role map by canonical enum names

## 6. API Planning
### 6.1 Upload and Parse (Preview)
- Method: POST
- Path: `/api/users/bulk/upload`
- Content-Type: multipart/form-data
- Auth: Admin token
- Request: file + options
  - `skipDuplicates` boolean
  - `strictMode` boolean

Server response:
- uploadId
- summary:
  - totalRows
  - validRows
  - invalidRows
  - duplicateRows
  - duplicateInFileRows
  - duplicateInDatabaseRows
  - wouldExceedUserLimit
  - currentActiveUsers
  - effectiveUserLimit
  - allowedImportSlots
- rowErrors (first N for preview)

Upload/preview logic:
1. Save upload metadata in BulkUserUpload with status UPLOADED.
2. Parse rows and normalize values.
3. Validate required fields and role-department mapping.
4. Detect duplicate emails inside uploaded file.
5. Query existing users by tenant (same admin + isDeleted false) and mark duplicates.
6. Compute validRows (rows that can be imported).
7. Check user limit:
   - effectiveUserLimit from UserLimitOverride if active, else admin.userLimit.
   - currentActiveUsers = User.countDocuments({ admin, isDeleted: false }).
   - allowedImportSlots = effectiveUserLimit - currentActiveUsers.
   - wouldExceedUserLimit = validRows > allowedImportSlots.
8. Store preview summary and failedRows in BulkUserUpload.

### 6.2 Commit Upload
- Method: POST
- Path: `/api/users/bulk/:uploadId/commit`
- Auth: Admin token
- Body:
  - confirm boolean
  - importMode: `VALID_ONLY` or `FAIL_ON_ANY_ERROR`

Server actions:
1. Re-validate upload ownership and status
2. Re-check effective user limit against valid rows
3. Batch-create users in chunks (for example 200)
4. Hash generated default passwords per row
5. Write AuditLog summary and per-row failure reasons
6. Mark final job status

Commit logic for existing users and limits:
1. Load BulkUserUpload and ensure same admin owns uploadId.
2. Reject commit if status already terminal (DONE/FAILED/PARTIAL).
3. Recompute currentActiveUsers and allowedImportSlots (fresh check at commit time).
4. Build import candidate rows based on mode:
  - If skipDuplicates = true: silently skip rows where email already exists in tenant.
  - If skipDuplicates = false: mark duplicate rows as failed.
5. Limit enforcement:
  - If strictMode = true and candidateRows > allowedImportSlots: fail full commit.
  - If strictMode = false: import only first allowedImportSlots rows and mark rest as LIMIT_EXCEEDED.
6. Insert with bulkWrite ordered false for partial success.
7. Update counters imported, duplicates, invalidRows and failedRows.
8. Set status:
  - DONE if all candidate rows imported.
  - PARTIAL if some imported and some failed/skipped.
  - FAILED if nothing imported.

Response:
- importedCount
- failedCount
- duplicateCount
- status
- downloadable error report link (optional)

### 6.3 Upload Status
- Method: GET
- Path: `/api/users/bulk/:uploadId/status`
- Returns current processing state + summary

### 6.4 Download Error Report
- Method: GET
- Path: `/api/users/bulk/:uploadId/errors.csv`

### 6.5 Download Bulk Template
- Method: GET
- Path: `/api/users/bulk/template`
- Returns CSV template with required columns and sample rows

## 6A. Router, Controller, Service Plan
Router plan:
- File: src/routes/users.js (or dedicated src/routes/userBulk.js)
- Routes:
  - POST /api/users/bulk/upload
  - POST /api/users/bulk/:uploadId/commit
  - GET /api/users/bulk/:uploadId/status
  - GET /api/users/bulk/:uploadId/errors.csv
  - GET /api/users/bulk/template

Controller plan:
- createBulkUploadPreview(req, res)
  - handle file upload, parse, validate, save preview
- commitBulkUpload(req, res)
  - re-check ownership, duplicates, limits, perform import
- getBulkUploadStatus(req, res)
  - return current counters and status
- downloadBulkUploadErrors(req, res)
  - return CSV from failedRows
- downloadBulkTemplate(req, res)
  - return base template

Service plan:
- parseUserUploadFile(file)
- normalizeUserRow(row)
- validateUserRow(row, lookupMaps)
- detectInFileDuplicates(rows)
- findExistingTenantUsers(adminId, emails)
- getEffectiveUserLimit(adminId)
- executeBulkUserImport({ adminId, rows, options, allowedSlots })
- buildErrorCsv(failedRows)

Validation layer plan:
- Joi/Zod schema for request body options and commit payload.
- Middleware for multipart file checks (size/type).

DB layer plan:
- BulkUserUpload model for job lifecycle and row-level failures.
- User model bulk insert with role/department/team ids.
- AuditLog summary record after commit.

## 7. Validation Rules Per Row
1. Required fields present
2. Email valid and unique within tenant
3. Phone format valid
4. Department exists for admin
5. Role allowed for department
6. Team belongs to same admin/department (if provided)
7. User limit check at commit stage
8. Disallow creating users for inactive tenant/admin
9. Reject rows where role is not allowed for selected department
10. Reject rows where team does not belong to same tenant

## 8. Transaction and Performance Strategy
- Parse stage: no DB writes to User table
- Commit stage: chunked writes with ordered=false for partial success
- Use pre-built maps for department/team to avoid per-row DB lookups
- Use bulkWrite for speed and error handling
- Keep one summary audit entry + optional per-row fail traces

Recommended commit controls:
- Chunk size: 100 to 300 per write batch.
- Hard max rows per file: for example 5,000.
- Optional background job queue for very large files.
- Upload lock: one active PROCESSING upload per admin to avoid race conditions.

## 9. Password and First Login Policy
For each created user:
- Default password: `${email}@${last5DigitsOfPhone}`
- Hash before insert
- `mustChangePassword = true`
- `isFirstLogin = true`

Do not return raw passwords in API response.
Provide secure post-upload credential distribution process.

## 10. Security Requirements
- File type whitelist: .csv, .xlsx only
- File size limit (for example 5MB)
- Malware/content scan hook if available
- Rate limit upload and commit endpoints
- Enforce strict tenant ownership on uploadId
- Redact sensitive data in application logs

## 11. Failure Handling and Idempotency
- If commit is retried, prevent duplicate inserts by unique index and status guards
- Keep upload record immutable after terminal states (DONE/FAILED/PARTIAL)
- Return deterministic error codes for frontend retries

Error codes recommendation:
- BULK_UPLOAD_INVALID_FILE
- BULK_UPLOAD_PARSE_FAILED
- BULK_UPLOAD_LIMIT_EXCEEDED
- BULK_UPLOAD_DUPLICATE_EXISTS
- BULK_UPLOAD_ALREADY_COMMITTED
- BULK_UPLOAD_FORBIDDEN

## 12. Monitoring and Alerts
Metrics:
- bulk_user_upload_started
- bulk_user_upload_completed
- bulk_user_upload_failed
- bulk_user_rows_imported
- bulk_user_rows_invalid

Alerts:
- High failure ratio
- Repeated malformed files from same admin
- Commit timeout spikes

## 13. Frontend Planning (Bulk Upload UI)
Screens:
1. Upload file + download template
2. Preview validation summary
3. Commit confirmation
4. Final result + download error report

UX requirements:
- Show row-level errors with row numbers
- Let Admin choose skip duplicates vs strict mode
- Show projected user count vs effective user limit before commit

## 14. QA Test Matrix
- Valid file with mixed departments/roles
- Invalid role-department pairs
- Duplicate emails within file and against DB
- User limit exceed at commit
- Partial success mode and strict mode behavior
- Cross-tenant uploadId access denied
- Large file performance and timeout behavior
- Retry commit on same uploadId (idempotency)
- Concurrent uploads for same admin (race handling)
- SkipDuplicates true vs false behavior validation

## 15. Team Task Breakdown
Task 1 (Backend Core)
- Design upload record model and schemas
- Implement upload preview/commit/status APIs
- Implement chunked insert and robust error mapper
- Implement effective user limit service and commit-time recheck
- Implement duplicate detection in-file and in-database

Task 2 (Backend Platform)
- Add file storage and cleanup policy
- Add metrics, rate limits, and audit trails

Task 3 (Frontend)
- Build upload-preview-commit workflow
- Add row-level error rendering and template support
- Add warning UI when wouldExceedUserLimit is true
- Add explicit switch for skipDuplicates and strictMode

Task 4 (QA)
- Execute matrix with tenant-scope and security regression focus
