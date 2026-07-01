const express = require('express');
const { 
  applyLoan, 
  getMyLoans, 
  calculateEligibility,
  getLoanDetails,
  adminGetAllLoans,
  adminVerifyLoan,
  adminSanctionLoan,
  customerAcceptOffer,
  adminFinalVerify,
  adminDisburseLoan,
  adminCompleteBranchVerification,
  payEmi
} = require('../controllers/loanController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public / Customer Routes
router.post('/calculator', calculateEligibility);
router.post('/apply', protect, applyLoan);
router.get('/my-loans', protect, getMyLoans);
router.get('/details/:id', protect, getLoanDetails);
router.post('/accept/:id', protect, customerAcceptOffer);
router.post('/pay-emi/:emiId', protect, payEmi);

// Admin Routes
router.get('/admin/all', protect, authorize('admin', 'manager', 'employee'), adminGetAllLoans);
router.post('/admin/verify/:id', protect, authorize('admin', 'manager', 'employee'), adminVerifyLoan);
router.post('/admin/sanction/:id', protect, authorize('admin', 'manager', 'employee'), adminSanctionLoan);
router.put('/:id/branch-verification', protect, authorize('admin', 'manager', 'employee'), adminCompleteBranchVerification);
router.post('/admin/final-verify/:id', protect, authorize('admin', 'manager', 'employee'), adminFinalVerify);
router.post('/admin/disburse/:id', protect, authorize('admin', 'manager', 'employee'), adminDisburseLoan);

module.exports = router;
