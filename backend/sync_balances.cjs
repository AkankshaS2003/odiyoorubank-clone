const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const User = require('./models/User');
const SavingsAccount = require('./models/SavingsAccount');

const syncBalances = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for sync');

    const users = await User.find({});
    let updatedCount = 0;

    for (const user of users) {
      if (user.savingsBalance > 0) {
        const savingsAccount = await SavingsAccount.findOne({ userId: user._id });
        if (savingsAccount && savingsAccount.balance < user.savingsBalance) {
          console.log(`Syncing balance for user ${user.fullName}: ${savingsAccount.balance} -> ${user.savingsBalance}`);
          savingsAccount.balance = user.savingsBalance;
          savingsAccount.totalDeposits = Math.max(savingsAccount.totalDeposits || 0, user.savingsBalance);
          await savingsAccount.save();
          updatedCount++;
        }
      }
    }

    console.log(`Synced ${updatedCount} accounts successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('Error syncing:', error);
    process.exit(1);
  }
};

syncBalances();
