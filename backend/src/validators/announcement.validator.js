const Joi = require('joi');

const audienceOptions = ['All', 'Team', 'Team Leaders', 'Executive'];
const announcementTypes = ['Announcement', 'Warning', 'Appreciation'];

const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Please provide a valid ID',
});

const createAnnouncementSchema = Joi.object({
  title: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Title is required',
  }),
  message: Joi.string().trim().max(5000).required().messages({
    'string.empty': 'Message is required',
  }),
  type: Joi.string().valid(...announcementTypes).required().messages({
    'any.only': 'Invalid announcement type provided',
    'string.empty': 'Type is required',
  }),
  audience: Joi.string().valid(...audienceOptions).required().messages({
    'any.only': 'Invalid audience provided',
    'string.empty': 'Audience is required',
  }),
  targetId: Joi.string().trim().allow('', null).optional(),
  expiryDate: Joi.date().greater('now').optional().allow(null).messages({
    'date.greater': 'Expiry date must be in the future',
  }),
});

const announcementTargetsQuerySchema = Joi.object({
  audience: Joi.string().valid(...audienceOptions).required().messages({
    'any.only': 'Invalid audience provided',
    'string.empty': 'Audience is required',
  }),
});

const listAnnouncementsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  createAnnouncementSchema,
  announcementTargetsQuerySchema,
  listAnnouncementsQuerySchema,
  announcementTypes,
  audienceOptions,
  objectIdSchema,
};