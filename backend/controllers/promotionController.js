const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Promotion = require('../models/Promotion');

const parseProducts = (products) => {
  if (!products) return [];
  if (Array.isArray(products)) return products;

  if (typeof products === 'string') {
    try {
      const parsed = JSON.parse(products);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return [];
    }
  }

  return [];
};

const normalizeAndValidateDates = (startDate, endDate) => {
  const nextStart = new Date(startDate);
  const nextEnd = new Date(endDate);

  if (Number.isNaN(nextStart.getTime()) || Number.isNaN(nextEnd.getTime())) {
    return { error: 'startDate and endDate must be valid dates' };
  }

  if (nextStart.getTime() > nextEnd.getTime()) {
    return { error: 'startDate must be earlier than or equal to endDate' };
  }

  if (nextStart.getTime() === nextEnd.getTime()) {
    nextEnd.setHours(23, 59, 59, 999);
  }

  return { startDate: nextStart, endDate: nextEnd };
};

const normalizePlacement = (placement) => {
  if (placement === 'special_combos') return 'special_combos';
  if (placement === 'home_thematic_banner') return 'home_thematic_banner';
  return 'general';
};

const normalizeBanner = (banner) => {
  if (typeof banner !== 'string') return '';
  return banner.trim();
};

const getPromotions = async (req, res, next) => {
  try {
    const now = new Date();
    const { placement, audience } = req.query;

    const filters = {
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (placement) {
      filters.placement = placement;
    }

    if (audience) {
      filters.audience = audience;
    }

    const promotions = await Promotion.find(filters)
      .populate('products', 'name price image images category stock')
      .sort({ startDate: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Active promotions fetched successfully',
      data: promotions,
    });
  } catch (error) {
    return next(error);
  }
};

const getPromotionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const now = new Date();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid promotion ID format' });
    }

    const promotion = await Promotion.findOne({
      _id: id,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate('products', 'name price image images category description stock')
      .populate('createdBy', 'name email role')
      .lean();

    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Promotion fetched successfully',
      data: promotion,
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find()
      .populate('products', 'name price image images category')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Admin promotions fetched successfully',
      data: promotions,
    });
  } catch (error) {
    return next(error);
  }
};

const createPromotion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      title,
      description,
      banner,
      discount,
      products,
      startDate,
      endDate,
      status,
      placement,
      audience,
    } = req.body;
    const resolvedPlacement = normalizePlacement(placement);
    const normalizedBanner = normalizeBanner(banner);

    if (resolvedPlacement !== 'special_combos' && !normalizedBanner) {
      return res.status(400).json({
        success: false,
        message: 'banner is required for this placement',
      });
    }

    const validatedDates = normalizeAndValidateDates(startDate, endDate);
    if (validatedDates.error) {
      return res.status(400).json({ success: false, message: validatedDates.error });
    }

    const promotion = await Promotion.create({
      title,
      description,
      banner: resolvedPlacement === 'special_combos' ? null : normalizedBanner,
      discount: discount === undefined || discount === '' ? null : Number(discount),
      products: parseProducts(products),
      startDate: validatedDates.startDate,
      endDate: validatedDates.endDate,
      status: status || 'active',
      placement: resolvedPlacement,
      audience: audience || null,
      createdBy: req.user.id,
    });

    const populated = await Promotion.findById(promotion._id)
      .populate('products', 'name price image images category')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: populated,
    });
  } catch (error) {
    return next(error);
  }
};

const updatePromotion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid promotion ID format' });
    }

    const updates = {};
    const allowedFields = [
      'title',
      'description',
      'banner',
      'discount',
      'products',
      'startDate',
      'endDate',
      'status',
      'placement',
      'audience',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.products !== undefined) {
      updates.products = parseProducts(updates.products);
    }

    if (updates.discount !== undefined) {
      updates.discount = updates.discount === '' ? null : Number(updates.discount);
    }

    if (updates.banner !== undefined) {
      updates.banner = normalizeBanner(updates.banner);
    }

    if (updates.audience !== undefined) {
      updates.audience = updates.audience || null;
    }

    const existing = await Promotion.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    const resolvedPlacement = normalizePlacement(updates.placement !== undefined ? updates.placement : existing.placement);
    const resolvedBanner = updates.banner !== undefined ? updates.banner : normalizeBanner(existing.banner);

    if (resolvedPlacement === 'special_combos') {
      updates.banner = null;
    } else if (!resolvedBanner) {
      return res.status(400).json({
        success: false,
        message: 'banner is required for this placement',
      });
    } else if (updates.banner !== undefined) {
      updates.banner = resolvedBanner;
    }

    const nextStart = updates.startDate !== undefined ? updates.startDate : existing.startDate;
    const nextEnd = updates.endDate !== undefined ? updates.endDate : existing.endDate;
    const validatedDates = normalizeAndValidateDates(nextStart, nextEnd);
    if (validatedDates.error) {
      return res.status(400).json({ success: false, message: validatedDates.error });
    }

    updates.startDate = validatedDates.startDate;
    updates.endDate = validatedDates.endDate;

    const updatedPromotion = await Promotion.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('products', 'name price image images category')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Promotion updated successfully',
      data: updatedPromotion,
    });
  } catch (error) {
    return next(error);
  }
};

const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid promotion ID format' });
    }

    const deleted = await Promotion.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Promotion deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

const trackPromotionClick = async (req, res, next) => {
  try {
    const { id } = req.params;
    const now = new Date();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid promotion ID format' });
    }

    const updated = await Promotion.findOneAndUpdate(
      {
        _id: id,
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now },
      },
      { $inc: { clickCount: 1 } },
      { new: false }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Promotion click tracked',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPromotions,
  getPromotionById,
  getAdminPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  trackPromotionClick,
};
