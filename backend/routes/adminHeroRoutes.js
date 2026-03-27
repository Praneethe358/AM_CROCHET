const express = require('express');
const { body } = require('express-validator');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { getAdminHero, upsertAdminHero } = require('../controllers/heroController');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

const heroValidation = [
  body('slides').isArray().withMessage('slides must be an array'),
  body('slides.*.mediaType')
    .optional()
    .isIn(['image', 'video'])
    .withMessage('Slide mediaType must be either image or video'),
  body('slides.*.image')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Slide image must be a valid URL'),
  body('slides.*.video')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Slide video must be a valid URL'),
  body('slides.*.title').trim().notEmpty().withMessage('Slide title is required').isLength({ max: 200 }),
  body('slides.*.subtitle').optional().trim().isLength({ max: 800 }),
  body('slides.*.description').optional().trim().isLength({ max: 1000 }),
  body('slides.*.link').optional().trim().isLength({ max: 300 }),
  body('slides').custom((slides) => {
    for (const slide of slides) {
      const mediaType = slide?.mediaType || 'image';
      const image = (slide?.image || '').trim();
      const video = (slide?.video || '').trim();

      if (mediaType === 'image' && !image) {
        throw new Error('Slide image URL is required when mediaType is image');
      }

      if (mediaType === 'video' && !video) {
        throw new Error('Slide video URL is required when mediaType is video');
      }

      if (image && video) {
        throw new Error('A slide can contain only one media URL (image or video)');
      }
    }

    return true;
  }),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

router.get('/', getAdminHero);
router.put('/', heroValidation, upsertAdminHero);

module.exports = router;
