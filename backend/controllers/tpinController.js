const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../services/emailService');

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const validateTpin = (tpin, user) => {
  if (!/^\d{6}$/.test(tpin)) return 'TPIN must be exactly 6 digits';
  const weakPins = ['000000', '111111', '123456', '654321'];
  if (weakPins.includes(tpin)) return 'This TPIN is too weak (cannot be sequential or repeating)';
  if (user.dob && tpin === user.dob.replace(/\D/g, '').substring(0, 6)) return 'TPIN cannot match your Date of Birth';
  if (user.phone && user.phone.includes(tpin)) return 'TPIN cannot be part of your phone number';
  if (user.aadharNumber && user.aadharNumber.includes(tpin)) return 'TPIN cannot be part of your Aadhaar number';
  return null;
};

// @desc    Send OTP for TPIN Setup/Unlock
// @route   POST /api/tpin/send-otp
// @access  Private
exports.sendTpinOtp = async (req, res, next) => {
  try {
    const user = req.user;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(otp);

    await Otp.deleteMany({ email: user.email }); // Clean up old OTPs

    await Otp.create({
      email: user.email,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await sendEmail({
      email: user.email,
      subject: 'Odiyooru Bank - Transaction PIN Request',
      message: `Your OTP for Transaction PIN request is ${otp}. This is valid for 10 minutes. Do not share this with anyone.`
    });

    res.status(200).json({ success: true, message: 'OTP sent to registered email' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/tpin/verify-otp
// @access  Private
exports.verifyTpinOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const otpHash = hashOtp(otp);
    
    const otpRecord = await Otp.findOne({ email: req.user.email, otpHash, status: 'Pending' });
    
    if (!otpRecord) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }
    
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }

    otpRecord.status = 'Verified';
    await otpRecord.save();

    res.status(200).json({ success: true, message: 'OTP Verified' });
  } catch (error) {
    next(error);
  }
};

// @desc    Setup TPIN
// @route   POST /api/tpin/setup
// @access  Private
exports.setupTpin = async (req, res, next) => {
  try {
    const { tpin, confirmTpin } = req.body;
    
    if (tpin !== confirmTpin) return res.status(400).json({ success: false, error: 'PINs do not match' });

    // Ensure OTP was verified recently
    const otpRecord = await Otp.findOne({ email: req.user.email, status: 'Verified' });
    if (!otpRecord) return res.status(400).json({ success: false, error: 'Please verify OTP first' });

    const validationError = validateTpin(tpin, req.user);
    if (validationError) return res.status(400).json({ success: false, error: validationError });

    const salt = await bcrypt.genSalt(10);
    const tpinHash = await bcrypt.hash(tpin, salt);

    req.user.tpinHash = tpinHash;
    req.user.tpinActive = true;
    req.user.tpinLocked = false;
    req.user.failedTpinAttempts = 0;
    req.user.tpinCreatedAt = new Date();
    await req.user.save();

    await Otp.deleteMany({ email: req.user.email }); // Cleanup

    await AuditLog.create({
      action: 'TPIN_SETUP',
      userId: req.user._id,
      details: 'Transaction PIN was created successfully'
    });

    res.status(200).json({ success: true, message: 'Transaction PIN set up successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Change TPIN
// @route   POST /api/tpin/change
// @access  Private
exports.changeTpin = async (req, res, next) => {
  try {
    const { currentTpin, newTpin, confirmTpin } = req.body;
    
    if (req.user.tpinLocked) return res.status(403).json({ success: false, error: 'TPIN is locked. Please use unlock feature.' });
    if (!req.user.tpinActive) return res.status(400).json({ success: false, error: 'TPIN not active yet' });
    if (newTpin !== confirmTpin) return res.status(400).json({ success: false, error: 'New PINs do not match' });

    const userWithHash = await User.findById(req.user._id).select('+tpinHash');
    const isMatch = await bcrypt.compare(currentTpin, userWithHash.tpinHash);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect current TPIN' });
    }

    const validationError = validateTpin(newTpin, req.user);
    if (validationError) return res.status(400).json({ success: false, error: validationError });

    const salt = await bcrypt.genSalt(10);
    const tpinHash = await bcrypt.hash(newTpin, salt);

    req.user.tpinHash = tpinHash;
    req.user.tpinUpdatedAt = new Date();
    await req.user.save();

    await AuditLog.create({
      action: 'TPIN_CHANGED',
      userId: req.user._id,
      details: 'Transaction PIN was changed'
    });

    res.status(200).json({ success: true, message: 'Transaction PIN changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock/Forgot TPIN
// @route   POST /api/tpin/unlock
// @access  Private
exports.unlockTpin = async (req, res, next) => {
  try {
    const { newTpin, confirmTpin } = req.body;
    
    if (newTpin !== confirmTpin) return res.status(400).json({ success: false, error: 'New PINs do not match' });

    const otpRecord = await Otp.findOne({ email: req.user.email, status: 'Verified' });
    if (!otpRecord) return res.status(400).json({ success: false, error: 'Please verify OTP first' });

    const validationError = validateTpin(newTpin, req.user);
    if (validationError) return res.status(400).json({ success: false, error: validationError });

    const salt = await bcrypt.genSalt(10);
    const tpinHash = await bcrypt.hash(newTpin, salt);

    req.user.tpinHash = tpinHash;
    req.user.tpinLocked = false;
    req.user.failedTpinAttempts = 0;
    req.user.tpinUpdatedAt = new Date();
    req.user.tpinActive = true;
    await req.user.save();

    await Otp.deleteMany({ email: req.user.email });

    await AuditLog.create({
      action: 'TPIN_UNLOCKED',
      userId: req.user._id,
      details: 'Transaction PIN was unlocked and reset'
    });

    res.status(200).json({ success: true, message: 'Transaction PIN unlocked successfully' });
  } catch (error) {
    next(error);
  }
};

// Internal Helper for other controllers
exports.verifyTpin = async (user, providedTpin) => {
  if (!user.tpinActive) return { success: false, error: 'Transaction PIN is not set up' };
  if (user.tpinLocked) return { success: false, error: 'Transaction PIN is locked due to multiple failed attempts' };
  
  if (!providedTpin) return { success: false, error: 'Transaction PIN is required' };

  const userWithHash = await User.findById(user._id).select('+tpinHash');
  const isMatch = await bcrypt.compare(providedTpin, userWithHash.tpinHash);

  if (isMatch) {
    // Reset attempts on success
    if (user.failedTpinAttempts > 0) {
      user.failedTpinAttempts = 0;
      await user.save();
    }
    return { success: true };
  } else {
    // Handle failure
    user.failedTpinAttempts += 1;
    user.tpinLastFailed = new Date();
    let errorMsg = 'Invalid Transaction PIN';
    
    if (user.failedTpinAttempts >= 3) {
      user.tpinLocked = true;
      errorMsg = 'Transaction PIN locked due to multiple failed attempts. Please unlock it.';
      
      await AuditLog.create({
        action: 'TPIN_LOCKED',
        userId: user._id,
        details: 'TPIN locked after 3 failed attempts'
      });
      
      await sendEmail({
        email: user.email,
        subject: 'Odiyooru Bank - Security Alert: TPIN Locked',
        message: 'Your Transaction PIN has been locked due to multiple failed attempts. Please use the Unlock feature on your dashboard.'
      });
    } else {
      errorMsg = `Invalid Transaction PIN. You have ${3 - user.failedTpinAttempts} attempts remaining.`;
      
      await AuditLog.create({
        action: 'TPIN_FAILED',
        userId: user._id,
        details: `Failed TPIN attempt. Attempt ${user.failedTpinAttempts} of 3.`
      });
    }
    
    await user.save();
    return { success: false, error: errorMsg };
  }
};
