const express = require('express');
const router = express.Router();
const { createSession, getMySessions, updateSession, getSessionById } = require('../controllers/sessionController');

// POST /sessions/create
router.post('/create', createSession);

// GET /sessions/my?userId=12345
router.get('/my', getMySessions);

// PUT /sessions/update/:id
router.put('/update/:id', updateSession);

// GET /sessions/:id
router.get('/:id', getSessionById);

module.exports = router;
