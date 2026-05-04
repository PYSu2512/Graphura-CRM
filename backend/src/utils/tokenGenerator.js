const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generates a random 32-byte hex token and its bcrypt hash.
 * @returns {Promise<{rawToken: string, hashedToken: string}>}
 */
const generateResetToken = async () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(rawToken, 10);
  return { rawToken, hashedToken };
};

module.exports = {
  generateResetToken,
};
