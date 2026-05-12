'use strict';

const { Lead, LeadAssignmentHistory, Team } = require('../models');
const bulkLeadUploadService = require('../services/bulkLeadUpload.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/sales-team-leader/workspace
 * Returns all data required for the Sales TL Dashboard in one request.
 */
exports.getWorkspace = catchAsync(async (req, res) => {
  const adminId = req.admin._id;
  const userId = req.user._id;

  // 1. Resolve the TL's Team (Gracefully handle if none exists)
  const team = await Team.findOne({ admin: adminId, leader: userId, isDeleted: false });
  const memberIds = team ? team.members.map(m => m.user).filter(Boolean) : [];

  // 2. Fetch Pool (Leads assigned directly to the TL OR assigned to their team but no specific member)
  const poolQuery = { 
    admin: adminId,
    $or: [
      { assignedTo: userId }
    ],
    isDeleted: { $ne: true },
    isDumped: { $ne: true }
  };

  // If the TL has a team, also include leads assigned to that team but not yet to a specific member
  if (team?._id) {
    poolQuery.$or.push({ team: team._id, assignedTo: null });
  }

  // 3. Fetch Assigned (Leads assigned to members of this team, excluding the TL themselves)
  // If no team, this will naturally be empty
  const assignedQuery = {
    admin: adminId,
    assignedTo: { $in: memberIds.filter(id => String(id) !== String(userId)) },
    isDeleted: { $ne: true },
    isDumped: { $ne: true }
  };

  // Only run assigned query if there are members
  const fetchAssigned = memberIds.length > 0 
    ? Lead.find(assignedQuery).populate({ path: 'client', select: 'name email mobile companyName' }).populate('assignedTo', 'name email role').populate('assignedBy', 'name').populate('team', 'name').sort({ updatedAt: -1 })
    : Promise.resolve([]);

  const [poolLeads, assignedLeads, targets] = await Promise.all([
    Lead.find(poolQuery).populate({ path: 'client', select: 'name email mobile companyName' }).populate('assignedBy', 'name').populate('team', 'name').sort({ createdAt: -1 }),
    fetchAssigned,
    bulkLeadUploadService.getAssignmentTargets(adminId, req.user, 'SALES_EXECUTIVE').catch(() => ({ targets: [] }))
  ]);

  // Shared history lookup
  const allLeadIds = [...poolLeads.map(l => l._id), ...assignedLeads.map(l => l._id)];
  const assignmentHistory = await LeadAssignmentHistory.find({
    admin: adminId,
    lead: { $in: allLeadIds },
  }).sort({ assignedAt: -1 }).lean();

  const latestAssignmentByLead = new Map();
  for (const entry of assignmentHistory) {
    const leadId = String(entry.lead);
    if (!latestAssignmentByLead.has(leadId)) {
      latestAssignmentByLead.set(leadId, entry);
    }
  }

  const mapLead = (l, isPool = false) => ({
    id: l._id,
    name: l.client?.name || '',
    email: l.client?.email || '',
    mobile: l.client?.mobile || '',
    companyName: l.client?.companyName || '',
    status: l.status,
    isDumped: Boolean(l.isDumped),
    dumpReason: l.dumpReason || null,
    createdAt: l.createdAt.toISOString().split('T')[0],
    assignedTo: isPool ? 'Unassigned' : (l.assignedTo?.name || 'Unassigned'),
    assignedBy: l.assignedBy?.name || 'Unassigned',
    isRedistributable: isPool,
    team: l.team?.name || (team ? team.name : 'No Team'),
    assignedAt: latestAssignmentByLead.get(String(l._id))?.assignedAt
      ? new Date(latestAssignmentByLead.get(String(l._id)).assignedAt).toISOString().split('T')[0]
      : l.updatedAt.toISOString().split('T')[0],
    assignmentReason: latestAssignmentByLead.get(String(l._id))?.reason || null,
  });

  res.status(200).json(new ApiResponse(200, {
    pool: poolLeads.map(l => mapLead(l, true)),
    assigned: assignedLeads.map(l => mapLead(l, false)),
    targets: targets.targets || []
  }, 'Workspace data retrieved successfully'));
});
