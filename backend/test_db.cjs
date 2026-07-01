const mongoose = require('mongoose');
const User = require('./backend/models/User');
const SavingsAccount = require('./backend/models/SavingsAccount');
const Transaction = require('./backend/models/Transaction');

mongoose.connect('mongodb://localhost:27017/odiyoorubank_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected');
  const tx = await Transaction.find().sort({createdAt: -1}).limit(5);
  console.log('Transactions:', tx.map(t => ({ id: t._id, type: t.type, amount: t.amount, status: t.status })));
  
  const acc = await SavingsAccount.find().limit(2);
  console.log('Accounts:', acc.map(a => ({ acc: a.accountNumber, bal: a.balance })));
  
  process.exit();
}).catch(console.error);
