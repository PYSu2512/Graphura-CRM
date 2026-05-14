/**
 * TICKET CONTROLLER — Support Ticket Management API
 * Production-level endpoints with comprehensive business logic
 * Handles: Create, Read, Update, Escalate, Resolve, Close tickets
 */

'use strict';

const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const { Ticket, User, AuditLog, Notification } = require('../models');
const ticketService = require('../services/ticket.service');
const notificationService = require('../services/notification.service');

// ─────────────────────────────────────────────────────────────
// POST: Create New Support Ticket
// Any authenticated user can raise a ticket
// Auto-assigns to appropriate level based on hierarchy
// ─────────────────────────────────────────────────────────────
exports.createTicket = catchAsync(async (req, res, next) => {
  const { subject, message, priority, refType, refId } = req.body;
  const userId = req.user?._id;
  const adminId = req.admin?._id;

  if (!userId || !adminId) {
    return next(new AppError('Authentication required', 401));
  }

  // Validate user exists and is active
  const raiser = await User.findOne({
    _id: userId,
    admin: adminId,
    isDeleted: false,
    isActive: true,
  }).select('_id name email role department');

  if (!raiser) {
    return next(new AppError('User not found or is inactive', 404));
  }

  // Determine initial assignee based on role hierarchy
  const assigneeId = await ticketService.determineInitialAssignee(userId, req.admin);

  // Create ticket
  const newTicket = await Ticket.create({
    admin: adminId,
    raisedBy: userId,
    assignedTo: assigneeId,
    subject: subject.trim(),
    message: message.trim(),
    priority: priority || 'NORMAL',
    refType: refType || null,
    refId: refId || null,
    status: 'OPEN',
  });

  // Populate references
  await newTicket.populate([
    { path: 'raisedBy', select: 'name email role' },
    { path: 'assignedTo', select: 'name email role' },
  ]);

  // Create audit log
  await AuditLog.create({
    admin: adminId,
    performedBy: userId,
    performerType: 'USER',
    action: 'TICKET_CREATED',
    targetModel: 'Ticket',
    targetId: newTicket._id,
    after: {
      subject,
      priority,
      assignedTo: assigneeId,
    },
  });

  // Send notification to assignee
  if (assigneeId) {
    try {
      await notificationService.createNotification({
        admin: adminId,
        recipient: assigneeId,
        type: 'TICKET_CREATED',
        title: 'New Support Ticket',
        body: `${raiser.name} raised ticket: "${subject}"`,
        refType: 'Ticket',
        refId: newTicket._id,
        priority: priority || 'NORMAL',
      });

      // Send push notification if user has FCM token
      const assignee = await User.findById(assigneeId).select('fcmToken');
      if (assignee?.fcmToken) {
        await notificationService.sendPushNotification(
          assignee.fcmToken,
          'New Support Ticket Assigned',
          `${raiser.name}: "${subject}"`
        );
      }
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  }

  res.status(201).json(
    new ApiResponse(
      201,
      { ticket: newTicket },
      'Support ticket created successfully'
    )
  );
});

// ─────────────────────────────────────────────────────────────
// GET: Fetch All Tickets (With Filtering & Pagination)
// User sees tickets assigned to them or raised by them
// Admin/Manager sees all tickets in organization
// ─────────────────────────────────────────────────────────────
exports.getAllTickets = catchAsync(async (req, res, next) => {
  const { status, priority, assignedTo, sortBy, page = 1, limit = 20, showEscalated } = req.query;
  const userId = req.user?._id;
  const adminId = req.admin?._id;

  if (!adminId) {
    return next(new AppError('Authentication required', 401));
  }

  const user = await User.findById(userId).select('role');

  // Build filter
  const filter = { admin: adminId, isDeleted: false };

  // Non-admin users see only their tickets (assigned or raised)
  if (user?.role && !['ADMIN'].includes(user.role)) {
    filter.$or = [
      { assignedTo: userId },
      { raisedBy: userId },
    ];
  }

  // Apply status filter
  if (status) {
    filter.status = status;
  }

  // Apply priority filter
  if (priority) {
    filter.priority = priority;
  }

  // Apply assignee filter (admin only)
  if (assignedTo && ['ADMIN'].includes(user?.role)) {
    filter.assignedTo = new mongoose.Types.ObjectId(assignedTo);
  }

  // Show escalated only
  if (showEscalated === 'true') {
    filter.isEscalated = true;
  }

  // Sort options
  let sortObj = { createdAt: -1 };
  if (sortBy === 'priority') {
    const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
    sortObj = { priority: 1, createdAt: -1 };
  } else if (sortBy === 'escalatedAt') {
    sortObj = { escalatedAt: -1, createdAt: -1 };
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Fetch tickets with pagination
  const tickets = await Ticket.find(filter)
    .populate('raisedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .populate('resolvedBy', 'name email')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  // Get total count for pagination
  const total = await Ticket.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        tickets,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      'Tickets fetched successfully'
    )
  );
});

// ─────────────────────────────────────────────────────────────
// GET: Fetch Single Ticket by ID
// User can only view if assigned to them or they raised it
// Admin can view any ticket
// ─────────────────────────────────────────────────────────────
exports.getTicketById = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const userId = req.user?._id;
  const adminId = req.admin?._id;

  if (!adminId) {
    return next(new AppError('Authentication required', 401));
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return next(new AppError('Invalid ticket ID format', 400));
  }

  const ticket = await Ticket.findOne({
    _id: ticketId,
    admin: adminId,
    isDeleted: false,
  })
    .populate('raisedBy', 'name email role department')
    .populate('assignedTo', 'name email role department')
    .populate('resolvedBy', 'name email')
    .populate('replies.user', 'name email role');

  if (!ticket) {
    return next(new AppError('Ticket not found', 404));
  }

  // Authorization: User can only view their own tickets (unless admin)
  const user = await User.findById(userId).select('role');
  if (!['ADMIN'].includes(user?.role)) {
    if (!ticket.raisedBy._id.equals(userId) && !ticket.assignedTo?._id.equals(userId)) {
      return next(new AppError('You do not have permission to view this ticket', 403));
    }
  }

  res.status(200).json(
    new ApiResponse(200, { ticket }, 'Ticket fetched successfully')
  );
});

// ─────────────────────────────────────────────────────────────
// POST: Add Reply to Ticket
// Team members add comments/updates
// ─────────────────────────────────────────────────────────────
exports.addReply = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { message } = req.body;
  const userId = req.user?._id;
  const adminId = req.admin?._id;

  if (!adminId || !userId) {
    return next(new AppError('Authentication required', 401));
  }

  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return next(new AppError('Invalid ticket ID format', 400));
  }

  const ticket = await Ticket.findOne({
    _id: ticketId,
    admin: adminId,
    isDeleted: false,
  });

  if (!ticket) {
    return next(new AppError('Ticket not found', 404));
  }

  // Authorization: Only assignee, raiser, or admin can reply
  const user = await User.findById(userId).select('role');
  if (!['ADMIN'].includes(user?.role)) {
    if (!ticket.raisedBy.equals(userId) && !ticket.assignedTo?.equals(userId)) {
      return next(new AppError('You cannot reply to this ticket', 403));
    }
  }

  // Add reply
  const updatedTicket = await ticketService.addReplyToTicket(ticket, message, user);

  // Create audit log
  await AuditLog.create({
    admin: adminId,
    performedBy: userId,
    performerType: 'USER',
    action: 'TICKET_UPDATED',
    targetModel: 'Ticket',
    targetId: ticketId,
    changes: { replyAdded: true },
  });

  // Notify other parties
  const otherParties = new Set();
  if (!ticket.raisedBy.equals(userId)) otherParties.add(ticket.raisedBy._id);
  if (ticket.assignedTo && !ticket.assignedTo.equals(userId)) otherParties.add(ticket.assignedTo._id);

  for (const partyId of otherParties) {
    try {
      await notificationService.createNotification({
        admin: adminId,
        recipient: partyId,
        type: 'TICKET_UPDATED',
        title: 'Ticket Update',
        body: `${user.name} replied to ticket: "${ticket.subject}"`,
        refType: 'Ticket',
        refId: ticketId,
      });
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  }

  await updatedTicket.populate([
    { path: 'raisedBy', select: 'name email' },
    { path: 'assignedTo', select: 'name email' },
  ]);

  res.status(200).json(
    new ApiResponse(200, { ticket: updatedTicket }, 'Reply added successfully')
  );
});

// ─────────────────────────────────────────────────────────────
// POST: Escalate Ticket
// Move ticket to next level in hierarchy
// Can only be done by current assignee or admin
// ─────────────────────────────────────────────────────────────
exports.escalateTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { escalationReason } = req.body;
  const userId = req.user?._id;
  const adminId = req.admin?._id;

  if (!adminId || !userId) {
    return next(new AppError('Authentication required', 401));
  }

  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return next(new AppError('Invalid ticket ID format', 400));
  }

  const ticket = await Ticket.findOne({
    _id: ticketId,
    admin: adminId,
    isDeleted: false,
  });

  if (!ticket) {
    return next(new AppError('Ticket not found', 404));
  }

  // Authorization: Only assignee or admin can escalate
  const user = await User.findById(userId).select('role');
  if (!['ADMIN'].includes(user?.role) && !ticket.assignedTo?.equals(userId)) {
    return next(new AppError('Only the assignee or admin can escalate this ticket', 403));
  }

  try {
    const { ticket: updatedTicket, nextAssignee } = await ticketService.escalateTicket(
      ticket,
      user,
      req.admin
    );

    // Add escalation note
    if (escalationReason) {
      await ticketService.addReplyToTicket(
        updatedTicket,
        `ESCALATION: ${escalationReason}`,
        user
      );
    }

    // Notify next assignee
    if (nextAssignee) {
      try {
        await notificationService.createNotification({
          admin: adminId,
          recipient: nextAssignee._id,
          type: 'TICKET_ESCALATED',
          title: 'Ticket Escalated',
          body: `Ticket escalated: "${updatedTicket.subject}"`,
          refType: 'Ticket',
          refId: ticketId,
          priority: updatedTicket.priority,
        });

        const assigneeUser = await User.findById(nextAssignee._id).select('fcmToken');
        if (assigneeUser?.fcmToken) {
          await notificationService.sendPushNotification(
            assigneeUser.fcmToken,
            'Ticket Escalated',
            updatedTicket.subject
          );
        }
      } catch (err) {
        console.error('Error sending escalation notification:', err);
      }
    }

    await updatedTicket.populate([
      { path: 'raisedBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        { ticket: updatedTicket, escalatedTo: nextAssignee },
        'Ticket escalated successfully'
      )
    );
  } catch (error) {
    return next(new AppError(error.message || 'Cannot escalate ticket further', 400));
  }
});

// ─────────────────────────────────────────────────────────────
// POST: Resolve Ticket
// Mark ticket as resolved
// Only assignee or admin can resolve
// ─────────────────────────────────────────────────────────────
exports.resolveTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { resolutionMessage } = req.body;
  const userId = req.user?._id;
  const adminId = req.admin?._id;

  if (!adminId || !userId) {
    return next(new AppError('Authentication required', 401));
  }

  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return next(new AppError('Invalid ticket ID format', 400));
  }

  const ticket = await Ticket.findOne({
    _id: ticketId,
    admin: adminId,
    isDeleted: false,
  });

  if (!ticket) {
    return next(new AppError('Ticket not found', 404));
  }

  // Authorization: Only assignee or admin can resolve
  const user = await User.findById(userId).select('role name');
  if (!['ADMIN'].includes(user?.role) && !ticket.assignedTo?.equals(userId)) {
    return next(new AppError('Only the assignee or admin can resolve this ticket', 403));
  }

  // Resolve ticket
  const resolvedTicket = await ticketService.resolveTicket(
    ticket,
    resolutionMessage,
    user,
    req.admin
  );

  // Notify raiser
  try {
    await notificationService.createNotification({
      admin: adminId,
      recipient: resolvedTicket.raisedBy,
      type: 'TICKET_RESOLVED',
      title: 'Ticket Resolved',
      body: `Your ticket "${resolvedTicket.subject}" has been resolved`,
      refType: 'Ticket',
      refId: ticketId,
    });
  } catch (err) {
    console.error('Error sending resolution notification:', err);
  }

  await resolvedTicket.populate([
    { path: 'raisedBy', select: 'name email' },
    { path: 'assignedTo', select: 'name email' },
    { path: 'resolvedBy', select: 'name email' },
  ]);

  res.status(200).json(
    new ApiResponse(200, { ticket: resolvedTicket }, 'Ticket resolved successfully')
  );
});

// ─────────────────────────────────────────────────────────────
// POST: Close Ticket
// Final closure after resolution
// Only admin or resolver can close
// ─────────────────────────────────────────────────────────────
exports.closeTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { closureNotes } = req.body;
  const userId = req.user?._id;
  const adminId = req.admin?._id;

  if (!adminId || !userId) {
    return next(new AppError('Authentication required', 401));
  }

  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return next(new AppError('Invalid ticket ID format', 400));
  }

  const ticket = await Ticket.findOne({
    _id: ticketId,
    admin: adminId,
    isDeleted: false,
  });

  if (!ticket) {
    return next(new AppError('Ticket not found', 404));
  }

  const user = await User.findById(userId).select('role name');

  try {
    const closedTicket = await ticketService.closeTicket(
      ticket,
      closureNotes,
      user,
      req.admin
    );

    // Notify raiser of closure
    try {
      await notificationService.createNotification({
        admin: adminId,
        recipient: closedTicket.raisedBy,
        type: 'TICKET_CLOSED',
        title: 'Ticket Closed',
        body: `Your ticket "${closedTicket.subject}" has been closed`,
        refType: 'Ticket',
        refId: ticketId,
      });
    } catch (err) {
      console.error('Error sending closure notification:', err);
    }

    await closedTicket.populate([
      { path: 'raisedBy', select: 'name email' },
      { path: 'resolvedBy', select: 'name email' },
    ]);

    res.status(200).json(
      new ApiResponse(200, { ticket: closedTicket }, 'Ticket closed successfully')
    );
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// ─────────────────────────────────────────────────────────────
// PUT: Reassign Ticket
// Manual reassignment (Admin/Manager only)
// ─────────────────────────────────────────────────────────────
exports.reassignTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { assignedTo, reason } = req.body;
  const userId = req.user?._id;
  const adminId = req.admin?._id;

  if (!adminId || !userId) {
    return next(new AppError('Authentication required', 401));
  }

  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return next(new AppError('Invalid ticket ID format', 400));
  }

  const ticket = await Ticket.findOne({
    _id: ticketId,
    admin: adminId,
    isDeleted: false,
  });

  if (!ticket) {
    return next(new AppError('Ticket not found', 404));
  }

  // Authorization: Only admin can reassign
  const user = await User.findById(userId).select('role');
  if (!['ADMIN'].includes(user?.role)) {
    return next(new AppError('Only admin can reassign tickets', 403));
  }

  try {
    const { ticket: updatedTicket, newAssignee } = await ticketService.reassignTicket(
      ticket,
      assignedTo,
      user,
      req.admin,
      reason
    );

    // Notify new assignee
    try {
      await notificationService.createNotification({
        admin: adminId,
        recipient: newAssignee._id,
        type: 'TICKET_CREATED',
        title: 'Ticket Assigned',
        body: `Ticket assigned to you: "${updatedTicket.subject}"`,
        refType: 'Ticket',
        refId: ticketId,
        priority: updatedTicket.priority,
      });
    } catch (err) {
      console.error('Error sending reassignment notification:', err);
    }

    await updatedTicket.populate([
      { path: 'raisedBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        { ticket: updatedTicket, assignedTo: newAssignee },
        'Ticket reassigned successfully'
      )
    );
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// ─────────────────────────────────────────────────────────────
// GET: Ticket Statistics
// Dashboard stats for admin/manager
// ─────────────────────────────────────────────────────────────
exports.getTicketStats = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;
  const adminId = req.admin?._id;

  if (!adminId) {
    return next(new AppError('Authentication required', 401));
  }

  const user = await User.findById(userId).select('role');

  // Get stats for the user or entire organization
  const stats = await ticketService.getTicketStats(
    req.admin,
    ['ADMIN'].includes(user?.role) ? null : userId
  );

  res.status(200).json(
    new ApiResponse(200, { stats }, 'Ticket statistics fetched successfully')
  );
});

// ─────────────────────────────────────────────────────────────
// GET: Get Assignee Options (For Manual Assignment)
// Returns list of users that can be assigned tickets
// ─────────────────────────────────────────────────────────────
exports.getAssigneeOptions = catchAsync(async (req, res, next) => {
  const adminId = req.admin?._id;

  if (!adminId) {
    return next(new AppError('Authentication required', 401));
  }

  // Get all active team leaders and managers
  const managerRoles = ['SALES_TL', 'SALES_MANAGER', 'MANAGEMENT_TL', 'MANAGEMENT_MANAGER', 'FINANCE_MANAGER'];
  const assignees = await ticketService.getAssigneesByRole(req.admin, managerRoles);

  res.status(200).json(
    new ApiResponse(200, { assignees }, 'Assignee options fetched successfully')
  );
});

module.exports = exports;
