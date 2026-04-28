# Bulk User Upload Plan (Mirrors Single User Create Flow)

## 1. Goal
Create a bulk user onboarding flow that uses the same business rules as the single user create API, but applies them to many rows in one upload.

The bulk flow should:
- Create users successfully in the tenant of the logged-in admin
- Reuse the same department, role, team, email, and phone validation logic as single user creation
- Prevent duplicate users inside the file and against existing tenant users
- Generate the default password in a predictable format
- Save row-level errors for preview and review
- Return a clear success, partial success, or failure result

## 2. Core Rule
Bulk user creation must follow the same logic as single user creation.

That means bulk processing should reuse these rules:
- The user must belong to the same admin tenant
- The department must exist for that admin
- The role must be allowed for that department
- The email must be unique within the tenant
- The phone must be exactly 10 digits after normalization
- The team must belong to the same department and tenant when provided
- The user must be created with the same profile flags used in single creation
- An audit log entry must be created for each successful import batch

## 3. Password Policy
For bulk users, the default password format should be:

`Test@<last five digits of phone>`

Examples:
- Phone `9876543210` -> Password `Test@43210`
- Phone `9123456786` -> Password `Test@56786`

Password rules:
- Use the last five digits from the sanitized 10-digit phone number
- Hash the password before saving
- Mark `mustChangePassword = true`
- Keep `isProfileComplete = false` until the user finishes first login setup
- Never return the raw password in the API response

## 4. Bulk Flow
1. Admin opens bulk user upload screen
2. Admin downloads the template
3. Admin prepares the file using the same fields required for single user creation
4. Admin uploads the file through the bulk upload endpoint
5. Backend parses the file and normalizes each row
6. Backend validates every row using the same single-create rules
7. Backend checks duplicates inside the file and against tenant users
8. Backend builds a preview summary with valid and invalid rows
9. Admin confirms the import
10. Backend creates all valid users in batches
11. Backend stores import counts, row errors, and audit details
12. Backend returns final status: DONE, PARTIAL, or FAILED

## 5. File Contract
Required columns:
- name
- email
- phone
- departmentId or department name mapping used by the bulk importer
- role

Optional columns:
- teamId or team name mapping
- leadDataLimit

Normalization rules:
- Trim all string values
- Lowercase email before comparison and save
- Strip non-digit characters from phone, then validate 10 digits
- Use canonical department and role mapping
- Treat blank optional fields as null

## 6. Validation Rules Per Row
Each row should pass the same checks as a single create request:
- Name is required
- Email is required and must be valid
- Phone is required and must be exactly 10 digits
- Department is required and must belong to the same admin
- Role is required and must be allowed for the selected department
- Team is optional, but if present it must belong to the selected department and admin
- Email must not already exist in the same tenant
- Email must not repeat inside the same uploaded file
- Inactive or forbidden roles such as ADMIN and SUPER_ADMIN must not be assigned through bulk upload

## 7. Preview Behavior
The preview step should not create users.
It should only:
- Parse the file
- Validate rows
- Detect duplicates
- Count valid and invalid rows
- Show row-level error reasons
- Calculate how many users can be imported successfully

Preview response should include:
- totalRows
- validRows
- invalidRows
- duplicateRows
- previewErrors
- optional warnings about department or role mismatches

## 8. Commit Behavior
When the admin confirms the upload:
- Re-check tenant ownership
- Re-check duplicates and limits
- Create only the valid rows
- Skip or fail duplicate rows based on the import mode
- Hash passwords before insert
- Save audit logs for the import
- Set the final upload status

Commit result should include:
- importedCount
- failedCount
- duplicateCount
- status
- error report availability

## 9. Storage and Tracking
A dedicated bulk upload record should store:
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
- failedRows
- errorMessages
- status
- options
- startedAt
- completedAt

Recommended statuses:
- UPLOADED
- PROCESSING
- DONE
- PARTIAL
- FAILED

## 10. API Plan
Suggested endpoints:
- `POST /api/users/bulk/upload`
- `POST /api/users/bulk/:uploadId/commit`
- `GET /api/users/bulk/:uploadId/status`
- `GET /api/users/bulk/:uploadId/errors.csv`
- `GET /api/users/bulk/template`

## 11. Implementation Notes
- Reuse the same single-user validation rules instead of writing separate business rules for bulk import
- Reuse the same tenant and department lookup logic
- Reuse the same audit log pattern after success
- Reuse the same active user flags and profile completion flags
- Keep the bulk logic deterministic so retrying the same upload does not create duplicate users

## 12. Security Rules
- Only the admin of the tenant can upload and commit the file
- Reject cross-tenant access to upload records
- Reject restricted roles
- Limit file size and file type
- Avoid logging raw passwords or full sensitive payloads
- Keep row-level errors minimal and redacted where needed

## 13. Error Handling
If a row fails, store:
- row number
- raw row data
- validation reason
- field-level errors if available

If the whole upload fails, store:
- file parse error
- permission error
- duplicate or limit error
- commit failure reason

## 14. Expected Outcome
After the bulk upload is committed successfully:
- Users are created under the correct tenant
- Passwords follow `Test@<last five digits of phone>`
- Each created user is forced to change password on first login
- Audit logs show the bulk creation event
- The admin gets a clean success or partial success summary

## 15. Important Note
This plan keeps the bulk flow aligned with the single create flow for validation and user creation rules.
The only explicit password difference in this bulk plan is the requested default password format: `Test@<last five digits of phone>`.

## 16. Single Output Reference and Test Database Row

### 16.1 Single Output Reference
This is the kind of single-user result the bulk flow should mirror for every successful row.

```json
{
	"success": true,
	"message": "User created successfully",
	"data": {
		"user": {
			"name": "Rahul Sharma",
			"email": "rahul.sharma@example.com",
			"role": "SALES_EXECUTIVE",
			"department": "SALES"
		}
	}
}
```

Why this reference matters:
- It shows the same success shape the bulk importer should aim to preserve for each created record
- It confirms that only safe user details are returned
- It keeps raw password and internal IDs out of the response

### 16.2 Test Database Row
Sample user row after bulk insert:

```json
{
	"admin": "66d8f4e8d0a2c1a123456789",
	"department": "66d8f4e8d0a2c1a987654321",
	"team": "66d8f4e8d0a2c1a22223333",
	"name": "Rahul Sharma",
	"email": "rahul.sharma@example.com",
	"phone": "9876543210",
	"password": "<bcrypt-hash-of-Test@43210>",
	"role": "SALES_EXECUTIVE",
	"mustChangePassword": true,
	"isProfileComplete": false,
	"isActive": true
}
```

Explanation:
- `admin` keeps the row inside the correct tenant
- `department` and `team` must already exist for the same admin
- `phone` is normalized before validation and password generation
- The raw password is `Test@43210` because the last five digits of the phone are `43210`
- The saved password must be hashed before insert
- `mustChangePassword` forces first-login password reset behavior
- `isProfileComplete` stays false until the user finishes onboarding
