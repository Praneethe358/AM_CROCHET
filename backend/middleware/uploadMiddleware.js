const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Some older versions export differently, fallback check
const StorageClass = CloudinaryStorage || require('multer-storage-cloudinary');

const cloudinary = require('../config/cloudinary');

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// Increased to 10 MB so high-res originals aren't rejected
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const isValidImageFile = (file) => {
  const mime = (file.mimetype || '').toLowerCase();
  const extension = path.extname(file.originalname || '').replace('.', '').toLowerCase();

  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mime);
  const isExtensionAllowed = ALLOWED_FORMATS.includes(extension);

  return isMimeAllowed && isExtensionAllowed;
};

const storage = new StorageClass({
  cloudinary,
  params: async (req, file) => {
    if (!isValidImageFile(file)) {
      const error = new Error('Invalid file type. Only jpg, jpeg, png, and webp are allowed');
      error.code = 'INVALID_FILE_TYPE';
      throw error;
    }

    const originalBaseName = path.parse(file.originalname || 'upload').name;
    const safeBaseName = originalBaseName
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'image';

    const uniqueSuffix = crypto.randomBytes(8).toString('hex');

    return {
      folder: 'bag-shop',
      allowed_formats: ALLOWED_FORMATS,
      resource_type: 'image',
      public_id: `${safeBaseName}-${uniqueSuffix}`,
      overwrite: false,
      unique_filename: true,
      use_filename: false,
      // We removed eager transformations here to make uploads significantly faster.
    };
  },
});

// Single-image uploader
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!isValidImageFile(file)) {
      const error = new Error('Invalid file type. Only jpg, jpeg, png, and webp are allowed');
      error.code = 'INVALID_FILE_TYPE';
      return callback(error);
    }

    return callback(null, true);
  },
});

// Multi-image uploader (up to 10 at once)
const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
  fileFilter: (req, file, callback) => {
    if (!isValidImageFile(file)) {
      const error = new Error('Invalid file type. Only jpg, jpeg, png, and webp are allowed');
      error.code = 'INVALID_FILE_TYPE';
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = upload;
module.exports.uploadMultiple = uploadMultiple;
