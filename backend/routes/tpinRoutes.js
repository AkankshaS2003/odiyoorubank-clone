const express = require('express');
const {
  sendTpinOtp,
  verifyTpinOtp,
  setupTpin,
  changeTpin,
  unlockTpin
} = require('../controllers/tpinController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send-otp', protect, sendTpinOtp);
router.post('/verify-otp', protect, verifyTpinOtp);
router.post('/setup', protect, setupTpin);
router.post('/change', protect, changeTpin);
router.post('/unlock', protect, unlockTpin);

module.exports = router;
