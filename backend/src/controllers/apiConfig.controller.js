const { ApiConfig } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const { encrypt, decrypt } = require('../utils/encrypt');
const crypto = require('crypto');

const maskSecret = (secret) => {
  if (!secret) return '';
  const s = String(secret);
  if (s.length <= 4) return '••••••••';
  return '••••••••••••••••' + s.slice(-4);
};

exports.updateRazorpayConfig = catchAsync(async (req, res, next) => {
  const { mode, keyId, keySecret, webhookSecret, isActive, nickname } = req.body;
  if (!mode || !['test', 'live'].includes(mode)) {
    return next(new AppError('Invalid or missing mode', 400));
  }

  try {
    const isNewVersion = keySecret && !keySecret.includes('•');
    if (isNewVersion) {
      await ApiConfig.updateMany(
        { 
          admin: req.admin._id, 
          status: 'ACTIVE',
          $or: [
            { environment: mode },
            { key: { $regex: new RegExp('^RAZORPAY_' + mode.toUpperCase() + '_') } }
          ]
        },
        { status: 'REVOKED' }
      );
    }

    const prefix = 'RAZORPAY_' + mode.toUpperCase() + '_';
    const defaultNickname = nickname || (mode.charAt(0).toUpperCase() + mode.slice(1) + ' Key ' + new Date().toLocaleDateString());

    const configs = [
      { key: prefix + 'KEY_ID', value: keyId, description: 'Razorpay ' + mode + ' API Key ID' }
    ];

    if (keySecret && !keySecret.includes('•') && String(keySecret).trim() !== '') {
      configs.push({ key: prefix + 'KEY_SECRET', value: keySecret, description: 'Razorpay ' + mode + ' API Key Secret' });
    }

    if (webhookSecret && !webhookSecret.includes('•') && String(webhookSecret).trim() !== '') {
      configs.push({ key: prefix + 'WEBHOOK_SECRET', value: webhookSecret, description: 'Razorpay ' + mode + ' Webhook Secret' });
    }

    for (const config of configs) {
      if (isNewVersion) {
        await ApiConfig.create({
          admin: req.admin._id,
          key: config.key,
          value: encrypt(config.value),
          description: config.description,
          isEncrypted: true,
          updatedBy: req.admin._id,
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    res.status(200).json(new ApiResponse(200, null, 'Config updated'));
  } }catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getRazorpayConfig = catchAsync(async (req, res, next) => {
  if (!req.admin?._id) return next(new AppError('Admin context required', 403));

  const keys = [
    'RAZORPAY_TEST_KEY_ID', 'RAZORPAY_TEST_KEY_SECRET', 'RAZORPAY_TEST_WEBHOOK_SECRET',
    'RAZORPAY_LIVE_KEY_ID', 'RAZORPAY_LIVE_KEY_SECRET', 'RAZORPAY_LIVE_WEBHOOK_SECRET',
    'RAZORPAY_ACTIVE_MODE'
  ];

  let configs = await ApiConfig.find({ admin: req.admin._id, key: { $in: keys }, status: 'ACTIVE' });
  if (configs.length === 0) {
    configs = await ApiConfig.find({ admin: req.admin._id, key: { $in: keys } });
  }

  const configMap = {};
  configs.forEach(c => {
    configMap[c.key] = decrypt(c.value);
  });

  const responseData = {
    activeMode: configMap['RAZORPAY_ACTIVE_MODE'] || 'test',
    test: {
      keyId: configMap['RAZORPAY_TEST_KEY_ID'] || '',
      keySecret: maskSecret(configMap['RAZORPAY_TEST_KEY_SECRET']),
      webhookSecret: maskSecret(configMap['RAZORPAY_TEST_WEBHOOK_SECRET'])
    },
    live: {
      keyId: configMap['RAZORPAY_LIVE_KEY_ID'] || '',
      keySecret: maskSecret(configMap['RAZORPAY_LIVE_KEY_SECRET']),
      webhookSecret: maskSecret(configMap['RAZORPAY_LIVE_WEBHOOK_SECRET'])
    }
  };

  res.status(200).json(new ApiResponse(200, responseData, 'Config retrieved'));
});

exports.getRazorpayHistory = catchAsync(async (req, res, next) => {
  if (!req.admin?._id) return next(new AppError('Admin context required', 403));

  const configs = await ApiConfig.find({
    admin: req.admin._id,
    environment: { $in: ['test', 'live'] },
    key: { $regex: /KEY_ID$/ }
  }).sort({ createdAt: -1 });

  let finalConfigs = configs;
  if (configs.length === 0) {
    finalConfigs = await ApiConfig.find({
      admin: req.admin._id,
      environment: { $in: ['test', 'live'] }
    }).sort({ createdAt: -1 });
  }

  const history = finalConfigs.map(c => ({
    id: c._id,
    name: c.nickname || (c.environment.toUpperCase() + ' Key'),
    keyId: c.key.includes('KEY_ID') ? decrypt(c.value) : '•••••••• (Secret Only)',
    environment: c.environment.toUpperCase(),
    createdOn: c.createdAt.toISOString().split('T')[0],
    status: c.status
  }));

  res.status(200).json(new ApiResponse(200, history, 'History retrieved'));
});

exports.generateRazorpaySecret = catchAsync(async (req, res, next) => {
  if (!req.admin?._id) return next(new AppError('Admin context required', 403));
  const { AuditLog } = require('../models');
  const secret = crypto.randomBytes(32).toString('hex');

  const doc = await ApiConfig.findOneAndUpdate(
    { admin: req.admin._id, key: 'RAZORPAY_WEBHOOK_SECRET', status: 'ACTIVE' },
    {
      admin: req.admin._id,
      value: encrypt(secret),
      description: 'Razorpay Webhook Secret',
      status: 'ACTIVE',
      environment: 'none',
      isEncrypted: true,
      updatedBy: req.user?._id
    },
    { upsert: true, new: true }
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
  }

  // Return plaintext secret once — admin must copy it now
  res.status(200).json(new ApiResponse(200, { secret }, 'Webhook secret generated — copy it now'));
});