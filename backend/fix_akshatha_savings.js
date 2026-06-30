const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odiyooru').then(async () => {
  const User = require('./models/User');
  const Account = require('./models/Account');
  const SavingsAccount = require('./models/SavingsAccount');
  const SavingsTransaction = require('./models/SavingsTransaction');
  
  const user = await User.findOne({ fullName: /Akshatha/i });
  if (!user) {
    console.log('User Akshatha not found');
    process.exit(0);
  }

  const account = await Account.findOne({ userId: user._id });
  if (!account) {
    console.log('Account not found for Akshatha');
    process.exit(0);
  }

  let savingsAccount = await SavingsAccount.findOne({ userId: user._id });
  if (!savingsAccount) {
    savingsAccount = await SavingsAccount.create({
      userId: user._id,
      accountNumber: account.accountNumber,
      balance: 500,
      totalDeposits: 500,
      totalWithdrawals: 0
    });
    console.log('Created missing SavingsAccount for Akshatha');
  } else {
    // If it exists but is 0
    if (savingsAccount.balance === 0) {
       savingsAccount.balance = 500;
       savingsAccount.totalDeposits = 500;
       await savingsAccount.save();
    }
  }

  const existingTxn = await SavingsTransaction.findOne({ userId: user._id, type: 'Deposit' });
  if (!existingTxn) {
    await SavingsTransaction.create({
      userId: user._id,
      savingsAccountId: savingsAccount._id,
      type: 'Deposit',
      description: `Initial Deposit via Online Payment (Mode: Online, Trans ID: MANUAL_SYNC_${crypto.randomInt(1000, 9999)})`,
      creditAmount: 500,
      debitAmount: 0,
      balanceAfter: 500,
      status: 'Completed',
      referenceNumber: 'TXN' + crypto.randomInt(10000000, 99999999).toString()
    });
    console.log('Created missing SavingsTransaction for Akshatha');
  }

  process.exit(0);
});
