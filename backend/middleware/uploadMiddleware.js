const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Some older versions export differently, fallback check
const StorageClass = CloudinaryStorage || require('multer-storage-cloudinary');

const cloudinary = require('../config/cloudinary');

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_FORMATS = ['mp4', 'mov', 'webm', 'm4v'];
const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
// Increased to 10 MB so high-res originals aren't rejected
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_MEDIA_FILE_SIZE = 50 * 1024 * 1024;

const isValidImageFile = (file) => {
  const mime = (file.mimetype || '').toLowerCase();
  const extension = path.extname(file.originalname || '').replace('.', '').toLowerCase();

  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mime);
  const isExtensionAllowed = ALLOWED_FORMATS.includes(extension);

  return isMimeAllowed && isExtensionAllowed;
};

const isValidVideoFile = (file) => {
  const mime = (file.mimetype || '').toLowerCase();
  const extension = path.extname(file.originalname || '').replace('.', '').toLowerCase();

  const isMimeAllowed = ALLOWED_VIDEO_MIME_TYPES.includes(mime);
  const isExtensionAllowed = ALLOWED_VIDEO_FORMATS.includes(extension);

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

const mediaStorage = new StorageClass({
  cloudinary,
  params: async (req, file) => {
    const requestedType = (req.body?.mediaType || '').toLowerCase();
    const isImage = requestedType === 'image' || (!requestedType && isValidImageFile(file));
    const isVideo = requestedType === 'video' || (!requestedType && isValidVideoFile(file));

    if (!isImage && !isVideo) {
      const error = new Error('Invalid media file. Use image (jpg, jpeg, png, webp) or video (mp4, mov, webm, m4v)');
      error.code = 'INVALID_FILE_TYPE';
      throw error;
    }

    const originalBaseName = path.parse(file.originalname || 'upload').name;
    const safeBaseName = originalBaseName
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'media';

    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const resolvedMediaType = isVideo ? 'video' : 'image';

    return {
      folder: 'bag-shop/hero',
      allowed_formats: resolvedMediaType === 'video' ? ALLOWED_VIDEO_FORMATS : ALLOWED_FORMATS,
      resource_type: resolvedMediaType,
      public_id: `${safeBaseName}-${uniqueSuffix}`,
      overwrite: false,
      unique_filename: true,
      use_filename: false,
    };
  },
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: {
    fileSize: MAX_MEDIA_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const requestedType = (req.body?.mediaType || '').toLowerCase();

    if (requestedType === 'video') {
      if (!isValidVideoFile(file)) {
        const error = new Error('Invalid video type. Only mp4, mov, webm, and m4v are allowed');
        error.code = 'INVALID_FILE_TYPE';
        return callback(error);
      }
      return callback(null, true);
    }

    if (requestedType === 'image') {
      if (!isValidImageFile(file)) {
        const error = new Error('Invalid image type. Only jpg, jpeg, png, and webp are allowed');
        error.code = 'INVALID_FILE_TYPE';
        return callback(error);
      }
      return callback(null, true);
    }

    if (!isValidImageFile(file) && !isValidVideoFile(file)) {
      const error = new Error('Invalid media file. Use image (jpg, jpeg, png, webp) or video (mp4, mov, webm, m4v)');
      error.code = 'INVALID_FILE_TYPE';
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = upload;
module.exports.uploadMultiple = uploadMultiple;
module.exports.uploadMedia = uploadMedia;
