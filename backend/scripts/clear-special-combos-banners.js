const path = require('path');
const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Promotion = require('../models/Promotion');
const logger = require('../utils/logger');

async function clearSpecialCombosBanners() {
  await connectDB();

  const result = await Promotion.updateMany(
    { placement: 'special_combos', banner: { $ne: null } },
    { $set: { banner: null } }
  );

  logger.info('Special combos banner cleanup completed', {
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0,
  });

  console.log(`Matched: ${result.matchedCount || 0}`);
  console.log(`Modified: ${result.modifiedCount || 0}`);
}

clearSpecialCombosBanners()
  .catch((error) => {
    logger.error(`Special combos banner cleanup failed: ${error.message}`);
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (_error) {
      // Ignore disconnect errors at script shutdown.
    }
  });
