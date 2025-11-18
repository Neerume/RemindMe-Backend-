const express = require('express');
const authController = require('../controllers/authcontroller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/update', authMiddleware, authController.updateProfile);

module.exports = router;
