const express = require('express');
const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');

const {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  return next();
};

router.use(authMiddleware);

router.post(
  '/create',
  [
    body('shippingAddress').isObject().withMessage('shippingAddress is required'),
    body('shippingAddress.name')
      .trim()
      .notEmpty()
      .withMessage('shippingAddress.name is required'),
    body('shippingAddress.phone')
      .trim()
      .matches(/^\d{10}$/)
      .withMessage('shippingAddress.phone must be a valid 10-digit number'),
    body('shippingAddress.address')
      .trim()
      .notEmpty()
      .withMessage('shippingAddress.address is required'),
    body('shippingAddress.city')
      .trim()
      .notEmpty()
      .withMessage('shippingAddress.city is required'),
    body('shippingAddress.pincode')
      .trim()
      .matches(/^\d{6}$/)
      .withMessage('shippingAddress.pincode must be a valid 6-digit number'),
    body('couponCode')
      .optional()
      .isString()
      .withMessage('couponCode must be a string')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('couponCode must be between 1 and 50 characters'),
  ],
  validateRequest,
  createOrder
);

router.post(
  '/verify',
  [
    body('razorpay_order_id')
      .notEmpty()
      .withMessage('razorpay_order_id is required')
      .isString()
      .withMessage('razorpay_order_id must be a string'),
    body('razorpay_payment_id')
      .notEmpty()
      .withMessage('razorpay_payment_id is required')
      .isString()
      .withMessage('razorpay_payment_id must be a string'),
    body('razorpay_signature')
      .notEmpty()
      .withMessage('razorpay_signature is required')
      .isString()
      .withMessage('razorpay_signature must be a string'),
  ],
  validateRequest,
  verifyPayment
);

router.get('/', getUserOrders);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid order id')],
  validateRequest,
  getOrderById
);

module.exports = router;
