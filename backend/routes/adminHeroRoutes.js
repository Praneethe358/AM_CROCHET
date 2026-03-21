const express = require('express');
const { body } = require('express-validator');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { getAdminHero, upsertAdminHero } = require('../controllers/heroController');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

const heroValidation = [
  body('slides').isArray().withMessage('slides must be an array'),
  body('slides.*.image').trim().notEmpty().withMessage('Slide image URL is required').isURL().withMessage('Slide image must be a valid URL'),
  body('slides.*.title').trim().notEmpty().withMessage('Slide title is required').isLength({ max: 200 }),
  body('slides.*.subtitle').optional().trim().isLength({ max: 800 }),
  body('slides.*.description').optional().trim().isLength({ max: 1000 }),
  body('slides.*.link').optional().trim().isLength({ max: 300 }),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

router.get('/', getAdminHero);
router.put('/', heroValidation, upsertAdminHero);

module.exports = router;
