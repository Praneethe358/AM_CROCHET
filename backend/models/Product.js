const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 200,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2000,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
      validate: {
        validator(value) {
          return !Array.isArray(value) || value.length <= 10;
        },
        message: 'A product can have at most 10 images',
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredOrder: {
      type: Number,
      default: null,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, featuredOrder: 1, createdAt: -1 });
productSchema.index({ createdBy: 1, createdAt: -1 });
productSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Product', productSchema);
