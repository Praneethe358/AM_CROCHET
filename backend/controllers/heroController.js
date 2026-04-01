const { validationResult } = require('express-validator');
const Hero = require('../models/Hero');

const HERO_KEY = 'home_hero';

const normalizeSlides = (slides = []) => {
  if (!Array.isArray(slides)) return [];

  return slides.map((slide) => {
    const mediaType = slide?.mediaType === 'video' ? 'video' : 'image';
    const image = (slide?.image || '').trim();
    const video = (slide?.video || '').trim();

    return {
      mediaType,
      image: mediaType === 'image' ? image : '',
      video: mediaType === 'video' ? video : '',
      subtitle: (slide?.subtitle || '').trim(),
      title: (slide?.title || '').trim(),
      description: (slide?.description || '').trim(),
      link: (slide?.link || '/products').trim(),
    };
  });
};

const getAdminHero = async (req, res, next) => {
  try {
    const hero = await Hero.findOne({ key: HERO_KEY }).lean();

    if (!hero) {
      return res.status(200).json({
        message: 'Hero fetched successfully',
        data: {
          key: HERO_KEY,
          slides: [],
          isActive: true,
        },
      });
    }

    return res.status(200).json({
      message: 'Hero fetched successfully',
      data: hero,
    });
  } catch (error) {
    return next(error);
  }
};

const upsertAdminHero = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { slides, isActive } = req.body;
    const normalizedSlides = normalizeSlides(slides);
    const isHeroActive = isActive === false || isActive === 'false' ? false : true;
    const hasUsableSlide = normalizedSlides.some((slide) => {
      if (!slide?.title) return false;
      if (slide.mediaType === 'video') return Boolean(slide.video);
      return Boolean(slide.image);
    });

    if (isHeroActive && !hasUsableSlide) {
      return res.status(400).json({
        message: 'At least one valid slide is required when hero visibility is enabled',
      });
    }

    const hero = await Hero.findOneAndUpdate(
      { key: HERO_KEY },
      {
        key: HERO_KEY,
        slides: normalizedSlides,
        isActive: isHeroActive,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.status(200).json({
      message: 'Hero updated successfully',
      data: hero,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminHero,
  upsertAdminHero,
};
