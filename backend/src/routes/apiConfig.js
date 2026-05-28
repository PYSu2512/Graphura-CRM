const express = require('express');
const apiConfigController = require('../controllers/apiConfig.controller');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require Admin privileges
router.use(requireAdmin);

router.get('/razorpay', apiConfigController.getRazorpayConfig);
router.post('/razorpay', apiConfigController.updateRazorpayConfig);

module.exports = router;
