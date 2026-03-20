const { validationResult } = require('express-validator');

const Hero = require('../models/Hero');

const HERO_KEY = 'home_hero';

const getAdminHero = async (req, res, next) => {
  try {
    const hero = await Hero.findOne({ key: HERO_KEY }).lean();

    if (!hero) {
      return res.status(200).json({
        message: 'Hero fetched successfully',
        data: {
          key: HERO_KEY,
          title: '',
          subtitle: '',
          buttonText: 'Explore Collection',
          buttonLink: '/products',
          bannerImage: '',
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

    const {
      title,
      subtitle,
      buttonText,
      buttonLink,
      bannerImage,
      isActive,
    } = req.body;

    const hero = await Hero.findOneAndUpdate(
      { key: HERO_KEY },
      {
        key: HERO_KEY,
        title: title.trim(),
        subtitle: subtitle.trim(),
        buttonText: buttonText.trim(),
        buttonLink: (buttonLink || '/products').trim(),
        bannerImage: bannerImage.trim(),
        isActive: isActive === false || isActive === 'false' ? false : true,
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
