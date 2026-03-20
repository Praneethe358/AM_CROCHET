const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Product = require('../models/Product');

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      name,
      price,
      category,
      description,
      image,
      images,
      stock,
    } = req.body;

    const normalizedImages = Array.isArray(images)
      ? images.filter((img) => typeof img === 'string' && img.trim()).map((img) => img.trim())
      : [];
    const primaryImage = image || normalizedImages[0] || '';

    const product = await Product.create({
      name,
      price,
      category,
      description,
      image: primaryImage,
      images: normalizedImages,
      stock,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const requestedLimit = parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE;
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const { search, category, minPrice, maxPrice, sort } = req.query;
    const parsedMinPrice = minPrice !== undefined ? Number(minPrice) : undefined;
    const parsedMaxPrice = maxPrice !== undefined ? Number(maxPrice) : undefined;

    if (
      parsedMinPrice !== undefined
      && parsedMaxPrice !== undefined
      && !Number.isNaN(parsedMinPrice)
      && !Number.isNaN(parsedMaxPrice)
      && parsedMinPrice > parsedMaxPrice
    ) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: [{ msg: 'minPrice cannot be greater than maxPrice', param: 'minPrice' }],
      });
    }

    const query = {};

    if (typeof search === 'string' && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    if (typeof category === 'string' && category.trim()) {
      query.category = category.trim();
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};

      if (parsedMinPrice !== undefined && !Number.isNaN(parsedMinPrice)) {
        query.price.$gte = parsedMinPrice;
      }

      if (parsedMaxPrice !== undefined && !Number.isNaN(parsedMaxPrice)) {
        query.price.$lte = parsedMaxPrice;
      }

      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    const sortMap = {
      price: { price: 1 },
      '-price': { price: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };

    const sortQuery = sortMap[sort] || sortMap.newest;

    const projection = {
      name: 1,
      price: 1,
      category: 1,
      description: 1,
      image: 1,
      images: 1,
      stock: 1,
      averageRating: 1,
      reviewCount: 1,
      createdAt: 1,
      updatedAt: 1,
      ...(query.$text ? { score: { $meta: 'textScore' } } : {}),
    };
    const hasFilters = Object.keys(query).length > 0;

    const productQuery = Product.find(query)
      .select(projection)
      .sort(query.$text ? { score: { $meta: 'textScore' }, ...sortQuery } : sortQuery)
      .skip(skip)
      .limit(limit)
      .maxTimeMS(5000)
      .lean();

    const countQuery = hasFilters
      ? Product.countDocuments(query).maxTimeMS(5000)
      : Product.estimatedDocumentCount().maxTimeMS(5000);

    const [products, totalProducts] = await Promise.all([
      productQuery,
      countQuery,
    ]);

    const totalPages = Math.ceil(totalProducts / limit) || 1;

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      total: totalProducts,
      page,
      pages: totalPages,
      data: products,
    });
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(id)
      .select('-__v')
      .populate('createdBy', 'name email role')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const allowedFields = ['name', 'price', 'category', 'description', 'image', 'images', 'stock'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Array.isArray(updates.images)) {
      updates.images = updates.images
        .filter((img) => typeof img === 'string' && img.trim())
        .map((img) => img.trim());

      if (!updates.image && updates.images.length > 0) {
        updates.image = updates.images[0];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .select('-__v')
      .populate('createdBy', 'name email role');

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
