const express = require('express');
const {
  submitApplication,
  getUserApplications,
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/serviceApplicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, submitApplication);
router.get('/my', protect, getUserApplications);
router.get('/', protect, authorize('employee', 'manager', 'admin'), getAllApplications);
router.put('/:id/status', protect, authorize('employee', 'manager', 'admin'), updateApplicationStatus);

module.exports = router;
