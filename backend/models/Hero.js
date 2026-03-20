const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'home_hero',
      unique: true,
      immutable: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Hero title is required'],
      trim: true,
      maxlength: 200,
    },
    subtitle: {
      type: String,
      required: [true, 'Hero subtitle is required'],
      trim: true,
      maxlength: 800,
    },
    buttonText: {
      type: String,
      required: [true, 'Button text is required'],
      trim: true,
      maxlength: 100,
    },
    buttonLink: {
      type: String,
      trim: true,
      default: '/products',
      maxlength: 300,
    },
    bannerImage: {
      type: String,
      required: [true, 'Banner image is required'],
      trim: true,
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

module.exports = mongoose.model('Hero', heroSchema);
