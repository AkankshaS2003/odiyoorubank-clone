const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');
const SavingsAccount = require('../models/SavingsAccount');
const SavingsDeposit = require('../models/SavingsDeposit');
const SavingsTransaction = require('../models/SavingsTransaction');
const PaymentRecord = require('../models/PaymentRecord');
const AuditLog = require('../models/AuditLog');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateAccountNumber = () => {
  return 'SA' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

const generateReceiptNumber = () => {
  return 'RCPT-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

const generateTransactionRef = () => {
  return 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Ensure savings account exists for user
const ensureSavingsAccount = async (userId) => {
  let account = await SavingsAccount.findOne({ userId });
  if (!account) {
    account = new SavingsAccount({
      userId,
      accountNumber: generateAccountNumber(),
      balance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0
    });
    await account.save();
  }
  return account;
};

// @desc    Get Savings Profile Summary
// @route   GET /api/savings/profile
// @access  Private
exports.getSavingsProfile = async (req, res) => {
  try {
    const account = await ensureSavingsAccount(req.user.id);
    const user = await User.findById(req.user.id).select('fullName email phone');
    res.json({ success: true, account, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get Savings Balance
// @route   GET /api/savings/balance
// @access  Private
exports.getSavingsBalance = async (req, res) => {
  try {
    const account = await ensureSavingsAccount(req.user.id);
    res.json({ success: true, balance: account.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Initiate Deposit Request & Razorpay Order
// @route   POST /api/savings/deposit
// @access  Private
exports.createDepositOrder = async (req, res) => {
  try {
    const { amount, amountInWords, purpose, signature } = req.body;

    if (!amount || amount < 100 || !signature) {
      return res.status(400).json({ success: false, error: 'Invalid deposit data' });
    }

    const account = await ensureSavingsAccount(req.user.id);

    // Create Razorpay Order
    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: "rcpt_sd_" + crypto.randomBytes(4).toString('hex')
    };

    const order = await razorpay.orders.create(options);

    // Create pending deposit
    const deposit = new SavingsDeposit({
      userId: req.user.id,
      savingsAccountId: account._id,
      amount,
      amountInWords,
      purpose,
      signature,
      receiptNumber: generateReceiptNumber(),
      paymentStatus: 'Pending'
    });
    await deposit.save();

    res.json({ success: true, order, depositId: deposit._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Verify Payment and Process Deposit
// @route   POST /api/savings/payment
// @access  Private
exports.verifyDepositPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, depositId } = req.body;

    const deposit = await SavingsDeposit.findById(depositId);
    if (!deposit) return res.status(404).json({ success: false, error: 'Deposit not found' });

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== razorpay_signature) {
      deposit.paymentStatus = 'Failed';
      await deposit.save();
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    // Payment Successful
    const account = await SavingsAccount.findById(deposit.savingsAccountId);
    const user = await User.findById(req.user.id);

    // Create Payment Record
    const paymentRecord = new PaymentRecord({
      userId: req.user.id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount: deposit.amount,
      status: 'Captured',
      relatedModel: 'SavingsDeposit',
      relatedId: deposit._id
    });
    await paymentRecord.save();

    // Update balances
    account.balance += deposit.amount;
    account.totalDeposits += deposit.amount;
    account.lastTransactionDate = Date.now();
    await account.save();

    user.savingsBalance = account.balance;
    await user.save();

    // Create Transaction Record
    const transaction = new SavingsTransaction({
      userId: req.user.id,
      savingsAccountId: account._id,
      type: 'Deposit',
      description: `Savings Deposit via Razorpay (${deposit.purpose})`,
      creditAmount: deposit.amount,
      debitAmount: 0,
      balanceAfter: account.balance,
      status: 'Completed',
      referenceNumber: generateTransactionRef()
    });
    await transaction.save();

    // Link transaction & payment to deposit
    deposit.paymentStatus = 'Completed';
    deposit.transactionId = transaction._id;
    deposit.paymentRecordId = paymentRecord._id;
    await deposit.save();

    // Audit Log
    const audit = new AuditLog({
      action: 'SAVINGS_DEPOSIT_COMPLETED',
      userId: req.user.id,
      details: `Deposited ₹${deposit.amount}. New Balance: ₹${account.balance}. TxnID: ${transaction.referenceNumber}`
    });
    await audit.save();

    res.json({ success: true, message: 'Deposit successful', transaction, balance: account.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Withdraw Funds
// @route   POST /api/savings/withdraw
// @access  Private
exports.withdrawFunds = async (req, res) => {
  try {
    const { amount, targetUserId } = req.body;

    // Determine target user
    let userIdForWithdrawal = req.user.id;
    if (targetUserId && targetUserId !== req.user.id) {
      if (['admin', 'employee', 'manager'].includes(req.user.role)) {
        userIdForWithdrawal = targetUserId;
      } else {
        return res.status(403).json({ success: false, error: 'Not authorized to withdraw from this account' });
      }
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid withdrawal amount' });
    }

    const account = await SavingsAccount.findOne({ userId: userIdForWithdrawal });
    if (!account || account.status !== 'Active') {
      return res.status(400).json({ success: false, error: 'Active savings account required' });
    }

    if (account.balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    const user = await User.findById(userIdForWithdrawal);

    // Process Withdrawal
    account.balance -= amount;
    account.totalWithdrawals += amount;
    account.lastTransactionDate = Date.now();
    await account.save();

    user.savingsBalance = account.balance;
    await user.save();

    const transaction = new SavingsTransaction({
      userId: userIdForWithdrawal,
      savingsAccountId: account._id,
      type: 'Withdrawal',
      description: `Savings Withdrawal`,
      creditAmount: 0,
      debitAmount: amount,
      balanceAfter: account.balance,
      status: 'Completed',
      referenceNumber: generateTransactionRef()
    });
    await transaction.save();

    const audit = new AuditLog({
      action: 'SAVINGS_WITHDRAWAL',
      userId: userIdForWithdrawal,
      details: `Withdrew ₹${amount}. New Balance: ₹${account.balance}. TxnID: ${transaction.referenceNumber}`
    });
    await audit.save();

    res.json({ success: true, message: 'Withdrawal successful', transaction, balance: account.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Close Savings Account
// @route   POST /api/savings/close
// @access  Private
exports.closeAccount = async (req, res) => {
  try {
    const account = await SavingsAccount.findOne({ userId: req.user.id });
    if (!account || account.status === 'Closed') {
      return res.status(400).json({ success: false, error: 'Account not found or already closed' });
    }

    if (account.balance > 0) {
      return res.status(400).json({ success: false, error: 'Please withdraw remaining balance (₹' + account.balance + ') before closing account' });
    }

    account.status = 'Closed';
    await account.save();

    const audit = new AuditLog({
      action: 'SAVINGS_ACCOUNT_CLOSED',
      userId: req.user.id,
      details: `Closed savings account ${account.accountNumber}.`
    });
    await audit.save();

    res.json({ success: true, message: 'Account closed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get Savings Transactions
// @route   GET /api/savings/transactions
// @access  Private
exports.getSavingsTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, minAmount, maxAmount, status, search } = req.query;
    
    let query = { userId: req.user.id };

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (type) query.type = type;
    if (status) query.status = status;
    
    if (minAmount || maxAmount) {
      query.$or = [
        { creditAmount: { $gte: minAmount || 0, $lte: maxAmount || 999999999 } },
        { debitAmount: { $gte: minAmount || 0, $lte: maxAmount || 999999999 } }
      ];
    }

    if (search) {
      query.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await SavingsTransaction.find(query).sort('-createdAt');
    res.json({ success: true, transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
