const mongoose = require('mongoose');

const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }

    const product = await Product.findById(productId).select('_id').lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [productId],
      });
    } else {
      const alreadyExists = wishlist.products.some(
        (existingProductId) => existingProductId.toString() === productId
      );

      if (!alreadyExists) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    const populatedWishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products', 'name price image category stock')
      .lean();

    return res.status(200).json({
      success: true,
      data: populatedWishlist?.products || [],
    });
  } catch (error) {
    return next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products', 'name price image category stock')
      .lean();

    return res.status(200).json({
      success: true,
      data: wishlist?.products || [],
    });
  } catch (error) {
    return next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    const originalLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      (existingProductId) => existingProductId.toString() !== productId
    );

    if (wishlist.products.length === originalLength) {
      return res.status(404).json({ success: false, message: 'Product is not in wishlist' });
    }

    await wishlist.save();

    const populatedWishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products', 'name price image category stock')
      .lean();

    return res.status(200).json({
      success: true,
      data: populatedWishlist?.products || [],
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
