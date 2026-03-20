const { v2: cloudinary } = require('cloudinary');

const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar] || process.env[envVar] === 'your_cloud_name' || process.env[envVar] === 'your_api_key' || process.env[envVar] === 'your_api_secret') {
    console.warn(`WARNING: ${envVar} is not properly defined in environment variables. Image uploads will fail.`);
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dummy_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'dummy_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dummy_api_secret',
  secure: true,
});

module.exports = cloudinary;
