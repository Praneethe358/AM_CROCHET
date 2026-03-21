const cloudinary = require('../config/cloudinary');

/**
 * Helper: given a raw Cloudinary URL, return the "original" (full-quality)
 * version and a display-ready URL with on-the-fly Cloudinary transforms.
 */
const buildImageUrls = (rawUrl) => {
  if (!rawUrl) return { original: '', display: '' };

  // Cloudinary URLs look like:
  //   https://res.cloudinary.com/<cloud>/image/upload/v123/folder/file.ext
  // We insert transformation params right after "/upload/" so Cloudinary
  // serves an optimised variant without mutating the stored original.
  const original = rawUrl;

  // For display: auto-quality best, auto-format, DPR auto (retina-safe)
  const display = rawUrl.replace(
    '/image/upload/',
    '/image/upload/q_auto:best,f_auto,dpr_auto/'
  );

  return { original, display };
};

/**
 * POST /api/upload  — single image upload
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const rawUrl = req.file.path || req.file.secure_url;

    if (!rawUrl) {
      return res.status(500).json({ message: 'Image upload failed' });
    }

    const { original, display } = buildImageUrls(rawUrl);

    return res.status(200).json({
      success: true,
      imageUrl: original,   // full-quality Cloudinary URL (stored in DB)
      displayUrl: display,  // on-the-fly optimised URL for <img> / next/image
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/upload/multiple  — multi-image upload (up to 10)
 */
const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image file is required' });
    }

    const results = req.files.map((file) => {
      const rawUrl = file.path || file.secure_url;
      const { original, display } = buildImageUrls(rawUrl);
      return { imageUrl: original, displayUrl: display };
    });

    return res.status(200).json({
      success: true,
      images: results,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
};
