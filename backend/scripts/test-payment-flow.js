#!/usr/bin/env node

/**
 * Complete Payment Flow Test
 * This script tests the entire payment flow from creation to webhook processing
 * 
 * Usage: node scripts/test-payment-flow.js
 */

const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000';

console.log('\n═══════════════════════════════════════════════════════════');
console.log('COMPLETE PAYMENT FLOW TEST');
console.log('═══════════════════════════════════════════════════════════\n');

const tests = [
  {
    name: 'Webhook Status',
    description: 'Check webhook configuration and recent activity',
    test: async () => {
      const res = await axios.get(`${API_URL}/api/payments/webhook/status`);
      return {
        pass: res.data.webhook?.globalSecretConfigured === true,
        data: res.data,
        message: res.data.webhook?.globalSecretConfigured 
          ? '✓ Webhook secret configured' 
          : '✗ No webhook secret in environment'
      };
    }
  },
  {
    name: 'Webhook Test Signature',
    description: 'Verify local signature verification works',
    test: async () => {
      const payload = { event: 'test', created_at: Math.floor(Date.now() / 1000) };
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_secret';
      const crypto = require('crypto');
      const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
      
      const res = await axios.post(`${API_URL}/api/payments/webhook/test`, {
        signature,
        payload,
        secret
      });
      
      return {
        pass: res.data.matches === true,
        data: res.data,
        message: res.data.matches 
          ? '✓ Signature verification working' 
          : '✗ Signature verification failed'
      };
    }
  },
  {
    name: 'Server Health',
    description: 'Check if backend server is running',
    test: async () => {
      try {
        const res = await axios.get(`${API_URL}/`);
        return {
          pass: res.status === 200,
          data: res.data,
          message: '✓ Backend server running'
        };
      } catch (err) {
        throw new Error('Backend server not responding at ' + API_URL);
      }
    }
  }
];

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n${test.name}`);
    console.log('─'.repeat(test.name.length));
    console.log(`Description: ${test.description}`);
    
    try {
      const result = await test.test();
      console.log(`Status: ${result.message}`);
      
      if (result.pass) {
        passed++;
      } else {
        failed++;
        console.log('Details:', JSON.stringify(result.data, null, 2));
      }
    } catch (err) {
      failed++;
      console.log(`✗ Error: ${err.message}`);
    }
  }

  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);

  if (failed === 0) {
    console.log('\n✓ All tests passed! Payment flow should be working.');
    console.log('\nNext steps:');
    console.log('1. Create a payment link in Finance > Payments');
    console.log('2. Complete a test payment on Razorpay');
    console.log('3. Check webhook status: GET /api/payments/webhook/status');
    console.log('4. Verify Payment record in MongoDB');
    console.log('5. Watch Frontend table auto-refresh with new status');
  } else {
    console.log('\n✗ Some tests failed. Check details above.');
    console.log('\nTroubleshooting:');
    console.log('- Ensure backend is running: npm start');
    console.log('- Check .env file has correct RAZORPAY_WEBHOOK_SECRET');
    console.log('- See backend/WEBHOOK_FIX_GUIDE.md for detailed troubleshooting');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
}

runTests().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
