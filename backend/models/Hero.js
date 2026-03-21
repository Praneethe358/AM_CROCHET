const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
  image: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true, default: '' },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  link: { type: String, trim: true, default: '/products' }
});

const heroSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'home_hero',
      unique: true,
      immutable: true,
      index: true,
    },
    slides: {
      type: [slideSchema],
      default: []
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
