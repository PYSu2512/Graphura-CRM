const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');

/**
 * Payment Success Handler
 * Called by Razorpay after a successful payment
 * Updates Payment and Prospect status via webhook or direct lookup
 */

exports.razorpaySuccess = catchAsync(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, reference_id } = req.query || {};
  const { Payment, ProspectForm } = require('../models');

  // Try to find the payment by reference_id or payment ID
  let payment = null;
  if (reference_id) {
    const prospect = await ProspectForm.findOne({ _id: reference_id.replace('PROSPECT-', '') });
    if (prospect) {
      payment = await Payment.findOne({ prospectForm: prospect._id }).sort({ createdAt: -1 });
    }
  }
  if (!payment && razorpay_payment_id) {
    payment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
  }

  if (!payment) {
    return res.status(404).render('payment-result', {
      success: false,
      message: 'Payment record not found',
      paymentId: razorpay_payment_id,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@graphura.com',
    });
  }

  // Return success page (payment may already be verified via webhook)
  return res.status(200).render('payment-result', {
    success: payment.status === 'SUCCESS',
    message: payment.status === 'SUCCESS'
      ? 'Payment received successfully! Your invoice has been updated.'
      : 'Payment received. Please wait while we confirm the transaction.',
    paymentId: payment.razorpayPaymentId || razorpay_payment_id,
    amount: `₹${Number(payment.amount || 0).toLocaleString('en-IN')}`,
    supportEmail: process.env.SUPPORT_EMAIL || 'support@graphura.com',
  });
});

/**
 * API endpoint to check payment status
 * GET /api/payments/status/:prospectId
 * Used by frontend to poll for payment updates
 */
exports.checkPaymentStatus = catchAsync(async (req, res, next) => {
  const { prospectId } = req.params;
  const { ProspectForm, Payment } = require('../models');

  const prospect = await ProspectForm.findById(prospectId).lean();
  if (!prospect) return next(new AppError('Prospect not found', 404));

  const payment = await Payment.findOne({ prospectForm: prospectId }).sort({ createdAt: -1 }).lean();
  if (!payment) {
    return res.status(200).json(new ApiResponse(200, { status: 'PENDING', payment: null }, 'No payment found'));
  }

  return res.status(200).json(new ApiResponse(200, {
    status: payment.status || 'PENDING',
    payment: {
      id: payment._id,
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paidAt,
      razorpayPaymentId: payment.razorpayPaymentId,
      webhookVerified: payment.webhookVerified,
    }
  }, 'Payment status retrieved'));
});
