const mongoose = require('mongoose');

const Product = require('../models/Product');
const Review = require('../models/Review');

const updateProductReviewStats = async (productId) => {
  const [stats] = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats ? Number(stats.averageRating.toFixed(1)) : 0;
  const reviewCount = stats ? stats.reviewCount : 0;

  await Product.findByIdAndUpdate(productId, { averageRating, reviewCount });
};

const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }

    const normalizedRating = Number(rating);
    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    const product = await Product.findById(productId).select('_id').lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existingReview = await Review.findOne({ user: req.user.id, product: productId }).lean();
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating: normalizedRating,
      comment,
    });

    await updateProductReviewStats(productId);

    const createdReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('product', 'name image')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: createdReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    }

    return next(error);
  }
};

const getReviewsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .select('rating comment user product createdAt')
      .populate('user', 'name')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Reviews fetched successfully',
      data: reviews,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid review id' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const isOwner = review.user.toString() === String(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot delete this review' });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductReviewStats(productId);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: {},
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createReview,
  getReviewsByProduct,
  deleteReview,
};
