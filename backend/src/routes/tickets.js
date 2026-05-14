/**
 * TICKET ROUTES — Support Ticket Management Endpoints
 * Production-level API routes with authentication & validation
 * 
 * Base Path: /api/support-tickets
 * All routes require: Authentication (User or Admin)
 */

'use strict';

const express = require('express');
const ticketController = require('../controllers/ticket.controller');
const ticketValidator = require('../validators/ticket.validator');
const { requireAuth, requireUser } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE: Apply to all routes
// Require authentication for all ticket operations
// ─────────────────────────────────────────────────────────────
router.use(requireAuth);

// ─────────────────────────────────────────────────────────────
// TICKET CREATION & RETRIEVAL
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/support-tickets
 * Create a new support ticket
 * 
 * Request Body:
 * {
 *   "subject": "System is slow",
 *   "message": "The dashboard loads very slowly...",
 *   "priority": "HIGH",
 *   "refType": "SYSTEM",
 *   "refId": null
 * }
 * 
 * Response: {
 *   "statusCode": 201,
 *   "data": { "ticket": {...} },
 *   "message": "Support ticket created successfully"
 * }
 */
router.post(
  '/',
  ticketValidator.validateCreateTicket,
  ticketController.createTicket
);

/**
 * GET /api/support-tickets
 * Fetch all tickets (with filtering & pagination)
 * 
 * Query Parameters:
 * - status: OPEN|IN_PROGRESS|RESOLVED|CLOSED|ESCALATED
 * - priority: LOW|NORMAL|HIGH|URGENT
 * - assignedTo: userId (admin only)
 * - sortBy: createdAt|priority|escalatedAt
 * - page: 1 (default)
 * - limit: 20 (default)
 * - showEscalated: true|false
 * 
 * Response: {
 *   "statusCode": 200,
 *   "data": {
 *     "tickets": [...],
 *     "pagination": { "total": 100, "page": 1, "limit": 20, "pages": 5 }
 *   }
 * }
 */
router.get(
  '/',
  ticketValidator.validateFilterTickets,
  ticketController.getAllTickets
);

/**
 * GET /api/support-tickets/stats
 * Get ticket statistics for dashboard
 * 
 * Response: {
 *   "statusCode": 200,
 *   "data": {
 *     "stats": {
 *       "byStatus": [...],
 *       "byPriority": [...],
 *       "escalated": {...},
 *       "total": {...}
 *     }
 *   }
 * }
 */
router.get('/stats', ticketController.getTicketStats);

/**
 * GET /api/support-tickets/assignees
 * Get list of users that can be assigned tickets
 * 
 * Response: {
 *   "statusCode": 200,
 *   "data": {
 *     "assignees": [
 *       { "_id": "...", "name": "...", "email": "...", "role": "SALES_TL" }
 *     ]
 *   }
 * }
 */
router.get('/assignees', ticketController.getAssigneeOptions);

/**
 * GET /api/support-tickets/:ticketId
 * Fetch a single ticket by ID
 * 
 * Response: {
 *   "statusCode": 200,
 *   "data": { "ticket": {...} }
 * }
 */
router.get('/:ticketId', ticketController.getTicketById);

// ─────────────────────────────────────────────────────────────
// TICKET LIFECYCLE MANAGEMENT
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/support-tickets/:ticketId/reply
 * Add a reply/comment to ticket
 * 
 * Request Body:
 * {
 *   "message": "I've looked into this issue..."
 * }
 */
router.post(
  '/:ticketId/reply',
  ticketValidator.validateAddReply,
  ticketController.addReply
);

/**
 * POST /api/support-tickets/:ticketId/escalate
 * Escalate ticket to next level in hierarchy
 * Only current assignee or admin can escalate
 * 
 * Request Body:
 * {
 *   "escalationReason": "Issue requires manager approval"
 * }
 */
router.post(
  '/:ticketId/escalate',
  ticketValidator.validateEscalateTicket,
  ticketController.escalateTicket
);

/**
 * POST /api/support-tickets/:ticketId/resolve
 * Mark ticket as resolved
 * Only assignee or admin can resolve
 * 
 * Request Body:
 * {
 *   "resolutionMessage": "Issue has been fixed in latest deployment"
 * }
 */
router.post(
  '/:ticketId/resolve',
  ticketValidator.validateResolveTicket,
  ticketController.resolveTicket
);

/**
 * POST /api/support-tickets/:ticketId/close
 * Close the ticket (final closure)
 * Only admin or resolver can close
 * 
 * Request Body:
 * {
 *   "closureNotes": "Confirmed fix working in production"
 * }
 */
router.post(
  '/:ticketId/close',
  ticketValidator.validateCloseTicket,
  ticketController.closeTicket
);

// ─────────────────────────────────────────────────────────────
// ADMIN-ONLY OPERATIONS
// ─────────────────────────────────────────────────────────────

/**
 * PUT /api/support-tickets/:ticketId/reassign
 * Manually reassign ticket to another user
 * Admin only
 * 
 * Request Body:
 * {
 *   "assignedTo": "userId",
 *   "reason": "User on leave this week"
 * }
 */
router.put(
  '/:ticketId/reassign',
  ticketValidator.validateReassignTicket,
  ticketController.reassignTicket
);

module.exports = router;
