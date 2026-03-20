const express = require('express');
const { param } = require('express-validator');

const {
  getPromotions,
  getPromotionById,
  trackPromotionClick,
} = require('../controllers/promotionController');

const router = express.Router();

router.get('/', getPromotions);
router.get('/:id', [param('id').isMongoId().withMessage('Invalid promotion ID format')], getPromotionById);
router.post('/:id/click', [param('id').isMongoId().withMessage('Invalid promotion ID format')], trackPromotionClick);

module.exports = router;
