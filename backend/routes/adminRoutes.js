// backend/routes/adminRoutes.js

const express = require('express');
const {
  getDashboardStats,
  getAdminProducts,
  getAdminOrders,
  getRevenueAnalytics,
  updateOrderStatus
} = require('../controllers/analyticsController');
const {
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware, adminMiddleware);

// Dashboard stats endpoint
router.get('/stats', getDashboardStats);

// Products for admin
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders for admin
router.get('/orders', getAdminOrders);
router.put('/orders/:id', updateOrderStatus);

// Revenue analytics
router.get('/revenue', getRevenueAnalytics);

module.exports = router;