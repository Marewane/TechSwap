const express = require('express');
const {HomeMessage,AboutMessage} = require('../controllers/HomeController');
const router = express.Router();

router.get('/',HomeMessage);
router.get('/about',AboutMessage);



module.exports = router;