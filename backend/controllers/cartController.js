const mongoose = require('mongoose');

const Cart = require('../models/Cart');
const Product = require('../models/Product');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const buildCartResponse = (cart) => {
  const items = (cart?.items || []).map((item) => ({
    product: item.product,
    quantity: item.quantity,
    lineTotal: Number(((item.product?.price || 0) * item.quantity).toFixed(2)),
  }));

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = Number(items.reduce((acc, item) => acc + item.lineTotal, 0).toFixed(2));

  return {
    success: true,
    data: {
      totalItems,
      totalPrice,
      items,
    },
  };
};

const getPopulatedCart = async (userId) => {
  return Cart.findOne({ user: userId })
    .populate('items.product', 'name price image stock')
    .lean();
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const normalizedQuantity = quantity === undefined ? 1 : Number(quantity);

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }

    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be an integer greater than 0' });
    }

    const product = await Product.findById(productId).select('stock').lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      if (normalizedQuantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
      }

      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity: normalizedQuantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        const newQuantity = cart.items[itemIndex].quantity + normalizedQuantity;
        if (newQuantity > product.stock) {
          return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
        }

        cart.items[itemIndex].quantity = newQuantity;
      } else {
        if (normalizedQuantity > product.stock) {
          return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
        }

        cart.items.push({ product: productId, quantity: normalizedQuantity });
      }

      await cart.save();
    }

    const populatedCart = await getPopulatedCart(req.user.id);
    return res.status(200).json(buildCartResponse(populatedCart));
  } catch (error) {
    return next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const cart = await getPopulatedCart(req.user.id);

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          totalItems: 0,
          totalPrice: 0,
          items: [],
        },
      });
    }

    return res.status(200).json(buildCartResponse(cart));
  } catch (error) {
    return next(error);
  }
};

const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const normalizedQuantity = Number(quantity);

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }

    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a non-negative integer' });
    }

    const product = await Product.findById(productId).select('stock').lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product is not in cart' });
    }

    if (normalizedQuantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (normalizedQuantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
      }
      cart.items[itemIndex].quantity = normalizedQuantity;
    }

    await cart.save();

    const populatedCart = await getPopulatedCart(req.user.id);
    if (!populatedCart) {
      return res.status(200).json({
        success: true,
        data: {
          totalItems: 0,
          totalPrice: 0,
          items: [],
        },
      });
    }

    return res.status(200).json(buildCartResponse(populatedCart));
  } catch (error) {
    return next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product is not in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const populatedCart = await getPopulatedCart(req.user.id);
    if (!populatedCart) {
      return res.status(200).json({
        success: true,
        data: {
          totalItems: 0,
          totalPrice: 0,
          items: [],
        },
      });
    }

    return res.status(200).json(buildCartResponse(populatedCart));
  } catch (error) {
    return next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          totalItems: 0,
          totalPrice: 0,
          items: [],
        },
      });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      data: {
        totalItems: 0,
        totalPrice: 0,
        items: [],
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
