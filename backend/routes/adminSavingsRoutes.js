const express = require('express');
const router = express.Router();
const { getAllSavingsDeposits, calculateInterest } = require('../controllers/adminSavingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/deposits', getAllSavingsDeposits);
router.post('/calculate-interest', calculateInterest);

module.exports = router;
