const express = require('express');
const { body, param } = require('express-validator');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

const categoryCreateValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('name must be between 2 and 100 characters'),
  body('image')
    .optional({ nullable: true })
    .isURL()
    .withMessage('image must be a valid URL'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('sortOrder must be a non-negative integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const categoryUpdateValidation = [
  param('id').isMongoId().withMessage('Invalid category ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('name must be between 2 and 100 characters'),
  body('image')
    .optional({ nullable: true })
    .isURL()
    .withMessage('image must be a valid URL'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('sortOrder must be a non-negative integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

router.get('/', getAdminCategories);
router.post('/', categoryCreateValidation, createCategory);
router.put('/:id', categoryUpdateValidation, updateCategory);
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid category ID format')], deleteCategory);

module.exports = router;
