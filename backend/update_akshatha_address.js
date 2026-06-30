const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odiyooru').then(async () => {
  const User = require('./models/User');
  const AccountApplication = require('./models/AccountApplication');
  
  const user = await User.findOne({ fullName: /Akshatha/i });
  if (user) {
    const app = await AccountApplication.findOne({ userId: user._id });
    if (app && app.permanentAddress) {
      user.address = app.permanentAddress;
      await user.save();
      console.log('Updated address for Akshatha to:', user.address);
    } else {
      user.address = "Odiyooru, Karnataka"; // fallback
      await user.save();
      console.log('Updated address for Akshatha to fallback:', user.address);
    }
  } else {
    console.log('User Akshatha not found');
  }
  process.exit(0);
});
