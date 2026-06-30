const FixedDeposit = require('../models/FixedDeposit');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @desc    Get all fixed deposits
// @route   GET /api/admin/fd
// @access  Private/Admin
exports.getAllFDs = async (req, res, next) => {
  try {
    const fds = await FixedDeposit.find().populate('userId', 'fullName email phone customerId').sort('-createdAt');
    res.status(200).json({ success: true, count: fds.length, data: fds });
  } catch (error) {
    next(error);
  }
};

// @desc    Settle FD Transfer to Savings
// @route   POST /api/admin/fd/:id/settle
// @access  Private/Admin
exports.settleFD = async (req, res, next) => {
  try {
    const fd = await FixedDeposit.findById(req.params.id);

    if (!fd) {
      return res.status(404).json({ success: false, error: 'Fixed Deposit not found' });
    }

    if (fd.status !== 'Pending Settlement Approval') {
      return res.status(400).json({ success: false, error: 'FD is not pending settlement' });
    }

    const amountToSettle = fd.maturityAmount;
    
    const TransferService = require('../services/TransferService');
    const SavingsAccount = require('../models/SavingsAccount');
    
    // Find linked account or default to user's main savings account
    let savingsAcc = null;
    if (fd.linkedSavingsAccount) {
      savingsAcc = await SavingsAccount.findById(fd.linkedSavingsAccount);
    } 
    if (!savingsAcc) {
      savingsAcc = await SavingsAccount.findOne({ userId: fd.userId });
    }

    if (savingsAcc) {
      const transferResult = await TransferService.executeTransfer({
        transferType: 'Fixed Deposit Maturity',
        amount: amountToSettle,
        senderAccount: null,
        receiverAccount: savingsAcc.accountNumber,
        userId: fd.userId,
        paymentChannel: 'System',
        remarks: `FD Maturity Settlement for ${fd.fdNumber}`
      });

      fd.settlementDetails.transactionRef = transferResult.transactionId;

      // Update User summary balances locally
      const user = await User.findById(fd.userId);
      if (user) {
        user.savingsBalance = savingsAcc.balance + amountToSettle; // Since TransferService already updated savingsAcc, we just update summary
        user.fdBalance = (user.fdBalance || 0) - fd.principalAmount;
        await user.save();
      }
    }

    fd.status = 'Closed';
    fd.settlementDetails.settledAmount = amountToSettle;
    fd.settlementDetails.settlementDate = Date.now();
    fd.settlementDetails.processedBy = req.user.id;
    await fd.save();

    res.status(200).json({ success: true, data: fd });
  } catch (error) {
    next(error);
  }
};

// @desc    Check maturity dates and update statuses
// @route   POST /api/admin/fd/check-maturity
// @access  Private/Admin
exports.checkMaturity = async (req, res, next) => {
  try {
    const currentDate = new Date();
    
    const result = await FixedDeposit.updateMany(
      { status: 'Active', maturityDate: { $lte: currentDate } },
      { $set: { status: 'Matured' } }
    );

    res.status(200).json({ 
      success: true, 
      message: `${result.modifiedCount} Fixed Deposits updated to Matured.` 
    });
  } catch (error) {
    next(error);
  }
};
