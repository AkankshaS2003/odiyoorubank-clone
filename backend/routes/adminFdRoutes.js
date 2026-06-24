const express = require('express');
const {
  getAllFDs,
  settleFD,
  checkMaturity
} = require('../controllers/adminFdController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'manager', 'employee'));

router.get('/', getAllFDs);
router.post('/:id/settle', settleFD);
router.post('/check-maturity', checkMaturity);

module.exports = router;
