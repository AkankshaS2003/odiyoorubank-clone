const express = require('express');
const router = express.Router();
const {
  submitReview,
  getApprovedReviews,
  getAllReviewsAdmin,
  updateReviewStatus
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/', submitReview);
router.get('/', getApprovedReviews);

// Admin protected routes
router.get('/admin', protect, authorize('admin', 'manager'), getAllReviewsAdmin);
router.put('/admin/:id', protect, authorize('admin', 'manager'), updateReviewStatus);

module.exports = router;
