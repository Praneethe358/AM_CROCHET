const express = require('express');

const { uploadImage, uploadMultipleImages } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Single image upload
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), uploadImage);

// Multiple images upload (up to 10)
router.post('/multiple', authMiddleware, adminMiddleware, uploadMultiple.array('images', 10), uploadMultipleImages);

module.exports = router;
