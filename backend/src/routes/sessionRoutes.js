const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth.authMiddleware, sessionController.createSession);
router.get('/my', auth.authMiddleware, sessionController.getMySessions);

module.exports = router;
