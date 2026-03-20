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

  if (!primaryUri || !primaryUri.trim()) {
    throw new Error('MONGO_URI is required');
  }

  return connectWithUri(primaryUri, 'primary');
};

module.exports = connectDB;
