const mongoose = require('mongoose');

const featuredItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const featuredCollectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'home_featured',
      unique: true,
      immutable: true,
      index: true,
    },
    items: {
      type: [featuredItemSchema],
      default: [],
    },
    maxItems: {
      type: Number,
      default: 6,
      min: 1,
      max: 20,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FeaturedCollection', featuredCollectionSchema);
