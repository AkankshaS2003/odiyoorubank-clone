const FixedDeposit = require('../models/FixedDeposit');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// @desc    Create a new Fixed Deposit instantly
// @route   POST /api/fd
// @access  Private
exports.createFD = async (req, res, next) => {
  // const // session = await mongoose.startSession();
  // session.startTransaction();
  try {
    const { amount, tenureMonths, interestRate, tpin, nomineeDetails, formData, signatureBase64 } = req.body;
    const user = await User.findById(req.user.id).select('+tpin +tpinLocked +failedTpinAttempts');
    
    if (!user) throw new Error('User not found');
    if (!user.tpin) throw new Error('Transaction PIN is not set up');
    if (user.tpinLocked) throw new Error('Transaction PIN is locked');
    
    const isMatch = await bcrypt.compare(tpin, user.tpin);
    if (!isMatch) {
      user.failedTpinAttempts = (user.failedTpinAttempts || 0) + 1;
      if (user.failedTpinAttempts >= 3) {
        user.tpinLocked = true;
        user.tpinLastFailed = Date.now();
      }
      await user.save({});
      throw new Error(user.tpinLocked ? 'TPIN locked due to too many failed attempts' : 'Invalid Transaction PIN');
    }
    
    // Reset failed attempts on success
    user.failedTpinAttempts = 0;

    const amountNum = Number(amount);
    if (user.savingsBalance < amountNum) {
      throw new Error('Insufficient savings balance to create this Fixed Deposit');
    }

    // Deduct savings, increase fd
    user.savingsBalance -= amountNum;
    user.fdBalance = (user.fdBalance || 0) + amountNum;
    await user.save({});

    // Pre-calculate FD details
    const r = interestRate / 100;
    const n = 4; // Quarterly
    const t = tenureMonths / 12;
    const maturityAmount = amountNum * Math.pow(1 + (r / n), n * t);
    const interestEarned = maturityAmount - amountNum;
    
    const depositDate = new Date();
    const maturityDate = new Date(depositDate);
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);
    
    const fdCount = await FixedDeposit.countDocuments();
    const fdNumber = `FD${new Date().getFullYear()}${String(fdCount + 1).padStart(5, '0')}`;

    // Find linked savings account if any
    const account = await Account.findOne({ userId: user._id });
    let linkedAccountId = null;
    if (account) {
      account.balance -= amountNum;
      await account.save({});
      linkedAccountId = account._id;
      
      // Log transaction
      await Transaction.create([{
        userId: user._id,
        accountId: linkedAccountId,
        amount: amountNum,
        type: 'Fixed Deposit',
        status: 'Completed',
        description: 'Fixed Deposit Creation',
        referenceNumber: fdNumber
      }], {});
    }

    const ServiceApplication = require('../models/ServiceApplication');
    const application = await ServiceApplication.create([{
      userId: user._id,
      applicationType: 'Fixed Deposit',
      status: 'Approved',
      formData: formData || {},
      images: { signature: signatureBase64 || '' },
      processedBy: user._id,
      processedAt: Date.now()
    }], {});

    const newFd = await FixedDeposit.create([{
      fdNumber,
      userId: user._id,
      applicationId: application[0]._id,
      principalAmount: amountNum,
      interestRate,
      compoundingFrequency: 'Quarterly',
      tenureMonths,
      depositDate,
      maturityDate,
      interestEarned: Math.round(interestEarned * 100) / 100,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      status: 'Active',
      nomineeDetails,
      linkedSavingsAccount: linkedAccountId
    }], {});

    // await session.commitTransaction();
    // session.endSession();
    
    res.status(201).json({ success: true, data: newFd[0] });
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    res.status(400).json({ success: false, error: error.message || 'Failed to create Fixed Deposit' });
  }
};

// @desc    Get FD details by ID
// @route   GET /api/fd/:id
// @access  Private
exports.getFDById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    const fd = await FixedDeposit.findOne({ 
      $or: [{ _id: req.params.id }, { applicationId: req.params.id }],
      userId: req.user.id 
    }).populate('applicationId');
      
    if (!fd) {
      return res.status(404).json({ success: false, error: 'Fixed Deposit not found' });
    }

    const transactions = await Transaction.find({ referenceNumber: fd.fdNumber, userId: req.user.id });

    // Get user details
    const user = await User.findById(req.user.id);

    res.status(200).json({ 
      success: true, 
      data: {
        fd,
        transactions,
        user: {
          fullName: user.fullName,
          customerId: user.customerId,
          kycStatus: user.kycStatus || (user.isKycVerified ? 'Verified' : 'Pending'),
          isKycVerified: user.isKycVerified
        }
      } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's fixed deposits
// @route   GET /api/fd/my
// @access  Private
exports.getMyFDs = async (req, res, next) => {
  try {
    const fds = await FixedDeposit.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: fds.length, data: fds });
  } catch (error) {
    next(error);
  }
};

// @desc    Request transfer of matured FD to savings
// @route   POST /api/fd/:id/transfer
// @access  Private
exports.transferToSavings = async (req, res, next) => {
  try {
    const fd = await FixedDeposit.findOne({ _id: req.params.id, userId: req.user.id });

    if (!fd) {
      return res.status(404).json({ success: false, error: 'Fixed Deposit not found' });
    }

    if (fd.status !== 'Matured') {
      return res.status(400).json({ success: false, error: 'Only matured FDs can be transferred to savings' });
    }

    fd.status = 'Pending Settlement Approval';
    fd.settlementDetails = {
      settlementMode: 'Transfer to Savings'
    };
    await fd.save();

    res.status(200).json({ success: true, data: fd });
  } catch (error) {
    next(error);
  }
};

// @desc    Renew full matured FD (Principal + Interest)
// @route   POST /api/fd/:id/renew
// @access  Private
exports.renewFD = async (req, res, next) => {
  try {
    const fd = await FixedDeposit.findOne({ _id: req.params.id, userId: req.user.id });

    if (!fd) {
      return res.status(404).json({ success: false, error: 'Fixed Deposit not found' });
    }

    if (fd.status !== 'Matured') {
      return res.status(400).json({ success: false, error: 'Only matured FDs can be renewed' });
    }

    // Renewal logic uses quarterly compounding by default for new FD
    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne();
    const fdRate = settings ? settings.fdRate : 8.5;
    
    const principal = fd.maturityAmount; // Renewing entire maturity amount
    const r = fdRate / 100;
    const n = 4; // Quarterly
    const t = fd.tenureMonths / 12;
    const newMaturityAmount = principal * Math.pow(1 + (r / n), n * t);
    const newInterestEarned = newMaturityAmount - principal;

    const depositDate = new Date();
    const maturityDate = new Date(depositDate);
    maturityDate.setMonth(maturityDate.getMonth() + fd.tenureMonths);

    const fdCount = await FixedDeposit.countDocuments();
    const fdNumber = `FD${new Date().getFullYear()}${String(fdCount + 1).padStart(5, '0')}`;

    const newFd = await FixedDeposit.create({
      fdNumber,
      userId: fd.userId,
      principalAmount: principal,
      interestRate: fdRate,
      compoundingFrequency: 'Quarterly',
      tenureMonths: fd.tenureMonths,
      depositDate,
      maturityDate,
      interestEarned: Math.round(newInterestEarned * 100) / 100,
      maturityAmount: Math.round(newMaturityAmount * 100) / 100,
      status: 'Active',
      nomineeDetails: fd.nomineeDetails,
      linkedSavingsAccount: fd.linkedSavingsAccount
    });

    fd.status = 'Renewed';
    fd.settlementDetails = {
      settledAmount: fd.maturityAmount,
      settlementDate: depositDate,
      settlementMode: 'Renew FD'
    };
    await fd.save();
    
    // Update generic user fd balance
    await User.updateOne({ _id: fd.userId }, { $inc: { fdBalance: newInterestEarned } });

    res.status(200).json({ success: true, data: { oldFd: fd, newFd } });
  } catch (error) {
    next(error);
  }
};

// @desc    Renew Principal Only of matured FD
// @route   POST /api/fd/:id/renew-principal
// @access  Private
exports.renewPrincipal = async (req, res, next) => {
  try {
    const fd = await FixedDeposit.findOne({ _id: req.params.id, userId: req.user.id });

    if (!fd) {
      return res.status(404).json({ success: false, error: 'Fixed Deposit not found' });
    }

    if (fd.status !== 'Matured') {
      return res.status(400).json({ success: false, error: 'Only matured FDs can be renewed' });
    }

    // Renewal logic uses quarterly compounding by default for new FD
    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne();
    const fdRate = settings ? settings.fdRate : 8.5;
    
    const principal = fd.principalAmount; // Only renewing principal
    const interestToCredit = fd.interestEarned;
    
    const r = fdRate / 100;
    const n = 4; // Quarterly
    const t = fd.tenureMonths / 12;
    const newMaturityAmount = principal * Math.pow(1 + (r / n), n * t);
    const newInterestEarned = newMaturityAmount - principal;

    const depositDate = new Date();
    const maturityDate = new Date(depositDate);
    maturityDate.setMonth(maturityDate.getMonth() + fd.tenureMonths);

    const fdCount = await FixedDeposit.countDocuments();
    const fdNumber = `FD${new Date().getFullYear()}${String(fdCount + 1).padStart(5, '0')}`;

    const newFd = await FixedDeposit.create({
      fdNumber,
      userId: fd.userId,
      principalAmount: principal,
      interestRate: fdRate,
      compoundingFrequency: 'Quarterly',
      tenureMonths: fd.tenureMonths,
      depositDate,
      maturityDate,
      interestEarned: Math.round(newInterestEarned * 100) / 100,
      maturityAmount: Math.round(newMaturityAmount * 100) / 100,
      status: 'Active',
      nomineeDetails: fd.nomineeDetails,
      linkedSavingsAccount: fd.linkedSavingsAccount
    });

    fd.status = 'Renewed';
    fd.settlementDetails = {
      settledAmount: fd.maturityAmount,
      settlementDate: depositDate,
      settlementMode: 'Renew Principal Only'
    };
    await fd.save();

    // Credit interest to savings account
    await User.updateOne({ _id: fd.userId }, { $inc: { savingsBalance: interestToCredit } });
    
    if (fd.linkedSavingsAccount) {
      await Account.updateOne({ _id: fd.linkedSavingsAccount }, { $inc: { balance: interestToCredit } });
      
      await Transaction.create({
        userId: fd.userId,
        accountId: fd.linkedSavingsAccount,
        amount: interestToCredit,
        type: 'Fixed Deposit', // FD Interest Credit
        status: 'Completed'
      });
    }

    res.status(200).json({ success: true, data: { oldFd: fd, newFd } });
  } catch (error) {
    next(error);
  }
};
