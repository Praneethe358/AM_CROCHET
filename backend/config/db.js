const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectWithUri = async (uri, label) => {
  const conn = await mongoose.connect(uri.trim(), {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  });

  logger.info(`MongoDB connected (${label}): ${conn.connection.host}`);
  return conn;
};

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.MONGO_FALLBACK_URI || 'mongodb://127.0.0.1:27017/am_crochet_dev';

  if (!primaryUri) {
    logger.warn('MONGO_URI is not defined, attempting fallback MongoDB connection');
    return connectWithUri(fallbackUri, 'fallback');
  }

  try {
    return await connectWithUri(primaryUri, 'primary');
  } catch (primaryError) {
    const isDevelopment = (process.env.NODE_ENV || 'development') !== 'production';

    if (!isDevelopment) {
      throw primaryError;
    }

    logger.warn(`Primary MongoDB connection failed: ${primaryError.message}`);
    logger.warn(`Attempting fallback MongoDB connection: ${fallbackUri}`);

    return connectWithUri(fallbackUri, 'fallback');
  }
};

module.exports = connectDB;
