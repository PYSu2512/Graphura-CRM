const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name is required'
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required'
  }),
  phone: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Phone must be exactly 10 digits',
    'string.empty': 'Phone is required'
  }),
  departmentId: Joi.string().required().messages({
    'string.empty': 'Department ID is required'
  }),
  role: Joi.string().valid(
    'SALES_MANAGER', 'SALES_TL', 'SALES_EXECUTIVE',
    'FINANCE_MANAGER',
    'MANAGEMENT_MANAGER', 'MANAGEMENT_TL', 'MANAGEMENT_EMPLOYEE'
  ).required().messages({
    'any.only': 'Invalid role provided',
    'string.empty': 'Role is required'
  }),
  teamId: Joi.string().optional().allow(null, ''),
  leadDataLimit: Joi.number().optional().allow(null),
});

const departmentLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
  }),
  latitude: Joi.number().required().min(-90).max(90).messages({
    'any.required': 'Location permission is required to sign in',
    'number.base': 'Latitude must be a valid number',
  }),
  longitude: Joi.number().required().min(-180).max(180).messages({
    'any.required': 'Location permission is required to sign in',
    'number.base': 'Longitude must be a valid number',
  }),
  rememberMe: Joi.boolean().optional(),
});

const setupAccountSchema = Joi.object({
  newPassword: Joi.string().min(8).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'Password must be at least 8 characters',
  }),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required',
  }),
});

const setupBankDetailsSchema = Joi.object({
  beneficiaryName: Joi.string().trim().required().messages({ 'string.empty': 'Beneficiary name is required' }),
  bankName: Joi.string().trim().required().messages({ 'string.empty': 'Bank name is required' }),
  accountNumber: Joi.string().trim().required().messages({ 'string.empty': 'Account number is required' }),
  ifscCode: Joi.string().trim().required().messages({ 'string.empty': 'IFSC code is required' }),
  branch: Joi.string().trim().allow('', null).optional(),
  upiId: Joi.string().trim().allow('', null).optional(),
});

const updateBankDetailsSchema = Joi.object({
  beneficiaryName: Joi.string().trim().required().messages({ 'string.empty': 'Beneficiary name is required' }),
  bankName: Joi.string().trim().required().messages({ 'string.empty': 'Bank name is required' }),
  accountNumber: Joi.string().trim().required().messages({ 'string.empty': 'Account number is required' }),
  ifscCode: Joi.string().trim().required().messages({ 'string.empty': 'IFSC code is required' }),
  branch: Joi.string().trim().allow('', null).optional(),
  upiId: Joi.string().trim().allow('', null).optional(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().optional().messages({
    'string.empty': 'Name cannot be empty'
  }),
  email: Joi.string().email().lowercase().trim().optional().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email cannot be empty'
  }),
  phone: Joi.string().pattern(/^\d{10}$/).optional().messages({
    'string.pattern.base': 'Phone must be exactly 10 digits',
    'string.empty': 'Phone cannot be empty'
  }),
  address: Joi.string().trim().allow('', null).optional(),
});

module.exports = {
  createUserSchema,
  departmentLoginSchema,
  setupAccountSchema,
  setupBankDetailsSchema,
  updateBankDetailsSchema,
  updateProfileSchema,
};

