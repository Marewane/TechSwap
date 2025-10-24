const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

router.get('/rooms', auth.authMiddleware, chatController.getUserChatRooms);
router.get('/rooms/:roomId/messages', auth.authMiddleware, chatController.getMessages);
router.post('/rooms/:roomId/messages', auth.authMiddleware, chatController.sendMessage);
router.get('/payment-status', auth.authMiddleware, chatController.checkPaymentStatus); //  NEW

module.exports = router;