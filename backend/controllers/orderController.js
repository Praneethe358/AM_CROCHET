const crypto = require('crypto');
const mongoose = require('mongoose');

const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const PaymentSession = require('../models/PaymentSession');
const Product = require('../models/Product');
const razorpay = require('../config/razorpay');
const logger = require('../utils/logger');

const calculateCouponDiscount = (coupon, totalAmount) => {
  if (!coupon) {
    return 0;
  }

  if (coupon.discountType === 'percentage') {
    return Number(((totalAmount * coupon.discount) / 100).toFixed(2));
  }

  return Number(Math.min(coupon.discount, totalAmount).toFixed(2));
};

const validateAndGetCoupon = async (couponCode, totalAmount) => {
  if (!couponCode) {
    return null;
  }

  const normalizedCode = couponCode.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: normalizedCode }).lean();

  if (!coupon) {
    return { error: { status: 404, message: 'Coupon not found' } };
  }

  if (!coupon.isActive) {
    return { error: { status: 400, message: 'Coupon is inactive' } };
  }

  if (new Date(coupon.expiryDate).getTime() < Date.now()) {
    return { error: { status: 400, message: 'Coupon has expired' } };
  }

  if (totalAmount < coupon.minAmount) {
    return {
      error: {
        status: 400,
        message: `Minimum order amount for this coupon is ${coupon.minAmount}`,
      },
    };
  }

  return { coupon };
};

const normalizeShippingAddress = (shippingAddress = {}) => {
  return {
    name: shippingAddress?.name?.trim() || null,
    phone: shippingAddress?.phone?.trim() || null,
    address: shippingAddress?.address?.trim() || null,
    city: shippingAddress?.city?.trim() || null,
    pincode: shippingAddress?.pincode?.trim() || null,
  };
};

const hasValidShippingAddress = (shippingAddress) => {
  return (
    Boolean(shippingAddress?.name) &&
    Boolean(shippingAddress?.phone) &&
    Boolean(shippingAddress?.address) &&
    Boolean(shippingAddress?.city) &&
    Boolean(shippingAddress?.pincode)
  );
};

const createOrder = async (req, res, next) => {
  try {
    const { couponCode, shippingAddress } = req.body;

    const normalizedShippingAddress = normalizeShippingAddress(shippingAddress);

    if (!hasValidShippingAddress(normalizedShippingAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Valid shipping details are required to start payment',
      });
    }

    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price stock image')
      .lean();

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const validItems = cart.items.filter((item) => item.product && item.quantity > 0);

    if (validItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    for (const item of validItems) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${item.product.name}`,
        });
      }
    }

    const orderItems = validItems.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
    }));

    const totalAmount = Number(
      orderItems
        .reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0)
        .toFixed(2)
    );

    const couponResult = await validateAndGetCoupon(couponCode, totalAmount);
    if (couponResult?.error) {
      return res
        .status(couponResult.error.status)
        .json({ success: false, message: couponResult.error.message });
    }

    const coupon = couponResult?.coupon || null;
    const discount = calculateCouponDiscount(coupon, totalAmount);
    const finalAmount = Number(Math.max(totalAmount - discount, 0).toFixed(2));

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}_${String(req.user.id).slice(-6)}`,
      notes: {
        userId: String(req.user.id),
      },
    });

    await PaymentSession.findOneAndUpdate(
      {
        razorpayOrderId: razorpayOrder.id,
      },
      {
        $set: {
          user: req.user.id,
          items: orderItems,
          totalAmount,
          discount,
          finalAmount,
          couponCode: coupon ? coupon.code : null,
          shippingAddress: normalizedShippingAddress,
          status: 'created',
          verifiedPaymentId: null,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    logger.info('Payment session created', {
      userId: String(req.user.id),
      razorpayOrderId: razorpayOrder.id,
      totalAmount,
      finalAmount,
      discount,
    });

    return res.status(201).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        totalAmount,
        discount,
        finalAmount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValidSignature = generatedSignature === razorpay_signature;

    const existingOrderByPayment = await Order.findOne({
      paymentId: razorpay_payment_id,
      user: req.user.id,
    })
      .populate('items.product', 'name price image')
      .lean();

    if (existingOrderByPayment) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'Payment already verified',
          order: existingOrderByPayment,
        },
      });
    }

    const paymentSession = await PaymentSession.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user.id,
    });

    if (!paymentSession) {
      const existingOrderByRazorpay = await Order.findOne({
        razorpayOrderId: razorpay_order_id,
        user: req.user.id,
      })
        .populate('items.product', 'name price image')
        .lean();

      if (existingOrderByRazorpay) {
        return res.status(200).json({
          success: true,
          data: {
            message: 'Payment already verified',
            order: existingOrderByRazorpay,
          },
        });
      }

      return res.status(404).json({ success: false, message: 'Payment session not found' });
    }

    if (!isValidSignature) {
      paymentSession.status = 'failed';
      await paymentSession.save();

      logger.error('Payment signature verification failed', {
        userId: String(req.user.id),
        razorpayOrderId: razorpay_order_id,
      });

      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    if (paymentSession.status === 'verified' && paymentSession.verifiedPaymentId) {
      const verifiedOrder = await Order.findOne({
        paymentId: paymentSession.verifiedPaymentId,
        user: req.user.id,
      })
        .populate('items.product', 'name price image')
        .lean();

      if (verifiedOrder) {
        return res.status(200).json({
          success: true,
          data: {
            message: 'Payment already verified',
            order: verifiedOrder,
          },
        });
      }
    }

    let createdOrder;

    await session.withTransaction(async () => {
      const transactionalSession = await PaymentSession.findOne({
        _id: paymentSession._id,
        user: req.user.id,
      }).session(session);

      const duplicateOrder = await Order.findOne({
        paymentId: razorpay_payment_id,
        user: req.user.id,
      }).session(session);

      if (duplicateOrder) {
        createdOrder = duplicateOrder;
        return;
      }

      for (const item of transactionalSession.items) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedProduct) {
          throw new Error('Stock insufficient during payment verification');
        }
      }

      createdOrder = await Order.create(
        [
          {
            user: req.user.id,
            items: transactionalSession.items,
            totalAmount: transactionalSession.totalAmount,
            discount: transactionalSession.discount,
            finalAmount: transactionalSession.finalAmount,
            couponCode: transactionalSession.couponCode,
            razorpayOrderId: transactionalSession.razorpayOrderId,
            paymentId: razorpay_payment_id,
            paymentStatus: 'success',
            orderStatus: 'paid',
            shippingAddress: transactionalSession.shippingAddress,
          },
        ],
        { session }
      );

      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { $set: { items: [] } },
        { session }
      );

      transactionalSession.status = 'verified';
      transactionalSession.verifiedPaymentId = razorpay_payment_id;
      await transactionalSession.save({ session });
    });

    const orderId = Array.isArray(createdOrder) ? createdOrder[0]._id : createdOrder._id;

    const order = await Order.findById(orderId)
      .populate('items.product', 'name price image')
      .lean();

    logger.info('Payment verified and order created', {
      userId: String(req.user.id),
      orderId: String(order._id),
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      finalAmount: order.finalAmount,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Payment verified and order confirmed',
        order,
      },
    });
  } catch (error) {
    if (error.message === 'Stock insufficient during payment verification') {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error?.code === 11000) {
      const existingOrder = await Order.findOne({
        paymentId: req.body.razorpay_payment_id,
        user: req.user.id,
      })
        .populate('items.product', 'name price image')
        .lean();

      if (existingOrder) {
        return res.status(200).json({
          success: true,
          data: {
            message: 'Payment already verified',
            order: existingOrder,
          },
        });
      }
    }

    return next(error);
  } finally {
    await session.endSession();
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name price image')
      .lean();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }

    const order = await Order.findOne({ _id: id, user: req.user.id })
      .populate('items.product', 'name price image')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
};
