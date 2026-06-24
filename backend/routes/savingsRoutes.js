const express = require('express');
const router = express.Router();
const {
  getSavingsProfile,
  getSavingsBalance,
  createDepositOrder,
  verifyDepositPayment,
  getSavingsTransactions,
  withdrawFunds,
  closeAccount
} = require('../controllers/savingsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/profile', getSavingsProfile);
router.get('/balance', getSavingsBalance);
router.post('/deposit', createDepositOrder);
router.post('/payment', verifyDepositPayment);
router.get('/transactions', getSavingsTransactions);
router.post('/withdraw', withdrawFunds);
router.post('/close', closeAccount);

module.exports = router;
