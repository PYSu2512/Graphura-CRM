/**
 * EMAIL SERVICE — Send OTPs and verification emails
 * Uses Brevo (Sendinblue) for production email delivery
 * Can fallback to nodemailer for development
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
const getSender = () => ({
  name: process.env.BREVO_SENDER_NAME || 'Graphura CRM',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@graphura.com',
});

/**
 * Send OTP Email via Brevo API
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} adminName - Admin's name for personalization
 */
const sendOTPEmail = async (email, otp, adminName = 'User') => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    // Using Brevo API v3
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Graphura CRM',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@graphura.com',
        },
        to: [
          {
            email,
            name: adminName,
          },
        ],
        subject: 'Your Graphura CRM Registration OTP',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Graphura CRM, ${adminName}!</h2>
            <p>Your OTP for email verification is:</p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="letter-spacing: 5px; color: #333; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #666;">This OTP is valid for 10 minutes only.</p>
            <p style="color: #999; font-size: 12px;">
              If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Graphura CRM | Create Bold. Edit Smart. Design Loud.
            </p>
          </div>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY.trim(),
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    logger.info(`OTP email sent successfully to ${email}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    logger.error('Failed to send OTP email', error.response?.data?.message || error.message);
    throw new Error('Unable to send OTP email. Please try again.');
  }
};

/**
 * Send Registration Confirmation Email
 * @param {string} email - Admin email
 * @param {string} adminName - Admin's name
 * @param {string} companyName - Company name
 */
const sendRegistrationConfirmationEmail = async (email, adminName, companyName) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Graphura CRM',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@graphura.com',
        },
        to: [
          {
            email,
            name: adminName,
          },
        ],
        subject: `${companyName} is now live on Graphura CRM!`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Graphura CRM!</h2>
            <p>Hi ${adminName},</p>
            <p>Your company account <strong>${companyName}</strong> has been successfully created and is now live on Graphura CRM.</p>
            
            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-top: 0;">Getting Started:</h3>
              <ul style="color: #1b5e20;">
                <li>Log in to your admin dashboard</li>
                <li>Create your team members and departments</li>
                <li>Start managing leads and projects</li>
                <li>Configure your subscription settings</li>
              </ul>
            </div>

            <p>
              <a href="${process.env.FRONTEND_URL}/login" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Go to Dashboard
              </a>
            </p>

            <p style="color: #666;">
              If you have any questions or need assistance, our support team is here to help.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Graphura CRM | Create Bold. Edit Smart. Design Loud.
            </p>
          </div>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`Registration confirmation email sent to ${email}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    logger.error('Failed to send confirmation email', error.message);
    // Don't throw here — registration is already complete
  }
};

/**
 * Send Password Reset Link Email
 * @param {string} email - User email
 * @param {string} token - Reset token
 * @param {string} name - User's name
 */
const sendPasswordResetEmail = async (email, token, name = 'User') => {
  try {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Graphura CRM',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@graphura.com',
        },
        to: [
          {
            email,
            name,
          },
        ],
        subject: 'Reset Your Graphura CRM Password',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the link below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666;">This link expires in 30 minutes.</p>
            <p style="color: #d32f2f;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Graphura CRM | Create Bold. Edit Smart. Design Loud.
            </p>
          </div>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`Password reset email sent to ${email}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    logger.error('Failed to send password reset email', error.message);
    // Silent fail per requirements to prevent enumeration
    return { success: false, error: 'Brevo API error' };
  }
};

/**
 * Send Password Reset Confirmation Email
 * @param {string} email - User email
 * @param {string} name - User's name
 */
const sendPasswordResetConfirmationEmail = async (email, name = 'User') => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Graphura CRM',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@graphura.com',
        },
        to: [
          {
            email,
            name,
          },
        ],
        subject: 'Your Password Has Been Reset Successfully',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Successful</h2>
            <p>Hi ${name},</p>
            <p>Your password for Graphura CRM has been successfully changed.</p>
            <p style="color: #666;">If you did not make this change, please contact your administrator immediately.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Login</a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Graphura CRM | Create Bold. Edit Smart. Design Loud.
            </p>
          </div>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    logger.info(`Password reset confirmation email sent to ${email}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    logger.error('Failed to send password reset confirmation email', error.message);
    return { success: false, error: 'Brevo API error' };
  }
};

/**
 * Send Prospect Quotation Email
 * @param {object} payload
 * @param {string} payload.email
 * @param {string} payload.clientName
 * @param {string} payload.companyName
 * @param {string} payload.serviceName
 * @param {Array<{title:string,cost:number,description?:string}>} payload.requirements
 * @param {number} payload.baseCost
 * @param {number} payload.discountAmount
 * @param {number} payload.finalAmount
 * @param {string} payload.paymentStatus
 * @param {string} payload.termsAndConditions
 * @param {string} [payload.pdfPath]
 * @param {string} [payload.pdfUrl]
 */
const sendProspectQuotationEmail = async (payload) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }
    if (!isValidEmail(payload.email)) {
      throw new Error('Client email is missing or invalid');
    }

    const requirementsRows = (payload.requirements || [])
      .map((item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${item.title || 'Requirement'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${Number(item.cost || 0).toLocaleString('en-IN')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${item.description || '—'}</td>
        </tr>`)
      .join('');

    const emailPayload = {
      sender: getSender(),
      to: [{ email: payload.email, name: payload.clientName || 'Client' }],
      subject: `${payload.companyName || payload.clientName || 'Your'} quotation from Graphura CRM`,
      htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;padding:24px;color:#1f2937;">
            <div style="background:#0f172a;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0;">
              <h2 style="margin:0;font-size:22px;">Quotation from Graphura CRM</h2>
              <p style="margin:8px 0 0;color:#cbd5e1;">Prepared for ${payload.clientName || 'your team'}</p>
            </div>
            <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 14px 14px;padding:24px;background:#fff;">
              <p style="margin:0 0 12px;">Hi ${payload.clientName || 'there'},</p>
              <p style="margin:0 0 20px;line-height:1.6;">We reviewed the requirements shared by our finance team and prepared the following scope for ${payload.companyName || 'your project'}.</p>

              <div style="margin:20px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;">
                <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;">
                  <div><strong>Service</strong><div>${payload.serviceName || 'Custom service package'}</div></div>
                  <div><strong>Payment Status</strong><div>${payload.paymentStatus || 'Unpaid'}</div></div>
                </div>
              </div>

              <table style="width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <thead>
                  <tr style="background:#1e293b;color:#fff;">
                    <th style="padding:12px;text-align:left;">Requirement</th>
                    <th style="padding:12px;text-align:right;">Cost</th>
                    <th style="padding:12px;text-align:left;">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${requirementsRows || '<tr><td colspan="3" style="padding:12px;">No detailed requirements were added.</td></tr>'}
                </tbody>
              </table>

              <div style="margin-top:18px;display:grid;gap:8px;">
                <div style="display:flex;justify-content:space-between;font-size:14px;color:#4b5563;"><span>Service Value</span><strong>₹${Number(payload.baseCost || 0).toLocaleString('en-IN')}</strong></div>
                <div style="display:flex;justify-content:space-between;font-size:14px;color:#4b5563;"><span>Discount</span><strong>- ₹${Number(payload.discountAmount || 0).toLocaleString('en-IN')}</strong></div>
                <div style="display:flex;justify-content:space-between;font-size:14px;color:#4b5563;padding-bottom:8px;border-bottom:1px dashed #e5e7eb;"><span>GST (18%)</span><strong>+ ₹${Math.round((Number(payload.baseCost || 0) - Number(payload.discountAmount || 0)) * 0.18).toLocaleString('en-IN')}</strong></div>
                <div style="display:flex;justify-content:space-between;padding-top:10px;font-size:16px;color:#0f172a;"><span>Final Project Value</span><strong>₹${Number(payload.finalAmount || 0).toLocaleString('en-IN')}</strong></div>
              </div>

              ${payload.termsAndConditions ? `<div style="margin-top:24px;padding:16px;border-left:4px solid #2563eb;background:#eff6ff;border-radius:8px;"><strong>Terms & Conditions</strong><div style="margin-top:8px;white-space:pre-line;line-height:1.6;">${payload.termsAndConditions}</div></div>` : ''}

              ${payload.pdfUrl ? `
              <div style="margin-top:20px; text-align: center;">
                <a href="${payload.pdfUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px; font-weight: bold;">
                  View Detailed Terms (PDF)
                </a>
              </div>` : ''}

              <p style="margin:24px 0 0;line-height:1.6;color:#475569;">Please review and reply if you would like any adjustments. Our team will coordinate the next step promptly.</p>
            </div>
          </div>
        `,
    };

    if (payload.pdfPath) {
      let urlParts = payload.pdfPath.split('/');
      let fileName = urlParts[urlParts.length - 1].split('?')[0];
      try {
        fileName = decodeURIComponent(fileName);
      } catch (e) {}

      fileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName += '.pdf';
      }

      if (payload.pdfPath.startsWith('http')) {
        emailPayload.attachment = [{ url: payload.pdfPath, name: fileName }];
        logger.info(`Sending email with direct URL attachment: ${fileName}`);
      } else if (fs.existsSync(payload.pdfPath)) {
        const b64 = fs.readFileSync(payload.pdfPath).toString('base64');
        emailPayload.attachment = [{ content: b64, name: fileName }];
        logger.info(`Sending email with local base64 attachment: ${fileName}`);
      }
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      emailPayload,
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY.trim(),
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const messageId = response.data.messageId || response.data.id || null;
    logger.info(`Prospect quotation email sent to ${payload.email} (${messageId || 'no message id'})`);
    return { success: true, messageId };
  } catch (error) {
    const details = error.response?.data?.message || error.response?.data || error.message;
    logger.error('Failed to send prospect quotation email', details);
    throw new Error(typeof details === 'string' ? details : 'Unable to send prospect quotation email. Please try again.');
  }
};

/**
 * Send Razorpay Payment Link Email
 * @param {object} payload
 * @param {string} payload.email
 * @param {string} payload.clientName
 * @param {string} payload.companyName
 * @param {string} payload.linkUrl
 * @param {number} payload.amount
 * @param {string} payload.referenceId
 */
const sendRazorpayLinkEmail = async (payload) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }
    if (!isValidEmail(payload.email)) {
      throw new Error('Client email is missing or invalid');
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: getSender(),
        to: [{ email: payload.email, name: payload.clientName || 'Client' }],
        subject: `Payment link for ${payload.companyName || payload.clientName || 'your project'}`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#1f2937;">
            <div style="background:#0f172a;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0;">
              <h2 style="margin:0;font-size:22px;">Your payment link is ready</h2>
              <p style="margin:8px 0 0;color:#cbd5e1;">Reference: ${payload.referenceId || 'N/A'}</p>
            </div>
            <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 14px 14px;padding:24px;background:#fff;">
              <p style="margin:0 0 12px;">Hi ${payload.clientName || 'there'},</p>
              <p style="margin:0 0 16px;line-height:1.6;">Please use the secure Razorpay link below to complete the payment for ${payload.companyName || 'your project'}.</p>
              <div style="margin:24px 0;text-align:center;">
                <a href="${payload.linkUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-block;">Pay ${Number(payload.amount || 0).toLocaleString('en-IN')}</a>
              </div>
              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">If the button doesn't work, copy this link: ${payload.linkUrl}</p>
            </div>
          </div>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY.trim(),
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const messageId = response.data.messageId || response.data.id || null;
    logger.info(`Razorpay link email sent to ${payload.email} (${messageId || 'no message id'})`);
    return { success: true, messageId };
  } catch (error) {
    const details = error.response?.data?.message || error.response?.data || error.message;
    logger.error('Failed to send Razorpay link email', details);
    throw new Error(typeof details === 'string' ? details : 'Unable to send Razorpay payment link email. Please try again.');
  }
};

/**
 * Send Invoice Email with inline HTML invoice
 */
const sendInvoiceEmail = async (payload) => {
  try {
    if (!process.env.BREVO_API_KEY) throw new Error('BREVO_API_KEY is not configured');
    if (!isValidEmail(payload.email)) throw new Error('Client email is missing or invalid');

    const {
      email, clientName, companyName, invoiceNumber, invoiceDate, dueDate,
      amount, gstPercent, gstAmount, discount, totalAmount, lineItems = [],
      notes, status, senderName, senderEmail, senderPhone, senderAddress,
    } = payload;

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const fmtAmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
    const subtotal = (amount || 0) - (gstAmount || 0);

    const itemRows = lineItems.map((item, i) => `
      <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${item.name || 'Service'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.qty || 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmtAmt(item.price)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmtAmt(item.amount)}</td>
      </tr>`).join('');

    const statusColor = status === 'PAID' ? '#065f46' : status === 'SENT' ? '#1e40af' : '#92400e';
    const statusBg = status === 'PAID' ? '#d1fae5' : status === 'SENT' ? '#dbeafe' : '#fef3c7';

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Invoice ${invoiceNumber}</title></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;"><div style="max-width:680px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><div style="background:#1e293b;padding:28px 32px;color:#fff;"><h1 style="margin:0;font-size:22px;font-weight:900;">${senderName || 'Graphura CRM'}</h1><p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">${senderAddress || ''}</p><p style="margin:0;font-size:18px;font-weight:900;">TAX INVOICE</p><p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">${invoiceNumber}</p><p style="margin:4px 0 0;color:#94a3b8;font-size:12px;">Date: ${fmtDate(invoiceDate)}</p><span style="display:inline-block;margin-top:8px;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;background:${statusBg};color:${statusColor};">${status}</span></div><div style="padding:24px 32px 0;"><p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Bill To</p><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;"><p style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">${clientName || 'Client'}</p>${companyName ? `<p style="margin:4px 0 0;font-size:13px;color:#475569;">${companyName}</p>` : ''}<p style="margin:4px 0 0;font-size:13px;color:#475569;">${email}</p></div></div><div style="padding:24px 32px 0;"><table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;"><thead><tr style="background:#1e293b;color:#fff;"><th style="padding:10px 12px;text-align:left;font-size:12px;">Description</th><th style="padding:10px 12px;text-align:center;font-size:12px;">Qty</th><th style="padding:10px 12px;text-align:right;font-size:12px;">Rate</th><th style="padding:10px 12px;text-align:right;font-size:12px;">Amount</th></tr></thead><tbody>${itemRows || '<tr><td colspan="4" style="padding:12px;color:#64748b;">Professional Services</td></tr>'}</tbody></table></div><div style="padding:20px 32px 0;"><table style="width:260px;margin-left:auto;border-collapse:collapse;"><tr><td style="padding:6px 12px;font-size:13px;color:#475569;">Subtotal</td><td style="padding:6px 12px;font-size:13px;text-align:right;">${fmtAmt(subtotal)}</td></tr><tr><td style="padding:6px 12px;font-size:13px;color:#475569;">GST (${gstPercent}%)</td><td style="padding:6px 12px;font-size:13px;text-align:right;">${fmtAmt(gstAmount)}</td></tr>${discount > 0 ? `<tr><td style="padding:6px 12px;font-size:13px;color:#475569;">Discount</td><td style="padding:6px 12px;font-size:13px;text-align:right;color:#ef4444;">- ${fmtAmt(discount)}</td></tr>` : ''}<tr style="border-top:2px solid #1e293b;"><td style="padding:10px 12px;font-size:15px;font-weight:900;color:#1e293b;">Grand Total</td><td style="padding:10px 12px;font-size:15px;font-weight:900;color:#1e293b;text-align:right;">${fmtAmt(totalAmount)}</td></tr></table></div>${notes ? `<div style="padding:20px 32px 0;"><div style="background:#f0f9ff;border-left:4px solid #0ea5e9;border-radius:8px;padding:12px 16px;"><p style="margin:0;font-size:12px;color:#0369a1;"><strong>Notes:</strong> ${notes}</p></div></div>` : ''}<div style="padding:24px 32px;margin-top:24px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;font-size:12px;color:#94a3b8;">Thank you for your business! — ${senderName || 'Graphura CRM'}</p></div></div></body></html>`;

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: getSender(),
        to: [{ email, name: clientName || 'Client' }],
        subject: `Invoice ${invoiceNumber} from ${senderName || 'Graphura CRM'}`,
        htmlContent,
      },
      {
        headers: { 'api-key': process.env.BREVO_API_KEY.trim(), 'Content-Type': 'application/json' },
        timeout: 15000,
      },
    );

    const messageId = response.data.messageId || response.data.id || null;
    logger.info(`Invoice email sent to ${email} (${invoiceNumber})`);
    return { success: true, messageId };
  } catch (error) {
    const details = error.response?.data?.message || error.response?.data || error.message;
    logger.error('Failed to send invoice email', details);
    throw new Error(typeof details === 'string' ? details : 'Unable to send invoice email');
  }
};

/**
 * Send Work Order Email to client
 */
const sendWorkOrderEmail = async (payload) => {
  try {
    if (!process.env.BREVO_API_KEY) throw new Error('BREVO_API_KEY is not configured');
    if (!isValidEmail(payload.email)) throw new Error('Client email is missing or invalid');

    const {
      email, clientName, companyName, woNumber, service,
      requirements = [], terms, deliveryDate,
      totalCost, discountAmt, netPayable, paymentStatus,
      senderName, senderEmail,
    } = payload;

    const fmtAmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const reqRows = requirements.map((r, i) => `
      <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;">${r.title || 'Service'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">${r.description || '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;">${fmtAmt(r.cost)}</td>
      </tr>`).join('');

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Work Order ${woNumber}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:680px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:#1e293b;padding:28px 32px;color:#fff;">
    <h1 style="margin:0;font-size:22px;font-weight:900;">${senderName || 'Graphura CRM'}</h1>
    <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">Work Order Document</p>
    <p style="margin:8px 0 0;font-size:18px;font-weight:900;">WORK ORDER</p>
    <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">${woNumber}</p>
    ${deliveryDate ? `<p style="margin:4px 0 0;color:#94a3b8;font-size:12px;">Delivery: ${fmtDate(deliveryDate)}</p>` : ''}
  </div>
  <div style="padding:24px 32px 0;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Client</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;">
      <p style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">${clientName || 'Client'}</p>
      ${companyName ? `<p style="margin:4px 0 0;font-size:13px;color:#475569;">${companyName}</p>` : ''}
      <p style="margin:4px 0 0;font-size:13px;color:#475569;">${email}</p>
      ${service ? `<p style="margin:4px 0 0;font-size:13px;color:#475569;">Service: ${service}</p>` : ''}
    </div>
  </div>
  <div style="padding:24px 32px 0;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Scope of Work</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;">
      <thead><tr style="background:#1e293b;color:#fff;">
        <th style="padding:10px 12px;text-align:left;font-size:12px;">Requirement</th>
        <th style="padding:10px 12px;text-align:left;font-size:12px;">Description</th>
        <th style="padding:10px 12px;text-align:right;font-size:12px;">Cost</th>
      </tr></thead>
      <tbody>${reqRows || '<tr><td colspan="3" style="padding:12px;color:#64748b;">Professional Services</td></tr>'}</tbody>
    </table>
  </div>
  <div style="padding:20px 32px 0;">
    <table style="width:240px;margin-left:auto;border-collapse:collapse;">
      <tr><td style="padding:6px 12px;font-size:13px;color:#475569;">Total Cost</td><td style="padding:6px 12px;font-size:13px;text-align:right;">${fmtAmt(totalCost)}</td></tr>
      ${discountAmt > 0 ? `<tr><td style="padding:6px 12px;font-size:13px;color:#475569;">Discount</td><td style="padding:6px 12px;font-size:13px;text-align:right;color:#ef4444;">- ${fmtAmt(discountAmt)}</td></tr>` : ''}
      <tr style="border-top:2px solid #1e293b;"><td style="padding:10px 12px;font-size:15px;font-weight:900;color:#1e293b;">Net Payable</td><td style="padding:10px 12px;font-size:15px;font-weight:900;color:#1e293b;text-align:right;">${fmtAmt(netPayable)}</td></tr>
    </table>
  </div>
  <div style="padding:16px 32px 0;">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 16px;">
      <p style="margin:0;font-size:13px;color:#166534;"><strong>Payment Status:</strong> ${paymentStatus || 'Unpaid'}</p>
    </div>
  </div>
  ${terms ? `<div style="padding:20px 32px 0;"><div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:12px 16px;"><p style="margin:0;font-size:12px;color:#1e40af;"><strong>Terms & Conditions:</strong></p><p style="margin:6px 0 0;font-size:12px;color:#1e40af;white-space:pre-line;">${terms}</p></div></div>` : ''}
  <div style="padding:24px 32px;margin-top:24px;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#64748b;">Please review this work order and revert with your signed copy or any queries.</p>
    <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;text-align:center;">— ${senderName || 'Graphura CRM'}</p>
  </div>
</div>
</body></html>`;

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: getSender(),
        to: [{ email, name: clientName || 'Client' }],
        subject: `Work Order ${woNumber} from ${senderName || 'Graphura CRM'}`,
        htmlContent,
      },
      {
        headers: { 'api-key': process.env.BREVO_API_KEY.trim(), 'Content-Type': 'application/json' },
        timeout: 15000,
      },
    );

    const messageId = response.data.messageId || response.data.id || null;
    logger.info(`Work order email sent to ${email} (${woNumber})`);
    return { success: true, messageId };
  } catch (error) {
    const details = error.response?.data?.message || error.response?.data || error.message;
    logger.error('Failed to send work order email', details);
    throw new Error(typeof details === 'string' ? details : 'Unable to send work order email');
  }
};

module.exports = {
  sendOTPEmail,
  sendRegistrationConfirmationEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  sendProspectQuotationEmail,
  sendRazorpayLinkEmail,
  sendInvoiceEmail,
  sendWorkOrderEmail,
};
