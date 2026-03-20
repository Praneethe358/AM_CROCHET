const express = require('express');
const { body, param } = require('express-validator');

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

const productIdValidation = [
  param('id').isMongoId().withMessage('Invalid product ID format'),
];

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('images')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Images must be an array with 1 to 10 image URLs'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
];

const updateProductValidation = [
  ...productIdValidation,
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('images')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Images must be an array with 1 to 10 image URLs'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
];

router
  .route('/')
  .post(authMiddleware, adminMiddleware, createProductValidation, createProduct)
  .get(getProducts);

router
  .route('/:id')
  .get(productIdValidation, getProductById)
  .put(authMiddleware, adminMiddleware, updateProductValidation, updateProduct)
  .delete(authMiddleware, adminMiddleware, productIdValidation, deleteProduct);

module.exports = router;
