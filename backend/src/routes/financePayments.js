const express = require('express');
const router = express.Router();
const controller = require('../controllers/financePayment.controller');
const { requireUser } = require('../middleware/auth');

// Base: /api/finance/payments
router.get('/', requireUser, controller.listPayments);
router.get('/search-prospect', requireUser, controller.searchProspectByEmail);
router.post('/offline-payment', requireUser, controller.processOfflinePayment);
router.post('/:prospectId/send-razorpay-link', requireUser, controller.sendRazorpayLink);
router.get('/:prospectId/fetch-razorpay-link', requireUser, controller.fetchExistingRazorpayLink);
router.post('/:prospectId/recreate-link', requireUser, controller.recreatePaymentLink);
router.put('/:prospectId/verify', requireUser, controller.verifyPayment);
router.put('/:prospectId/failed', requireUser, controller.markFailed);
module.exports = router;
