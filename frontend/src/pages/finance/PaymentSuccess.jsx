import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  const prospectId = searchParams.get('prospectId');
  const razorpayPaymentId = searchParams.get('razorpay_payment_id');
  const razorpayOrderId = searchParams.get('razorpay_order_id');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Query backend to check payment status
        if (!prospectId) {
          setStatus('failed');
          setError('Invalid payment reference. Missing prospectId.');
          return;
        }

        const response = await apiClient.get(`/api/payments/status/${prospectId}`);
        const paymentData = response?.data?.data?.payment;

        if (paymentData?.status === 'SUCCESS') {
          setStatus('success');
          setPayment(paymentData);
          toast.success('Payment received successfully!');
          // Auto-redirect to finance dashboard after 3 seconds
          setTimeout(() => {
            navigate('/finance/payments');
          }, 3000);
        } else if (paymentData?.status === 'FAILED' || paymentData?.status === 'CANCELLED') {
          setStatus('failed');
          setError('Payment was cancelled or failed. Please try again.');
          setPayment(paymentData);
        } else {
          // Payment pending/processing
          setStatus('success');
          setPayment(paymentData);
          toast.success('Payment received! Please wait while we confirm your transaction.');
          // Still redirect after 3 seconds
          setTimeout(() => {
            navigate('/finance/payments');
          }, 3000);
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setStatus('failed');
        setError(err?.response?.data?.message || err.message || 'Failed to check payment status');
        setPayment(null);
      }
    };

    checkPaymentStatus();
  }, [prospectId, navigate]);

  const handleReturnToDashboard = () => {
    navigate('/finance/payments');
  };

  const handleRetryPayment = () => {
    if (prospectId) {
      navigate(`/finance/payments?prospectId=${prospectId}`);
    } else {
      navigate('/finance/payments');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        {status === 'loading' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Processing Payment</h1>
            <p className="text-gray-600">Please wait while we confirm your transaction...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
            <p className="text-gray-600">Your payment has been received successfully.</p>
            
            {payment && (
              <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-800">₹{Number(payment.amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">{payment.status || 'CONFIRMED'}</span>
                </div>
                {payment.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-xs text-gray-800 truncate">{payment.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-gray-500 text-sm">Redirecting to dashboard in 3 seconds...</p>
            
            <button
              onClick={handleReturnToDashboard}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600">Payment Failed</h1>
            <p className="text-gray-600">{error}</p>
            
            <div className="space-y-2">
              <button
                onClick={handleRetryPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleReturnToDashboard}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 mt-6">
          Need help? Contact support@graphura.com
        </div>
      </div>
    </div>
  );
}
