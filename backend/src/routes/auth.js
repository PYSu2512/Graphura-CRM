/**
 * AUTH ROUTES — Registration and authentication endpoints
 * Handles multi-step registration flow with OTP verification
 */
const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const {
  sendOTPSchema,
  verifyOTPSchema,
  createAccountSchema,
  resendOTPSchema,
  adminLoginSchema,
} = require('../validators/auth.validator');
const {
  forgetPasswordSchema,
  resetPasswordSchema,
} = require('../validators/passwordValidator');
const { passwordResetLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * POST /api/auth/send-otp
 * Send OTP to email for registration
 * Body: { email, adminName }
 */
router.post(
  '/send-otp',
  validate(sendOTPSchema, 'body'),
  authController.sendOTP
);

/**
 * POST /api/auth/verify-otp
 * Verify OTP entered by user
 * Body: { email, otp }
 */
router.post(
  '/verify-otp',
  validate(verifyOTPSchema, 'body'),
  authController.verifyOTP
);

/**
 * POST /api/auth/register
 * Complete registration and create admin account
 * Requires: OTP verification completed
 * Body: { companyName, companyEmail, companyPhone, companyAddress, adminName, adminEmail, adminPhone, password, confirmPassword, securityCode }
 */
router.post(
  '/register',
  validate(createAccountSchema, 'body'),
  authController.registerAdmin
);

/**
 * POST /api/auth/resend-otp
 * Resend OTP if user didn't receive it
 * Body: { email, adminName }
 */
router.post(
  '/resend-otp',
  validate(resendOTPSchema, 'body'),
  authController.resendOTP
);

/**
 * POST /api/auth/login
 * Admin login with required geolocation metadata
 * Body: { email, password, latitude, longitude, rememberMe? }
 */
router.post(
  '/login',
  validate(adminLoginSchema, 'body'),
  authController.adminLogin
);

/**
 * POST /api/auth/forget-password
 * Request a password reset link
 * Body: { email }
 */
router.post(
  '/forget-password',
  passwordResetLimiter,
  validate(forgetPasswordSchema, 'body'),
  authController.forgetPassword
);

/**
 * GET /api/auth/verify-reset-token/:token
 * Verify the reset token from the email link
 * Params: { token }
 */
router.get(
  '/verify-reset-token/:token',
  authController.verifyResetToken
);

/**
 * POST /api/auth/reset-password
 * Reset password using the verified token
 * Body: { token, newPassword }
 */
router.post(
  '/reset-password',
  validate(resetPasswordSchema, 'body'),
  authController.resetPassword
);

module.exports = router;
