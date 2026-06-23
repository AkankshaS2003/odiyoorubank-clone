const express = require('express');
const router = express.Router();
const { getAllSavingsDeposits } = require('../controllers/adminSavingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/deposits', getAllSavingsDeposits);

module.exports = router;
