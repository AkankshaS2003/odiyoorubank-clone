const express = require('express');
const {
  submitApplication,
  getApplications,
  updateApplicationStatus,
  completeBranchVerification
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, submitApplication);
router.get('/', protect, authorize('employee', 'manager', 'admin'), getApplications);
router.put('/:id/status', protect, authorize('employee', 'manager', 'admin'), updateApplicationStatus);
router.put('/:id/branch-verification', protect, authorize('employee', 'manager', 'admin'), completeBranchVerification);

module.exports = router;
