const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentSuccess.controller');

// Razorpay redirects here after payment (no auth required, query params only)
router.get('/razorpay-success', controller.razorpaySuccess);

// Frontend can call this to check payment status (no auth required for public endpoints)
router.get('/status/:prospectId', controller.checkPaymentStatus);

module.exports = router;
