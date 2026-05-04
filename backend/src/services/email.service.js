/**
 * EMAIL SERVICE — Send OTPs and verification emails
 * Uses Brevo (Sendinblue) for production email delivery
 * Can fallback to nodemailer for development
 */
const axios = require('axios');
const logger = require('../utils/logger');

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

module.exports = {
  sendOTPEmail,
  sendRegistrationConfirmationEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
};
