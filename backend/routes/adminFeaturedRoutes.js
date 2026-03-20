const express = require('express');
const { body } = require('express-validator');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { getAdminFeatured, updateAdminFeatured } = require('../controllers/featuredController');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

const featuredUpdateValidation = [
  body('items').isArray().withMessage('items must be an array'),
  body('maxItems').optional().isInt({ min: 1, max: 20 }).withMessage('maxItems must be between 1 and 20'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

router.get('/', getAdminFeatured);
router.put('/', featuredUpdateValidation, updateAdminFeatured);

module.exports = router;
