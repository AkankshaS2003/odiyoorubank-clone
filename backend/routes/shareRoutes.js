const express = require('express');
const router = express.Router();
const {
  purchaseShares,
  declareDividend,
  getShareSettings,
  updateShareSettings,
  getAllSharePurchases,
  getAllDividendHistory,
  getShareCertificate
} = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// User Routes
router.post('/purchase', protect, purchaseShares);
router.get('/certificate/:certificateId', protect, getShareCertificate);

// Admin Routes
router.get('/settings', protect, getShareSettings);
router.put('/settings', protect, admin, updateShareSettings);
router.post('/declare-dividend', protect, admin, declareDividend);
router.get('/purchases', protect, admin, getAllSharePurchases);
router.get('/dividend-history', protect, admin, getAllDividendHistory);

module.exports = router;
