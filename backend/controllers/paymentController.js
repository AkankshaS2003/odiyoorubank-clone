const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const User = require('../models/User');

exports.createOrder = async (req, res, next) => {
  try {
    const { amount, type } = req.body;
    
    const orderId = 'order_' + crypto.randomBytes(8).toString('hex');

    res.status(200).json({
      success: true,
      data: {
        id: orderId,
        amount: amount * 100, // in paise
        currency: 'INR'
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, amount, type } = req.body;
    
    const transaction = await Transaction.create({
      userId: req.user.id,
      amount,
      type,
      razorpayOrderId,
      razorpayPaymentId,
      status: 'Completed'
    });

    const user = await User.findById(req.user.id);
    const account = await Account.findOne({ userId: req.user.id });

    if (type === 'Initial Deposit') {
      user.minimumBalancePaid = true;
      user.savingsBalance = (user.savingsBalance || 0) + amount;
      if (account) {
        account.balance = (account.balance || 0) + amount;
        await account.save();
      }
      await user.save();
    } else if (type === 'Account Deposit') {
      user.savingsBalance = (user.savingsBalance || 0) + amount;
      if (account) {
        account.balance = (account.balance || 0) + amount;
        await account.save();
      }
      await user.save();
    } else if (type === 'Fixed Deposit') {
      user.fdBalance += amount;
      await user.save();
    } else if (type === 'Recurring Deposit') {
      user.rdBalance += amount;
      await user.save();
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};
