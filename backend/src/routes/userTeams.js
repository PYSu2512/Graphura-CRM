/**
 * USER TEAM ROUTES — Team management API endpoints for non-admin users
 * Allows department users (Sales Manager / Sales TL) to create/manage teams
 */

const express = require('express');
const router = express.Router();
const { requireUser } = require('../middleware/auth');
const userTeamController = require('../controllers/userTeam.controller');

// All routes require user authentication (department users)
router.use(requireUser);

// Create team (scoped to user's admin and department)
router.post('/', userTeamController.createTeam);

// List teams for department user (teams in user's department)
router.get('/', userTeamController.listUserTeams);

// Specific GET routes MUST come before /:id to avoid matching conflicts
router.get('/available-leaders/:departmentId', userTeamController.getAvailableLeaders);
router.get('/leader/:leaderId/employees', userTeamController.getLeaderEmployees);

// Get available members for a team
router.get('/:id/available-members', userTeamController.getAvailableMembers);

// Add member to team (user must be allowed)
router.post('/:id/members', userTeamController.addTeamMember);

// Remove member from team
router.delete('/:id/members/:userId', userTeamController.removeTeamMember);

// Update team (name, leader)
router.put('/:id', userTeamController.updateTeam);

// Delete team (soft delete)
router.delete('/:id', userTeamController.deleteTeam);

// Get single team details (scoped to user's department) — MUST come last
router.get('/:id', userTeamController.getUserTeamById);

module.exports = router;
