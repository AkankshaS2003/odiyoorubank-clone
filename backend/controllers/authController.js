const User = require('../models/User');
const Account = require('../models/Account');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

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

    const memberId = await getNextMemberId();

    // Create user (No account number needed anymore)
    const user = await User.create({
      fullName,
      email: cleanEmail,
      phone: cleanPhone,
      password,
      memberId,
      role: role || 'customer'
    });

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
    const account = await Account.findOne({ userId: req.user.id }).lean();
    
    if (account) {
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
      const memberId = await getNextMemberId();
      user = await User.create({
        fullName: name || 'Google User',
        email: cleanEmail,
        provider: 'google',
        memberId,
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

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  googleLogin
};
