const express = require('express');
const { getProfile, getAccountDetails, applyMembership } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/details', protect, getAccountDetails);
router.post('/membership/apply', protect, applyMembership);

module.exports = router;
