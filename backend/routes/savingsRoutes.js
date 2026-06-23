const express = require('express');
const router = express.Router();
const {
  getSavingsProfile,
  getSavingsBalance,
  createDepositOrder,
  verifyDepositPayment,
  getSavingsTransactions
} = require('../controllers/savingsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/profile', getSavingsProfile);
router.get('/balance', getSavingsBalance);
router.post('/deposit', createDepositOrder);
router.post('/payment', verifyDepositPayment);
router.get('/transactions', getSavingsTransactions);

module.exports = router;
