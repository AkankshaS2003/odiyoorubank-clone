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
    
    // Credit to savings
    await User.updateOne({ _id: fd.userId }, { $inc: { savingsBalance: amountToSettle, fdBalance: -fd.principalAmount } });
    
    if (fd.linkedSavingsAccount) {
      await Account.updateOne({ _id: fd.linkedSavingsAccount }, { $inc: { balance: amountToSettle } });
      
      const transaction = await Transaction.create({
        userId: fd.userId,
        accountId: fd.linkedSavingsAccount,
        amount: amountToSettle,
        type: 'Fixed Deposit', // Or FD Maturity Credit
        status: 'Completed'
      });
      
      fd.settlementDetails.transactionRef = transaction._id;
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
