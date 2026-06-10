const express = require('express');
const { applyLoan, getMyLoans, calculateEligibility } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/apply', protect, applyLoan);
router.get('/my-loans', protect, getMyLoans);
router.post('/calculator', calculateEligibility);

module.exports = router;
