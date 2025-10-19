const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth.authMiddleware, notificationController.getMyNotifications);
router.post('/:id/read', auth.authMiddleware, notificationController.markAsRead);

module.exports = router;