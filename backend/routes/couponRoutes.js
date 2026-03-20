const express = require('express');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');

const { applyCoupon, createCoupon } = require('../controllers/couponController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

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
  '/apply',
  [
    body('code')
      .notEmpty()
      .withMessage('Coupon code is required')
      .isString()
      .withMessage('code must be a string')
      .trim(),
    body('amount')
      .notEmpty()
      .withMessage('amount is required')
      .isFloat({ gt: 0 })
      .withMessage('amount must be greater than 0'),
  ],
  validateRequest,
  applyCoupon
);

router.post(
  '/',
  adminMiddleware,
  [
    body('code')
      .notEmpty()
      .withMessage('Coupon code is required')
      .isString()
      .withMessage('code must be a string')
      .trim(),
    body('discountType')
      .notEmpty()
      .withMessage('discountType is required')
      .isIn(['percentage', 'flat'])
      .withMessage('discountType must be percentage or flat'),
    body('discount')
      .notEmpty()
      .withMessage('discount is required')
      .isFloat({ gt: 0 })
      .withMessage('discount must be greater than 0'),
    body('minAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('minAmount must be 0 or greater'),
    body('expiryDate')
      .notEmpty()
      .withMessage('expiryDate is required')
      .isISO8601()
      .withMessage('expiryDate must be a valid date'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  ],
  validateRequest,
  createCoupon
);

module.exports = router;
