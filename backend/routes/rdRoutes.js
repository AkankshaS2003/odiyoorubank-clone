const express = require('express');
const router = express.Router();
const {
  createRD,
  getRDs,
  getRDById,
  adminApproveRD,
  payInstallmentFromSavings,
  createRazorpayOrderForInstallment,
  verifyRazorpayInstallment,
  requestSettlement,
  adminApproveSettlement,
  reactivateRD
} = require('../controllers/rdController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/', protect, createRD);
router.get('/', protect, getRDs);
router.get('/:id', protect, getRDById);

// Installment Payments
router.post('/pay-savings', protect, payInstallmentFromSavings);
router.post('/razorpay-order', protect, createRazorpayOrderForInstallment);
router.post('/razorpay-verify', protect, verifyRazorpayInstallment);

// Settlement
router.post('/:id/settle', protect, requestSettlement);

// Admin Routes
router.put('/:id/approve', protect, admin, adminApproveRD);
router.put('/:id/approve-settlement', protect, admin, adminApproveSettlement);
router.put('/:id/reactivate', protect, admin, reactivateRD);

module.exports = router;
