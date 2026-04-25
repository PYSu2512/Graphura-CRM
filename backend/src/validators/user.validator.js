const Joi = require('joi');

exports.createUserSchema = Joi.object({
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
