const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/authMiddleware');

// Additional useful endpoints
router.get('/upcoming', auth.authMiddleware, sessionController.getUpcomingSessions);
router.get('/completed', auth.authMiddleware, sessionController.getCompletedSessions);

// Session CRUD operations
router.post('/', auth.authMiddleware, sessionController.createSession);
router.get('/my', auth.authMiddleware, sessionController.getMySessions);
router.get('/:id', auth.authMiddleware, sessionController.getSessionById);
router.put('/:id', auth.authMiddleware, sessionController.updateSession); // he cant update session when it created he cannot modify on it 
router.delete('/:id', auth.authMiddleware, sessionController.cancelSession);

// Session status operations
router.post('/:id/start-live', auth.authMiddleware, sessionController.startLiveSession);
router.post('/:id/end-live', auth.authMiddleware, sessionController.endLiveSession);
router.post('/:id/mark-no-show', auth.authMiddleware, sessionController.markNoShow);
// Add this route for lobby system
router.post('/:id/mark-ready', auth.authMiddleware, sessionController.markSessionReady);



module.exports = router;