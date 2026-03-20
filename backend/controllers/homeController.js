const Hero = require('../models/Hero');
const Category = require('../models/Category');
const FeaturedCollection = require('../models/FeaturedCollection');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');

const HERO_KEY = 'home_hero';
const FEATURED_KEY = 'home_featured';

const getHomeData = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      hero,
      featuredCollection,
      categories,
      thematicBanners,
      dealPromotions,
    ] = await Promise.all([
      Hero.findOne({ key: HERO_KEY, isActive: true }).lean(),
      FeaturedCollection.findOne({ key: FEATURED_KEY, isActive: true })
        .populate('items.product', 'name price image images category stock isFeatured featuredOrder createdAt')
        .lean(),
      Category.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean(),
      Promotion.find({
        status: 'active',
        placement: 'home_thematic_banner',
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .populate('products', 'name price image images category stock')
        .sort({ startDate: 1, createdAt: -1 })
        .lean(),
      Promotion.find({
        status: 'active',
        placement: 'special_combos',
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .populate('products', 'name price image images category stock')
        .sort({ startDate: 1, createdAt: -1 })
        .lean(),
    ]);

    let featuredItems = [];
    let maxItems = featuredCollection?.maxItems || 6;

    if (featuredCollection?.items?.length) {
      featuredItems = [...featuredCollection.items]
        .sort((a, b) => a.order - b.order)
        .map((entry) => entry.product)
        .filter(Boolean);
      maxItems = featuredCollection.maxItems || maxItems;
    } else {
      featuredItems = await Product.find({ isFeatured: true })
        .select('name price image images category stock isFeatured featuredOrder createdAt')
        .sort({ featuredOrder: 1, createdAt: -1 })
        .limit(maxItems)
        .lean();
    }

    return res.status(200).json({
      message: 'Home data fetched successfully',
      data: {
        hero: hero || null,
        featured: {
          maxItems,
          items: featuredItems,
        },
        categories,
        promotions: {
          thematicBanners,
          deals: dealPromotions,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getHomeData,
};
