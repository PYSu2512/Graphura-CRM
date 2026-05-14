/**
 * TICKET SERVICE — Support Ticket Business Logic
 * Production-level implementation with hierarchical escalation
 * 
 * Hierarchy Flow:
 * Executive/Employee → Team Leader → Manager → Admin → Super Admin
 */

'use strict';

const { User, Admin, Ticket, SuperAdminTicket, Notification, AuditLog } = require('../models');
const AppError = require('../utils/appError');

// ─────────────────────────────────────────────────────────────
// ROLE HIERARCHY MAP — Determines who receives escalated tickets
// ─────────────────────────────────────────────────────────────
const ROLE_HIERARCHY = {
  // Department: [escalation_level_0, escalation_level_1, escalation_level_2]
  'SALES': {
    'SALES_EXECUTIVE': ['SALES_TL', 'SALES_MANAGER', 'ADMIN'],
    'SALES_TL': ['SALES_MANAGER', 'ADMIN'],
    'SALES_MANAGER': ['ADMIN'],
    'ADMIN': ['SUPER_ADMIN']
  },
  'FINANCE': {
    'FINANCE_EXECUTIVE': ['FINANCE_MANAGER', 'ADMIN'],
    'FINANCE_MANAGER': ['ADMIN'],
    'ADMIN': ['SUPER_ADMIN']
  },
  'MANAGEMENT': {
    'MANAGEMENT_EMPLOYEE': ['MANAGEMENT_TL', 'MANAGEMENT_MANAGER', 'ADMIN'],
    'MANAGEMENT_TL': ['MANAGEMENT_MANAGER', 'ADMIN'],
    'MANAGEMENT_MANAGER': ['ADMIN'],
    'ADMIN': ['SUPER_ADMIN']
  }
};

// Department mapping for users
const USER_DEPARTMENT_MAP = {
  'SALES_EXECUTIVE': 'SALES',
  'SALES_TL': 'SALES',
  'SALES_MANAGER': 'SALES',
  'FINANCE_EXECUTIVE': 'FINANCE',
  'FINANCE_MANAGER': 'FINANCE',
  'MANAGEMENT_EMPLOYEE': 'MANAGEMENT',
  'MANAGEMENT_TL': 'MANAGEMENT',
  'MANAGEMENT_MANAGER': 'MANAGEMENT',
};

// ─────────────────────────────────────────────────────────────
// GET DEPARTMENT FROM ROLE
// ─────────────────────────────────────────────────────────────
const getDepartmentByRole = (role) => {
  return USER_DEPARTMENT_MAP[role] || null;
};

// ─────────────────────────────────────────────────────────────
// DETERMINE INITIAL ASSIGNEE BASED ON ROLE HIERARCHY
// When a ticket is raised, auto-assign to appropriate level
// ─────────────────────────────────────────────────────────────
const determineInitialAssignee = async (raisedBy, admin) => {
  try {
    const user = await User.findById(raisedBy).select('role department admin');
    if (!user) throw new Error('User not found');

    const department = getDepartmentByRole(user.role);
    if (!department) {
      // Admin/Super Admin raises ticket — no automatic assignment
      return null;
    }

    // Get the hierarchy chain
    const escalationChain = ROLE_HIERARCHY[department]?.[user.role];
    if (!escalationChain || escalationChain.length === 0) {
      return null;
    }

    // First level in escalation chain
    const targetRole = escalationChain[0];

    // Find user with that role in same department & admin
    const assignee = await User.findOne({
      role: targetRole,
      admin: admin._id,
      isActive: true,
      isDeleted: false,
    }).select('_id name email');

    return assignee?._id || null;
  } catch (error) {
    console.error('Error determining initial assignee:', error);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// ESCALATE TICKET TO NEXT LEVEL
// Called when current assignee escalates or ticket times out
// ─────────────────────────────────────────────────────────────
const escalateTicket = async (ticket, escalatedByUser, admin) => {
  try {
    const assignee = await User.findById(ticket.assignedTo).select('role department');
    if (!assignee) throw new Error('Assignee not found');

    const department = getDepartmentByRole(assignee.role);
    if (!department) throw new Error('Invalid department for role');

    const escalationChain = ROLE_HIERARCHY[department]?.[assignee.role];
    if (!escalationChain || escalationChain.length === 0) {
      throw new Error('Cannot escalate further from this role');
    }

    // Get next level in chain
    const nextRole = escalationChain[1];
    if (!nextRole) {
      throw new Error('No next level in escalation chain');
    }

    // Find next assignee
    const nextAssignee = await User.findOne({
      role: nextRole,
      admin: admin._id,
      isActive: true,
      isDeleted: false,
    }).select('_id name email');

    if (!nextAssignee) {
      throw new Error(`No user found with role ${nextRole} to escalate to`);
    }

    // Update ticket
    ticket.assignedTo = nextAssignee._id;
    ticket.isEscalated = true;
    ticket.escalatedAt = new Date();
    ticket.status = 'ESCALATED';
    await ticket.save();

    // Audit log
    await AuditLog.create({
      admin: admin._id,
      performedBy: escalatedByUser._id,
      performerType: 'USER',
      action: 'TICKET_ESCALATED',
      targetModel: 'Ticket',
      targetId: ticket._id,
      changes: {
        from: assignee._id,
        to: nextAssignee._id,
        reason: 'Escalated to next level'
      }
    });

    return { ticket, nextAssignee };
  } catch (error) {
    console.error('Error escalating ticket:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// RESOLVE TICKET
// Mark ticket as resolved with closing notes
// ─────────────────────────────────────────────────────────────
const resolveTicket = async (ticket, resolutionMessage, resolvedByUser, admin) => {
  try {
    ticket.status = 'RESOLVED';
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = resolvedByUser._id;

    if (resolutionMessage) {
      ticket.replies.push({
        user: resolvedByUser._id,
        message: resolutionMessage,
        createdAt: new Date(),
      });
    }

    await ticket.save();

    // Audit log
    await AuditLog.create({
      admin: admin._id,
      performedBy: resolvedByUser._id,
      performerType: 'USER',
      action: 'TICKET_RESOLVED',
      targetModel: 'Ticket',
      targetId: ticket._id,
      changes: { resolutionMessage }
    });

    return ticket;
  } catch (error) {
    console.error('Error resolving ticket:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// CLOSE TICKET
// Final closure after resolution
// ─────────────────────────────────────────────────────────────
const closeTicket = async (ticket, closureNotes, closedByUser, admin) => {
  try {
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      ticket.status = 'CLOSED';

      if (closureNotes) {
        ticket.replies.push({
          user: closedByUser._id,
          message: closureNotes,
          createdAt: new Date(),
        });
      }

      await ticket.save();

      // Audit log
      await AuditLog.create({
        admin: admin._id,
        performedBy: closedByUser._id,
        performerType: 'USER',
        action: 'TICKET_CLOSED',
        targetModel: 'Ticket',
        targetId: ticket._id,
      });

      return ticket;
    }

    throw new Error('Ticket must be resolved before closing');
  } catch (error) {
    console.error('Error closing ticket:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// ADD REPLY TO TICKET
// Multiple parties can add replies
// ─────────────────────────────────────────────────────────────
const addReplyToTicket = async (ticket, replyMessage, repliedByUser) => {
  try {
    ticket.replies.push({
      user: repliedByUser._id,
      message: replyMessage,
      createdAt: new Date(),
    });

    await ticket.save();
    return ticket;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// REASSIGN TICKET
// Manual reassignment by admin or manager
// ─────────────────────────────────────────────────────────────
const reassignTicket = async (ticket, newAssigneeId, reassignedByUser, admin, reason = '') => {
  try {
    const oldAssignee = ticket.assignedTo;

    // Verify new assignee exists and is active
    const newAssignee = await User.findOne({
      _id: newAssigneeId,
      admin: admin._id,
      isActive: true,
      isDeleted: false,
    }).select('_id name email role');

    if (!newAssignee) {
      throw new AppError('Target user not found or is inactive', 404);
    }

    ticket.assignedTo = newAssigneeId;
    ticket.status = 'IN_PROGRESS';
    await ticket.save();

    // Audit log
    await AuditLog.create({
      admin: admin._id,
      performedBy: reassignedByUser._id,
      performerType: 'USER',
      action: 'TICKET_REASSIGNED',
      targetModel: 'Ticket',
      targetId: ticket._id,
      changes: {
        from: oldAssignee,
        to: newAssigneeId,
        reason: reason || 'Manual reassignment'
      }
    });

    return { ticket, newAssignee };
  } catch (error) {
    console.error('Error reassigning ticket:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// GET ASSIGNEES BY ROLE (for manual assignment options)
// ─────────────────────────────────────────────────────────────
const getAssigneesByRole = async (admin, allowedRoles = []) => {
  try {
    const query = {
      admin: admin._id,
      isActive: true,
      isDeleted: false,
    };

    if (allowedRoles.length > 0) {
      query.role = { $in: allowedRoles };
    }

    const users = await User.find(query).select('_id name email role department').lean();
    return users;
  } catch (error) {
    console.error('Error fetching assignees:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// GET TICKET STATISTICS
// For dashboard and reporting
// ─────────────────────────────────────────────────────────────
const getTicketStats = async (admin, userId = null) => {
  try {
    const filter = { admin: admin._id, isDeleted: false };

    if (userId) {
      // Get stats for specific user (as assignee or raiser)
      filter.$or = [
        { assignedTo: userId },
        { raisedBy: userId }
      ];
    }

    const stats = await Ticket.aggregate([
      { $match: filter },
      {
        $facet: {
          'byStatus': [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          'byPriority': [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            }
          ],
          'escalated': [
            {
              $match: { isEscalated: true },
              $count: 'total'
            }
          ],
          'total': [
            { $count: 'total' }
          ]
        }
      }
    ]);

    return stats[0];
  } catch (error) {
    console.error('Error getting ticket stats:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// FILTER TICKETS FOR USER DASHBOARD
// Get tickets assigned to, raised by, or escalated to user
// ─────────────────────────────────────────────────────────────
const getUserTickets = async (admin, userId, filters = {}) => {
  try {
    const user = await User.findById(userId).select('role department');
    if (!user) throw new AppError('User not found', 404);

    const baseFilter = {
      admin: admin._id,
      isDeleted: false,
    };

    // Tickets assigned to this user
    let query = Ticket.find({
      ...baseFilter,
      assignedTo: userId,
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
    });

    if (filters.sortBy === 'createdAt') {
      query = query.sort({ createdAt: -1 });
    } else if (filters.sortBy === 'priority') {
      const priorityOrder = { URGENT: 1, HIGH: 2, NORMAL: 3, LOW: 4 };
      query = query.sort({ priority: 1, createdAt: -1 });
    } else {
      query = query.sort({ escalatedAt: -1, createdAt: -1 });
    }

    const tickets = await query
      .populate('raisedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email')
      .select('-__v');

    return tickets;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

module.exports = {
  determineInitialAssignee,
  escalateTicket,
  resolveTicket,
  closeTicket,
  addReplyToTicket,
  reassignTicket,
  getAssigneesByRole,
  getTicketStats,
  getUserTickets,
  ROLE_HIERARCHY,
  USER_DEPARTMENT_MAP,
  getDepartmentByRole,
};
