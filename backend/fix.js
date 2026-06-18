const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/AK').then(async () => {
  const User = require('./models/User');
  const Account = require('./models/Account');
  const crypto = require('crypto');
  
  const users = await User.find({ customerId: { $exists: true, $ne: null } });
  for (let user of users) {
    let acc = await Account.findOne({ userId: user._id });
    if (!acc) {
      const accountNumber = '10' + crypto.randomInt(10000000, 99999999).toString();
      await Account.create({
        userId: user._id,
        accountType: 'Savings',
        accountNumber,
        branch: 'Main Branch'
      });
      console.log('Created account for', user.email);
    }
  }
  mongoose.disconnect();
});
