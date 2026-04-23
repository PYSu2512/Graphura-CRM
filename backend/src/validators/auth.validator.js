/**
 * AUTH VALIDATOR — Joi schemas for authentication endpoints
 * Validates admin registration, OTP verification, and related flows
 */
const Joi = require('joi');

// ─────────────────────────────────────────────────────────────
// STEP 1: Register Admin — Company & Contact Details
// ─────────────────────────────────────────────────────────────
const registerStep1Schema = Joi.object({
  // Company Details
  companyName: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.empty': 'Company name is required',
      'string.min': 'Company name must be at least 2 characters',
    }),

  companyEmail: Joi.string()
    .required()
    .lowercase()
    .email()
    .messages({
      'string.email': 'Enter a valid company email',
    }),

  companyPhone: Joi.string()
    .required()
    .regex(/^\d{10}$/)
    .messages({
      'string.pattern.base': 'Phone must be 10 digits',
    }),

  companyAddress: Joi.string()
    .optional()
    .trim()
    .max(200),

  // Admin/Owner Details
  adminName: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'Admin name is required',
    }),

  adminEmail: Joi.string()
    .required()
    .lowercase()
    .email()
    .messages({
      'string.email': 'Enter a valid admin email',
    }),

  adminPhone: Joi.string()
    .required()
    .regex(/^\d{10}$/)
    .messages({
      'string.pattern.base': 'Phone must be 10 digits',
    }),
});

// ─────────────────────────────────────────────────────────────
// STEP 2: Send OTP to Email
// ─────────────────────────────────────────────────────────────
const sendOTPSchema = Joi.object({
  email: Joi.string()
    .required()
    .lowercase()
    .email()
    .messages({
      'string.email': 'Enter a valid email',
    }),
});

// ─────────────────────────────────────────────────────────────
// STEP 3: Verify OTP
// ─────────────────────────────────────────────────────────────
const verifyOTPSchema = Joi.object({
  email: Joi.string()
    .required()
    .lowercase()
    .email(),

  otp: Joi.string()
    .required()
    .length(6)
    .pattern(/^\d{6}$/)
    .messages({
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only digits',
    }),
});

// ─────────────────────────────────────────────────────────────
// STEP 4: Create Account with Password
// ─────────────────────────────────────────────────────────────
const createAccountSchema = Joi.object({
  companyName: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(100),

  companyEmail: Joi.string()
    .required()
    .lowercase()
    .email(),

  companyPhone: Joi.string()
    .optional()
    .regex(/^\d{10}$/),

  companyAddress: Joi.string()
    .optional()
    .trim()
    .max(200),

  adminName: Joi.string()
    .optional()
    .trim()
    .min(2)
    .max(50),

  ownerName: Joi.string()
    .optional()
    .trim()
    .min(2)
    .max(50),

  adminEmail: Joi.string()
    .optional()
    .lowercase()
    .email(),

  adminPhone: Joi.string()
    .optional()
    .regex(/^\d{10}$/),

  password: Joi.string()
    .required()
    .min(8)
    .max(128)
    .pattern(/[A-Z]/) // At least one uppercase
    .pattern(/[a-z]/) // At least one lowercase
    .pattern(/\d/)    // At least one digit
    .pattern(/[@$!%*?&]/) // At least one special char
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, digit, and special character',
    }),

  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .messages({
      'any.only': 'Passwords do not match',
    }),

  securityCode: Joi.string()
    .required()
    .length(4)
    .pattern(/^\d{4}$/)
    .messages({
      'string.length': 'Security code must be 4 digits',
    }),
}).or('adminName', 'ownerName');

// ─────────────────────────────────────────────────────────────
// RESEND OTP
// ─────────────────────────────────────────────────────────────
const resendOTPSchema = Joi.object({
  email: Joi.string()
    .required()
    .lowercase()
    .email(),
});

// ─────────────────────────────────────────────────────────────
// ADMIN LOGIN
// ─────────────────────────────────────────────────────────────
const adminLoginSchema = Joi.object({
  email: Joi.string()
    .required()
    .lowercase()
    .email()
    .messages({
      'string.email': 'Enter a valid email',
      'string.empty': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .min(8)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    }),

  latitude: Joi.number()
    .required()
    .min(-90)
    .max(90)
    .messages({
      'any.required': 'Location permission is required to sign in',
      'number.base': 'Location latitude must be a number',
    }),

  longitude: Joi.number()
    .required()
    .min(-180)
    .max(180)
    .messages({
      'any.required': 'Location permission is required to sign in',
      'number.base': 'Location longitude must be a number',
    }),

  rememberMe: Joi.boolean().optional(),
});

module.exports = {
  registerStep1Schema,
  sendOTPSchema,
  verifyOTPSchema,
  createAccountSchema,
  resendOTPSchema,
  adminLoginSchema,
};
