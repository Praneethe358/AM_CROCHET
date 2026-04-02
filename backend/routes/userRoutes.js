const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const { getCurrentUser, updateUserProfile } = require('../controllers/authController');

const router = express.Router();

router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;
