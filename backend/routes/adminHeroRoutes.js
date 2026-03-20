const express = require('express');
const { body } = require('express-validator');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { getAdminHero, upsertAdminHero } = require('../controllers/heroController');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

const heroValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('title is required')
    .isLength({ max: 200 })
    .withMessage('title must be at most 200 characters'),
  body('subtitle')
    .trim()
    .notEmpty()
    .withMessage('subtitle is required')
    .isLength({ max: 800 })
    .withMessage('subtitle must be at most 800 characters'),
  body('buttonText')
    .trim()
    .notEmpty()
    .withMessage('buttonText is required')
    .isLength({ max: 100 })
    .withMessage('buttonText must be at most 100 characters'),
  body('buttonLink')
    .optional()
    .isString()
    .withMessage('buttonLink must be a string')
    .isLength({ max: 300 })
    .withMessage('buttonLink must be at most 300 characters'),
  body('bannerImage')
    .trim()
    .notEmpty()
    .withMessage('bannerImage is required')
    .isURL()
    .withMessage('bannerImage must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

router.get('/', getAdminHero);
router.put('/', heroValidation, upsertAdminHero);

module.exports = router;
