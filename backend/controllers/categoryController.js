const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Category = require('../models/Category');
const Product = require('../models/Product');

const slugify = (value) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const ensureUniqueSlug = async (baseSlug, excludeId) => {
  let slug = baseSlug || `category-${Date.now()}`;
  let suffix = 1;

  while (true) {
    const existing = await Category.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select('_id')
      .lean();

    if (!existing) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
};

const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    return next(error);
  }
};

const createCategory = async (req, res, next) => {
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
      image = '',
      sortOrder = 0,
      isActive = true,
    } = req.body;

    const normalizedName = name.trim();

    const duplicateName = await Category.findOne({ name: normalizedName }).lean();
    if (duplicateName) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const baseSlug = slugify(normalizedName);
    const slug = await ensureUniqueSlug(baseSlug);

    const category = await Category.create({
      name: normalizedName,
      slug,
      image: image?.trim?.() || '',
      sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
      isActive: isActive === false || isActive === 'false' ? false : true,
    });

    return res.status(201).json({
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    return next(error);
  }
};

const updateCategory = async (req, res, next) => {
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
      return res.status(400).json({ message: 'Invalid category ID format' });
    }

    const existing = await Category.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updates = {};

    if (req.body.name !== undefined) {
      const nextName = req.body.name.trim();
      const duplicateName = await Category.findOne({
        name: nextName,
        _id: { $ne: id },
      }).lean();

      if (duplicateName) {
        return res.status(400).json({ message: 'Category name already exists' });
      }

      updates.name = nextName;
      updates.slug = await ensureUniqueSlug(slugify(nextName), id);
    }

    if (req.body.image !== undefined) {
      updates.image = req.body.image?.trim?.() || '';
    }

    if (req.body.sortOrder !== undefined) {
      updates.sortOrder = Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0;
    }

    if (req.body.isActive !== undefined) {
      updates.isActive = req.body.isActive === false || req.body.isActive === 'false' ? false : true;
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    return res.status(200).json({
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID format' });
    }

    const category = await Category.findById(id).lean();
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const inUse = await Product.exists({ category: category.name });
    if (inUse) {
      return res.status(400).json({
        message: 'Cannot delete category assigned to products',
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

const getActiveCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getActiveCategories,
};
