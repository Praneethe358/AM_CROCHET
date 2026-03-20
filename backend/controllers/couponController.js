const Coupon = require('../models/Coupon');

const calculateCouponDiscount = (coupon, totalAmount) => {
  if (coupon.discountType === 'percentage') {
    return Number(((totalAmount * coupon.discount) / 100).toFixed(2));
  }

  return Number(Math.min(coupon.discount, totalAmount).toFixed(2));
};

const applyCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const normalizedAmount = Number(amount);

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() }).lean();

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon is inactive' });
    }

    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (normalizedAmount < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for this coupon is ${coupon.minAmount}`,
      });
    }

    const discountAmount = calculateCouponDiscount(coupon, normalizedAmount);
    const finalAmount = Number(Math.max(normalizedAmount - discountAmount, 0).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discount,
        discountAmount,
        finalAmount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discount,
      minAmount,
      expiryDate,
      isActive,
    } = req.body;

    const normalizedCode = String(code || '').trim().toUpperCase();

    if (!normalizedCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    if (!['percentage', 'flat'].includes(discountType)) {
      return res.status(400).json({ success: false, message: 'discountType must be percentage or flat' });
    }

    const numericDiscount = Number(discount);
    if (Number.isNaN(numericDiscount) || numericDiscount <= 0) {
      return res.status(400).json({ success: false, message: 'Discount must be greater than 0' });
    }

    if (discountType === 'percentage' && numericDiscount > 100) {
      return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100' });
    }

    const numericMinAmount = minAmount === undefined ? 0 : Number(minAmount);
    if (Number.isNaN(numericMinAmount) || numericMinAmount < 0) {
      return res.status(400).json({ success: false, message: 'minAmount must be 0 or more' });
    }

    const parsedExpiryDate = new Date(expiryDate);
    if (Number.isNaN(parsedExpiryDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Valid expiryDate is required' });
    }

    if (parsedExpiryDate.getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: 'expiryDate must be in the future' });
    }

    const existingCoupon = await Coupon.findOne({ code: normalizedCode }).lean();
    if (existingCoupon) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      discountType,
      discount: numericDiscount,
      minAmount: numericMinAmount,
      expiryDate: parsedExpiryDate,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    return res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  applyCoupon,
  createCoupon,
};
