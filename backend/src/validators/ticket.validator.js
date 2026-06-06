/**
 * TICKET VALIDATOR — Input validation for Support Tickets
 * Production-level validation with detailed error messages
 */

'use strict';

const Joi = require('joi');

// ─────────────────────────────────────────────────────────────
// SCHEMA: Create Ticket
// User raises a new support ticket
// ─────────────────────────────────────────────────────────────
const createTicketSchema = Joi.object({
  subject: Joi.string()
    .min(3)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.empty': 'Subject is required',
      'string.min': 'Subject must be at least 3 characters',
      'string.max': 'Subject must not exceed 200 characters',
    }),

  message: Joi.string()
    .min(3)
    .max(2000)
    .required()
    .trim()
    .messages({
      'string.empty': 'Message is required',
      'string.min': 'Message must be at least 3 characters',
      'string.max': 'Message must not exceed 2000 characters',
    }),

  priority: Joi.string()
    .valid('LOW', 'NORMAL', 'MEDIUM', 'HIGH', 'URGENT')
    .default('NORMAL')
    .messages({
      'any.only': 'Priority must be one of: LOW, NORMAL, MEDIUM, HIGH, URGENT',
    }),

  refType: Joi.string()
    .valid('CLIENT_DATA', 'SALES_MANAGER', 'SALES_TL', 'EXECUTIVE', 'SYSTEM')
    .optional()
    .allow(null)
    .messages({
      'any.only': 'Invalid reference type',
    }),

  refId: Joi.string()
    .optional()
    .allow(null)
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid reference ID format',
    }),

  targetHierarchy: Joi.string()
    .valid('TL', 'MANAGER', 'ADMIN', 'ALL')
    .default('ALL')
    .messages({
      'any.only': 'Target must be one of: TL, MANAGER, ADMIN, ALL',
    }),
});

// ─────────────────────────────────────────────────────────────
// SCHEMA: Add Reply to Ticket
// Team members add replies/comments
// ─────────────────────────────────────────────────────────────
const addReplySchema = Joi.object({
  message: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .trim()
    .messages({
      'string.empty': 'Reply message is required',
      'string.min': 'Reply cannot be empty',
      'string.max': 'Reply must not exceed 1000 characters',
    }),
});

// ─────────────────────────────────────────────────────────────
// SCHEMA: Escalate Ticket
// Escalate to next level in hierarchy
// ─────────────────────────────────────────────────────────────
const escalateTicketSchema = Joi.object({
  escalationReason: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .trim()
    .messages({
      'string.max': 'Escalation reason must not exceed 500 characters',
    }),
});

// ─────────────────────────────────────────────────────────────
// SCHEMA: Resolve Ticket
// Mark ticket as resolved
// ─────────────────────────────────────────────────────────────
const resolveTicketSchema = Joi.object({
  resolutionMessage: Joi.string()
    .min(5)
    .max(1000)
    .optional()
    .allow('')
    .trim()
    .messages({
      'string.min': 'Resolution must be at least 5 characters',
      'string.max': 'Resolution must not exceed 1000 characters',
    }),
});

// ─────────────────────────────────────────────────────────────
// SCHEMA: Close Ticket
// Final closure after resolution
// ─────────────────────────────────────────────────────────────
const closeTicketSchema = Joi.object({
  closureNotes: Joi.string()
    .max(500)
    .optional()
    .trim()
    .messages({
      'string.max': 'Closure notes must not exceed 500 characters',
    }),
});

// ─────────────────────────────────────────────────────────────
// SCHEMA: Reassign Ticket
// Manual reassignment by admin/manager
// ─────────────────────────────────────────────────────────────
const reassignTicketSchema = Joi.object({
  assignedTo: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.empty': 'Assignee ID is required',
      'string.pattern.base': 'Invalid assignee ID format',
    }),

  reason: Joi.string()
    .max(300)
    .optional()
    .trim()
    .messages({
      'string.max': 'Reason must not exceed 300 characters',
    }),
});

// ─────────────────────────────────────────────────────────────
// SCHEMA: Filter Tickets (Query Parameters)
// For ticket listing with filters
// ─────────────────────────────────────────────────────────────
const filterTicketsSchema = Joi.object({
  status: Joi.string()
    .valid('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED')
    .optional()
    .messages({
      'any.only': 'Invalid status filter',
    }),

  priority: Joi.string()
    .valid('LOW', 'NORMAL', 'MEDIUM', 'HIGH', 'URGENT')
    .optional()
    .messages({
      'any.only': 'Invalid priority filter',
    }),

  assignedTo: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
    }),

  sortBy: Joi.string()
    .valid('createdAt', 'priority', 'escalatedAt')
    .default('createdAt')
    .optional()
    .messages({
      'any.only': 'Invalid sort option',
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .optional(),

  showEscalated: Joi.boolean()
    .default(false)
    .optional(),

  // view=assigned → tickets assigned to me | view=raised → tickets I raised
  view: Joi.string()
    .valid('assigned', 'raised')
    .optional(),
});

// ─────────────────────────────────────────────────────────────
// VALIDATION MIDDLEWARE FACTORY
// Express 5 compatible: req.query and req.params are read-only
// getters — we store validated values on req._validated[source]
// and also patch req.query via Object.defineProperty so existing
// controller code reading req.query still works.
// ─────────────────────────────────────────────────────────────
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        errors: messages,
      });
    }

    if (source === 'body') {
      // body is writable in Express 5
      req.body = value;
    } else if (source === 'query') {
      // Express 5: req.query is a read-only getter — override with defineProperty
      Object.defineProperty(req, 'query', {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else if (source === 'params') {
      // Express 5: req.params is also a read-only getter
      Object.defineProperty(req, 'params', {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    next();
  };
};

// ─────────────────────────────────────────────────────────────
// SCHEMA: Update Status
// ─────────────────────────────────────────────────────────────
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED')
    .required()
    .messages({
      'any.only': 'Status must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED, ESCALATED',
    }),
  message: Joi.string().optional().allow(''),
  reason: Joi.string().optional().allow(''),
  closureNotes: Joi.string().optional().allow(''),
  resolutionMessage: Joi.string().optional().allow(''),
});

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
  validateCreateTicket: validate(createTicketSchema, 'body'),
  validateAddReply: validate(addReplySchema, 'body'),
  validateEscalateTicket: validate(escalateTicketSchema, 'body'),
  validateResolveTicket: validate(resolveTicketSchema, 'body'),
  validateCloseTicket: validate(closeTicketSchema, 'body'),
  validateReassignTicket: validate(reassignTicketSchema, 'body'),
  validateFilterTickets: validate(filterTicketsSchema, 'query'),
  validateUpdateStatus: validate(updateStatusSchema, 'body'),

  // Export schemas for direct use if needed
  schemas: {
    createTicketSchema,
    addReplySchema,
    escalateTicketSchema,
    resolveTicketSchema,
    closeTicketSchema,
    reassignTicketSchema,
    filterTicketsSchema,
    updateStatusSchema,
  },
};
