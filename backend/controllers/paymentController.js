const crypto = require('crypto');
const Razorpay = require('razorpay');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const SavingsAccount = require('../models/SavingsAccount');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res, next) => {
  try {
    const { amount, type } = req.body;
    
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + crypto.randomBytes(4).toString('hex')
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        ...order,
        key_id: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, type } = req.body;
    
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
      
    console.log('--- RAZORPAY VERIFY ---');
    console.log('OrderId:', razorpayOrderId);
    console.log('PaymentId:', razorpayPaymentId);
    console.log('Received Signature:', razorpaySignature);
    console.log('Expected Signature:', expectedSignature);
    console.log('Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Exists' : 'Missing');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

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
    const savingsAccount = await SavingsAccount.findOne({ userId: req.user.id });

    if (type === 'Initial Deposit') {
      user.minimumBalancePaid = true;
      user.savingsBalance = (user.savingsBalance || 0) + amount;
      if (account) {
        account.balance = (account.balance || 0) + amount;
        await account.save();
      }
      if (savingsAccount) {
        savingsAccount.balance = (savingsAccount.balance || 0) + amount;
        savingsAccount.totalDeposits = (savingsAccount.totalDeposits || 0) + amount;
        await savingsAccount.save();
      }
      await user.save();
    } else if (type === 'Account Deposit') {
      user.savingsBalance = (user.savingsBalance || 0) + amount;
      if (account) {
        account.balance = (account.balance || 0) + amount;
        await account.save();
      }
      if (savingsAccount) {
        savingsAccount.balance = (savingsAccount.balance || 0) + amount;
        savingsAccount.totalDeposits = (savingsAccount.totalDeposits || 0) + amount;
        await savingsAccount.save();
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
