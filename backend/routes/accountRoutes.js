const express = require('express');
const { getProfile, getAccountDetails } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/details', protect, getAccountDetails);

module.exports = router;
