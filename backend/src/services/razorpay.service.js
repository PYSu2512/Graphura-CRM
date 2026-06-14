"use strict";

const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { ApiConfig } = require('../models');
const { decrypt } = require('../utils/encrypt');

const loadRazorpayCredentials = async (adminId) => {
  const keys = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_MODE'];
  const configs = adminId ? await ApiConfig.find({ admin: adminId, key: { $in: keys } }) : [];
  const configMap = {};
  (configs || []).forEach((config) => {
    configMap[config.key] = config.isEncrypted ? decrypt(config.value) : config.value;
  });

  return {
    keyId: configMap.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
    keySecret: configMap.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '',
    mode: configMap.RAZORPAY_MODE || process.env.RAZORPAY_MODE || 'test',
  };
};

const createPaymentLink = async ({ adminId = null, amount, currency = 'INR', description = '', referenceId = null, customer = {}, callbackUrl = null }) => {
  // Attempt to get credentials (tenant-scoped first)
  try {
    const creds = await loadRazorpayCredentials(adminId);
    if (creds.keyId && creds.keySecret) {
      const payload = {
        amount: Math.max(1, Math.round(Number(amount || 0) * 100)),
        currency,
        description,
        reference_id: referenceId,
        customer: {
          name: customer?.name || 'Customer',
          email: customer?.email,
          contact: customer?.contact,
        },
        notify: { sms: !!customer?.contact, email: !!customer?.email },
        reminder_enable: true,
        callback_url: callbackUrl,
        callback_method: callbackUrl ? 'get' : undefined,
      };

      const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
      try {
        const response = await axios.post('https://api.razorpay.com/v1/payment_links', payload, {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        });

        return {
          ok: true,
          orderId: null,
          linkId: response.data.id,
          linkUrl: response.data.short_url || response.data.url,
          raw: response.data,
        };
      } catch (err) {
        // Extract useful error info when available
        let errMsg = err && err.message ? err.message : String(err);
        const respData = err && err.response && err.response.data ? err.response.data : null;
        if (respData) {
          try { errMsg = JSON.stringify(respData); } catch (e) {}
        }
        logger.warn('Razorpay payment link creation failed', errMsg);

        // If it's a duplicate reference_id error, try to find existing link by reference_id
        if (referenceId && respData && respData.description && /reference_id/i.test(String(respData.description))) {
          try {
            const listUrl = `https://api.razorpay.com/v1/payment_links?reference_id=${encodeURIComponent(referenceId)}`;
            const listResp = await axios.get(listUrl, {
              headers: { Authorization: `Basic ${auth}` },
              timeout: 10000,
            });
            // Razorpay returns object with items array or data array depending on API; try to normalize
            const items = listResp.data && (listResp.data.items || listResp.data) ? (listResp.data.items || listResp.data) : null;
            if (items && Array.isArray(items) && items.length > 0) {
              const found = items[0];
              return {
                ok: true,
                orderId: null,
                linkId: found.id,
                linkUrl: found.short_url || found.url,
                raw: found,
                note: 'found_existing_by_reference_id'
              };
            }
          } catch (findErr) {
            logger.warn('Failed to lookup existing payment link by reference_id', findErr && findErr.message ? findErr.message : String(findErr));
          }
        }

        return {
          ok: false,
          error: errMsg,
          orderId: null,
          linkId: null,
          linkUrl: null,
          raw: respData || null,
        };
      }
    }
  } catch (err) {
    const errMsg = err && err.message ? err.message : String(err);
    logger.warn('Razorpay payment link service error', errMsg);
    return {
      ok: false,
      error: errMsg,
      orderId: null,
      linkId: null,
      linkUrl: null,
      raw: null,
    };
  }

  // Fallback simulated link
  const fakeLinkId = `link_${Date.now()}`;
  const fakeLinkUrl = `https://razorpay.com/pay/${fakeLinkId}`;
  return { orderId: null, linkId: fakeLinkId, linkUrl: fakeLinkUrl, raw: null };
};

const generateReferenceToken = (prefix = 'pay') => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

module.exports = {
  createPaymentLink,
  loadRazorpayCredentials,
  // find existing link by reference id (paginated lookup)
  fetchPaymentLinkByReference: async (referenceId, adminId = null) => {
    const creds = await loadRazorpayCredentials(adminId);
    if (!creds.keyId || !creds.keySecret) return null;
    const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
    const perPage = 50;
    // Try first page and a few subsequent pages if needed
    for (let page = 1; page <= 5; page++) {
      try {
        const listUrl = `https://api.razorpay.com/v1/payment_links?reference_id=${encodeURIComponent(referenceId)}&count=${perPage}&page=${page}`;
        const listResp = await axios.get(listUrl, {
          headers: { Authorization: `Basic ${auth}` },
          timeout: 10000,
        });
        const items = listResp.data && (listResp.data.items || listResp.data) ? (listResp.data.items || listResp.data) : null;
        if (items && Array.isArray(items) && items.length > 0) {
          // Return the first matching item
          return items[0];
        }
        // if no items and total count indicates no more pages, break
        if (listResp.data && typeof listResp.data.total_count === 'number' && listResp.data.total_count <= page * perPage) break;
      } catch (err) {
        logger.warn('Error fetching payment links list', err && err.message ? err.message : String(err));
        break;
      }
    }
    return null;
  },
  generateReferenceToken,
};