const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const FeaturedCollection = require('../models/FeaturedCollection');
const Product = require('../models/Product');

const FEATURED_KEY = 'home_featured';
const DEFAULT_MAX_ITEMS = 6;

const normalizeFeaturedItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const ids = [];
  const seen = new Set();

  items.forEach((item) => {
    if (typeof item === 'string') {
      ids.push(item);
      return;
    } else if (item && typeof item === 'object') {
      if (typeof item.product === 'string') {
        ids.push(item.product);
      } else if (item.product && typeof item.product === 'object' && item.product._id) {
        ids.push(String(item.product._id));
      }
    }
  });

  const uniqueIds = [];

  ids.forEach((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return;
    }

    if (seen.has(id)) {
      return;
    }

    seen.add(id);
    uniqueIds.push(id);
  });

  return uniqueIds;
};

const hydrateFeaturedDoc = async (doc) => FeaturedCollection.findById(doc._id)
  .populate('items.product', 'name price image images category stock')
  .lean();

const getAdminFeatured = async (req, res, next) => {
  try {
    const existing = await FeaturedCollection.findOne({ key: FEATURED_KEY })
      .populate('items.product', 'name price image images category stock')
      .lean();

    if (!existing) {
      return res.status(200).json({
        message: 'Featured collection fetched successfully',
        data: {
          key: FEATURED_KEY,
          items: [],
          maxItems: DEFAULT_MAX_ITEMS,
          isActive: true,
        },
      });
    }

    return res.status(200).json({
      message: 'Featured collection fetched successfully',
      data: existing,
    });
  } catch (error) {
    return next(error);
  }
};

const updateAdminFeatured = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const itemIds = normalizeFeaturedItems(req.body.items);
    const requestedMaxItems = Number(req.body.maxItems);
    const maxItems = Number.isFinite(requestedMaxItems) && requestedMaxItems > 0
      ? Math.min(Math.floor(requestedMaxItems), 20)
      : DEFAULT_MAX_ITEMS;

    if (itemIds.length > maxItems) {
      return res.status(400).json({
        message: `Featured collection cannot exceed ${maxItems} items`,
      });
    }

    if (itemIds.length) {
      const existingProducts = await Product.find({ _id: { $in: itemIds } })
        .select('_id')
        .lean();

      if (existingProducts.length !== itemIds.length) {
        return res.status(400).json({ message: 'One or more selected products do not exist' });
      }
    }

    const featuredItems = itemIds.map((productId, index) => ({
      product: productId,
      order: index + 1,
    }));

    const updatedDoc = await FeaturedCollection.findOneAndUpdate(
      { key: FEATURED_KEY },
      {
        key: FEATURED_KEY,
        items: featuredItems,
        maxItems,
        isActive: req.body.isActive === false || req.body.isActive === 'false' ? false : true,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    const hydrated = await hydrateFeaturedDoc(updatedDoc);

    return res.status(200).json({
      message: 'Featured collection updated successfully',
      data: hydrated,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminFeatured,
  updateAdminFeatured,
};
