const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isRaw = ['.csv', '.xlsx', '.xls', '.pdf'].includes(ext);
    
    return {
      folder: 'crm',
      resource_type: isRaw ? 'raw' : 'auto',
      public_id: `${path.parse(file.originalname).name}-${Date.now()}`,
      tags: ['crm'],
    };
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.csv', '.xlsx', '.pdf', '.jpg', '.jpeg', '.png'];
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Allowed: CSV, Excel, PDF, and Images'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
