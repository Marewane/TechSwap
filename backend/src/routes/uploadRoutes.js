const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { upload, uploadAvatar, handleMulterError } = require("../controllers/UplodeController");

// @route   POST /api/upload/avatar
router.post('/avatar', authMiddleware, upload.single('image'), handleMulterError, uploadAvatar);

module.exports = router;