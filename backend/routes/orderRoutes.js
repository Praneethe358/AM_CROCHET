const express = require('express');
const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');

const {
  createDirectOrder,
  // createOrder, // Disabled: Razorpay payment flow
  // verifyPayment, // Disabled: Razorpay payment verification
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
  '/',
  [
    body('idempotencyKey')
      .optional()
      .isString()
      .withMessage('idempotencyKey must be a string')
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('idempotencyKey must be between 1 and 120 characters'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('items must be a non-empty array'),
    body('items.*.productId')
      .isMongoId()
      .withMessage('productId must be a valid product id'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('quantity must be at least 1'),
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
  ],
  validateRequest,
  createDirectOrder
);

/*
 * DISABLED: Razorpay Payment Routes
 * These routes are commented out as we now use WhatsApp checkout flow.
 * Payment files are preserved for potential future use.
 *
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
*/

router.get('/my', getUserOrders);

router.get('/', getUserOrders);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid order id')],
  validateRequest,
  getOrderById
);

module.exports = router;
