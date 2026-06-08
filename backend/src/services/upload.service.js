const cloudinary = require('../config/cloudinary');

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} folder - Optional folder name
 * @returns {Promise<object>} - Cloudinary upload response
 */
const uploadImage = (fileBuffer, folder = 'crm_uploads') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', tags: ['crm'] },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary using its publicId
 * @param {string} publicId - The publicId of the file to delete
 * @returns {Promise<object>} - Cloudinary deletion response
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadImage,
  deleteImage
};
