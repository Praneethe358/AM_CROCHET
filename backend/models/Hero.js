const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image',
    required: true,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
    required() {
      return this.mediaType === 'image';
    },
  },
  video: {
    type: String,
    trim: true,
    required() {
      return this.mediaType === 'video';
    },
  },
  subtitle: { type: String, trim: true, default: '' },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  link: { type: String, trim: true, default: '/products' }
});

slideSchema.pre('validate', function ensureSingleMedia(next) {
  if (this.mediaType === 'image') {
    this.video = '';
    if (!this.image || !this.image.trim()) {
      this.invalidate('image', 'Slide image URL is required when mediaType is image');
    }
  }

  if (this.mediaType === 'video') {
    this.image = '';
    if (!this.video || !this.video.trim()) {
      this.invalidate('video', 'Slide video URL is required when mediaType is video');
    }
  }

  next();
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
