const logger = require('../utils/logger');

const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}`, data: {} });
};

const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  logger.error(error.message || 'Unhandled error', {
    path: req.originalUrl,
    method: req.method,
    statusCode,
    stack: error.stack,
  });

  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: error.message || 'Invalid file type',
      data: {},
    });
  }

  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum allowed size is 10MB',
        data: {},
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'File upload error',
      data: {},
    });
  }

  if (error.http_code || error.name === 'UploadApiErrorResponse') {
    return res.status(502).json({
      success: false,
      message: 'Image upload provider error. Please try again',
      data: {},
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map((err) => err.message),
      data: {},
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value entered',
      field: Object.keys(error.keyPattern)[0],
      data: {},
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path}: ${error.value}`,
      data: {},
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    data: {},
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
