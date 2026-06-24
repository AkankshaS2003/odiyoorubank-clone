const FixedDeposit = require('../models/FixedDeposit');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

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
