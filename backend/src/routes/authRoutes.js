const express = require('express');
const router = express.Router();
const { register, login, refreshTokenHandler, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logout);

module.exports = router;
