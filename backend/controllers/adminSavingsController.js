const crypto = require('crypto');
const SavingsDeposit = require('../models/SavingsDeposit');
const SavingsAccount = require('../models/SavingsAccount');
const SavingsTransaction = require('../models/SavingsTransaction');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const generateTransactionRef = () => {
  return 'TXN-INT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// @desc    Get all savings deposits for admin
// @route   GET /api/admin/savings/deposits
// @access  Private/Admin
exports.getAllSavingsDeposits = async (req, res) => {
  try {
    const deposits = await SavingsDeposit.find()
      .populate('userId', 'fullName email phone')
      .populate('transactionId')
      .sort('-createdAt');
    res.json({ success: true, deposits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Calculate and credit interest to all active savings accounts
// @route   POST /api/admin/savings/calculate-interest
// @access  Private/Admin
exports.calculateInterest = async (req, res) => {
  try {
    const { rate } = req.body; // Annual interest rate percentage, e.g., 4
    const interestRate = rate || 4;
    
    // Find all active accounts with balance > 0
    const accounts = await SavingsAccount.find({ status: 'Active', balance: { $gt: 0 } });
    
    let processedCount = 0;
    let totalInterestPaid = 0;

    for (const account of accounts) {
      // Simple daily interest for 1 month as an example, or just a flat % of current balance for demo
      // We'll do a simple (balance * rate / 100) / 12 for monthly interest
      const interestAmount = Math.round((account.balance * interestRate / 100) / 12);
      
      if (interestAmount > 0) {
        account.balance += interestAmount;
        account.totalDeposits += interestAmount;
        account.lastTransactionDate = Date.now();
        await account.save();

        const user = await User.findById(account.userId);
        if (user) {
          user.savingsBalance = account.balance;
          await user.save();
        }

        const transaction = new SavingsTransaction({
          userId: account.userId,
          savingsAccountId: account._id,
          type: 'Deposit',
          description: `Interest Credit (${interestRate}% p.a.)`,
          creditAmount: interestAmount,
          debitAmount: 0,
          balanceAfter: account.balance,
          status: 'Completed',
          referenceNumber: generateTransactionRef()
        });
        await transaction.save();

        processedCount++;
        totalInterestPaid += interestAmount;
      }
    }

    const audit = new AuditLog({
      action: 'SAVINGS_INTEREST_CALCULATED',
      userId: req.user.id,
      details: `Processed interest for ${processedCount} accounts. Total paid: ₹${totalInterestPaid} at ${interestRate}% p.a.`
    });
    await audit.save();

    res.json({ success: true, message: `Interest calculated and credited to ${processedCount} accounts`, totalInterestPaid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
