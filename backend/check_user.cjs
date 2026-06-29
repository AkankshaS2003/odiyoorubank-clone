const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const User = require('./models/User');
const Account = require('./models/Account');
const SavingsAccount = require('./models/SavingsAccount');

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'jananishetty2003@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }
    console.log('User:', {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      customerId: user.customerId,
      membershipStatus: user.membershipStatus,
      isKycVerified: user.isKycVerified
    });

    const account = await Account.findOne({ userId: user._id });
    console.log('Account:', account ? {
      _id: account._id,
      accountNumber: account.accountNumber,
      accountType: account.accountType
    } : 'None');

    const savingsAccount = await SavingsAccount.findOne({ userId: user._id });
    console.log('SavingsAccount:', savingsAccount ? {
      _id: savingsAccount._id,
      accountNumber: savingsAccount.accountNumber,
      balance: savingsAccount.balance
    } : 'None');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUser();
