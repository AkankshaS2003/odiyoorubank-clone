const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odiyooru').then(async () => {
  const User = require('./models/User');
  const user = await User.findOne({ fullName: /Akshatha/i });
  console.log('Customer ID is:', user ? user.customerId : 'User not found');
  process.exit(0);
});
