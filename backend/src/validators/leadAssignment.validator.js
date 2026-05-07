const Joi = require('joi');

const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid identifier provided',
});

const assignmentReasonSchema = Joi.string().trim().max(500).allow('', null);

const singleAssignSchema = Joi.object({
  userId: objectIdSchema.required().messages({
    'any.required': 'Target user is required',
  }),
  reason: assignmentReasonSchema.optional(),
}).unknown(false);

const bulkAssignSchema = Joi.object({
  leadIds: Joi.array().items(objectIdSchema).min(1).required().messages({
    'array.min': 'Select at least one lead',
    'any.required': 'Lead IDs are required',
  }),
  userId: objectIdSchema.required().messages({
    'any.required': 'Target user is required',
  }),
  reason: assignmentReasonSchema.optional(),
}).unknown(false);

const batchAssignSchema = Joi.object({
  leadIds: Joi.array().items(objectIdSchema).min(1).optional(),
  userId: objectIdSchema.required().messages({
    'any.required': 'Target user is required',
  }),
  reason: assignmentReasonSchema.optional(),
}).unknown(false);

const distributeLeadsSchema = Joi.object({
  assignments: Joi.array().items(
    Joi.object({
      userId: objectIdSchema.required(),
      leadIds: Joi.array().items(objectIdSchema).min(1).required(),
      reason: assignmentReasonSchema.optional(),
    }).unknown(false)
  ).min(1).required().messages({
    'array.min': 'At least one assignment group is required',
    'any.required': 'Assignments are required',
  }),
}).unknown(false);

const assignmentTargetsQuerySchema = Joi.object({
  role: Joi.string().valid('SALES_TL', 'SALES_EXECUTIVE').optional(),
}).unknown(false);

module.exports = {
  singleAssignSchema,
  bulkAssignSchema,
  batchAssignSchema,
  distributeLeadsSchema,
  assignmentTargetsQuerySchema,
};