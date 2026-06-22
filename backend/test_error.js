require('mongoose').connect('mongodb://127.0.0.1:27017/AK').then(async () => {
  const User = require('./models/User');
  try {
    await User.updateOne({ _id: '6a377e3d1ccc45284f950401' }, { $inc: { rdBalance: 1000, savingsBalance: -1000 } });
    console.log('UpdateOne OK');
  } catch(e) { console.error('UpdateOne Error:', e); }
  
  const Account = require('./models/Account');
  const account = await Account.findOne({ userId: '6a377e3d1ccc45284f950401' });
  if (account) {
    try {
      account.balance = (account.balance || 0) - 1000;
      await account.save();
      console.log('Account save OK');
    } catch(e) { console.error('Account Save Error:', e); }
  }
  
  const Transaction = require('./models/Transaction');
  try {
    await Transaction.create({
      userId: '6a377e3d1ccc45284f950401',
      amount: 1000,
      type: 'Recurring Deposit',
      status: 'Completed'
    });
    console.log('Transaction create OK');
  } catch(e) { console.error('Transaction Create Error:', e); }
  process.exit(0);
})
