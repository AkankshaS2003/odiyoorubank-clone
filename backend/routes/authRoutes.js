const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  googleLogin,
  sendTransactionOtp,
  sendRegistrationOtp,
  verifyRegistrationOtp
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/register/send-otp', sendRegistrationOtp);
router.post('/register/verify-otp', verifyRegistrationOtp);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/google', googleLogin);
router.post('/send-otp', protect, sendTransactionOtp);

module.exports = router;
