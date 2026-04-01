const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 160,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 1200,
    },
    banner: {
      type: String,
      required() {
        return this.placement !== 'special_combos';
      },
      trim: true,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'startDate is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'endDate is required'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    placement: {
      type: String,
      enum: ['general', 'home_thematic_banner', 'special_combos'],
      default: 'general',
      index: true,
    },
    audience: {
      type: String,
      enum: ['women', 'teens', 'college'],
      default: null,
      index: true,
    },
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

promotionSchema.index({ status: 1, startDate: 1, endDate: 1, createdAt: -1 });
promotionSchema.index({ placement: 1, audience: 1, status: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Promotion', promotionSchema);
