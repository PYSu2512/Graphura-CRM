# Sales Manager Lead Upload Plan

## Goal
Build a production-grade bulk lead upload flow for the Sales Manager area. The Sales Manager should be able to upload CSV or Excel lead files, preview validation results, and commit valid rows while the backend enforces tenant isolation, role access, duplicate prevention, and admin-configured limits. Lead assignment happens after import, not inside the CSV.

## Scope
- Upload leads only inside the authenticated admin tenant.
- Enforce Sales Manager-only access for the import flow.
- Validate each row before commit.
- Respect lead limits stored in the Admin collection.
- Store every bulk import job for replay, audit, and error download.
- Create leads as unassigned after import.
- Allow assignment from a separate post-upload workflow.
- Never hard-delete imported leads; support dump/restore instead.

## Business Rules
1. Every query must include `admin: req.admin._id`.
2. The uploader must be a Sales Manager or a role explicitly allowed by policy.
3. Lead uniqueness must be tenant-scoped.
4. Duplicate detection must work at two levels:
   - within the uploaded file
   - against existing tenant leads
5. Limit enforcement must resolve in this order:
   - `user.leadDataLimit` if set
   - `admin.dataLimitOverride.leadLimits[role]` if active
   - `admin.leadLimits[role]` as the default source of truth
6. Imported leads must be created with `assignedTo = null` until the manager assigns them later.
7. Import commit must be atomic per chunk and must preserve row-level failure data.
8. Import actions must be audit logged.

## Recommended Data Shape
Use the existing `BulkLeadUpload` model as the import job record. If the current schema is not enough, extend it rather than creating a second bulk-upload collection.

Suggested fields for the imported lead row:
- `companyName`
- `email`
- `phone`
- `rowNumber`

Server-generated fields after import:
- `status = UNASSIGNED` or `UNTOUCHED` based on existing lead lifecycle
- `assignedTo = null`
- `createdFrom = BULK_UPLOAD`
- `uploadId`

## Recommended API Endpoints
Mount these under the sales-manager API namespace.

### Upload flow
- `GET /api/sales-manager/leads/bulk/template`
  - downloads a sample CSV template with `companyName,email,phone`
- `POST /api/sales-manager/leads/bulk/preview`
  - uploads file, parses rows, validates data, stores upload job, returns preview summary
- `POST /api/sales-manager/leads/bulk/:uploadId/commit`
  - commits valid rows into `Lead`
- `GET /api/sales-manager/leads/bulk/:uploadId/status`
  - returns processing status, counters, and import progress
- `GET /api/sales-manager/leads/bulk/:uploadId/errors`
  - downloads failed rows as CSV

### Post-upload assignment flow
- `POST /api/sales-manager/leads/:leadId/assign`
  - assigns an imported lead to a user after the upload is complete
- `POST /api/sales-manager/leads/bulk/:uploadId/assign-batch`
  - assigns multiple imported leads in one request after review

### Optional follow-up endpoints
- `POST /api/sales-manager/leads/bulk/:uploadId/retry`
  - retries failed rows only
- `POST /api/sales-manager/leads/bulk/:uploadId/cancel`
  - marks the upload as cancelled before commit

## Controller Split
Create a dedicated controller, for example `bulkLeadUpload.controller.js`.

### `downloadTemplate`
- Returns a CSV template with required headers.
- Should be public only if business approves; otherwise protect it with auth.

### `previewUpload`
- Validates file presence and file type.
- Stores an upload job row in `BulkLeadUpload`.
- Parses CSV/XLSX.
- Normalizes each row.
- Validates required fields, format, duplicates, and tenant ownership.
- Calculates limit impact before commit.
- Returns a preview summary plus the first N row errors.

### `commitUpload`
- Re-checks upload ownership and status.
- Revalidates against current DB state to avoid stale previews.
- Inserts leads in chunks.
- Leaves leads unassigned until a separate assignment action is taken.
- Updates the job with imported count, failed count, and final status.

### `getStatus`
- Returns upload lifecycle status and counters.

### `downloadErrors`
- Streams a CSV of failed rows with reason and row number.

## Middleware Split
Create a dedicated middleware layer instead of putting all checks in controllers.

### `requireSalesManager`
- Authenticates the request.
- Confirms the user role is `SALES_MANAGER`.
- Rejects all other roles with 403.

### `validateBulkLeadFile`
- Checks file presence.
- Validates MIME type and extension.
- Limits file size.

### `validateBulkLeadUploadBody`
- Validates `skipDuplicates`, `strictMode`, and any future flags.

### `enforceLeadUploadLimit`
- Computes the effective lead limit for the Sales Manager.
- Compares active leads plus incoming valid rows.
- Rejects the request early if the import would exceed the limit.

### `validateUploadOwnership`
- Ensures the upload belongs to `req.admin._id`.
- Prevents cross-tenant access to job IDs.

## Router Split
Create a route file such as `bulkLeadUpload.routes.js`.

Recommended route chain:
- `requireAdmin`
- `requireSalesManager`
- `upload.single('file')`
- `validateBulkLeadFile`
- `validateBulkLeadUploadBody`
- controller method

Recommended registration path:
- `app.use('/api/sales-manager/leads/bulk', bulkLeadUploadRoutes)`

## Production Logic
1. Sales Manager uploads file from the UI.
2. Backend stores upload metadata and parses file asynchronously.
3. Backend normalizes headers and row values.
4. Backend checks duplicates against the tenant lead collection.
5. Backend checks role-based lead capacity using Admin limits.
6. Backend returns a preview with valid, invalid, and duplicate rows.
7. On commit, backend inserts leads in chunks, leaves them unassigned, and writes audit logs.
8. Backend updates the upload job with final counts and error rows.
9. Sales Manager later opens the assignment screen and assigns the imported leads to the proper users.

## Validation Rules
- `companyName`: required, trimmed, 1+ chars
- `email`: required, valid format, lowercase
- `phone`: required, 10 digits after normalization
- `assignedTo`: not allowed in CSV
- `status`: not allowed in CSV
- `source`: not required in CSV; can be set later by the manager if needed

## Suggested Error Codes
- `MISSING_FILE`
- `INVALID_FILE_TYPE`
- `INVALID_HEADER`
- `REQUIRED_FIELD_MISSING`
- `INVALID_MOBILE`
- `INVALID_EMAIL`
- `DUPLICATE_IN_FILE`
- `DUPLICATE_IN_DB`
- `LIMIT_EXCEEDED`
- `ASSIGNEE_CAPACITY_EXCEEDED`
- `UNAUTHORIZED_ROLE`

## Suggested Response Shape
Use a consistent response wrapper with summary, upload ID, and row errors.

```json
{
  "success": true,
  "message": "Preview generated successfully",
  "data": {
    "uploadId": "66b9e2f1c3f9d9a7c1234567",
    "summary": {
      "totalRows": 1,
      "validRows": 1,
      "invalidRows": 0,
      "duplicateRows": 0,
      "effectiveLeadLimit": 6000,
      "currentActiveLeads": 1520,
      "allowedImportSlots": 4480
    },
    "previewRows": []
  }
}
```

## One Output JSON Row
```json
{
  "rowNumber": 2,
  "companyName": "Amit Shah Traders",
  "email": "amit@corp.in",
  "phone": "9812345678",
  "status": "UNASSIGNED",
  "assignedTo": null,
  "validationStatus": "VALID",
  "errorReason": null
}
```

## Suggested Files For Implementation
- `backend/src/controllers/bulkLeadUpload.controller.js`
- `backend/src/services/bulkLeadUpload.service.js`
- `backend/src/routes/bulkLeadUpload.js`
- `backend/src/middleware/leadUpload.js`
- `backend/src/validators/bulkLeadUpload.validator.js`

## Acceptance Criteria
- Sales Manager can upload a CSV or Excel file.
- Every row is validated before commit.
- Limits are enforced from the Admin collection.
- Duplicate leads are blocked per tenant.
- Import jobs are stored and queryable.
- Failed rows can be downloaded.
- Audit log entries are created for the upload and commit actions.
- No hard deletes are introduced.
