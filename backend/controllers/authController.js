const User = require('../models/User');
const Account = require('../models/Account');
const Otp = require('../models/Otp');
const OtpAuditLog = require('../models/OtpAuditLog');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../services/emailService');

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const getNextMemberId = async () => {
  const allUsers = await User.find({ memberId: { $regex: /^ODI-M-\d+$/ } }).select('memberId');
  let maxSeq = 0;
  for (const u of allUsers) {
    if (u.memberId) {
      const seq = parseInt(u.memberId.replace('ODI-M-', ''), 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  return `ODI-M-${maxSeq + 1}`;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.trim() : '';

    // Check if user exists
    const userExists = await User.findOne({ email: cleanEmail });

    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // CRITICAL: Ensure email was verified before allowing registration
    const verifiedOtp = await Otp.findOne({ email: cleanEmail, status: 'Verified' });
    if (!verifiedOtp) {
      return res.status(400).json({ success: false, error: 'Email has not been verified' });
    }

    // Create user
    const user = await User.create({
      fullName,
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: role || 'customer'
    });

    // Clean up/delete the verified OTP document so it cannot be reused
    await Otp.deleteMany({ email: cleanEmail });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        memberId: user.memberId,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    // Check for user email
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact administration.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        memberId: user.memberId,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    const SavingsAccount = require('../models/SavingsAccount');
    const account = await Account.findOne({ userId: user._id }).lean();
    const savingsAccount = await SavingsAccount.findOne({ userId: user._id }).lean();
    
    if (savingsAccount) {
      user.accountNumber = savingsAccount.accountNumber;
      user.ifscCode = 'ODIY0001234';
    } else if (account) {
      user.accountNumber = account.accountNumber;
      user.ifscCode = 'ODIY0001234';
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const cleanEmail = req.body.email ? req.body.email.toLowerCase().trim() : '';
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, error: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    // Log to console for development simulation
    console.log('-----------------------------------');
    console.log('📧 MOCK EMAIL SENT: Forgot Password');
    console.log(`To: ${user.email}`);
    console.log(message);
    console.log('-----------------------------------');

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    // We decode the JWT directly.
    const payload = jwt.decode(token);
    
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, error: 'Invalid Google Token' });
    }

    const { email, name, sub } = payload;
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Auto register the user via Google
      const randomPassword = crypto.randomBytes(16).toString('hex');
      // Create user
      user = await User.create({
        fullName: name || 'Google User',
        email: cleanEmail,
        password: randomPassword,
        provider: 'google',
        role: 'customer'
      });
    } else {
      // If user exists but was registered locally, we can optionally link them or just login
      if (user.provider !== 'google') {
        user.provider = 'google';
        await user.save({ validateBeforeSave: false });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        memberId: user.memberId,
        role: user.role,
        provider: user.provider,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send Transaction OTP
// @route   POST /api/auth/send-otp
// @access  Private
const sendTransactionOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Invalidate existing OTPs
    await Otp.deleteMany({ email: user.email });

    // Store in Otp collection
    await Otp.create({
      email: user.email,
      otpHash: hashOtp(otp),
      expiresAt,
      status: 'Pending',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Create audit log
    await OtpAuditLog.create({
      email: user.email,
      action: 'Sent',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Sent transaction OTP for RD account opening'
    });

    // Send email
    const message = `Your transaction verification OTP is ${otp}. It is valid for 5 minutes. Do not share this with anyone.`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Odiyooru Souharda - Transaction OTP',
        message
      });
      res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (err) {
      await Otp.deleteMany({ email: user.email });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP during registration
// @route   POST /api/auth/register/send-otp
// @access  Public
const sendRegistrationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Please provide an email address' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate existing OTPs for this email
    await Otp.deleteMany({ email: cleanEmail });

    // Store securely
    await Otp.create({
      email: cleanEmail,
      otpHash: hashOtp(otp),
      expiresAt,
      status: 'Pending',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Audit Log
    await OtpAuditLog.create({
      email: cleanEmail,
      action: 'Sent',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Sent registration OTP'
    });

    // Send email
    const message = `Your registration verification OTP is ${otp}. It is valid for 5 minutes.`;
    
    try {
      await sendEmail({
        email: cleanEmail,
        subject: 'Shareholder Membership - Registration OTP',
        message
      });
      res.status(200).json({ success: true, message: 'OTP sent successfully!' });
    } catch (err) {
      console.error('Email send failed:', err);
      await Otp.deleteMany({ email: cleanEmail });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP during registration
// @route   POST /api/auth/register/verify-otp
// @access  Public
const verifyRegistrationOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    if (!cleanEmail || !otp) {
      return res.status(400).json({ success: false, error: 'Please provide email and OTP' });
    }

    const otpDoc = await Otp.findOne({ email: cleanEmail }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ success: false, error: 'No OTP generated for this email' });
    }

    // Check locking
    if (otpDoc.attempts >= 3) {
      await OtpAuditLog.create({
        email: cleanEmail,
        action: 'Locked',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Verification locked due to too many failed attempts'
      });
      return res.status(400).json({ success: false, error: 'This verification flow is locked due to 3 failed attempts. Please generate a new OTP.' });
    }

    // Expiry check
    if (new Date() > otpDoc.expiresAt) {
      return res.status(400).json({ success: false, error: 'OTP has expired' });
    }

    // Status check
    if (otpDoc.status !== 'Pending') {
      return res.status(400).json({ success: false, error: 'OTP has already been verified or used' });
    }

    // Compare
    const isMatch = hashOtp(otp) === otpDoc.otpHash;

    if (isMatch) {
      otpDoc.status = 'Verified';
      await otpDoc.save();

      await OtpAuditLog.create({
        email: cleanEmail,
        action: 'Verified',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Email successfully verified'
      });

      return res.status(200).json({ success: true, message: 'Email verified successfully!' });
    } else {
      otpDoc.attempts += 1;
      await otpDoc.save();

      await OtpAuditLog.create({
        email: cleanEmail,
        action: 'Failed',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Failed attempt ${otpDoc.attempts}`
      });

      const remaining = 3 - otpDoc.attempts;
      if (remaining <= 0) {
        return res.status(400).json({ success: false, error: 'Too many failed attempts. Verification locked. Please generate a new OTP.' });
      }

      return res.status(400).json({ success: false, error: `Invalid OTP. ${remaining} attempts remaining.` });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  googleLogin,
  sendTransactionOtp,
  sendRegistrationOtp,
  verifyRegistrationOtp
};
