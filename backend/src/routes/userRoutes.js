// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {getUsers,addUser} = require('../controllers/userController');

// Existing routes
router.get('/users',getUsers);
router.post('/users',addUser);



module.exports = router;