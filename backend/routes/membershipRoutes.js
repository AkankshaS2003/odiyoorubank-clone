const express = require('express');
const { applyMembership, getMemberships, updateMembershipStatus } = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, applyMembership);
router.get('/', protect, authorize('admin', 'manager'), getMemberships);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateMembershipStatus);

module.exports = router;
