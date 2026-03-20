// backend/controllers/analyticsController.js

const Product = require('../models/Product');
const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Get dashboard statistics for admin
 * Returns: totalProducts, totalOrders, totalRevenue
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalProducts, totalOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    const orders = await Order.find().select('totalAmount finalAmount discount totalPrice').lean();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || order.finalAmount || order.totalAmount || 0), 0);

    logger.info('Dashboard stats retrieved', {
      totalProducts,
      totalOrders,
      totalRevenue,
    });

    return res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all products for admin view
 * Returns paginated list of all products
 */
const getAdminProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find()
        .select('name price category stock image images countInStock isFeatured featuredOrder createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin products retrieved successfully',
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all orders for admin view
 * Returns paginated list of all orders with user and product details
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name price image images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin orders retrieved successfully',
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get revenue analytics
 * Returns revenue breakdown by time period
 */
const getRevenueAnalytics = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .select('totalAmount finalAmount totalPrice discount createdAt')
      .lean();

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || order.finalAmount || order.totalAmount || 0), 0);
    const totalDiscount = orders.reduce((sum, order) => sum + (order.discount || 0), 0);
    const totalGrossRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return res.status(200).json({
      success: true,
      message: 'Revenue analytics retrieved successfully',
      data: {
        totalRevenue,
        totalDiscount,
        totalGrossRevenue,
        orderCount: orders.length,
        averageOrderValue: orders.length > 0 ? Number((totalRevenue / orders.length).toFixed(2)) : 0,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update an order's status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    
    if (!orderStatus) {
      return res.status(400).json({ message: 'Order status is required' });
    }

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    
    if (orderStatus === 'delivered' && order.paymentStatus !== 'success') {
      order.paymentStatus = 'success';
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminProducts,
  getAdminOrders,
  getRevenueAnalytics,
  updateOrderStatus
};