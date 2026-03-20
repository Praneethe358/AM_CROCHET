const Razorpay = require('razorpay');

const requiredEnvVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar] || process.env[envVar] === 'your_razorpay_key_id' || process.env[envVar] === 'your_razorpay_key_secret') {
    console.warn(`WARNING: ${envVar} is not properly defined. Payments will fail.`);
  }
});

let razorpay = null;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
  });
} catch(err) {}

module.exports = razorpay;
