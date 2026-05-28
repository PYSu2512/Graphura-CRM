const { ApiConfig } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const { encrypt, decrypt } = require('../utils/encrypt');

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
      { key: 'RAZORPAY_WEBHOOK_SECRET', value: webhookSecret || '', description: 'Razorpay Webhook Secret' },
      { key: 'RAZORPAY_MODE', value: mode, description: 'Razorpay Operation Mode (test/live)' }
    ];

    for (const config of configs) {
      await ApiConfig.findOneAndUpdate(
        { admin: req.admin._id, key: config.key },
        { 
          admin: req.admin._id,
          value: encrypt(config.value),
          description: config.description,
          isEncrypted: true,
          updatedBy: req.user?._id
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
  const keys = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET', 'RAZORPAY_MODE'];
  const configs = await ApiConfig.find({ key: { $in: keys } });
  
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
