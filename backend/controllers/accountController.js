const Account = require('../models/Account');

// @desc    Get logged in user profile / basic account details
// @route   GET /api/account/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const account = await Account.findOne({ userId: req.user._id });
    
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        account: account || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific account details including balance
// @route   GET /api/account/details
// @access  Private
const getAccountDetails = async (req, res, next) => {
  try {
    let account = await Account.findOne({ userId: req.user._id });
    
    // If account doesn't exist for a newly registered user, create a default one for simulation
    if (!account) {
      account = await Account.create({
        userId: req.user._id,
        accountType: 'Savings',
        accountNumber: req.user.accountNumber || 'CB' + Date.now().toString().slice(-8),
        branch: 'Main Branch',
        balance: 1000 // Welcome bonus
      });
    }

    // Mock recent activities
    const recentActivities = [
      { id: 1, type: 'Deposit', amount: 1000, date: new Date().toISOString() }
    ];

    res.status(200).json({
      success: true,
      data: {
        account,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for membership
// @route   POST /api/account/membership/apply
// @access  Private
const applyMembership = async (req, res, next) => {
  const mongoose = require('mongoose');
  // const // session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const { address, dob, tpin } = req.body;
    const bcrypt = require('bcryptjs');

    // 1. Verify TPIN
    if (!tpin) {
      throw new Error('Transaction PIN is required');
    }
    const userObj = await req.user.constructor.findById(req.user._id).select('+tpin +tpinLocked +tpinFailedAttempts +tpinActive');
    if (!userObj.tpinActive || !userObj.tpin) {
      throw new Error('Transaction PIN is not set up');
    }
    if (userObj.tpinLocked) {
      throw new Error('Transaction PIN is locked');
    }
    const isMatch = await bcrypt.compare(tpin, userObj.tpin);
    if (!isMatch) {
      userObj.tpinFailedAttempts += 1;
      if (userObj.tpinFailedAttempts >= 3) {
        userObj.tpinLocked = true;
      }
      await userObj.save({});
      // await session.commitTransaction();
      // session.endSession();
      return res.status(401).json({ success: false, error: 'Invalid Transaction PIN' });
    }
    
    // Reset attempts on success
    userObj.tpinFailedAttempts = 0;
    await userObj.save({});

    // 2. Fetch Account and Validate Balance
    const Account = require('../models/Account');
    const account = await Account.findOne({ userId: req.user._id, accountType: 'Savings' });
    
    if (!account) {
      throw new Error('Savings account not found');
    }
    const APPLICATION_FEE = 200;
    if (account.balance < APPLICATION_FEE) {
      throw new Error(`Insufficient savings balance. Required: ₹${APPLICATION_FEE}`);
    }

    // 3. Debit Savings Account
    account.balance -= APPLICATION_FEE;
    await account.save({});

    // 4. Create Savings Transaction Log
    const SavingsTransaction = require('../models/SavingsTransaction');
    const transactionId = 'TRX' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
    await SavingsTransaction.create([{
      userId: req.user._id,
      accountId: account._id,
      type: 'Debit',
      amount: APPLICATION_FEE,
      description: 'Membership Application Fee',
      status: 'Completed',
      transactionId,
      balanceAfter: account.balance
    }], {});

    // 5. Create Audit Log
    const AuditLog = require('../models/AuditLog');
    await AuditLog.create([{
      userId: req.user._id,
      action: 'MEMBERSHIP_APPLICATION_FEE_PAID',
      details: `Paid ₹${APPLICATION_FEE} for membership application from savings account.`,
      ipAddress: req.ip || req.connection.remoteAddress
    }], {});

    const customerId = req.user.customerId || ('CUST' + Math.floor(100000 + Math.random() * 900000));

    // 6. Update User Profile
    const updatedUser = await req.user.constructor.findByIdAndUpdate(req.user._id, {
      address,
      dob,
      customerId,
      membershipStatus: 'approved',
      membershipPaymentStatus: 'Paid',
      membershipPaymentDate: Date.now(),
      membershipPaymentRef: transactionId
    }, { new: true});

    // 7. Create Membership Record
    const Membership = require('../models/Membership');
    await Membership.findOneAndUpdate(
      { userId: req.user._id },
      { customerId: updatedUser.customerId, status: 'Approved', approvalDate: Date.now() },
      { upsert: true, returnDocument: 'after'}
    );

    // await session.commitTransaction();
    // session.endSession();

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    res.status(400).json({ success: false, error: error.message || 'Failed to process application fee' });
  }
};

// @desc    Verify face and update membership status
// @route   POST /api/account/verify-face
// @access  Private
const verifyFace = async (req, res, next) => {
  try {
    let { similarityScore, aadhaarFaceImage, selfieImage, faceVerificationStatus, details } = req.body;
    
    // SERVER-SIDE SECURITY GUARD: Do not trust frontend status blindly.
    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne({});
    const threshold = settings?.faceVerificationThreshold || 0.45;
    
    if (similarityScore === null || similarityScore === undefined || similarityScore > threshold) {
      faceVerificationStatus = 'Manual Review Required';
      details = details || `Security Override: Provided score (${similarityScore}) exceeds system threshold (${threshold})`;
    }

    const Membership = require('../models/Membership');
    const membership = await Membership.findOneAndUpdate(
      { userId: req.user._id },
      { 
        $set: {
          faceVerificationStatus,
          similarityScore,
          aadhaarFaceImage,
          selfieImage
        },
        $push: {
          auditTrail: {
            action: faceVerificationStatus === 'Face Verified' ? 'AI Auto-Verification' : 'AI Verification Failed - Flagged for Review',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            details: details || `Similarity Score: ${similarityScore}`
          }
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Note: Auto-approval block removed to enforce manual admin review.

    res.status(200).json({
      success: true,
      data: membership
    });
  } catch (error) {
    next(error);
  }
};

const makeDeposit = async (req, res, next) => {
  try {
    const { type, amount, durationYears } = req.body;
    const user = await req.user.constructor.findById(req.user._id);

    if (user.savingsBalance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient savings balance' });
    }

    const rates = { Savings: 4.5, Fixed: 8.50, Recurring: 7.75, Daily: 6.50 };
    const newDep = {
      id: `DEP-${Math.floor(100 + Math.random() * 900)}`,
      type,
      amount,
      rate: rates[type] || 0,
      date: new Date().toISOString().split('T')[0],
      maturityDate: 'Ongoing',
      status: 'Active',
      accruedInterest: 0
    };

    user.savingsBalance -= amount;
    if (type === 'Fixed') user.fdBalance += amount;
    if (type === 'Recurring') user.rdBalance += amount;

    user.deposits.push(newDep);
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const verifyCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.body;
    
    if (!req.user.customerId || req.user.customerId.trim().toLowerCase() !== customerId.trim().toLowerCase()) {
      return res.status(400).json({ success: false, error: 'Invalid Customer ID or does not match your account.' });
    }

    const account = await Account.findOne({ userId: req.user._id });
    
    res.status(200).json({
      success: true,
      data: {
        address: req.user.addressAsAadhar || req.user.address || '',
        dob: req.user.dob || '',
        accountNumber: account ? account.accountNumber : '',
        profileImageBase64: req.user.profileImageBase64 || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerByCustomerId = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const User = require('../models/User');
    
    const cleanId = customerId.trim();
    const customer = await User.findOne({ customerId: new RegExp(`^${cleanId}$`, 'i') }).select('fullName email phone address dob aadharNumber panNumber');
      let savingsAccount = null;
            if (customer) {
        const SavingsAccount = require('../models/SavingsAccount');
        savingsAccount = await SavingsAccount.findOne({ userId: customer._id });
      }
    
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      data: { ...customer.toObject(), savingsAccountNumber: savingsAccount ? savingsAccount.accountNumber : null }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getAccountDetails,
  applyMembership,
  makeDeposit,
  verifyCustomer,
  getCustomerByCustomerId,
  verifyFace
};
