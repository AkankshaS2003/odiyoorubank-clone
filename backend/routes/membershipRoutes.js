const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getFeeDetails, payFee } = require('../controllers/membershipController');

router.get('/fee-details', protect, getFeeDetails);
router.post('/pay-fee', protect, payFee);

module.exports = router;
