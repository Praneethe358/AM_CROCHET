const express = require('express');
const { body, param } = require('express-validator');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getAdminPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require('../controllers/promotionController');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

const normalizePlacement = (placement) => {
  if (placement === 'special_combos') return 'special_combos';
  if (placement === 'home_thematic_banner') return 'home_thematic_banner';
  return 'general';
};

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidUrl = (value) => {
  try {
    // URL constructor reliably validates absolute URLs for admin payloads.
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch (_error) {
    return false;
  }
};

const promotionValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('title is required')
    .isLength({ max: 160 })
    .withMessage('title must be at most 160 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('description is required')
    .isLength({ max: 1200 })
    .withMessage('description must be at most 1200 characters'),
  body('banner').custom((banner, { req }) => {
    const placement = normalizePlacement(req.body?.placement);
    const normalizedBanner = typeof banner === 'string' ? banner.trim() : '';

    if (placement === 'special_combos') {
      if (!normalizedBanner) {
        return true;
      }

      if (!isValidUrl(normalizedBanner)) {
        throw new Error('banner must be a valid URL');
      }

      return true;
    }

    if (!hasText(normalizedBanner)) {
      throw new Error('banner is required');
    }

    if (!isValidUrl(normalizedBanner)) {
      throw new Error('banner must be a valid URL');
    }

    return true;
  }),
  body('discount')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0, max: 100 })
    .withMessage('discount must be between 0 and 100'),
  body('products').optional().isArray().withMessage('products must be an array'),
  body('products.*').optional().isMongoId().withMessage('each product must be a valid product id'),
  body('startDate').notEmpty().withMessage('startDate is required').isISO8601().withMessage('startDate must be a valid date'),
  body('endDate').notEmpty().withMessage('endDate is required').isISO8601().withMessage('endDate must be a valid date'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('status must be active or inactive'),
  body('placement')
    .optional()
    .isIn(['general', 'home_thematic_banner', 'special_combos'])
    .withMessage('placement must be general, home_thematic_banner, or special_combos'),
  body('audience')
    .optional({ nullable: true })
    .isIn(['women', 'teens', 'college'])
    .withMessage('audience must be women, teens, or college'),
];

const updateValidation = [
  param('id').isMongoId().withMessage('Invalid promotion ID format'),
  body('title').optional().trim().notEmpty().withMessage('title cannot be empty').isLength({ max: 160 }).withMessage('title must be at most 160 characters'),
  body('description').optional().trim().notEmpty().withMessage('description cannot be empty').isLength({ max: 1200 }).withMessage('description must be at most 1200 characters'),
  body('banner').custom((banner) => {
    if (banner === undefined || banner === null) {
      return true;
    }

    const normalizedBanner = typeof banner === 'string' ? banner.trim() : '';
    if (!normalizedBanner) {
      return true;
    }

    if (!isValidUrl(normalizedBanner)) {
      throw new Error('banner must be a valid URL');
    }

    return true;
  }),
  body('discount').optional({ values: 'falsy' }).isFloat({ min: 0, max: 100 }).withMessage('discount must be between 0 and 100'),
  body('products').optional().isArray().withMessage('products must be an array'),
  body('products.*').optional().isMongoId().withMessage('each product must be a valid product id'),
  body('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('status must be active or inactive'),
  body('placement')
    .optional()
    .isIn(['general', 'home_thematic_banner', 'special_combos'])
    .withMessage('placement must be general, home_thematic_banner, or special_combos'),
  body('audience')
    .optional({ nullable: true })
    .isIn(['women', 'teens', 'college'])
    .withMessage('audience must be women, teens, or college'),
];

router.get('/', getAdminPromotions);
router.post('/', promotionValidation, createPromotion);
router.put('/:id', updateValidation, updatePromotion);
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid promotion ID format')], deletePromotion);

module.exports = router;
