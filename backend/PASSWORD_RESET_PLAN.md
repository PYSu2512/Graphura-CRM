# PASSWORD RESET SYSTEM PLANNING
## Forget Password & Reset Password Flow

---

## OVERVIEW

A complete password reset system allowing users to:
1. **Forget Password**: Request a password reset link via email
2. **Reset Password**: Create a new password using a valid reset token
3. **Security**: Token-based, time-limited, single-use tokens with rate limiting

**Scope**: ALL users EXCEPT Super Admin (Super Admin uses separate admin panel reset)

---

## DATABASE SCHEMA CHANGES

### 1. PasswordReset Model (NEW)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  email: String (denormalized for validation),
  token: String (hashed bcrypt, unique),
  tokenRaw: String (temporary, used ONLY for generation - never stored in DB),
  expiresAt: Date (default: now + 30 minutes),
  isUsed: Boolean (default: false),
  usedAt: Date (null until reset is successful),
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. User Model (MODIFICATION)
- Add fields:
  - `lastPasswordResetAt`: Date (nullable) - track last reset for audit
  - `passwordResetCount`: Number (default: 0) - track total resets
  - `passwordHistory`: Array<{hash, changedAt}> (limit to last 5) - prevent reuse

---

## API ENDPOINTS

### 1. Forget Password Request
```
POST /api/auth/forget-password
Content-Type: application/json

Request Body:
{
  "email": "user@company.com"
}

Response (Success - 200):
{
  "success": true,
  "message": "Password reset link sent to your email",
  "expiresIn": "30 minutes"
}

Response (Error - 400):
{
  "success": false,
  "message": "User not found with this email"
}

Response (Error - 429):
{
  "success": false,
  "message": "Too many reset requests. Try again after 15 minutes"
}
```

### 2. Verify Reset Token
```
GET /api/auth/verify-reset-token/:token

Response (Success - 200):
{
  "success": true,
  "email": "user@company.com",
  "tokenValid": true
}

Response (Error - 400):
{
  "success": false,
  "message": "Token expired or invalid"
}
```

### 3. Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

Request Body:
{
  "token": "reset_token_from_email",
  "newPassword": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}

Response (Success - 200):
{
  "success": true,
  "message": "Password reset successfully",
  "redirectUrl": "/login"
}

Response (Error - 400):
{
  "success": false,
  "message": "Token expired or already used"
}

Response (Error - 422):
{
  "success": false,
  "message": "Password does not meet security requirements"
}
```

---

## SECURITY FEATURES

### 1. Token Security
- Generate: `crypto.randomBytes(32).toString('hex')` (256-bit)
- Store: Hash with bcrypt (rounds: 10)
- Compare: bcrypt.compare() for validation
- Expiry: 30 minutes from creation
- Single-use: Mark as `isUsed: true` after successful reset

### 2. Rate Limiting
- **Per Email**: Max 5 forget password requests per IP in 24 hours
- **Per Token**: Max 3 attempt per token before expiry
- Response: 429 Too Many Requests with retry-after header

### 3. Password Validation Rules
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)
- Not in password history (last 5 passwords)
- Cannot be same as current password

### 4. Token Transmission
- Token sent via email link: `https://app.domain.com/reset-password?token=xxx`
- Token NOT logged in any system logs
- Token NOT returned in API response bodies
- Frontend uses token from URL only

---

## EMAIL TEMPLATE

### Password Reset Email (via Brevo)

**Subject**: Password Reset Request - CRM

**Body**:
```
Hi {firstName},

We received a request to reset your password. Click the link below to create a new password:

Reset Password: https://app.domain.com/reset-password?token={TOKEN}

This link expires in 30 minutes.

If you didn't request this, please ignore this email. Your account is safe.

---
Do not share this link with anyone.
Graphura CRM Team
```

---

## FLOW DIAGRAMS

### User Flow: Forget Password

```
1. User clicks "Forgot Password?" on login page
   ↓
2. Enters email address
   ↓
3. Frontend POST /api/auth/forget-password
   ↓
4. Backend:
   - Find user by email
   - Check rate limit (IP + email)
   - Generate reset token
   - Hash token
   - Save to DB with 30min expiry
   - Send email with reset link
   ↓
5. User checks email
   ↓
6. User clicks reset link with token
   ↓
7. Frontend GET /api/auth/verify-reset-token/:token
   ↓
8. Backend:
   - Find token record
   - Check expiry & not used
   - Return email (safe info)
   ↓
9. Show password reset form
   ↓
10. User enters new password
    ↓
11. Frontend POST /api/auth/reset-password with token + password
    ↓
12. Backend:
    - Find token record
    - Verify token hash
    - Check expiry & not used
    - Find user
    - Validate password rules
    - Hash new password
    - Save to User model
    - Mark token as used
    - Send confirmation email
    ↓
13. Redirect to login
```

### Admin Flow: Admin Reset User Password (Separate Feature - Future)

```
Note: Admin can reset user passwords from User Management
This is different from user self-reset via forget password
```

---

## BACKEND IMPLEMENTATION STRUCTURE

### Directory Structure
```
src/
├── models/
│   └── PasswordReset.js (NEW)
│
├── controllers/
│   └── auth.controller.js (MODIFY)
│       ├── forgetPassword()
│       ├── verifyResetToken()
│       └── resetPassword()
│
├── routes/
│   └── auth.js (MODIFY)
│       ├── POST /forget-password
│       ├── GET /verify-reset-token/:token
│       └── POST /reset-password
│
├── middleware/
│   ├── rateLimiter.js (MODIFY or CREATE)
│   └── validate.js (MODIFY)
│
├── utils/
│   ├── tokenGenerator.js (NEW)
│   └── emailService.js (MODIFY)
│
└── validators/
    └── passwordValidator.js (NEW)
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Database & Models
- [ ] Create PasswordReset Model
- [ ] Modify User Model (add fields for password history)
- [ ] Create indexes on PasswordReset (userId, token, expiresAt)
- [ ] Create migration script (if needed)

### Phase 2: Utilities & Helpers
- [ ] Create token generator utility (crypto.randomBytes + bcrypt)
- [ ] Create password validator utility (regex + rules)
- [ ] Modify email service for reset email template
- [ ] Create rate limiter middleware (using Redis)

### Phase 3: Controllers & Routes
- [ ] Implement forgetPassword() controller
- [ ] Implement verifyResetToken() controller
- [ ] Implement resetPassword() controller
- [ ] Add routes to auth.js

### Phase 4: Security & Validation
- [ ] Add rate limiting middleware
- [ ] Add password validation middleware
- [ ] Add CSRF protection (if not already in place)
- [ ] Add logging/audit trail

### Phase 5: Frontend Integration Points
- [ ] Create forget password page layout
- [ ] Create reset password form with token from URL
- [ ] Integrate token verification on form load
- [ ] Handle error scenarios
- [ ] Success redirect to login

### Phase 6: Testing & Deployment
- [ ] Unit tests for token generation
- [ ] Unit tests for password validation
- [ ] Integration tests for forget flow
- [ ] Integration tests for reset flow
- [ ] Manual testing with different emails
- [ ] Manual testing with expired tokens
- [ ] Manual testing rate limiting
- [ ] Production email template verification

---

## ERROR HANDLING

### Backend Error Scenarios

| Scenario | Status | Message |
|----------|--------|---------|
| User not found | 400 | "User not found with this email" |
| Too many requests | 429 | "Too many reset requests. Try again later" |
| Invalid token | 400 | "Invalid or expired reset link" |
| Token expired | 400 | "Reset link has expired" |
| Token already used | 400 | "Reset link already used" |
| Invalid password format | 422 | "Password must be 8+ chars with uppercase, lowercase, number, special char" |
| Password in history | 422 | "Cannot reuse recent passwords" |
| Password matches current | 422 | "New password cannot be same as current" |
| Passwords don't match | 400 | "Passwords do not match" |
| Database error | 500 | "Something went wrong. Please try again" |

---

## SECURITY CONSIDERATIONS

### 1. Brute Force Protection
- Max 5 requests per email in 24 hours
- Max 3 attempts per token before expiry
- IP-based rate limiting
- Exponential backoff in frontend (1s → 2s → 5s → 15min)

### 2. Token Safety
- Never log token in any system logs
- Never return token in responses
- Always transmit over HTTPS
- Use httpOnly cookies if possible (frontend specific)

### 3. Timing Attacks Prevention
- Use `crypto.timingSafeEqual()` for token comparison
- Similar response times for valid/invalid tokens

### 4. Audit Trail
- Log all password reset attempts (success + failure)
- Track IP address and User Agent
- Store in separate audit table
- Keep for 90 days minimum

### 5. Multi-Step Verification (Optional Enhancement)
- Send OTP to registered phone
- Require OTP before allowing password reset
- Optional: biometric authentication

---

## TESTING STRATEGY

### Unit Tests
```
✓ Token generation uniqueness
✓ Token hashing consistency
✓ Token expiry calculation
✓ Password validation rules
✓ Password hashing
✓ Rate limiter logic
```

### Integration Tests
```
✓ Forget password request → email sent
✓ Email link validity check
✓ Token verification with valid token
✓ Token verification with expired token
✓ Reset password with valid token
✓ Reset password with invalid password
✓ Rate limiting enforcement
✓ Token single-use enforcement
```

### Manual Testing Checklist
- [ ] Request reset from correct email
- [ ] Request reset from non-existent email
- [ ] Click reset link immediately
- [ ] Wait 30+ minutes and click reset link
- [ ] Try using same link twice
- [ ] Reset password with invalid format
- [ ] Reset password with same as old password
- [ ] Verify email notifications sent
- [ ] Test with different user roles (not admin)

---

## DEPENDENCIES REQUIRED

### New Package Requirements
```json
{
  "bcrypt": "^5.1.1",
  "express-rate-limit": "^6.0.0",
  "redis": "^4.6.0",
  "crypto": "builtin"
}
```

---

## MIGRATION GUIDE

### For Existing Users
- No password change required
- PasswordReset table starts empty
- Existing users can use forget password anytime
- No breaking changes to auth flow

---

## FUTURE ENHANCEMENTS

1. **Two-Factor Authentication (2FA)**
   - Optional 2FA for sensitive accounts
   - OTP via SMS or authenticator app

2. **Social Login Recovery**
   - Alternative reset via social accounts
   - Email verification from linked account

3. **Security Questions**
   - Additional verification step
   - Configurable by user

4. **Password Strength Indicator**
   - Real-time feedback during password entry
   - Visual strength meter

5. **Admin Override**
   - Admin can reset user password from dashboard
   - Requires email verification by user

6. **Session Invalidation**
   - Invalidate all sessions on password reset
   - Force re-login on all devices

---

## DEPLOYMENT CHECKLIST

- [ ] Database migrations run successfully
- [ ] Environment variables configured (email service keys, URLs)
- [ ] Redis configured for rate limiting
- [ ] Email templates tested
- [ ] CORS policies updated if needed
- [ ] Security headers verified
- [ ] HTTPS enforced
- [ ] Rate limiting thresholds reviewed
- [ ] Monitoring/logging enabled
- [ ] Backup strategy updated
- [ ] Rollback plan documented

---

## NOTES

- **Admin Password Reset**: Super Admin and regular Admins have separate reset flow (manage via admin panel, not forget password)
- **Email Verification**: Current system assumes email is verified during registration
- **Phone Reset**: Optional future feature - reset via OTP sent to phone
- **Session Timeout**: Consider invalidating all existing sessions on successful reset
