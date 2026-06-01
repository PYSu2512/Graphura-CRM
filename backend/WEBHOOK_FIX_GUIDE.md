# Payment Webhook Signature Fix & Testing Guide

## Problem Summary
Webhook signature verification was failing with "signature verification failed" errors.

## Root Causes & Fixes Applied

### 1. **Raw Body Capture Issue** ✓ FIXED
**Problem**: When using `express.raw()` for webhook route, the raw body wasn't being consistently captured for signature verification.

**Solution**:
- Added explicit middleware to capture `req.rawBody` from the Buffer
- Ensured both `req.body` (Buffer) and `req.rawBody` are available
- Updated controller to intelligently select the correct body source

**File**: `backend/src/server.js` (lines 64-80)
```javascript
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '64kb' }));

// Middleware to capture raw body for webhook verification
app.use('/api/payments/webhook', (req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body;
  }
  next();
});

app.use('/api/payments/webhook', paymentWebhookRoutes);
```

### 2. **Signature Verification Logging** ✓ FIXED
**Problem**: When signature verification failed, there was no detailed logging to diagnose why.

**Solution**:
- Added comprehensive logging at each stage of verification
- Log which secrets are being tried and why
- Show signature mismatch details (first 20 chars of expected vs actual)
- Track raw body length and format

**File**: `backend/src/controllers/paymentWebhook.controller.js` (lines 13-70)

### 3. **Webhook Configuration Diagnostics** ✓ ADDED
**New Endpoints**:
- `POST /api/payments/webhook/test` - Test signature verification locally
- `GET /api/payments/webhook/status` - View webhook configuration and health status

**File**: `backend/src/routes/paymentWebhooks.js`

---

## How to Fix Webhook Signature Failures

### Step 1: Check Environment Configuration
Verify that `RAZORPAY_WEBHOOK_SECRET` in `.env` matches Razorpay dashboard:

```bash
# In terminal, check current secret (MASKED)
echo $RAZORPAY_WEBHOOK_SECRET

# Go to Razorpay Dashboard:
# Settings > Webhooks > Find your webhook > Copy the Webhook Secret
# Update .env with this secret
```

### Step 2: Check Webhook Health Status
```bash
# Get webhook status and recent failures
curl http://localhost:3000/api/payments/webhook/status
```

Expected response:
```json
{
  "status": "ok",
  "webhook": {
    "globalSecretConfigured": true,
    "recentWebhooks": 5,
    "recentFailures": 0,
    "recentSuccesses": 5,
    "lastWebhook": {
      "event": "payment_link.paid",
      "isVerified": true,
      "createdAt": "2024-06-01T10:30:00Z"
    }
  }
}
```

### Step 3: Test Signature Verification Locally
Use the test endpoint to verify your signature logic is correct:

```bash
# Test with correct secret
curl -X POST http://localhost:3000/api/payments/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "signature": "553680f486c9625961d645736dc3a6db7d1a435b08c6ecf13b6fbe70e8c1234",
    "payload": {"event":"payment_link.paid","created_at":1780312462},
    "secret": "your_webhook_secret_from_env"
  }'
```

Response:
```json
{
  "signatureProvided": "553680f486c9625961d6...",
  "signatureExpected": "553680f486c9625961d6...",
  "matches": true,
  "rawLength": 64,
  "rawPreview": "{"event":"payment_link.paid","created_at":1780312462}"
}
```

---

## Testing the Full Payment Flow

### Scenario: Webhook Signature Failing

#### Root Cause Analysis Checklist:
- [ ] Is `RAZORPAY_WEBHOOK_SECRET` in `.env` the same as in Razorpay Dashboard?
- [ ] Is the webhook URL correctly configured in Razorpay Dashboard?
- [ ] Are recent webhooks showing `isVerified: false` in `/webhook/status`?
- [ ] Does the test endpoint show `"matches": false`?

#### Fix Steps:
1. **Verify Secret Match**:
   - Go to Razorpay Dashboard > Settings > Webhooks
   - Copy the Webhook Secret
   - Update `.env`: `RAZORPAY_WEBHOOK_SECRET=<copied_secret>`
   - Restart backend: `npm start`

2. **Test Local Signature**:
   - Use `/api/payments/webhook/test` endpoint with the secret
   - If `"matches": true`, signature logic is correct
   - If `"matches": false`, secret in .env is wrong

3. **Check Webhook Logs**:
   - Call `GET /api/payments/webhook/status`
   - Look at `lastWebhook.error` if `isVerified: false`
   - Check backend console logs for detailed error messages

### Scenario: Payment Succeeds but Webhook Doesn't Update Database

1. **Verify Webhook Was Received**:
   ```bash
   curl http://localhost:3000/api/payments/webhook/status
   ```
   - Check `recentWebhooks` count
   - Should increase after payment completion

2. **Check If Signature Verified**:
   - Look at `recentSuccesses` vs `recentFailures`
   - If failures > successes, signature is wrong (see above)

3. **Check Database Updates**:
   ```javascript
   // In MongoDB, verify Payment record was updated
   db.payments.findOne({ paymentLinkId: "plink_xxx" })
   // Should have: status: 'SUCCESS', paidAt: Date, webhookVerified: true
   ```

4. **Check ProspectForm Updates**:
   ```javascript
   // Prospect should also be updated
   db.prospectforms.findOne({ _id: prospectId })
   // Should have: paymentStatus: 'SUCCESS', paymentVerifiedAt: Date
   ```

---

## Complete Webhook Payment Flow

### Flow Diagram
```
1. User completes payment on Razorpay
                 ↓
2. Razorpay sends webhook to: POST /api/payments/webhook/razorpay
   Headers: x-razorpay-signature: <sha256_hmac>
   Body: { event: 'payment_link.paid', payload: {...} }
                 ↓
3. Express.raw() captures request body as Buffer
                 ↓
4. Webhook middleware stores req.rawBody
                 ↓
5. Controller receives request
   - Extracts signature from header
   - Gets raw body from req.body (Buffer) or req.rawBody
   - Calculates expected HMAC-SHA256 signature
   - Compares with provided signature
                 ↓
6a. IF Signature Verified (isVerified: true):
   - Create WebhookLog with isVerified: true
   - Find Payment record by paymentLinkId
   - Update Payment: status = 'SUCCESS', paidAt = now
   - Update ProspectForm: paymentStatus = 'SUCCESS'
   - Return 200 OK
                 ↓
6b. IF Signature Failed (isVerified: false):
   - Create WebhookLog with isVerified: false, error: "signature verification failed"
   - Return 400 Bad Request
   - Database is NOT updated
   - Frontend polling will continue waiting
```

---

## Debugging Steps

### If Webhook is Not Being Received:
1. Check Razorpay Dashboard - Webhook URL must be public (not localhost)
2. Verify webhook is enabled and active in Razorpay settings
3. Check Razorpay webhook event history in dashboard
4. Use ngrok or similar to tunnel localhost for testing

### If Webhook Received but Signature Fails:
1. `RAZORPAY_WEBHOOK_SECRET` doesn't match Razorpay settings
2. Check if secret was recently rotated
3. Verify no special characters or encoding issues in .env

### If Payment Updated in DB but UI Doesn't Show:
1. Frontend polls `/finance/payments` every 10 seconds
2. Check browser console for fetch errors
3. Verify Payment record shows correct status in MongoDB
4. Clear browser cache and refresh

---

## Key Files Modified

| File | Changes |
|------|---------|
| `backend/src/server.js` | Added raw body capture middleware for webhook route |
| `backend/src/controllers/paymentWebhook.controller.js` | Added comprehensive logging + test/status endpoints |
| `backend/src/routes/paymentWebhooks.js` | Added debug middleware + test/status routes |
| `backend/scripts/test-webhook-signature.js` | NEW: Webhook signature test utility |
| `frontend/src/pages/finance/PaymentSuccess.jsx` | NEW: Payment success redirect page |
| `frontend/src/pages/finance/Payments.jsx` | Added polling + auto-refresh on success |

---

## Testing Checklist

- [ ] Backend server starts without errors: `npm start`
- [ ] Webhook test passes: `POST /api/payments/webhook/test`
- [ ] Webhook status shows recent activity: `GET /api/payments/webhook/status`
- [ ] Create payment link: Click "Send Razorpay Link"
- [ ] Complete test payment on Razorpay
- [ ] Verify payment success page shows: `/finance/payments/success`
- [ ] Check Payment record in DB: `db.payments.findOne(...)`
- [ ] Verify ProspectForm updated: `db.prospectforms.findOne(...)`
- [ ] Frontend Payments table auto-refreshes: Check polling in console
- [ ] Status changes from "Pending" to "Successful"

---

## Recovery Commands

### Reset Webhook Test Scenario
```bash
# 1. Restart backend
npm start

# 2. Check webhook health
curl http://localhost:3000/api/payments/webhook/status

# 3. Test signature locally
curl -X POST http://localhost:3000/api/payments/webhook/test ...

# 4. Check database state
mongo graphura_crm
db.webhooklogs.find().sort({ createdAt: -1 }).limit(5)
```

### Manual Payment Verification
If webhook fails but you need to mark payment as successful:
1. Go to Finance > Payments
2. Click payment row
3. Click "Verify / Update" button
4. Set status to "Successful"
5. Save

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "signature verification failed" | Check RAZORPAY_WEBHOOK_SECRET in .env matches Razorpay dashboard |
| Webhook not received | Ensure webhook URL is public (not localhost). Use ngrok for local testing |
| Payment updated but UI shows old status | Frontend polls every 10s. Wait or refresh page |
| Random signature failures | Check for timeout/retry issues. Look for duplicate WebhookLogs |
| Payment status stuck in "PENDING" | Check WebhookLog for "signature verification failed". Fix secret. Manually verify if needed |

---

## Production Deployment Notes

1. **Webhook Secret Management**:
   - Store RAZORPAY_WEBHOOK_SECRET in secure secret manager (not git)
   - Use different secrets for dev/staging/production
   - Never log the full secret value

2. **Monitoring**:
   - Set up alerts for webhook verification failures
   - Monitor `/api/payments/webhook/status` endpoint regularly
   - Track WebhookLog entries with `isVerified: false`

3. **Resilience**:
   - Webhook handler is idempotent (checks Payment.status !== 'SUCCESS')
   - Failed webhooks are logged but don't block payment creation
   - Frontend polling ensures UI eventually syncs with database

---

## References

- [Razorpay Webhook Documentation](https://razorpay.com/docs/webhooks/)
- [Razorpay Payment Links](https://razorpay.com/docs/payment-links/)
- [HMAC-SHA256 Signature Verification](https://razorpay.com/docs/webhooks/#verifying-payloads)
