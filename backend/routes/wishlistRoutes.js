const express = require('express');

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/').post(addToWishlist).get(getWishlist);
router.route('/:productId').delete(removeFromWishlist);

module.exports = router;
