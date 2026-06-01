# Payments (Razorpay) — Setup & Test

This document explains the environment variables, steps to enable live Razorpay integration, and how to run the included tests locally.

## Required environment variables
- `JWT_ACCESS_SECRET` — JWT access token secret used by the app.
- `JWT_REFRESH_SECRET` — JWT refresh secret.
- `FRONTEND_URL` — frontend base URL (e.g. `http://localhost:5173`).
- `BREVO_API_KEY` — Brevo (Sendinblue) API key for sending emails.
- `BREVO_SENDER_EMAIL` — sender address for transactional emails.

Optional (for live Razorpay)
- `RAZORPAY_KEY_ID` — Razorpay key id
- `RAZORPAY_KEY_SECRET` — Razorpay key secret

## Local development (simulated link)
If you do NOT provide Razorpay keys, the system will create a simulated payment link URL and still send the email via Brevo (if configured).

## Enabling live Razorpay
1. Install the Razorpay SDK:

```bash
cd backend
npm install razorpay
```

2. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to your `.env`.
3. In the Razorpay dashboard, create a webhook with URL:

```
https://<your-host>/api/payments/webhook/razorpay
```

Set the webhook secret (use the same as `RAZORPAY_KEY_SECRET`) and enable `payment.captured` and `payment.link.paid` events.

## Tests
We included two test files:
- `test/razorpay.service.test.js` — unit test for `createPaymentLink` fallback behavior
- `test/integration/payment.flow.test.js` — integration test using an in-memory MongoDB; it creates Admin/Client/Lead/Prospect and simulates a webhook.

Install dev deps first:

```bash
cd backend
npm install
```

Run the unit test:

```bash
node --test test/razorpay.service.test.js
```

Run the integration test (requires dev deps installed):

```bash
node --test test/integration/payment.flow.test.js
```

Or run all tests:

```bash
node --test
```

## Notes
- Webhook verification expects the Razorpay secret (`RAZORPAY_KEY_SECRET`) to be available in `process.env` or tenant `ApiConfig`.
- If running the integration test, the test sets `process.env.RAZORPAY_KEY_SECRET` to sign the payload.
- Ensure `BREVO_API_KEY` is set if you want emails delivered. If you don't have a Brevo key, the email sending will throw; tests do not exercise email delivery.

If you want, I can also add CI workflow (GitHub Actions) to run the tests on push and to deploy when keys are present.
