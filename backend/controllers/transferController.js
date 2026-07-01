const TransferService = require('../services/TransferService');
const User = require('../models/User');
const SavingsAccount = require('../models/SavingsAccount');
const Transaction = require('../models/Transaction');
const { verifyTpin } = require('./tpinController');

/**
 * @desc    Transfer between user's own accounts
 * @route   POST /api/transfers/own-account
 * @access  Private
 */
exports.ownAccountTransfer = async (req, res) => {
  try {
    const { fromAccount, toAccount, amount, remarks, tpin } = req.body;
    
    // Verify TPIN
    const tpinResult = await verifyTpin(req.user, tpin);
    if (!tpinResult.success) {
      return res.status(401).json({ success: false, message: tpinResult.error });
    }

    if (fromAccount === toAccount) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to the same account' });
    }

    // Verify both accounts belong to user
    const sourceAcc = await SavingsAccount.findOne({ accountNumber: fromAccount, userId: req.user.id });
    const destAcc = await SavingsAccount.findOne({ accountNumber: toAccount, userId: req.user.id });

    if (!sourceAcc || !destAcc) {
      return res.status(404).json({ success: false, message: 'One or more accounts not found or do not belong to you' });
    }

    const result = await TransferService.executeTransfer({
      transferType: 'Own Account Transfer',
      amount: Number(amount),
      senderAccount: fromAccount,
      receiverAccount: toAccount,
      userId: req.user.id,
      paymentChannel: 'Internal',
      remarks
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Internal Fund Transfer (to another customer)
 * @route   POST /api/transfers/internal
 * @access  Private
 */
exports.internalTransfer = async (req, res) => {
  try {
    const { fromAccount, toAccount, amount, remarks, tpin } = req.body;

    const tpinResult = await verifyTpin(req.user, tpin);
    if (!tpinResult.success) {
      return res.status(401).json({ success: false, message: tpinResult.error });
    }

    if (fromAccount === toAccount) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to the same account' });
    }

    const sourceAcc = await SavingsAccount.findOne({ accountNumber: fromAccount, userId: req.user.id });
    if (!sourceAcc) {
      return res.status(404).json({ success: false, message: 'Source account not found' });
    }

    const destAcc = await SavingsAccount.findOne({ accountNumber: toAccount });
    if (!destAcc) {
      return res.status(404).json({ success: false, message: 'Beneficiary account not found' });
    }

    const result = await TransferService.executeTransfer({
      transferType: 'Internal Fund Transfer',
      amount: Number(amount),
      senderAccount: fromAccount,
      receiverAccount: toAccount,
      userId: req.user.id,
      paymentChannel: 'Internal',
      remarks
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Simulated NEFT / IMPS Transfer
 * @route   POST /api/transfers/external
 * @access  Private
 */
exports.externalTransfer = async (req, res) => {
  try {
    const { fromAccount, beneficiaryName, toAccount, ifscCode, bankName, amount, transferMode, remarks, tpin } = req.body;

    const tpinResult = await verifyTpin(req.user, tpin);
    if (!tpinResult.success) {
      return res.status(401).json({ success: false, message: tpinResult.error });
    }

    const sourceAcc = await SavingsAccount.findOne({ accountNumber: fromAccount, userId: req.user.id });
    if (!sourceAcc) {
      return res.status(404).json({ success: false, message: 'Source account not found' });
    }

    // Execute transfer (deducts from sender, but receiverAccount is null for external)
    const result = await TransferService.executeTransfer({
      transferType: `${transferMode} Transfer`, // e.g., 'NEFT Transfer'
      amount: Number(amount),
      senderAccount: fromAccount,
      receiverAccount: null, // External bank
      userId: req.user.id,
      paymentChannel: transferMode,
      remarks: `To: ${beneficiaryName} | A/C: ${toAccount} | IFSC: ${ifscCode} | Bank: ${bankName} | ${remarks}`
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Transfer History
 * @route   GET /api/transfers/history
 * @access  Private
 */
exports.getTransferHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
