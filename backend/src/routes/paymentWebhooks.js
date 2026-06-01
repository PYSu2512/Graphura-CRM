const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const controller = require('../controllers/paymentWebhook.controller');

// Debug middleware to log raw body capture
router.use((req, res, next) => {
  if (req.path === '/razorpay' && req.method === 'POST') {
    logger.info('Webhook request received', {
      path: req.path,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      hasBody: !!req.body,
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body),
    });
  }
  next();
});

// POST /api/payments/webhook/razorpay
router.post('/razorpay', controller.razorpay);

// POST /api/payments/webhook/test (debugging)
router.post('/test', controller.test);

// GET /api/payments/webhook/status (diagnostics)
router.get('/status', controller.status);

module.exports = router;
