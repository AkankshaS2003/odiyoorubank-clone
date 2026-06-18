const express = require('express');
const { getProfile, getAccountDetails, applyMembership, makeDeposit, verifyCustomer, getCustomerByCustomerId } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/details', protect, getAccountDetails);
router.post('/membership/apply', protect, applyMembership);
router.post('/deposit', protect, makeDeposit);
router.post('/verify-customer', protect, verifyCustomer);
router.get('/customer/:customerId', protect, getCustomerByCustomerId);

module.exports = router;
