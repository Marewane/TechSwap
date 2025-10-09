const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware'); // added
const {
  createSession,
  getMySessions,
  getSessionById,
  updateSession,
  cancelSession,
} = require('../controllers/sessionController');

// protect routes that require authentication
router.post('/create', authMiddleware, createSession);
router.get('/my', authMiddleware, getMySessions);
router.get('/:id', authMiddleware, getSessionById);
router.put('/update/:id', authMiddleware, updateSession);
router.post('/cancel/:id', authMiddleware, cancelSession);

module.exports = router;
