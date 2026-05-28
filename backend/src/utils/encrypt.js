const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// Ensure the encryption key is 32 bytes by hashing it
const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(String(process.env.ENCRYPTION_KEY || 'graphura-crm-default-secret-key-32-chars'))
  .digest();
const IV_LENGTH = 16;

/**
 * Encrypts a string using AES-256-CBC
 * @param {string} text - The text to encrypt
 * @returns {string} - The IV and encrypted text joined by a colon
 */
const encrypt = (text) => {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypts a string using AES-256-CBC
 * @param {string} text - The IV and encrypted text joined by a colon
 * @returns {string} - The decrypted text
 */
const decrypt = (text) => {
  if (!text) return '';
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return text; // Not in our expected format

    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return text; // Return original text if decryption fails
  }
};

module.exports = { encrypt, decrypt };
