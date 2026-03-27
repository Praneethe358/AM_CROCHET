#!/usr/bin/env node

const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Category = require('../models/Category');
const Promotion = require('../models/Promotion');
const Order = require('../models/Order');
const PaymentSession = require('../models/PaymentSession');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');
const Hero = require('../models/Hero');
const FeaturedCollection = require('../models/FeaturedCollection');

const textMockRegex = /\b(smoke|mock|dummy|sample|demo|placeholder|test)\b/i;
const mockUrlRegex = /(example\.com|picsum\.photos|via\.placeholder\.com|placehold\.co|placeholder\.com)/i;
const mockCouponRegex = /^(SMOKE|TEST|MOCK|DEMO|DUMMY)/i;
const mockPaymentIdRegex = /^pay_smoke_/i;
const mockIdempotencyRegex = /^smoke-/i;
const mockEmailRegex = /(^|[._+-])(smoke|mock|dummy|demo|test)([._+-]|@)|@[^@]+\.test$/i;

const applyChanges = process.argv.includes('--apply');

const hasMockText = (value) => typeof value === 'string' && textMockRegex.test(value);
const hasMockUrl = (value) => typeof value === 'string' && mockUrlRegex.test(value);

const logSummary = (title, value) => {
  console.log(`${title}: ${value}`);
};

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI.trim(), {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  });

  const productQuery = {
    $or: [
      { name: textMockRegex },
      { description: textMockRegex },
      { category: textMockRegex },
      { image: mockUrlRegex },
      { images: { $elemMatch: { $regex: mockUrlRegex } } },
    ],
  };

  const userQuery = {
    $or: [
      { email: mockEmailRegex },
      { name: textMockRegex },
    ],
  };

  const couponQuery = {
    code: mockCouponRegex,
  };

  const categoryQuery = {
    $or: [
      { name: textMockRegex },
      { slug: textMockRegex },
      { image: mockUrlRegex },
    ],
  };

  const mockProducts = await Product.find(productQuery).select('_id').lean();
  const mockUsers = await User.find(userQuery).select('_id').lean();

  const productIds = mockProducts.map((p) => p._id);
  const userIds = mockUsers.map((u) => u._id);

  const orderQuery = {
    $or: [
      { paymentId: mockPaymentIdRegex },
      { idempotencyKey: mockIdempotencyRegex },
      { 'shippingAddress.name': textMockRegex },
      { couponCode: mockCouponRegex },
      ...(userIds.length ? [{ user: { $in: userIds } }] : []),
      ...(productIds.length ? [{ 'items.product': { $in: productIds } }] : []),
    ],
  };

  const paymentSessionQuery = {
    $or: [
      { verifiedPaymentId: mockPaymentIdRegex },
      { couponCode: mockCouponRegex },
      { 'shippingAddress.name': textMockRegex },
      ...(userIds.length ? [{ user: { $in: userIds } }] : []),
      ...(productIds.length ? [{ 'items.product': { $in: productIds } }] : []),
    ],
  };

  const reviewQuery = {
    $or: [
      { comment: textMockRegex },
      ...(userIds.length ? [{ user: { $in: userIds } }] : []),
      ...(productIds.length ? [{ product: { $in: productIds } }] : []),
    ],
  };

  const promotionQuery = {
    $or: [
      { title: textMockRegex },
      { description: textMockRegex },
      { banner: mockUrlRegex },
      ...(userIds.length ? [{ createdBy: { $in: userIds } }] : []),
      ...(productIds.length ? [{ products: { $in: productIds } }] : []),
    ],
  };

  const cartByUserQuery = userIds.length ? { user: { $in: userIds } } : null;
  const wishlistByUserQuery = userIds.length ? { user: { $in: userIds } } : null;

  const preview = {
    products: await Product.countDocuments(productQuery),
    users: await User.countDocuments(userQuery),
    coupons: await Coupon.countDocuments(couponQuery),
    categories: await Category.countDocuments(categoryQuery),
    orders: await Order.countDocuments(orderQuery),
    paymentSessions: await PaymentSession.countDocuments(paymentSessionQuery),
    reviews: await Review.countDocuments(reviewQuery),
    promotions: await Promotion.countDocuments(promotionQuery),
    cartsByUser: cartByUserQuery ? await Cart.countDocuments(cartByUserQuery) : 0,
    wishlistsByUser: wishlistByUserQuery ? await Wishlist.countDocuments(wishlistByUserQuery) : 0,
  };

  const heroes = await Hero.find({}).lean();
  let heroSlidesToRemove = 0;
  for (const hero of heroes) {
    const slides = Array.isArray(hero.slides) ? hero.slides : [];
    for (const slide of slides) {
      const fields = [slide.title, slide.subtitle, slide.description, slide.image, slide.video, slide.link];
      const isMock = fields.some((value) => hasMockText(value) || hasMockUrl(value));
      if (isMock) heroSlidesToRemove += 1;
    }
  }

  const featuredDocs = await FeaturedCollection.find({}).lean();
  let featuredRefsToRemove = 0;
  if (productIds.length) {
    for (const doc of featuredDocs) {
      const items = Array.isArray(doc.items) ? doc.items : [];
      featuredRefsToRemove += items.filter((item) => item.product && productIds.some((id) => id.equals(item.product))).length;
    }
  }

  console.log('Mock data cleanup preview');
  logSummary('Products to delete', preview.products);
  logSummary('Users to delete', preview.users);
  logSummary('Coupons to delete', preview.coupons);
  logSummary('Categories to delete', preview.categories);
  logSummary('Orders to delete', preview.orders);
  logSummary('Payment sessions to delete', preview.paymentSessions);
  logSummary('Reviews to delete', preview.reviews);
  logSummary('Promotions to delete', preview.promotions);
  logSummary('Carts to delete (mock users)', preview.cartsByUser);
  logSummary('Wishlists to delete (mock users)', preview.wishlistsByUser);
  logSummary('Hero slides to remove', heroSlidesToRemove);
  logSummary('Featured refs to remove', featuredRefsToRemove);

  if (!applyChanges) {
    console.log('\nDry run only. Re-run with --apply to execute deletions.');
    return;
  }

  const results = {};

  results.reviewsDeleted = (await Review.deleteMany(reviewQuery)).deletedCount || 0;
  results.paymentSessionsDeleted = (await PaymentSession.deleteMany(paymentSessionQuery)).deletedCount || 0;
  results.ordersDeleted = (await Order.deleteMany(orderQuery)).deletedCount || 0;

  if (cartByUserQuery) {
    results.cartsDeleted = (await Cart.deleteMany(cartByUserQuery)).deletedCount || 0;
  } else {
    results.cartsDeleted = 0;
  }

  if (wishlistByUserQuery) {
    results.wishlistsDeleted = (await Wishlist.deleteMany(wishlistByUserQuery)).deletedCount || 0;
  } else {
    results.wishlistsDeleted = 0;
  }

  if (productIds.length) {
    await Cart.updateMany(
      { 'items.product': { $in: productIds } },
      { $pull: { items: { product: { $in: productIds } } } }
    );

    await Wishlist.updateMany(
      { products: { $in: productIds } },
      { $pull: { products: { $in: productIds } } }
    );

    await Promotion.updateMany(
      { products: { $in: productIds } },
      { $pull: { products: { $in: productIds } } }
    );

    await FeaturedCollection.updateMany(
      { 'items.product': { $in: productIds } },
      { $pull: { items: { product: { $in: productIds } } } }
    );
  }

  results.promotionsDeleted = (await Promotion.deleteMany(promotionQuery)).deletedCount || 0;
  results.couponsDeleted = (await Coupon.deleteMany(couponQuery)).deletedCount || 0;
  results.categoriesDeleted = (await Category.deleteMany(categoryQuery)).deletedCount || 0;
  results.productsDeleted = (await Product.deleteMany(productQuery)).deletedCount || 0;
  results.usersDeleted = (await User.deleteMany(userQuery)).deletedCount || 0;

  let heroSlidesRemoved = 0;
  for (const hero of await Hero.find({})) {
    const slides = Array.isArray(hero.slides) ? hero.slides : [];
    const filtered = slides.filter((slide) => {
      const fields = [slide.title, slide.subtitle, slide.description, slide.image, slide.video, slide.link];
      const isMock = fields.some((value) => hasMockText(value) || hasMockUrl(value));
      return !isMock;
    });

    if (filtered.length !== slides.length) {
      heroSlidesRemoved += (slides.length - filtered.length);
      hero.slides = filtered;
      await hero.save();
    }
  }

  results.heroSlidesRemoved = heroSlidesRemoved;

  console.log('\nCleanup applied');
  logSummary('Products deleted', results.productsDeleted);
  logSummary('Users deleted', results.usersDeleted);
  logSummary('Coupons deleted', results.couponsDeleted);
  logSummary('Categories deleted', results.categoriesDeleted);
  logSummary('Orders deleted', results.ordersDeleted);
  logSummary('Payment sessions deleted', results.paymentSessionsDeleted);
  logSummary('Reviews deleted', results.reviewsDeleted);
  logSummary('Promotions deleted', results.promotionsDeleted);
  logSummary('Carts deleted', results.cartsDeleted);
  logSummary('Wishlists deleted', results.wishlistsDeleted);
  logSummary('Hero slides removed', results.heroSlidesRemoved);
}

run()
  .catch((error) => {
    console.error('Mock data cleanup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
