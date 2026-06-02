const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/workOrder.controller');
const { requireUser } = require('../middleware/auth');

// Base: /api/finance/work-orders  (Finance Manager)
router.get('/',                    requireUser, ctrl.listWorkOrders);
router.post('/backfill',           requireUser, ctrl.backfillWorkOrders);  // fix historical data
router.post('/',                   requireUser, ctrl.createWorkOrder);
router.get('/:id',                 requireUser, ctrl.getWorkOrder);
router.put('/:id',                 requireUser, ctrl.updateWorkOrder);
router.delete('/:id',              requireUser, ctrl.deleteWorkOrder);
router.post('/:id/approve',        requireUser, ctrl.approveWorkOrder);
router.post('/:id/reject',         requireUser, ctrl.rejectWorkOrder);
router.post('/:id/send-email',     requireUser, ctrl.sendWorkOrderEmail);

module.exports = router;
