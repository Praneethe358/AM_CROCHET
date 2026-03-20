const express = require('express');

const {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/').post(addToCart).get(getCart).delete(clearCart);
router.route('/:productId').put(updateCartItemQuantity).delete(removeCartItem);

module.exports = router;
