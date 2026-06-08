const cloudinary = require('../config/cloudinary');
const path = require('path');

/**
 * Middleware to add an uploaded file to the 'crm' collection in Cloudinary.
 * This should be used after the upload middleware.
 */
const addToCrmCollection = async (req, res, next) => {
  if (!req.file || !req.file.filename) {
    return next();
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const isRaw = ['.csv', '.xlsx', '.xls', '.pdf'].includes(ext);
    const resourceType = isRaw ? 'raw' : 'image';

    // Cloudinary Admin API requires resource_type for non-images
    await cloudinary.api.add_to_collection('crm', [req.file.filename], {
      resource_type: resourceType
    });
    
    console.log(`[Cloudinary] Added ${resourceType} asset ${req.file.filename} to collection 'crm'`);
  } catch (error) {
    console.error('[Cloudinary] Collection Error:', error.message);
  }

  next();
};

module.exports = addToCrmCollection;
