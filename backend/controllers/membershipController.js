const mongoose = require('mongoose');
const User = require('../models/User');
const SavingsAccount = require('../models/SavingsAccount');
const SavingsTransaction = require('../models/SavingsTransaction');
const SystemSettings = require('../models/SystemSettings');
const LedgerEntry = require('../models/LedgerEntry');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const { verifyTpin } = require('./tpinController');
const sendEmail = require('../services/emailService'); 

const generateRef = () => 'MBR-' + crypto.randomBytes(4).toString('hex').toUpperCase();
const generateTxnId = () => 'TXN-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

exports.getFeeDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const account = await SavingsAccount.findOne({ userId: user._id });
    const settings = await SystemSettings.findOne();

    res.status(200).json({
      success: true,
      data: {
        customerId: user.customerId,
        fullName: user.fullName,
        accountNumber: account ? account.accountNumber : 'N/A',
        branch: account ? account.branch : 'Main Branch',
        membershipFee: settings ? settings.membershipFee : 500,
        membershipPaymentStatus: user.membershipPaymentStatus || 'Pending',
        savingsBalance: user.savingsBalance || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.payFee = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tpin } = req.body;

    const tpinResult = await verifyTpin(req.user, tpin);
    if (!tpinResult.success) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ success: false, error: tpinResult.error });
    }

    const user = await User.findById(req.user.id).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.membershipPaymentStatus === 'Paid') {
      throw new Error('Membership fee has already been paid.');
    }

    const account = await SavingsAccount.findOne({ userId: user._id, status: 'Active' }).session(session);
    if (!account) {
      throw new Error('Active savings account required to pay membership fee.');
    }

    const settings = await SystemSettings.findOne().session(session);
    const feeAmount = settings ? settings.membershipFee : 500;
    const minBalance = settings ? settings.minimumSavingsBalance : 500;

    if (account.balance - feeAmount < minBalance) {
      throw new Error(`Insufficient balance. A minimum balance of ₹${minBalance} must be maintained after debiting ₹${feeAmount}.`);
    }

    // Process internal debit
    account.balance -= feeAmount;
    account.totalWithdrawals += feeAmount;
    account.lastTransactionDate = Date.now();
    await account.save({ session });

    user.savingsBalance = account.balance;
    user.membershipPaymentStatus = 'Paid';
    user.membershipPaymentDate = Date.now();
    const refNum = generateRef();
    user.membershipPaymentRef = refNum;
    await user.save({ session });

    const txnId = generateTxnId();

    const savingsTxn = new SavingsTransaction({
      userId: user._id,
      savingsAccountId: account._id,
      type: 'Charge',
      description: 'Membership Fee Debit',
      debitAmount: feeAmount,
      creditAmount: 0,
      balanceAfter: account.balance,
      status: 'Completed',
      referenceNumber: refNum
    });
    await savingsTxn.save({ session });

    // Internal Ledger Credit (Membership Fee Collection Account)
    const ledger = new LedgerEntry({
      transactionId: savingsTxn._id,
      accountId: 'INT_MBR_FEE_COLLECTION',
      amount: feeAmount,
      entryType: 'Credit',
      transferType: 'Internal Transfer'
    });
    await ledger.save({ session });

    const audit = new AuditLog({
      action: 'MEMBERSHIP_FEE_PAYMENT',
      performedBy: user._id,
      targetUser: user._id,
      details: `Paid ₹${feeAmount} via Savings Debit. TPIN Verified. Ref: ${refNum}`,
      ipAddress: req.ip
    });
    await audit.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Send async email notification
    try {
      if (sendEmail) {
        await sendEmail({
          email: user.email,
          subject: 'Membership Fee Payment Successful',
          message: `Dear ${user.fullName},\n\nYour membership fee of ₹${feeAmount} has been successfully debited from your savings account. Welcome as a Cooperative Bank Member.\n\nTransaction Ref: ${refNum}\nDate: ${new Date().toLocaleString()}`
        });
      }
    } catch (e) {
      console.log('Failed to send email notification:', e.message);
    }

    res.status(200).json({
      success: true,
      message: 'Membership fee paid successfully',
      receipt: {
        receiptNo: refNum,
        customerName: user.fullName,
        customerId: user.customerId,
        savingsAccount: account.accountNumber,
        membershipFee: feeAmount,
        totalPaid: feeAmount,
        transactionId: txnId,
        paymentDate: user.membershipPaymentDate
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Pass to error handler but return 400 for expected errors
    if (error.message.includes('balance') || error.message.includes('found') || error.message.includes('paid')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
};
