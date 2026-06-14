const { ApiConfig } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const { encrypt, decrypt } = require('../utils/encrypt');
const crypto = require('crypto');

console.log('API Config Controller Loaded');

/**
 * Update Razorpay Configuration
...
 */
exports.updateRazorpayConfig = catchAsync(async (req, res, next) => {
  console.log('Update Razorpay Config Request:', req.body);
  const { keyId, keySecret, webhookSecret, mode } = req.body;

  if (!keyId || !keySecret || !mode) {
    console.log('Missing required fields');
    return next(new AppError('Please provide keyId, keySecret and mode', 400));
  }

  try {
    const configs = [
      { key: 'RAZORPAY_KEY_ID', value: keyId, description: 'Razorpay API Key ID' },
      { key: 'RAZORPAY_KEY_SECRET', value: keySecret, description: 'Razorpay API Key Secret' },
      { key: 'RAZORPAY_MODE', value: mode, description: 'Razorpay Operation Mode (test/live)' }
    ];

    // Only persist webhook secret when provided (avoid empty-value validation errors)
    if (webhookSecret && String(webhookSecret).trim() !== '') {
      // insert before mode
      configs.splice(2, 0, { key: 'RAZORPAY_WEBHOOK_SECRET', value: webhookSecret, description: 'Razorpay Webhook Secret' });
    }

    for (const config of configs) {
      await ApiConfig.findOneAndUpdate(
        { admin: req.admin._id, key: config.key },
        { 
          admin: req.admin._id,
          value: encrypt(config.value),
          description: config.description,
          isEncrypted: true,
          updatedBy: req.admin._id,
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    console.log('Razorpay configuration updated successfully');
    res.status(200).json(new ApiResponse(200, null, 'Razorpay configuration updated successfully'));
  } catch (error) {
    console.error('Error in updateRazorpayConfig:', error);
    return next(new AppError(error.message, 500));
  }
});

/**
 * Get Razorpay Configuration
 * GET /api/api-config/razorpay
 */
exports.getRazorpayConfig = catchAsync(async (req, res, next) => {
  if (!req.admin?._id) {
    return next(new AppError('Admin context is required to load API configuration', 403));
  }

  const keys = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET', 'RAZORPAY_MODE'];
  const configs = await ApiConfig.find({ admin: req.admin._id, key: { $in: keys } });
  
  const configMap = {};
  configs.forEach(c => {
    configMap[c.key] = decrypt(c.value);
  });

  const responseData = {
    keyId: configMap['RAZORPAY_KEY_ID'] || '',
    keySecret: configMap['RAZORPAY_KEY_SECRET'] || '',
    webhookSecret: configMap['RAZORPAY_WEBHOOK_SECRET'] || '',
    mode: configMap['RAZORPAY_MODE'] || 'test'
  };

  res.status(200).json(new ApiResponse(200, responseData, 'Razorpay configuration retrieved'));
});

/**
 * POST /api/api-config/razorpay/generate-secret
 * Generate a new webhook secret for the current admin (one-time reveal)
 */
exports.generateRazorpaySecret = catchAsync(async (req, res, next) => {
  if (!req.admin?._id) return next(new AppError('Admin context required', 403));
  const { ApiConfig, AuditLog } = require('../models');

  // Generate 32-byte hex secret
  const secret = crypto.randomBytes(32).toString('hex');

  // Persist encrypted
  const doc = await ApiConfig.findOneAndUpdate(
    { admin: req.admin._id, key: 'RAZORPAY_WEBHOOK_SECRET' },
    {
      admin: req.admin._id,
      value: encrypt(secret),
      description: 'Razorpay Webhook Secret',
      isEncrypted: true,
      updatedBy: req.user?._id
    },
    { upsert: true, new: true, runValidators: true }
  );

  try {
    await AuditLog.create({
      admin: req.admin._id,
      performedBy: req.admin._id,
      performerType: 'ADMIN',
      action: 'ADMIN_UPDATED',
      targetModel: 'ApiConfig',
      targetId: doc._id,
      note: 'Generated new Razorpay webhook secret via admin UI'
    });
  } catch (err) {
    // audit failure shouldn't block the response
    console.warn('Failed to write audit log for webhook secret generation', err.message || err);
  }

  // Return plaintext secret once — admin must copy it now
  res.status(200).json(new ApiResponse(200, { secret }, 'Webhook secret generated — copy it now'));
});
