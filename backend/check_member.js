require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ customerId: 'CUST865777' });
  console.log('Member ID:', JSON.stringify(user.memberId));
  process.exit();
};
check();
