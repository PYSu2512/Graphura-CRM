/**
 * TEAM ROUTES — Team management API endpoints
 * All routes require admin authentication
 * Production-grade with proper validation and error handling
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const teamController = require('../controllers/team.controller');
const userTeamRoutes = require('./userTeams');
const {
  createTeamSchema,
  updateTeamSchema,
  addMemberSchema,
  listTeamsSchema,
} = require('../validators/team.validator');

// ════════════════════════════════════════════════════════════
// MIDDLEWARE — Admin authentication required on all routes
// ════════════════════════════════════════════════════════════
router.use('/user-teams', userTeamRoutes);
router.use(requireAdmin);

// ════════════════════════════════════════════════════════════
// TEAM CRUD OPERATIONS
// ════════════════════════════════════════════════════════════

/**
 * POST /api/teams
 * Create a new team
 * Body: { name, department, leader? }
 */
router.post(
  '/',
  validate(createTeamSchema, 'body'),
  teamController.createTeam
);

/**
 * GET /api/teams
 * List all teams (optionally filtered by department)
 * Query: { page?, limit?, sort?, department? }
 */
router.get(
  '/',
  validate(listTeamsSchema, 'query'),
  teamController.listTeams
);

/**
 * GET /api/teams/:id
 * Get single team details
 */
router.get(
  '/:id',
  teamController.getTeam
);

/**
 * PUT /api/teams/:id
 * Update team (name, leader, isActive)
 * Body: { name?, leader?, isActive? }
 */
router.put(
  '/:id',
  validate(updateTeamSchema, 'body'),
  teamController.updateTeam
);

/**
 * DELETE /api/teams/:id
 * Soft delete a team
 */
router.delete(
  '/:id',
  teamController.deleteTeam
);

// ════════════════════════════════════════════════════════════
// TEAM MEMBER MANAGEMENT
// ════════════════════════════════════════════════════════════

/**
 * POST /api/teams/:id/members
 * Add a member to team
 * Body: { userId }
 */
router.post(
  '/:id/members',
  validate(addMemberSchema, 'body'),
  teamController.addTeamMember
);

/**
 * DELETE /api/teams/:id/members/:userId
 * Remove a member from team
 */
router.delete(
  '/:id/members/:userId',
  teamController.removeTeamMember
);

/**
 * GET /api/teams/:id/available-members
 * Get available members for adding to team (not yet in this team)
 */
router.get(
  '/:id/available-members',
  teamController.getAvailableMembers
);

// ════════════════════════════════════════════════════════════
// TEAM LEADERS & AVAILABLE USERS
// ════════════════════════════════════════════════════════════

/**
 * GET /api/teams/available-leaders/:departmentId
 * Get available team leaders (users with SALES_TL role)
 * Note: This route must be AFTER /:id routes to avoid conflicts
 */
router.get(
  '/available-leaders/:departmentId',
  teamController.getAvailableLeaders
);

module.exports = router;
