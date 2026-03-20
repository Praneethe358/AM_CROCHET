const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const imageUrl = req.file.path || req.file.secure_url;

    if (!imageUrl) {
      return res.status(500).json({ message: 'Image upload failed' });
    }

    return res.status(200).json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadImage,
};
